import { expect, test } from 'bun:test';
import { parseQuickPivotLead, captureQuickPivotLead } from '../supabase/functions/_shared/quickpivotCapture.ts';

test('QuickPivot contact field limits match submit-form', () => {
  const body = { prospectSlug: 'real-prospect', email: `${'a'.repeat(300)}@example.com`, name: 'n'.repeat(300), phone: 'p'.repeat(100), company: 'c'.repeat(300), message: 'm'.repeat(6000), sourceUrl: 's'.repeat(3000), utmSource: 'u'.repeat(200), utmMedium: 'u'.repeat(200), utmCampaign: 'u'.repeat(200) };
  const lead = parseQuickPivotLead(body);
  expect([lead.email.length, lead.name.length, lead.phone.length, lead.company.length, lead.message.length, lead.source_url.length, lead.utm_source.length, lead.utm_medium.length, lead.utm_campaign.length]).toEqual([255,255,50,255,5000,2000,100,100,100]);
});
test('QuickPivot rejects invalid email and slug', () => {
  expect(() => parseQuickPivotLead({ prospectSlug: 'ok', email: 'bad' })).toThrow();
  expect(() => parseQuickPivotLead({ prospectSlug: '../private', email: 'a@b.com' })).toThrow();
});

function client(insertError = null) {
  const filters = [], inserts = [];
  return { filters, inserts, from(table) {
    const q = { select: () => q, eq: (k,v) => { filters.push([table,k,v]); return q; },
      maybeSingle: async () => ({ data: table === 'prospects' ? { id:'prospect',user_id:'owner',base_page_id:'base' } : { id:'base',title:'Real page' } }),
      insert: row => { inserts.push(row); return q; }, single: async () => ({ data: { id:'lead',submitted_at:'now' },error:insertError }) };
    return q;
  }};
}
test('successful capture resolves owner server-side before scheduling delivery', async () => {
  const c=client(); let called=false;
  const saved=await captureQuickPivotLead(c,'slug',parseQuickPivotLead({prospectSlug:'slug',email:'a@b.com',user_id:'attacker'}), (target) => { called=true; expect(c.inserts.length).toBe(1); expect(target.userId).toBe('owner'); });
  expect(saved.id).toBe('lead'); expect(called).toBe(true); expect(c.inserts[0].user_id).toBe('owner');
  expect(c.filters).toContainEqual(['landing_pages','user_id','owner']);
});
test('failed insert never schedules delivery', async () => {
  let called=false;
  await expect(captureQuickPivotLead(client(new Error('insert failed')),'slug',parseQuickPivotLead({prospectSlug:'slug',email:'a@b.com'}),()=>{called=true;})).rejects.toThrow();
  expect(called).toBe(false);
});
test('delivery scheduling failure cannot fail a saved lead', async () => {
  const saved=await captureQuickPivotLead(client(),'slug',parseQuickPivotLead({prospectSlug:'slug',email:'a@b.com'}),()=>{throw new Error('delivery failed');});
  expect(saved.id).toBe('lead');
});