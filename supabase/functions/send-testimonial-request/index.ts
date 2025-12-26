import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

interface EmailRequest {
  to: string;
  clientName: string;
  senderName: string;
  businessName: string;
  emailSubject: string;
  emailBody: string;
  requestPageUrl: string;
  userId: string;
  consultationId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      to, 
      clientName, 
      senderName, 
      businessName, 
      emailSubject, 
      emailBody,
      requestPageUrl,
      userId,
      consultationId
    }: EmailRequest = await req.json();

    // Validate required fields
    if (!to || !businessName || !emailSubject || !emailBody || !requestPageUrl || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate HTML email
    const htmlEmail = generateEmailHtml({
      clientName: clientName || 'there',
      senderName,
      businessName,
      emailBody,
      requestPageUrl
    });

    console.log(`Sending testimonial request email to ${to} for ${businessName}`);

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${businessName} <testimonials@pageconsult.ai>`,
        to: [to],
        subject: emailSubject,
        html: htmlEmail,
        text: emailBody,
        tags: [
          { name: 'type', value: 'testimonial-request' },
          { name: 'user_id', value: userId },
        ],
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData);
      return new Response(
        JSON.stringify({ error: resendData.message || 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Email sent successfully:', resendData);

    // Log the sent email to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase
      .from('testimonial_requests')
      .insert({
        user_id: userId,
        consultation_id: consultationId || null,
        recipient_email: to,
        recipient_name: clientName,
        email_subject: emailSubject,
        email_body: emailBody,
        request_page_url: requestPageUrl,
        status: 'sent',
        resend_id: resendData.id,
        sent_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Error logging to database:', dbError);
      // Don't fail the request if logging fails
    }

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in send-testimonial-request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateEmailHtml({
  clientName,
  senderName,
  businessName,
  emailBody,
  requestPageUrl
}: {
  clientName: string;
  senderName: string;
  businessName: string;
  emailBody: string;
  requestPageUrl: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Testimonial Request</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #1e293b; border-radius: 16px; overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="padding: 32px 32px 0;">
                  <h1 style="margin: 0; color: #f8fafc; font-size: 24px; font-weight: 600;">
                    ${businessName}
                  </h1>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 24px 32px;">
                  <div style="color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                    ${emailBody.replace(/\n/g, '<br>')}
                  </div>
                </td>
              </tr>
              
              <!-- CTA Button -->
              <tr>
                <td style="padding: 0 32px 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(168, 85, 247, 0.1)); border-radius: 12px; border: 1px solid rgba(6, 182, 212, 0.2);">
                    <tr>
                      <td style="padding: 24px; text-align: center;">
                        <p style="margin: 0 0 16px; color: #f8fafc; font-size: 16px; font-weight: 500;">
                          Ready to share your experience?
                        </p>
                        <a href="${requestPageUrl}" 
                           style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #06b6d4, #a855f7); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Share Your Testimonial →
                        </a>
                        <p style="margin: 12px 0 0; color: #64748b; font-size: 13px;">
                          Takes less than 2 minutes
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 32px; background-color: #0f172a; border-top: 1px solid #334155;">
                  <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center;">
                    This email was sent by ${businessName} via PageConsult
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
