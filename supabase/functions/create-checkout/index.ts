
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { planName, isAnnual } = await req.json();
    if (!planName) throw new Error("Plan name is required");
    
    logStep("Request data", { planName, isAnnual });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Define plan prices (in cents)
    const planPrices = {
      popular: { monthly: 10000, annual: 108000 }, // R$100/mês ou R$1080/ano (10% desconto)
      crescimento: { monthly: 20000, annual: 216000 }, // R$200/mês ou R$2160/ano (10% desconto)
      profissional: { monthly: 60000, annual: 648000 } // R$600/mês ou R$6480/ano (10% desconto)
    };

    const price = planPrices[planName as keyof typeof planPrices];
    if (!price) throw new Error("Invalid plan name");

    const unitAmount = isAnnual ? price.annual : price.monthly;
    const interval = isAnnual ? "year" : "month";

    logStep("Creating checkout session", { planName, unitAmount, interval, customerId });

    // Compra através da plataforma = sem período de teste, cobrança imediata
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { 
              name: `Plano ${planName.charAt(0).toUpperCase() + planName.slice(1)}`,
              description: `Ativação imediata - ${isAnnual ? 'cobrança anual' : 'cobrança mensal'}`
            },
            unit_amount: unitAmount,
            recurring: { interval },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        // Sem trial_period_days - cobrança imediata
        metadata: {
          user_id: user.id,
          plan_name: planName,
          is_annual: isAnnual.toString(),
          source: 'platform' // Identifica que veio da plataforma
        }
      },
      success_url: `${req.headers.get("origin")}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      metadata: {
        user_id: user.id,
        plan_name: planName,
        is_annual: isAnnual.toString(),
        source: 'platform'
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
