export type IndustryType = 
  | 'professional_services'
  | 'b2b_saas'
  | 'ecommerce'
  | 'healthcare'
  | 'education'
  | 'real_estate'
  | 'default';

export interface ContentTemplate {
  heroPattern: (service: string, audience: string, location?: string) => string;
  subheadlinePattern: (value: string) => string;
  valueProps: string[];
  features: Array<{ title: string; description: string; icon: string }>;
  urgencyText: string;
  socialProofPattern: string;
  ctaText: string;
  statsLabels: string[];
}

export const contentTemplates: Record<IndustryType, ContentTemplate> = {
  professional_services: {
    heroPattern: (service, audience, location) => 
      location 
        ? `${service} for ${location} ${audience}`
        : `Professional ${service} for ${audience}`,
    subheadlinePattern: (value) => 
      `${value}. Licensed, insured, and trusted by your neighbors.`,
    valueProps: ['experience', 'trust', 'quality', 'speed', 'local expertise', 'satisfaction guarantee'],
    features: [
      { title: 'Free Consultation', description: 'Get expert advice with no obligation. We\'ll assess your needs and provide a detailed quote.', icon: 'Zap' },
      { title: 'Licensed & Insured', description: 'Fully licensed and insured for your peace of mind. All work is guaranteed and meets local codes.', icon: 'Shield' },
      { title: 'Satisfaction Guarantee', description: 'We stand behind our work 100%. If you\'re not satisfied, we\'ll make it right.', icon: 'Award' },
      { title: 'Local Expertise', description: 'Years of experience serving your community. We understand local needs and regulations.', icon: 'Target' },
      { title: 'Fast Response Time', description: 'Quick scheduling and reliable service. We respect your time and show up when promised.', icon: 'TrendingUp' },
      { title: 'Transparent Pricing', description: 'Clear, upfront pricing with no hidden fees. You\'ll know exactly what you\'re paying for.', icon: 'Users' },
    ],
    urgencyText: 'Book your free consultation today',
    socialProofPattern: 'Trusted by [X]+ local customers',
    ctaText: 'Get Your Free Quote',
    statsLabels: ['Projects Completed', 'Customer Satisfaction', 'Years in Business'],
  },

  b2b_saas: {
    heroPattern: (service, audience) => 
      `${service} That Helps ${audience} Save Time and Money`,
    subheadlinePattern: (value) => 
      `${value}. Start your free trial today - no credit card required.`,
    valueProps: ['time savings', 'cost reduction', 'automation', 'integration', 'scalability', 'support'],
    features: [
      { title: 'Free 14-Day Trial', description: 'Try all premium features free for 14 days. No credit card required, cancel anytime.', icon: 'Zap' },
      { title: 'Easy Integration', description: 'Connects seamlessly with your existing tools. Full API access for custom workflows.', icon: 'Target' },
      { title: '24/7 Support', description: 'Round-the-clock expert support via chat, email, and phone. Average response time under 2 hours.', icon: 'Users' },
      { title: 'Enterprise Security', description: 'Bank-level encryption and SOC 2 compliance. Your data is always safe and secure.', icon: 'Shield' },
      { title: 'Automated Workflows', description: 'Save hours every week with intelligent automation. Set it up once and let it run.', icon: 'TrendingUp' },
      { title: 'Detailed Analytics', description: 'Real-time insights and reporting. Make data-driven decisions with confidence.', icon: 'Award' },
    ],
    urgencyText: 'Start your free trial now',
    socialProofPattern: 'Join [X]+ companies',
    ctaText: 'Start Free Trial',
    statsLabels: ['Active Users', 'Time Saved Daily', 'Customer Satisfaction'],
  },

  ecommerce: {
    heroPattern: (service, audience) => 
      `${service} That ${audience} Love`,
    subheadlinePattern: (value) => 
      `${value}. Free shipping on orders over $50.`,
    valueProps: ['quality', 'price', 'fast shipping', 'selection', 'returns', 'customer service'],
    features: [
      { title: 'Free Shipping', description: 'Free shipping on all orders over $50. Fast delivery to your door in 3-5 business days.', icon: 'Zap' },
      { title: '30-Day Returns', description: 'Not satisfied? Return it within 30 days for a full refund. No questions asked.', icon: 'Shield' },
      { title: 'Secure Checkout', description: 'Shop with confidence using our encrypted payment system. Your information is always protected.', icon: 'Target' },
      { title: 'Quality Guarantee', description: 'Every product is inspected for quality. We stand behind everything we sell.', icon: 'Award' },
      { title: '24/7 Support', description: 'Have questions? Our customer service team is here to help anytime, day or night.', icon: 'Users' },
      { title: 'Price Match Promise', description: 'Found it cheaper elsewhere? We\'ll match the price and give you 10% off.', icon: 'TrendingUp' },
    ],
    urgencyText: 'Shop now - limited time offer',
    socialProofPattern: '[X]+ happy customers',
    ctaText: 'Shop Now',
    statsLabels: ['Products Sold', 'Customer Reviews', 'Average Rating'],
  },

  healthcare: {
    heroPattern: (service, audience) => 
      `${service} for ${audience}`,
    subheadlinePattern: (value) => 
      `${value}. Accepting new patients and most insurance plans.`,
    valueProps: ['expertise', 'care', 'convenience', 'insurance', 'technology', 'outcomes'],
    features: [
      { title: 'Same-Day Appointments', description: 'Need to be seen today? We offer same-day appointments for urgent care needs.', icon: 'Zap' },
      { title: 'Board-Certified Doctors', description: 'Our team of experienced physicians is dedicated to your health and wellbeing.', icon: 'Award' },
      { title: 'Insurance Accepted', description: 'We accept most major insurance plans. Our staff will help verify your coverage.', icon: 'Shield' },
      { title: 'Modern Facility', description: 'State-of-the-art equipment and comfortable, clean environment for your care.', icon: 'Target' },
      { title: 'Patient Portal', description: 'Access your records, test results, and message your doctor anytime online.', icon: 'Users' },
      { title: 'Comprehensive Care', description: 'From prevention to treatment, we provide complete care for you and your family.', icon: 'TrendingUp' },
    ],
    urgencyText: 'Schedule your appointment today',
    socialProofPattern: 'Trusted by [X]+ patients',
    ctaText: 'Book Appointment',
    statsLabels: ['Patients Served', 'Satisfaction Rate', 'Years of Experience'],
  },

  education: {
    heroPattern: (service, audience) => 
      `${service} for ${audience}`,
    subheadlinePattern: (value) => 
      `${value}. Enroll now and start your journey.`,
    valueProps: ['quality', 'flexibility', 'affordability', 'support', 'outcomes', 'accreditation'],
    features: [
      { title: 'Expert Instructors', description: 'Learn from industry professionals with years of real-world experience.', icon: 'Award' },
      { title: 'Flexible Learning', description: 'Study at your own pace with 24/7 access to course materials and recorded lectures.', icon: 'Zap' },
      { title: 'Hands-On Projects', description: 'Apply what you learn with practical projects and real-world case studies.', icon: 'Target' },
      { title: 'Career Support', description: 'Get help with job placement, resume review, and interview preparation.', icon: 'Users' },
      { title: 'Accredited Programs', description: 'Earn recognized certifications and credits that advance your career.', icon: 'Shield' },
      { title: 'Student Community', description: 'Connect with fellow students, share ideas, and build your professional network.', icon: 'TrendingUp' },
    ],
    urgencyText: 'Enroll now - classes filling fast',
    socialProofPattern: '[X]+ students enrolled',
    ctaText: 'Enroll Now',
    statsLabels: ['Students Enrolled', 'Completion Rate', 'Career Placement'],
  },

  real_estate: {
    heroPattern: (service, audience, location) => 
      location 
        ? `Find Your Dream Home in ${location}`
        : `${service} for ${audience}`,
    subheadlinePattern: (value) => 
      `${value}. Let our experienced agents guide you home.`,
    valueProps: ['local knowledge', 'negotiation', 'support', 'network', 'technology', 'results'],
    features: [
      { title: 'Local Market Expert', description: 'Deep knowledge of neighborhoods, schools, and property values in your area.', icon: 'Target' },
      { title: 'Personalized Service', description: 'We take time to understand your needs and find properties that match perfectly.', icon: 'Users' },
      { title: 'Negotiation Skills', description: 'Get the best deal with our proven negotiation strategies and market insights.', icon: 'TrendingUp' },
      { title: 'Full Support', description: 'We handle everything from showings to closing, making your transaction smooth and stress-free.', icon: 'Shield' },
      { title: 'Extensive Network', description: 'Access to off-market properties and connections with top lenders and inspectors.', icon: 'Award' },
      { title: 'Virtual Tours', description: 'View properties from anywhere with high-quality photos and 3D virtual tours.', icon: 'Zap' },
    ],
    urgencyText: 'Schedule your showing today',
    socialProofPattern: 'Helped [X]+ families find their home',
    ctaText: 'Schedule a Showing',
    statsLabels: ['Homes Sold', 'Client Satisfaction', 'Average Days to Close'],
  },

  default: {
    heroPattern: (service, audience) => 
      `${service} for ${audience}`,
    subheadlinePattern: (value) => value,
    valueProps: ['quality', 'reliability', 'value', 'support', 'expertise', 'results'],
    features: [
      { title: 'Expert Service', description: 'Professional service delivered by experienced specialists who care about your success.', icon: 'Award' },
      { title: 'Quality Guaranteed', description: 'We stand behind our work with a satisfaction guarantee and commitment to excellence.', icon: 'Shield' },
      { title: 'Fast Response', description: 'Quick turnaround times and responsive communication throughout your project.', icon: 'Zap' },
      { title: 'Competitive Pricing', description: 'Fair, transparent pricing with no hidden fees. Great value for your investment.', icon: 'Target' },
      { title: 'Proven Results', description: 'Track record of success helping clients achieve their goals and exceed expectations.', icon: 'TrendingUp' },
      { title: 'Ongoing Support', description: 'Dedicated support team ready to help you every step of the way.', icon: 'Users' },
    ],
    urgencyText: 'Get started today',
    socialProofPattern: 'Trusted by [X]+ customers',
    ctaText: 'Get Started',
    statsLabels: ['Customers Served', 'Satisfaction Rate', 'Years in Business'],
  },
};

export function getIndustryTemplate(industry?: string): ContentTemplate {
  if (!industry) return contentTemplates.default;
  
  const normalized = industry.toLowerCase().replace(/\s+/g, '_');
  
  // Map common industry names to template keys
  const industryMap: Record<string, IndustryType> = {
    'professional_services': 'professional_services',
    'professional_service': 'professional_services',
    'b2b_saas': 'b2b_saas',
    'saas': 'b2b_saas',
    'software': 'b2b_saas',
    'ecommerce': 'ecommerce',
    'e-commerce': 'ecommerce',
    'retail': 'ecommerce',
    'healthcare': 'healthcare',
    'medical': 'healthcare',
    'health': 'healthcare',
    'education': 'education',
    'learning': 'education',
    'training': 'education',
    'real_estate': 'real_estate',
    'realestate': 'real_estate',
  };
  
  const templateKey = industryMap[normalized] || 'default';
  return contentTemplates[templateKey];
}
