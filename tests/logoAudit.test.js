import { describe, it, expect } from 'vitest';
import { judgeLogo, judgeLogoUrl } from '../src/lib/logoAudit';

const px = (pixels) => new Uint8ClampedArray(pixels.flat());
const U = 'https://example.com/logo.png';

describe('logo audit', () => {
  it('missing URL fails', () => expect(judgeLogoUrl(null).reason).toBe('missing'));
  it('og-image URL is not a logo', () => expect(judgeLogoUrl('https://hyperbrandcreative.com/og-image.png').reason).toBe('social-preview-image'));
  it('1×1 tracking pixel fails', () => expect(judgeLogo({ url: U, width: 1, height: 1 }).reason).toBe('too-small'));
  it('32×32 favicon fails', () => expect(judgeLogo({ url: U, width: 32, height: 32 }).reason).toBe('too-small'));
  it('48×48 favicon fails', () => expect(judgeLogo({ url: U, width: 48, height: 48 }).reason).toBe('too-small'));
  it('64×64 icon mark passes', () => expect(judgeLogo({ url: U, width: 64, height: 64 }).ok).toBe(true));
  it('160×32 wordmark passes', () => expect(judgeLogo({ url: U, width: 160, height: 32 }).ok).toBe(true));
  it('1200×630 social card fails', () => expect(judgeLogo({ url: U, width: 1200, height: 630 }).reason).toBe('social-preview-image'));
  it('fully transparent fails', () =>
    expect(judgeLogo({ url: U, width: 100, height: 40, pixels: px([[0, 0, 0, 0], [9, 9, 9, 0]]) }).reason).toBe('fully-transparent'));
  it('opaque single colour fails', () =>
    expect(judgeLogo({ url: U, width: 100, height: 40, pixels: px([[200, 200, 200, 255], [205, 202, 199, 255]]) }).reason).toBe('solid-color'));
  it('single-colour shape on transparency passes', () =>
    expect(judgeLogo({ url: U, width: 100, height: 40, pixels: px([[0, 0, 0, 255], [0, 0, 0, 0]]) }).ok).toBe(true));
  it('SVG without intrinsic size passes size rule', () =>
    expect(judgeLogo({ url: 'https://x.com/logo.svg', width: 0, height: 0, isVector: true }).ok).toBe(true));
});
