/**
 * Credentials Bar Section (Stub)
 * 
 * Displays professional credentials, certifications, and trust badges
 * in a horizontal bar format.
 * 
 * TODO: Implement full version with:
 * - Credential icons/logos
 * - Certification badges
 * - Professional designations (MBA, CPA, etc.)
 * - Years of experience
 */

import { Award, BadgeCheck, Shield } from 'lucide-react';

interface CredentialsBarSectionProps {
  content: {
    credentials?: Array<{
      value: string;
      label: string;
      icon?: string;
    }>;
    industryVariant?: string;
    mode?: string;
  };
}

export function CredentialsBarSection({ content }: CredentialsBarSectionProps) {
  const { credentials = [], mode = 'light' } = content;
  const isLightMode = mode === 'light' || mode === 'warm';

  // Default credentials if none provided
  const displayCredentials = credentials.length > 0 ? credentials : [
    { value: '20+', label: 'Years Experience', icon: 'award' },
    { value: 'Certified', label: 'Industry Expert', icon: 'badge' },
    { value: 'Trusted', label: 'By Fortune 500', icon: 'shield' },
  ];

  return (
    <section className={`py-6 border-y ${
      isLightMode 
        ? 'bg-slate-50 border-slate-200' 
        : 'bg-white/5 border-white/10'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {displayCredentials.slice(0, 4).map((cred, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isLightMode ? 'bg-slate-200/50' : 'bg-white/10'
              }`}>
                {cred.icon === 'badge' ? (
                  <BadgeCheck className={`w-5 h-5 ${isLightMode ? 'text-slate-700' : 'text-white/80'}`} />
                ) : cred.icon === 'shield' ? (
                  <Shield className={`w-5 h-5 ${isLightMode ? 'text-slate-700' : 'text-white/80'}`} />
                ) : (
                  <Award className={`w-5 h-5 ${isLightMode ? 'text-slate-700' : 'text-white/80'}`} />
                )}
              </div>
              <div>
                <div className={`font-bold text-xl md:text-2xl ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                  {cred.value}
                </div>
                <div className={`text-sm md:text-base ${isLightMode ? 'text-slate-600' : 'text-white/60'}`}>
                  {cred.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CredentialsBarSection;
