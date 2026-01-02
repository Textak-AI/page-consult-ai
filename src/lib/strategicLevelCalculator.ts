import { StrategicLevel, STRATEGIC_LEVELS, LevelCheckResult } from '@/types/strategicLevels';
import type { ExtractedIntelligence } from '@/types/consultationReadiness';

const LEVEL_ORDER: StrategicLevel[] = ['unqualified', 'identified', 'positioned', 'armed', 'proven'];

/**
 * Check if a field is captured (has meaningful value)
 */
function isFieldCaptured(intel: Partial<ExtractedIntelligence>, field: string): boolean {
  const value = (intel as any)[field];
  
  // Arrays need at least 1 item (painPoints needs 2)
  if (Array.isArray(value)) {
    if (field === 'painPoints') return value.length >= 2;
    return value.length >= 1;
  }
  
  // Strings need meaningful content (more than 3 chars)
  if (typeof value === 'string') {
    return value.trim().length > 3;
  }
  
  return !!value;
}

/**
 * Get the display value for a captured field
 */
function getFieldDisplayValue(intel: Partial<ExtractedIntelligence>, field: string): string {
  const value = (intel as any)[field];
  
  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    return value.length > 1 ? `${value[0]} (+${value.length - 1} more)` : value[0];
  }
  
  if (typeof value === 'string') {
    return value.length > 30 ? value.substring(0, 30) + '...' : value;
  }
  
  return String(value || '');
}

/**
 * Calculate current strategic level based on captured intelligence
 * STRICT: All fields must be captured to reach a level
 */
export function calculateStrategicLevel(intel: Partial<ExtractedIntelligence> | null): LevelCheckResult {
  if (!intel) {
    return createResult('unqualified', intel);
  }

  // Check levels from highest to lowest
  for (let i = LEVEL_ORDER.length - 1; i >= 0; i--) {
    const level = LEVEL_ORDER[i];
    if (level === 'unqualified') continue;
    
    const def = STRATEGIC_LEVELS[level];
    const allFieldsCaptured = def.requiredFields.every(field => isFieldCaptured(intel, field));
    
    if (allFieldsCaptured) {
      return createResult(level, intel);
    }
  }

  return createResult('unqualified', intel);
}

function createResult(level: StrategicLevel, intel: Partial<ExtractedIntelligence> | null): LevelCheckResult {
  const levelDef = STRATEGIC_LEVELS[level];
  const levelIndex = LEVEL_ORDER.indexOf(level);
  const nextLevel = levelIndex < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[levelIndex + 1] : null;
  const nextLevelDef = nextLevel ? STRATEGIC_LEVELS[nextLevel] : null;
  
  // Calculate missing fields for next level
  const missingForNext: string[] = [];
  if (nextLevelDef && intel) {
    for (const field of nextLevelDef.requiredFields) {
      if (!isFieldCaptured(intel, field)) {
        missingForNext.push(field);
      }
    }
  }
  
  // Get captured fields with values
  const capturedFields: { field: string; value: string }[] = [];
  if (intel) {
    const allFields = ['industry', 'audience', 'valueProp', 'competitorDifferentiation', 'painPoints', 'buyerObjections', 'audienceRole', 'proofElements', 'toneDirection'];
    for (const field of allFields) {
      if (isFieldCaptured(intel, field)) {
        capturedFields.push({
          field,
          value: getFieldDisplayValue(intel, field),
        });
      }
    }
  }
  
  // Unlock checker - accumulates unlocks from all levels up to current
  const canUnlock = (feature: string): boolean => {
    for (let i = 0; i <= levelIndex; i++) {
      const lvl = LEVEL_ORDER[i];
      if (STRATEGIC_LEVELS[lvl].unlocks.includes(feature)) {
        return true;
      }
    }
    return false;
  };
  
  return {
    currentLevel: level,
    levelDef,
    nextLevel,
    nextLevelDef,
    missingForNext,
    capturedFields,
    canUnlock,
  };
}

/**
 * Format field name for display
 */
export function formatFieldName(field: string): string {
  const names: Record<string, string> = {
    industry: 'Industry',
    audience: 'Target Audience',
    valueProp: 'Value Proposition',
    competitorDifferentiation: 'Competitive Edge',
    painPoints: 'Pain Points (2+)',
    buyerObjections: 'Buyer Objections',
    audienceRole: 'Decision Maker Role',
    proofElements: 'Proof & Credibility',
    toneDirection: 'Brand Voice',
  };
  return names[field] || field;
}

/**
 * Get all unlocked features for a level
 */
export function getUnlockedFeatures(level: StrategicLevel): string[] {
  const unlocked: string[] = [];
  const levelIndex = LEVEL_ORDER.indexOf(level);
  
  for (let i = 0; i <= levelIndex; i++) {
    const lvl = LEVEL_ORDER[i];
    unlocked.push(...STRATEGIC_LEVELS[lvl].unlocks);
  }
  
  return unlocked;
}
