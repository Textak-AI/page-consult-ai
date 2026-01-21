/**
 * Extracts target market from various consultation data shapes
 * Tries multiple possible field names and nested structures
 */
export function extractTargetMarket(consultationData: any): string | null {
  if (!consultationData) return null;

  // Try direct field names (in order of priority)
  const possibleFields = [
    'target_audience',
    'targetAudience',
    'audience',
    'target_market',
    'targetMarket',
    'ideal_customer',
    'idealCustomer',
    'who_you_serve',
    'whoYouServe',
    'customer_profile',
    'customerProfile',
  ];

  for (const field of possibleFields) {
    if (consultationData[field] && typeof consultationData[field] === 'string') {
      return truncateTargetMarket(consultationData[field]);
    }
  }

  // Check nested structures
  const nestedPaths = [
    ['extracted', 'audience'],
    ['extracted', 'target_audience'],
    ['extractedIntelligence', 'audience'],
    ['extractedIntelligence', 'targetAudience'],
    ['intelligence', 'targetAudience'],
    ['intelligence', 'audience'],
    ['consultationData', 'target_audience'],
    ['consultationData', 'targetAudience'],
    ['strategicData', 'consultationData', 'target_audience'],
  ];

  for (const path of nestedPaths) {
    let value = consultationData;
    for (const key of path) {
      value = value?.[key];
      if (!value) break;
    }
    if (value && typeof value === 'string') {
      return truncateTargetMarket(value);
    }
  }

  return null;
}

/**
 * Get target market from localStorage demo data
 */
export function getDemoTargetMarket(): string | null {
  try {
    const demoExtracted = localStorage.getItem('pageconsult_demo_extracted');
    // Guard against undefined/null strings
    if (demoExtracted && demoExtracted !== 'undefined' && demoExtracted !== 'null') {
      const parsed = JSON.parse(demoExtracted);
      if (parsed && typeof parsed === 'object') {
        return extractTargetMarket(parsed);
      }
    }
  } catch (e) {
    console.error('Error reading demo extracted data:', e);
  }
  return null;
}

/**
 * Truncate target market description for display
 * Keeps first 100 chars for readability in UI
 */
function truncateTargetMarket(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 100) return trimmed;
  
  // Find the last complete word within 100 chars
  const truncated = trimmed.slice(0, 100);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 60) {
    return truncated.slice(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Combine extraction from multiple sources
 */
export function getTargetMarketFromSources(
  consultationData: any,
  strategicData: any,
  navState: any
): string | null {
  // Priority order:
  // 1. Direct consultation data
  // 2. Strategic data consultation
  // 3. Nav state consultation data
  // 4. Demo localStorage
  
  return (
    extractTargetMarket(consultationData) ||
    extractTargetMarket(strategicData?.consultationData) ||
    extractTargetMarket(navState?.consultationData) ||
    extractTargetMarket(navState?.strategicData?.consultationData) ||
    getDemoTargetMarket()
  );
}
