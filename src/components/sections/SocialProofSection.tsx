import { Clock, Star, Quote, User } from "lucide-react";
import { motion } from "framer-motion";

interface SocialProofSectionProps {
  content: {
    stats: Array<{
      label: string;
      value: string;
    }>;
    recentActivity?: Array<{
      name: string;
      action: string;
      time: string;
      location: string;
    }>;
    industryInsights?: {
      title: string;
      stats: string[];
      facts?: string[];
      valueProps?: string[];
      credentials?: string[];
      extractedStats?: {
        marketSize: string | null;
        growthRate: string | null;
        customerCount: string | null;
      };
    };
    industry?: string;
    testimonial?: {
      quote: string;
      name: string;
      title: string;
      company: string;
      rating?: number;
    };
  };
  onUpdate: (content: any) => void;
}

function getSocialProofHeader(industry?: string): { title: string; subtitle: string; placeholderQuote: string } {
  const industryLower = industry?.toLowerCase() || '';
  
  if (industryLower.includes('wedding') || industryLower.includes('dj')) {
    return { 
      title: 'Trusted by Happy Couples', 
      subtitle: 'See what couples are saying',
      placeholderQuote: 'Wedding planners across the region trust us for their most important events. Our commitment to excellence has made us the go-to choice for unforgettable celebrations.'
    };
  }
  
  if (industryLower.includes('b2b') || industryLower.includes('saas') || industryLower.includes('software')) {
    return { 
      title: 'Trusted by Companies', 
      subtitle: 'Join leading teams',
      placeholderQuote: 'Teams across the industry rely on our solutions to streamline their operations and drive growth. The results speak for themselves.'
    };
  }
  
  if (industryLower.includes('ecommerce') || industryLower.includes('shop') || industryLower.includes('store')) {
    return { 
      title: 'What Customers Are Saying', 
      subtitle: 'Join thousands of satisfied shoppers',
      placeholderQuote: 'Shopping with us has been an absolute pleasure. From selection to delivery, every step exceeded my expectations.'
    };
  }
  
  if (industryLower.includes('legal') || industryLower.includes('law') || industryLower.includes('attorney')) {
    return { 
      title: 'Client Success Stories', 
      subtitle: 'Proven results you can trust',
      placeholderQuote: 'Professional, thorough, and dedicated to achieving the best possible outcome. I could not have asked for better representation.'
    };
  }
  
  if (industryLower.includes('home') || industryLower.includes('contractor') || industryLower.includes('repair')) {
    return { 
      title: 'Trusted by Homeowners', 
      subtitle: 'See what neighbors are saying',
      placeholderQuote: 'From start to finish, the quality of work and professionalism exceeded all expectations. Our home has never looked better.'
    };
  }
  
  if (industryLower.includes('health') || industryLower.includes('medical') || industryLower.includes('doctor')) {
    return { 
      title: 'What Patients Are Saying', 
      subtitle: 'Real testimonials from real patients',
      placeholderQuote: 'Compassionate care combined with expertise. I finally found a provider who truly listens and delivers results.'
    };
  }
  
  return { 
    title: 'What Our Clients Say', 
    subtitle: 'Join hundreds of satisfied customers',
    placeholderQuote: 'Working with this team has been transformative. Their expertise and dedication to client success is unmatched in the industry.'
  };
}

export function SocialProofSection({ content }: SocialProofSectionProps) {
  const header = getSocialProofHeader(content.industry);
  
  const testimonial = content.testimonial || {
    quote: header.placeholderQuote,
    name: "Sarah M.",
    title: "Satisfied Customer",
    company: "",
    rating: 5
  };
  
  return (
    <section 
      className="py-20 md:py-28 px-4"
      style={{ backgroundColor: 'var(--color-surface, white)' }}
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 md:mb-20 mx-auto max-w-3xl"
        >
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5"
            style={{ color: 'var(--color-text-primary, #0f172a)' }}
          >
            {header.title}
          </h2>
          <p 
            className="text-lg md:text-xl"
            style={{ color: 'var(--color-text-secondary, #475569)' }}
          >
            {header.subtitle}
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div 
            className="relative p-8 md:p-12 lg:p-16 rounded-3xl shadow-xl"
            style={{
              backgroundColor: 'var(--color-background-alt, #f8fafc)',
              borderColor: 'var(--color-border, #e2e8f0)',
              borderWidth: '1px',
            }}
          >
            <Quote 
              className="absolute top-6 left-6 md:top-8 md:left-8 w-12 h-12 md:w-16 md:h-16"
              style={{ color: 'var(--color-primary, rgba(6, 182, 212, 0.15))' }}
            />
            
            {/* Star Rating */}
            <div className="flex gap-1.5 mb-8">
              {[...Array(testimonial.rating || 5)].map((_, i) => (
                <Star 
                  key={i} 
                  className="w-6 h-6 md:w-7 md:h-7 fill-current"
                  style={{ color: 'var(--color-warning, #facc15)' }}
                />
              ))}
            </div>
            
            <blockquote 
              className="text-xl md:text-2xl lg:text-3xl leading-relaxed mb-10 relative z-10 font-medium italic"
              style={{ color: 'var(--color-text-primary, #0f172a)' }}
            >
              "{testimonial.quote}"
            </blockquote>
            
            <div className="flex items-center gap-5">
              <div 
                className="w-16 h-16 md:w-18 md:h-18 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary, #06b6d4), var(--color-secondary, #a855f7))`,
                }}
              >
                <User 
                  className="w-8 h-8 md:w-9 md:h-9"
                  style={{ color: 'var(--color-text-inverse, white)' }}
                />
              </div>
              <div>
                <div 
                  className="font-bold text-lg md:text-xl"
                  style={{ color: 'var(--color-text-primary, #0f172a)' }}
                >
                  {testimonial.name}
                </div>
                <div 
                  className="text-sm md:text-base"
                  style={{ color: 'var(--color-text-secondary, #64748b)' }}
                >
                  {testimonial.title}{testimonial.company && `, ${testimonial.company}`}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {content.stats && content.stats.length > 0 && content.stats.some(s => s.value) && (
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-16 max-w-4xl mx-auto">
            {content.stats.filter(s => s.value).map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300"
                style={{
                  backgroundColor: 'var(--color-background-alt, #f8fafc)',
                  borderColor: 'var(--color-border, #e2e8f0)',
                  borderWidth: '1px',
                }}
              >
                <div 
                  className="text-4xl md:text-5xl font-bold mb-3"
                  style={{ color: 'var(--color-primary, #06b6d4)' }}
                >
                  {stat.value}
                </div>
                <div 
                  className="font-medium"
                  style={{ color: 'var(--color-text-secondary, #64748b)' }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {content.recentActivity && content.recentActivity.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 md:p-8 rounded-2xl max-w-2xl mx-auto"
            style={{
              backgroundColor: 'var(--color-background-alt, #f8fafc)',
              borderColor: 'var(--color-border, #e2e8f0)',
              borderWidth: '1px',
            }}
          >
            <div 
              className="flex items-center gap-2 mb-5 text-sm font-semibold"
              style={{ color: 'var(--color-text-primary, #0f172a)' }}
            >
              <Clock 
                className="w-5 h-5"
                style={{ color: 'var(--color-primary, #06b6d4)' }}
              />
              <span>Recent Activity</span>
            </div>
            <div className="space-y-4">
              {content.recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span 
                      className="font-semibold"
                      style={{ color: 'var(--color-text-primary, #0f172a)' }}
                    >
                      {activity.name}
                    </span>
                    <span 
                      style={{ color: 'var(--color-text-secondary, #64748b)' }}
                    >
                      {' '}{activity.action} from {activity.location}
                    </span>
                  </div>
                  <span 
                    className="text-xs"
                    style={{ color: 'var(--color-text-muted, #94a3b8)' }}
                  >
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
