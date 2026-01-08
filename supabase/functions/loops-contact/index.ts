import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

const LOOPS_API_URL = 'https://app.loops.so/api/v1';

interface LoopsContactRequest {
  email: string;
  firstName?: string;
  properties?: Record<string, any>;
  tags?: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const apiKey = Deno.env.get("LOOPS_API_KEY");
    if (!apiKey) {
      console.error("LOOPS_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, firstName, properties = {}, tags = [] }: LoopsContactRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📧 [Loops] Creating/updating contact: ${email}`);

    // Build contact data
    const contactData: Record<string, any> = {
      email,
      source: properties.source || "pageconsult_demo",
      ...properties,
    };

    if (firstName) {
      contactData.firstName = firstName;
    }

    // Add Founders pricing flag if applicable
    if (properties.discountTier === 'founders-50' || properties.foundersEligible) {
      contactData.foundersEligible = true;
      contactData.discountTier = 'founders-50';
      contactData.discountPercent = 50;
    }

    // Add company info if provided
    if (properties.company) {
      contactData.company = properties.company;
    }

    if (properties.website) {
      contactData.website = properties.website;
    }

    console.log(`📤 [Loops] Contact data:`, contactData);

    // Create or update contact
    const contactResponse = await fetch(`${LOOPS_API_URL}/contacts/update`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    if (!contactResponse.ok) {
      const errorText = await contactResponse.text();
      console.error(`Failed to update contact: ${contactResponse.status} - ${errorText}`);
      
      // Try creating instead
      const createResponse = await fetch(`${LOOPS_API_URL}/contacts/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (!createResponse.ok) {
        const createError = await createResponse.text();
        console.error(`Failed to create contact: ${createResponse.status} - ${createError}`);
        // Don't fail the request - this is non-critical
      } else {
        console.log(`✅ [Loops] Contact created successfully`);
      }
    } else {
      console.log(`✅ [Loops] Contact updated successfully`);
    }

    // Add tags if provided
    if (tags.length > 0) {
      // Loops handles tags as properties, so we'll trigger an event instead
      const eventPayload = {
        email,
        eventName: 'demo_business_card_submitted',
        eventProperties: {
          tags: tags.join(','),
          foundersEligible: contactData.foundersEligible || false,
          company: properties.company || '',
          triggeredAt: new Date().toISOString(),
        },
      };

      const eventResponse = await fetch(`${LOOPS_API_URL}/events/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      });

      if (!eventResponse.ok) {
        const eventError = await eventResponse.text();
        console.warn(`Failed to send event: ${eventResponse.status} - ${eventError}`);
      } else {
        console.log(`✅ [Loops] Event sent successfully`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, email }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in loops-contact function:", error);
    // Don't fail the request - Loops integration is non-critical
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
