import { test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { BUYER_TYPE_LABELS, buyerTypeLabel, toBuyerTypeId } from '../src/lib/buyerTypeLabels';
const root = new URL('..', import.meta.url).pathname;
const src = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const grep = (cmd) => execSync(`${cmd} || true`, { cwd: root }).toString().trim();

const ARCHETYPE_NAMES = ['Analytical Validator', 'Emotional Connector', 'Decisive Commander', 'Cautious Researcher'];

test('one plain label per buyer type, keyed by the existing archetype ids', () => {
  expect(BUYER_TYPE_LABELS).toEqual({
    analytical_validator: 'Wants evidence before they talk to you',
    emotional_connector: 'Needs to feel understood first',
    decisive_commander: 'Wants the outcome and the next step, fast',
    cautious_researcher: 'Takes time and checks everything',
  });
});

test('both identifier forms resolve to the same label; unknown ids never echo the raw id', () => {
  expect(toBuyerTypeId('Analytical Validator')).toBe('analytical_validator');
  expect(buyerTypeLabel('Emotional Connector')).toBe(BUYER_TYPE_LABELS.emotional_connector);
  expect(buyerTypeLabel('decisive_commander')).toBe(BUYER_TYPE_LABELS.decisive_commander);
  expect(buyerTypeLabel('Cautious-Researcher')).toBe(BUYER_TYPE_LABELS.cautious_researcher);
  expect(buyerTypeLabel(undefined)).toBe('How your buyer decides');
  expect(buyerTypeLabel('Mystery Type')).toBe('How your buyer decides');
  for (const label of Object.values(BUYER_TYPE_LABELS)) {
    for (const name of ARCHETYPE_NAMES) expect(label).not.toContain(name);
  }
});

test('screens that show a buyer type go through the shared map, not the archetype name', () => {
  const panel = src('src/components/consultation/MessagingArchitecturePanel.tsx');
  expect(panel).toMatch(/buyerTypeLabel\(messagingArchitecture\.archetype\)/);
  expect(panel).not.toMatch(/\{messagingArchitecture\.archetype\}/);
  expect(panel).not.toMatch(/Your buyer is \$\{article\} \$\{arch\.archetype\}/);
  expect(panel).not.toMatch(/SDI Layer/);
  const doc = src('src/pages/StrategyDocument.tsx');
  expect(doc).toMatch(/buyerTypeLabel\(archetype\.primary\)/);
  expect(doc).not.toMatch(/\{archetype\.label\}/);
});

test('"PageConsult Method" is gone from the app', () => {
  expect(grep("grep -rl 'PageConsult Method' src")).toBe('');
});

test('no user-visible "Blueprint": it is the Strategy Brief everywhere', () => {
  // Word-boundary match: identifiers like strategyBlueprintColorMode are not user-visible.
  expect(grep("grep -rnwi 'blueprints\\?' src")).toBe('');
  expect(src('src/utils/exportStrategyPdf.ts')).toMatch(/-strategy-brief\.pdf/);
  expect(src('src/pages/StrategyDocument.tsx')).toMatch(/PageConsult AI by Hyperbrand Creative, Ltd/);
});

test('no "Pillar" labels in UI text', () => {
  // Quoted strings or JSX text containing the word; property names like messagingPillars are fine.
  const hits = grep(`grep -rnE "(['\\"\\\`>]|^\\s+)[^'\\"\\\`<{}]*\\bPillars?\\b" src --include=*.tsx --include=*.ts`)
    .split('\n').filter((l) => l && !/^\S+:\d+:\s*(\/\/|\*|\/\*)/.test(l));
  expect(hits).toEqual([]);
  expect(src('src/components/consultation/IntelligenceProfileWizard.tsx')).not.toMatch(/Pillar/);
  expect(src('src/components/consultation/IntelligenceProfileDemo.tsx')).not.toMatch(/Pillar/);
});

test('archetype names never render in .tsx text (logs and internal maps excepted)', () => {
  const lines = grep(`grep -rnE "${ARCHETYPE_NAMES.join('|')}" src --include=*.tsx`).split('\n').filter(Boolean);
  const visible = lines.filter((l) => {
    const code = l.replace(/^\S+:\d+:/, '');
    if (/^\s*(\/\/|\*|\/\*)/.test(code)) return false;           // comments / doc blocks
    if (/console\.(log|warn|error|info|debug)/.test(code)) return false;
    if (/^\s*'[A-Z][a-z]+ [A-Z][a-z]+':\s/.test(code)) return false; // keys of internal lookup maps
    if (/ARCHETYPE_META\[/.test(code)) return false;                 // lookup by id
    return true;
  });
  expect(visible).toEqual([]);
});

test('framework jargon is gone from the owner screens touched in the plain-vocabulary pass', () => {
  const doc = src('src/pages/StrategyDocument.tsx');
  for (const term of ['Intelligence Score', 'Strategic Design Intelligence', '(SDI)', '™', 'Schwartz Framework', 'Buyer Archetype Assignment</span>', 'Primary Archetype']) {
    expect(doc).not.toContain(term);
  }
  expect(src('src/components/consultation/MessagingArchitecturePanel.tsx')).not.toMatch(/>\s*Messaging Architecture\s*</);
  expect(src('src/components/wizard/IntelligencePanel.tsx')).not.toContain('Intelligence Score');
  expect(src('src/components/demo/FocusModeOverlay.tsx')).not.toContain('Intelligence Score');
  expect(src('src/pages/EnhancedBrandSetup.tsx')).not.toContain('Intelligence Score');
  expect(src('src/utils/exportStrategyPdf.ts')).not.toContain('Intelligence Score');
  expect(grep("grep -rl 'Discovery Protocol' src")).toBe('');
  const pdf = src('src/components/export/StrategyBriefPDF.tsx');
  expect(pdf).not.toMatch(/MESSAGING (ARCHITECTURE|PILLARS)/);
  expect(pdf).not.toMatch(/recommend testing/);
});
