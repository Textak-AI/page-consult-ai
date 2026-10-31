import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk'
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';
import { withCharge } from '../_shared/planLimits.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { COPY_REGISTER_RULES, logRegisterViolations } from '../_shared/copyRegister.ts';
import { buildPageChatSystemPrompt, copyOnly, pageCopyStrings, parsePlanText, validatePlan } from '../_shared/pageChat.ts';

// One central chat for the editor: edits existing sections and adds new ones.
// Proposals only — the owner reviews and applies them in the editor.
const handle = async (req: Request, _userId: string): Promise<Response> => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;
  const corsHeaders = getCorsHeaders(req.headers.get('Origin'));
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const { message, history, sections, addable, brief, ownerInput, businessName } = await req.json();
    if (typeof message !== 'string' || !message.trim() || !Array.isArray(sections)) {
      return json({ success: false, error: 'message and sections are required' }, 400);
    }
    const turns = (Array.isArray(history) ? history : [])
      .filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-10)
      .map((m: any) => ({ role: m.role, content: m.content.slice(0, 4000) }));

    const pageSections = sections.map((s: any, index: number) => ({ index, type: String(s?.type || ''), content: copyOnly(s?.content) ?? {} }));
    const system = `${buildPageChatSystemPrompt({ businessName: String(businessName || ''), sections: pageSections, addable: Array.isArray(addable) ? addable : [], brief, ownerInput })}\n\n${COPY_REGISTER_RULES}`;

    const anthropic = new Anthropic();
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      system,
      messages: [...turns, { role: 'user', content: message.slice(0, 4000) }],
    });
    const text = response.content.map((b: any) => (b.type === 'text' ? b.text : '')).join('');

    // Evidence = what the owner said: consultation input, their page copy, their chat turns.
    const ownerMessages = [...turns.filter((t: any) => t.role === 'user').map((t: any) => t.content), message];
    const evidence = { ownerInput, pageCopy: pageCopyStrings(sections), ownerMessages };
    const plan = validatePlan(parsePlanText(text), sections.length, evidence);
    if (plan.dropped.length) console.log('🛡️ [page-chat] dropped:', JSON.stringify(plan.dropped));
    logRegisterViolations('page-chat', plan.operations.map((o) => o.content));

    return json({ success: true, reply: plan.reply, operations: plan.operations });
  } catch (error) {
    console.error('🔴 [page-chat] error:', error);
    return json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
};

// Authenticated and charged before work (1 action), refunded on failure (see _shared/planLimits.ts).
serve((req) => withCharge(req, 'section_chat', getCorsHeaders(req.headers.get('Origin')), (userId) => handle(req, userId), { createClient }));
