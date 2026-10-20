import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

// Exercise the actual Gate 0 prelude with a closure created before router state arrives.
const source = readFileSync(new URL('../src/pages/Generate.tsx', import.meta.url), 'utf8');
const start = source.indexOf('    // Read current navigation data even when');
const end = source.indexOf('\n    try {', start);
if (start < 0 || end < 0) throw new Error('Gate 0 prelude not found');
const makeGate = new Function(
  'locationStateRef', 'effectiveNavState', 'isStructuredBriefContent',
  'fromStrategicConsultation', 'preGeneratedContent', 'intelligence', 'console',
  `return (consultationData) => {
    ${source.slice(start, end).replace('const gate0StrategicData: any', 'const gate0StrategicData')}
    return { candidateBrief, candidateBriefValid, candidateBriefSource };
  };`,
);
const brief = {
  headlines: { optionA: 'User headline' }, messagingPillars: [], proofPoints: {},
  pageStructure: ['hero', 'process', 'testimonials', 'credentials', 'cta-final'],
};
const valid = (value) =>
  ['headlines', 'messagingPillars', 'proofPoints', 'pageStructure'].every(key => key in value);
const gate = (ref, snapshot = null) =>
  makeGate(ref, snapshot, valid, false, null, null, { log() {} });

describe('initial-generation brief race', () => {
  test('the mount closure sees the brief arriving in current router state', () => {
    const ref = { current: null };
    const initialGeneration = gate(ref);
    ref.current = { strategicData: { structuredBrief: brief } };
    const result = initialGeneration({ structuredBrief: null });
    expect(result.candidateBrief).toBe(brief);
    expect(result.candidateBriefValid).toBe(true);
    expect(result.candidateBriefSource).toBe('navState');
    expect(result.candidateBrief.pageStructure).toHaveLength(5);
  });
  test('a string remains invalid and is not replaced by a valid data brief', () => {
    const result = gate({ current: { strategicData: { structuredBrief: 'markdown' } } })({ structuredBrief: brief });
    expect(result.candidateBrief).toBe('markdown');
    expect(result.candidateBriefValid).toBe(false);
  });
  test('absent router state preserves the session snapshot fallback', () => {
    expect(gate({ current: null }, { strategicData: { structuredBrief: brief } })({}).candidateBrief).toBe(brief);
  });
  test('null navigation brief preserves the saved consultation fallback', () => {
    const result = gate({ current: { strategicData: { structuredBrief: null } } })({ structuredBrief: brief });
    expect(result.candidateBrief).toBe(brief);
    expect(result.candidateBriefSource).toBe('consultationData');
  });
});