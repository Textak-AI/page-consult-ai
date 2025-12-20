import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Linkedin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
}

export const FounderCredibilitySection: React.FC<Props> = ({ content }) => {
  // Generate initials for fallback avatar
  const initials = content.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const hasSocialLinks = content.socialLinks && 
    (content.socialLinks.twitter || content.socialLinks.linkedin || content.socialLinks.website);

  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Photo or initials */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            {content.photo ? (
              <img
                src={content.photo}
                alt={content.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto object-cover border-4 border-slate-700"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center border-4 border-slate-700">
                <span className="text-2xl md:text-3xl font-bold text-white">
                  {initials}
                </span>
              </div>
            )}
          </motion.div>

          {/* Name and title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h3 className="text-2xl font-bold text-white mb-1">
              {content.name}
            </h3>
            {content.title && (
              <p className="text-slate-400">{content.title}</p>
            )}
          </motion.div>

          {/* Credentials */}
          {content.credentials && content.credentials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-2 mb-8"
            >
              {content.credentials.map((credential, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sm text-slate-300"
                >
                  {credential}
                </span>
              ))}
            </motion.div>
          )}

          {/* Story */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
              {content.story}
            </p>
          </motion.div>

          {/* Social links */}
          {hasSocialLinks && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-3"
            >
              {content.socialLinks?.twitter && (
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="bg-slate-800/50 border-slate-700 hover:border-cyan-500 hover:bg-slate-700"
                >
                  <a 
                    href={content.socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-4 h-4 text-slate-300" />
                  </a>
                </Button>
              )}
              {content.socialLinks?.linkedin && (
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="bg-slate-800/50 border-slate-700 hover:border-cyan-500 hover:bg-slate-700"
                >
                  <a 
                    href={content.socialLinks.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 text-slate-300" />
                  </a>
                </Button>
              )}
              {content.socialLinks?.website && (
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="bg-slate-800/50 border-slate-700 hover:border-cyan-500 hover:bg-slate-700"
                >
                  <a 
                    href={content.socialLinks.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="Website"
                  >
                    <Globe className="w-4 h-4 text-slate-300" />
                  </a>
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
