// Pre-computed Objections Data
// Used for instant objection display without waiting for AI research

export interface PredictedObjection {
  objection: string;
  frequency: 'very_common' | 'common' | 'moderate' | 'rare';
  source: string;
  counterStrategy: string;
  proofNeeded: string;
  userHasProof?: boolean;
}

// Pre-computed objections for common industry + target market combinations
const PRECOMPUTED_OBJECTIONS: Record<string, Record<string, PredictedObjection[]>> = {
  
  'cybersecurity': {
    'healthcare': [
      {
        objection: "We've been burned by security vendors who don't understand healthcare",
        frequency: 'very_common',
        source: 'Industry research',
        counterStrategy: 'Lead with healthcare-specific credentials, HIPAA expertise, and healthcare client count',
        proofNeeded: 'Healthcare client logos, HITRUST/HIPAA certifications'
      },
      {
        objection: "What happens if you find something critical during testing?",
        frequency: 'common',
        source: 'CISO interviews',
        counterStrategy: 'Add a Responsible Disclosure Guarantee section with clear SLAs',
        proofNeeded: 'Process documentation, response time guarantees'
      },
      {
        objection: "Our internal security team might feel threatened",
        frequency: 'moderate',
        source: 'Healthcare IT forums',
        counterStrategy: 'Position as partnership that empowers their team, not replaces it',
        proofNeeded: 'Testimonial from a client internal security lead'
      }
    ],
    'financial': [
      {
        objection: "How do you handle our regulatory requirements?",
        frequency: 'very_common',
        source: 'Industry research',
        counterStrategy: 'Lead with SOC 2, PCI-DSS expertise and audit support',
        proofNeeded: 'Compliance certifications, audit success rates'
      },
      {
        objection: "We need someone who understands our risk tolerance",
        frequency: 'common',
        source: 'Financial sector interviews',
        counterStrategy: 'Emphasize risk-based approach and board-ready reporting',
        proofNeeded: 'Sample executive reports, risk framework alignment'
      }
    ],
    '_default': [
      {
        objection: "How do we know you won't cause downtime?",
        frequency: 'common',
        source: 'General market research',
        counterStrategy: 'Emphasize non-disruptive testing methodology and scheduling flexibility',
        proofNeeded: 'Zero-downtime guarantee, testing methodology docs'
      },
      {
        objection: "We've had bad experiences with security vendors before",
        frequency: 'common',
        source: 'Industry surveys',
        counterStrategy: 'Acknowledge industry reputation issues, differentiate on communication and process',
        proofNeeded: 'Client testimonials about experience, communication samples'
      },
      {
        objection: "How do we know your findings are actionable?",
        frequency: 'moderate',
        source: 'Security buyer research',
        counterStrategy: 'Emphasize remediation guidance and prioritization framework',
        proofNeeded: 'Sample report structure, remediation success rates'
      }
    ]
  },
  
  'consulting': {
    'manufacturing': [
      {
        objection: "Consultants give us reports, not results",
        frequency: 'very_common',
        source: 'Manufacturing executive surveys',
        counterStrategy: 'Lead with implementation support and measurable outcomes, not just recommendations',
        proofNeeded: 'Case studies with specific ROI numbers, client retention rates'
      },
      {
        objection: "You don't understand our shop floor realities",
        frequency: 'common',
        source: 'Industry forums',
        counterStrategy: 'Highlight hands-on experience and time spent in facilities',
        proofNeeded: 'Team bios with manufacturing background, site visit methodology'
      },
      {
        objection: "We tried lean/six sigma and it didn't stick",
        frequency: 'moderate',
        source: 'Operations leader interviews',
        counterStrategy: 'Differentiate your approach from failed methodologies, focus on sustainability',
        proofNeeded: 'Long-term client results (2+ years), change management approach'
      }
    ],
    'healthcare': [
      {
        objection: "Healthcare is too complex for outside consultants",
        frequency: 'very_common',
        source: 'Healthcare executive surveys',
        counterStrategy: 'Lead with healthcare-specific experience and clinical understanding',
        proofNeeded: 'Healthcare client list, clinical advisory board'
      },
      {
        objection: "We need someone who understands our regulatory constraints",
        frequency: 'common',
        source: 'Industry research',
        counterStrategy: 'Emphasize compliance expertise and regulatory knowledge',
        proofNeeded: 'HIPAA/compliance credentials, regulatory success stories'
      }
    ],
    '_default': [
      {
        objection: "How is this different from the last consultant we hired?",
        frequency: 'very_common',
        source: 'General research',
        counterStrategy: 'Acknowledge past failures, differentiate on accountability and outcomes',
        proofNeeded: 'Unique methodology, outcome guarantees, client testimonials'
      },
      {
        objection: "We can't afford expensive consultants right now",
        frequency: 'common',
        source: 'Market research',
        counterStrategy: 'Frame as investment with ROI, offer flexible engagement models',
        proofNeeded: 'ROI examples, payment flexibility options'
      }
    ]
  },
  
  'saas': {
    'enterprise': [
      {
        objection: "What about enterprise security and compliance?",
        frequency: 'very_common',
        source: 'Enterprise buyer research',
        counterStrategy: 'Lead with SOC 2, SSO/SAML, and enterprise security features',
        proofNeeded: 'Security certifications, compliance documentation'
      },
      {
        objection: "How does this integrate with our existing stack?",
        frequency: 'common',
        source: 'Technical buyer interviews',
        counterStrategy: 'Emphasize API-first architecture and existing integrations',
        proofNeeded: 'Integration list, API documentation, customer stack examples'
      }
    ],
    '_default': [
      {
        objection: "We're already using [competitor], switching is painful",
        frequency: 'very_common',
        source: 'SaaS buyer research',
        counterStrategy: 'Offer migration support, highlight switching cost ROI',
        proofNeeded: 'Migration case studies, time-to-value metrics'
      },
      {
        objection: "What if you shut down or get acquired?",
        frequency: 'common',
        source: 'Enterprise buyer concerns',
        counterStrategy: 'Address data portability, business stability signals',
        proofNeeded: 'Funding/revenue stability, data export capabilities'
      },
      {
        objection: "We need this to integrate with our existing stack",
        frequency: 'common',
        source: 'Technical buyer research',
        counterStrategy: 'Lead with integration capabilities and API documentation',
        proofNeeded: 'Integration list, API docs, customer stack examples'
      }
    ]
  },
  
  'coaching': {
    '_default': [
      {
        objection: "How do I know this isn't just motivational fluff?",
        frequency: 'very_common',
        source: 'Coaching buyer research',
        counterStrategy: 'Lead with methodology, frameworks, and measurable outcomes',
        proofNeeded: 'Specific transformation stories with metrics, methodology overview'
      },
      {
        objection: "I've tried coaching before and it didn't work",
        frequency: 'common',
        source: 'Client interviews',
        counterStrategy: 'Acknowledge past experiences, differentiate your approach',
        proofNeeded: 'What makes your method different, client who had same concern'
      },
      {
        objection: "This is expensive for something intangible",
        frequency: 'common',
        source: 'Market research',
        counterStrategy: 'Frame as investment with ROI, offer money-back guarantee',
        proofNeeded: 'ROI examples, guarantee details, payment flexibility'
      }
    ]
  },
  
  'realestate': {
    '_default': [
      {
        objection: "What makes you different from every other agent?",
        frequency: 'very_common',
        source: 'Real estate buyer research',
        counterStrategy: 'Lead with local expertise, specific results, and unique approach',
        proofNeeded: 'Neighborhood-specific stats, recent sales, client testimonials'
      },
      {
        objection: "I can just use Zillow/Redfin",
        frequency: 'common',
        source: 'Market trends',
        counterStrategy: 'Emphasize value-add beyond listings: negotiation, insights, connections',
        proofNeeded: 'Savings/gains over market rate, services comparison'
      },
      {
        objection: "How do I know you'll prioritize my transaction?",
        frequency: 'moderate',
        source: 'Buyer surveys',
        counterStrategy: 'Emphasize limited client count and personalized attention',
        proofNeeded: 'Client capacity details, responsiveness guarantees'
      }
    ]
  },
  
  'manufacturing': {
    '_default': [
      {
        objection: "We need someone who understands our specific equipment/process",
        frequency: 'very_common',
        source: 'Industry research',
        counterStrategy: 'Lead with relevant experience and technical expertise',
        proofNeeded: 'Similar equipment/process experience, technical certifications'
      },
      {
        objection: "How do you handle production schedules and downtime?",
        frequency: 'common',
        source: 'Operations leader interviews',
        counterStrategy: 'Emphasize flexible scheduling and minimal disruption approach',
        proofNeeded: 'Scheduling process, downtime minimization methodology'
      },
      {
        objection: "What about our quality standards and certifications?",
        frequency: 'common',
        source: 'Manufacturing buyer research',
        counterStrategy: 'Address compliance with industry standards (ISO, AS9100, etc.)',
        proofNeeded: 'Relevant certifications, quality process documentation'
      }
    ]
  },
  
  'healthcare': {
    '_default': [
      {
        objection: "Do you understand HIPAA and healthcare compliance?",
        frequency: 'very_common',
        source: 'Healthcare buyer research',
        counterStrategy: 'Lead with compliance credentials and healthcare-specific experience',
        proofNeeded: 'HIPAA training, healthcare client list, compliance certifications'
      },
      {
        objection: "Healthcare is unique - generic solutions don't work here",
        frequency: 'common',
        source: 'Industry surveys',
        counterStrategy: 'Emphasize healthcare-specific customization and understanding',
        proofNeeded: 'Healthcare case studies, clinical advisory input'
      },
      {
        objection: "How does this integrate with our EHR/EMR system?",
        frequency: 'common',
        source: 'Technical buyer research',
        counterStrategy: 'Address specific integrations and interoperability standards',
        proofNeeded: 'EHR integration list, HL7/FHIR compliance'
      }
    ]
  },
  
  'financial': {
    '_default': [
      {
        objection: "What about regulatory compliance (SEC, FINRA, etc.)?",
        frequency: 'very_common',
        source: 'Financial services research',
        counterStrategy: 'Lead with compliance expertise and regulatory knowledge',
        proofNeeded: 'Compliance certifications, regulatory audit success'
      },
      {
        objection: "Our data is extremely sensitive - security is paramount",
        frequency: 'very_common',
        source: 'Financial buyer interviews',
        counterStrategy: 'Emphasize security certifications and data protection measures',
        proofNeeded: 'SOC 2, encryption standards, security audit results'
      },
      {
        objection: "How do you handle fiduciary responsibilities?",
        frequency: 'common',
        source: 'Advisory buyer research',
        counterStrategy: 'Address fiduciary alignment and transparency',
        proofNeeded: 'Fee transparency, fiduciary commitment, client outcomes'
      }
    ]
  },
  
  'ecommerce': {
    '_default': [
      {
        objection: "How do I know this will actually increase conversions?",
        frequency: 'very_common',
        source: 'E-commerce buyer research',
        counterStrategy: 'Lead with specific conversion improvements and A/B test results',
        proofNeeded: 'Conversion rate improvements, revenue increase examples'
      },
      {
        objection: "We've tried similar solutions before without results",
        frequency: 'common',
        source: 'Market research',
        counterStrategy: 'Acknowledge past failures, differentiate on approach and guarantees',
        proofNeeded: "What's different, performance guarantee"
      },
      {
        objection: "What about integration with Shopify/WooCommerce/etc.?",
        frequency: 'common',
        source: 'Technical buyer research',
        counterStrategy: 'Emphasize platform compatibility and easy setup',
        proofNeeded: 'Platform integrations, setup time, customer examples'
      }
    ]
  },
  
  'education': {
    '_default': [
      {
        objection: "How do I know this will actually work for me?",
        frequency: 'very_common',
        source: 'Education buyer research',
        counterStrategy: 'Lead with student outcomes and success stories',
        proofNeeded: 'Student testimonials, completion rates, outcome metrics'
      },
      {
        objection: "There are so many free resources available",
        frequency: 'common',
        source: 'Market research',
        counterStrategy: 'Differentiate on structured path, accountability, and outcomes',
        proofNeeded: 'Value comparison, unique methodology, support included'
      },
      {
        objection: "What if I don't have time to complete it?",
        frequency: 'common',
        source: 'Student surveys',
        counterStrategy: 'Address flexible pacing and lifetime access',
        proofNeeded: 'Flexible schedule options, completion support'
      }
    ]
  },
  
  'legal': {
    '_default': [
      {
        objection: "How do you handle confidentiality?",
        frequency: 'very_common',
        source: 'Legal buyer research',
        counterStrategy: 'Lead with confidentiality protocols and professional standards',
        proofNeeded: 'Confidentiality agreements, professional credentials'
      },
      {
        objection: "What is your experience with our specific legal area?",
        frequency: 'common',
        source: 'Legal buyer interviews',
        counterStrategy: 'Emphasize relevant specialization and case experience',
        proofNeeded: 'Relevant case history, specialization credentials'
      },
      {
        objection: "Legal services are expensive - how do you justify your fees?",
        frequency: 'common',
        source: 'Market research',
        counterStrategy: 'Address value beyond hourly rate, outcome focus',
        proofNeeded: 'Case outcomes, fee transparency, value examples'
      }
    ]
  },
  
  'fitness': {
    '_default': [
      {
        objection: "I've tried programs before and they didn't work",
        frequency: 'very_common',
        source: 'Fitness buyer research',
        counterStrategy: 'Acknowledge past failures, differentiate on personalization and support',
        proofNeeded: "What's different, client transformations with similar stories"
      },
      {
        objection: "This seems too expensive for a fitness program",
        frequency: 'common',
        source: 'Market research',
        counterStrategy: 'Frame as health investment, compare to cost of not acting',
        proofNeeded: 'Value breakdown, payment options, guarantee'
      },
      {
        objection: "I don't have time for another program",
        frequency: 'common',
        source: 'Client surveys',
        counterStrategy: 'Address time efficiency and flexible scheduling',
        proofNeeded: 'Time requirements, busy client success stories'
      }
    ]
  }
};

/**
 * Get pre-computed objections for an industry/target market combination
 */
export function getPrecomputedObjections(
  industry: string | null,
  targetMarket: string | null
): PredictedObjection[] {
  if (!industry) return [];
  
  const industryKey = industry.toLowerCase().replace(/[^a-z]/g, '');
  const targetKey = targetMarket?.toLowerCase().replace(/[^a-z]/g, '') || '_default';
  
  const industryData = PRECOMPUTED_OBJECTIONS[industryKey];
  if (!industryData) return [];
  
  // Try specific target market first, fall back to default
  return industryData[targetKey] || industryData['_default'] || [];
}

/**
 * Check if we have pre-computed data for an industry
 */
export function hasPrecomputedData(industry: string): boolean {
  const key = industry.toLowerCase().replace(/[^a-z]/g, '');
  return Boolean(PRECOMPUTED_OBJECTIONS[key]);
}

/**
 * Get list of industries with pre-computed objections
 */
export function getAvailableIndustries(): string[] {
  return Object.keys(PRECOMPUTED_OBJECTIONS).filter(k => k !== '_default');
}
