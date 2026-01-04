import { Clock, Star, Quote, User, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
    industryVariant?: string;
    sectionTitle?: string;
    testimonial?: {
      quote: string;
      name: string;
      title: string;
      company: string;
      rating?: number;
      avatarUrl?: string;
    };
    achievements?: string;
    // NEW: Proof story from wizard
    proofStory?: string | null;
    proofStoryContext?: string | null;
  };
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

function getSocialProofHeader(industry?: string, isConsulting?: boolean): { title: string; subtitle: string; placeholderQuote: string } {
  if (isConsulting) {
    return {
      title: 'Client Results',
      subtitle: 'What our clients say about working with us',
      placeholderQuote: 'Working with this team has been transformative. Their expertise and dedication to client success is unmatched in the industry.'
    };
  }
  
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
  
  return { 
    title: 'What Our Clients Say', 
    subtitle: 'Join hundreds of satisfied customers',
    placeholderQuote: 'Working with this team has been transformative. Their expertise and dedication to client success is unmatched in the industry.'
  };
}

export function SocialProofSection({ content, onUpdate, isEditing }: SocialProofSectionProps) {
  const isConsulting = content.industryVariant === 'consulting';
  const isSaas = content.industryVariant === 'saas';
  const header = getSocialProofHeader(content.industry, isConsulting);
  
  
  
  const testimonial = content.testimonial || {
    quote: header.placeholderQuote,
    name: "Sarah M.",
    title: "Satisfied Customer",
    company: "",
    rating: 5
  };

  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    if (field.startsWith('testimonial.')) {
      const testimonialField = field.replace('testimonial.', '');
      onUpdate({
        ...content,
        testimonial: {
          ...testimonial,
          [testimonialField]: e.currentTarget.textContent || testimonial[testimonialField as keyof typeof testimonial],
        },
      });
    } else {
      onUpdate({
        ...content,
        [field]: e.currentTarget.textContent || content[field as keyof typeof content],
      });
    }
  };

  const handleAvatarChange = () => {
    // Trigger file upload or image picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onUpdate({
            ...content,
            testimonial: {
              ...testimonial,
              avatarUrl: reader.result as string,
            },
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };
  // SaaS variant
  if (isSaas) {
    return (
      <section className={`py-24 ${isEditing ? 'relative' : ''}`} style={{ backgroundColor: '#0F172A' }}>
        {isEditing && (
          <div className="absolute inset-0 border-2 border-purple-500/50 rounded-lg pointer-events-none z-10" />
        )}
        <div className="max-w-4xl mx-auto px-6">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1 bg-purple-500/20 text-purple-400 text-sm font-semibold rounded-full mb-4">
              CUSTOMERS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Loved by teams everywhere
            </h2>
          </motion.div>

          {/* Featured Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-800 border border-slate-700 p-10 rounded-2xl"
          >
            {/* Stars */}
            <div className="flex gap-1 mb-6 justify-center">
              {[...Array(testimonial.rating || 5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            
            {/* Quote */}
            <blockquote
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("testimonial.quote", e)}
              className={`text-xl md:text-2xl text-slate-200 leading-relaxed text-center mb-8 ${isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-2" : ""}`}
            >
              "{testimonial.quote}"
            </blockquote>
            
            {/* Attribution */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                {testimonial.avatarUrl ? (
                  <img src={testimonial.avatarUrl} alt={testimonial.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-slate-500" />
                )}
              </div>
              <div className="text-left">
                <div className="font-bold text-white">{testimonial.name}</div>
                <div className="text-slate-400">{testimonial.title}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  if (isConsulting) {
    // Consulting layout: Light slate background, featured testimonial
    return (
      <section className={`py-24 bg-slate-50 ${isEditing ? 'relative' : ''}`}>
        {isEditing && (
          <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
        )}
        <div className="max-w-4xl mx-auto px-6">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1 bg-amber-100 text-amber-800 text-sm font-semibold rounded-full mb-4">
              SUCCESS STORIES
            </span>
            <h2 
              className={`text-3xl md:text-4xl font-bold text-slate-900 ${isEditing ? 'cursor-text hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-1' : ''}`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("sectionTitle", e)}
            >
              {content.sectionTitle || header.title}
            </h2>
          </motion.div>

          {/* Featured Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white p-10 md:p-12 rounded-2xl shadow-sm border border-slate-100"
          >
            {/* Stars */}
            <div className="flex gap-1 mb-6 justify-center">
              {[...Array(testimonial.rating || 5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
              ))}
            </div>
            
            {/* Quote */}
            <blockquote 
              className={`text-xl md:text-2xl text-slate-800 leading-relaxed text-center mb-8 italic ${
                isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("testimonial.quote", e)}
            >
              "{testimonial.quote}"
            </blockquote>
            
            {/* Attribution */}
            <div className="flex items-center justify-center gap-4">
              <div className="relative group">
                <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                  {testimonial.avatarUrl ? (
                    <img src={testimonial.avatarUrl} alt={testimonial.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-slate-500" strokeWidth={1.5} />
                  )}
                </div>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-7 w-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleAvatarChange}
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="text-left">
                <div 
                  className={`font-bold text-slate-900 ${
                    isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-1" : ""
                  }`}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleBlur("testimonial.name", e)}
                >
                  {testimonial.name}
                </div>
                <div 
                  className={`text-slate-600 ${
                    isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-1" : ""
                  }`}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleBlur("testimonial.title", e)}
                >
                  {testimonial.title}{testimonial.company && `, ${testimonial.company}`}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Achievements */}
          {content.achievements && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 p-6 bg-white rounded-xl border border-slate-200 text-center"
            >
              <p 
                className={`text-slate-600 leading-relaxed ${
                  isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
                }`}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("achievements", e)}
              >
                {content.achievements}
              </p>
            </motion.div>
          )}
        </div>
      </section>
    );
  }
  
  // Default dark mode layout
  return (
    <section 
      className={isEditing ? 'relative' : ''}
      style={{ 
        backgroundColor: 'var(--color-surface)',
        padding: '96px 24px',
      }}
    >
      {isEditing && (
        <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
      )}
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
              className={`text-xl md:text-2xl lg:text-3xl mb-10 relative z-10 italic ${
                isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
              }`}
              style={{ 
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
                lineHeight: 'var(--line-height-body)',
                fontWeight: 500,
              }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("testimonial.quote", e)}
            >
              "{testimonial.quote}"
            </blockquote>
            
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div 
                  className="w-16 h-16 md:w-18 md:h-18 rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    background: testimonial.avatarUrl ? 'transparent' : `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                    boxShadow: 'var(--shadow-medium)',
                  }}
                >
                  {testimonial.avatarUrl ? (
                    <img src={testimonial.avatarUrl} alt={testimonial.name} className="w-full h-full object-cover" />
                  ) : (
                    <User 
                      className="w-8 h-8 md:w-9 md:h-9"
                      style={{ color: 'var(--color-text-inverse)' }}
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-7 w-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleAvatarChange}
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div>
                <div 
                  className={`text-lg md:text-xl ${
                    isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-1" : ""
                  }`}
                  style={{ 
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 'var(--font-weight-heading)',
                  }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleBlur("testimonial.name", e)}
                >
                  {testimonial.name}
                </div>
                <div 
                  className={`text-sm md:text-base ${
                    isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-1" : ""
                  }`}
                  style={{ 
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)',
                  }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleBlur("testimonial.title", e)}
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
