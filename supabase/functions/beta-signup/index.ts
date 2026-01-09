import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

// Input validation constants
const MAX_EMAIL_LENGTH = 255;
const MAX_NAME_LENGTH = 100;
const MAX_UTM_LENGTH = 100;
const MAX_REFERRAL_CODE_LENGTH = 20;

// More robust email regex - alphanumeric, dots, underscores, plus, hyphens
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Characters that should not appear in email (prevent injection attempts)
const DANGEROUS_EMAIL_CHARS = /[<>"';{}()\\]/;

// Generate a unique referral code (8 chars alphanumeric)
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars like 0, O, 1, I
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Sanitize and truncate string input
function sanitizeString(input: string | null | undefined, maxLength: number): string | null {
  if (!input || typeof input !== 'string') return null;
  // Truncate first to prevent processing huge strings
  const truncated = input.length > maxLength ? input.substring(0, maxLength) : input;
  return truncated.trim() || null;
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    
    // Extract and validate pageId
    const pageId = body.pageId;
    if (!pageId || typeof pageId !== 'string') {
      console.error('Missing or invalid pageId');
      return new Response(
        JSON.stringify({ success: false, error: 'Page ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract and validate email with length check first (prevent DOS)
    let email = body.email;
    if (!email || typeof email !== 'string') {
      console.error('Missing email');
      return new Response(
        JSON.stringify({ success: false, error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Length check before any processing
    if (email.length > MAX_EMAIL_LENGTH) {
      console.error('Email too long:', email.length);
      return new Response(
        JSON.stringify({ success: false, error: 'Email address is too long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    email = email.trim().toLowerCase();

    // Validate email format with robust regex
    if (!EMAIL_REGEX.test(email)) {
      console.error('Invalid email format:', email);
      return new Response(
        JSON.stringify({ success: false, error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Reject emails with potentially dangerous characters
    if (DANGEROUS_EMAIL_CHARS.test(email)) {
      console.error('Email contains invalid characters:', email);
      return new Response(
        JSON.stringify({ success: false, error: 'Email contains invalid characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize optional string inputs with length limits
    const name = sanitizeString(body.name, MAX_NAME_LENGTH);
    const referredBy = sanitizeString(body.referredBy, MAX_REFERRAL_CODE_LENGTH);
    const utmSource = sanitizeString(body.utmSource, MAX_UTM_LENGTH);
    const utmMedium = sanitizeString(body.utmMedium, MAX_UTM_LENGTH);
    const utmCampaign = sanitizeString(body.utmCampaign, MAX_UTM_LENGTH);

    // Check if page exists and is published
    const { data: page, error: pageError } = await supabase
      .from('beta_pages')
      .select('id, status, max_signups, total_signups, reward_tiers')
      .eq('id', pageId)
      .single();

    if (pageError || !page) {
      console.error('Page not found:', pageId, pageError);
      return new Response(
        JSON.stringify({ success: false, error: 'Page not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (page.status !== 'published') {
      console.error('Page not published:', pageId);
      return new Response(
        JSON.stringify({ success: false, error: 'Page is not accepting signups' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check max signups limit
    if (page.max_signups && page.total_signups >= page.max_signups) {
      console.log('Page reached max signups:', pageId);
      return new Response(
        JSON.stringify({ success: false, error: 'Waitlist is full' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if email already exists for this page
    const { data: existingSignup } = await supabase
      .from('beta_signups')
      .select('id, referral_code, position, referral_count')
      .eq('page_id', pageId)
      .eq('email', email) // Already sanitized and lowercased above
      .maybeSingle();

    if (existingSignup) {
      console.log('Email already signed up:', email);
      return new Response(
        JSON.stringify({ 
          success: true, 
          existing: true,
          signup: {
            position: existingSignup.position,
            referralCode: existingSignup.referral_code,
            referralCount: existingSignup.referral_count
          },
          totalSignups: page.total_signups,
          rewardTiers: page.reward_tiers || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate referral code if provided
    let validReferrer = null;
    if (referredBy) {
      const { data: referrer } = await supabase
        .from('beta_signups')
        .select('referral_code')
        .eq('page_id', pageId)
        .eq('referral_code', referredBy.toUpperCase())
        .maybeSingle();
      
      if (referrer) {
        validReferrer = referrer.referral_code;
      }
      console.log('Referral code check:', referredBy, validReferrer ? 'valid' : 'invalid');
    }

    // Generate unique referral code
    let referralCode = generateReferralCode();
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('beta_signups')
        .select('id')
        .eq('referral_code', referralCode)
        .maybeSingle();
      
      if (!existing) break;
      referralCode = generateReferralCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.error('Failed to generate unique referral code after', maxAttempts, 'attempts');
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate referral code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert signup (triggers will handle position and referral count)
    const { data: signup, error: insertError } = await supabase
      .from('beta_signups')
      .insert({
        page_id: pageId,
        email: email, // Already sanitized and lowercased above
        name: name, // Already sanitized with length limit
        referral_code: referralCode,
        referred_by: validReferrer,
        utm_source: utmSource, // Already sanitized with length limit
        utm_medium: utmMedium, // Already sanitized with length limit
        utm_campaign: utmCampaign, // Already sanitized with length limit
      })
      .select('id, position, referral_code, referral_count')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create signup' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get updated total signups
    const { data: updatedPage } = await supabase
      .from('beta_pages')
      .select('total_signups, reward_tiers')
      .eq('id', pageId)
      .single();

    console.log('Signup created:', signup.id, 'Position:', signup.position);

    return new Response(
      JSON.stringify({
        success: true,
        existing: false,
        signup: {
          position: signup.position,
          referralCode: signup.referral_code,
          referralCount: signup.referral_count
        },
        totalSignups: updatedPage?.total_signups || page.total_signups + 1,
        rewardTiers: updatedPage?.reward_tiers || page.reward_tiers || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in beta-signup:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
