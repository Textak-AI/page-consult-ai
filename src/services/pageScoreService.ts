// src/services/pageScoreService.ts

export interface PageScoreInput {
  companyName?: string;
  businessName?: string;
  industry?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroImage?: string;
  ctaText?: string;
  sections?: Array<{ type: string; content?: any }>;
  stats?: Array<{ value: string; label: string }>;
  testimonials?: Array<{ quote: string; author: string; title?: string; company?: string }>;
  faqItems?: Array<{ question: string; answer: string }>;
  features?: Array<{ title: string; description: string }>;
  guaranteeOffer?: string;
  urgencyAngle?: string;
  authorityMarkers?: string[];
}

export interface ScoreResult {
  overall: number;
  categories: {
    brand: number;
    authority: number;
    social: number;
    trust: number;
  };
  improvements: string[];
  strengths: string[];
}

export function calculatePageScore(data: PageScoreInput): ScoreResult {
  const sections = data.sections || [];
  const sectionTypes = sections.map(s => s.type);
  
  // Brand Identity Score
  let brandScore = 0;
  const brandMax = 100;
  if (data.companyName || data.businessName) brandScore += 20;
  if (data.heroHeadline && data.heroHeadline.length > 10) brandScore += 25;
  if (data.heroSubheadline && data.heroSubheadline.length > 20) brandScore += 25;
  if (data.heroImage) brandScore += 15;
  if (data.ctaText && data.ctaText.length > 2) brandScore += 15;
  
  // Authority Score
  let authorityScore = 0;
  const hasStats = (data.stats && data.stats.length > 0) || sectionTypes.includes('stats');
  if (hasStats) authorityScore += 30;
  if (data.stats && data.stats.length >= 3) authorityScore += 20;
  if (data.heroHeadline?.match(/expert|proven|leading|trusted|#1|best|top/i)) authorityScore += 25;
  if (data.authorityMarkers && data.authorityMarkers.length > 0) authorityScore += 25;
  
  // Social Proof Score
  let socialScore = 0;
  const hasTestimonials = (data.testimonials && data.testimonials.length > 0) || sectionTypes.includes('social-proof');
  if (hasTestimonials) socialScore += 35;
  if (data.testimonials && data.testimonials.length >= 2) socialScore += 20;
  if (data.testimonials?.some(t => t.author && t.author.length > 3)) socialScore += 25;
  if (sectionTypes.includes('social-proof')) socialScore += 20;
  
  // Trust Signals Score
  let trustScore = 0;
  const hasFAQ = (data.faqItems && data.faqItems.length > 0) || sectionTypes.includes('faq');
  if (data.guaranteeOffer) trustScore += 30;
  if (hasFAQ) trustScore += 25;
  if (data.faqItems && data.faqItems.length >= 3) trustScore += 20;
  if (data.urgencyAngle) trustScore += 25;
  
  // Calculate percentages
  const brand = Math.round((brandScore / brandMax) * 100);
  const authority = Math.round((authorityScore / 100) * 100);
  const social = Math.round((socialScore / 100) * 100);
  const trust = Math.round((trustScore / 100) * 100);
  
  const overall = Math.round((brand + authority + social + trust) / 4);
  
  // Generate improvements
  const improvements: string[] = [];
  if (!hasStats) improvements.push('Add statistics to build credibility');
  if (!hasTestimonials) improvements.push('Include customer testimonials');
  if (!data.guaranteeOffer) improvements.push('Add a guarantee to reduce risk');
  if (!hasFAQ) improvements.push('Create FAQ to address objections');
  
  // Generate strengths
  const strengths: string[] = [];
  if (brand >= 80) strengths.push('Strong brand identity');
  if (authority >= 80) strengths.push('Excellent authority signals');
  if (social >= 80) strengths.push('Great social proof');
  if (trust >= 80) strengths.push('Strong trust elements');
  
  return {
    overall,
    categories: { brand, authority, social, trust },
    improvements: improvements.slice(0, 3),
    strengths: strengths.slice(0, 3),
  };
}
