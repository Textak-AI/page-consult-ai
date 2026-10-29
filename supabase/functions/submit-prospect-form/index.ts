import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { captureQuickPivotLead, parseQuickPivotLead } from '../_shared/quickpivotCapture.ts';
import { deliverQuickPivotWebhook, sendQuickPivotFirstLead } from '../_shared/quickpivotDelivery.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  if (req.method !== 'POST') return respond({ error: 'Method not allowed' }, 405);
  let body, lead;
  try { body = await req.json(); lead = parseQuickPivotLead(body); }
  catch (error) { return respond({ error: error instanceof Error ? error.message : 'Invalid input' }, 400); }
  try {
    const client = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const submission = await captureQuickPivotLead(client, body.prospectSlug, lead, (target, saved) => {
      const work = Promise.allSettled([
        deliverQuickPivotWebhook(client, target, saved, lead), sendQuickPivotFirstLead(client, target, saved, lead),
      ]);
      const runtime = (globalThis as unknown as { EdgeRuntime?: { waitUntil: (work: Promise<unknown>) => void } }).EdgeRuntime;
      if (runtime) runtime.waitUntil(work);
      else void work;
    });
    if (!submission) return respond({ error: 'Prospect page not found' }, 404);
    return respond({ success: true, submissionId: submission.id });
  } catch (error) {
    console.error('submit-prospect-form failed', error);
    return respond({ error: 'Failed to save submission' }, 500);
  }
});