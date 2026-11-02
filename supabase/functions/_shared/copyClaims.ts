/** Input-only claim guards. Never use generated brief text as evidence. */
const units: Record<string, number> = { zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16, seventeen:17, eighteen:18, nineteen:19, twenty:20, thirty:30, forty:40, fifty:50, sixty:60, seventy:70, eighty:80, ninety:90 };
const numberWord = new RegExp(`\\b(?:${Object.keys(units).join('|')}|hundred|thousand|million)(?:(?:[ -]+)(?:${Object.keys(units).join('|')}|hundred|thousand|million))*\\b`, 'gi');
export function numbersIn(text: string): string[] {
  // Digits glued to a preceding letter are identifiers (S3, EC2, B2B, H264), not claims: they neither
  // authorize nor trigger a number check. "3-minute" next to "S3" must not pass.
  const digits = (text.match(/(?<![A-Za-z])\d[\d,]*(?:\.\d+)?/g) || []).map(n => String(Number(n.replace(/,/g, ''))));
  const words = (text.match(numberWord) || []).map(phrase => {
    let total = 0, group = 0;
    for (const word of phrase.toLowerCase().split(/[ -]+/)) {
      if (word === 'hundred') group = (group || 1) * 100;
      else if (word === 'thousand' || word === 'million') { total += (group || 1) * (word === 'thousand' ? 1000 : 1000000); group = 0; }
      else group += units[word] || 0;
    }
    return String(total + group);
  });
  return [...digits, ...words];
}
export function inputCopyText(input: unknown): string {
  if (typeof input === 'string') return input;
  if (Array.isArray(input)) return input.map(inputCopyText).join(' ');
  if (!input || typeof input !== 'object') return '';
  return Object.entries(input).filter(([key]) => !/brief|communicationStrategy|strategyTrace|messagingChoices|currentContent|sections|marketResearch|intelligenceContext|url|color|font|image|(^|_)(id|score|timestamp|created_at|updated_at)($|_)/i.test(key)).map(([,v]) => typeof v === 'number' ? String(v) : inputCopyText(v)).join(' ');
}
/** Promises the business must make itself: never generated, only quoted. */
const COMMITMENT = /\b(guarantee[ds]?|guaranteeing|money[- ]?back|risk[- ]free|no[- ]risk|warrant(?:y|ies|ied)|or (?:it'?s|your money) free)\b/i;
/**
 * Service promises and trade credentials a page may only repeat, never supply: a local business
 * gets held to "rain delays included" or "licensed and insured". `need` is what the input must say.
 */
const STATED_ONLY: Array<{ re: RegExp; need: RegExp }> = [
  { re: /\brain(?:[- ]or[- ]shine|\s+delays?\s+(?:are\s+|is\s+)?(?:included|covered|made\s+up))/i, need: /rain[- ]or[- ]shine|rain delay/ },
  { re: /\bnever\s+(?:miss(?:es|ed)?|skip(?:s|ped)?)\s+a\s+(?:week|visit|day|appointment|job)\b/i, need: /never (?:miss|skip)/ },
  { re: /\b(?:always|guaranteed)\s+on[- ]time\b|\bon[- ]time,?\s+every\s+time\b/i, need: /on[- ]time/ },
  { re: /\b24\/7\b|\baround[- ]the[- ]clock\b/i, need: /24\/7|around[- ]the[- ]clock|24 hours/ },
  { re: /\bno\s+hidden\s+(?:fees|costs|charges)\b/i, need: /hidden (?:fee|cost|charge)/ },
  { re: /\b(?:fully\s+)?insured\b/i, need: /insur/ },
  { re: /\blicensed\b/i, need: /licens/ },
  { re: /\bbonded\b/i, need: /\bbonded\b/ },
  { re: /\bfamily[- ](?:owned|run)\b/i, need: /family[- ]?(?:owned|run)/ },
  { re: /\blocally[- ]owned\b/i, need: /locally[- ]?owned/ },
];
/** The commitment term in `text` that the user's input never stated, or null. */
export function unsupportedCommitment(text: string, input: unknown): string | null {
  const hit = COMMITMENT.exec(text || '');
  if (hit) {
    const stem = hit[1].toLowerCase().replace(/[^a-z]/g, '').slice(0, 7); // guarant / moneyba / riskfre / warrant
    const source = inputCopyText(input).toLowerCase().replace(/[^a-z]/g, '');
    if (!source.includes(stem)) return hit[1];
  }
  const said = inputCopyText(input).toLowerCase();
  for (const { re, need } of STATED_ONLY) {
    const m = re.exec(text || '');
    if (m && !need.test(said)) return m[0];
  }
  return null;
}
/** "140+" when the input said "140": the stated count, not a bigger one. Leaves "+" the input itself used. */
export function unInflateCounts(text: string, input: unknown): string {
  if (!text || !text.includes('+')) return text;
  const said = inputCopyText(input).replace(/,/g, '');
  return text.replace(/(?<![A-Za-z\d])(\d[\d,]*)\s?\+(?![\d+])/g, (whole, n: string) =>
    said.includes(`${n.replace(/,/g, '')}+`) ? whole : n);
}
/** Adjectives that upgrade a stated count ("38 live customers" from "38 property management companies"). */
const COUNT_QUALIFIERS = 'live|active|happy|satisfied|loyal|paying|enterprise|leading|trusted|thriving|delighted|repeat|returning|long-term';
/** Removes a quality the input never gave a stated count: "38 live customers" -> "38 customers". */
export function unQualifyCounts(text: string, input: unknown): string {
  if (!text || !/\d/.test(text)) return text;
  const said = inputCopyText(input).toLowerCase().replace(/,/g, '');
  return text.replace(new RegExp(`(?<![A-Za-z\\d])(\\d[\\d,]*)\\s+(${COUNT_QUALIFIERS})\\s+`, 'gi'), (whole, n: string, adj: string) =>
    said.includes(`${n.replace(/,/g, '')} ${adj.toLowerCase()}`) ? whole : `${n} `);
}

/** Proof fields: the only answers a proof stat may come from (audience and offer answers describe, they don't prove). */
export const PROOF_FIELDS = ['clientCount', 'client_count', 'yearsInBusiness', 'years_in_business', 'achievements', 'credentials', 'concreteProofStory', 'caseStudyHighlight', 'case_study_highlight', 'testimonialText'];
const tokenRun = (t: string) => (t.toLowerCase().replace(/[’']/g, "'").match(/[a-z0-9$%']+/g) || []);
const runsOf = (t: string, n: number) => { const tk = tokenRun(t); const out = new Set<string>(); for (let i = 0; i + n <= tk.length; i++) out.add(tk.slice(i, i + n).join(' ')); return out; };

/**
 * The brief's proof points are the owner's own proof, word for word: stated
 * counts, years and credentials replace the model's restatement (which dropped
 * qualifiers like "About" or "(TEST DATA)"), and an extra stat survives only
 * if it reuses a proof answer (four words in a row, or the whole answer).
 * An audience range ("200 to 2,000 units") is never promoted to proof.
 */
export function pinStatedProof(brief: Record<string, any>, input: Record<string, any>): void {
  const pp = brief?.proofPoints;
  if (!pp || typeof pp !== 'object') return;
  const stated = (k: string[]) => k.map((f) => input?.[f]).find((v) => typeof v === 'string' && v.trim()) as string | undefined;
  const count = stated(['clientCount', 'client_count']);
  const years = stated(['yearsInBusiness', 'years_in_business']);
  const creds = stated(['achievements', 'credentials']);
  if (count) pp.clientCount = count.trim();
  if (years) pp.yearsInBusiness = years.trim();
  if (creds) pp.achievements = creds.trim();
  if (Array.isArray(pp.otherStats)) {
    const proof = [...PROOF_FIELDS.map((f) => input?.[f]), ...(Array.isArray(input?.objections) ? input.objections.map((o: any) => o?.answer) : [])]
      .filter((v): v is string => typeof v === 'string' && !!v.trim());
    const proofRuns = new Set(proof.flatMap((p) => [...runsOf(p, 4)]));
    const proofWhole = proof.map((p) => tokenRun(p).join(' '));
    pp.otherStats = pp.otherStats.filter((stat: unknown) => {
      if (typeof stat !== 'string') return false;
      const whole = tokenRun(stat).join(' ');
      const keep = proofWhole.some((p) => p.includes(whole) || whole.includes(p)) || [...runsOf(stat, 4)].some((r) => proofRuns.has(r));
      if (!keep) console.log(`🛡️ [brief-guard] Removed proof stat not taken from a proof answer: "${stat.slice(0, 80)}"`);
      return keep;
    });
  }
}

/**
 * Comparisons with competitors ("traditional meal planning apps make you…", "most agencies…")
 * are claims about other businesses. They stay only when the owner made a comparison themselves.
 */
const COMPETITOR_CLAIM = /\b(?:most|many|other|typical|traditional|generic|conventional|existing|legacy|old-school)\s+(?:[a-z-]+\s+){0,2}(?:agencies|firms|consultants|companies|providers|competitors|studios|apps|tools|platforms|services|software|solutions|vendors|crews|contractors|outfits|cleaners|teams)\b|\bcompetitors?\b|\bunlike\s+(?:other|most|typical|traditional)\b/i;
const OWNER_COMPARED = /\b(?:competitors?|other|most|many|typical|traditional|tried|switched|unlike|instead of|rather than|before us|cheap)\b/i;
export function unsupportedComparison(text: string, input: unknown): string | null {
  const hit = COMPETITOR_CLAIM.exec(text || '');
  if (!hit) return null;
  return OWNER_COMPARED.test(inputCopyText(input)) ? null : hit[0];
}

/**
 * The brief writer's working notes are not for the owner: "(the stated client count,
 * verbatim)", "Do not invent ratings…", "Frustration (inferred from solution): …",
 * "Note: Only three pillars are recommended…". Lines and sentences like these are
 * removed from brief prose; an "inferred" line is dropped whole because it is a guess.
 */
const LEAK_LINE = /^.*\((?:[^)]*\b)?inferred\b[^)]*\).*$|^\s*(?:[-*•]\s*)?(?:Note|Notes)\s*:.*$/gim;
const LEAK_SENTENCE = /(?:^|(?<=[.!?]\s))(?:Do not|Don['’]t|Never) (?:invent|fabricate|add|make up|guess)[^.!?\n]*[.!?]?/gi;
const LEAK_PAREN = /\s*\((?:the )?(?:stated|owner['’]s|client['’]s)?[^()]{0,40}\bverbatim\)/gi;
export function stripBriefLeaks(prose: string): { text: string; removed: string[] } {
  const removed: string[] = [];
  const text = (prose || '')
    .replace(LEAK_LINE, (m) => { removed.push(m.trim()); return ''; })
    .replace(LEAK_SENTENCE, (m) => { removed.push(m.trim()); return ''; })
    .replace(LEAK_PAREN, (m) => { removed.push(m.trim()); return ''; })
    .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  return { text, removed };
}

export const OFFER_TERMS = ['No credit card required', 'Free to start', 'Cancel anytime', 'Free consultation', 'No obligation', 'No commitment', 'Pay as you go', 'No contracts'];
export function stripUnsupportedOfferTerms(text: string, input: unknown, removed: string[] = []): string {
  const source = inputCopyText(input).toLowerCase();
  let result = text;
  for (const term of OFFER_TERMS) {
    if (source.includes(term.toLowerCase())) continue;
    result = result.replace(new RegExp(term, 'gi'), hit => { removed.push(hit); return ''; });
  }
  return result.replace(/^[\s•·/—–-]+|[\s•·/—–-]+$/g, '').replace(/(?:\s*[•·/]\s*){2,}/g, ' · ').trim();
}
const structural = /^(step|number|order|version|year|confidence|score|layout|composition|sectionType|type|icon|.*(?:Url|URL|Link|Color|Font|Image|Prompt)|provenance)$/;
export function guardCopyClaims<T>(output: T, input: unknown, label = 'copy-guard'): T {
  const allowed = new Set(numbersIn(inputCopyText(input)));
  const walk = (value: any, path: string, key = ''): any => {
    if (structural.test(key)) return value;
    if (typeof value === 'string') {
      const removed: string[] = [];
      const counted = unQualifyCounts(unInflateCounts(value, input), input);
      if (counted !== value) console.log(`[${label}] Removed "+" from a stated count at ${path}`);
      const terms = stripUnsupportedOfferTerms(counted, input, removed);
      if (removed.length) console.log(`[${label}] Removed unsupported offer terms at ${path}`, JSON.stringify(removed));
      // Discard the whole unsupported sentence/line, never just its number.
      return (terms.match(/[^\n]+(?:\n|$)/g) || []).map(line => {
        // Document/list indices describe structure, not a claim about the client.
        const prefix = line.match(/^(?:#{1,6}\s+)?\d+\.\s+/)?.[0] || '';
        const body = line.slice(prefix.length);
        const guarded = body.split(/(?<=[.!?])(?=\s|$)/).filter(sentence => {
        const promise = unsupportedCommitment(sentence, input);
        if (promise) {
          console.log(`[${label}] Removed unsupported commitment at ${path}`, JSON.stringify({ sentence: sentence.trim(), term: promise }));
          return false;
        }
        const comparison = unsupportedComparison(sentence, input);
        if (comparison) {
          console.log(`[${label}] Removed unstated competitor claim at ${path}`, JSON.stringify({ sentence: sentence.trim(), term: comparison }));
          return false;
        }
        const unknown = numbersIn(sentence).filter(n => !allowed.has(n));
        if (!unknown.length) return true;
        console.log(`[${label}] Removed unsupported numeric copy at ${path}`, JSON.stringify({ sentence: sentence.trim(), numbers: unknown }));
        return false;
        }).join('');
        return guarded.trim() ? prefix + guarded : '';
      }).join('').trim();
    }
    if (Array.isArray(value)) return value.map((v,i) => walk(v, `${path}[${i}]`)).filter(v => v !== '');
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, walk(v, `${path}.${k}`, k)]));
    return value;
  };
  return walk(output, label);
}