// Copy register standard ("strategic poetry"): constrains STYLE only.
// Facts and specifics must still come solely from the user's input.

export const HYPE_LEXICON = [
  "visceral",
  "resonance",
  "elevate",
  "unleash",
  "revolutionize",
  "game-changing",
  "powerful",
  "transformative",
  "cutting-edge",
  "synergy",
  "next-level",
  "world-class",
] as const;

export const COPY_REGISTER_RULES = `COPY REGISTER (style only — every fact, number, name and specific still comes solely from the user's input; never add claims to satisfy these rules):
- Every number anywhere in generated copy (digits or spelled out, including benefits, challenges and closing copy) must come from stated client input. Never add free pricing, cancellation, card, contract, or obligation terms unless the client stated them. Empty means omitted.
- Concrete claims over abstractions: say what happens, for whom, with what result the user stated. No "brand foundations", "market resonance", "believers".
- Plain strong verbs (build, cut, write, ship, fix, find). No inflated verbs (sculpt, ignite, supercharge, empower).
- At most ONE metaphor per section. Never stack metaphors.
- Subheadlines: at most two clauses.
- Forbidden words (any form): ${HYPE_LEXICON.join(", ")}.
- No em-dash chains: never join three or more clauses with dashes. This includes the "phrase — aside — phrase" pattern: never use two dashes in one sentence. Use at most one dash per sentence; prefer a period or comma.
- Rhythm and specificity over marketing-speak. If a plain sentence says it, use the plain sentence.`;

const STEMS: Record<string, RegExp> = {
  visceral: /\bviscerals?(ly)?\b/i,
  resonance: /\bresonan(ce|t|ates?|ating)\b/i,
  elevate: /\belevat(e|es|ed|ing|ion)\b/i,
  unleash: /\bunleash(es|ed|ing)?\b/i,
  revolutionize: /\brevolutioni[sz](e|es|ed|ing)\b/i,
  "game-changing": /\bgame[-\s]?chang(ing|er|ers)\b/i,
  powerful: /\bpowerful(ly)?\b/i,
  transformative: /\btransformative\b/i,
  "cutting-edge": /\bcutting[-\s]edge\b/i,
  synergy: /\bsynerg(y|ies|istic)\b/i,
  "next-level": /\bnext[-\s]level\b/i,
  "world-class": /\bworld[-\s]class\b/i,
};

export interface RegisterHit { path: string; word: string; excerpt: string }

/** Walks any JSON value and returns forbidden-lexicon hits. Never mutates. */
export function findRegisterViolations(value: unknown, path = "$"): RegisterHit[] {
  const hits: RegisterHit[] = [];
  if (typeof value === "string") {
    for (const [word, re] of Object.entries(STEMS)) {
      const m = value.match(re);
      if (m) {
        const i = m.index ?? 0;
        hits.push({ path, word, excerpt: value.slice(Math.max(0, i - 30), i + 40) });
      }
    }
    const dashes = value.match(/\s?(—|–| - )\s?/g);
    if (dashes && dashes.length >= 2) {
      hits.push({ path, word: "em-dash-chain", excerpt: value.slice(0, 80) });
    }
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => hits.push(...findRegisterViolations(v, `${path}[${i}]`)));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) hits.push(...findRegisterViolations(v, `${path}.${k}`));
  }
  return hits;
}

/** Log-only backstop. Does not rewrite content. */
export function logRegisterViolations(fn: string, value: unknown): RegisterHit[] {
  const hits = findRegisterViolations(value);
  if (hits.length === 0) {
    console.log(`[copy-register] ${fn}: 0 violations`);
  } else {
    console.warn(`[copy-register] ${fn}: ${hits.length} violation(s)`, JSON.stringify(hits));
  }
  return hits;
}

export const PROVENANCE_RULES = `PROVENANCE FOR ALL QUALITATIVE COPY (zero fabrication):
Applies to EVERY qualitative field: problem/challenge/stakes, solution, objections and their answers, FAQ answers, differentiators, who-it's-for / audience fit, approach and process descriptions, feature and pillar descriptions.
- Use ONLY the user's own stated framing, claims and consequences.
- Never invent downstream consequences, competitor or "other agencies" behavior (e.g. "Most agencies start with aesthetics", "unlike typical firms"), market dynamics, or buyer psychology the user did not state.
- Do not answer an objection by contrasting with competitors unless the user described that contrast.
- If the input does not supply a point, leave it out. Absence of a point is not a gap to fill.`;

const STOP = new Set("that this with your their they them have from into what when where which while about there these those than then been being also just more most very much many some such only even make makes made does doing done will would could should brand brands business businesses".split(" "));
const words = (t: string) => (t.toLowerCase().match(/[a-z][a-z'-]{3,}/g) || []).map((w) => w.replace(/(ing|ed|es|s)$/, "")).filter((w) => w.length >= 4 && !STOP.has(w));
// Non-qualitative keys skipped by the provenance scan (labels, CTAs, layout, media, identifiers).
const SKIP_KEY = /^(headline|headlines|option[a-z]|title|ctatext|cta|ctalink|icon|imageprompt|type|id|slug|tone|layoutintelligence|pagestructure|question|label|value|url|.*color.*|.*font.*|mode|composition)$/i;
const COMPETITOR = /\b(most|many|other|typical|traditional|generic)\s+(agencies|firms|consultants|companies|providers|competitors|studios)\b|\bcompetitors?\b|\bunlike\s+(other|most|typical)\b/i;

export interface ProvenanceHit { path: string; sentence: string; overlap: number; reason: "low-overlap" | "competitor-claim" }

/** Flags problem/challenge/stakes sentences with no meaningful content-word overlap with the user's input. Log-only. */
export function findProvenanceViolations(value: unknown, inputText: string, path = "$", minOverlap = 0.3): ProvenanceHit[] {
  const inputLower = inputText.toLowerCase();
  const input = new Set(words(inputText));
  const out: ProvenanceHit[] = [];
  const walk = (v: unknown, p: string, skip: boolean) => {
    if (typeof v === "string") {
      if (skip) return;
      for (const sentence of v.split(/(?<=[.!?])\s+|\s*[—–]\s*/).map((x) => x.trim()).filter(Boolean)) {
        const comp = sentence.match(COMPETITOR);
        if (comp && !inputLower.includes(comp[0].toLowerCase())) {
          out.push({ path: p, sentence, overlap: 0, reason: "competitor-claim" });
          continue;
        }
        const w = words(sentence);
        if (w.length < 3) continue;
        const overlap = w.filter((x) => input.has(x)).length / w.length;
        if (overlap < minOverlap) out.push({ path: p, sentence, overlap: Math.round(overlap * 100) / 100, reason: "low-overlap" });
      }
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}[${i}]`, skip));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, `${p}.${k}`, skip || SKIP_KEY.test(k));
  };
  walk(value, path, false);
  return out;
}

export function logProvenanceViolations(fn: string, value: unknown, inputText: string): ProvenanceHit[] {
  const hits = findProvenanceViolations(value, inputText);
  if (hits.length === 0) console.log(`[copy-provenance] ${fn}: 0 unsupported qualitative sentences`);
  else console.warn(`[copy-provenance] ${fn}: ${hits.length} unsupported qualitative sentence(s)`, JSON.stringify(hits));
  return hits;
}
