import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Linkedin, Globe, Quote, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumCard, EyebrowBadge } from '@/components/ui/PremiumCard';

interface Props {
  content: {
    name: string;
    title?: string;
    photo?: string;
    story: string;
    credentials?: string[];
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      website?: string;
    };
  };
  onUpdate?: (content: any) => void;
  isEditing?: boolean;
}

export const FounderCredibilitySection: React.FC<Props> = ({ 
  content, 
  onUpdate,
  isEditing 
}) => {
  const initials = content.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const hasSocialLinks = content.socialLinks && 
    (content.socialLinks.twitter || content.socialLinks.linkedin || content.socialLinks.website);

  const storyParagraphs = content.story.split('\n').filter(p => p.trim());

  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    if (onUpdate) {
      onUpdate({
        ...content,
        [field]: e.currentTarget.textContent || content[field as keyof typeof content],
      });
    }
  };

  return (
    <section 
      className="relative overflow-hidden"
      style={{ 
        backgroundColor: 'hsl(217, 33%, 6%)',
        padding: '120px 24px',
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div 
        className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[150px]"
        style={{ backgroundColor: 'hsla(189, 95%, 43%, 0.05)' }}
      />

      {isEditing && (
        <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
      )}

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <EyebrowBadge 
            icon={<Quote className="w-4 h-4" strokeWidth={1.5} />} 
            text="From the Founder" 
          />
        </motion.div>

        <div className="grid md:grid-cols-[280px_1fr] gap-12 items-start">
          {/* Founder Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <PremiumCard variant="glass" className="text-center">
              {/* Photo / Avatar */}
              <div className="mb-6">
                {content.photo ? (
                  <img
                    src={content.photo}
                    alt={content.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-2 border-white/10"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-white/10 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white/50">{initials}</span>
                  </div>
                )}
              </div>

              {/* Name & Title */}
              <h3 
                className={`text-xl font-bold text-white mb-1 ${
                  isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
                }`}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("name", e)}
              >
                {content.name}
              </h3>
              {content.title && (
                <p className="text-sm text-slate-400 mb-4">{content.title}</p>
              )}

              {/* Credentials */}
              {content.credentials && content.credentials.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {content.credentials.map((cred, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    >
                      <BadgeCheck className="w-3 h-3" />
                      {cred}
                    </span>
                  ))}
                </div>
              )}

              {/* Social Links */}
              {hasSocialLinks && (
                <div className="flex justify-center gap-2">
                  {content.socialLinks?.twitter && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-9 h-9 p-0 text-slate-400 hover:text-white hover:bg-white/5"
                      asChild
                    >
                      <a href={content.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                        <Twitter className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  {content.socialLinks?.linkedin && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-9 h-9 p-0 text-slate-400 hover:text-white hover:bg-white/5"
                      asChild
                    >
                      <a href={content.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  {content.socialLinks?.website && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-9 h-9 p-0 text-slate-400 hover:text-white hover:bg-white/5"
                      asChild
                    >
                      <a href={content.socialLinks.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </PremiumCard>
          </motion.div>

          {/* Story */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="relative">
              <Quote className="absolute -top-2 -left-4 w-10 h-10 text-cyan-500/20" />
              
              <div 
                className={`text-lg md:text-xl text-slate-300 leading-relaxed space-y-4 ${
                  isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
                }`}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("story", e)}
              >
                {storyParagraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Signature */}
            <div className="pt-4 border-t border-white/5">
              <p className="text-slate-500 italic">— {content.name}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
