/**
 * Color Utility Functions
 * Convert hex colors to HSL and generate color variants for brand theming
 */

/**
 * Convert hex color to HSL values
 */
export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 199, s: 89, l: 48 }; // Default cyan
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return { 
    h: Math.round(h * 360), 
    s: Math.round(s * 100), 
    l: Math.round(l * 100) 
  };
}

/**
 * Convert HSL values to CSS HSL string
 */
export function hslToString(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Generate CSS variables for brand color theming
 */
export function generateBrandColorVariables(primaryHex: string): Record<string, string> {
  const hsl = hexToHSL(primaryHex);
  
  return {
    '--color-brand': primaryHex,
    '--color-brand-hsl': `${hsl.h} ${hsl.s}% ${hsl.l}%`,
    '--color-brand-light': `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 15, 90)}%)`,
    '--color-brand-dark': `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 15, 20)}%)`,
    '--color-brand-glow': `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 0.3)`,
    '--color-brand-muted': `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 0.1)`,
  };
}

/**
 * Apply brand color CSS variables to document root
 */
export function applyBrandColors(primaryHex: string): () => void {
  const variables = generateBrandColorVariables(primaryHex);
  
  Object.entries(variables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  
  console.log('🎨 Applied brand color:', primaryHex, variables);
  
  // Return cleanup function
  return () => {
    Object.keys(variables).forEach(key => {
      document.documentElement.style.removeProperty(key);
    });
  };
}
