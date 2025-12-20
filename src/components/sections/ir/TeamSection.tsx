import { motion } from 'framer-motion';
import { Linkedin, ExternalLink } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  credentials: string;
  imageUrl?: string;
  linkedIn?: string;
}

interface Advisor {
  name: string;
  affiliation: string;
  relevance: string;
}

interface TeamSectionProps {
  leadership: TeamMember[];
  advisors?: Advisor[];
  combinedExperience?: string;
  styles?: {
    primaryColor?: string;
    headingFont?: string;
    bodyFont?: string;
  };
}

export function TeamSection({ 
  leadership, 
  advisors, 
  combinedExperience,
  styles 
}: TeamSectionProps) {
  return (
    <section className="py-20 px-6 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: styles?.headingFont }}
          >
            Leadership Team
          </h2>
          {combinedExperience && (
            <p 
              className="text-lg"
              style={{ color: styles?.primaryColor || '#0891b2' }}
            >
              {combinedExperience}
            </p>
          )}
        </motion.div>

        {/* Leadership Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {leadership.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center"
            >
              {/* Avatar */}
              <div 
                className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white"
                style={{ 
                  background: `linear-gradient(135deg, ${styles?.primaryColor || '#0891b2'}, ${styles?.primaryColor || '#0891b2'}80)` 
                }}
              >
                {member.imageUrl ? (
                  <img 
                    src={member.imageUrl} 
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  member.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                )}
              </div>
              
              <h3 
                className="text-lg font-semibold text-white mb-1"
                style={{ fontFamily: styles?.headingFont }}
              >
                {member.name}
              </h3>
              <div 
                className="text-sm font-medium mb-3"
                style={{ color: styles?.primaryColor || '#0891b2' }}
              >
                {member.role}
              </div>
              <p className="text-sm text-slate-400 mb-4">{member.credentials}</p>
              
              {member.linkedIn && (
                <a
                  href={member.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
            </motion.div>
          ))}
        </div>

        {/* Advisory Board */}
        {advisors && advisors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 
              className="text-xl font-semibold text-white mb-6 text-center"
              style={{ fontFamily: styles?.headingFont }}
            >
              Advisory Board
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {advisors.map((advisor, index) => (
                <div
                  key={index}
                  className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4"
                >
                  <h4 className="font-medium text-white">{advisor.name}</h4>
                  <div className="text-sm text-cyan-400">{advisor.affiliation}</div>
                  <p className="text-xs text-slate-400 mt-2">{advisor.relevance}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
