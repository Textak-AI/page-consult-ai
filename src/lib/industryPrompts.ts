// Industry-specific prompts for hero background image generation

export interface IndustryPromptConfig {
  industry: string;
  subcategories: {
    [key: string]: string;
  };
  defaultPrompt: string;
}

const PROMPT_SUFFIX = "professional photography, photorealistic, soft natural lighting, no text, no logos, 16:9 aspect ratio, high quality, cinematic composition";

export const industryPrompts: Record<string, IndustryPromptConfig> = {
  healthcare: {
    industry: "Healthcare",
    subcategories: {
      hospital: "Modern hospital lobby with floor-to-ceiling windows, natural light streaming in, comfortable seating area, healing garden visible through glass",
      clinic: "Bright medical clinic waiting room, contemporary design, clean white walls with accent colors, professional yet welcoming atmosphere",
      dental: "Modern dental office with state-of-the-art equipment, calming blue and white color scheme, patient comfort focus",
      wellness: "Luxury wellness spa environment, zen garden elements, natural materials, peaceful meditation space with soft ambient lighting",
      pharmacy: "Contemporary pharmacy interior, organized shelving, modern consultation area, healthcare professional helping customer",
      telehealth: "Professional home office setup for telehealth, computer screen with video call interface, clean organized desk, medical certificates on wall",
    },
    defaultPrompt: "Modern healthcare facility, clean clinical environment with natural lighting, comfortable patient waiting area, contemporary medical office design, calming colors",
  },
  
  "b2b-saas": {
    industry: "B2B SaaS",
    subcategories: {
      analytics: "Modern tech office with large monitors displaying data dashboards, team collaboration space, sleek minimalist design",
      crm: "Professional sales team workspace, multiple screens showing customer data, collaborative open office layout",
      hr: "Contemporary HR office environment, employee engagement activities, modern meeting room with video conferencing",
      finance: "Fintech office space with trading terminals, professional atmosphere, sleek modern interior design",
      marketing: "Creative marketing agency workspace, colorful yet professional, digital displays showing campaigns",
      productivity: "Modern co-working space, professionals collaborating, clean desk setups with laptops and plants",
    },
    defaultPrompt: "Modern tech office environment, software dashboards on screens, collaborative workspace, sleek glass and steel architecture, professional team atmosphere",
  },
  
  financial: {
    industry: "Financial Services",
    subcategories: {
      banking: "Elegant bank interior, marble floors, professional teller area, secure and trustworthy atmosphere",
      investment: "High-end investment firm office, panoramic city view, executive meeting room, sophisticated decor",
      insurance: "Modern insurance office, professional consultation area, trustworthy family-friendly atmosphere",
      accounting: "Professional accounting firm, organized workspace, financial documents and modern computers",
      wealth: "Luxury wealth management office, private client meeting room, art on walls, premium furnishings",
      fintech: "Cutting-edge fintech startup office, modern technology, young professionals collaborating",
    },
    defaultPrompt: "Professional financial office, trustworthy atmosphere, elegant interior design, executive meeting room with city skyline view, sophisticated and secure environment",
  },
  
  ecommerce: {
    industry: "E-commerce & Retail",
    subcategories: {
      fashion: "High-end fashion boutique, elegant clothing displays, modern retail interior, stylish lighting",
      electronics: "Modern electronics store, sleek product displays, interactive demo areas, tech-forward design",
      home: "Contemporary home goods store, beautifully styled vignettes, lifestyle displays, warm inviting atmosphere",
      beauty: "Luxury beauty retail space, elegant product displays, testing stations, sophisticated lighting",
      food: "Artisan food market, fresh produce displays, gourmet products, warm inviting atmosphere",
      general: "Modern retail warehouse, organized inventory, efficient logistics, professional fulfillment center",
    },
    defaultPrompt: "Modern e-commerce fulfillment center, organized shipping area, professional logistics operation, clean warehouse with technology integration",
  },
  
  education: {
    industry: "Education",
    subcategories: {
      k12: "Modern elementary school classroom, colorful learning environment, interactive whiteboards, engaged students",
      university: "Contemporary university campus, modern architecture, students walking on green quad, academic buildings",
      online: "Professional online learning setup, home study environment, computer with course content, organized desk",
      corporate: "Modern corporate training facility, professional development session, interactive workshop space",
      tutoring: "Cozy tutoring center, one-on-one learning environment, books and educational materials, supportive atmosphere",
      language: "International language school, diverse students, cultural elements, modern classroom technology",
    },
    defaultPrompt: "Modern educational institution, bright learning spaces, contemporary classroom with technology, students engaged in collaborative learning",
  },
  
  realestate: {
    industry: "Real Estate",
    subcategories: {
      residential: "Stunning luxury home exterior, beautiful landscaping, modern architecture, curb appeal",
      commercial: "Impressive commercial building, modern office tower, professional business district location",
      property: "Property management office, professional real estate agents, property listings on screens",
      interior: "Beautifully staged living room, modern interior design, natural light, aspirational lifestyle",
      construction: "Modern construction site, new development, professional builders, progress and growth",
      investment: "Real estate investment presentation, property portfolio, professional meeting with investors",
    },
    defaultPrompt: "Stunning modern home exterior at golden hour, beautiful architectural design, manicured landscaping, aspirational lifestyle property",
  },
  
  legal: {
    industry: "Legal Services",
    subcategories: {
      corporate: "Prestigious law firm boardroom, mahogany furniture, legal books, professional atmosphere",
      family: "Comfortable law office, welcoming consultation room, family-friendly professional environment",
      criminal: "Courthouse exterior, scales of justice, professional legal environment, justice symbolism",
      intellectual: "Modern IP law office, tech-forward design, patent documents, innovative atmosphere",
      immigration: "Diverse immigration law office, world map, welcoming multicultural environment",
      personal: "Compassionate personal injury law office, client consultation room, supportive atmosphere",
    },
    defaultPrompt: "Prestigious law firm office, leather-bound legal books, professional consultation room, mahogany desk, scales of justice visible",
  },
  
  marketing: {
    industry: "Marketing & Advertising",
    subcategories: {
      digital: "Creative digital marketing agency, multiple screens showing campaigns, collaborative workspace",
      branding: "Brand design studio, mood boards, creative materials, artistic professional environment",
      social: "Social media marketing office, content creation setup, influencer collaboration space",
      seo: "SEO agency workspace, analytics dashboards, keyword research on screens, data-driven environment",
      video: "Professional video production studio, cameras and lighting equipment, green screen setup",
      pr: "Public relations firm office, media monitoring screens, press releases, professional communications",
    },
    defaultPrompt: "Creative marketing agency workspace, colorful modern office, campaign materials on walls, collaborative team environment, digital displays",
  },
  
  technology: {
    industry: "Technology",
    subcategories: {
      software: "Software development office, multiple monitors with code, agile workspace, tech startup vibe",
      hardware: "Hardware engineering lab, prototype devices, testing equipment, innovation space",
      ai: "AI research facility, server room visible, futuristic technology, data visualization screens",
      cybersecurity: "Cybersecurity operations center, security monitoring screens, professional tech environment",
      cloud: "Cloud computing data center, server racks, blue LED lighting, high-tech infrastructure",
      mobile: "Mobile app development studio, various devices for testing, modern tech workspace",
    },
    defaultPrompt: "Modern technology company headquarters, innovative workspace, coding screens, collaborative tech environment, startup culture",
  },
  
  hospitality: {
    industry: "Hospitality",
    subcategories: {
      hotel: "Luxury hotel lobby, elegant reception area, grand chandelier, premium hospitality experience",
      restaurant: "Upscale restaurant interior, beautiful table settings, ambient lighting, culinary excellence",
      travel: "Travel agency office with destination imagery, wanderlust inspiration, professional booking area",
      events: "Elegant event venue, wedding or gala setup, beautiful decorations, celebration atmosphere",
      spa: "Luxury spa retreat, relaxation area, natural elements, serene wellness environment",
      bar: "Sophisticated cocktail bar, mood lighting, premium spirits display, intimate atmosphere",
    },
    defaultPrompt: "Luxury hotel lobby, elegant hospitality environment, beautiful interior design, welcoming atmosphere, premium guest experience",
  },
  
  nonprofit: {
    industry: "Non-Profit",
    subcategories: {
      charity: "Community outreach event, volunteers helping, diverse group of people, positive impact",
      environmental: "Environmental conservation scene, nature preservation, sustainability in action",
      education: "Educational nonprofit program, students learning, community support, positive outcomes",
      health: "Healthcare nonprofit clinic, medical outreach, community health services, compassionate care",
      arts: "Arts and culture nonprofit, community art program, creative expression, cultural celebration",
      social: "Social services organization, community support center, helping families, positive change",
    },
    defaultPrompt: "Community nonprofit organization in action, volunteers helping community members, positive impact, diverse group working together",
  },
};

export function getHeroPrompt(industry: string, subcategory?: string): string {
  const normalizedIndustry = industry.toLowerCase().replace(/\s+/g, '-');
  const config = industryPrompts[normalizedIndustry];
  
  if (!config) {
    return `Modern professional office environment, clean contemporary design, natural lighting, business atmosphere, ${PROMPT_SUFFIX}`;
  }
  
  let basePrompt: string;
  
  if (subcategory) {
    const normalizedSubcategory = subcategory.toLowerCase().replace(/\s+/g, '-');
    basePrompt = config.subcategories[normalizedSubcategory] || config.defaultPrompt;
  } else {
    basePrompt = config.defaultPrompt;
  }
  
  return `${basePrompt}, ${PROMPT_SUFFIX}`;
}

export function getPromptVariations(industry: string, subcategory?: string, count: number = 4): string[] {
  const basePrompt = getHeroPrompt(industry, subcategory);
  
  const variations = [
    basePrompt,
    `${basePrompt}, morning golden hour lighting`,
    `${basePrompt}, wide angle view, expansive composition`,
    `${basePrompt}, shallow depth of field, focused details`,
    `${basePrompt}, aerial perspective, establishing shot`,
    `${basePrompt}, sunset warm tones, inviting atmosphere`,
  ];
  
  // Return requested number of variations, shuffled slightly
  return variations.slice(0, count);
}
