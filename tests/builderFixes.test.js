import { test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { buildPageChatSystemPrompt } from '../supabase/functions/_shared/pageChat';
const src = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

test('section AI button routes to Page Chat when the editor provides it', () => {
  expect(src('src/components/editor/LivePreview.tsx')).toMatch(/if \(onAskPageChat\) \{ onAskPageChat\(index, type\); return; \}/);
  expect(src('src/pages/Generate.tsx')).toMatch(/onAskPageChat=\{handleAskPageChat\}/);
});

test('Page Chat prompt: focus names the section; judgment lines must be stated', () => {
  const p = buildPageChatSystemPrompt({ businessName: 'X', sections: [{ index: 0, type: 'hero', content: {} }, { index: 1, type: 'faq', content: {} }], addable: [], brief: {}, ownerInput: {}, focusIndex: 1 });
  expect(p).toContain('FOCUS: the owner is asking about section 1 (faq)');
  expect(p).toMatch(/who it is NOT for/);
  expect(buildPageChatSystemPrompt({ businessName: 'X', sections: [], addable: [], brief: {}, ownerInput: {}, focusIndex: 7 })).not.toContain('FOCUS');
});

test('old section rewrite is guarded server-side', () => {
  expect(src('supabase/functions/modify-section/index.ts')).toMatch(/guardCopyClaims\(JSON\.parse\(cleanedResponse\)/);
});

test('publishing never silently loses the published state on a slug clash', () => {
  const s = src('src/components/editor/PublishModal.tsx');
  expect(s).toMatch(/lpError/);
  expect(s).toMatch(/retrying without slug/);
});

test('functions.invoke callers never pass a Content-Type header (supabase-js then sends the body unserialized)', () => {
  for (const f of ['src/components/editor/ImagePicker.tsx', 'src/lib/industryInsights.ts']) {
    expect(src(f)).not.toMatch(/getAuthHeaders/);
  }
});

test('Preview opens a preview-link token, never a slug; tokens come from crypto', () => {
  const g = src('src/pages/Generate.tsx');
  expect(g).not.toMatch(/\/preview\/\$\{pageData\.slug\}/);
  expect(g).toMatch(/getOrCreatePreviewLink\(pageData\.id\)/);
  const l = src('src/lib/editor/previewLink.ts');
  expect(l).toMatch(/crypto\.getRandomValues/);
  expect(src('src/components/editor/SharePreviewModal.tsx')).not.toMatch(/Math\.random/);
});

test('section rewrite goes through Page Chat; hero and closing CTA cannot be deleted', () => {
  expect(src('src/pages/Generate.tsx')).toMatch(/prefill: 'Rewrite this section using only my brief and answers\.'/);
  const m = src('src/components/editor/SectionManager.tsx');
  expect(m).toMatch(/disabled=\{pinned\}/);
  expect(m).not.toMatch(/section regenerated/);
});
