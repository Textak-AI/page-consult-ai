// Industry Design Intelligence for PageConsult AI
// Strategic design guidance based on market research and conversion best practices
// This intelligence informs both the AI strategy brief and the design system

import { IndustryType } from "./types";

export interface DesignIntelligence {
  // Metadata
  industry: string;
  audienceProfile: string;

  // Color strategy
  colorStrategy: {
    psychology: string;
    dominantColors: string[];
    accentColors: string[];
    avoid: string[];
    reasoning: string;
  };

  // Typography strategy
  typographyStrategy: {
    headingStyle: string;
    bodyStyle: string;
    hierarchy: string;
    avoid: string[];
    reasoning: string;
  };

  // Imagery strategy
  imageryStrategy: {
    primaryStyle: string;
    effectiveSubjects: string[];
    treatments: string[];
    avoid: string[];
    reasoning: string;
  };

  // Trust signals
  trustSignals: {
    critical: string[];
    effective: string[];
    placement: string;
    avoid: string[];
  };

  // Layout patterns
  layoutPatterns: {
    heroStyle: string;
    sectionFlow: string[];
    ctaPlacement: string;
    whitespaceApproach: string;
  };

  // CTA strategy
  ctaStrategy: {
    effectiveLanguage: string[];
    buttonStyle: string;
    urgencyApproach: string;
    avoid: string[];
  };

  // Common mistakes
  commonMistakes: string[];

  // Competitor insights
  competitorInsights: {
    topPerformerTraits: string[];
    differentiationOpportunities: string[];
  };
}

export const industryDesignIntelligence: Record<IndustryType, DesignIntelligence> = {
  // ============================================================================
  // MANUFACTURING & INDUSTRIAL
  // ============================================================================
  "manufacturing-industrial": {
    industry: "Manufacturing & Industrial",
    audienceProfile:
      'Plant managers, VPs of Operations, procurement directors, engineers. Risk-averse, data-driven, skeptical of "marketing speak." Value substance over flash.',

    colorStrategy: {
      psychology:
        "Trust, stability, precision, safety. These buyers need to feel confident you won't disrupt their operations.",
      dominantColors: ["Deep navy (#1E3A5F)", "Steel gray (#64748B)", "Slate (#334155)"],
      accentColors: ["Safety orange (#E85D04)", "Industrial blue (#0EA5E9)", "Success green (#10B981)"],
      avoid: ["Pastels", "Bright pinks/purples", "Neon colors", 'Anything "playful"'],
      reasoning:
        "Navy conveys expertise and stability. Orange provides action contrast without feeling frivolous. Gray grounds the palette in industrial reality.",
    },

    typographyStrategy: {
      headingStyle: "Bold sans-serif (Inter, Roboto, or similar). Technical, no-nonsense. Weight 600-700.",
      bodyStyle: "Clean sans-serif, 16-18px, high readability. Line height 1.6-1.7.",
      hierarchy:
        "Strong contrast between headings and body. Clear visual hierarchy signals organization and precision.",
      avoid: ["Script fonts", "Decorative typefaces", "Thin/light weights", "All caps body text"],
      reasoning:
        "Manufacturing audiences scan for information. Typography should facilitate quick comprehension, not slow them down.",
    },

    imageryStrategy: {
      primaryStyle: "Professional photography of real facilities, equipment, and teams in action.",
      effectiveSubjects: [
        "Factory floors and production lines",
        "Close-ups of precision equipment",
        "Engineers/technicians at work (not posed)",
        "Quality control processes",
        "Supply chain visualization",
      ],
      treatments: ["High contrast", "Professional color grading", "Dark overlays for text readability"],
      avoid: [
        "Generic stock handshakes",
        "Overly polished corporate imagery",
        "Empty conference rooms",
        "Smiling people with no context",
        "Abstract graphics that don't relate to manufacturing",
      ],
      reasoning:
        'Authenticity matters. These buyers can spot fake "industrial" stock photos instantly. Real imagery builds credibility.',
    },

    trustSignals: {
      critical: [
        "ISO certifications (9001, 14001, etc.)",
        "Industry association memberships",
        "Years in business",
        "Client count or projects completed",
        "Named client logos (with permission)",
      ],
      effective: [
        "Specific case study metrics (%, $, time saved)",
        "Named testimonials with titles and companies",
        "Before/after operational data",
        "Team credentials (former [Big Company] executives)",
        "Safety records",
      ],
      placement:
        "Stats bar immediately after hero. Testimonials after features. Certifications in footer or dedicated section.",
      avoid: [
        'Generic "100% satisfaction" badges',
        "Fake urgency timers",
        "Unverifiable claims",
        "Anonymous testimonials",
      ],
    },

    layoutPatterns: {
      heroStyle: "Full-width image with dark overlay (70%+), bold headline focused on outcome, single clear CTA.",
      sectionFlow: [
        "Hero",
        "Stats/Proof Bar",
        "Problem-Solution",
        "Process/How It Works",
        "Features/Capabilities",
        "Case Study/Testimonial",
        "FAQ",
        "Final CTA",
      ],
      ctaPlacement: "Hero (primary), after social proof (secondary), footer (tertiary). Not aggressive.",
      whitespaceApproach: "Generous. Conveys confidence and premium positioning. Cramped layouts feel desperate.",
    },

    ctaStrategy: {
      effectiveLanguage: [
        "Schedule Your Assessment",
        "Request a Consultation",
        "Get Your Custom Analysis",
        "Talk to an Expert",
        "See How It Works",
      ],
      buttonStyle: "Solid fill, high contrast against background. No gradients or animations.",
      urgencyApproach: 'Subtle if any. "Limited availability" is acceptable. Countdown timers are not.',
      avoid: ["Buy Now", "Sign Up Free", "Get Started (too vague)", "Act Now!!!", "Don't Miss Out"],
    },

    commonMistakes: [
      "Too much text without visual breaks",
      "Generic headlines that could apply to any industry",
      "Stock photos that look nothing like real manufacturing",
      "Hiding pricing or process information",
      "Weak or missing social proof",
      "Mobile experience as afterthought",
    ],

    competitorInsights: {
      topPerformerTraits: [
        "McKinsey-style clean layouts with data emphasis",
        "Specific, quantified outcomes in headlines",
        "Process transparency (what happens after contact)",
        "Industry-specific language (not generic business speak)",
      ],
      differentiationOpportunities: [
        "Interactive ROI calculators",
        "Video facility tours or process explanations",
        "Detailed case studies with real numbers",
        "Risk-reversal guarantees specific to operations",
      ],
    },
  },

  // ============================================================================
  // PROFESSIONAL SERVICES
  // ============================================================================
  "professional-services": {
    industry: "Professional Services (Consulting, B2B)",
    audienceProfile:
      "Executives, business owners, decision-makers. Time-poor, skeptical, looking for proven expertise. Value credibility and results.",

    colorStrategy: {
      psychology: "Credibility, competence, growth. These buyers are evaluating your expertise before they even read.",
      dominantColors: ["Corporate blue (#1E40AF)", "Charcoal (#1F2937)", "White (#FFFFFF)"],
      accentColors: ["Growth green (#10B981)", "Trust purple (#7C3AED)", "Warm gold (#D97706)"],
      avoid: ["Neon colors", "Overly saturated palettes", "Black backgrounds (feels too edgy)"],
      reasoning:
        "Blue remains the trust standard in B2B. Green signals growth/results. Light backgrounds feel more accessible and professional.",
    },

    typographyStrategy: {
      headingStyle: "Refined sans-serif (Plus Jakarta Sans, DM Sans). Weight 600. Slight negative letter-spacing.",
      bodyStyle: "Clean, readable sans-serif. 16-17px. Generous line height (1.7).",
      hierarchy: "Elegant contrast. Headings command attention without shouting.",
      avoid: ["Overly bold weights", "Condensed fonts", "Trendy/startup fonts"],
      reasoning: "Professional services sell expertise. Typography should feel intelligent and considered, not flashy.",
    },

    imageryStrategy: {
      primaryStyle: "Abstract or minimal. Professional headshots for team. Subtle geometric patterns.",
      effectiveSubjects: [
        "Abstract representations of growth/strategy",
        "Professional team headshots",
        "Clean office environments (minimal)",
        "Data visualization imagery",
        "Subtle texture backgrounds",
      ],
      treatments: ["Light and airy", "High-key photography", "Minimal post-processing"],
      avoid: [
        "Generic handshake photos",
        "Overcrowded meeting room shots",
        "Overly staged corporate poses",
        "Busy, distracting backgrounds",
      ],
      reasoning: "The service IS the people. Imagery should support, not distract. Let expertise speak.",
    },

    trustSignals: {
      critical: [
        "Client logos (recognizable names)",
        "Specific results achieved (%, $, outcomes)",
        "Team credentials and backgrounds",
        "Years of experience",
        "Industry recognition or awards",
      ],
      effective: [
        "Case studies with narrative arc",
        "Video testimonials",
        "Published thought leadership",
        "Speaking engagements or media mentions",
        "Certifications relevant to specialty",
      ],
      placement: "Logo bar after hero. Detailed testimonials mid-page. Credentials throughout.",
      avoid: ["Vanity metrics without context", "Unattributed quotes", "Claims without evidence"],
    },

    layoutPatterns: {
      heroStyle:
        "Clean, light background. Headline focused on client outcome. Professional headshot or abstract accent.",
      sectionFlow: [
        "Hero",
        "Logo Bar",
        "Problem-Solution or Value Prop",
        "Services/Approach",
        "Case Studies",
        "Team/About",
        "Testimonials",
        "CTA",
      ],
      ctaPlacement: "Hero, after case studies, footer. Contextual CTAs within content.",
      whitespaceApproach: "Generous to very generous. Premium feel.",
    },

    ctaStrategy: {
      effectiveLanguage: [
        "Schedule a Consultation",
        "Book a Strategy Call",
        "Get Your Assessment",
        "Let's Discuss Your Situation",
        "Request a Proposal",
      ],
      buttonStyle: "Solid or subtle gradient. Professional, not playful.",
      urgencyApproach:
        'None. Professional services don\'t need urgency. Scarcity can work ("3 new client slots this quarter").',
      avoid: ["Free consultation (devalues service)", "Limited time offer", "Aggressive urgency language"],
    },

    commonMistakes: [
      "Talking about yourself instead of client outcomes",
      "Vague value propositions",
      "No clear differentiation from competitors",
      "Hiding the human element (people buy from people)",
      "Too much jargon",
    ],

    competitorInsights: {
      topPerformerTraits: [
        "Client outcome in headline, not service description",
        "Clear articulation of ideal client",
        "Transparent process explanation",
        "Strong founder/team presence",
      ],
      differentiationOpportunities: [
        "Niche specialization clarity",
        "Proprietary framework or methodology",
        "Results guarantee or risk-reversal",
        "Educational content that demonstrates expertise",
      ],
    },
  },

  // ============================================================================
  // HEALTHCARE & MEDICAL
  // ============================================================================
  "healthcare-medical": {
    industry: "Healthcare & Medical",
    audienceProfile:
      "Patients seeking care, healthcare administrators, practitioners. Anxious (patients), busy (admins), detail-oriented (practitioners). Trust is paramount.",

    colorStrategy: {
      psychology: "Calm, trust, cleanliness, care. Patients need reassurance. Professionals need credibility signals.",
      dominantColors: ["Calming teal (#0891B2)", "Medical blue (#0284C7)", "Clean white (#FFFFFF)"],
      accentColors: ["Healing green (#10B981)", "Trust purple (#7C3AED)", "Warm coral (#F97316)"],
      avoid: ["Red (anxiety, emergency)", "Dark/moody palettes", "Harsh contrasts"],
      reasoning: "Teal and blue reduce anxiety while maintaining professionalism. Green signals health and healing.",
    },

    typographyStrategy: {
      headingStyle: "Friendly but professional sans-serif. Weight 600. Approachable, not cold.",
      bodyStyle: "Highly readable, 17-18px. Generous spacing. Consider accessibility.",
      hierarchy: "Clear but gentle. Don't shout at anxious patients.",
      avoid: ["Cold, clinical fonts", "Anything hard to read", "Decorative fonts"],
      reasoning: "Healthcare audiences may be stressed or elderly. Readability and approachability are critical.",
    },

    imageryStrategy: {
      primaryStyle: "Warm, humanizing photography. Real staff and patients (with consent). Clean, bright environments.",
      effectiveSubjects: [
        "Caring staff interactions",
        "Modern, clean facilities",
        "Diverse patient representation",
        "Technology in healthcare context",
        "Calming environmental elements",
      ],
      treatments: ["Bright and airy", "Warm color grading", "Soft shadows"],
      avoid: [
        "Sterile, cold clinical imagery",
        "Scary medical equipment without context",
        "Stock photos that look fake",
        "Distressed or unhappy patients",
      ],
      reasoning: "Humanize the healthcare experience. Patients want to see themselves receiving compassionate care.",
    },

    trustSignals: {
      critical: [
        "Board certifications and credentials",
        "Hospital/practice affiliations",
        "Patient satisfaction scores",
        "Accreditations (Joint Commission, etc.)",
        "Insurance accepted",
      ],
      effective: [
        "Patient testimonials (HIPAA-compliant)",
        "Years of experience",
        "Procedures performed count",
        "Awards and recognition",
        "Community involvement",
      ],
      placement: "Credentials near hero. Testimonials throughout. Accreditations in footer.",
      avoid: ["Unverifiable claims", "Guarantees on medical outcomes", "Pressure tactics"],
    },

    layoutPatterns: {
      heroStyle: "Welcoming image, empathetic headline. Clear path to action (book appointment).",
      sectionFlow: [
        "Hero",
        "Services/Conditions Treated",
        "Why Choose Us",
        "Meet the Team",
        "Patient Stories",
        "Insurance/Logistics",
        "Contact/Book",
      ],
      ctaPlacement: "Hero (book now), sticky header, multiple contextual throughout.",
      whitespaceApproach: "Generous. Calming. Don't overwhelm.",
    },

    ctaStrategy: {
      effectiveLanguage: [
        "Book Your Appointment",
        "Schedule a Consultation",
        "Request an Appointment",
        "Call Our Office",
        "Get Started Today",
      ],
      buttonStyle: "Solid, calming color. Clear and prominent but not aggressive.",
      urgencyApproach: 'Minimal. "Same-day appointments available" is okay. No pressure.',
      avoid: ["Limited time offers", "Aggressive discount language", "Fear-based urgency"],
    },

    commonMistakes: [
      "Too clinical and cold",
      "Hiding pricing and insurance information",
      "No online booking option",
      "Poor mobile experience",
      "Stock photos that don't represent actual staff",
      "Jargon-heavy without patient explanations",
    ],

    competitorInsights: {
      topPerformerTraits: [
        "Patient-centric language",
        "Easy online scheduling",
        "Virtual tour or facility photos",
        "Clear service/condition pages",
      ],
      differentiationOpportunities: [
        "Telehealth options prominently featured",
        "Patient portal integration",
        "Educational content library",
        "Transparent pricing (where legal)",
      ],
    },
  },

  // ============================================================================
  // SAAS / SOFTWARE
  // ============================================================================
  "saas-software": {
    industry: "SaaS & Software",
    audienceProfile:
      "Product managers, developers, technical buyers, executives. Informed, comparison-shopping, want to see the product. Value efficiency and innovation.",

    colorStrategy: {
      psychology: "Innovation, efficiency, modernity. SaaS buyers expect contemporary visual language.",
      dominantColors: ["Indigo (#6366F1)", "Violet (#8B5CF6)", "Slate (#1E293B)"],
      accentColors: ["Cyan (#06B6D4)", "Emerald (#10B981)", "Amber (#F59E0B)"],
      avoid: ["Dated color schemes", "Overly corporate blues", "Dull, muted palettes"],
      reasoning: "SaaS is competitive. Visual innovation signals product innovation. Dark mode is now expected.",
    },

    typographyStrategy: {
      headingStyle: "Modern sans-serif (Inter, Manrope). Weight 600-700. Tight letter-spacing.",
      bodyStyle: "Clean, code-friendly font. 16px. Good for both prose and technical content.",
      hierarchy: "Clear, scannable. Technical audiences skim.",
      avoid: ["Serif fonts (feel dated in SaaS)", "Overly stylized fonts"],
      reasoning: "Typography should feel like the product: modern, efficient, considered.",
    },

    imageryStrategy: {
      primaryStyle: "Product screenshots, UI mockups, abstract geometric patterns, gradient meshes.",
      effectiveSubjects: [
        "Product UI (hero, features)",
        "Dashboard screenshots",
        "Integration visualizations",
        "Abstract data/flow representations",
        "Team photos (optional, humanizing)",
      ],
      treatments: ["Vibrant gradients", "Glassmorphism", "3D elements", "Subtle animation"],
      avoid: [
        "Generic stock photography",
        "Dated UI screenshots",
        'Cheesy "technology" imagery',
        "Overcrowded feature montages",
      ],
      reasoning: "Show the product. SaaS buyers want to see what they're getting before signing up.",
    },

    trustSignals: {
      critical: [
        "Customer logos",
        "G2/Capterra ratings",
        "User/customer count",
        "Security certifications (SOC 2, GDPR)",
        "Uptime statistics",
      ],
      effective: [
        "Case studies with metrics",
        "Integration partner logos",
        "Press mentions",
        "Community size (if applicable)",
        "Open source contributions (if applicable)",
      ],
      placement: "Logo bar after hero. Social proof throughout. Security in footer.",
      avoid: ["Fake metrics", "Purchased reviews", 'Vague "thousands of users"'],
    },

    layoutPatterns: {
      heroStyle:
        "Product-focused. Screenshot or demo video prominent. Clear value prop. Dual CTAs (primary + secondary).",
      sectionFlow: [
        "Hero + Product Visual",
        "Logo Bar",
        "Feature Highlights",
        "Product Deep Dive",
        "Use Cases",
        "Pricing",
        "Testimonials",
        "FAQ",
        "CTA",
      ],
      ctaPlacement: "Hero (Start Free + Watch Demo), sticky header, after features, pricing table, footer.",
      whitespaceApproach: "Balanced. Not too sparse (feels incomplete), not cramped (feels cheap).",
    },

    ctaStrategy: {
      effectiveLanguage: [
        "Start Free Trial",
        "Get Started Free",
        "Try for Free",
        "Book a Demo",
        "See It in Action",
        "Start Building",
      ],
      buttonStyle: "Gradient or solid primary. Secondary as outline. Animation on hover acceptable.",
      urgencyApproach: 'Minimal. "Free for 14 days" is fine. No fake scarcity.',
      avoid: ["Contact Sales (as primary CTA)", "Learn More (too weak)", "Submit (for forms)"],
    },

    commonMistakes: [
      "No product screenshots above the fold",
      "Hiding pricing",
      "Too many features, no clear value prop",
      "No free trial or demo option",
      "Ignoring mobile experience",
      "Generic messaging that could apply to any tool",
    ],

    competitorInsights: {
      topPerformerTraits: [
        "Product-led hero with clear screenshot",
        "Transparent pricing",
        "Interactive demos",
        "Strong differentiation in headline",
      ],
      differentiationOpportunities: [
        "Interactive product tour",
        "ROI calculator",
        "Comparison pages vs competitors",
        "Video testimonials from recognizable companies",
      ],
    },
  },

  // ============================================================================
  // REAL ESTATE
  // ============================================================================
  "real-estate": {
    industry: "Real Estate",
    audienceProfile:
      "Home buyers, sellers, investors, renters. Emotional (buyers), practical (sellers), analytical (investors). Local expertise matters.",

    colorStrategy: {
      psychology:
        "Trust, sophistication, local expertise. Real estate is high-stakes; colors should convey reliability.",
      dominantColors: ["Sophisticated charcoal (#1F2937)", "Warm cream (#FFFBF5)", "Navy (#1E3A5F)"],
      accentColors: ["Warm amber (#D97706)", "Forest green (#15803D)", "Muted gold (#B8860B)"],
      avoid: ["Cold, sterile colors", "Overly trendy palettes", "Harsh neons"],
      reasoning: "Real estate imagery carries the color load. Brand colors should be sophisticated backdrops.",
    },

    typographyStrategy: {
      headingStyle: "Elegant serif (Playfair Display) or refined sans-serif. Weight 500-600.",
      bodyStyle: "Clean sans-serif for readability. 16px.",
      hierarchy: "Sophisticated contrast. Headlines should feel aspirational.",
      avoid: ["Overly casual fonts", "Generic system fonts", "Condensed faces"],
      reasoning: "Real estate is aspirational. Typography should elevate, not commoditize.",
    },

    imageryStrategy: {
      primaryStyle: "High-quality property photography. Lifestyle imagery. Local area shots.",
      effectiveSubjects: [
        "Stunning property exteriors and interiors",
        "Neighborhood and community shots",
        "Agent professional headshots",
        "Lifestyle imagery (families in homes)",
        "Local landmarks and amenities",
      ],
      treatments: ["Bright, inviting", "HDR for interiors", "Warm color grading"],
      avoid: [
        "Dark, unflattering property photos",
        "Empty, staged-looking rooms",
        "Generic stock houses",
        "Poor quality phone photos",
      ],
      reasoning: "In real estate, imagery IS the product. Photography quality directly impacts perceived value.",
    },

    trustSignals: {
      critical: [
        "Transaction count or volume",
        "Years in local market",
        "Brokerage affiliation",
        "Realtor certifications",
        "Local market expertise",
      ],
      effective: [
        "Recent sales with addresses",
        "Client testimonials (with photos)",
        "Awards and recognition",
        "Community involvement",
        "Media features",
      ],
      placement: "Stats in hero area. Testimonials throughout. Recent sales as social proof.",
      avoid: ["Vague claims of success", "National statistics vs local", "Outdated sales data"],
    },

    layoutPatterns: {
      heroStyle: "Stunning property image or search-focused. Clear value prop for buyer/seller. Location prominent.",
      sectionFlow: [
        "Hero",
        "Search/Featured Listings",
        "Why Choose [Agent]",
        "Recent Sales/Success",
        "Testimonials",
        "About/Team",
        "Contact",
      ],
      ctaPlacement: "Hero (search or contact), property cards, dedicated contact section.",
      whitespaceApproach: "Generous. Let property images breathe.",
    },

    ctaStrategy: {
      effectiveLanguage: [
        "Find Your Home",
        "Get Your Home Value",
        "Schedule a Showing",
        "Let's Talk",
        "Start Your Search",
        "Sell Your Home",
      ],
      buttonStyle: "Solid, warm accent color. Not aggressive.",
      urgencyApproach: '"Homes sell fast in [area]" is fine. No fake scarcity.',
      avoid: ['Generic "Contact Us"', "Pressure language", "Misleading market claims"],
    },

    commonMistakes: [
      "Poor property photography",
      "No local expertise demonstration",
      "Agent-focused instead of client-focused",
      "Outdated listings displayed",
      "No mobile-friendly property search",
      "Missing neighborhood/area information",
    ],

    competitorInsights: {
      topPerformerTraits: [
        "Hyperlocal expertise front and center",
        "Stunning photography",
        "Clear buyer vs seller paths",
        "Personal brand + professional affiliation",
      ],
      differentiationOpportunities: [
        "Interactive market reports",
        "Video property tours",
        "Neighborhood guides",
        "Instant home valuation tools",
      ],
    },
  },

  // ============================================================================
  // FITNESS & WELLNESS
  // ============================================================================
  "fitness-wellness": {
    industry: "Fitness & Wellness",
    audienceProfile:
      "Health-conscious individuals, gym-goers, wellness seekers. Motivated but skeptical of hype. Want results and community.",

    colorStrategy: {
      psychology: "Energy, motivation, transformation. Colors should inspire action without feeling aggressive.",
      dominantColors: ["Energetic black (#0A0A0A)", "Pure white (#FFFFFF)", "Charcoal (#171717)"],
      accentColors: ["Vibrant red (#DC2626)", "Electric green (#22C55E)", "Energy orange (#F97316)"],
      avoid: ["Dull, muted colors", "Pastels (feel weak)", "Corporate blues"],
      reasoning: "Fitness is about energy and transformation. Colors should feel dynamic and motivating.",
    },

    typographyStrategy: {
      headingStyle: "Bold, impactful sans-serif (Oswald, Montserrat Bold). Weight 700-800. Uppercase acceptable.",
      bodyStyle: "Clean sans-serif. 16px. Strong readability.",
      hierarchy: "High contrast. Headlines should hit hard.",
      avoid: ["Elegant/refined fonts", "Thin weights", "Serif fonts"],
      reasoning: "Fitness audiences respond to bold, confident typography. It mirrors the energy of the experience.",
    },

    imageryStrategy: {
      primaryStyle: "Dynamic action photography. Real people working out. Transformation stories.",
      effectiveSubjects: [
        "People mid-workout (not posed)",
        "Transformation before/afters",
        "Community/group fitness",
        "Facility and equipment",
        "Trainers in action",
      ],
      treatments: ["High contrast", "Dynamic crops", "Motion blur acceptable", "Dark overlays"],
      avoid: [
        "Overly posed fitness models",
        "Intimidating imagery",
        "Unrealistic body expectations",
        "Empty gym photos",
      ],
      reasoning: "Show real transformation and community. Aspirational but achievable.",
    },

    trustSignals: {
      critical: [
        "Transformation results (with permission)",
        "Certifications (CPT, etc.)",
        "Member count or community size",
        "Success stories",
        "Years of experience",
      ],
      effective: [
        "Before/after photos",
        "Video testimonials",
        "Social media following",
        "Media features",
        "Competition results (if applicable)",
      ],
      placement: "Transformations throughout. Stats in hero. Testimonials dedicated section.",
      avoid: ["Unrealistic promises", "Fake testimonials", '"Get ripped in 7 days" claims'],
    },

    layoutPatterns: {
      heroStyle: "Dynamic action image, bold headline with clear outcome, strong CTA.",
      sectionFlow: ["Hero", "Programs/Services", "Transformations", "About/Trainers", "Pricing/Plans", "FAQ", "CTA"],
      ctaPlacement: "Hero, after transformations, pricing section, footer.",
      whitespaceApproach: "Moderate to compact. Energy over elegance.",
    },

    ctaStrategy: {
      effectiveLanguage: [
        "Start Your Transformation",
        "Claim Your Free Session",
        "Join the Community",
        "Book Your First Class",
        "Get Started Today",
        "Begin Your Journey",
      ],
      buttonStyle: "Bold, high-contrast. Solid fill. Can use red or green.",
      urgencyApproach: '"Limited spots available" for classes is fine. New year/seasonal offers work.',
      avoid: ["Pressure tactics", "Shame-based language", "Unrealistic promises"],
    },

    commonMistakes: [
      "Intimidating imagery that scares beginners",
      "Hiding pricing",
      "No social proof or testimonials",
      'Generic "lose weight, get fit" messaging',
      "Poor mobile experience for booking",
      "No community element shown",
    ],

    competitorInsights: {
      topPerformerTraits: [
        "Community-focused messaging",
        "Real transformation stories",
        "Clear pricing",
        "Easy booking process",
      ],
      differentiationOpportunities: [
        "Free trial or assessment",
        "Beginner-specific messaging",
        "Virtual/hybrid options",
        "Progress tracking technology",
      ],
    },
  },

  // ============================================================================
  // LEGAL SERVICES
  // ============================================================================
  "legal-services": {
    industry: "Legal Services",
    audienceProfile:
      "Individuals in legal trouble, businesses needing counsel, people navigating life events (divorce, estate). Stressed, seeking expertise and reassurance.",

    colorStrategy: {
      psychology: "Authority, trust, stability. Legal clients need confidence that you can handle serious matters.",
      dominantColors: ["Deep navy (#1E3A5F)", "Charcoal (#1F2937)", "White (#FFFFFF)"],
      accentColors: ["Burgundy (#7F1D1D)", "Gold (#B8860B)", "Forest green (#15803D)"],
      avoid: ["Playful colors", "Bright/energetic palettes", "Trendy tech colors"],
      reasoning: "Legal services require gravitas. Colors should convey experience and stability.",
    },

    typographyStrategy: {
      headingStyle: "Traditional serif (Merriweather, Lora) or refined sans-serif. Weight 600.",
      bodyStyle: "Readable serif or sans-serif. 16-17px.",
      hierarchy: "Clear, authoritative. Not flashy.",
      avoid: ["Modern/trendy fonts", "Light weights", "Casual typefaces"],
      reasoning: "Legal typography should feel established and trustworthy, not startup-y.",
    },

    imageryStrategy: {
      primaryStyle: "Professional firm photography. Confident attorney portraits. Subtle office environments.",
      effectiveSubjects: [
        "Attorney headshots (confident, approachable)",
        "Courthouse or legal imagery (subtle)",
        "Office/meeting room environments",
        "Community involvement",
      ],
      treatments: ["Professional, polished", "Warm but not casual", "High quality"],
      avoid: ["Aggressive courtroom drama imagery", "Intimidating poses", "Generic stock lawyers", "Gavel clichés"],
      reasoning: "Clients want to see the person who will represent them. Confidence without arrogance.",
    },

    trustSignals: {
      critical: [
        "Bar admissions and credentials",
        "Years of experience",
        "Case results (where permitted)",
        "Practice area expertise",
        "Professional affiliations",
      ],
      effective: [
        "Super Lawyers, Best Lawyers ratings",
        "Client testimonials (permitted)",
        "Notable cases or clients",
        "Published articles or media",
        "Community involvement",
      ],
      placement: "Credentials near hero. Testimonials where permitted. Results with disclaimers.",
      avoid: ["Guaranteed outcomes", "Misleading success statistics", "Anything ethically questionable"],
    },

    layoutPatterns: {
      heroStyle: "Professional, reassuring. Clear practice area indication. Easy path to contact.",
      sectionFlow: [
        "Hero",
        "Practice Areas",
        "Why Choose Us",
        "Attorney Profiles",
        "Results/Testimonials",
        "FAQ",
        "Contact",
      ],
      ctaPlacement: "Hero, practice area pages, throughout. Phone number prominent.",
      whitespaceApproach: "Generous. Dignified, not cluttered.",
    },

    ctaStrategy: {
      effectiveLanguage: [
        "Schedule a Consultation",
        "Discuss Your Case",
        "Get Legal Help",
        "Call for a Free Review",
        "Speak with an Attorney",
      ],
      buttonStyle: "Solid, professional color. Phone number as secondary CTA.",
      urgencyApproach: '"Consultations available this week" is fine. No pressure.',
      avoid: ["Aggressive sales language", "Ambulance-chaser vibes", "Guaranteed results"],
    },

    commonMistakes: [
      "Too much legal jargon",
      "No clear practice area focus",
      "Hiding attorney profiles",
      "No path to immediate contact",
      "Poor mobile experience",
      'No testimonials (even if "peer reviews")',
    ],

    competitorInsights: {
      topPerformerTraits: [
        "Clear practice area specialization",
        "Attorney personalities visible",
        "Easy consultation booking",
        "Results where ethically permitted",
      ],
      differentiationOpportunities: [
        "Free case evaluation",
        "Educational content library",
        "Virtual consultation options",
        "Chat functionality for intake",
      ],
    },
  },

  // ============================================================================
  // FINANCIAL SERVICES
  // ============================================================================
  "financial-services": {
    industry: "Financial Services",
    audienceProfile:
      "Individuals seeking financial guidance, business owners, high-net-worth clients. Trust-sensitive, detail-oriented, seeking long-term relationships.",

    colorStrategy: {
      psychology: "Trust, stability, growth, security. Money is sensitive; colors must reassure.",
      dominantColors: ["Navy blue (#1E3A8A)", "Deep green (#166534)", "Charcoal (#1F2937)"],
      accentColors: ["Gold (#B8860B)", "Silver (#64748B)", "Subtle teal (#0D9488)"],
      avoid: ["Risky/aggressive colors", "Trendy palettes", "Anything that feels unstable"],
      reasoning: "Blue and green are universal trust colors in finance. Gold signals wealth without being gaudy.",
    },

    typographyStrategy: {
      headingStyle: "Refined sans-serif or serif. Weight 600. Professional, not flashy.",
      bodyStyle: "Clean, readable. 16px. Tables and numbers must be clear.",
      hierarchy: "Clear, organized. Financial content needs structure.",
      avoid: ["Trendy fonts", "Anything hard to read", "Decorative typefaces"],
      reasoning: "Financial decisions require clarity. Typography should organize, not obscure.",
    },

    imageryStrategy: {
      primaryStyle:
        "Professional lifestyle imagery. Abstract representations of growth/security. Diverse client representation.",
      effectiveSubjects: [
        "Comfortable retirement imagery",
        "Family/life milestones",
        "Growth visualizations (tasteful)",
        "Advisor-client meetings",
        "Professional team photos",
      ],
      treatments: ["Warm, reassuring", "Professional lighting", "Diverse representation"],
      avoid: [
        "Piles of money imagery",
        "Gambling/risk imagery",
        "Luxury lifestyle clichés",
        "Stressed financial imagery",
      ],
      reasoning: "Focus on outcomes (security, family, peace of mind), not the money itself.",
    },

    trustSignals: {
      critical: [
        "Credentials (CFP, CFA, etc.)",
        "Regulatory registrations",
        "Fiduciary statement",
        "Years in business",
        "Assets under management (if applicable)",
      ],
      effective: [
        "Client testimonials",
        "Professional affiliations",
        "Insurance and bonding",
        "Media/press mentions",
        "Educational credentials",
      ],
      placement: "Credentials prominent. Compliance information accessible. Trust throughout.",
      avoid: ["Unrealistic return promises", "Unverifiable claims", "Pressure tactics"],
    },

    layoutPatterns: {
      heroStyle: "Trustworthy imagery, outcome-focused headline, clear CTA for consultation.",
      sectionFlow: ["Hero", "Services", "Approach/Philosophy", "Team", "Client Stories", "Resources", "Contact"],
      ctaPlacement: "Hero, after services, dedicated consultation section.",
      whitespaceApproach: "Generous. Trustworthy, not salesy.",
    },

    ctaStrategy: {
      effectiveLanguage: [
        "Schedule Your Consultation",
        "Get Your Financial Plan",
        "Start Your Assessment",
        "Let's Discuss Your Goals",
        "Request Your Review",
      ],
      buttonStyle: "Solid, trustworthy color. Professional.",
      urgencyApproach: 'None typically. "Year-end planning" seasonal is okay.',
      avoid: ["Get rich language", "Aggressive sales tactics", "Unrealistic promises"],
    },

    commonMistakes: [
      "Focusing on products instead of client outcomes",
      "Too much jargon",
      "No clear differentiation",
      "Missing credentials/compliance info",
      "Impersonal, corporate feel",
      "No educational content",
    ],

    competitorInsights: {
      topPerformerTraits: [
        "Client outcome focus",
        "Clear philosophy/approach",
        "Advisor personalities visible",
        "Educational resources",
      ],
      differentiationOpportunities: [
        "Fee transparency",
        "Financial planning tools",
        "Educational webinars",
        "Niche specialization",
      ],
    },
  },

  // ============================================================================
  // E-COMMERCE / RETAIL
  // ============================================================================
  "ecommerce-retail": {
    industry: "E-commerce & Retail",
    audienceProfile:
      "Consumers shopping for products. Impatient, comparison-shopping, seeking value and trust. Mobile-first behavior.",

    colorStrategy: {
      psychology:
        "Brand-dependent but generally: trust, value, urgency (carefully). Colors should not compete with products.",
      dominantColors: ["Clean white (#FFFFFF)", "Neutral gray (#F3F4F6)", "Brand primary (varies)"],
      accentColors: ["Action orange (#F97316)", "Trust blue (#3B82F6)", "Sale red (#DC2626)"],
      avoid: ["Colors that compete with product imagery", "Dull, lifeless palettes"],
      reasoning: "Products should be the visual hero. Background colors should support, not compete.",
    },

    typographyStrategy: {
      headingStyle: "Clean, modern sans-serif. Weight 600-700.",
      bodyStyle: "Highly readable. 15-16px. Good for scanning.",
      hierarchy: "Clear pricing hierarchy. Product titles prominent.",
      avoid: ["Fonts that slow down reading", "Overly decorative faces"],
      reasoning: "E-commerce is about efficiency. Typography should help shoppers find and buy quickly.",
    },

    imageryStrategy: {
      primaryStyle: "High-quality product photography. Lifestyle context. User-generated content.",
      effectiveSubjects: [
        "Product photography (multiple angles)",
        "Products in use (lifestyle)",
        "User-generated photos",
        "Scale/size context imagery",
        "Unboxing/packaging",
      ],
      treatments: ["Consistent lighting", "Clean backgrounds", "Multiple views"],
      avoid: ["Poor quality product photos", "Inconsistent styling", "Stock photos instead of real products"],
      reasoning: "Online shoppers can't touch products. Photography must bridge that gap.",
    },

    trustSignals: {
      critical: [
        "Customer reviews and ratings",
        "Security badges (SSL, payment security)",
        "Return policy clarity",
        "Shipping information",
        "Contact information",
      ],
      effective: [
        "User-generated photos in reviews",
        "Trust pilot/third-party ratings",
        "Press mentions",
        "Social proof (X sold, X reviews)",
        "Money-back guarantee",
      ],
      placement: "Reviews on product pages. Security in checkout. Trust throughout.",
      avoid: ["Fake reviews", "Unclear policies", "Hidden fees"],
    },

    layoutPatterns: {
      heroStyle: "Product/collection focused. Clear value prop or promotion. Easy navigation to shop.",
      sectionFlow: [
        "Hero/Promo",
        "Featured Products",
        "Categories",
        "Bestsellers",
        "Reviews/Social Proof",
        "About Brand",
        "Footer with Trust",
      ],
      ctaPlacement: "Every product card. Sticky add-to-cart on mobile.",
      whitespaceApproach: "Balanced. Products need room to breathe but page shouldn't feel empty.",
    },

    ctaStrategy: {
      effectiveLanguage: ["Add to Cart", "Buy Now", "Shop Now", "Get Yours", "View Collection"],
      buttonStyle: "High contrast, prominent. Action-oriented.",
      urgencyApproach: "Stock indicators, limited-time sales are acceptable. No fake urgency.",
      avoid: ["Fake countdown timers", "Misleading scarcity", "Aggressive pop-ups"],
    },

    commonMistakes: [
      "Poor product photography",
      "No reviews or social proof",
      "Complicated checkout",
      "Unclear shipping/return policies",
      "Slow site speed",
      "Bad mobile experience",
    ],

    competitorInsights: {
      topPerformerTraits: [
        "Excellent product photography",
        "Strong review presence",
        "Fast, simple checkout",
        "Mobile-first design",
      ],
      differentiationOpportunities: [
        "Augmented reality try-on",
        "Personalized recommendations",
        "Loyalty programs",
        "Exceptional unboxing experience",
      ],
    },
  },

  // ============================================================================
  // EDUCATION & COACHING
  // ============================================================================
  "education-coaching": {
    industry: "Education & Coaching",
    audienceProfile:
      "Learners seeking transformation, professionals upskilling, individuals seeking guidance. Motivated but skeptical of empty promises. Value results and credibility.",

    colorStrategy: {
      psychology: "Growth, inspiration, trust, transformation. Colors should motivate without overwhelming.",
      dominantColors: ["Inspiring blue (#2563EB)", "Warm white (#FFFBF8)", "Soft navy (#334155)"],
      accentColors: ["Growth green (#10B981)", "Energy orange (#F97316)", "Creative purple (#7C3AED)"],
      avoid: ["Dull, uninspiring colors", "Overly corporate palettes", "Aggressive red"],
      reasoning: "Education is about growth and possibility. Colors should inspire without feeling salesy.",
    },

    typographyStrategy: {
      headingStyle: "Warm, approachable sans-serif. Weight 600-700. Inspiring but not aggressive.",
      bodyStyle: "Highly readable. 17px. Easy on the eyes for course content.",
      hierarchy: "Clear, organized. Learning journeys need structure.",
      avoid: ["Cold, corporate fonts", "Overly casual faces"],
      reasoning: "Education typography should feel approachable and professional simultaneously.",
    },

    imageryStrategy: {
      primaryStyle: "Authentic coach/instructor presence. Students/clients in action. Transformation imagery.",
      effectiveSubjects: [
        "Coach/instructor in teaching moments",
        "Student success stories",
        "Behind-the-scenes of course creation",
        "Community and group interactions",
        "Course content previews",
      ],
      treatments: ["Warm, authentic", "Natural lighting", "Real moments over posed"],
      avoid: ['Generic "education" stock', "Overly polished, inauthentic", "Empty classroom imagery"],
      reasoning: "Education is personal. Imagery should show the human element and real results.",
    },

    trustSignals: {
      critical: [
        "Student/client results",
        "Instructor credentials",
        "Testimonials with specific outcomes",
        "Course/program reviews",
        "Refund/guarantee policy",
      ],
      effective: ["Media features", "Published works", "Community size", "Completion rates", "Employer partnerships"],
      placement: "Results throughout. Testimonials after value explanation. Guarantee near CTA.",
      avoid: ["Income claims without disclaimers", "Unrealistic transformation promises", "Fake testimonials"],
    },

    layoutPatterns: {
      heroStyle: "Instructor presence or transformation promise. Clear program outcome. Strong CTA.",
      sectionFlow: [
        "Hero",
        "Problem/Struggle",
        "Transformation Promise",
        "Program Details",
        "Instructor/About",
        "Results/Testimonials",
        "FAQ",
        "Enrollment CTA",
      ],
      ctaPlacement: "Hero, after testimonials, dedicated enrollment section.",
      whitespaceApproach: "Generous. Premium feel justifies investment.",
    },

    ctaStrategy: {
      effectiveLanguage: [
        "Enroll Now",
        "Start Your Transformation",
        "Join the Program",
        "Begin Your Journey",
        "Get Instant Access",
        "Book Your Discovery Call",
      ],
      buttonStyle: "Warm, inviting. Solid color. Not aggressive.",
      urgencyApproach: "Cohort-based enrollment dates are fine. Limited spots can work if true.",
      avoid: ["Fake scarcity", "Pressure tactics", "Get rich quick language"],
    },

    commonMistakes: [
      "Vague transformation promises",
      "No social proof or results",
      "Hiding the instructor",
      "Too much focus on features vs outcomes",
      "No clear curriculum or what they'll learn",
      "Aggressive sales tactics that damage trust",
    ],

    competitorInsights: {
      topPerformerTraits: [
        "Clear outcome in headline",
        "Instructor credibility prominent",
        "Specific, verifiable results",
        "Community element highlighted",
      ],
      differentiationOpportunities: [
        "Free valuable content to build trust",
        "Community access included",
        "Personalized support options",
        "Money-back guarantee",
      ],
    },
  },

  // ============================================================================
  // AGENCY / CREATIVE
  // ============================================================================
  "agency-creative": {
    industry: "Agency & Creative Services",
    audienceProfile:
      "Business owners, marketing managers, startups seeking creative help. Value creativity, results, and cultural fit. Portfolio is everything.",

    colorStrategy: {
      psychology:
        "Creativity, innovation, confidence. Colors should demonstrate creative capability without overwhelming.",
      dominantColors: ["Bold black (#0A0A0A)", "Clean white (#FFFFFF)", "Brand accent (distinctive)"],
      accentColors: ["Electric blue (#3B82F6)", "Vibrant pink (#EC4899)", "Creative purple (#8B5CF6)"],
      avoid: ["Dull, safe palettes", "Generic corporate colors"],
      reasoning: "Agency websites ARE the portfolio. Design should demonstrate capability.",
    },

    typographyStrategy: {
      headingStyle: "Distinctive, confident. Can be more expressive than other industries. Weight 600-800.",
      bodyStyle: "Clean, modern. 16px.",
      hierarchy: "Can be more experimental while maintaining clarity.",
      avoid: ["Generic, forgettable fonts", "Hard to read experimentations"],
      reasoning: "Typography choice signals creative sophistication. Be memorable.",
    },

    imageryStrategy: {
      primaryStyle: "Portfolio work. Behind-the-scenes. Team culture.",
      effectiveSubjects: [
        "Best portfolio pieces (hero-worthy)",
        "Project case study imagery",
        "Team personality and culture",
        "Process and workspace",
        "Client collaborations",
      ],
      treatments: ["High-impact", "Can be experimental", "Consistent portfolio presentation"],
      avoid: ["Competitor work", "Low-quality portfolio pieces", "Generic office stock"],
      reasoning: "Creative agencies are hired for their taste. Every image is a portfolio piece.",
    },

    trustSignals: {
      critical: [
        "Portfolio quality",
        "Client logos",
        "Case study results",
        "Awards and recognition",
        "Team credentials",
      ],
      effective: [
        "Client testimonials",
        "Press features",
        "Industry awards",
        "Speaking engagements",
        "Published thought leadership",
      ],
      placement: "Portfolio prominent. Logos after hero. Awards where relevant.",
      avoid: ["Weak portfolio pieces", "Vague case studies", "Claiming credit for others' work"],
    },

    layoutPatterns: {
      heroStyle: "Portfolio-led or bold statement. Demonstrate creativity immediately.",
      sectionFlow: ["Hero", "Featured Work", "Services", "Case Studies", "Team", "Clients", "Contact"],
      ctaPlacement: "Hero, after portfolio, dedicated contact section.",
      whitespaceApproach: "Generous to very generous. Let work breathe.",
    },

    ctaStrategy: {
      effectiveLanguage: ["Let's Create", "Start a Project", "Get in Touch", "Work With Us", "See Our Work"],
      buttonStyle: "Can be distinctive/creative. Should match brand.",
      urgencyApproach: "Generally none. Creative work doesn't need urgency.",
      avoid: ["Generic CTAs", "Desperation", "Commoditized language"],
    },

    commonMistakes: [
      "Weak or outdated portfolio",
      "No case studies with results",
      "Hiding the team",
      "Being too clever at expense of clarity",
      "No clear service offerings",
      "Poor mobile experience",
    ],

    competitorInsights: {
      topPerformerTraits: [
        "Stunning portfolio presentation",
        "Case studies with results",
        "Team personality visible",
        "Clear positioning/niche",
      ],
      differentiationOpportunities: [
        "Niche specialization",
        "Transparent process explanation",
        "Content that demonstrates expertise",
        "Innovative website experience itself",
      ],
    },
  },

  // ============================================================================
  // EVENTS & ENTERTAINMENT
  // ============================================================================
  "events-entertainment": {
    industry: "Events & Entertainment",
    audienceProfile:
      "Event planners, couples (weddings), corporate clients, consumers seeking entertainment. Emotional, visual, seeking memorable experiences.",

    colorStrategy: {
      psychology: "Excitement, elegance (weddings), professionalism (corporate). Depends on segment.",
      dominantColors: ["Elegant black (#0A0A0A)", "Clean white (#FFFFFF)", "Segment-specific accent"],
      accentColors: ["Champagne gold (#D4AF37)", "Event purple (#7C3AED)", "Energy orange (#F97316)"],
      avoid: ["Dull colors", "Conflicting palettes"],
      reasoning: "Events are about emotion. Colors should match the feeling of the experience.",
    },

    typographyStrategy: {
      headingStyle: "Elegant serif (weddings) or bold sans (entertainment). Weight varies by segment.",
      bodyStyle: "Clean, readable. 16px.",
      hierarchy: "Can be more expressive for entertainment, refined for weddings.",
      avoid: ["Inappropriate fonts for segment"],
      reasoning: "Typography should match the event type and audience expectations.",
    },

    imageryStrategy: {
      primaryStyle: "Past event photography. Emotional moments. Venue/experience shots.",
      effectiveSubjects: [
        "Previous events (best work)",
        "Emotional moments captured",
        "Venue and setup shots",
        "Team in action",
        "Client celebrations",
      ],
      treatments: ["Professional event photography", "Emotional storytelling", "High-quality captures"],
      avoid: ["Poor quality event photos", "Empty venue shots", "Generic stock events"],
      reasoning: "Events are experiential. Imagery must capture the feeling and quality of the experience.",
    },

    trustSignals: {
      critical: [
        "Event portfolio/gallery",
        "Testimonials from past clients",
        "Events completed count",
        "Venue partnerships",
        "Insurance/licensing",
      ],
      effective: [
        "Video highlights from events",
        "Featured weddings/events",
        "Awards and recognition",
        "Vendor partnerships",
        "Social media presence",
      ],
      placement: "Portfolio prominent. Testimonials throughout. Trust signals in footer.",
      avoid: ["Old, dated event photos", "Vague testimonials", "Missing credentials"],
    },

    layoutPatterns: {
      heroStyle: "Stunning event imagery or video. Emotional headline. Clear CTA for inquiry.",
      sectionFlow: ["Hero", "Services/Packages", "Portfolio/Gallery", "Process", "Testimonials", "FAQ", "Contact"],
      ctaPlacement: "Hero, after portfolio, dedicated inquiry section.",
      whitespaceApproach: "Generous. Let imagery breathe.",
    },

    ctaStrategy: {
      effectiveLanguage: [
        "Plan Your Event",
        "Get a Quote",
        "Check Availability",
        "Let's Create Your Day",
        "Book a Consultation",
      ],
      buttonStyle: "Elegant or energetic depending on segment.",
      urgencyApproach: '"Dates filling fast for [season]" is appropriate.',
      avoid: ["Pressure tactics", "Cheap-feeling language"],
    },

    commonMistakes: [
      "Poor quality portfolio imagery",
      "No video content",
      "Unclear pricing or packages",
      "No easy way to check availability",
      "Missing testimonials",
      "Generic, segment-inappropriate design",
    ],

    competitorInsights: {
      topPerformerTraits: [
        "Stunning portfolio presentation",
        "Video highlights",
        "Clear packages and pricing",
        "Easy booking/inquiry process",
      ],
      differentiationOpportunities: [
        "Virtual venue tours",
        "Planning tools/checklists",
        "Preferred vendor network",
        "Unique experience offerings",
      ],
    },
  },

  // ============================================================================
  // FOOD & BEVERAGE
  // ============================================================================
  "food-beverage": {
    industry: "Food & Beverage",
    audienceProfile:
      "Diners, food enthusiasts, event planners (catering), health-conscious consumers. Sensory-driven, impulse-influenced, seeking experiences.",

    colorStrategy: {
      psychology: "Appetite, freshness, warmth. Colors should enhance food appeal.",
      dominantColors: ["Warm cream (#FFFBF5)", "Rich brown (#78350F)", "Fresh green (#166534)"],
      accentColors: ["Appetizing red (#DC2626)", "Citrus orange (#EA580C)", "Fresh yellow (#EAB308)"],
      avoid: ["Blue (appetite suppressant)", "Neon colors", "Cold, clinical palettes"],
      reasoning: "Warm colors stimulate appetite. Cool colors suppress it. Design should make food appealing.",
    },

    typographyStrategy: {
      headingStyle: "Can be more expressive—script for elegance, bold sans for casual. Depends on brand.",
      bodyStyle: "Clean, readable. 16px.",
      hierarchy: "Menu items need clear hierarchy. Pricing visible.",
      avoid: ["Hard to read fonts", "Inappropriate formality level"],
      reasoning: "Typography should match the dining experience—casual, fine dining, or quick service.",
    },

    imageryStrategy: {
      primaryStyle: "Professional food photography. Atmosphere shots. Team/chef imagery.",
      effectiveSubjects: [
        "Hero food shots",
        "Restaurant ambiance",
        "Chef/team in action",
        "Ingredients (freshness)",
        "Happy diners (authentic)",
      ],
      treatments: ["Warm lighting", "Appetizing styling", "Natural, not over-processed"],
      avoid: [
        "Poor quality food photos",
        "Cold, unappetizing lighting",
        "Empty restaurant shots",
        "Over-styled, fake-looking food",
      ],
      reasoning: "Food photography is everything. It directly impacts appetite and desire to visit.",
    },

    trustSignals: {
      critical: [
        "Reviews (Google, Yelp, TripAdvisor)",
        "Health ratings/certifications",
        "Awards and recognition",
        "Years in business",
        "Press features",
      ],
      effective: [
        "Chef credentials",
        "Sourcing information",
        "Customer photos",
        "Social media engagement",
        "Reservation platforms",
      ],
      placement: "Reviews prominent. Awards where relevant. Trust in footer.",
      avoid: ["Old or low ratings", "Fake reviews", "Missing health information"],
    },

    layoutPatterns: {
      heroStyle: "Stunning food imagery. Clear value prop (cuisine type, atmosphere). Easy CTA for reservation/order.",
      sectionFlow: [
        "Hero",
        "About/Story",
        "Menu Highlights",
        "Atmosphere",
        "Reviews",
        "Location & Hours",
        "Reservation/Order CTA",
      ],
      ctaPlacement: "Hero (Reserve/Order), sticky header, footer.",
      whitespaceApproach: "Generous. Let food imagery be the hero.",
    },

    ctaStrategy: {
      effectiveLanguage: ["Reserve a Table", "Order Now", "View Menu", "Book Your Experience", "Order Delivery"],
      buttonStyle: "Warm, inviting. Matches brand.",
      urgencyApproach: '"Limited seating" for special events is fine.',
      avoid: ["Aggressive language", "Fake urgency"],
    },

    commonMistakes: [
      "Poor food photography",
      "Outdated menu information",
      "No online reservation/ordering",
      "Missing hours and location",
      "Bad mobile experience",
      "Slow loading images",
    ],

    competitorInsights: {
      topPerformerTraits: [
        "Stunning food photography",
        "Easy reservation/ordering",
        "Clear menu access",
        "Strong review presence",
      ],
      differentiationOpportunities: [
        "Chef story and philosophy",
        "Sourcing transparency",
        "Virtual tours",
        "Loyalty programs",
      ],
    },
  },

  // ============================================================================
  // DEFAULT
  // ============================================================================
  default: {
    industry: "General Business",
    audienceProfile: "Varies. General business audience seeking products or services.",

    colorStrategy: {
      psychology: "Trust, professionalism, competence.",
      dominantColors: ["Blue (#3B82F6)", "White (#FFFFFF)", "Slate (#334155)"],
      accentColors: ["Green (#10B981)", "Orange (#F97316)", "Purple (#8B5CF6)"],
      avoid: ["Clashing colors", "Overly aggressive palettes"],
      reasoning: "Blue is universally trusted. Safe default while maintaining professionalism.",
    },

    typographyStrategy: {
      headingStyle: "Clean sans-serif. Weight 600.",
      bodyStyle: "Readable sans-serif. 16px.",
      hierarchy: "Clear and conventional.",
      avoid: ["Hard to read fonts", "Overly decorative choices"],
      reasoning: "Default typography should work for any business.",
    },

    imageryStrategy: {
      primaryStyle: "Professional, relevant to business type.",
      effectiveSubjects: ["Business-relevant imagery", "Team photos", "Product/service in action"],
      treatments: ["Professional, clean"],
      avoid: ["Generic stock", "Low quality images"],
      reasoning: "Imagery should be authentic to the specific business.",
    },

    trustSignals: {
      critical: ["Customer testimonials", "Years in business", "Client logos", "Reviews"],
      effective: ["Awards", "Certifications", "Press mentions"],
      placement: "Standard placement throughout.",
      avoid: ["Unverifiable claims", "Fake testimonials"],
    },

    layoutPatterns: {
      heroStyle: "Clear value proposition, relevant imagery, prominent CTA.",
      sectionFlow: ["Hero", "Value Proposition", "Services/Products", "Social Proof", "About", "CTA"],
      ctaPlacement: "Hero and footer minimum.",
      whitespaceApproach: "Balanced.",
    },

    ctaStrategy: {
      effectiveLanguage: ["Get Started", "Contact Us", "Learn More", "Request a Quote"],
      buttonStyle: "Solid, professional.",
      urgencyApproach: "Minimal.",
      avoid: ["Aggressive sales language"],
    },

    commonMistakes: ["Vague value proposition", "No social proof", "Poor mobile experience", "Unclear CTA"],

    competitorInsights: {
      topPerformerTraits: ["Clear differentiation", "Strong social proof", "Easy contact"],
      differentiationOpportunities: ["Niche down", "Better content", "Superior experience"],
    },
  },
};

// Helper function to get intelligence by industry
export function getDesignIntelligence(industry: IndustryType | string): DesignIntelligence {
  const normalized = industry.toLowerCase().replace(/[^a-z]/g, "-") as IndustryType;

  // Check for exact match
  if (industryDesignIntelligence[normalized]) {
    return industryDesignIntelligence[normalized];
  }

  // Check for partial matches
  for (const [key, intelligence] of Object.entries(industryDesignIntelligence)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return intelligence;
    }
  }

  return industryDesignIntelligence.default;
}

// Helper to generate a design brief for the AI
export function generateDesignBriefContext(industry: IndustryType | string): string {
  const intel = getDesignIntelligence(industry);

  return `
DESIGN DIRECTION FOR ${intel.industry.toUpperCase()}

Target Audience: ${intel.audienceProfile}

COLOR STRATEGY:
- Psychology: ${intel.colorStrategy.psychology}
- Use: ${intel.colorStrategy.dominantColors.join(", ")}
- Accent with: ${intel.colorStrategy.accentColors.join(", ")}
- Avoid: ${intel.colorStrategy.avoid.join(", ")}

TYPOGRAPHY:
- Headings: ${intel.typographyStrategy.headingStyle}
- Body: ${intel.typographyStrategy.bodyStyle}
- Avoid: ${intel.typographyStrategy.avoid.join(", ")}

IMAGERY:
- Style: ${intel.imageryStrategy.primaryStyle}
- Effective: ${intel.imageryStrategy.effectiveSubjects.join(", ")}
- Avoid: ${intel.imageryStrategy.avoid.join(", ")}

TRUST SIGNALS:
- Critical: ${intel.trustSignals.critical.join(", ")}
- Placement: ${intel.trustSignals.placement}

CTA STRATEGY:
- Effective language: ${intel.ctaStrategy.effectiveLanguage.join(", ")}
- Style: ${intel.ctaStrategy.buttonStyle}
- Avoid: ${intel.ctaStrategy.avoid.join(", ")}

COMMON MISTAKES TO AVOID:
${intel.commonMistakes.map((m) => `- ${m}`).join("\n")}

DIFFERENTIATION OPPORTUNITIES:
${intel.competitorInsights.differentiationOpportunities.map((d) => `- ${d}`).join("\n")}
`.trim();
}
