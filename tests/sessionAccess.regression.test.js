import { test, expect } from 'bun:test';
import { z } from 'zod';
import { loadEdgeSource, fakeDb } from './helpers/edgeHarness.js';

const { lookupSession, sessionTokenSchema, authenticatedUser } = loadEdgeSource('_shared/sessionAccess.ts',
  { z, createClient: () => {} }, ['lookupSession','sessionTokenSchema','authenticatedUser']).exports;
const token = '12345678-1234-4234-8234-123456789abc';
const req = authorization => new Request('https://app.test/session', { headers: authorization ? { Authorization: authorization } : {} });
function client(row, user = null, authError = null) {
  const db = fakeDb(() => ({ data: row, error: null }));
  const calls = [];
  db.client.auth = { getUser: async credential => { calls.push(credential); return { data: { user }, error: authError }; } };
  return { ...db, calls };
}
for (const [table, field, ownerKey] of [['guest_sessions','session_token','converted_to_user_id'],
  ['demo_sessions','session_id','claimed_by'], ['consultation_sessions','session_token','user_id']]) {
  test(`${table}: expires at boundary and invalid dates fail closed`, async () => {
    for (const date of [new Date(Date.now() - 7 * 86400000).toISOString(), 'not-a-date', null]) {
      const row = table === 'guest_sessions' ? { expires_at: date } : { created_at: date };
      expect(await lookupSession(client(row).client, table, token, req())).toBeNull();
    }
  });
  test(`${table}: claimed session validates bearer with getUser and rejects mismatched owner`, async () => {
    const row = { id: 'session', [ownerKey]: 'owner' };
    const other = client(row, { id: 'other' });
    expect(await lookupSession(other.client, table, token, req('Bearer test-token'))).toBeNull();
    expect(other.calls).toEqual(['test-token']);
    const owner = client(row, { id: 'owner' });
    expect(await lookupSession(owner.client, table, token, req('Bearer test-token'))).toEqual(row);
    expect(owner.queries[0].filters).toEqual([[field, token]]);
  });
  test(`${table}: claimed owner cannot authenticate via malformed header or auth error`, async () => {
    const row = { [ownerKey]: 'owner' };
    for (const header of [undefined, 'Basic test-token', 'Bearer', 'Bearer token extra']) {
      const h = client(row, { id: 'owner' });
      expect(await lookupSession(h.client, table, token, req(header))).toBeNull(); expect(h.calls).toEqual([]);
    }
    expect(await lookupSession(client(row, { id: 'owner' }, new Error('revoked')).client, table, token, req('Bearer revoked'))).toBeNull();
  });
}
test('malformed capability formats are rejected by the boundary schema (not lookupSession)', () => {
  for (const value of ['', ' a'.repeat(32), 'g'.repeat(64), 'a'.repeat(63), 'a'.repeat(65), token + '\n', 123, null, {}, token.replace('-', '/')]) {
    expect(sessionTokenSchema.safeParse(value).success).toBe(false);
  }
});
test('DB errors fail closed rather than returning even an owner-matching row', async () => {
  const db = fakeDb(() => ({ data: { user_id: 'owner' }, error: { message: 'DB unavailable' } }));
  await expect(lookupSession(db.client, 'consultation_sessions', token, req())).rejects.toThrow('Session lookup failed');
});
test('authenticatedUser accepts case-insensitive Bearer only after server validation', async () => {
  const h = client(null, { id: 'owner' });
  expect(await authenticatedUser(req('bEaReR test-token'), h.client)).toEqual({ id: 'owner' });
  expect(h.calls).toEqual(['test-token']);
});