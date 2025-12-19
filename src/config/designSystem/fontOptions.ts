// Curated Font Options for PageConsult AI Brand Customization
// These fonts are available via Google Fonts and work well for landing pages

export interface FontOption {
  name: string;
  value: string;
  category: "sans-serif" | "serif" | "display";
  weights: number[];
  description: string;
  bestFor: string[];
}

// Sans-Serif Fonts (Modern, Clean, Professional)
export const sansSerifFonts: FontOption[] = [
  {
    name: "Inter",
    value: "Inter",
    category: "sans-serif",
    weights: [400, 500, 600, 700, 800],
    description: "Clean and highly readable. The modern default.",
    bestFor: ["SaaS", "Technology", "Manufacturing", "Professional Services"],
  },
  {
    name: "Plus Jakarta Sans",
    value: "Plus Jakarta Sans",
    category: "sans-serif",
    weights: [400, 500, 600, 700, 800],
    description: "Refined and contemporary. Slightly warmer than Inter.",
    bestFor: ["Professional Services", "Healthcare", "Education", "Finance"],
  },
  {
    name: "DM Sans",
    value: "DM Sans",
    category: "sans-serif",
    weights: [400, 500, 700],
    description: "Geometric and friendly. Modern startup feel.",
    bestFor: ["SaaS", "Startups", "Creative", "E-commerce"],
  },
  {
    name: "Space Grotesk",
    value: "Space Grotesk",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
    description: "Technical and distinctive. Engineering feel.",
    bestFor: ["Technology", "Manufacturing", "Engineering", "Aerospace"],
  },
  {
    name: "Roboto",
    value: "Roboto",
    category: "sans-serif",
    weights: [400, 500, 700, 900],
    description: "Google's workhorse. Neutral and versatile.",
    bestFor: ["Technology", "Manufacturing", "Healthcare", "Any"],
  },
  {
    name: "Open Sans",
    value: "Open Sans",
    category: "sans-serif",
    weights: [400, 500, 600, 700, 800],
    description: "Friendly and open. Excellent readability.",
    bestFor: ["Healthcare", "Education", "Non-profit", "Government"],
  },
  {
    name: "Lato",
    value: "Lato",
    category: "sans-serif",
    weights: [400, 700, 900],
    description: "Warm and stable. Professional but approachable.",
    bestFor: ["Professional Services", "Real Estate", "Finance", "Legal"],
  },
  {
    name: "Poppins",
    value: "Poppins",
    category: "sans-serif",
    weights: [400, 500, 600, 700, 800],
    description: "Geometric and modern. Friendly tech feel.",
    bestFor: ["SaaS", "E-commerce", "Education", "Fitness"],
  },
  {
    name: "Montserrat",
    value: "Montserrat",
    category: "sans-serif",
    weights: [400, 500, 600, 700, 800, 900],
    description: "Urban and bold. Great for headlines.",
    bestFor: ["Creative", "Fashion", "Entertainment", "Fitness"],
  },
  {
    name: "Manrope",
    value: "Manrope",
    category: "sans-serif",
    weights: [400, 500, 600, 700, 800],
    description: "Modern and semi-rounded. Startup favorite.",
    bestFor: ["SaaS", "Technology", "Fintech", "Startups"],
  },
  {
    name: "IBM Plex Sans",
    value: "IBM Plex Sans",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
    description: "Corporate and precise. Engineering credibility.",
    bestFor: ["Technology", "Enterprise", "Manufacturing", "B2B"],
  },
];

// Serif Fonts (Traditional, Elegant, Trustworthy)
export const serifFonts: FontOption[] = [
  {
    name: "Playfair Display",
    value: "Playfair Display",
    category: "serif",
    weights: [400, 500, 600, 700, 800, 900],
    description: "Elegant and sophisticated. Premium feel.",
    bestFor: ["Real Estate", "Luxury", "Legal", "Finance", "Events"],
  },
  {
    name: "Merriweather",
    value: "Merriweather",
    category: "serif",
    weights: [400, 700, 900],
    description: "Traditional and highly readable. Trustworthy.",
    bestFor: ["Legal", "Finance", "Education", "Publishing"],
  },
  {
    name: "Lora",
    value: "Lora",
    category: "serif",
    weights: [400, 500, 600, 700],
    description: "Contemporary serif. Warm and balanced.",
    bestFor: ["Healthcare", "Education", "Non-profit", "Coaching"],
  },
  {
    name: "Source Serif Pro",
    value: "Source Serif Pro",
    category: "serif",
    weights: [400, 600, 700, 900],
    description: "Adobe's editorial serif. Professional credibility.",
    bestFor: ["Publishing", "Legal", "Consulting", "Finance"],
  },
  {
    name: "Libre Baskerville",
    value: "Libre Baskerville",
    category: "serif",
    weights: [400, 700],
    description: "Classic and timeless. Traditional authority.",
    bestFor: ["Legal", "Finance", "Government", "Academia"],
  },
];

// Display Fonts (Headlines, Impact, Personality)
export const displayFonts: FontOption[] = [
  {
    name: "Oswald",
    value: "Oswald",
    category: "display",
    weights: [400, 500, 600, 700],
    description: "Bold and condensed. High impact headlines.",
    bestFor: ["Fitness", "Sports", "Entertainment", "Events"],
  },
  {
    name: "Bebas Neue",
    value: "Bebas Neue",
    category: "display",
    weights: [400],
    description: "All-caps display. Maximum impact.",
    bestFor: ["Fitness", "Sports", "Entertainment", "Bold brands"],
  },
  {
    name: "Archivo Black",
    value: "Archivo Black",
    category: "display",
    weights: [400],
    description: "Heavy and impactful. Statement headlines.",
    bestFor: ["Creative", "Entertainment", "Bold brands"],
  },
  {
    name: "Raleway",
    value: "Raleway",
    category: "display",
    weights: [400, 500, 600, 700, 800, 900],
    description: "Elegant and thin. Sophisticated display.",
    bestFor: ["Fashion", "Luxury", "Creative", "Events"],
  },
];

// All fonts combined
export const allFonts: FontOption[] = [...sansSerifFonts, ...serifFonts, ...displayFonts];

// Get recommended fonts for an industry
export function getRecommendedFonts(industry: string): FontOption[] {
  const industryLower = industry.toLowerCase();

  return allFonts.filter((font) =>
    font.bestFor.some((use) => industryLower.includes(use.toLowerCase()) || use.toLowerCase().includes(industryLower)),
  );
}

// Get font by name
export function getFontByName(name: string): FontOption | undefined {
  return allFonts.find((f) => f.value === name || f.name === name);
}

// Generate Google Fonts import URL
export function getGoogleFontsUrl(fonts: string[]): string {
  const fontParams = fonts
    .map((fontName) => {
      const font = getFontByName(fontName);
      if (!font) return null;

      const weights = font.weights.join(";");
      const encodedName = font.value.replace(/ /g, "+");
      return `family=${encodedName}:wght@${weights}`;
    })
    .filter(Boolean);

  if (fontParams.length === 0) return "";

  return `https://fonts.googleapis.com/css2?${fontParams.join("&")}&display=swap`;
}

// Default font pairings by industry
export const industryFontPairings: Record<string, { heading: string; body: string }> = {
  "manufacturing-industrial": { heading: "Inter", body: "Inter" },
  "professional-services": { heading: "Plus Jakarta Sans", body: "Inter" },
  "healthcare-medical": { heading: "Plus Jakarta Sans", body: "Open Sans" },
  "saas-software": { heading: "Inter", body: "Inter" },
  "real-estate": { heading: "Playfair Display", body: "Lato" },
  "legal-services": { heading: "Merriweather", body: "Source Serif Pro" },
  "financial-services": { heading: "Plus Jakarta Sans", body: "Inter" },
  "fitness-wellness": { heading: "Oswald", body: "Open Sans" },
  "education-coaching": { heading: "Poppins", body: "Open Sans" },
  "agency-creative": { heading: "Space Grotesk", body: "DM Sans" },
  "ecommerce-retail": { heading: "Poppins", body: "Inter" },
  "events-entertainment": { heading: "Montserrat", body: "Open Sans" },
  "food-beverage": { heading: "Playfair Display", body: "Lato" },
  default: { heading: "Inter", body: "Inter" },
};

// Get default pairing for industry
export function getDefaultFontPairing(industry: string): { heading: string; body: string } {
  const normalized = industry.toLowerCase().replace(/[^a-z]/g, "-");
  return industryFontPairings[normalized] || industryFontPairings.default;
} // Font options will be added here
