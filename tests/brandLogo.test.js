import { test, expect } from 'bun:test';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
const root = new URL('../', import.meta.url).pathname;
const files = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? files(p) : [p]; });

test('one logo family: every app logo spot uses public/brand', () => {
  const src = files(join(root, 'src')).filter((f) => /\.(tsx?|css)$/.test(f)).map((f) => readFileSync(f, 'utf8')).join('\n');
  expect(src).not.toMatch(/whiteAsset_|pageconsult-logo|PageConsultLogo/);
  for (const f of ['brand/pageconsult-lockup.svg', 'brand/pageconsult-icon.svg', 'brand/pageconsult-lockup.png', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png']) {
    expect(existsSync(join(root, 'public', f))).toBe(true);
  }
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  expect(html).toMatch(/href="\/favicon\.svg"/);
  expect(html).toMatch(/apple-touch-icon/);
});

test('logo SVGs are one colour (final file, Oct 31) and say PageConsult', () => {
  for (const f of ['brand/pageconsult-lockup.svg', 'brand/pageconsult-icon.svg', 'favicon.svg']) {
    const s = readFileSync(join(root, 'public', f), 'utf8');
    const colours = new Set((s.match(/#[0-9a-fA-F]{6}/g) || []).map((c) => c.toLowerCase()));
    colours.delete('#ffffff');
    expect(s).not.toMatch(/<rect/); // the source artboard carried a stray black box
    expect([...colours]).toEqual(['#00b6d5']);
    expect(s).toMatch(/aria-label="PageConsult"/);
  }
});
