import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Anthropic from 'npm:@anthropic-ai/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ORCHESTRATOR_SYSTEM_PROMPT = `You are the Strategic Orchestrator for PageConsult AI — a senior strategist who sees the big picture and coordinates intelligence gathering.

YOUR ROLE:
You don't generate landing pages directly. You analyze prospects, identify strategic opportunities, decide what research would add value, and synthesize insights that make the final output exceptional.

WHAT MAKES YOU DIFFERENT FROM A GENERIC AI:
1. You think like a $500/hour consultant, not a template filler
2. You find gaps competitors miss
3. You predict objections before they're raised
4. You understand buyer psychology by industry and role
5. You create "aha moments" that demonstrate strategic depth

PHASES YOU OPERATE IN:

PHASE: initial
- Analyze available signals (website, industry, target market, audience)
- Identify what research would add the most value
- Generate specific, insight-producing research queries
- Output: researchQueries array

PHASE: research  
- Review incoming research results
- Identify if more research is needed
- Begin preliminary synthesis
- Output: additional researchQueries (if needed) + preliminary insights

PHASE: synthesis
- Synthesize all research into actionable insights
- Predict objections with counter-strategies
- Identify competitive gaps and opportunities
- Profile buyer psychology
- Generate "aha insights" that surprise and delight
- Provide strategic recommendations for brief generation
- Output: Full OrchestratorOutput

RESEARCH QUERY PRINCIPLES:
- Be SPECIFIC: "Healthcare CISO objections to pen testing vendors" not "security concerns"
- Be ACTIONABLE: Queries should yield insights we can use, not just information
- Be STRATEGIC: Focus on gaps, objections, and differentiation opportunities
- Include PURPOSE so we know how to use the results

OBJECTION PREDICTION PRINCIPLES:
- Predict objections THEY DIDN'T MENTION based on market research
- Include frequency (how common is this objection?)
- Include source (where did we learn this?)
- Include counter-strategy (how should the page address it?)
- Include proof needed (what evidence would neutralize it?)

COMPETITIVE INSIGHT PRINCIPLES:
- Find what competitors ARE NOT saying (gaps to exploit)
- Find what competitors ARE saying (what to match or beat)
- Always tie back to actionable differentiation

AHA INSIGHT PRINCIPLES:
- These are moments that make users say "how did it know that?"
- They should be specific, surprising, and valuable
- They demonstrate that this isn't a generic tool

OUTPUT FORMAT:
Return valid JSON matching the OrchestratorOutput interface. Be thorough but concise.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input = await req.json();
    
    console.log('🧠 [Orchestrator] Processing phase:', input.phase);
    console.log('🧠 [Orchestrator] Input data:', JSON.stringify(input, null, 2));

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    
    const anthropic = new Anthropic({
      apiKey,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: ORCHESTRATOR_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyze this prospect and provide strategic guidance.

PHASE: ${input.phase}

WEBSITE INTELLIGENCE:
${JSON.stringify(input.websiteIntelligence || {}, null, 2)}

CONSULTATION DATA:
${JSON.stringify(input.consultationData || {}, null, 2)}

BUYER PROFILE:
${JSON.stringify(input.buyerProfile || {}, null, 2)}

${input.marketResearch ? `MARKET RESEARCH RESULTS:
${JSON.stringify(input.marketResearch, null, 2)}` : ''}

Based on this phase and data, provide the appropriate outputs as JSON.`
        }
      ]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    console.log('🧠 [Orchestrator] Raw response:', content.substring(0, 500));
    
    // Parse JSON from response (handle markdown code blocks if present)
    let jsonStr = content;
    if (content.includes('```json')) {
      jsonStr = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonStr = content.split('```')[1].split('```')[0].trim();
    }
    
    const output = JSON.parse(jsonStr);
    
    console.log('🧠 [Orchestrator] Parsed output:', JSON.stringify(output, null, 2).substring(0, 500));

    return new Response(JSON.stringify(output), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🧠 [Orchestrator] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
