/**
 * Credentials Bar Section
 * 
 * Displays professional credentials using SDI dynamic design system.
 */

import { Award, BadgeCheck, Shield } from 'lucide-react';
import type { SDIPalette, SDISectionThemes, SDITypography } from '@/lib/designIntelligence/types';

interface CredentialsBarSectionProps {
  content: {
    credentials?: Array<{
      value: string;
      label: string;
      icon?: string;
    }>;
    industryVariant?: string;
    mode?: string;
    // SDI Design System
    primaryColor?: string;
    palette?: SDIPalette;
    sectionThemes?: SDISectionThemes;
    sdiTypography?: SDITypography;
  };
}

export function CredentialsBarSection({ content }: CredentialsBarSectionProps) {
  const { credentials = [] } = content;
  
  // SDI Design System
  const theme = content.sectionThemes?.['credentials-bar'] || 'light';
  const palette = content.palette;

  // Helper functions for SDI-driven styling
  const getSectionStyles = (): React.CSSProperties => {
    if (!palette) {
      return { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff' };
    }
    // Credentials bar is typically subtle - use light section or slight tint
    return { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : palette.lightSection };
  };

  const getBorderStyles = () => {
    return theme === 'dark' ? 'border-white/10' : 'border-slate-100';
  };

  const getIconBgStyles = () => {
    if (theme === 'dark') {
      return 'bg-white/10';
    }
    return 'bg-slate-50';
  };

  const getIconColorStyles = (): React.CSSProperties => {
    if (theme === 'dark') {
      return { color: 'rgba(255,255,255,0.6)' };
    }
    if (palette) {
      return { color: palette.iconColor };
    }
    return { color: '#94a3b8' };
  };

  const getValueColorClass = () => {
    return theme === 'dark' ? 'text-white' : 'text-slate-900';
  };

  const getLabelColorClass = () => {
    return theme === 'dark' ? 'text-white/60' : 'text-slate-600';
  };

  // Default credentials if none provided
  const displayCredentials = credentials.length > 0 ? credentials : [
    { value: '20+', label: 'Years Experience', icon: 'award' },
    { value: 'Certified', label: 'Industry Expert', icon: 'badge' },
    { value: 'Trusted', label: 'By Fortune 500', icon: 'shield' },
  ];

  const renderIcon = (iconType: string | undefined) => {
    const iconStyle = getIconColorStyles();
    switch (iconType) {
      case 'badge':
        return <BadgeCheck className="w-5 h-5" style={iconStyle} />;
      case 'shield':
        return <Shield className="w-5 h-5" style={iconStyle} />;
      default:
        return <Award className="w-5 h-5" style={iconStyle} />;
    }
  };

  return (
    <section 
      className={`py-8 border-t ${getBorderStyles()}`}
      style={getSectionStyles()}
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {displayCredentials.slice(0, 4).map((cred, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getIconBgStyles()}`}>
                {renderIcon(cred.icon)}
              </div>
              <div>
                <div className={`font-bold text-xl md:text-2xl ${getValueColorClass()}`}>
                  {cred.value}
                </div>
                <div className={`text-sm md:text-base ${getLabelColorClass()}`}>
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
