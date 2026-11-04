import { test, expect } from 'bun:test';
import { selectBestHeadline } from '../src/lib/briefExtractor.ts';
import { buildStrategyTrace } from '../src/lib/strategyTrace.ts';

const headlines = { optionA: 'Benefit A', optionB: 'Problem B', optionC: 'Outcome C' };

// 4DHB run (Nov 4): goal "sales" picked the outcome headline while the scored choice was problem-led,
// so the record said "opens with the problem" about a page that opened with the result.
test('the scored headline choice beats the page goal', () => {
  expect(selectBestHeadline(headlines, 'sales', undefined, 'problem-led').primary).toBe('Problem B');
  expect(selectBestHeadline(headlines, 'generate-leads', undefined, 'outcome-led').primary).toBe('Outcome C');
  expect(selectBestHeadline(headlines, 'sales', undefined, null).primary).toBe('Outcome C');
  expect(selectBestHeadline({ ...headlines, optionB: '' }, 'sales', undefined, 'problem-led').primary).toBe('Outcome C');
});

test('the record names the opening the hero really has, or nothing', () => {
  const brief = { headlines, communicationStrategy: { arcEmphasis: 'problem-led', provenance: { arcEmphasis: ['messagingChoices.headlineFocus'] } } };
  const outcomeHero = buildStrategyTrace({ answers: {}, brief, sections: [{ type: 'hero', content: { headline: 'Outcome C' } }] });
  expect(outcomeHero.opening?.label).toBe('Opens with the result they want');
  expect(outcomeHero.opening?.because).toBe('Chosen for the goal you set for the page.');
  const problemHero = buildStrategyTrace({ answers: {}, brief, sections: [{ type: 'hero', content: { headline: 'Problem B' } }] });
  expect(problemHero.opening?.label).toBe('Opens with the problem they have now');
  const edited = buildStrategyTrace({ answers: {}, brief, sections: [{ type: 'hero', content: { headline: 'Something the owner typed' } }] });
  expect(edited.opening).toBeNull();
});
