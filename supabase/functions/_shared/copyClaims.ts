/** Input-only claim guards. Never use generated brief text as evidence. */
const units: Record<string, number> = { zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16, seventeen:17, eighteen:18, nineteen:19, twenty:20, thirty:30, forty:40, fifty:50, sixty:60, seventy:70, eighty:80, ninety:90 };
const numberWord = new RegExp(`\\b(?:${Object.keys(units).join('|')}|hundred|thousand|million)(?:(?:[ -]+)(?:${Object.keys(units).join('|')}|hundred|thousand|million))*\\b`, 'gi');
export function numbersIn(text: string): string[] {
  const digits = (text.match(/\d[\d,]*(?:\.\d+)?/g) || []).map(n => String(Number(n.replace(/,/g, ''))));
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
  return Object.entries(input).filter(([key]) => !/brief|communicationStrategy|currentContent|sections|marketResearch|intelligenceContext|(^|_)(id|score|timestamp|created_at|updated_at)($|_)/i.test(key)).map(([,v]) => typeof v === 'number' ? String(v) : inputCopyText(v)).join(' ');
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
      const terms = stripUnsupportedOfferTerms(value, input, removed);
      if (removed.length) console.log(`[${label}] Removed unsupported offer terms at ${path}`, JSON.stringify(removed));
      // Discard the whole unsupported sentence/line, never just its number.
      return (terms.match(/[^\n]+(?:\n|$)/g) || []).map(line => (line.match(/[^.!?]+(?:[.!?](?=\s|$)|$)/g) || [line]).filter(sentence => {
        const unknown = numbersIn(sentence).filter(n => !allowed.has(n));
        if (!unknown.length) return true;
        console.log(`[${label}] Removed unsupported numeric copy at ${path}`, JSON.stringify({ sentence: sentence.trim(), numbers: unknown }));
        return false;
      }).join('')).join('').trim();
    }
    if (Array.isArray(value)) return value.map((v,i) => walk(v, `${path}[${i}]`)).filter(v => v !== '');
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, walk(v, `${path}.${k}`, k)]));
    return value;
  };
  return walk(output, label);
}