
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating free plan");
      await supabaseClient.from("subscriptions").upsert({
        user_id: user.id,
        status: 'active',
        plan_name: 'free',
        max_sellers: 3,
        price_per_month: 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ 
        subscribed: false, 
        plan: 'free',
        status: 'active',
        trial_days_left: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
    });

    let subscriptionData = {
      subscribed: false,
      plan: 'free',
      status: 'active',
      trial_days_left: 0,
      is_annual: false
    };

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      const planName = subscription.metadata?.plan_name || 'popular';
      const isAnnual = subscription.metadata?.is_annual === 'true';
      
      let trialDaysLeft = 0;
      if (subscription.status === 'trialing' && subscription.trial_end) {
        const trialEnd = new Date(subscription.trial_end * 1000);
        const now = new Date();
        const diffTime = trialEnd.getTime() - now.getTime();
        trialDaysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      const maxSellers = planName === 'popular' ? 10 : 
                        planName === 'crescimento' ? 20 : 
                        planName === 'profissional' ? -1 : 3;

      const pricePerMonth = planName === 'popular' ? 10000 : 
                           planName === 'crescimento' ? 20000 : 
                           planName === 'profissional' ? 60000 : 0;

      subscriptionData = {
        subscribed: subscription.status === 'active' || subscription.status === 'trialing',
        plan: planName,
        status: subscription.status,
        trial_days_left: trialDaysLeft,
        is_annual: isAnnual
      };

      // Update Supabase subscription
      await supabaseClient.from("subscriptions").upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        status: subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : 'canceled',
        plan_name: planName,
        max_sellers: maxSellers,
        price_per_month: pricePerMonth,
        is_annual: isAnnual,
        trial_end_date: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      logStep("Updated subscription in database", subscriptionData);
    }

    return new Response(JSON.stringify(subscriptionData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
