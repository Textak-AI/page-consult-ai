import { deliverLeadWebhook } from './leadWebhook.ts';

export async function deliverQuickPivotWebhook(client: any, target: any, submission: any, lead: Record<string, unknown>) {
  try {
    const { data: profile, error } = await client.from('profiles').select('lead_webhook_url').eq('id', target.userId).maybeSingle();
    if (error) throw error;
    if (!profile?.lead_webhook_url) return;
    const result = await deliverLeadWebhook(client, {
      userId: target.userId, url: profile.lead_webhook_url,
      payload: { event: 'lead.created', source: 'quickpivot', prospect_slug: target.slug,
        page: { title: target.title || null, slug: target.slug }, lead, submitted_at: submission.submitted_at },
    });
    console.log('QuickPivot webhook outcome', JSON.stringify(result));
  } catch (error) { console.error('QuickPivot webhook failed', error); }
}

export async function sendQuickPivotFirstLead(client: any, target: any, submission: any, lead: any) {
  try {
    const key = Deno.env.get('RESEND_API_KEY');
    if (!key) { console.warn('QuickPivot first-lead: email key missing'); return; }
    const { data: owner, error: ownerError } = await client.auth.admin.getUserById(target.userId);
    if (ownerError) throw ownerError;
    if (!owner?.user?.email) return;
    const { data: claimed, error } = await client.rpc('claim_quickpivot_first_lead', { p_lead_id: submission.id });
    if (error) throw error;
    if (!claimed) { console.log('QuickPivot first-lead skipped', submission.id); return; }
    const siteUrl = (Deno.env.get('PUBLIC_SITE_URL') || 'https://pageconsult.app').replace(/\/$/, '');
    const description = lead.company ? `${lead.name || 'A visitor'} from ${lead.company}` : lead.name || 'A visitor';
    const sentence = `${description} just submitted the form on "${target.title || target.slug}" — your prospect page's first lead.`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST', signal: controller.signal,
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `quickpivot-first-lead-${target.prospectId || target.prospectPageId}` },
        body: JSON.stringify({ from: 'PageConsult AI <hello@pageconsult.ai>', to: [owner.user.email],
          subject: 'Your page just got its first lead', text: `${sentence} View your leads: ${siteUrl}/leads\n\n— PageConsult AI`, tags: [{ name: 'type', value: 'first-lead' }] }),
      });
      const result = await response.text();
      console.log(`QuickPivot first-lead email [${response.status}]: ${result}`);
      if (!response.ok) throw new Error(`Email provider [${response.status}]: ${result}`);
    } catch (error) {
      // Release a failed claim, never mark a failed send as sent.
      await client.from(target.prospectId ? 'prospects' : 'prospect_pages').update({ first_lead_email_sent_at: null }).eq('id', target.prospectId || target.prospectPageId);
      throw error;
    } finally { clearTimeout(timer); }
  } catch (error) { console.error('QuickPivot first-lead email failed', error); }
}