import { getLayoutRecommendation } from './industryLayouts';

const testIntelligence = {
  industry: 'SaaS B2B',
  businessName: 'Test Co',
  audience: 'business owners',
  offering: 'software platform',
  features: [],
  differentiators: [],
  testimonials: [],
  caseStudies: [],
  metrics: [],
  logos: [],
  competitors: [],
  painPoints: [],
  objections: [],
};

const result = getLayoutRecommendation(testIntelligence);
console.log('Layout:', result.config.name);
console.log('Confidence:', result.confidence);
console.log('Sections:', result.sections);
