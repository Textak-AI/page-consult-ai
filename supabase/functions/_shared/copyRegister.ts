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
- Concrete claims over abstractions: say what happens, for whom, with what result the user stated. No "brand foundations", "market resonance", "believers".
- Plain strong verbs (build, cut, write, ship, fix, find). No inflated verbs (sculpt, ignite, supercharge, empower).
- At most ONE metaphor per section. Never stack metaphors.
- Subheadlines: at most two clauses.
- Forbidden words (any form): ${HYPE_LEXICON.join(", ")}.
- No em-dash chains: never join three or more clauses with dashes.
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
