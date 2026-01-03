// Unified Intelligence Scoring System - 100 points total
// 4 categories × 25 points each

export interface FieldScore {
  value: string | null;
  summary: string | null;
  points: number;
  maxPoints: number;
}

export interface CategoryScore {
  total: number;
  maxPoints: 25;
  percentage: number;
}

export interface WhoYouAreScore extends CategoryScore {
  industry: FieldScore;    // 10 pts
  audience: FieldScore;    // 10 pts
  geography: FieldScore;   // 5 pts
}

export interface WhatYouOfferScore extends CategoryScore {
  valueProp: FieldScore;   // 10 pts
  edge: FieldScore;        // 10 pts
  method: FieldScore;      // 5 pts
}

export interface BuyerRealityScore extends CategoryScore {
  painPoints: FieldScore;  // 10 pts
  objections: FieldScore;  // 10 pts
  triggers: FieldScore;    // 5 pts
}

export interface ProofCredibilityScore extends CategoryScore {
  results: FieldScore;     // 10 pts
  socialProof: FieldScore; // 10 pts
  credentials: FieldScore; // 5 pts
}

export interface IntelligenceScore {
  whoYouAre: WhoYouAreScore;
  whatYouOffer: WhatYouOfferScore;
  buyerReality: BuyerRealityScore;
  proofCredibility: ProofCredibilityScore;
  
  totalScore: number;
  totalPercentage: number;
  level: StrategicLevel;
}

export type StrategicLevel = 'unqualified' | 'identified' | 'positioned' | 'armed' | 'proven';

export const LEVEL_THRESHOLDS = {
  unqualified: { min: 0, max: 24 },
  identified: { min: 25, max: 49 },
  positioned: { min: 50, max: 69 },
  armed: { min: 70, max: 84 },
  proven: { min: 85, max: 100 },
} as const;

export const FIELD_POINTS = {
  // WHO YOU ARE
  industry: 10,
  audience: 10,
  geography: 5,
  // WHAT YOU OFFER
  valueProp: 10,
  edge: 10,
  method: 5,
  // BUYER REALITY
  painPoints: 10,
  objections: 10,
  triggers: 5,
  // PROOF & CREDIBILITY
  results: 10,
  socialProof: 10,
  credentials: 5,
} as const;

export const CATEGORY_COLORS = {
  whoYouAre: {
    base: 'cyan',
    gradient: 'from-cyan-400 to-cyan-600',
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
  },
  whatYouOffer: {
    base: 'green',
    gradient: 'from-green-400 to-emerald-600',
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
  },
  buyerReality: {
    base: 'purple',
    gradient: 'from-purple-400 to-violet-600',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
  },
  proofCredibility: {
    base: 'amber',
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
  },
} as const;

export const LEVEL_COLORS = {
  unqualified: { 
    base: 'slate', 
    text: 'text-slate-400',
    bg: 'bg-slate-500/20',
    border: 'border-slate-500/30',
    gradient: 'from-slate-400 to-slate-600',
  },
  identified: { 
    base: 'blue', 
    text: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    gradient: 'from-blue-400 to-blue-600',
  },
  positioned: { 
    base: 'green', 
    text: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    gradient: 'from-green-400 to-emerald-600',
  },
  armed: { 
    base: 'purple', 
    text: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    gradient: 'from-purple-400 to-violet-600',
  },
  proven: { 
    base: 'amber', 
    text: 'text-amber-400',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    gradient: 'from-amber-400 to-orange-500',
  },
} as const;
