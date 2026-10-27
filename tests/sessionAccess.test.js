import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { z } from 'zod';

const source = readFileSync(new URL('../supabase/functions/_shared/sessionAccess.ts', import.meta.url), 'utf8');
const executable = new Bun.Transpiler({ loader: 'ts' }).transformSync(source.replace(/^import .*;\n/gm, '').replace(/export /g, ''));
const { lookupSession, sessionTokenSchema } = new Function('createClient', 'z', executable + '\nreturn { lookupSession, sessionTokenSchema };')(() => {}, z);

const token = '12345678-1234-4234-8234-123456789abc';
function clientFor(row, userId = null) {
  const filters = [];
  return {
    filters,
    auth: { getUser: async () => ({ data: { user: userId ? { id: userId } : null }, error: null }) },
    from: table => ({ select: () => ({ eq: (field, value) => { filters.push({ table, field, value }); return { maybeSingle: async () => ({ data: row, error: null }) }; } }) }),
  };
}
const request = new Request('https://app.example', { headers: { Authorization: 'Bearer test-token' } });
test('malformed or enumerable short tokens are rejected', () => {
  expect(sessionTokenSchema.safeParse('1').success).toBe(false);
  expect(sessionTokenSchema.safeParse('demo-session').success).toBe(false);
  expect(sessionTokenSchema.safeParse(token).success).toBe(true);
  expect(sessionTokenSchema.safeParse('a'.repeat(64)).success).toBe(true);
});
test('a nonexistent token authorizes no session', async () => {
  expect(await lookupSession(clientFor(null), 'demo_sessions', token, request)).toBeNull();
});
test('guest reads validate the exact token and expiry', async () => {
  const row = { id: 'guest', expires_at: new Date(Date.now()+3600000).toISOString(), converted_to_user_id: null };
  const client = clientFor(row);
  expect(await lookupSession(client, 'guest_sessions', 'a'.repeat(64), request)).toEqual(row);
  expect(client.filters).toEqual([{ table: 'guest_sessions', field: 'session_token', value: 'a'.repeat(64) }]);
  expect(await lookupSession(clientFor({ ...row, expires_at: '2020-01-01' }), 'guest_sessions', 'a'.repeat(64), request)).toBeNull();
});
test('expired anonymous consultation and demo sessions cannot be accessed', async () => {
  for (const table of ['demo_sessions','consultation_sessions']) {
    expect(await lookupSession(clientFor({ created_at: '2020-01-01' }), table, token, request)).toBeNull();
  }
});
test('claimed sessions require their authenticated owner even with the bearer token', async () => {
  for (const [table, ownerField] of [['demo_sessions','claimed_by'],['guest_sessions','converted_to_user_id'],['consultation_sessions','user_id']]) {
    const row = { [ownerField]: 'owner', id: 'claimed' };
    expect(await lookupSession(clientFor(row), table, token, request)).toBeNull();
    expect(await lookupSession(clientFor(row, 'other-user'), table, token, request)).toBeNull();
    expect(await lookupSession(clientFor(row, 'owner'), table, token, request)).toEqual(row);
  }
});