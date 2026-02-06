import { supabase } from "@/integrations/supabase/client";

/**
 * Generate a clean, company-name-based slug
 * "Fractal Software" → "fractal-software"
 * "Dr. Smith's Dental Practice" → "dr-smiths-dental-practice"
 */
export function generateCleanSlug(companyName: string): string {
  if (!companyName || typeof companyName !== 'string') {
    return 'page';
  }
  
  let slug = companyName
    .toLowerCase()
    .trim()
    // Remove special characters except spaces and hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Trim leading/trailing hyphens
    .replace(/^-|-$/g, '');
  
  // Truncate to reasonable length (max 50 chars)
  slug = slug.substring(0, 50).replace(/-$/, '');
  
  // Fallback if empty
  if (!slug) {
    return 'page';
  }
  
  return slug;
}

/**
 * Get a unique slug by checking the database
 * If "fractal-software" exists, returns "fractal-software-2", etc.
 */
export async function getUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  // Safety limit to prevent infinite loops
  const maxAttempts = 100;
  
  while (counter <= maxAttempts) {
    const { data, error } = await supabase
      .from('landing_pages')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking slug availability:', error);
      // On error, fall back to unique timestamp approach
      return `${baseSlug}-${Date.now()}`;
    }
    
    if (!data) {
      // Slug is available
      return slug;
    }
    
    // Slug taken, try next number
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  
  // Fallback with timestamp if all numbered attempts fail
  return `${baseSlug}-${Date.now()}`;
}

/**
 * Generate a clean, unique slug from a company name
 * Combines generateCleanSlug and getUniqueSlug
 */
export async function generateUniqueSlug(companyName: string | null | undefined): Promise<string> {
  const baseSlug = generateCleanSlug(companyName || 'page');
  return getUniqueSlug(baseSlug);
}

/**
 * Build the full public URL for a published page
 */
export function getPublicPageUrl(slug: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/p/${slug}`;
}

/**
 * Copy the public page URL to clipboard
 */
export async function copyPageUrlToClipboard(slug: string): Promise<boolean> {
  try {
    const url = getPublicPageUrl(slug);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy URL:', error);
    return false;
  }
}
