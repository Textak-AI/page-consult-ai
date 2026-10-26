import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { webcrypto } from 'node:crypto';

const source = readFileSync(new URL('../supabase/functions/generate-brand-scene/index.ts', import.meta.url), 'utf8');
const executable = new Bun.Transpiler({ loader: 'ts' }).transformSync(source.replace(/^import .*;\r?\n/gm, ''));

function setup(status = 'succeeded') {
  let handler;
  const calls = [];
  const writes = [];
  runInNewContext(executable, {
    serve: cb => { handler = cb; }, Response, console, TextEncoder, crypto: webcrypto, btoa,
    setTimeout: cb => { cb(); }, handleCorsPreflightRequest: () => null, getCorsHeaders: () => ({}),
    Deno: { env: { get: () => 'test-only' } },
    createClient: () => ({ from: table => {
      const query = {
        select: () => query, eq: () => query, gte: () => query,
        maybeSingle: async () => ({ data: null }),
        upsert: async value => { writes.push([table, value]); return {}; },
        insert: async value => { writes.push([table, value]); return {}; },
      };
      return query;
    } }),
    fetch: async (url, options) => {
      calls.push([url, options]);
      if (url === 'https://example.test/logo.png' || url === 'https://example.test/output.png') {
        return new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/png' } });
      }
      if (options?.method === 'POST') return Response.json({ id: 'prediction', status: 'starting' });
      return Response.json({ status, output: 'https://example.test/output.png' });
    },
  });
  return { invoke: () => handler(new Request('http://localhost/test', { method: 'POST', body: JSON.stringify({ logoUrl: 'https://example.test/logo.png', industry: 'Professional Services', userId: 'owner' }) })), calls, writes };
}

test('brand scene preserves logo input and prompt, polls, and caches durable images with the existing contract', async () => {
  const { invoke, calls, writes } = setup();
  const response = await invoke();
  expect(response.status).toBe(200);
  const result = await response.json();
  const create = calls.find(([, options]) => options?.method === 'POST');
  const input = JSON.parse(create[1].body).input;
  expect(create[0]).toBe('https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions');
  expect(input.prompt).toBe(result.prompt);
  expect(input.input_image).toBe('data:image/png;base64,AQID');
  expect(input.aspect_ratio).toBe('16:9');
  expect(input.prompt_upsampling).toBe(false);
  expect(result.images).toEqual(['data:image/png;base64,AQID']);
  expect(result.fromCache).toBe(false);
  expect(result.type).toBe('brand-scene');
  expect(writes.find(([table]) => table === 'brand_scene_cache')[1].scenes).toEqual(result.images);
  expect(writes.find(([table]) => table === 'brand_scene_generations')[1].from_cache).toBe(false);
});

test('failed or canceled predictions never write a successful cache entry', async () => {
  for (const status of ['failed', 'canceled']) {
    const { invoke, writes } = setup(status);
    expect((await invoke()).status).toBe(500);
    expect(writes).toEqual([]);
  }
});