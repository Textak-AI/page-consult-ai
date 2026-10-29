import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { consultationObjections } from '../supabase/functions/_shared/buyerObjections.ts';

const source = readFileSync(new URL('../supabase/functions/extract-ai-seo-data/index.ts', import.meta.url), 'utf8');
const executable = new Bun.Transpiler({ loader: 'ts' }).transformSync(source.replace(/^import .*;\r?\n/gm, ''));

async function extract(consultationData, authoritySignals) {
  let handler;
  let saved;
  const logs = [];
  const modelOutput = {
    entity: { type: 'ProfessionalService' },
    authoritySignals,
    faqItems: [],
    queryTargets: [],
    schemaReadiness: { score: 0 },
  };
  runInNewContext(executable, {
    consultationObjections,
    serve: (callback) => { handler = callback; },
    handleCorsPreflightRequest: () => null,
    getCorsHeaders: () => ({}),
    Deno: { env: { get: () => 'test-only' } },
    createClient: () => ({ from: () => ({ update: (value) => {
      saved = value.ai_seo_data;
      return { eq: async () => ({ error: null }) };
    } }) }),
    fetch: async () => ({ ok: true, json: async () => ({ content: [{ text: JSON.stringify(modelOutput) }] }) }),
    console: { log: (...args) => logs.push(args.join(' ')), error: () => {} },
    Response,
  });
  const response = await handler(new Request('http://localhost/extract', {
    method: 'POST',
    headers: { Authorization: 'Bearer test-only', 'Content-Type': 'application/json' },
    body: JSON.stringify({ consultationId: 'test-only', consultationData }),
  }));
  expect(response.status).toBe(200);
  return { returned: (await response.json()).aiSeoData.authoritySignals, saved: saved.authoritySignals, logs };
}

describe('SEO authority signal zero-fabrication guard', () => {
  test('no user numbers: reported fabricated claims are removed before save and return', async () => {
    const result = await extract({ businessName: 'Freight Consulting' }, [
      { raw: '30+ Former freight operations directors', optimized: 'Former freight operations directors' },
      { raw: 'Embedded TMS workflow analysis', optimized: '100% embedded TMS workflow analysis' },
    ]);
    expect(result.returned).toEqual([]);
    expect(result.saved).toEqual([]);
    expect(result.logs.filter((line) => line.startsWith('🛡️ [seo-guard] Removed fabricated authoritySignal — "'))).toHaveLength(2);
  });

  test('string signals with unsupported numbers are removed', async () => {
    const result = await extract({ businessName: 'Freight Consulting' }, ['30+ Former freight operations directors']);
    expect(result.returned).toEqual([]);
  });

  test('all numbers in both raw and optimized must be supplied', async () => {
    const valid = { raw: '30 former directors', optimized: '30+ former directors' };
    const result = await extract({ team: '30 former directors' }, [valid,
      { raw: '100 former directors', optimized: '30 former directors' },
      { raw: '30 former directors', optimized: '100% embedded analysis' },
    ]);
    expect(result.returned).toEqual([valid]);
  });

  test('nested numeric inputs, commas, and decimals match the brief guard', async () => {
    const signals = ['1000 customers', '12.5% improvement'];
    const result = await extract({ proof: { entries: ['1,000 customers', { improvement: 12.5 }] } }, signals);
    expect(result.returned).toEqual(signals);
  });

  test('number-free signals are preserved when user supplies no numbers', async () => {
    const signals = ['Former freight operations directors', { raw: 'Embedded TMS workflow analysis', optimized: 'Embedded TMS workflow analysis' }];
    const result = await extract({ businessName: 'Freight Consulting' }, signals);
    expect(result.returned).toEqual(signals);
  });
});