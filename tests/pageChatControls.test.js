import { test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { EDITOR_CONTROLS, copyOnly, mergeCopy, CHAT_ADDABLE_TYPES } from '../supabase/functions/_shared/pageChat';
const s = readFileSync(new URL('../supabase/functions/_shared/pageChat.ts', import.meta.url), 'utf8');

test('Page Chat only points to editor controls that exist', () => {
  expect(s).toMatch(/The editor's controls are exactly: \$\{EDITOR_CONTROLS\}/);
  expect(s).toMatch(/You never attach or upload media yourself/);
  expect(EDITOR_CONTROLS).toMatch(/Video section/);
  expect(EDITOR_CONTROLS).toMatch(/background video upload/);
});

test('Page Chat never sees or rewrites video data, and cannot add the upload-only Video section', () => {
  const content = { heading: 'Watch', attachedVideo: { source: 'upload', url: 'https://x/v.mp4', lowerThird: { name: 'Kyle' } } };
  expect(copyOnly(content)).toEqual({ heading: 'Watch' });
  const merged = mergeCopy(content, { heading: 'See it', attachedVideo: null, lowerThird: { name: 'X' } });
  expect(merged.attachedVideo).toEqual(content.attachedVideo);
  expect(merged.lowerThird).toBeUndefined();
  expect(CHAT_ADDABLE_TYPES).not.toContain('video');
});
