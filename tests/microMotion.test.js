import { test, expect } from 'bun:test';
import { parseStatNumber, easeOutCubic, MICRO } from '../src/lib/motion/micro';

test('parseStatNumber handles sourced stat shapes', () => {
  expect(parseStatNumber('54 migrations')).toEqual({ prefix: '', num: 54, raw: '54', suffix: ' migrations' });
  expect(parseStatNumber('$425')).toEqual({ prefix: '$', num: 425, raw: '425', suffix: '' });
  expect(parseStatNumber('2,800+')).toEqual({ prefix: '', num: 2800, raw: '2,800', suffix: '+' });
  expect(parseStatNumber('41 min earlier')).toEqual({ prefix: '', num: 41, raw: '41', suffix: ' min earlier' });
});

test('non-numeric or zero stats stay static (no animation target)', () => {
  expect(parseStatNumber('Zero missed paydays')).toBe(null);
  expect(parseStatNumber('')).toBe(null);
  expect(parseStatNumber('0')).toBe(null);
});

test('easeOutCubic is monotonic from 0 to 1', () => {
  expect(easeOutCubic(0)).toBe(0);
  expect(easeOutCubic(1)).toBe(1);
  expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  expect(MICRO.magnet.maxShift).toBeLessThanOrEqual(8); // the ask leans, never jumps
});
