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
    // NEW: Proof story from wizard
    proofStory?: string | null;
    proofStoryContext?: string | null;
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
      style={{ 
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--spacing-section-y) var(--spacing-section-x)',
      }}
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
            className="text-3xl sm:text-4xl md:text-5xl mb-5"
            style={{ 
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-weight-heading)',
              lineHeight: 'var(--line-height-heading)',
              letterSpacing: 'var(--letter-spacing-heading)',
            }}
          >
            {header.title}
          </h2>
          <p 
            className="text-lg md:text-xl"
            style={{ 
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              lineHeight: 'var(--line-height-body)',
            }}
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
            className="relative"
            style={{
              backgroundColor: 'var(--color-background-alt)',
              borderColor: 'var(--color-border)',
              borderWidth: 'var(--border-width)',
              borderStyle: 'solid',
              borderRadius: 'var(--radius-large)',
              padding: 'var(--spacing-card-padding)',
              boxShadow: 'var(--shadow-large)',
            }}
          >
            <Quote 
              className="absolute top-6 left-6 md:top-8 md:left-8 w-12 h-12 md:w-16 md:h-16"
              style={{ color: 'var(--color-primary)', opacity: 0.15 }}
              strokeWidth={1.5}
            />
            
            {/* Star Rating */}
            <div className="flex gap-1.5 mb-8">
              {[...Array(testimonial.rating || 5)].map((_, i) => (
                <Star 
                  key={i} 
                  className="w-6 h-6 md:w-7 md:h-7 fill-current"
                  style={{ color: 'var(--color-warning)' }}
                />
              ))}
            </div>
            
            <blockquote 
              className="text-xl md:text-2xl lg:text-3xl mb-10 relative z-10 italic"
              style={{ 
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
                lineHeight: 'var(--line-height-body)',
                fontWeight: 500,
              }}
            >
              "{testimonial.quote}"
            </blockquote>
            
            <div className="flex items-center gap-5">
              <div 
                className="w-16 h-16 md:w-18 md:h-18 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                  boxShadow: 'var(--shadow-medium)',
                }}
              >
                <User 
                  className="w-8 h-8 md:w-9 md:h-9"
                  style={{ color: 'var(--color-text-inverse)' }}
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <div 
                  className="text-lg md:text-xl"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 'var(--font-weight-heading)',
                  }}
                >
                  {testimonial.name}
                </div>
                <div 
                  className="text-sm md:text-base"
                  style={{ 
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {testimonial.title}{testimonial.company && `, ${testimonial.company}`}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Proof Story Callout - if provided */}
        {content.proofStory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="absolute -top-3 left-6">
                <span className="px-3 py-1 rounded-full bg-brand text-white text-xs font-medium">
                  Recent Result
                </span>
              </div>
              <blockquote className="text-lg text-foreground font-medium mt-2">
                "{content.proofStory}"
              </blockquote>
              {content.proofStoryContext && (
                <p className="mt-3 text-sm text-muted-foreground">
                  — {content.proofStoryContext}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        {content.stats && content.stats.length > 0 && content.stats.some(s => s.value) && (
          <div className="grid md:grid-cols-3 mb-16 max-w-4xl mx-auto" style={{ gap: 'var(--spacing-card-gap)' }}>
            {content.stats.filter(s => s.value).map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center hover:scale-[1.02] transition-all duration-300"
                style={{
                  backgroundColor: 'var(--color-background-alt)',
                  borderColor: 'var(--color-border)',
                  borderWidth: 'var(--border-width)',
                  borderStyle: 'solid',
                  borderRadius: 'var(--radius-medium)',
                  padding: 'var(--spacing-card-padding)',
                  boxShadow: 'var(--shadow-small)',
                }}
              >
                <div 
                  className="text-4xl md:text-5xl mb-3"
                  style={{ 
                    color: 'var(--color-primary)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 'var(--font-weight-heading)',
                  }}
                >
                  {stat.value}
                </div>
                <div 
                  style={{ 
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 'var(--font-weight-body)',
                  }}
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
            className="max-w-2xl mx-auto"
            style={{
              backgroundColor: 'var(--color-background-alt)',
              borderColor: 'var(--color-border)',
              borderWidth: 'var(--border-width)',
              borderStyle: 'solid',
              borderRadius: 'var(--radius-medium)',
              padding: 'var(--spacing-card-padding)',
            }}
          >
            <div 
              className="flex items-center gap-2 mb-5 text-sm font-semibold"
              style={{ 
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              <Clock 
                className="w-5 h-5"
                style={{ color: 'var(--color-primary)' }}
                strokeWidth={1.5}
              />
              <span>Recent Activity</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-element-gap)' }}>
              {content.recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span 
                      className="font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {activity.name}
                    </span>
                    <span 
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {' '}{activity.action} from {activity.location}
                    </span>
                  </div>
                  <span 
                    className="text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
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
