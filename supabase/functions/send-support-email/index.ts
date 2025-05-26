
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  reason: string;
  description: string;
  email: string;
  phone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reason, description, email, phone }: SupportEmailRequest = await req.json();

    console.log("Sending support email with data:", { reason, email, phone });

    const emailBody = `
      <h2>NOVO CONTATO DE SUPORTE - SalesCanvas</h2>
      
      <p><strong>Motivo:</strong> ${reason}</p>
      
      <h3>Descrição do Problema:</h3>
      <p>${description.replace(/\n/g, '<br>')}</p>
      
      <h3>Informações de Contato:</h3>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Telefone/WhatsApp:</strong> ${phone}</p>` : ''}
      
      <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
    `;

    const emailResponse = await resend.emails.send({
      from: "SalesCanvas <onboarding@resend.dev>",
      to: ["dealerempresarial@gmail.com"],
      subject: `[SalesCanvas] ${reason}`,
      html: emailBody,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-support-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
