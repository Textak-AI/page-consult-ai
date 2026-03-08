// ═══════════════════════════════════════════════════════════════════════════
// Archetype Optimizer — Deterministic Messaging Architecture Engine
// SDI Layer 1.5: Resolves 6 binary messaging decisions before generation
// ═══════════════════════════════════════════════════════════════════════════

export type ArchetypeName =
  | "Analytical Validator"
  | "Emotional Connector"
  | "Decisive Commander"
  | "Cautious Researcher";

export interface MessagingArchitecture {
  archetype: ArchetypeName;
  confidence: number;
  headlineFocus: "outcome-led" | "problem-led";
  proofStyle: "quantitative" | "narrative";
  commitmentAsk: "direct" | "exploratory";
  voiceRegister: "authoritative" | "peer-relational";
  urgencySignal: "present" | "absent";
  socialProofType: "authority" | "testimonial";
  probability: number;
  stateKey: string;
}

export interface IntelProfile {
  industry?: string;
  audience?: string;
  pricePoint?: number;
  painPoints?: string;
  tone?: string;
  valueProp?: string;
  edge?: string;
}

export interface OptimizationResult {
  primary: MessagingArchitecture;
  alternates: { key: string; dims: number[]; config: string[]; probability: number }[];
  reasoning: string;
  generationConstraints: string;
}

// ── Dimension Definitions ──────────────────────────────────────────────────
// 6 binary dimensions = 2⁶ = 64 possible messaging architectures

const DIMS = [
  { id: 0, name: "headline_focus",    s0: "outcome-led",     s1: "problem-led" },
  { id: 1, name: "proof_style",       s0: "quantitative",    s1: "narrative" },
  { id: 2, name: "commitment_ask",    s0: "direct",          s1: "exploratory" },
  { id: 3, name: "voice_register",    s0: "authoritative",   s1: "peer-relational" },
  { id: 4, name: "urgency_signal",    s0: "present",         s1: "absent" },
  { id: 5, name: "social_proof_type", s0: "authority",       s1: "testimonial" },
];

// ── Archetype Weight Matrix ────────────────────────────────────────────────

const WEIGHTS: Record<ArchetypeName, [number, number][]> = {
  "Analytical Validator": [
    [0.75, 0.25], [0.90, 0.10], [0.60, 0.40],
    [0.80, 0.20], [0.35, 0.65], [0.80, 0.20],
  ],
  "Emotional Connector": [
    [0.20, 0.80], [0.10, 0.90], [0.25, 0.75],
    [0.10, 0.90], [0.25, 0.75], [0.15, 0.85],
  ],
  "Decisive Commander": [
    [0.90, 0.10], [0.55, 0.45], [0.90, 0.10],
    [0.80, 0.20], [0.60, 0.40], [0.70, 0.30],
  ],
  "Cautious Researcher": [
    [0.40, 0.60], [0.60, 0.40], [0.05, 0.95],
    [0.45, 0.55], [0.05, 0.95], [0.50, 0.50],
  ],
};

// ── Coupling Matrix ────────────────────────────────────────────────────────

const COUPLINGS: [number, number, number, number, number][] = [
  [3, 0, 2, 0, +0.18],  // authoritative + direct = strong coherence
  [3, 1, 2, 1, +0.18],  // peer + exploratory = strong coherence
  [1, 0, 0, 0, +0.12],  // data proof + outcome headline = reinforcing
  [1, 1, 3, 1, +0.12],  // narrative + peer voice = reinforcing
  [5, 0, 3, 0, +0.10],  // logos + authoritative = consistent
  [5, 1, 3, 1, +0.10],  // testimonials + peer = consistent
  [3, 0, 4, 0, -0.12],  // authoritative + urgency = credibility risk
  [2, 0, 4, 0, -0.08],  // direct + urgency = pressure overload
  [3, 1, 5, 0, -0.10],  // peer + logos = inauthentic
  [1, 1, 5, 0, -0.08],  // narrative + logos = mismatched
  [2, 0, 3, 1, -0.10],  // direct + peer = pushy
  [0, 0, 3, 1, -0.06],  // outcome + peer = bragging
];

// ── Energy Function ────────────────────────────────────────────────────────

function computeEnergy(state: number[], weights: [number, number][]): number {
  let E = 0;
  for (let d = 0; d < 6; d++) E += weights[d][state[d]];
  for (const [da, sa, db, sb, J] of COUPLINGS) {
    if (state[da] === sa && state[db] === sb) E += J;
  }
  return E;
}

// ── Archetype Inference ────────────────────────────────────────────────────

const MARKERS: Record<ArchetypeName, string[]> = {
  "Analytical Validator": ["roi","data","metrics","compliance","audit","performance","efficiency","optimize","kpi","saas","platform","integration","api","enterprise","reduce cost","pipeline","forecast","benchmark"],
  "Emotional Connector": ["struggle","frustrated","overwhelmed","afraid","worried","stressed","burned out","transform","journey","dream","empower","heal","coach","wellness","therapy","personal","life-changing"],
  "Decisive Commander": ["fast","immediately","results","bottom line","executive","scale","growth","revenue","competitive","market share","acquisition","funding","board","stakeholder","decision"],
  "Cautious Researcher": ["research","compare","evaluate","consider","risk","careful","thorough","due diligence","review","long-term","sustainable","proven","established","trust"],
};

export function inferArchetype(profile: IntelProfile): {
  archetype: ArchetypeName;
  confidence: number;
  reasoning: string;
  matchedMarkers: string[];
} {
  const text = [profile.industry, profile.audience, profile.painPoints, profile.tone, profile.valueProp, profile.edge].filter(Boolean).join(" ").toLowerCase();

  const scores: Record<ArchetypeName, number> = {
    "Analytical Validator": 0, "Emotional Connector": 0,
    "Decisive Commander": 0, "Cautious Researcher": 0,
  };

  for (const [arch, markers] of Object.entries(MARKERS) as [ArchetypeName, string[]][]) {
    scores[arch] += markers.reduce((c, m) => c + (text.includes(m) ? 2 : 0), 0);
  }

  const price = profile.pricePoint || 0;
  if (price >= 15000) { scores["Analytical Validator"] += 3; scores["Decisive Commander"] += 4; }
  else if (price >= 5000) { scores["Analytical Validator"] += 2; scores["Cautious Researcher"] += 2; }
  else if (price >= 1000) { scores["Emotional Connector"] += 1; scores["Cautious Researcher"] += 2; }
  else if (price > 0) { scores["Emotional Connector"] += 2; scores["Decisive Commander"] += 1; }

  const ind = (profile.industry || "").toLowerCase();
  if (/saas|software|tech|platform|api|dev/.test(ind)) scores["Analytical Validator"] += 3;
  if (/coach|wellness|therapy|personal|fitness/.test(ind)) scores["Emotional Connector"] += 3;
  if (/executive|recruit|m&a|investment|private equity/.test(ind)) scores["Decisive Commander"] += 3;
  if (/healthcare|legal|education|government/.test(ind)) scores["Cautious Researcher"] += 3;

  const sorted = (Object.entries(scores) as [ArchetypeName, number][]).sort(([, a], [, b]) => b - a);
  const total = sorted.reduce((s, [, v]) => s + v, 0) || 1;
  const confidence = Math.min(0.95, Math.max(0.45, 0.5 + (sorted[0][1] - sorted[1][1]) / total));

  console.log('🎯 [ArchetypeOptimizer] Inference:', sorted[0][0], '| Confidence:', confidence.toFixed(2), '| Scores:', JSON.stringify(scores));

  // Collect which markers actually matched for the winning archetype
  const winningArchetype = sorted[0][0];
  const matchedMarkers = MARKERS[winningArchetype].filter(m => text.includes(m));

  return {
    archetype: sorted[0][0],
    confidence: parseFloat(confidence.toFixed(2)),
    reasoning: `Classified as ${sorted[0][0]} based on ${profile.industry || "unknown"} industry, $${price.toLocaleString()} price point, and language signal analysis.`,
    matchedMarkers,
  };
}

// ── Main Optimization ──────────────────────────────────────────────────────

export function optimizeArchitecture(archetype: ArchetypeName, confidence: number = 0.8): OptimizationResult {
  const weights = WEIGHTS[archetype];

  const states: { dims: number[]; score: number }[] = [];
  for (let i = 0; i < 64; i++) {
    const dims = i.toString(2).padStart(6, "0").split("").map(Number);
    states.push({ dims, score: computeEnergy(dims, weights) });
  }

  const maxScore = Math.max(...states.map(s => s.score));
  const beta = 4.0;
  const withExp = states.map(s => ({ ...s, expE: Math.exp(beta * (s.score - maxScore)) }));
  const Z = withExp.reduce((a, s) => a + s.expE, 0);
  const ranked = withExp
    .map(s => ({ ...s, probability: s.expE / Z }))
    .sort((a, b) => b.probability - a.probability);

  const best = ranked[0];
  const primary: MessagingArchitecture = {
    archetype,
    confidence,
    headlineFocus: best.dims[0] === 0 ? "outcome-led" : "problem-led",
    proofStyle: best.dims[1] === 0 ? "quantitative" : "narrative",
    commitmentAsk: best.dims[2] === 0 ? "direct" : "exploratory",
    voiceRegister: best.dims[3] === 0 ? "authoritative" : "peer-relational",
    urgencySignal: best.dims[4] === 0 ? "present" : "absent",
    socialProofType: best.dims[5] === 0 ? "authority" : "testimonial",
    probability: parseFloat(best.probability.toFixed(4)),
    stateKey: best.dims.join(""),
  };

  const alternates = ranked.slice(1, 3).map(s => ({
    key: s.dims.join(""),
    dims: s.dims,
    config: s.dims.map((v, d) => v === 0 ? DIMS[d].s0 : DIMS[d].s1),
    probability: parseFloat(s.probability.toFixed(4)),
  }));

  const generationConstraints = buildGenerationConstraints(primary);

  console.log('🎯 [ArchetypeOptimizer] Optimized:', primary.stateKey,
    '| Headline:', primary.headlineFocus,
    '| Proof:', primary.proofStyle,
    '| CTA:', primary.commitmentAsk,
    '| Voice:', primary.voiceRegister,
    '| Urgency:', primary.urgencySignal,
    '| Social:', primary.socialProofType,
    '| Probability:', (primary.probability * 100).toFixed(1) + '%');

  return {
    primary,
    alternates,
    reasoning: `Buyer archetype: ${archetype} (${(confidence * 100).toFixed(0)}% confidence). 64 messaging architectures evaluated. Optimal configuration locked.`,
    generationConstraints,
  };
}

export function optimizeFromProfile(profile: IntelProfile): OptimizationResult & {
  inference: { archetype: ArchetypeName; confidence: number; reasoning: string };
} {
  const inference = inferArchetype(profile);
  const result = optimizeArchitecture(inference.archetype, inference.confidence);
  console.log('🎯 [ArchetypeOptimizer] Full pipeline complete:', inference.archetype, '→', result.primary.stateKey);
  return { ...result, inference };
}

// ── Generation Prompt Constraints ──────────────────────────────────────────

function buildGenerationConstraints(arch: MessagingArchitecture): string {
  return `
## Messaging Architecture (Deterministic Optimization — SDI Layer 1.5)

Buyer Archetype: ${arch.archetype} (${(arch.confidence * 100).toFixed(0)}% confidence)
These six constraints are MANDATORY. Follow them exactly.

1. HEADLINE: ${arch.headlineFocus} framing.
   ${arch.headlineFocus === "outcome-led"
     ? "Lead with the measurable result or transformation the buyer achieves. Do NOT lead with the problem."
     : "Lead with the specific problem or pain the buyer is experiencing. Do NOT lead with outcomes first."}

2. PROOF: ${arch.proofStyle} proof style.
   ${arch.proofStyle === "quantitative"
     ? "Emphasize numbers, percentages, metrics. Stats bar must be prominent."
     : "Emphasize stories, case narratives, human experiences. Case study section must be prominent."}

3. CTA: ${arch.commitmentAsk} ask.
   ${arch.commitmentAsk === "direct"
     ? "High-intent CTA: 'Schedule a Call', 'Request a Proposal'. NOT 'Learn More'."
     : "Low-friction CTA: 'See How It Works', 'Explore the Platform'. NOT 'Buy Now'."}

4. VOICE: ${arch.voiceRegister} register throughout ALL copy.
   ${arch.voiceRegister === "authoritative"
     ? "Clinical precision. Professional distance. Data-backed claims."
     : "Conversational warmth. Second-person 'you' framing. Empathetic language."}

5. URGENCY: ${arch.urgencySignal === "present" ? "INCLUDE" : "DO NOT INCLUDE"} urgency signals.
   ${arch.urgencySignal === "present"
     ? "Use consequence framing, competitive pressure, time-sensitivity."
     : "NO countdown timers, NO 'limited time', NO manufactured scarcity. Trust-first pacing."}

6. SOCIAL PROOF: ${arch.socialProofType} proof style.
   ${arch.socialProofType === "authority"
     ? "Logos, certifications, credentials, partner badges."
     : "Named testimonials, case studies with quotes, client stories."}
`.trim();
}
