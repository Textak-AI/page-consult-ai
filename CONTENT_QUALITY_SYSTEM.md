# Universal Content Quality System

## Overview

This system ensures **ALL** generated pages (marketing and customer landing pages) meet professional quality standards with proper formatting, intelligent content transformation, and cited data sources.

## Quality Standards

### 1. Content Intelligence
- ❌ **NEVER** copy consultation answers verbatim
- ✅ **ALWAYS** transform raw input into professional copy
- ✅ Use industry best practices for headlines and CTAs
- ✅ Generate benefit-focused features that solve stated problems

**Bad Example:**
```
Headline: "they don't have a simple way to track site visits"
Feature: "we have a wholistic AI-powered system"
```

**Good Example:**
```
Headline: "Simple Website Tracking That Actually Works"
Feature: "AI-Powered Lead Intelligence - Never miss a hot lead again"
```

### 2. Statistics & Data Quality
When using Perplexity research:
- ✅ Show complete data points (e.g., "60-90%" not just "60")
- ✅ Include proper units (%, $, x)
- ✅ Always cite sources (e.g., "HubSpot, 2024")
- ✅ Verify statistics make logical sense
- ✅ Place strategically (hero for impact, problem for cost, solution for ROI)

### 3. Formatting Standards
- **Headlines**: Compelling, benefit-driven, properly capitalized
- **Percentages**: Always include % symbol
- **Dollar amounts**: Include $ with proper formatting
- **Ranges**: Show complete range (e.g., "$75-$3,000" not "$75")
- **Citations**: Format as "Source Name, Year"

### 4. Feature Language
Features must be **benefit-focused**, not feature-focused:
- ✅ "Save 10+ hours per week"
- ✅ "Increase conversions by 55%"
- ✅ "Reduce costs automatically"
- ❌ "Our system has AI capabilities"
- ❌ "We offer advanced tracking"

## Implementation

### Content Generation Pipeline

```
Raw Consultation → Extract Insights → Apply Industry Context → 
Generate Professional Copy → Quality Validation → Final Page
```

### Quality Validation (contentQuality.ts)

All content passes through `validatePageQuality()` which checks:

1. **No raw consultation text** - Detects patterns like "they don't", "we have"
2. **Proper headline formatting** - Length, capitalization, completeness
3. **Complete statistics** - Units, ranges, citations
4. **Benefit-focused features** - Uses keywords like "save", "increase", "reduce"
5. **Professional tone** - No placeholders, undefined values, or generic copy

### Auto-Correction

The system includes `ensureProfessionalCopy()` which:
- Detects raw consultation text
- Removes filler words and patterns
- Transforms into professional copy
- Logs warnings for review

### Statistics Formatting

`formatStatistic()` ensures:
- Adds missing units (%, $) based on claim context
- Completes partial ranges (e.g., "60" → "60-90%" if range mentioned in claim)
- Preserves proper formatting

## Usage

### In Content Generation
```typescript
import { generateHeadline, generateFeatures, validateGeneratedPage } from '@/lib/contentGenerator';

// Generate content with automatic quality checks
const headline = generateHeadline(consultationData);
const features = generateFeatures(consultationData);

// Final validation before display
const validation = validateGeneratedPage({
  headline,
  subheadline,
  features,
  statistics,
});

if (!validation.valid) {
  console.warn('Quality issues:', validation.report);
}
```

### Quality Check Output
```
✅ Page quality check passed with no issues

OR

📊 Generated Page Content Quality Report
❌ ERRORS (must fix):
  - Headline contains raw consultation text: "they don't have..."
  - Statistic "60" appears incomplete
⚠️ WARNINGS (should improve):
  - Feature "Advanced System" is feature-focused. Consider benefit focus.
```

## Files

- `src/lib/contentQuality.ts` - Core quality validation system
- `src/lib/contentGenerator.ts` - Content generation with quality checks
- `src/lib/contentTransformer.ts` - Intelligent text transformation
- `supabase/functions/perplexity-research/` - Citation-based research

## Enforcement

Quality checks run:
1. **During generation** - Each content element is validated
2. **Before finalization** - Complete page validation
3. **On statistics fetch** - Format verification for all data

Pages with critical errors display a toast notification to the user and log detailed reports to the console for debugging.

## Benefits

- ✅ Professional copy on every page
- ✅ Credible, cited statistics
- ✅ Consistent quality across all pages
- ✅ Automatic detection and correction of common issues
- ✅ Detailed logging for debugging
- ✅ User-friendly error notifications
