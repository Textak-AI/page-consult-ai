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
    <section className="py-24 px-4 bg-white dark:bg-slate-900">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 mx-auto max-w-3xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {header.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {header.subtitle}
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="relative p-8 md:p-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700">
            <Quote className="absolute top-6 left-6 w-12 h-12 text-cyan-500/20" />
            
            {/* Star Rating */}
            <div className="flex gap-1 mb-6">
              {[...Array(testimonial.rating || 5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            
            <blockquote className="text-xl md:text-2xl text-slate-700 dark:text-slate-200 leading-relaxed mb-8 relative z-10">
              "{testimonial.quote}"
            </blockquote>
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {testimonial.title}{testimonial.company && `, ${testimonial.company}`}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {content.stats && content.stats.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
            {content.stats.map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent mb-3">
                  {stat.value}
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
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
            className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-2 mb-4 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span>Recent Activity</span>
            </div>
            <div className="space-y-3">
              {content.recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium text-slate-900 dark:text-white">{activity.name}</span>
                    <span className="text-slate-500 dark:text-slate-400"> {activity.action}</span>
                    <span className="text-slate-500 dark:text-slate-400"> from {activity.location}</span>
                  </div>
                  <span className="text-xs text-slate-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
