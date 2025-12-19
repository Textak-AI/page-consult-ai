// Industry Design Baselines for PageConsult AI
// Each industry has a visual language that resonates with its audience

import { DesignSystem, IndustryType } from "./types";

/**
 * Manufacturing & Industrial
 *
 * Audience: Plant managers, VPs of Operations, engineers
 * Vibe: Trustworthy, stable, technical, no-nonsense
 * Visual language: Clean lines, high contrast, professional photography
 */
const manufacturingIndustrial: DesignSystem = {
  id: "manufacturing-industrial",
  name: "Manufacturing & Industrial",
  description:
    "Technical precision meets corporate trust. Clean, high-contrast design that conveys stability and expertise.",

  colors: {
    // Deep navy as primary - trust, stability, expertise
    primary: "#1E3A5F",
    primaryHover: "#162D4A",
    primaryMuted: "#1E3A5F15",

    // Safety/action orange - visibility, energy, action
    secondary: "#E85D04",
    secondaryHover: "#D54D00",
    secondaryMuted: "#E85D0415",

    // Dark backgrounds - premium, focused
    background: "#0F172A",
    backgroundAlt: "#1E293B",
    surface: "#1E293B",
    surfaceHover: "#334155",

    // High contrast text
    textPrimary: "#F1F5F9",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    textInverse: "#0F172A",

    // Semantic
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",

    // Borders
    border: "#334155",
    borderStrong: "#475569",
  },

  typography: {
    headingFont: '"Inter", system-ui, sans-serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    headingWeight: 700,
    bodyWeight: 400,
    baseSize: "16px",
    headingLineHeight: 1.2,
    bodyLineHeight: 1.6,
    headingLetterSpacing: "-0.02em",
    bodyLetterSpacing: "normal",
    style: "technical",
  },

  spacing: {
    sectionPaddingY: "96px",
    sectionPaddingX: "24px",
    containerMaxWidth: "1200px",
    cardPadding: "32px",
    cardGap: "24px",
    elementGap: "16px",
    stackGap: "24px",
    density: "spacious",
  },

  components: {
    radiusSmall: "6px",
    radiusMedium: "12px",
    radiusLarge: "16px",
    radiusFull: "9999px",
    shadowSmall: "0 1px 2px rgba(0, 0, 0, 0.1)",
    shadowMedium: "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)",
    shadowLarge: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)",
    borderWidth: "1px",
    iconStyle: "outline",
    iconStrokeWidth: 1.5,
    buttonStyle: "solid",
    cardStyle: "bordered",
  },

  imagery: {
    style: "photography",
    overlayOpacity: 0.7,
    overlayColor: "#0F172A",
    overlayGradient: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)",
    treatment: "professional",
  },
};

/**
 * Professional Services (Consulting, B2B)
 *
 * Audience: Executives, decision-makers, business owners
 * Vibe: Polished, credible, results-oriented
 * Visual language: Clean, refined, subtle sophistication
 */
const professionalServices: DesignSystem = {
  id: "professional-services",
  name: "Professional Services",
  description: "Refined credibility and quiet confidence. Design that lets expertise speak for itself.",

  colors: {
    primary: "#1E40AF", // Corporate blue - trust
    primaryHover: "#1E3A8A",
    primaryMuted: "#1E40AF12",

    secondary: "#10B981", // Growth green - results
    secondaryHover: "#059669",
    secondaryMuted: "#10B98112",

    // Light, clean backgrounds
    background: "#FFFFFF",
    backgroundAlt: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceHover: "#F1F5F9",

    textPrimary: "#1E293B",
    textSecondary: "#475569",
    textMuted: "#94A3B8",
    textInverse: "#FFFFFF",

    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",

    border: "#E2E8F0",
    borderStrong: "#CBD5E1",
  },

  typography: {
    headingFont: '"Plus Jakarta Sans", system-ui, sans-serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    headingWeight: 600,
    bodyWeight: 400,
    baseSize: "16px",
    headingLineHeight: 1.25,
    bodyLineHeight: 1.7,
    headingLetterSpacing: "-0.01em",
    bodyLetterSpacing: "normal",
    style: "refined",
  },

  spacing: {
    sectionPaddingY: "80px",
    sectionPaddingX: "24px",
    containerMaxWidth: "1140px",
    cardPadding: "28px",
    cardGap: "20px",
    elementGap: "14px",
    stackGap: "20px",
    density: "comfortable",
  },

  components: {
    radiusSmall: "8px",
    radiusMedium: "12px",
    radiusLarge: "20px",
    radiusFull: "9999px",
    shadowSmall: "0 1px 3px rgba(0, 0, 0, 0.05)",
    shadowMedium: "0 4px 12px rgba(0, 0, 0, 0.08)",
    shadowLarge: "0 12px 24px rgba(0, 0, 0, 0.1)",
    borderWidth: "1px",
    iconStyle: "outline",
    iconStrokeWidth: 1.5,
    buttonStyle: "solid",
    cardStyle: "elevated",
  },

  imagery: {
    style: "abstract",
    overlayOpacity: 0.5,
    overlayColor: "#FFFFFF",
    treatment: "clean",
  },
};

/**
 * SaaS / Software
 *
 * Audience: Technical buyers, product managers, developers
 * Vibe: Modern, innovative, efficient
 * Visual language: Bold gradients, clean UI, product-focused
 */
const saasSoftware: DesignSystem = {
  id: "saas-software",
  name: "SaaS & Software",
  description: "Modern and innovative. Design that feels like the product itself - clean, efficient, forward-thinking.",

  colors: {
    primary: "#6366F1", // Indigo - innovation
    primaryHover: "#4F46E5",
    primaryMuted: "#6366F115",

    secondary: "#06B6D4", // Cyan - tech, efficiency
    secondaryHover: "#0891B2",
    secondaryMuted: "#06B6D415",

    // Dark mode default (SaaS standard)
    background: "#0F0F1A",
    backgroundAlt: "#1A1A2E",
    surface: "#1A1A2E",
    surfaceHover: "#252542",

    textPrimary: "#F8FAFC",
    textSecondary: "#A1A1AA",
    textMuted: "#71717A",
    textInverse: "#0F0F1A",

    success: "#22C55E",
    warning: "#EAB308",
    error: "#EF4444",
    info: "#3B82F6",

    border: "#27273F",
    borderStrong: "#3F3F5C",
  },

  typography: {
    headingFont: '"Inter", system-ui, sans-serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    headingWeight: 600,
    bodyWeight: 400,
    baseSize: "16px",
    headingLineHeight: 1.2,
    bodyLineHeight: 1.6,
    headingLetterSpacing: "-0.02em",
    bodyLetterSpacing: "normal",
    style: "bold",
  },

  spacing: {
    sectionPaddingY: "80px",
    sectionPaddingX: "24px",
    containerMaxWidth: "1280px",
    cardPadding: "24px",
    cardGap: "16px",
    elementGap: "12px",
    stackGap: "16px",
    density: "comfortable",
  },

  components: {
    radiusSmall: "8px",
    radiusMedium: "16px",
    radiusLarge: "24px",
    radiusFull: "9999px",
    shadowSmall: "0 2px 4px rgba(0, 0, 0, 0.2)",
    shadowMedium: "0 8px 16px rgba(0, 0, 0, 0.25)",
    shadowLarge: "0 16px 32px rgba(0, 0, 0, 0.3)",
    borderWidth: "1px",
    iconStyle: "outline",
    iconStrokeWidth: 1.5,
    buttonStyle: "gradient",
    cardStyle: "glass",
  },

  imagery: {
    style: "geometric",
    overlayOpacity: 0.6,
    overlayColor: "#0F0F1A",
    overlayGradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)",
    treatment: "vibrant",
  },
};

/**
 * Healthcare / Medical
 *
 * Audience: Patients, practitioners, healthcare admins
 * Vibe: Calming, trustworthy, clean, compassionate
 * Visual language: Soft colors, plenty of white space, approachable
 */
const healthcareMedical: DesignSystem = {
  id: "healthcare-medical",
  name: "Healthcare & Medical",
  description: "Calming trust and professional care. Design that puts patients at ease while conveying expertise.",

  colors: {
    primary: "#0891B2", // Calming teal
    primaryHover: "#0E7490",
    primaryMuted: "#0891B212",

    secondary: "#6366F1", // Trust purple
    secondaryHover: "#4F46E5",
    secondaryMuted: "#6366F112",

    // Light, clean, clinical
    background: "#FFFFFF",
    backgroundAlt: "#F0FDFA",
    surface: "#FFFFFF",
    surfaceHover: "#F0FDFA",

    textPrimary: "#134E4A",
    textSecondary: "#5EEAD4",
    textMuted: "#99F6E4",
    textInverse: "#FFFFFF",

    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#0891B2",

    border: "#CCFBF1",
    borderStrong: "#99F6E4",
  },

  typography: {
    headingFont: '"Plus Jakarta Sans", system-ui, sans-serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    headingWeight: 600,
    bodyWeight: 400,
    baseSize: "17px",
    headingLineHeight: 1.3,
    bodyLineHeight: 1.7,
    headingLetterSpacing: "-0.01em",
    bodyLetterSpacing: "normal",
    style: "friendly",
  },

  spacing: {
    sectionPaddingY: "88px",
    sectionPaddingX: "24px",
    containerMaxWidth: "1120px",
    cardPadding: "32px",
    cardGap: "24px",
    elementGap: "16px",
    stackGap: "24px",
    density: "spacious",
  },

  components: {
    radiusSmall: "12px",
    radiusMedium: "16px",
    radiusLarge: "24px",
    radiusFull: "9999px",
    shadowSmall: "0 1px 3px rgba(0, 0, 0, 0.04)",
    shadowMedium: "0 4px 12px rgba(0, 0, 0, 0.06)",
    shadowLarge: "0 8px 24px rgba(0, 0, 0, 0.08)",
    borderWidth: "1px",
    iconStyle: "outline",
    iconStrokeWidth: 1.5,
    buttonStyle: "solid",
    cardStyle: "elevated",
  },

  imagery: {
    style: "photography",
    overlayOpacity: 0.3,
    overlayColor: "#FFFFFF",
    treatment: "clean",
  },
};

/**
 * Real Estate
 *
 * Audience: Home buyers, sellers, investors, property managers
 * Vibe: Aspirational, trustworthy, local expertise
 * Visual language: Photography-driven, warm, premium feel
 */
const realEstate: DesignSystem = {
  id: "real-estate",
  name: "Real Estate",
  description: "Aspirational and trustworthy. Design that showcases properties while building agent credibility.",

  colors: {
    primary: "#1F2937", // Sophisticated dark gray
    primaryHover: "#111827",
    primaryMuted: "#1F293712",

    secondary: "#D97706", // Warm amber - action
    secondaryHover: "#B45309",
    secondaryMuted: "#D9770612",

    // Light, warm backgrounds
    background: "#FFFBF5",
    backgroundAlt: "#FEF3E2",
    surface: "#FFFFFF",
    surfaceHover: "#FFFBF5",

    textPrimary: "#1F2937",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    textInverse: "#FFFFFF",

    success: "#059669",
    warning: "#D97706",
    error: "#DC2626",
    info: "#2563EB",

    border: "#E5E7EB",
    borderStrong: "#D1D5DB",
  },

  typography: {
    headingFont: '"Playfair Display", Georgia, serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    headingWeight: 600,
    bodyWeight: 400,
    baseSize: "16px",
    headingLineHeight: 1.2,
    bodyLineHeight: 1.7,
    headingLetterSpacing: "-0.01em",
    bodyLetterSpacing: "normal",
    style: "elegant",
  },

  spacing: {
    sectionPaddingY: "96px",
    sectionPaddingX: "24px",
    containerMaxWidth: "1280px",
    cardPadding: "0px", // Edge-to-edge images
    cardGap: "24px",
    elementGap: "16px",
    stackGap: "20px",
    density: "spacious",
  },

  components: {
    radiusSmall: "4px",
    radiusMedium: "8px",
    radiusLarge: "12px",
    radiusFull: "9999px",
    shadowSmall: "0 1px 2px rgba(0, 0, 0, 0.05)",
    shadowMedium: "0 4px 12px rgba(0, 0, 0, 0.1)",
    shadowLarge: "0 12px 32px rgba(0, 0, 0, 0.15)",
    borderWidth: "1px",
    iconStyle: "outline",
    iconStrokeWidth: 1.5,
    buttonStyle: "solid",
    cardStyle: "elevated",
  },

  imagery: {
    style: "photography",
    overlayOpacity: 0.4,
    overlayColor: "#1F2937",
    treatment: "vibrant",
  },
};

/**
 * Fitness & Wellness
 *
 * Audience: Health-conscious individuals, gym-goers, wellness seekers
 * Vibe: Energetic, motivating, aspirational, approachable
 * Visual language: Bold colors, dynamic imagery, strong typography
 */
const fitnessWellness: DesignSystem = {
  id: "fitness-wellness",
  name: "Fitness & Wellness",
  description: "Energetic and motivating. Design that inspires action and transformation.",

  colors: {
    primary: "#DC2626", // Energetic red
    primaryHover: "#B91C1C",
    primaryMuted: "#DC262615",

    secondary: "#16A34A", // Healthy green
    secondaryHover: "#15803D",
    secondaryMuted: "#16A34A15",

    // Dark, bold backgrounds
    background: "#0A0A0A",
    backgroundAlt: "#171717",
    surface: "#171717",
    surfaceHover: "#262626",

    textPrimary: "#FFFFFF",
    textSecondary: "#A3A3A3",
    textMuted: "#737373",
    textInverse: "#0A0A0A",

    success: "#22C55E",
    warning: "#EAB308",
    error: "#EF4444",
    info: "#3B82F6",

    border: "#262626",
    borderStrong: "#404040",
  },

  typography: {
    headingFont: '"Oswald", system-ui, sans-serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    headingWeight: 700,
    bodyWeight: 400,
    baseSize: "16px",
    headingLineHeight: 1.1,
    bodyLineHeight: 1.6,
    headingLetterSpacing: "0.02em",
    bodyLetterSpacing: "normal",
    style: "bold",
  },

  spacing: {
    sectionPaddingY: "72px",
    sectionPaddingX: "20px",
    containerMaxWidth: "1200px",
    cardPadding: "24px",
    cardGap: "16px",
    elementGap: "12px",
    stackGap: "16px",
    density: "compact",
  },

  components: {
    radiusSmall: "4px",
    radiusMedium: "8px",
    radiusLarge: "12px",
    radiusFull: "9999px",
    shadowSmall: "0 2px 4px rgba(0, 0, 0, 0.3)",
    shadowMedium: "0 4px 12px rgba(0, 0, 0, 0.4)",
    shadowLarge: "0 8px 24px rgba(0, 0, 0, 0.5)",
    borderWidth: "2px",
    iconStyle: "solid",
    iconStrokeWidth: 2,
    buttonStyle: "solid",
    cardStyle: "flat",
  },

  imagery: {
    style: "photography",
    overlayOpacity: 0.5,
    overlayColor: "#0A0A0A",
    overlayGradient: "linear-gradient(180deg, rgba(10, 10, 10, 0.3) 0%, rgba(10, 10, 10, 0.9) 100%)",
    treatment: "vibrant",
  },
};

/**
 * Default / Fallback
 *
 * Used when no specific industry is selected
 * Neutral, professional, works for most cases
 */
const defaultBaseline: DesignSystem = {
  id: "default",
  name: "Default",
  description: "A balanced, professional design system that works across industries.",

  colors: {
    primary: "#3B82F6",
    primaryHover: "#2563EB",
    primaryMuted: "#3B82F615",

    secondary: "#8B5CF6",
    secondaryHover: "#7C3AED",
    secondaryMuted: "#8B5CF615",

    background: "#0F172A",
    backgroundAlt: "#1E293B",
    surface: "#1E293B",
    surfaceHover: "#334155",

    textPrimary: "#F1F5F9",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    textInverse: "#0F172A",

    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",

    border: "#334155",
    borderStrong: "#475569",
  },

  typography: {
    headingFont: '"Inter", system-ui, sans-serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    headingWeight: 600,
    bodyWeight: 400,
    baseSize: "16px",
    headingLineHeight: 1.25,
    bodyLineHeight: 1.6,
    headingLetterSpacing: "-0.01em",
    bodyLetterSpacing: "normal",
    style: "refined",
  },

  spacing: {
    sectionPaddingY: "80px",
    sectionPaddingX: "24px",
    containerMaxWidth: "1200px",
    cardPadding: "24px",
    cardGap: "20px",
    elementGap: "16px",
    stackGap: "20px",
    density: "comfortable",
  },

  components: {
    radiusSmall: "8px",
    radiusMedium: "12px",
    radiusLarge: "20px",
    radiusFull: "9999px",
    shadowSmall: "0 1px 3px rgba(0, 0, 0, 0.1)",
    shadowMedium: "0 4px 6px rgba(0, 0, 0, 0.15)",
    shadowLarge: "0 10px 15px rgba(0, 0, 0, 0.2)",
    borderWidth: "1px",
    iconStyle: "outline",
    iconStrokeWidth: 1.5,
    buttonStyle: "solid",
    cardStyle: "bordered",
  },

  imagery: {
    style: "abstract",
    overlayOpacity: 0.6,
    overlayColor: "#0F172A",
    treatment: "professional",
  },
};

// Export all baselines as a map
export const industryBaselines: Record<IndustryType, DesignSystem> = {
  "manufacturing-industrial": manufacturingIndustrial,
  "professional-services": professionalServices,
  "healthcare-medical": healthcareMedical,
  "saas-software": saasSoftware,
  "real-estate": realEstate,
  "fitness-wellness": fitnessWellness,
  "legal-services": professionalServices, // Uses professional services as base
  "financial-services": professionalServices, // Uses professional services as base
  "ecommerce-retail": saasSoftware, // Uses SaaS as base (modern, bold)
  "food-beverage": fitnessWellness, // Uses fitness as base (energetic)
  "education-coaching": healthcareMedical, // Uses healthcare as base (approachable)
  "agency-creative": saasSoftware, // Uses SaaS as base (modern)
  "events-entertainment": fitnessWellness, // Uses fitness as base (dynamic)
  default: defaultBaseline,
};

// Helper to get baseline by industry
export function getIndustryBaseline(industry: IndustryType | string): DesignSystem {
  // Normalize the industry string
  const normalized = industry.toLowerCase().replace(/[^a-z]/g, "-") as IndustryType;

  // Check for exact match
  if (industryBaselines[normalized]) {
    return industryBaselines[normalized];
  }

  // Check for partial matches
  for (const [key, baseline] of Object.entries(industryBaselines)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return baseline;
    }
  }

  // Return default
  return industryBaselines.default;
}
