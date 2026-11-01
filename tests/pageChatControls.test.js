import { test, expect } from 'bun:test';
import { readFileSync } from 'fs';
const s = readFileSync(new URL('../supabase/functions/_shared/pageChat.ts', import.meta.url), 'utf8');

test('Page Chat only points to editor controls that exist, and says video is not supported', () => {
  const list = s.match(/export const EDITOR_CONTROLS = '([^']+)'/)[1];
  expect(list).not.toMatch(/video/i);
  expect(s).toMatch(/The editor's controls are exactly: \$\{EDITOR_CONTROLS\}/);
  expect(s).toMatch(/for example video\), say plainly that the editor doesn't support it yet/);
});
