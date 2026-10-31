// Progress copy for loading screens. Each label names work that actually runs
// at that point; nothing here may claim research, scanning, counts or results
// the code does not produce.

// StrategicConsultation.handleConsultationComplete: classifyIndustry, then
// generate-strategy-brief and extract-ai-seo-data in parallel, all from the
// owner's own answers.
export const BRIEF_GENERATION_STEPS = [
  'Reading your answers',
  'Matching your industry',
  'Writing your strategy brief',
  'Preparing search details from your answers',
] as const;

// Wizard.runResearch (/wizard/chat): one intake-chat call that summarizes the
// conversation into positioning and messaging notes. No web research runs.
export const CHAT_SUMMARY_STEPS = [
  'Reading our conversation',
  'Pulling out what you told me',
  'Writing positioning and messaging notes',
] as const;
