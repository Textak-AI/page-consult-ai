import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResearchQuery {
  id: string;
  query: string;
  purpose: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { queries } = await req.json() as { queries: ResearchQuery[] };
    
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }
    
    console.log('🔍 [Orchestrator Research] Executing', queries.length, 'queries');
    
    const results = await Promise.all(
      queries.map(async (q) => {
        try {
          console.log('🔍 [Orchestrator Research] Query:', q.query.substring(0, 100));
          
          const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.1-sonar-large-128k-online',
              messages: [
                {
                  role: 'system',
                  content: `You are a market research analyst providing intelligence for landing page strategy. 
                
Your research will be used to:
- Predict buyer objections
- Identify competitive gaps
- Understand buyer psychology
- Prioritize trust signals

Be SPECIFIC and ACTIONABLE. Include concrete examples, statistics when available, and source attribution.
Focus on insights that would help craft more persuasive messaging.`
                },
                {
                  role: 'user',
                  content: q.query
                }
              ],
              temperature: 0.2,
              return_citations: true
            })
          });

          if (!response.ok) {
            console.error('🔍 [Orchestrator Research] API error:', response.status);
            return {
              id: q.id,
              purpose: q.purpose,
              query: q.query,
              result: 'Research temporarily unavailable',
              citations: []
            };
          }

          const data = await response.json();
          
          return {
            id: q.id,
            purpose: q.purpose,
            query: q.query,
            result: data.choices?.[0]?.message?.content || 'No results found',
            citations: data.citations || []
          };
        } catch (queryError) {
          console.error('🔍 [Orchestrator Research] Query failed:', q.id, queryError);
          return {
            id: q.id,
            purpose: q.purpose,
            query: q.query,
            result: 'Research temporarily unavailable',
            citations: []
          };
        }
      })
    );

    console.log('🔍 [Orchestrator Research] Complete:', results.length, 'results');

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🔍 [Orchestrator Research] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
