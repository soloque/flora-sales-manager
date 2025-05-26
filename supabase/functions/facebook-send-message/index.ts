
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FACEBOOK-SEND-MESSAGE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Send message function started");

    const { recipientId, messageText, isAiResponse = false } = await req.json();
    
    if (!recipientId || !messageText) {
      throw new Error("recipientId and messageText are required");
    }

    const accessToken = Deno.env.get("FACEBOOK_PAGE_ACCESS_TOKEN");
    if (!accessToken) {
      throw new Error("Facebook access token not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Send message via Facebook API
    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: messageText }
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Facebook API error: ${result.error?.message || 'Unknown error'}`);
    }

    logStep("Message sent via Facebook API", result);

    // Store sent message in database
    const { error } = await supabaseClient.from('facebook_messages').insert({
      facebook_message_id: result.message_id,
      sender_id: result.recipient_id, // Our page ID
      recipient_id: recipientId,
      message_text: messageText,
      timestamp: new Date(),
      is_from_customer: false,
      is_ai_response: isAiResponse,
      status: 'sent'
    });

    if (error) {
      logStep("Error storing sent message", error);
    }

    return new Response(JSON.stringify({ success: true, messageId: result.message_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in facebook-send-message", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
