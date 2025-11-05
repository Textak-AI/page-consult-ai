# Content Quality System

## Overview
This document defines the quality standards enforced across all page generation to ensure professional, accurate, and ethical content.

## Critical Rules

### 1. No Fabricated Data
**NEVER generate fake:**
- Viewer counts ("127 people viewed this")
- Customer activity ("Sarah M. just signed up")
- Stats not provided by user ("98.5% satisfaction rate")
- Urgency ("Only 8 spots left")

**Why:** Fabricating metrics is unethical and potentially illegal (FTC regulations).

### 2. Transform Raw Text
**NEVER copy consultation verbatim:**
- ❌ "I have been a wedding DJ for 10 years"
- ✅ "A decade of making wedding receptions unforgettable"

**Implementation:** See `src/lib/contentTransformer.ts`

### 3. Industry-Specific Language
**Match industry context:**
- Wedding DJ → couples, celebration, reception, music
- SaaS → automation, integrations, dashboard, ROI
- Legal → consultation, case success, response time

**Implementation:** See `generateIndustryFeatures()` in `contentTransformer.ts`

### 4. CTA Alignment
**Final CTA must match offer (not goal):**
- ❌ "Ready to generate leads?" (that's YOUR goal)
- ✅ "Get Your Free Quote" (that's THEIR offer)

**Implementation:** See `FinalCTASection` component

### 5. Exact Credentials
**Use precise data from consultation:**
- User says "10 years" → Use "10 Years"
- User says "5-star rating" → Use "5-Star Rating"
- ❌ Don't change "10 years" to "12+ years"

### 6. Audience Language
**B2C vs B2B tone:**
- B2C: "You", "Your", emotional, personal
- B2B: "Companies", "Teams", ROI-focused

## Validation System

### Files
- `src/lib/contentQuality.ts` - Quality validation functions
- `src/lib/contentTransformer.ts` - Content transformation logic
- `supabase/functions/generate-page-content/index.ts` - AI generation prompt

### Validation Functions
```typescript
validatePageQuality(content: PageContent): QualityCheckResult
isRawConsultationText(text: string): boolean
ensureProfessionalCopy(text: string, context: string): string
formatStatistic(stat: string, claim: string): string
```

## Example: Wedding DJ

### Input
```json
{
  "industry": "Wedding DJ",
  "service_type": "DJ services",
  "target_audience": "Wedding planners",
  "challenge": "Finding reasonably-priced talented DJ",
  "unique_value": "10 years experience, 5-star Google rating, professional sound equipment",
  "offer": "Free audio download of reception"
}
```

### Correct Output
```json
{
  "headline": "Your Perfect Wedding DJ – 10 Years of 5-Star Celebrations",
  "subheadline": "From first dance to last call, we create the soundtrack to your perfect day. Professional entertainment backed by hundreds of glowing reviews.",
  "ctaText": "Get Your Free Quote + Reception Audio",
  "features": [
    {
      "title": "10 Years DJ Experience",
      "description": "A decade of making wedding receptions unforgettable"
    },
    {
      "title": "5-Star Google Rating", 
      "description": "100+ happy couples trust us with their special day"
    },
    {
      "title": "Professional Sound Equipment",
      "description": "Crystal-clear audio and backup systems ensure flawless entertainment"
    }
  ]
}
```

### Wrong Output (What to Avoid)
```json
{
  "headline": "The Discovery made easy Platform", // ❌ Generic, not wedding-specific
  "subheadline": "I have been in business for 10 years", // ❌ Raw text, not transformed
  "ctaText": "Ready to generate leads?", // ❌ Uses goal, not offer
  "fomo": "127 people viewed this", // ❌ Fabricated data
  "stats": [
    { "value": "12+ Years" } // ❌ Changed user's "10 years"
  ]
}
```

## Enforcement

### During Generation
1. AI generates content via edge function with strict prompt
2. Fallback generators use industry templates (not generic)
3. Quality validation runs before page save
4. Errors block generation, warnings are logged

### Quality Checks
- ✅ Headlines are industry-appropriate
- ✅ Features match industry type
- ✅ No raw consultation text
- ✅ CTAs use offer, not goal
- ✅ Stats match user input exactly
- ✅ No fabricated urgency/social proof

## Future Improvements
- [ ] Add more industry templates
- [ ] Implement credential extraction from unique_value
- [ ] Create A/B testing for headlines
- [ ] Add citation validation for stats
