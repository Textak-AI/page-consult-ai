import { premiumStyles } from './premium';
import { minimalStyles } from './minimal';
import { boldStyles } from './bold';
import { elegantStyles } from './elegant';

export type StylePresetName = 'premium' | 'minimal' | 'bold' | 'elegant';

export interface StylePreset {
  // Typography
  headline: string;
  subheadline: string;
  sectionTitle: string;
  sectionSubtitle: string;
  bodyText: string;
  
  // Spacing
  sectionPadding: string;
  containerWidth: string;
  
  // Cards
  card: string;
  cardIcon: string;
  cardTitle: string;
  cardDescription: string;
  
  // Buttons
  primaryButton: string;
  secondaryButton: string;
  
  // Backgrounds
  heroGradient: string;
  sectionLight: string;
  sectionDark: string;
  sectionAlt: string;
  
  // Effects
  glowEffect: string;
  glassmorphism: string;
  
  // Colors
  accentPrimary: string;
  accentSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Testimonial
  testimonialCard: string;
  testimonialQuote: string;
  
  // Stats
  statValue: string;
  statLabel: string;
  statCard: string;
}

export const stylePresets: Record<StylePresetName, StylePreset> = {
  premium: premiumStyles,
  minimal: minimalStyles,
  bold: boldStyles,
  elegant: elegantStyles,
};

export const stylePresetInfo: Record<StylePresetName, { name: string; description: string }> = {
  premium: {
    name: 'Premium',
    description: 'Sophisticated dark theme with cyan gradients and glassmorphism',
  },
  minimal: {
    name: 'Minimal',
    description: 'Clean, simple design with subtle borders and muted colors',
  },
  bold: {
    name: 'Bold',
    description: 'High contrast black and yellow with strong typography',
  },
  elegant: {
    name: 'Elegant',
    description: 'Refined serif fonts with warm amber accents',
  },
};

export { premiumStyles, minimalStyles, boldStyles, elegantStyles };
