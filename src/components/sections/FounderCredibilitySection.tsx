import { motion } from 'framer-motion';
import { Twitter, Linkedin, Globe, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  website?: string;
}

interface FounderCredibilityContent {
  name: string;
  photo?: string;
  title?: string;
  story: string;
  credentials?: string[];
  socialLinks?: SocialLinks;
}

interface Props {
  content: FounderCredibilityContent;
  styles?: {
    primaryColor?: string;
    headingFont?: string;
    bodyFont?: string;
  };
}

export function FounderCredibilitySection({ content, styles }: Props) {
  const primaryColor = styles?.primaryColor || '#06b6d4';

  // Split story into paragraphs
  const paragraphs = content.story.split('\n\n').filter(Boolean);

  const socialButtons = [
    { key: 'twitter', icon: Twitter, url: content.socialLinks?.twitter, label: 'Twitter' },
    { key: 'linkedin', icon: Linkedin, url: content.socialLinks?.linkedin, label: 'LinkedIn' },
    { key: 'website', icon: Globe, url: content.socialLinks?.website, label: 'Website' },
  ].filter(s => s.url);

  return (
    <section className="py-20 bg-slate-900">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Photo Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center md:items-start shrink-0"
          >
            {/* Photo */}
            <div 
              className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4"
              style={{ borderColor: primaryColor }}
            >
              {content.photo ? (
                <img
                  src={content.photo}
                  alt={content.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <User className="w-16 h-16 text-slate-400" />
                </div>
              )}

              {/* Decorative ring */}
              <div 
                className="absolute inset-0 rounded-full border-2 border-dashed opacity-30"
                style={{ borderColor: primaryColor, transform: 'scale(1.15)' }}
              />
            </div>

            {/* Name & Title */}
            <div className="text-center md:text-left mt-6">
              <h3 
                className="text-xl font-bold text-white"
                style={{ fontFamily: styles?.headingFont }}
              >
                {content.name}
              </h3>
              {content.title && (
                <p className="text-slate-400 mt-1">{content.title}</p>
              )}
            </div>

            {/* Social Links */}
            {socialButtons.length > 0 && (
              <div className="flex gap-2 mt-4">
                {socialButtons.map(({ key, icon: Icon, url, label }) => (
                  <Button
                    key={key}
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label}>
                      <Icon className="w-5 h-5" />
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Story Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex-1"
          >
            {/* Quote mark */}
            <div 
              className="text-6xl font-serif leading-none mb-4"
              style={{ color: primaryColor, opacity: 0.3 }}
            >
              &ldquo;
            </div>

            {/* Story paragraphs */}
            <div 
              className="space-y-4 text-slate-300 leading-relaxed"
              style={{ fontFamily: styles?.bodyFont }}
            >
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Credentials */}
            {content.credentials && content.credentials.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {content.credentials.map((credential, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="px-3 py-1.5 rounded-full text-sm font-medium border"
                    style={{ 
                      borderColor: `${primaryColor}40`,
                      backgroundColor: `${primaryColor}10`,
                      color: primaryColor
                    }}
                  >
                    {credential}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
