import { test, expect } from 'bun:test';
import { isClientVoiceDescription, extractAuthoritySignals } from '../src/lib/briefExtractor';

test('owner-described client sentiment is flagged as paraphrase, real quotes are not', () => {
  expect(isClientVoiceDescription('Clients typically say we are the first consultants who stayed on the phone.')).toBe(true);
  expect(isClientVoiceDescription('What our customers say about us is that we never disappear.')).toBe(true);
  expect(isClientVoiceDescription('They tell us the process finally made sense.')).toBe(true);
  expect(isClientVoiceDescription('Working with TrueNorth was the best decision we made all year.')).toBe(false);
  expect(isClientVoiceDescription('The first consultants who stayed on the phone through FDA questions.')).toBe(false);
  expect(isClientVoiceDescription('')).toBe(false);
});

test('AI-SEO authority signals only chip texts that lead with their number', () => {
  const signals = extractAuthoritySignals({}, {
    authoritySignals: [
      'Founded by former FDA reviewers with 10 years of experience inside the agency reviewing 510(k) submissions',
      '31 devices cleared',
    ],
  });
  const values = signals.map(s => s.value);
  expect(values).toContain('31');
  expect(values).not.toContain('10');
  const chip = signals.find(s => s.value === '31');
  expect(chip.label).toBe('devices cleared');
  // No label may be a de-numbered sentence fragment
  for (const s of signals) expect(s.label.includes('  ')).toBe(false);
});

test('a long sentence whose number leads but whose label is a paragraph is still skipped', () => {
  const signals = extractAuthoritySignals({}, {
    authoritySignals: ['10 years of combined regulatory affairs experience across medical device, diagnostics and combination products'],
  });
  expect(signals.length).toBe(0);
});
