import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sanitize HTML signature to prevent XSS - server-side validation
function sanitizeHtmlSignature(html: string): string {
  // List of allowed tags for email signatures
  const allowedTags = new Set([
    'div', 'p', 'span', 'a', 'img', 'br', 'strong', 'em', 'b', 'i', 'u',
    'table', 'tr', 'td', 'th', 'tbody', 'thead', 'tfoot', 'font', 'hr'
  ]);
  
  // List of allowed attributes
  const allowedAttrs = new Set([
    'href', 'src', 'alt', 'style', 'class', 'width', 'height', 'border',
    'cellpadding', 'cellspacing', 'align', 'valign', 'bgcolor', 'color',
    'face', 'size', 'target', 'rel'
  ]);
  
  // Dangerous patterns to remove
  const dangerousPatterns = [
    /<script[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?<\/iframe>/gi,
    /<object[\s\S]*?<\/object>/gi,
    /<embed[\s\S]*?>/gi,
    /<form[\s\S]*?<\/form>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,  // Event handlers like onerror=, onload=, onclick=
    /data:/gi,      // Data URLs can contain scripts
  ];
  
  let sanitized = html;
  
  // Remove dangerous patterns
  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }
  
  // Parse and filter using DOM
  try {
    const doc = new DOMParser().parseFromString(sanitized, 'text/html');
    if (!doc || !doc.body) return sanitized; // Return regex-cleaned version if parse fails
    
    const docRef = doc; // Capture for closure
    
    // Recursively clean nodes
    function cleanNode(node: any): void {
      if (!node) return;
      
      // Remove disallowed elements
      if (node.nodeType === 1) { // Element node
        const tagName = node.tagName?.toLowerCase();
        
        // Remove script, iframe, etc. entirely
        if (tagName && !allowedTags.has(tagName)) {
          // Keep text content but remove the tag
          const textContent = node.textContent || '';
          const textNode = docRef.createTextNode(textContent);
          node.parentNode?.replaceChild(textNode, node);
          return;
        }
        
        // Remove dangerous attributes
        const attrs = Array.from(node.attributes || []);
        for (const attr of attrs) {
          const attrName = (attr as any).name?.toLowerCase();
          if (!allowedAttrs.has(attrName) || attrName.startsWith('on')) {
            node.removeAttribute(attrName);
          }
          // Check for javascript: in href/src
          const attrValue = ((attr as any).value || '').toLowerCase();
          if (attrValue.includes('javascript:') || attrValue.includes('vbscript:')) {
            node.removeAttribute(attrName);
          }
        }
      }
      
      // Recursively clean children
      const children = Array.from(node.childNodes || []);
      for (const child of children) {
        cleanNode(child);
      }
    }
    
    cleanNode(doc.body);
    return doc.body.innerHTML || '';
  } catch (e) {
    console.error('[sanitizeHtmlSignature] Parse error, falling back to regex only:', e);
    return sanitized;
  }
}

interface SendEmailRequest {
  prospectId: string;
  pageLink: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Check environment variables
    const LOOPS_API_KEY = Deno.env.get("LOOPS_API_KEY");
    const QUICK_PIVOT_EMAIL_ID = Deno.env.get("QUICK_PIVOT_EMAIL_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("[send-prospect-email] Checking environment variables...");
    
    if (!LOOPS_API_KEY) {
      console.error("[send-prospect-email] LOOPS_API_KEY environment variable not configured");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "LOOPS_API_KEY environment variable not configured" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (!QUICK_PIVOT_EMAIL_ID) {
      console.error("[send-prospect-email] QUICK_PIVOT_EMAIL_ID environment variable not configured");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "QUICK_PIVOT_EMAIL_ID environment variable not configured" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[send-prospect-email] Supabase environment variables not configured");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Supabase environment variables not configured" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[send-prospect-email] Environment variables OK");

    // Step 2: Check auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[send-prospect-email] No authorization header provided");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "No authorization header" 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      console.error("[send-prospect-email] Auth error:", authError?.message || "User not found");
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Authentication failed: ${authError?.message || "User not found"}` 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[send-prospect-email] Authenticated user:", user.id);

    // Step 3: Parse request body
    const body = await req.json();
    console.log("[send-prospect-email] Received request with:", JSON.stringify(body, null, 2));

    const { prospectId, pageLink }: SendEmailRequest = body;

    if (!prospectId) {
      console.error("[send-prospect-email] Missing prospectId in request");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Missing prospectId in request body" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!pageLink) {
      console.error("[send-prospect-email] Missing pageLink in request");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Missing pageLink in request body" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 4: Get prospect data
    console.log("[send-prospect-email] Fetching prospect:", prospectId);
    
    const { data: prospect, error: prospectError } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", prospectId)
      .eq("user_id", user.id)
      .single();

    if (prospectError) {
      console.error("[send-prospect-email] Database error fetching prospect:", prospectError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Database error: ${prospectError.message}` 
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!prospect) {
      console.error("[send-prospect-email] Prospect not found or doesn't belong to user");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Prospect not found or access denied" 
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[send-prospect-email] Found prospect:", prospect.id, "email:", prospect.email);

    if (!prospect.email) {
      console.error("[send-prospect-email] Prospect has no email address");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Prospect has no email address" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 5: Fetch user profile for sender_name and signature settings
    console.log("[send-prospect-email] Fetching user profile for sender_name and signature...");
    let senderName = "Kyle Moyer"; // Fallback default
    let signatureType = "simple";
    let signatureHtml = "";
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, signature_type, signature_html, signature_name, signature_title, signature_email, signature_phone, signature_website, signature_enabled")
      .eq("id", user.id)
      .single();
    
    if (profileError) {
      console.log("[send-prospect-email] No profile found, using fallback sender_name");
    } else if (profile) {
      if (profile.full_name) {
        senderName = profile.full_name;
      }
      signatureType = profile.signature_type || "simple";
      signatureHtml = profile.signature_html || "";
      console.log("[send-prospect-email] Using sender_name from profile:", senderName, "Signature type:", signatureType);
    }

    // Step 6: Prepare email body with proper formatting
    let emailBody = prospect.email_body?.replace(/\{\{page_link\}\}/g, pageLink) || "";
    
    // Convert to HTML format for better email rendering
    // Replace line breaks with <br> tags
    let htmlEmailBody = emailBody.replace(/\n/g, "<br>");
    
    // Add HTML signature if using HTML type - SANITIZE to prevent XSS
    if (signatureType === "html" && signatureHtml && profile?.signature_enabled !== false) {
      const sanitizedSignature = sanitizeHtmlSignature(signatureHtml);
      console.log("[send-prospect-email] Sanitized HTML signature for email");
      htmlEmailBody += "<br><br>" + sanitizedSignature;
    }
    
    const loopsPayload = {
      transactionalId: QUICK_PIVOT_EMAIL_ID,
      email: prospect.email,
      dataVariables: {
        subject: prospect.email_subject || "A personalized page just for you",
        prospect_name: prospect.first_name || prospect.full_name?.split(" ")[0] || "there",
        body: htmlEmailBody,
        sender_name: senderName,
      },
    };

    console.log("[send-prospect-email] Calling Loops API with transactionalId:", QUICK_PIVOT_EMAIL_ID);
    console.log("[send-prospect-email] Sending to:", prospect.email);
    
    const loopsResponse = await fetch("https://app.loops.so/api/v1/transactional", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loopsPayload),
    });

    const loopsResponseText = await loopsResponse.text();
    console.log("[send-prospect-email] Loops API response status:", loopsResponse.status);
    console.log("[send-prospect-email] Loops API response:", loopsResponseText);

    if (!loopsResponse.ok) {
      console.error("[send-prospect-email] Loops API error:", loopsResponseText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Loops API error (${loopsResponse.status}): ${loopsResponseText}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let loopsResult;
    try {
      loopsResult = JSON.parse(loopsResponseText);
    } catch {
      loopsResult = { raw: loopsResponseText };
    }

    // Step 7: Update prospect with email sent status
    console.log("[send-prospect-email] Updating prospect email status...");
    
    const { error: updateError } = await supabase
      .from("prospects")
      .update({
        email_status: "sent",
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", prospectId);

    if (updateError) {
      console.error("[send-prospect-email] Failed to update prospect status:", updateError);
      // Don't fail the request, email was sent successfully
    }

    console.log("[send-prospect-email] Email sent successfully to", prospect.email);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent to ${prospect.email}`,
        loopsResult,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("[send-prospect-email] Unhandled error:", errorMessage);
    console.error("[send-prospect-email] Stack:", errorStack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
