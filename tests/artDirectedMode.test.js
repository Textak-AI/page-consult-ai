import { test, expect } from 'bun:test';
import { artDirectedMode } from '../src/lib/artDirectorBrief';

test('light/tinted-led background plan makes the page light', () => {
  const secs = [
    { content: { sectionBackground: 'light' } },
    { content: { sectionBackground: 'tinted' } },
    { content: {} },
    { content: { sectionBackground: 'dark' } },
  ];
  expect(artDirectedMode(secs)).toBe('light');
});

test('majority-dark plan stays dark', () => {
  const secs = [
    { content: { sectionBackground: 'dark' } },
    { content: { sectionBackground: 'dark' } },
    { content: { sectionBackground: 'light' } },
  ];
  expect(artDirectedMode(secs)).toBe('dark');
});

test('no declared backgrounds yields null so SDI decides (legacy pages unchanged)', () => {
  expect(artDirectedMode([{ content: {} }, { content: { mode: 'dark' } }])).toBe(null);
  expect(artDirectedMode([])).toBe(null);
});
