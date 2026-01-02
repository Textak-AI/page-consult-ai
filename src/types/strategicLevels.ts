export type StrategicLevel = 'unqualified' | 'identified' | 'positioned' | 'armed' | 'proven';

export interface LevelDefinition {
  name: string;
  tagline: string;
  requiredFields: string[];
  unlocks: string[];
  color: string;
  icon: string;
  aiVoice: string;
}

export const STRATEGIC_LEVELS: Record<StrategicLevel, LevelDefinition> = {
  unqualified: {
    name: 'Getting Started',
    tagline: 'Tell me about your business',
    requiredFields: [],
    unlocks: [],
    color: 'slate',
    icon: 'Circle',
    aiVoice: "Let's start with the basics — who do you help and what do you do for them?",
  },
  identified: {
    name: 'IDENTIFIED',
    tagline: 'I know who you are',
    requiredFields: ['industry', 'audience'],
    unlocks: ['continue_demo'],
    color: 'blue',
    icon: 'User',
    aiVoice: "I can see WHO you serve. Now help me understand WHY they should choose you.",
  },
  positioned: {
    name: 'POSITIONED',
    tagline: 'I know why you matter',
    requiredFields: ['industry', 'audience', 'valueProp', 'competitorDifferentiation'],
    unlocks: ['trial_signup'],
    color: 'green',
    icon: 'Target',
    aiVoice: "Strong positioning. Now I need ammunition — what keeps your buyers up at night?",
  },
  armed: {
    name: 'ARMED',
    tagline: 'I can sell you',
    requiredFields: ['industry', 'audience', 'valueProp', 'competitorDifferentiation', 'painPoints', 'buyerObjections', 'audienceRole'],
    unlocks: ['page_generation'],
    color: 'purple',
    icon: 'Zap',
    aiVoice: "I can write copy that converts. But can you back it up? What proof makes this believable?",
  },
  proven: {
    name: 'PROVEN',
    tagline: 'I can make it credible',
    requiredFields: ['industry', 'audience', 'valueProp', 'competitorDifferentiation', 'painPoints', 'buyerObjections', 'audienceRole', 'proofElements', 'toneDirection'],
    unlocks: ['premium_generation', 'export_brief'],
    color: 'amber',
    icon: 'Star',
    aiVoice: "Full strategic profile. Your page will have maximum conversion potential.",
  },
};

export interface LevelCheckResult {
  currentLevel: StrategicLevel;
  levelDef: LevelDefinition;
  nextLevel: StrategicLevel | null;
  nextLevelDef: LevelDefinition | null;
  missingForNext: string[];
  capturedFields: { field: string; value: string; summary?: string }[];
  canUnlock: (feature: string) => boolean;
}
