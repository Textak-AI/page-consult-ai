import { describe, it, expect } from 'vitest';
import { cleanTheme, resolveColors, themeFontCss, fontIdFromStack } from '../src/lib/editor/pageTheme';

describe('page theme overrides', () => {
  it('owner colour wins over the page/brand colour', () => {
    expect(resolveColors({ primaryColor: '#112233' }, { primary: '#ffffff', secondary: '#000000' })).toEqual({ primary: '#112233', secondary: '#000000' });
  });
  it('no override keeps the existing colour', () => {
    expect(resolveColors({}, { primary: '#abcdef' }).primary).toBe('#abcdef');
  });
  it('drops fonts outside the curated list and invalid colours', () => {
    expect(cleanTheme({ headingFont: 'comic-sans', bodyFont: 'inter', primaryColor: 'red' })).toEqual({ bodyFont: 'inter' });
  });
  it('no font CSS when nothing is chosen', () => expect(themeFontCss('.x', {})).toBe(''));
  it('heading font CSS targets headings in scope', () => {
    expect(themeFontCss('.x', { headingFont: 'playfair-display' })).toContain('"Playfair Display"');
  });
  it('seeds font id from a stack', () => expect(fontIdFromStack('"DM Sans", system-ui')).toBe('dm-sans'));
});
