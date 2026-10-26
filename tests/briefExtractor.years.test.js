// ============= briefExtractor: yearsInBusiness honesty =============
import { describe, expect, test } from 'bun:test';
import { extractAuthoritySignals } from '../src/lib/briefExtractor';

const credentialSignal = (yearsInBusiness) =>
  extractAuthoritySignals({ yearsInBusiness }, null).find((s) => s.type === 'credential');

describe('extractAuthoritySignals yearsInBusiness', () => {
  test('"Since 2012" keeps the user\'s words verbatim with no invented label', () => {
    const signal = credentialSignal('Since 2012');
    expect(signal).toBeDefined();
    expect(signal.value).toBe('Since 2012');
    expect(signal.label).toBe('');
    expect(`${signal.value} ${signal.label}`.trim()).not.toBe('2012 Years Experience');
  });

  test('"12 years" is an actual year-count and keeps the Years Experience label', () => {
    const signal = credentialSignal('12 years');
    expect(signal.value).toBe('12');
    expect(signal.label).toBe('Years Experience');
  });

  test('"5+ years" keeps the plus sign and the label', () => {
    const signal = credentialSignal('5+ years');
    expect(signal.value).toBe('5+');
    expect(signal.label).toBe('Years Experience');
  });

  test('other non-count shapes never get the Years Experience label', () => {
    const signal = credentialSignal('Est. 2012');
    expect(signal.value).toBe('Est. 2012');
    expect(signal.label).toBe('');
  });

  test('"Just started" (no digits) produces no credential signal', () => {
    expect(credentialSignal('Just started')).toBeUndefined();
  });
});
