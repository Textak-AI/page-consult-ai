import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, FileText, ExternalLink } from 'lucide-react';

interface IRContactSectionProps {
  irEmail: string;
  irPhone?: string;
  schedulerLink?: string;
  secFilingsLink?: string;
  pressReleasesLink?: string;
  availableMaterials?: string[];
  styles?: {
    primaryColor?: string;
    headingFont?: string;
    bodyFont?: string;
  };
}

export function IRContactSection({ 
  irEmail, 
  irPhone, 
  schedulerLink, 
  secFilingsLink,
  pressReleasesLink,
  availableMaterials,
  styles 
}: IRContactSectionProps) {
  const materialLabels: Record<string, string> = {
    'investor-deck': 'Investor Deck',
    'financials': 'Financial Statements',
    'white-paper': 'Technical White Paper',
    'one-pager': 'One-Pager Summary',
    'data-room': 'Virtual Data Room',
  };

  return (
    <section className="py-20 px-6 bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: styles?.headingFont }}
          >
            Investor Relations
          </h2>
          <p className="text-slate-400">
            Get in touch with our investor relations team
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            
            <a
              href={`mailto:${irEmail}`}
              className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors"
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${styles?.primaryColor || '#0891b2'}20` }}
              >
                <Mail className="w-5 h-5" style={{ color: styles?.primaryColor || '#0891b2' }} />
              </div>
              <div>
                <div className="text-sm text-slate-400">Email</div>
                <div className="text-white">{irEmail}</div>
              </div>
            </a>
            
            {irPhone && (
              <a
                href={`tel:${irPhone}`}
                className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${styles?.primaryColor || '#0891b2'}20` }}
                >
                  <Phone className="w-5 h-5" style={{ color: styles?.primaryColor || '#0891b2' }} />
                </div>
                <div>
                  <div className="text-sm text-slate-400">Phone</div>
                  <div className="text-white">{irPhone}</div>
                </div>
              </a>
            )}
            
            {schedulerLink && (
              <a
                href={schedulerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button 
                  className="w-full gap-2 text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${styles?.primaryColor || '#0891b2'}, ${styles?.primaryColor || '#0891b2'}cc)` 
                  }}
                >
                  <Calendar className="w-4 h-4" />
                  Schedule a Meeting
                </Button>
              </a>
            )}
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            
            {/* Available Materials */}
            {availableMaterials && availableMaterials.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-3">Request Materials:</div>
                <div className="flex flex-wrap gap-2">
                  {availableMaterials.map((material) => (
                    <span
                      key={material}
                      className="px-3 py-1 rounded-full text-sm border"
                      style={{ 
                        borderColor: `${styles?.primaryColor || '#0891b2'}40`,
                        color: styles?.primaryColor || '#0891b2'
                      }}
                    >
                      {materialLabels[material] || material}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Links */}
            <div className="space-y-2">
              {secFilingsLink && (
                <a
                  href={secFilingsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors p-2"
                >
                  <FileText className="w-4 h-4" />
                  SEC Filings
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              )}
              
              {pressReleasesLink && (
                <a
                  href={pressReleasesLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors p-2"
                >
                  <FileText className="w-4 h-4" />
                  Press Releases
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
