import { test, expect } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';

// A local `const X =` inside a component legally shadows an imported X, and a
// loosely-typed argument hides the mismatch from tsc. That shipped a crash:
// Generate.tsx's local buildHeroImagePrompt(industry: string) shadowed the
// imported business-prompt builder and blanked every hero-photo page build.
function importedNames(src) {
  const names = [];
  for (const m of src.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"]/g)) {
    for (const part of m[1].split(',')) {
      const local = part.trim().split(/\s+as\s+/).pop()?.replace(/^type\s+/, '').trim();
      if (local && /^[A-Za-z_$][\w$]*$/.test(local)) names.push(local);
    }
  }
  return names;
}

test('no page or section component shadows one of its own imports with a local const/function', () => {
  const dirs = ['src/pages', 'src/components/sections', 'src/components/public', 'src/components/editor'];
  const hits = [];
  for (const dir of dirs) {
    for (const f of readdirSync(new URL(`../${dir}`, import.meta.url))) {
      if (!/\.tsx?$/.test(f)) continue;
      const src = readFileSync(new URL(`../${dir}/${f}`, import.meta.url), 'utf8');
      for (const name of importedNames(src)) {
        if (new RegExp(`\\b(?:const|let|function)\\s+${name.replace('$', '\\$')}\\s*[=(<]`).test(src)) hits.push(`${dir}/${f}: ${name}`);
      }
    }
  }
  expect(hits).toEqual([]);
});
