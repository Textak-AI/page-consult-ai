import { test, expect } from 'bun:test';
import { loadEdgeSource, fakeDb } from './helpers/edgeHarness.js';
import { computeCommunicationStrategy, auditCommunicationStrategy } from '../supabase/functions/_shared/communicationStrategy.ts';
import { z } from 'zod';

const id = 'a3657032-d5df-446a-a27b-ab4e88e3aa25';
function harness(owner = 'owner') {
  const db = fakeDb(op => op.table === 'consultations' && !op.kind ? { data: owner === 'owner' ? { id, strategy_brief: { markdown: 'unchanged', structured: { headlines: {} } }, challenge: 'Hours lost to recounts.', offer: 'Reset' } : null, error: null } : { data: null, error: null });
  db.client.auth = { getUser: async () => ({ data: { user: { id: 'owner' } }, error: null }) };
  const edge = loadEdgeSource('generate-strategy-brief/index.ts', { createClient: () => db.client, z, computeCommunicationStrategy, auditCommunicationStrategy, getCorsHeaders: () => ({}), handleCorsPreflightRequest: () => null, logRegisterViolations: () => [], logProvenanceViolations: () => [] });
  return { ...edge, db };
}
test('strategy recompute requires authentication', async () => {
  const { handler, db } = harness();
  const response = await handler(new Request('https://app.test', { method: 'POST', body: JSON.stringify({ mode: 'communication-strategy', consultationId: id }) }));
  expect(response.status).toBe(401); expect(db.queries.length).toBe(0);
});
test('strategy cannot read or write another owner consultation', async () => {
  const { handler, db } = harness('other');
  const response = await handler(new Request('https://app.test', { method: 'POST', headers: { Authorization: 'Bearer test' }, body: JSON.stringify({ mode: 'communication-strategy', consultationId: id }) }));
  expect(response.status).toBe(404); expect(db.queries[0].filters).toContainEqual(['user_id','owner']);
  expect(db.queries.some(q => q.kind === 'update')).toBe(false);
});
test('stored strategy preserves brief substrate and uses owner-scoped service write', async () => {
  const { handler, db } = harness();
  const response = await handler(new Request('https://app.test', { method: 'POST', headers: { Authorization: 'Bearer test' }, body: JSON.stringify({ mode: 'communication-strategy', consultationId: id }) }));
  expect(response.status).toBe(200);
  const write = db.queries.find(q => q.kind === 'update');
  expect(write.data.strategy_brief.markdown).toBe('unchanged');
  expect(write.data.strategy_brief.structured.communicationStrategy.stakes).toBe('Hours lost to recounts.');
  expect(write.filters).toContainEqual(['user_id','owner']);
});