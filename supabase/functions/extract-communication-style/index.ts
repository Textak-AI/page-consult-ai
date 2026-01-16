import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

interface CommunicationStyle {
  tone: {
    descriptors: string[];
    primary: string;
  };
  voice: {
    pov: "first_plural" | "first_singular" | "second_person" | "third_person";
    addressesReader: boolean;
    sentenceStyle: "short" | "mixed" | "long";
  };
  vocabulary: {
    favoredWords: string[];
    avoidedPatterns: string[];
  };
  formality: {
    level: 1 | 2 | 3 | 4 | 5;
    description: string;
  };
}

const SYSTEM_PROMPT = `You are a brand voice analyst. Analyze the provided website copy and extract the communication style.
Return ONLY valid JSON with this structure:
{
  "tone": {
    "descriptors": ["confident", "direct", "technical"],
    "primary": "confident and direct"
  },
  "voice": {
    "pov": "first_plural",
    "addressesReader": true,
    "sentenceStyle": "mixed"
  },
  "vocabulary": {
    "favoredWords": ["transform", "strategic", "execution"],
    "avoidedPatterns": ["synergy", "leverage", "best-in-class"]
  },
  "formality": {
    "level": 3,
    "description": "Professional but approachable"
  }
}

Guidelines:
- Tone descriptors: Choose from confident, humble, direct, playful, serious, technical, accessible, warm, authoritative, urgent, calm, provocative
- POV: first_plural = we/our, first_singular = I/my, second_person = you/your, third_person = the company/they
- Favored words: 5-10 words that appear frequently and seem intentional
- Avoided patterns: Note what's NOT present (common buzzwords missing)
- Formality: 1=very casual, 3=professional but friendly, 5=very formal

Return ONLY the JSON object, no markdown formatting or code blocks.`;

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  console.log('[extract-communication-style] v2 - model updated');

  try {
    const { websiteText, companyName, industry } = await req.json();

    if (!websiteText || websiteText.length < 100) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Insufficient website text for analysis'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // Truncate text to avoid token limits (roughly 4000 chars = ~1000 tokens)
    const truncatedText = websiteText.slice(0, 8000);

    const userPrompt = `Analyze the communication style of this website copy for ${companyName || 'a company'}${industry ? ` in the ${industry} industry` : ''}:

---
${truncatedText}
---

Extract the brand voice and communication patterns.`;

    console.log('[extract-communication-style] Analyzing text length:', truncatedText.length);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ],
        system: SYSTEM_PROMPT
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[extract-communication-style] Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      throw new Error('No content in Anthropic response');
    }

    console.log('[extract-communication-style] Raw response:', content);

    // Parse JSON response
    let style: CommunicationStyle;
    try {
      // Clean up response - remove markdown code blocks if present
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      style = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('[extract-communication-style] JSON parse error:', parseError);
      throw new Error('Failed to parse communication style response');
    }

    // Validate structure
    if (!style.tone || !style.voice || !style.vocabulary || !style.formality) {
      throw new Error('Invalid communication style structure');
    }

    console.log('[extract-communication-style] Successfully extracted style:', style);

    return new Response(JSON.stringify({
      success: true,
      style
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[extract-communication-style] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract communication style';
    const origin = req.headers.get('Origin');
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' }
    });
  }
});
