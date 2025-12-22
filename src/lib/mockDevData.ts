/**
 * Mock data for development testing
 */

export const mockConsultation = {
  // Website Intelligence
  websiteUrl: "https://acceler8ors.com",
  websiteIntelligence: {
    logoUrl: null,
    brandColors: ["#6366f1", "#8b5cf6", "#0ea5e9"],
    title: "Acceler8ors - B2B Creative Agency",
    tagline: "6 months of brand progress in 6 weeks",
    description: "We help B2B tech startups build brands that match their product quality",
    heroText: "Stop burning time with agencies that don't get tech.",
    testimonials: [
      "Acceler8ors delivered what 3 agencies couldn't in 18 months.",
      "Finally, an agency that speaks our language.",
    ],
    companyName: "Acceler8ors",
  },

  // Business Identity
  businessName: "Acceler8ors",
  industry: "Marketing & Advertising",
  industryOther: "",
  yearsInBusiness: "5+ years",
  uniqueStrength: "We combine strategy-first thinking with startup speed. Our team comes from Google, Spotify, and top agencies - we understand both the tech world and brand building.",

  // Target Audience
  idealClient: "Founders and marketing leads at B2B tech startups, Series A-C, with $2M-$50M revenue. They've usually been burned by agencies before and are skeptical but desperate for a brand that matches their product quality.",
  clientFrustration: "They're tired of agencies that don't understand tech, slow turnaround times, managing multiple vendors, and ending up with generic work that doesn't reflect their innovation.",

  // Credibility
  clientCount: "75+",
  achievements: "Featured in Communication Arts, team includes alumni from Google, Spotify, and Pentagram. Average client NPS of 72.",
  testimonialText: "Acceler8ors delivered in 6 weeks what 3 previous agencies couldn't do in 18 months. They actually understood our product and our market. - Marcus Chen, CEO DataStack",

  // Offer Details
  mainOffer: "Brand Acceleration Sprint - Complete brand identity, website design, and pitch deck delivered in 6 weeks. Includes strategy workshop, weekly reviews, and unlimited revisions.",
  offerIncludes: "Brand strategy document, logo and visual identity system, website design (10-15 pages), investor pitch deck, brand guidelines, 90-day marketing roadmap",
  investmentRange: "$25K-$50K",
  processDescription: "15-minute discovery call → Custom proposal within 48 hours → 2-hour strategy session → 6 weekly creative reviews → Final delivery and handoff",

  // Page Goals
  primaryGoal: "Schedule Calls",
  desiredOutcome: "A constant stream of qualified discovery calls from founders who already understand our value and are ready to move fast.",
  ctaText: "Book a Discovery Call",
  objectionsToOvercome: "1) They've been burned by agencies before - need proof we're different. 2) $25-50K seems expensive - need to show ROI. 3) 6 weeks seems too fast - need to explain our process.",
};

export const mockStrategyBrief = `# Strategy Brief: Acceler8ors Brand Acceleration

## Executive Summary
Acceler8ors positions as the antidote to agency chaos for B2B tech startups. The core promise: 6 months of brand progress compressed into 6 weeks, delivered by a team that actually understands tech. This brief outlines the strategic foundation for a high-converting landing page targeting Series A-C founders.

## Target Audience Profile
**Primary Persona: The Frustrated Founder**
- Series A-C B2B tech startup founders/marketing leads
- $2M-$50M revenue, 20-200 employees
- Previously burned by agencies (critical pain point)
- Time-starved, skeptical of marketing speak
- Values speed, substance, and straight talk

## Value Proposition
"6 months of brand progress in 6 weeks" - This promise directly addresses the core frustration (agencies are slow) while setting clear expectations. The subtext: we're fast because we're focused, not because we cut corners.

## Messaging Pillars
1. **Strategy-First Speed** - We're fast because we start with strategy, not because we skip it
2. **B2B Tech Fluency** - Team from Google, Spotify, Pentagram understands your world
3. **Startup Flexibility** - No bloated teams, no endless meetings, no surprises

## Proof Points
- 75+ B2B tech companies served
- Communication Arts featured work
- Team alumni: Google, Spotify, Pentagram
- Average client NPS: 72
- Key testimonial: "Delivered in 6 weeks what 3 agencies couldn't in 18 months"

## Objection Handling Framework
| Objection | Response Strategy |
|-----------|------------------|
| "Burned by agencies before" | Lead with testimonials about our difference, show process transparency |
| "$25-50K seems expensive" | Frame as investment vs. cost, compare to 18-month agency failures |
| "6 weeks seems unrealistic" | Explain sprint methodology, show portfolio of completed sprints |

## Headline Recommendations
- Primary: "Stop Burning Time With Agencies That Don't Get Tech"
- Alt 1: "6 Months of Brand Progress. 6 Weeks."
- Alt 2: "Finally, A Creative Agency Built for B2B Tech"

## Page Structure Recommendation
1. Hero with bold claim + discovery call CTA
2. Problem agitation (agency horror stories)
3. Solution introduction (Brand Acceleration Sprint)
4. Process timeline (6-week sprint breakdown)
5. Credibility bar (logos, stats)
6. Testimonial feature (Marcus Chen quote)
7. What's included breakdown
8. Investment framing
9. FAQ/Objection handling
10. Final CTA with urgency

## Tone Guidelines
- Direct, no fluff (founders hate marketing speak)
- Confident but not arrogant
- Technical competence signals
- Occasional humor that shows self-awareness
- Numbers and specifics over vague claims`;

// Mock structured brief JSON - this is what the edge function returns
export const mockStructuredBrief = {
  headlines: {
    optionA: "Stop Burning Time With Agencies That Don't Get Tech",
    optionB: "6 Months of Brand Progress. 6 Weeks.",
    optionC: "Finally, A Creative Agency Built for B2B Tech"
  },
  subheadline: "6 months of brand progress in 6 weeks. Built by a team from Google, Spotify, and Pentagram who actually understand B2B tech.",
  messagingPillars: [
    {
      title: "Strategy-First Speed",
      description: "We're fast because we start with strategy, not because we skip it. Our focused sprint methodology eliminates wasted cycles.",
      icon: "Zap"
    },
    {
      title: "B2B Tech Fluency",
      description: "Team from Google, Spotify, Pentagram understands your world. No more explaining what a SaaS product is.",
      icon: "Target"
    },
    {
      title: "Startup Flexibility",
      description: "No bloated teams, no endless meetings, no surprises. Just senior talent focused on your success.",
      icon: "Users"
    }
  ],
  proofPoints: {
    clientCount: "75+ B2B tech companies",
    yearsInBusiness: "5+ years",
    achievements: "Featured in Communication Arts, team includes alumni from Google, Spotify, and Pentagram. Average client NPS of 72.",
    otherStats: ["6-week delivery", "NPS 72"]
  },
  problemStatement: "You're tired of agencies that don't understand tech. Slow turnaround times, managing multiple vendors, and ending up with generic work that doesn't reflect your innovation. Your last agency took 6 months to deliver mediocrity.",
  solutionStatement: "The Brand Acceleration Sprint delivers complete brand identity, website, and pitch deck in 6 weeks. No bloated teams. No endless meetings. No surprises. We're fast because we're focused, not because we cut corners.",
  tone: "confident" as const,
  objections: [
    {
      question: "Why does this cost $25-50K for branding?",
      answer: "Our Brand Acceleration Sprint includes complete brand identity, website design, pitch deck, and 90-day marketing roadmap. The investment pays for itself when you avoid the typical 18-month agency cycle that goes nowhere."
    },
    {
      question: "How can you deliver a complete brand in 6 weeks?",
      answer: "We use a sprint methodology with weekly creative reviews. Our strategy-first approach means we start building immediately after our 2-hour strategy session, with no wasted cycles."
    },
    {
      question: "I've been burned by agencies before. Why are you different?",
      answer: "Our team comes from Google, Spotify, and Pentagram — we understand both tech and brand building. We only take 2 clients per month so we can give you senior-level attention, not junior busywork."
    }
  ],
  pageStructure: ["hero", "stats-bar", "problem-solution", "features", "how-it-works", "social-proof", "faq", "final-cta"],
  processSteps: [
    {
      step: 1,
      title: "Discovery Call",
      description: "15-minute call to discuss your goals and see if we're a fit."
    },
    {
      step: 2,
      title: "Custom Proposal",
      description: "Detailed proposal within 48 hours including timeline and investment."
    },
    {
      step: 3,
      title: "Strategy Session",
      description: "2-hour deep dive into positioning, messaging, and competitive differentiation."
    },
    {
      step: 4,
      title: "Sprint Delivery",
      description: "6 weekly creative reviews with unlimited revisions until you're thrilled."
    }
  ],
  testimonials: [
    {
      quote: "Acceler8ors delivered in 6 weeks what 3 previous agencies couldn't do in 18 months. They actually understood our product and our market.",
      author: "Marcus Chen",
      title: "CEO, DataStack"
    }
  ],
  ctaText: "Book a Discovery Call"
};

export const mockGeneratedSections = [
  {
    id: "hero-1",
    type: "hero",
    variant: 1,
    content: {
      headline: "Stop Burning Time With Agencies That Don't Get Tech",
      subheadline: "6 months of brand progress in 6 weeks. Built by a team from Google, Spotify, and Pentagram who actually understand B2B tech.",
      ctaText: "Book a Discovery Call",
      ctaSubtext: "15-minute call • No commitment",
    },
  },
  {
    id: "problem-1",
    type: "problem-solution",
    content: {
      problemHeadline: "Sound Familiar?",
      problems: [
        "Your last agency took 6 months to deliver... mediocrity",
        "You're managing 4 different vendors for one brand project",
        "Every deliverable needs 'one more round of revisions'",
      ],
      solutionHeadline: "There's a Better Way",
      solution: "The Brand Acceleration Sprint: Complete brand identity, website, and pitch deck in 6 weeks. No bloated teams. No endless meetings. No surprises.",
    },
  },
  {
    id: "features-1",
    type: "features",
    content: {
      headline: "What's Included",
      features: [
        { title: "Brand Strategy", description: "Deep-dive into positioning, messaging, and competitive differentiation" },
        { title: "Visual Identity", description: "Logo, color system, typography, and complete brand guidelines" },
        { title: "Website Design", description: "10-15 page website designed for conversion" },
        { title: "Pitch Deck", description: "Investor-ready presentation that tells your story" },
      ],
    },
  },
  {
    id: "social-proof-1",
    type: "social-proof",
    content: {
      headline: "75+ B2B Tech Companies Trust Us",
      testimonial: {
        quote: "Acceler8ors delivered in 6 weeks what 3 previous agencies couldn't do in 18 months. They actually understood our product and our market.",
        author: "Marcus Chen",
        role: "CEO, DataStack",
      },
      stats: [
        { value: "75+", label: "Tech Companies" },
        { value: "6 weeks", label: "Average Delivery" },
        { value: "72", label: "NPS Score" },
      ],
    },
  },
  {
    id: "cta-1",
    type: "final-cta",
    content: {
      headline: "Ready to Finally Get This Done?",
      subheadline: "Book a 15-minute discovery call. We'll discuss your goals and see if Brand Acceleration Sprint is right for you.",
      ctaText: "Book a Discovery Call",
      urgency: "We take on 2 new clients per month.",
    },
  },
];

export const mockAiSeoData = {
  entity: {
    type: "ProfessionalService",
    name: "Acceler8ors",
    description: "B2B creative agency helping tech startups build brands in 6 weeks. Team from Google, Spotify, Pentagram delivering strategy-first branding.",
    industry: "Marketing & Advertising",
    areaServed: "United States"
  },
  authoritySignals: [
    {
      type: "statistic" as const,
      raw: "75+ B2B tech companies",
      optimized: "Trusted by 75+ B2B tech companies including Series A-C startups",
      numbers: ["75+"]
    },
    {
      type: "achievement" as const,
      raw: "Featured in Communication Arts",
      optimized: "Work featured in Communication Arts, the leading creative industry publication",
      numbers: []
    },
    {
      type: "credential" as const,
      raw: "Team from Google, Spotify, Pentagram",
      optimized: "Team includes alumni from Google, Spotify, and Pentagram design studios",
      numbers: []
    },
    {
      type: "statistic" as const,
      raw: "Average client NPS of 72",
      optimized: "Client satisfaction NPS score of 72 (industry average: 30-40)",
      numbers: ["72"]
    },
    {
      type: "comparison" as const,
      raw: "6 weeks vs 6 months",
      optimized: "Delivers in 6 weeks what traditional agencies take 6 months to complete",
      numbers: ["6", "6"]
    },
    {
      type: "testimonial" as const,
      raw: "Delivered in 6 weeks what 3 agencies couldn't in 18 months",
      optimized: "\"Delivered in 6 weeks what 3 previous agencies couldn't in 18 months\" — Marcus Chen, CEO DataStack",
      numbers: ["6", "3", "18"]
    }
  ],
  faqItems: [
    {
      question: "Why does Acceler8ors cost $25-50K for branding?",
      answer: "Our Brand Acceleration Sprint includes complete brand identity, website design, pitch deck, and 90-day marketing roadmap. The investment pays for itself when you consider that our clients avoid the typical 18-month agency cycle.",
      source: "objection" as const
    },
    {
      question: "How can you deliver a complete brand in 6 weeks?",
      answer: "We use a sprint methodology with weekly creative reviews. Our strategy-first approach means we start building immediately after our 2-hour strategy session, with no wasted cycles.",
      source: "objection" as const
    },
    {
      question: "What's included in the Brand Acceleration Sprint?",
      answer: "Brand strategy document, logo and visual identity system, 10-15 page website design, investor pitch deck, brand guidelines, and a 90-day marketing roadmap.",
      source: "offer" as const
    },
    {
      question: "How does your process work?",
      answer: "15-minute discovery call, custom proposal within 48 hours, 2-hour strategy session, 6 weekly creative reviews, then final delivery and handoff.",
      source: "process" as const
    },
    {
      question: "Do you work with early-stage startups?",
      answer: "We specialize in Series A-C B2B tech startups with $2M-$50M revenue. Earlier-stage companies may benefit from our lighter-weight packages.",
      source: "industry_common" as const
    },
    {
      question: "What makes you different from other branding agencies?",
      answer: "Our team comes from Google, Spotify, and Pentagram — we understand both tech and brand building. We're fast because we're focused, not because we cut corners.",
      source: "objection" as const
    }
  ],
  queryTargets: [
    {
      query: "best branding agency for B2B SaaS startups",
      intent: "transactional" as const,
      priority: "high" as const
    },
    {
      query: "how much does startup branding cost",
      intent: "informational" as const,
      priority: "high" as const
    },
    {
      query: "fast branding agency for tech companies",
      intent: "transactional" as const,
      priority: "high" as const
    },
    {
      query: "brand identity for Series A startup",
      intent: "transactional" as const,
      priority: "high" as const
    },
    {
      query: "how long does rebranding take",
      intent: "informational" as const,
      priority: "medium" as const
    },
    {
      query: "branding agency that understands tech",
      intent: "transactional" as const,
      priority: "medium" as const
    },
    {
      query: "what should a startup branding package include",
      intent: "informational" as const,
      priority: "medium" as const
    },
    {
      query: "agency alternatives for startup branding",
      intent: "informational" as const,
      priority: "low" as const
    }
  ],
  schemaReadiness: {
    score: 82,
    missing: ["priceRange", "openingHours", "logo", "aggregateRating"],
    complete: ["name", "description", "industry", "areaServed", "founder", "employee", "hasOfferCatalog"]
  }
};
