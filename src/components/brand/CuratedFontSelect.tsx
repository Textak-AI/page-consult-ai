/**
 * Curated Font Select - Conversion-optimized font selection
 * 
 * Features:
 * - Curated fonts grouped by purpose (headings vs body)
 * - Each option renders in its actual font face
 * - Descriptions for each font explaining its best use case
 * - Google Fonts CDN loading
 */

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CuratedFontOption {
  value: string;
  label: string;
  description: string;
  category?: 'detected' | 'matched' | 'uploaded' | 'standard';
}

// Curated heading fonts optimized for conversion
export const CURATED_HEADING_FONTS: CuratedFontOption[] = [
  { value: 'Inter', label: 'Inter', description: 'Clean authority — SaaS, tech', category: 'standard' },
  { value: 'DM Sans', label: 'DM Sans', description: 'Modern geometric — startups', category: 'standard' },
  { value: 'Space Grotesk', label: 'Space Grotesk', description: 'Tech-forward — AI, dev tools', category: 'standard' },
  { value: 'Playfair Display', label: 'Playfair Display', description: 'Premium editorial — consulting, finance', category: 'standard' },
  { value: 'Outfit', label: 'Outfit', description: 'Friendly modern — coaching, education', category: 'standard' },
  { value: 'Merriweather', label: 'Merriweather', description: 'Institutional trust — healthcare, legal', category: 'standard' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville', description: 'Warm credibility — professional services', category: 'standard' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', description: 'Contemporary polish — design, creative', category: 'standard' },
  { value: 'Sora', label: 'Sora', description: 'Geometric futurism — AI/ML, deep tech', category: 'standard' },
  { value: 'Cabinet Grotesk', label: 'Cabinet Grotesk', description: 'Bold personality — agencies', category: 'standard' },
];

// Curated body fonts optimized for readability
export const CURATED_BODY_FONTS: CuratedFontOption[] = [
  { value: 'Inter', label: 'Inter', description: 'Universal clarity', category: 'standard' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro', description: 'Humanist warmth', category: 'standard' },
  { value: 'DM Sans', label: 'DM Sans', description: 'Clean modern', category: 'standard' },
  { value: 'Nunito Sans', label: 'Nunito Sans', description: 'Soft approachable', category: 'standard' },
  { value: 'Work Sans', label: 'Work Sans', description: 'Neutral professional', category: 'standard' },
  { value: 'IBM Plex Sans', label: 'IBM Plex Sans', description: 'Tech professional', category: 'standard' },
];

// Tone-based default pairings (from SDI research)
export const TONE_FONT_PAIRINGS: Record<string, { heading: string; body: string }> = {
  authoritative: { heading: 'Inter', body: 'Inter' },
  consultative: { heading: 'Playfair Display', body: 'Source Sans Pro' },
  innovative: { heading: 'Space Grotesk', body: 'Inter' },
  warm: { heading: 'Libre Baskerville', body: 'Source Sans Pro' },
  urgent: { heading: 'Space Grotesk', body: 'DM Sans' },
};

// Generate Google Fonts URL for all curated fonts
export function getCuratedFontsUrl(): string {
  const allFonts = [...CURATED_HEADING_FONTS, ...CURATED_BODY_FONTS]
    .map(f => f.value)
    .filter((v, i, a) => a.indexOf(v) === i); // unique
  
  const families = allFonts
    .map(f => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700`)
    .join('&');
  
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

// Load curated fonts on module init
let fontsLoaded = false;
export function loadCuratedFonts() {
  if (fontsLoaded || typeof document === 'undefined') return;
  
  const existingLink = document.getElementById('curated-fonts-loader');
  if (existingLink) return;
  
  const link = document.createElement('link');
  link.id = 'curated-fonts-loader';
  link.href = getCuratedFontsUrl();
  link.rel = 'stylesheet';
  document.head.appendChild(link);
  fontsLoaded = true;
}

interface CuratedFontSelectProps {
  value: string;
  onChange: (value: string) => void;
  type: 'heading' | 'body';
  label?: string;
  customFonts?: CuratedFontOption[];
  matchedFont?: { original: string; match: string; similarity: string } | null;
  detectedFont?: string | null;
  className?: string;
}

export function CuratedFontSelect({
  value,
  onChange,
  type,
  label,
  customFonts = [],
  matchedFont,
  detectedFont,
  className,
}: CuratedFontSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Load fonts on mount
  useEffect(() => {
    loadCuratedFonts();
  }, []);
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  // Build options list
  const baseFonts = type === 'heading' ? CURATED_HEADING_FONTS : CURATED_BODY_FONTS;
  
  const options: CuratedFontOption[] = [
    // Custom uploaded fonts first
    ...customFonts,
    // Matched font (if different from standard)
    ...(matchedFont && !baseFonts.some(f => f.value === matchedFont.match) 
      ? [{ 
          value: matchedFont.match, 
          label: matchedFont.match,
          description: `Matches ${matchedFont.original}`,
          category: 'matched' as const
        }] 
      : []),
    // Detected font (if not in standard list)
    ...(detectedFont && !baseFonts.some(f => f.value === detectedFont) && detectedFont !== matchedFont?.match
      ? [{
          value: detectedFont,
          label: detectedFont,
          description: 'Detected from your website',
          category: 'detected' as const
        }]
      : []),
    // Standard curated fonts
    ...baseFonts.filter(f => !customFonts.some(c => c.value === f.value)),
  ];
  
  const selectedOption = options.find(o => o.value === value) || options[0];
  
  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {label && (
        <label className="text-xs text-slate-500 mb-1 block">{label}</label>
      )}
      
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-left",
          "flex items-center justify-between gap-2",
          "hover:border-slate-500 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
        )}
      >
        <div className="flex-1 min-w-0">
          <span 
            className="text-white text-sm block truncate"
            style={{ fontFamily: `'${selectedOption.value}', sans-serif` }}
          >
            {selectedOption.label}
          </span>
          <span className="text-[10px] text-slate-500 truncate block">
            {selectedOption.description}
          </span>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-slate-400 flex-shrink-0 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className={cn(
          "absolute z-50 w-full mt-1",
          "bg-slate-800 border border-slate-600 rounded-lg shadow-xl",
          "max-h-[320px] overflow-y-auto",
          "animate-in fade-in-0 zoom-in-95 duration-150"
        )}>
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const showDivider = index > 0 && option.category === 'standard' && options[index - 1]?.category !== 'standard';
            
            return (
              <div key={option.value}>
                {showDivider && (
                  <div className="border-t border-slate-700 my-1" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2.5 text-left flex items-start gap-3",
                    "hover:bg-slate-700/50 transition-colors",
                    isSelected && "bg-purple-500/10"
                  )}
                >
                  {/* Checkmark */}
                  <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                    {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                  </div>
                  
                  {/* Font preview & description */}
                  <div className="flex-1 min-w-0">
                    <span 
                      className="text-white text-sm block"
                      style={{ fontFamily: `'${option.value}', sans-serif` }}
                    >
                      {option.label}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {option.description}
                    </span>
                  </div>
                  
                  {/* Category badge */}
                  {option.category && option.category !== 'standard' && (
                    <span className={cn(
                      "text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0",
                      option.category === 'uploaded' && "bg-emerald-500/20 text-emerald-400",
                      option.category === 'matched' && "bg-cyan-500/20 text-cyan-400",
                      option.category === 'detected' && "bg-amber-500/20 text-amber-400"
                    )}>
                      {option.category}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CuratedFontSelect;
