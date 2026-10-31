// What the wizard's brief sidebar shows for brand. Colors the owner set in the
// Brand step (ConsultationData.brandSettings) count as a configured brand, not
// only a saved brand_briefs row; otherwise the sidebar said "No brand
// configured" right after the owner picked colors.

export interface BrandSummaryColor { key: string; hex: string }

export interface BrandSummary {
  source: 'wizard' | 'saved';
  logoUrl: string | null;
  websiteUrl: string | null;
  colors: BrandSummaryColor[];
  voice: string[];
}

interface SavedBrandLike {
  logo_url?: string | null;
  website_url?: string | null;
  colors?: Record<string, { hex?: string | null } | null | undefined> | null;
  voice_tone?: { personality?: string[] | null } | null;
}

interface WizardBrandLike {
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

const isHex = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v.trim());

export function resolveBrandSummary(
  savedBrand: SavedBrandLike | null | undefined,
  wizardBrand: WizardBrandLike | null | undefined,
): BrandSummary | null {
  const wizardColors: BrandSummaryColor[] = [];
  if (isHex(wizardBrand?.primaryColor)) wizardColors.push({ key: 'primary', hex: wizardBrand!.primaryColor!.trim() });
  if (isHex(wizardBrand?.secondaryColor)) wizardColors.push({ key: 'secondary', hex: wizardBrand!.secondaryColor!.trim() });

  // What the owner set in this wizard wins over the saved brand.
  if (wizardColors.length > 0 || wizardBrand?.logoUrl) {
    return {
      source: 'wizard',
      logoUrl: wizardBrand?.logoUrl || null,
      websiteUrl: savedBrand?.website_url || null,
      colors: wizardColors,
      voice: savedBrand?.voice_tone?.personality?.slice(0, 2) || [],
    };
  }

  if (savedBrand) {
    const colors = Object.entries(savedBrand.colors || {})
      .filter(([, c]) => isHex(c?.hex))
      .map(([key, c]) => ({ key, hex: String(c!.hex).trim() }));
    if (colors.length === 0 && !savedBrand.logo_url) return null;
    return {
      source: 'saved',
      logoUrl: savedBrand.logo_url || null,
      websiteUrl: savedBrand.website_url || null,
      colors,
      voice: savedBrand.voice_tone?.personality?.slice(0, 2) || [],
    };
  }
  return null;
}
