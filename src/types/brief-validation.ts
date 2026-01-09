// Validation result for a single field
export interface FieldValidation {
  quality: 'weak' | 'good' | 'strong';
  qualityReason: string;
  suggestions: Suggestion[];
  warnings: Warning[];
}

// AI-generated suggestion for improving a field
export interface Suggestion {
  id: string;
  type: 'improvement' | 'addition' | 'specificity';
  currentValue: string;
  suggestedValue: string;
  reason: string;
  confidence: number; // 0-1
  sourceQuote?: string; // Quote from conversation
}

// Warning about field quality or consistency
export interface Warning {
  id: string;
  type: 'inconsistency' | 'vague' | 'missing_proof' | 'contradiction';
  message: string;
  affectedFields: string[];
  severity: 'info' | 'warning' | 'critical';
}

// Item found in conversation but not extracted
export interface MissedExtraction {
  id: string;
  fieldKey: string;
  value: string;
  sourceQuote: string;
  messageIndex: number;
  confidence: number;
}

// Complete validation result
export interface BriefValidation {
  overallQuality: number; // 0-100
  fieldsValidation: Record<string, FieldValidation>;
  globalWarnings: Warning[];
  missedExtractions: MissedExtraction[];
  suggestedActions: string[];
}

// Brand elements for the brief
export interface BrandElements {
  logo: string | null;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

// AI SEO configuration
export interface AiSeoConfig {
  schemaType: string;
  generateFaqs: boolean;
  citationOptimized: boolean;
}

// Complete brief data for generation
export interface BriefData {
  intelligence: Record<string, string>;
  brand: BrandElements;
  aiSeo: AiSeoConfig;
  validationScore: number;
}
