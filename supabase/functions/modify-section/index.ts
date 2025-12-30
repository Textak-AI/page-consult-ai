import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk'
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const { 
      sectionType,      // 'hero', 'features', 'faq', etc.
      sectionContent,   // Current content object
      userRequest,      // "Make it more results-focused"
      strategyBrief,    // Original brief for context
      brandVoice        // Tone from brief
    } = await req.json()

    console.log('Modifying section:', sectionType)
    console.log('User request:', userRequest)

    const anthropic = new Anthropic()

    const systemPrompt = `You are an expert landing page copywriter. 
You're modifying a ${sectionType} section based on user feedback.

RULES:
- Maintain the same structure/format as the original
- Keep the brand voice: ${brandVoice || 'professional and engaging'}
- Only change what the user requested
- Return valid JSON matching the original structure exactly
- Be concise — landing pages need punchy copy
- Do NOT add any markdown formatting or code blocks, just raw JSON

ORIGINAL STRATEGY BRIEF CONTEXT:
${JSON.stringify(strategyBrief, null, 2)}
`

    const userPrompt = `
CURRENT SECTION CONTENT:
${JSON.stringify(sectionContent, null, 2)}

USER REQUEST:
"${userRequest}"

Return the modified section content as JSON. Only include the content object, no explanation, no markdown, no code blocks.
`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })

    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
    console.log('AI response:', responseText)

    // Clean up the response - remove any markdown code blocks if present
    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.slice(7)
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3)
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3)
    }
    cleanedResponse = cleanedResponse.trim()

    const modifiedContent = JSON.parse(cleanedResponse)

    return new Response(JSON.stringify({ 
      success: true, 
      modifiedContent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error modifying section:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
