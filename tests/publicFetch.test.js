import { test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { publicUrl } from '../supabase/functions/_shared/publicFetch';
const src = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

test('public sites pass, normalized to https when no scheme', () => {
  expect(publicUrl('hyperbrand.ai')).toBe('https://hyperbrand.ai/');
  expect(publicUrl('http://example.com/about')).toBe('http://example.com/about');
  expect(publicUrl('https://8.8.8.8/')).toBe('https://8.8.8.8/');
});

test('internal, private and odd addresses are refused', () => {
  for (const u of ['http://localhost:54321', 'http://127.0.0.1', 'http://10.0.0.5', 'http://192.168.1.1', 'http://172.20.1.1',
    'http://169.254.169.254/latest/meta-data', 'http://[::1]/', 'http://intranet', 'http://db.internal', 'http://2130706433',
    'http://0x7f000001', 'https://user:pw@example.com', 'https://example.com:8080', 'ftp://example.com', 'file:///etc/passwd', '']) {
    expect(publicUrl(u)).toBeNull();
  }
});

test('visitor-typed URL functions use the guarded fetch', () => {
  for (const f of ['analyze-website', 'extract-brand', 'extract-website-intelligence']) {
    const s = src(`supabase/functions/${f}/index.ts`);
    expect(s).toMatch(/publicUrl\(/);
    expect(s).not.toMatch(/await fetch\((normalizedUrl|cssUrl)/);
  }
  expect(src('supabase/functions/analyze-website/index.ts')).toMatch(/rateLimit\(service, req, 'analyze-website', 10\)/);
});
