import { describe, it, expect } from 'vitest';
import { MOTION } from '../src/lib/motion/tokens';
import { GAZE_MAPS } from '../src/lib/motion/gazeMap';
describe('motion tokens', () => {
  it('durations are 300/400/500ms', () => expect(MOTION.duration).toEqual({ sm: 0.3, md: 0.4, lg: 0.5 }));
  it('stagger is 100ms', () => expect(MOTION.stagger).toBe(0.1));
  it('distance within 16-24px', () => { expect(MOTION.distance).toBeGreaterThanOrEqual(16); expect(MOTION.distance).toBeLessThanOrEqual(24); });
  it('hero gaze order', () => expect(GAZE_MAPS.hero).toEqual(['headline','subheadline','primaryCta','secondaryCta','trustLine']));
  it('final-cta gaze order', () => expect(GAZE_MAPS['final-cta']).toEqual(['headline','button']));
});
