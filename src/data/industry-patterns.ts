export const industryPatterns = {
  wedding_dj: {
    name: "Wedding DJ",
    tone: "emotional, celebratory, romantic, warm",
    audienceType: "b2c_emotional",
    targetLanguage: {
      audience: ["couples", "brides", "grooms", "wedding planners", "engaged couples"],
      avoid: ["businesses", "companies", "clients", "ROI", "metrics"]
    },
    features: [
      "Professional DJ equipment and sound systems",
      "Extensive music library spanning all genres and decades",
      "Master of Ceremonies (MC) services",
      "Custom playlist creation and song requests",
      "Wireless microphones for speeches and toasts",
      "Mood lighting and dance floor effects",
      "Backup equipment for guaranteed reliability",
      "Reception timeline planning and coordination",
      "Smooth transitions between key moments",
      "Experience with venue acoustics"
    ],
    headlineFormulas: [
      "Your Perfect Wedding DJ - {credential}",
      "Make Your Reception Unforgettable",
      "{years} Years Creating Magical Wedding Celebrations",
      "{credential} Wedding Entertainment You Can Trust",
      "Dance Floor Memories That Last Forever"
    ],
    ctaPatterns: [
      "Check Availability for Your Date",
      "Book Your DJ & Get {offer}",
      "Schedule Your Free Consultation",
      "Reserve Your Wedding Date",
      "Get Your Custom Quote"
    ],
    socialProof: {
      format: "Trusted by {number}+ Happy Couples",
      avoid: "businesses served, clients, companies"
    },
    credentialTransform: {
      "years experience": "{X} Years Perfecting Wedding Entertainment",
      "5 star rating": "{X}-Star Rated by Couples Like You",
      "weddings": "{X} Unforgettable Wedding Receptions"
    }
  },

  b2b_saas: {
    name: "B2B SaaS",
    tone: "professional, confident, roi-focused, efficient",
    audienceType: "b2b_rational",
    targetLanguage: {
      audience: ["teams", "companies", "businesses", "organizations", "leaders", "managers"],
      avoid: ["couples", "individuals", "you (use 'your team' instead)"]
    },
    features: [
      "Seamless integrations with your existing tools",
      "Enterprise-grade security and compliance",
      "Real-time analytics and reporting dashboard",
      "Automated workflows to eliminate manual tasks",
      "Dedicated customer success manager",
      "SSO and user provisioning",
      "API access for custom integrations",
      "99.9% uptime SLA guarantee",
      "Role-based access controls",
      "White-label options available"
    ],
    headlineFormulas: [
      "Save {benefit} with {solution}",
      "{solution} That Grows With Your Business",
      "The {category} {number}+ Teams Trust",
      "Automate {process} in Minutes, Not Hours"
    ],
    ctaPatterns: [
      "Start Free {trial_length} Trial",
      "Schedule a Demo",
      "See {product} in Action",
      "Get Custom Pricing",
      "Talk to Sales"
    ],
    socialProof: {
      format: "Trusted by {number}+ Companies",
      avoid: "couples, individuals, personal"
    },
    credentialTransform: {
      "years experience": "{X} Years Serving {industry} Teams",
      "customers": "{X}+ Companies Trust Us",
      "rating": "{X}-Star Rated on G2/Capterra"
    }
  },

  legal_services: {
    name: "Legal Services",
    tone: "authoritative, trustworthy, professional, reassuring",
    audienceType: "b2c_trust",
    targetLanguage: {
      audience: ["clients", "individuals", "families", "people facing {issue}"],
      avoid: ["customers", "users", "casual language"]
    },
    features: [
      "Licensed attorneys in {state}",
      "Free initial consultation",
      "No fees unless we win your case",
      "Proven track record of successful outcomes",
      "Personalized legal strategy for your situation",
      "Clear communication throughout your case",
      "Aggressive representation when needed",
      "Compassionate support during difficult times",
      "Transparent pricing with no hidden fees",
      "Available evenings and weekends"
    ],
    headlineFormulas: [
      "{practice_area} Attorney You Can Trust",
      "Protecting Your Rights for {years} Years",
      "Experienced {practice_area} Representation",
      "Get the Legal Help You Deserve"
    ],
    ctaPatterns: [
      "Schedule Free Consultation",
      "Speak with an Attorney Today",
      "Get Your Free Case Review",
      "Call Now: {phone}",
      "Discuss Your Case - No Obligation"
    ],
    socialProof: {
      format: "Helped {number}+ Clients Win Their Cases",
      avoid: "customers, businesses"
    },
    credentialTransform: {
      "years experience": "{X} Years Practicing {practice_area}",
      "cases won": "{X}+ Successful Case Outcomes",
      "rating": "{X}-Star Rated by Satisfied Clients"
    }
  },

  home_services: {
    name: "Home Services",
    tone: "reliable, trustworthy, local, helpful",
    audienceType: "b2c_practical",
    targetLanguage: {
      audience: ["homeowners", "residents", "families", "you"],
      avoid: ["businesses", "companies"]
    },
    features: [
      "Licensed and insured professionals",
      "Upfront, transparent pricing",
      "Same-day or emergency service available",
      "Background-checked technicians",
      "Satisfaction guarantee",
      "Free estimates",
      "Serving {area} for {years} years",
      "Family-owned and operated",
      "Latest equipment and techniques",
      "Flexible scheduling including weekends"
    ],
    headlineFormulas: [
      "Trusted {service} in {area}",
      "{area}'s Top-Rated {service}",
      "Fast, Reliable {service} You Can Trust",
      "{years} Years Serving {area} Homes"
    ],
    ctaPatterns: [
      "Get Free Estimate",
      "Schedule Service",
      "Call for Same-Day Service",
      "Book Your Appointment",
      "Request Free Quote"
    ],
    socialProof: {
      format: "Trusted by {number}+ {area} Homeowners"
    },
    credentialTransform: {
      "years experience": "{X} Years Serving {area}",
      "jobs completed": "{X}+ Homes Serviced",
      "rating": "{X}-Star Rated by Homeowners"
    }
  },

  healthcare: {
    name: "Healthcare",
    tone: "caring, professional, knowledgeable, reassuring",
    audienceType: "b2c_trust",
    targetLanguage: {
      audience: ["patients", "families", "you", "individuals"],
      avoid: ["customers", "users", "businesses"]
    },
    features: [
      "Board-certified physicians",
      "Accepting new patients",
      "Most insurance plans accepted",
      "Convenient appointment scheduling",
      "State-of-the-art facilities",
      "Comprehensive care under one roof",
      "Telehealth appointments available",
      "Evening and weekend hours",
      "Coordinated care with specialists",
      "Patient-centered approach"
    ],
    headlineFormulas: [
      "Compassionate {specialty} Care",
      "Your Health is Our Priority",
      "{specialty} Practice Serving {area}",
      "Experienced {specialty} You Can Trust"
    ],
    ctaPatterns: [
      "Schedule Appointment",
      "Request Consultation",
      "Book Your Visit",
      "Call to Schedule",
      "New Patient Registration"
    ],
    socialProof: {
      format: "Caring for {number}+ Patients"
    },
    credentialTransform: {
      "years experience": "{X} Years Providing {specialty} Care",
      "patients served": "{X}+ Patients Trust Us",
      "rating": "{X}-Star Patient Satisfaction Rating"
    }
  },

  consulting: {
    name: "Consulting",
    tone: "expert, strategic, results-focused, confident",
    audienceType: "b2b_trust",
    targetLanguage: {
      audience: ["businesses", "organizations", "leaders", "executives", "your team"],
      avoid: ["individuals", "couples", "casual language"]
    },
    features: [
      "Proven methodology and frameworks",
      "Industry-specific expertise",
      "Data-driven recommendations",
      "Hands-on implementation support",
      "C-suite advisor experience",
      "Measurable outcomes and KPIs",
      "Flexible engagement models",
      "Access to industry benchmarks",
      "Change management expertise",
      "Post-engagement support"
    ],
    headlineFormulas: [
      "Strategic {consulting_type} That Drives Results",
      "Transform Your {area} Performance",
      "{years} Years Solving {industry} Challenges",
      "Consulting That Delivers Measurable Impact"
    ],
    ctaPatterns: [
      "Schedule Strategic Consultation",
      "Discuss Your Challenges",
      "Request Proposal",
      "Book Discovery Call",
      "Get Expert Assessment"
    ],
    socialProof: {
      format: "Trusted by {number}+ {industry} Leaders"
    },
    credentialTransform: {
      "years experience": "{X} Years of Strategic Consulting",
      "clients served": "{X}+ Organizations Transformed",
      "rating": "{X}-Star Rated by Industry Leaders"
    }
  },

  ecommerce: {
    name: "E-commerce",
    tone: "exciting, benefit-focused, urgent, friendly",
    audienceType: "b2c_transactional",
    targetLanguage: {
      audience: ["you", "shoppers", "customers"],
      avoid: ["businesses", "companies"]
    },
    features: [
      "Free shipping on orders over {amount}",
      "30-day money-back guarantee",
      "Secure checkout and payment processing",
      "Fast delivery: {delivery_time}",
      "Easy returns, no questions asked",
      "Exclusive member discounts",
      "Loyalty rewards program",
      "Gift wrapping available",
      "Track your order in real-time",
      "Customer reviews and ratings"
    ],
    headlineFormulas: [
      "Shop {product_category} - {benefit}",
      "The {product_type} {number}+ Customers Love",
      "{benefit} Guaranteed or Your Money Back",
      "Premium {product} at {value_prop} Prices"
    ],
    ctaPatterns: [
      "Shop Now",
      "Add to Cart",
      "Buy Now",
      "Shop {category}",
      "Start Shopping"
    ],
    socialProof: {
      format: "{number}+ Happy Customers",
      includeReviews: true
    },
    credentialTransform: {
      "years experience": "{X} Years in Business",
      "customers": "{X}+ Happy Customers",
      "rating": "{X}-Star Average Rating"
    }
  }
};

export type Industry = keyof typeof industryPatterns;

// Helper function to get pattern by industry
export function getIndustryPattern(industry: string): typeof industryPatterns[Industry] | null {
  const normalized = industry.toLowerCase().replace(/\s+/g, '_');
  
  // Direct match
  if (industryPatterns[normalized as Industry]) {
    return industryPatterns[normalized as Industry];
  }
  
  // Fuzzy matching
  if (normalized.includes('wedding') || normalized.includes('dj')) {
    return industryPatterns.wedding_dj;
  }
  if (normalized.includes('saas') || normalized.includes('software')) {
    return industryPatterns.b2b_saas;
  }
  if (normalized.includes('legal') || normalized.includes('law') || normalized.includes('attorney')) {
    return industryPatterns.legal_services;
  }
  if (normalized.includes('plumb') || normalized.includes('hvac') || normalized.includes('electric') || normalized.includes('contractor')) {
    return industryPatterns.home_services;
  }
  if (normalized.includes('health') || normalized.includes('medical') || normalized.includes('doctor')) {
    return industryPatterns.healthcare;
  }
  if (normalized.includes('consult')) {
    return industryPatterns.consulting;
  }
  if (normalized.includes('commerce') || normalized.includes('retail') || normalized.includes('shop')) {
    return industryPatterns.ecommerce;
  }
  
  return null;
}

// Helper function to transform credentials
export function transformCredential(
  credential: string,
  industry: Industry
): string {
  const pattern = industryPatterns[industry];
  if (!pattern || !pattern.credentialTransform) return credential;

  // Check if credential matches known patterns
  for (const [key, template] of Object.entries(pattern.credentialTransform)) {
    if (credential.toLowerCase().includes(key)) {
      // Extract number from credential
      const match = credential.match(/\d+/);
      if (match) {
        return template.replace('{X}', match[0]);
      }
    }
  }

  return credential;
}

// Helper function to extract years from text
export function extractYears(text: string): number | null {
  const match = text.match(/(\d+)\s*(?:years?|yrs?)/i);
  return match ? parseInt(match[1]) : null;
}

// Helper function to extract credentials
export function extractCredentials(text: string): {
  years?: number;
  rating?: number;
  count?: number;
  countType?: string;
} {
  const creds: any = {};
  
  // Extract years
  const yearsMatch = text.match(/(\d+)\+?\s*years?/i);
  if (yearsMatch) creds.years = parseInt(yearsMatch[1]);
  
  // Extract rating
  const ratingMatch = text.match(/(\d+(?:\.\d+)?)\s*[-\s]?star/i);
  if (ratingMatch) creds.rating = parseFloat(ratingMatch[1]);
  
  // Extract counts
  const countPatterns = [
    { regex: /(\d+)\+?\s*(customer|client|project|wedding|job|case|patient|company)/i, type: 'projects' },
  ];
  
  for (const { regex } of countPatterns) {
    const match = text.match(regex);
    if (match) {
      creds.count = parseInt(match[1]);
      creds.countType = match[2];
      break;
    }
  }
  
  return creds;
}
