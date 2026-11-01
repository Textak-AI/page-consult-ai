import { describe, expect, test } from 'bun:test';
import { readFileSync, readdirSync } from 'fs';

// preview_links.token is VARCHAR(12); a longer token fails the insert and Preview/Share break for every new page.
describe('preview link tokens', () => {
  test('generated token fits the preview_links.token column', async () => {
    const { generatePreviewToken } = await import('../src/lib/editor/previewLink.ts').catch(() => ({}));
    const src = readFileSync('src/lib/editor/previewLink.ts', 'utf8');
    const len = Number(src.match(/generatePreviewToken\(length = (\d+)\)/)[1]);
    const mig = readdirSync('supabase/migrations').map((f) => readFileSync(`supabase/migrations/${f}`, 'utf8')).join('\n');
    const col = Number((mig.match(/token VARCHAR\((\d+)\) UNIQUE NOT NULL/) || [])[1]);
    expect(col).toBeGreaterThan(0);
    expect(len).toBeLessThanOrEqual(col);
    if (generatePreviewToken) expect(generatePreviewToken().length).toBe(len);
  });
});
