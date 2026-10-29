import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../supabase/functions/generate-hero-images/index.ts', import.meta.url), 'utf8');
const executable = new Bun.Transpiler({ loader: 'ts' }).transformSync(source.replace(/^import .*;\r?\n/gm, ''));
function setup({ cached = null, downloadStatus = 200, mime = 'image/webp' } = {}) {
  let handler; const writes = []; const downloads = [];
  const query = { select: () => query, eq: () => query, single: async () => ({ data: cached }), upsert: async value => { writes.push(value); return {}; } };
  runInNewContext(executable, {
    serve: cb => { handler = cb; }, withCharge: (req, action, cors, work) => work('owner'),
    createClient: () => ({ from: () => query }), getCorsHeaders: () => ({}), handleCorsPreflightRequest: () => null,
    Request, Response, AbortSignal, Uint8Array, btoa, console, setTimeout: cb => cb(), Deno: { env: { get: () => 'local-only' } },
    fetch: async (url, options) => {
      if (url.startsWith('https://api.replicate.com/')) return Response.json({ id: 'fixture', status: 'succeeded', output: ['https://replicate.delivery/temporary.webp'] });
      downloads.push(url);
      return new Response(new Uint8Array([1, 2, 3]), { status: downloadStatus, headers: { 'content-type': mime } });
    },
  });
  return { writes, downloads, invoke: () => handler(new Request('http://localhost/test', { method: 'POST', body: JSON.stringify({ prompts: ['Warehouse atmosphere'], cacheKey: 'test' }) })) };
}
test('generated hero response and cache persist bytes, not temporary provider URLs', async () => {
  const s = setup(); const r = await s.invoke(); expect(r.status).toBe(200);
  expect((await r.json()).images[0].url).toBe('data:image/webp;base64,AQID');
  expect(s.writes[0].images).toEqual(['data:image/webp;base64,AQID']);
});
test('legacy cached links are upgraded before being returned', async () => {
  const s = setup({ cached: { images: ['https://replicate.delivery/old.webp'] } });
  const data = await (await s.invoke()).json(); expect(data.fromCache).toBe(true);
  expect(data.images[0].url).toBe('data:image/webp;base64,AQID'); expect(s.writes[0].images).toEqual(['data:image/webp;base64,AQID']);
});
test('durable cached images do not require a provider download', async () => {
  const s = setup({ cached: { images: ['data:image/png;base64,AQID'] } });
  expect((await (await s.invoke()).json()).images[0].url).toBe('data:image/png;base64,AQID'); expect(s.downloads).toEqual([]);
});
test('expired cache and failed downloads never return or persist dead URLs', async () => {
  const s = setup({ cached: { images: ['https://replicate.delivery/expired.webp'] }, downloadStatus: 404 });
  expect((await s.invoke()).status).toBe(500); expect(s.writes).toEqual([]);
});
test('non-image download responses never become successful cached imagery', async () => {
  const s = setup({ mime: 'text/html' }); expect((await s.invoke()).status).toBe(500); expect(s.writes).toEqual([]);
});