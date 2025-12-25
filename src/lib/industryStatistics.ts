export interface IndustryStat {
  value: string;
  label: string;
  source: string;
  sourceUrl?: string;
}

const INDUSTRY_STATISTICS: Record<string, IndustryStat[]> = {
  'saas': [
    { value: '73%', label: 'of B2B buyers say case studies influence their purchase decisions', source: 'Demand Gen Report, 2023' },
    { value: '40%', label: 'higher conversion rates with social proof on landing pages', source: 'VWO Research' },
    { value: '92%', label: 'of consumers read online reviews before making a decision', source: 'G2 Buyer Behavior Report' },
    { value: '2.4x', label: 'more likely to convert when seeing peer testimonials', source: 'Nielsen Trust Study' },
    { value: '88%', label: 'trust online reviews as much as personal recommendations', source: 'BrightLocal Survey' },
  ],
  'software': [
    { value: '73%', label: 'of B2B buyers say case studies influence their purchase decisions', source: 'Demand Gen Report, 2023' },
    { value: '40%', label: 'higher conversion rates with social proof on landing pages', source: 'VWO Research' },
    { value: '92%', label: 'of consumers read online reviews before making a decision', source: 'G2 Buyer Behavior Report' },
    { value: '2.4x', label: 'more likely to convert when seeing peer testimonials', source: 'Nielsen Trust Study' },
  ],
  'consulting': [
    { value: '84%', label: 'of B2B decision-makers start with a referral', source: 'Harvard Business Review' },
    { value: '65%', label: 'of new business comes from referrals for professional services', source: 'Hinge Research Institute' },
    { value: '5x', label: 'higher close rate for referred leads vs cold leads', source: 'Texas Tech University Study' },
    { value: '91%', label: 'of B2B buyers are influenced by word-of-mouth when making decisions', source: 'USM Research' },
  ],
  'professional-services': [
    { value: '84%', label: 'of B2B decision-makers start with a referral', source: 'Harvard Business Review' },
    { value: '65%', label: 'of new business comes from referrals for professional services', source: 'Hinge Research Institute' },
    { value: '5x', label: 'higher close rate for referred leads vs cold leads', source: 'Texas Tech University Study' },
  ],
  'ecommerce': [
    { value: '93%', label: 'of consumers say reviews impact their purchasing decisions', source: 'Podium, 2023' },
    { value: '58%', label: 'would pay more for products with good reviews', source: 'Podium Consumer Survey' },
    { value: '270%', label: 'increase in conversion with 5+ product reviews', source: 'Spiegel Research Center' },
    { value: '72%', label: 'of customers won\'t take action until reading reviews', source: 'Testimonial Engine' },
  ],
  'retail': [
    { value: '93%', label: 'of consumers say reviews impact their purchasing decisions', source: 'Podium, 2023' },
    { value: '58%', label: 'would pay more for products with good reviews', source: 'Podium Consumer Survey' },
    { value: '270%', label: 'increase in conversion with 5+ product reviews', source: 'Spiegel Research Center' },
  ],
  'healthcare': [
    { value: '77%', label: 'of patients use online reviews as first step in finding care', source: 'Software Advice' },
    { value: '84%', label: 'trust online reviews as much as personal recommendations', source: 'BrightLocal Healthcare Study' },
    { value: '94%', label: 'of patients use online reviews to evaluate physicians', source: 'PatientPop Survey' },
    { value: '69%', label: 'won\'t consider a healthcare provider with less than 4 stars', source: 'RepuGen' },
  ],
  'medical': [
    { value: '77%', label: 'of patients use online reviews as first step in finding care', source: 'Software Advice' },
    { value: '84%', label: 'trust online reviews as much as personal recommendations', source: 'BrightLocal Healthcare Study' },
    { value: '94%', label: 'of patients use online reviews to evaluate physicians', source: 'PatientPop Survey' },
  ],
  'manufacturing': [
    { value: '67%', label: 'of B2B buyers rely on peer recommendations', source: 'Demand Gen Report' },
    { value: '89%', label: 'of buyers consider vendor reputation critical', source: 'Industrial Marketing Survey' },
    { value: '71%', label: 'of industrial buyers consult case studies before purchase', source: 'Thomas Industrial Report' },
    { value: '3.2x', label: 'faster decision making with peer recommendations', source: 'Gartner' },
  ],
  'industrial': [
    { value: '67%', label: 'of B2B buyers rely on peer recommendations', source: 'Demand Gen Report' },
    { value: '89%', label: 'of buyers consider vendor reputation critical', source: 'Industrial Marketing Survey' },
    { value: '71%', label: 'of industrial buyers consult case studies before purchase', source: 'Thomas Industrial Report' },
  ],
  'finance': [
    { value: '78%', label: 'of financial service clients rely on referrals', source: 'Financial Planning Association' },
    { value: '86%', label: 'say trust is the most important factor in choosing a financial advisor', source: 'Edelman Trust Barometer' },
    { value: '4.3x', label: 'higher client lifetime value from referred clients', source: 'Wharton School Study' },
  ],
  'real-estate': [
    { value: '82%', label: 'of home buyers choose agents based on referrals', source: 'NAR Profile of Home Buyers' },
    { value: '91%', label: 'of millennials trust online reviews as much as personal recommendations', source: 'BrightLocal' },
    { value: '68%', label: 'of sellers would use the same agent again if satisfied', source: 'NAR Research' },
  ],
  'education': [
    { value: '85%', label: 'of prospective students read reviews before enrolling', source: 'Niche Education Report' },
    { value: '71%', label: 'say peer reviews influenced their enrollment decision', source: 'Higher Ed Marketing' },
    { value: '3.7x', label: 'more likely to enroll after reading positive testimonials', source: 'EAB Research' },
  ],
  'fitness': [
    { value: '88%', label: 'of gym-goers research reviews before joining', source: 'IHRSA' },
    { value: '74%', label: 'would switch gyms based on better reviews', source: 'Mindbody Consumer Report' },
    { value: '67%', label: 'trust before-and-after transformations over other proof', source: 'Fitness Marketing Survey' },
  ],
  'hospitality': [
    { value: '93%', label: 'of travelers read reviews before booking', source: 'TripAdvisor' },
    { value: '79%', label: 'book with higher-rated properties even at higher prices', source: 'Cornell Hospitality Research' },
    { value: '52%', label: 'won\'t book a hotel with no reviews', source: 'Expedia Group' },
  ],
  'legal': [
    { value: '76%', label: 'of people seeking legal help research attorneys online first', source: 'Legal Trends Report' },
    { value: '87%', label: 'say client testimonials strongly influence their decision', source: 'Martindale-Avvo' },
    { value: '4.1x', label: 'more inquiries for attorneys with video testimonials', source: 'Law Firm Marketing' },
  ],
};

// Default/fallback statistics that work for any industry
const DEFAULT_STATISTICS: IndustryStat[] = [
  { value: '92%', label: 'of consumers read online reviews before making a decision', source: 'BrightLocal Consumer Review Survey' },
  { value: '88%', label: 'trust online reviews as much as personal recommendations', source: 'BrightLocal' },
  { value: '73%', label: 'of consumers trust a business more after reading positive reviews', source: 'Podium' },
  { value: '2.4x', label: 'more likely to convert when seeing social proof', source: 'Nielsen Trust Study' },
  { value: '40%', label: 'higher conversion rates with social proof on landing pages', source: 'VWO Research' },
];

/**
 * Get relevant statistics for a given industry
 * @param industry - The industry to get statistics for
 * @param count - Number of statistics to return (default: 3)
 * @returns Array of industry statistics
 */
export function getIndustryStatistics(industry: string, count: number = 3): IndustryStat[] {
  const normalizedIndustry = industry.toLowerCase().replace(/[^a-z-]/g, '');
  const stats = INDUSTRY_STATISTICS[normalizedIndustry] || DEFAULT_STATISTICS;
  
  // Shuffle and return requested count
  const shuffled = [...stats].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, stats.length));
}

/**
 * Get all available industries
 */
export function getAvailableIndustries(): string[] {
  return Object.keys(INDUSTRY_STATISTICS);
}

/**
 * Check if we have specific statistics for an industry
 */
export function hasIndustryStatistics(industry: string): boolean {
  const normalizedIndustry = industry.toLowerCase().replace(/[^a-z-]/g, '');
  return normalizedIndustry in INDUSTRY_STATISTICS;
}
