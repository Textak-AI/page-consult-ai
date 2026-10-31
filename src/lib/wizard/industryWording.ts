// Wizard question wording and examples that follow the industry the owner
// picked (IndustrySelector stores the category label in industryCategory).
// Examples model specific, checkable facts the owner can stand behind; they
// never model guarantees, ROI multiples or results the owner may not have.

export type OfferKind = 'software' | 'product' | 'services' | 'general';

export interface WizardPlaceholders {
  idealClient: string;
  clientFrustration: string;
  desiredOutcome: string;
  uniqueStrength: string;
  mainOffer: string;
  offerIncludes: string;
}

/** Category label (or "Category → Sub" string) -> what kind of thing is being sold. */
export function getOfferKind(industry?: string | null, subcategory?: string | null): OfferKind {
  const t = `${industry || ''} ${subcategory || ''}`.toLowerCase();
  if (!t.trim()) return 'general';
  // Category labels like "Real Estate / PropTech" or "Education / EdTech" cover
  // non-software businesses too, so only unambiguous labels count as software.
  if (/saas|software|consumer apps|developer tools|healthcare it|telemedicine|fintech/.test(t)) return 'software';
  if (/e-?commerce|retail|hardware|consumer electronics|devices|apparel|food \/ beverage|beauty|furniture|gadgets|subscription \/ dtc/.test(t)) return 'product';
  if (/professional services|agency|creative|consult|legal|accounting|real estate|healthcare|medical|financial services|manufacturing|industrial|education|non-profit|nonprofit|coach|wellness/.test(t)) return 'services';
  return 'general';
}

/** Step 5 (audience) frustration question. Only services firms are "hired". */
export function frustrationQuestion(kind: OfferKind): string {
  switch (kind) {
    case 'software': return "What's their biggest frustration with the tools or workarounds they use now?";
    case 'product': return "What's their biggest frustration with what they buy now?";
    case 'services': return "What's their biggest frustration when hiring someone in your space?";
    default: return "What's their biggest frustration with the options they have now?";
  }
}

/** Step 3 (identity) differentiator example: a specific fact someone could check. */
export function uniqueStrengthExample(kind: OfferKind, productName?: string | null): string {
  if (productName) return `e.g., ${productName} imports a year of records in one step, with no manual cleanup`;
  switch (kind) {
    case 'software': return 'e.g., Imports a year of records in one step, with no manual cleanup';
    case 'product': return 'e.g., Made in our own workshop; every unit is tested before it ships';
    case 'services': return 'e.g., Every project is run by one of our two founders, who each spent 12 years as plant managers';
    default: return 'e.g., The same person handles your work from the first call to the last';
  }
}

const PLACEHOLDERS: Record<string, WizardPlaceholders> = {
  'B2B SaaS / Software': {
    idealClient: 'e.g., Mid-market SaaS companies with 50-200 employees looking to scale their sales operations...',
    clientFrustration: 'e.g., They struggle with fragmented tools, manual processes, and inconsistent data across departments...',
    desiredOutcome: 'e.g., One place to see their pipeline, without rebuilding reports by hand every week...',
    uniqueStrength: 'e.g., Connects to Salesforce and HubSpot in one step, with no custom code...',
    mainOffer: 'e.g., Enterprise Platform Integration, Custom API Development',
    offerIncludes: 'e.g., Full implementation, 3 custom integrations, dedicated success manager...',
  },
  'Professional Services': {
    idealClient: 'e.g., Growing businesses with 10-50 employees needing strategic consulting but lacking in-house expertise...',
    clientFrustration: 'e.g., They hire consultants who give generic advice without understanding their specific industry challenges...',
    desiredOutcome: 'e.g., A clear strategic roadmap they can implement immediately with quarterly milestones...',
    uniqueStrength: 'e.g., We take five clients at a time, and a senior partner runs every engagement...',
    mainOffer: 'e.g., Strategic Growth Consulting, Business Transformation Services',
    offerIncludes: 'e.g., Monthly strategy sessions, implementation support, quarterly business reviews...',
  },
  'Healthcare / Medical': {
    idealClient: 'e.g., Medical practices with 3-10 providers looking to improve patient experience and operational efficiency...',
    clientFrustration: 'e.g., They deal with outdated systems, long wait times, and frustrated staff juggling manual paperwork...',
    desiredOutcome: 'e.g., A smoothly running practice where staff focus on patient care, not administrative burden...',
    uniqueStrength: 'e.g., We work only with healthcare practices and sign a BAA with every client...',
    mainOffer: 'e.g., Practice Management Solutions, EHR Implementation',
    offerIncludes: 'e.g., Full system setup, staff training, data migration, ongoing technical support...',
  },
  'Real Estate / PropTech': {
    idealClient: 'e.g., First-time homebuyers or families relocating who need guidance through the entire buying process...',
    clientFrustration: 'e.g., They feel overwhelmed by the process, fear making a costly mistake, and get generic MLS listings...',
    desiredOutcome: 'e.g., Finding the right home without stress and closing on time...',
    uniqueStrength: 'e.g., Licensed since 2012; I attend every showing and inspection myself...',
    mainOffer: 'e.g., Full-Service Home Buying, Luxury Property Sales',
    offerIncludes: 'e.g., Market analysis, property tours, negotiation, closing coordination, post-sale support...',
  },
  'Agency / Creative': {
    idealClient: 'e.g., Funded startups and established brands looking to differentiate through design and strategy...',
    clientFrustration: 'e.g., They work with agencies that miss deadlines, don\'t understand their vision, or produce mediocre work...',
    desiredOutcome: 'e.g., A brand that stands out and that their team can actually use...',
    uniqueStrength: 'e.g., The person who pitches your project is the person who designs it...',
    mainOffer: 'e.g., Brand Strategy & Design, Digital Experience Design',
    offerIncludes: 'e.g., Discovery workshop, brand strategy, visual identity, website design, brand guidelines...',
  },
  'Manufacturing / Industrial': {
    idealClient: 'e.g., Aerospace and defense contractors requiring precision machined components with tight tolerances...',
    clientFrustration: 'e.g., They deal with quality inconsistencies, late deliveries, and suppliers who can\'t scale with demand...',
    desiredOutcome: 'e.g., A reliable supply chain partner that delivers quality parts on time...',
    uniqueStrength: 'e.g., AS9100D certified, with in-house CMM inspection on every lot...',
    mainOffer: 'e.g., Precision CNC Machining, Custom Fabrication Services',
    offerIncludes: 'e.g., Design consultation, prototyping, production runs, quality documentation, logistics...',
  },
  default: {
    idealClient: 'e.g., Describe your ideal customer in detail - their role, company size, specific needs...',
    clientFrustration: 'e.g., What gets in their way today? What have they already tried that did not work?',
    desiredOutcome: 'e.g., What result are they really paying for?',
    uniqueStrength: 'e.g., A specific fact about how you work that a customer could check',
    mainOffer: 'e.g., Your main product or service name',
    offerIncludes: 'e.g., List what\'s included in your core offering...',
  },
};

// Older drafts and the legacy keys above use slightly different labels.
const ALIASES: Record<string, string> = {
  'Real Estate': 'Real Estate / PropTech',
};

/** Accepts the category label, an alias, or the stored "Category → Sub" string. */
export function getWizardPlaceholders(industry?: string | null): WizardPlaceholders {
  if (!industry) return PLACEHOLDERS.default;
  const category = industry.split('→')[0].trim();
  const key = ALIASES[category] || category;
  return PLACEHOLDERS[key] || PLACEHOLDERS.default;
}
