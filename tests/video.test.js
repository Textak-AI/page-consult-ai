import { test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { parseVideoLink, videoFileError, usableVideo, usableBackgroundVideo, canAttachVideo, VIDEO_RULES } from '../src/lib/video';
import { ADDABLE_SECTION_TYPES, buildSectionContent } from '../src/lib/editor/sectionFactory';
const src = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const ORIGIN = 'https://proj.supabase.co';
const up = (extra = {}) => ({ source: 'upload', url: `${ORIGIN}/storage/v1/object/public/brand-assets/u1/videos/a.mp4`, storagePath: 'u1/videos/a.mp4', mime: 'video/mp4', ...extra });

test('links: supported hosts become privacy-friendly embeds; anything else is refused', () => {
  expect(parseVideoLink('https://www.youtube.com/watch?v=dQw4w9WgXcQ').embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0');
  expect(parseVideoLink('youtu.be/dQw4w9WgXcQ').provider).toBe('youtube');
  expect(parseVideoLink('https://youtube.com/shorts/dQw4w9WgXcQ').embedUrl).toContain('/embed/dQw4w9WgXcQ');
  expect(parseVideoLink('https://vimeo.com/76979871').embedUrl).toBe('https://player.vimeo.com/video/76979871?dnt=1');
  expect(parseVideoLink('https://www.loom.com/share/abc123def456').embedUrl).toBe('https://www.loom.com/embed/abc123def456');
  expect(parseVideoLink('https://acme.wistia.com/medias/abc123xyz').embedUrl).toBe('https://fast.wistia.net/embed/iframe/abc123xyz');
  expect(parseVideoLink('https://evil.example/video.mp4')).toBeNull();
  expect(parseVideoLink('javascript:alert(1)')).toBeNull();
  expect(parseVideoLink('https://youtube.com/watch?v=<script>')).toBeNull();
});

test('uploads: type and size checked before upload', () => {
  expect(videoFileError({ type: 'video/mp4', size: 10 })).toBeNull();
  expect(videoFileError({ type: 'video/quicktime', size: 10 })).toBeNull();
  expect(videoFileError({ type: 'video/x-msvideo', size: 10 })).toMatch(/MP4, MOV or WebM/);
  expect(videoFileError({ type: 'video/mp4', size: VIDEO_RULES.maxBytes + 1 })).toMatch(/50 MB/);
});

test('only our own storage or a re-parsed link renders; stored embed URLs are never trusted', () => {
  expect(usableVideo(up(), ORIGIN)?.source).toBe('upload');
  expect(usableVideo(up({ url: 'https://elsewhere.com/a.mp4' }), ORIGIN)).toBeNull();
  expect(usableVideo(up({ mime: 'text/html' }), ORIGIN)).toBeNull();
  expect(usableVideo({ source: 'link', url: 'https://vimeo.com/76979871', embedUrl: 'https://evil.example' }, ORIGIN).embedUrl).toBe('https://player.vimeo.com/video/76979871?dnt=1');
  expect(usableVideo(null, ORIGIN)).toBeNull();
  expect(usableVideo(up({ lowerThird: { name: ' Kyle Moyer ', role: '' } }), ORIGIN).lowerThird).toEqual({ name: 'Kyle Moyer', role: undefined });
  expect(usableVideo(up({ lowerThird: { name: '', role: '' } }), ORIGIN).lowerThird).toBeNull();
  expect(usableVideo(up({ poster: 'https://elsewhere.com/p.jpg' }), ORIGIN).poster).toBeNull();
});

test('hero background takes uploads only', () => {
  expect(usableBackgroundVideo(up(), ORIGIN)).not.toBeNull();
  expect(usableBackgroundVideo({ source: 'link', url: 'https://vimeo.com/76979871' }, ORIGIN)).toBeNull();
});

test('three placements are wired in both renderers', () => {
  expect(ADDABLE_SECTION_TYPES.map((t) => t.type)).toContain('video');
  expect(buildSectionContent('video', null)).toEqual({ heading: '[What this video shows]', body: '', video: null });
  expect(canAttachVideo('features')).toBe(true);
  expect(canAttachVideo('hero')).toBe(false);
  expect(canAttachVideo('video')).toBe(false);
  const pub = src('src/components/public/PublicPageRenderer.tsx');
  expect(pub).toMatch(/case 'video':/);
  expect(pub.match(/\{attached\}/g).length).toBe(2);
  const live = src('src/components/editor/LivePreview.tsx');
  expect(live).toMatch(/case 'video':/);
  expect(live).toMatch(/<AttachedVideo content=/);
  expect(live).toMatch(/<VideoSheet/);
  expect(src('src/components/sections/hero/HeroCenteredType.tsx')).toMatch(/usableBackgroundVideo\(content\.backgroundVideo/);
  expect(src('src/components/sections/hero/HeroSplitPhoto.tsx')).toMatch(/usableBackgroundVideo\(content\.backgroundVideo/);
});

test('video section hides on published pages until a real video is attached', async () => {
  const { hiddenReason } = await import('../src/lib/editor/emptySections');
  expect(hiddenReason({ type: 'video', content: { video: null } })).toMatch(/until you add a video/);
  expect(hiddenReason({ type: 'video', content: { video: { source: 'link', url: 'https://vimeo.com/76979871' } } })).toBeNull();
  expect(src('src/components/sections/VideoSection.tsx')).toMatch(/if \(!video && !editor\) return null;/);
});

test('background video respects reduced motion and never autoplays with sound', () => {
  const bg = src('src/components/video/BackgroundVideo.tsx');
  expect(bg).toMatch(/prefers-reduced-motion: reduce/);
  expect(bg).toMatch(/saveData/);
  expect(bg).toMatch(/\bmuted\b/);
  const player = src('src/components/video/PageVideoPlayer.tsx');
  expect(player).not.toMatch(/autoPlay/);
  expect(player).toMatch(/youtube|PROVIDER_NAME/);
});

test('uploads go to the owner\'s own folder', () => {
  expect(src('src/lib/editor/videoUpload.ts')).toMatch(/`\$\{user\.id\}\/videos\/\$\{id\}\.\$\{ext\}`/);
});
