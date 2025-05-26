
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FACEBOOK-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    if (req.method === "GET") {
      // Facebook webhook verification
      const url = new URL(req.url);
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      const verifyToken = Deno.env.get("FACEBOOK_VERIFY_TOKEN");

      if (mode === "subscribe" && token === verifyToken) {
        logStep("Webhook verified successfully");
        return new Response(challenge, { status: 200 });
      } else {
        logStep("Webhook verification failed");
        return new Response("Forbidden", { status: 403 });
      }
    }

    if (req.method === "POST") {
      const body = await req.json();
      logStep("Webhook payload received", body);

      // Process Facebook Marketplace messages
      if (body.object === "page") {
        for (const entry of body.entry) {
          for (const messaging of entry.messaging || []) {
            if (messaging.message) {
              // Store incoming message
              const { error } = await supabaseClient.from('facebook_messages').insert({
                facebook_message_id: messaging.message.mid,
                sender_id: messaging.sender.id,
                recipient_id: messaging.recipient.id,
                message_text: messaging.message.text,
                timestamp: new Date(messaging.timestamp),
                is_from_customer: true,
                status: 'received'
              });

              if (error) {
                logStep("Error storing message", error);
              } else {
                logStep("Message stored successfully");
              }
            }
          }
        }
      }

      return new Response("OK", { status: 200 });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in facebook-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
