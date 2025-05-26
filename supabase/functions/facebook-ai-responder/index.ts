
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FACEBOOK-AI-RESPONDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("AI responder function started");

    const { messageText, senderName, productInfo } = await req.json();
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Generate AI response
    const systemPrompt = `Você é um assistente de vendas especializado em marketplace. 
    Responda às mensagens dos clientes de forma profissional, amigável e prestativa.
    Informações do produto (se disponível): ${productInfo || 'Não informado'}
    
    Diretrizes:
    - Seja cortês e profissional
    - Responda perguntas sobre o produto
    - Ajude com informações de entrega, pagamento, etc.
    - Se não souber algo, seja honesto e ofereça para verificar
    - Mantenha respostas concisas mas completas
    - Use linguagem brasileira informal mas respeitosa`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Cliente ${senderName || 'um cliente'} disse: "${messageText}"` }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const aiResult = await response.json();
    const aiResponse = aiResult.choices[0].message.content;

    logStep("AI response generated", { response: aiResponse });

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in facebook-ai-responder", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
