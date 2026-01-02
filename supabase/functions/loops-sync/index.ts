import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoopsSyncRequest {
  event: 'trial_started' | 'trial_expiring_soon' | 'trial_expiring_tomorrow' | 'trial_expired' | 'contact_created';
  email: string;
  properties?: Record<string, any>;
  userId?: string;
}

const LOOPS_API_URL = 'https://app.loops.so/api/v1';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOOPS_API_KEY");
    if (!apiKey) {
      console.error("LOOPS_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { event, email, properties = {}, userId }: LoopsSyncRequest = await req.json();

    if (!email || !event) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email and event" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📧 [Loops] Processing event: ${event} for ${email}`);

    // First, ensure contact exists in Loops
    const contactData: Record<string, any> = {
      email,
      source: "pageconsult",
      ...properties,
    };

    if (userId) {
      contactData.userId = userId;
    }

    // Map events to their corresponding properties
    switch (event) {
      case 'trial_started':
        contactData.trialStarted = true;
        contactData.trialStartDate = new Date().toISOString();
        contactData.trialEndDate = properties.trial_end || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        contactData.subscriptionStatus = 'trialing';
        break;
        
      case 'trial_expiring_soon':
        contactData.trialExpiringSoon = true;
        contactData.daysRemaining = properties.days_remaining || 3;
        break;
        
      case 'trial_expiring_tomorrow':
        contactData.trialExpiringTomorrow = true;
        contactData.daysRemaining = 1;
        break;
        
      case 'trial_expired':
        contactData.trialExpired = true;
        contactData.subscriptionStatus = 'expired';
        break;
    }

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
      
      // If update fails, try creating
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
      }
    }

    // Trigger the event
    const eventPayload = {
      email,
      eventName: event,
      eventProperties: {
        ...properties,
        triggeredAt: new Date().toISOString(),
      },
    };

    console.log(`📤 [Loops] Sending event:`, eventPayload);

    const eventResponse = await fetch(`${LOOPS_API_URL}/events/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    if (!eventResponse.ok) {
      const errorText = await eventResponse.text();
      console.error(`Failed to send event: ${eventResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Failed to send event: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await eventResponse.json();
    console.log(`✅ [Loops] Event sent successfully:`, result);

    return new Response(
      JSON.stringify({ success: true, event, email }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in loops-sync function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
