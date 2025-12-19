import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Palette, Check, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { HexColorPicker } from 'react-colorful';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface WebsiteIntelligence {
  url: string;
  logoUrl?: string | null;
  colors: string[];
  primaryColor?: string;
  secondaryColor?: string;
  companyName?: string | null;
  tagline?: string | null;
}

export interface BrandSettings {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  headingFont: string;
  bodyFont: string;
  modified: boolean;
}

interface Props {
  websiteIntelligence: WebsiteIntelligence;
  industry?: string;
  onComplete: (brandSettings: BrandSettings) => void;
  onBack?: () => void;
  onUseDefaults?: () => void;
}

// Curated Google Fonts organized by style
const FONT_OPTIONS = {
  'Modern Sans': [
    { value: 'Inter', label: 'Inter' },
    { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
    { value: 'DM Sans', label: 'DM Sans' },
    { value: 'Space Grotesk', label: 'Space Grotesk' },
  ],
  'Classic Sans': [
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Montserrat', label: 'Montserrat' },
  ],
  'Serif': [
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Merriweather', label: 'Merriweather' },
    { value: 'Lora', label: 'Lora' },
    { value: 'Source Serif Pro', label: 'Source Serif Pro' },
  ],
};

// Industry font recommendations
const INDUSTRY_FONT_RECOMMENDATIONS: Record<string, string[]> = {
  'Manufacturing / Industrial': ['Inter', 'Roboto', 'IBM Plex Sans'],
  'Professional Services': ['Inter', 'Plus Jakarta Sans', 'Lato'],
  'Healthcare / Medical': ['Plus Jakarta Sans', 'Open Sans', 'Lato'],
  'Legal Services': ['Playfair Display', 'Merriweather', 'Lora'],
  'Financial Services': ['Inter', 'Source Serif Pro', 'Roboto'],
  'Real Estate': ['Playfair Display', 'Montserrat', 'Lato'],
  'B2B SaaS / Software': ['Inter', 'Space Grotesk', 'DM Sans'],
  'Fitness / Wellness': ['Montserrat', 'Poppins', 'Space Grotesk'],
  'E-commerce / Retail': ['Poppins', 'DM Sans', 'Inter'],
  'Agency / Creative': ['Space Grotesk', 'DM Sans', 'Playfair Display'],
};

// Check if two colors have enough contrast
function getContrastWarning(color1: string, color2: string): string | null {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);
  
  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);
  
  // Simple luminance difference check
  const lum1 = (0.299 * r1 + 0.587 * g1 + 0.114 * b1) / 255;
  const lum2 = (0.299 * r2 + 0.587 * g2 + 0.114 * b2) / 255;
  
  const diff = Math.abs(lum1 - lum2);
  
  if (diff < 0.15) {
    return 'These colors are very similar. Consider using more contrast.';
  }
  
  return null;
}

export function BrandCustomization({ 
  websiteIntelligence, 
  industry,
  onComplete, 
  onBack,
  onUseDefaults 
}: Props) {
  // Helper to find first "colorful" color (not near-white or near-black)
  const getFirstColorfulColor = (colors: string[]): string => {
    const validColors = colors.filter(c => c && c.length > 0);
    
    for (const color of validColors) {
      const hex = color.replace('#', '').toUpperCase();
      
      // Skip pure white and black
      if (['FFF', 'FFFFFF', '000', '000000'].includes(hex)) continue;
      
      // Skip very light or very dark colors
      try {
        const fullHex = hex.length === 3 
          ? hex.split('').map(c => c + c).join('') 
          : hex;
        if (fullHex.length !== 6) continue;
        
        const r = parseInt(fullHex.substr(0, 2), 16);
        const g = parseInt(fullHex.substr(2, 2), 16);  
        const b = parseInt(fullHex.substr(4, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Skip colors with luminance > 0.85 (near-white) or < 0.15 (near-black)
        if (luminance > 0.85 || luminance < 0.15) continue;
        
        return color;
      } catch {
        continue;
      }
    }
    
    return '#3B82F6'; // Fallback to visible blue
  };
  
  // Initialize with first "colorful" extracted color or fallback
  const [primaryColor, setPrimaryColor] = useState(() => 
    getFirstColorfulColor([
      websiteIntelligence.primaryColor || '',
      ...websiteIntelligence.colors
    ])
  );
  const [secondaryColor, setSecondaryColor] = useState(
    websiteIntelligence.secondaryColor || 
    websiteIntelligence.colors[1] || 
    '#E85D04'
  );
  const [headingFont, setHeadingFont] = useState('Inter');
  const [bodyFont, setBodyFont] = useState('Inter');
  const [logoUrl, setLogoUrl] = useState<string | null>(websiteIntelligence.logoUrl || null);
  const [logoOption, setLogoOption] = useState<'extracted' | 'upload'>('extracted');
  const [hasModified, setHasModified] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Load Google Fonts dynamically
  useEffect(() => {
    const fonts = new Set([headingFont, bodyFont]);
    fonts.forEach(font => {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap`;
      link.rel = 'stylesheet';
      // Check if already loaded
      if (!document.querySelector(`link[href="${link.href}"]`)) {
        document.head.appendChild(link);
      }
    });
  }, [headingFont, bodyFont]);

  const handleColorChange = (color: string, type: 'primary' | 'secondary') => {
    setHasModified(true);
    if (type === 'primary') {
      setPrimaryColor(color);
    } else {
      setSecondaryColor(color);
    }
  };

  const handleFontChange = (font: string, type: 'heading' | 'body') => {
    setHasModified(true);
    if (type === 'heading') {
      setHeadingFont(font);
    } else {
      setBodyFont(font);
    }
  };

  const handleExtractedColorClick = (color: string, type: 'primary' | 'secondary') => {
    setHasModified(true);
    if (type === 'primary') {
      setPrimaryColor(color);
    } else {
      setSecondaryColor(color);
    }
  };

  // Handle logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoUrl(result);
        setLogoOption('upload');
        setHasModified(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    onComplete({
      logoUrl,
      primaryColor,
      secondaryColor,
      headingFont,
      bodyFont,
      modified: hasModified,
    });
  };

  const contrastWarning = getContrastWarning(primaryColor, secondaryColor);
  const fontRecommendations = industry ? INDUSTRY_FONT_RECOMMENDATIONS[industry] : null;

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <span className="text-slate-500 text-sm">Step 2 of 8</span>
        </div>

        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 mb-4">
            <Palette className="w-7 h-7 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Let's Match Your Brand</h1>
          <p className="text-slate-400">We extracted these from your website. Adjust as needed.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Settings */}
          <div className="space-y-8">
            {/* Logo Section */}
            {websiteIntelligence.logoUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700"
              >
                <Label className="text-slate-400 text-sm uppercase tracking-wider mb-4 block">
                  Your Logo
                </Label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-16 bg-slate-700/50 rounded-lg flex items-center justify-center p-2">
                    <img 
                      src={websiteIntelligence.logoUrl} 
                      alt="Extracted logo"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="logo"
                        checked={logoOption === 'extracted'}
                        onChange={() => {
                          setLogoOption('extracted');
                          setLogoUrl(websiteIntelligence.logoUrl || null);
                        }}
                        className="w-4 h-4 text-cyan-500"
                      />
                      <span className="text-white flex items-center gap-1">
                        <Check className="w-4 h-4 text-green-400" />
                        Looks good
                      </span>
                    </label>
                    <label 
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="radio"
                        name="logo"
                        checked={logoOption === 'upload'}
                        onChange={() => setLogoOption('upload')}
                        className="w-4 h-4 text-cyan-500"
                      />
                      <span className="text-slate-400 flex items-center gap-1 hover:text-white transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload different
                      </span>
                    </label>
                    {/* Hidden file input for logo upload */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Colors Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700"
            >
              <Label className="text-slate-400 text-sm uppercase tracking-wider mb-4 block">
                Brand Colors
              </Label>
              
              <div className="space-y-6">
                {/* Primary Color */}
                <div>
                  <p className="text-white text-sm mb-2">Primary Color <span className="text-slate-500">(buttons, CTAs, key accents)</span></p>
                  <div className="flex items-center gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-3 bg-slate-700/50 rounded-lg px-4 py-3 hover:bg-slate-700 transition-colors">
                          <div 
                            className="w-10 h-10 rounded-lg border-2 border-slate-600"
                            style={{ backgroundColor: primaryColor }}
                          />
                          <span className="text-white font-mono">{primaryColor.toUpperCase()}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3 bg-slate-800 border-slate-700">
                        <HexColorPicker 
                          color={primaryColor} 
                          onChange={(c) => handleColorChange(c, 'primary')} 
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <p className="text-white text-sm mb-2">Secondary Color <span className="text-slate-500">(highlights, secondary actions)</span></p>
                  <div className="flex items-center gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-3 bg-slate-700/50 rounded-lg px-4 py-3 hover:bg-slate-700 transition-colors">
                          <div 
                            className="w-10 h-10 rounded-lg border-2 border-slate-600"
                            style={{ backgroundColor: secondaryColor }}
                          />
                          <span className="text-white font-mono">{secondaryColor.toUpperCase()}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3 bg-slate-800 border-slate-700">
                        <HexColorPicker 
                          color={secondaryColor} 
                          onChange={(c) => handleColorChange(c, 'secondary')} 
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Contrast Warning */}
                {contrastWarning && (
                  <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4" />
                    {contrastWarning}
                  </div>
                )}

                {/* Extracted Palette */}
                {websiteIntelligence.colors.length > 0 && (
                  <div>
                    <p className="text-slate-500 text-sm mb-2">Extracted palette (click to use):</p>
                    <div className="flex gap-2 flex-wrap">
                      {websiteIntelligence.colors.map((color, i) => (
                        <div key={i} className="relative group">
                          <button
                            onClick={() => handleExtractedColorClick(color, 'primary')}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              handleExtractedColorClick(color, 'secondary');
                            }}
                            className="w-10 h-10 rounded-lg border-2 border-slate-600 hover:border-cyan-400 transition-colors cursor-pointer"
                            style={{ backgroundColor: color }}
                            title={`Left-click: Primary, Right-click: Secondary\n${color}`}
                          />
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {color}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 mt-3">Left-click for primary, right-click for secondary</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Typography Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700"
            >
              <Label className="text-slate-400 text-sm uppercase tracking-wider mb-4 block">
                Typography
              </Label>
              
              <div className="space-y-6">
                {/* Heading Font */}
                <div>
                  <p className="text-white text-sm mb-2">Heading Font</p>
                  <Select value={headingFont} onValueChange={(v) => handleFontChange(v, 'heading')}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {Object.entries(FONT_OPTIONS).map(([category, fonts]) => (
                        <div key={category}>
                          <div className="px-2 py-1 text-xs text-slate-500 uppercase">{category}</div>
                          {fonts.map((font) => (
                            <SelectItem 
                              key={font.value} 
                              value={font.value}
                              className="text-white hover:bg-slate-700"
                              style={{ fontFamily: font.value }}
                            >
                              {font.label}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <p 
                    className="text-2xl text-white mt-3"
                    style={{ fontFamily: headingFont }}
                  >
                    Your Headline Here
                  </p>
                </div>

                {/* Body Font */}
                <div>
                  <p className="text-white text-sm mb-2">Body Font</p>
                  <Select value={bodyFont} onValueChange={(v) => handleFontChange(v, 'body')}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {Object.entries(FONT_OPTIONS).map(([category, fonts]) => (
                        <div key={category}>
                          <div className="px-2 py-1 text-xs text-slate-500 uppercase">{category}</div>
                          {fonts.map((font) => (
                            <SelectItem 
                              key={font.value} 
                              value={font.value}
                              className="text-white hover:bg-slate-700"
                              style={{ fontFamily: font.value }}
                            >
                              {font.label}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <p 
                    className="text-slate-400 mt-3"
                    style={{ fontFamily: bodyFont }}
                  >
                    This is how your body text will look. It should be easy to read and complement your headings.
                  </p>
                </div>

                {/* Font Recommendations */}
                {fontRecommendations && (
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-4 py-3">
                    <p className="text-cyan-400 text-sm">
                      💡 Recommended for {industry}: {fontRecommendations.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Live Preview - sticky on desktop */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <Label className="text-slate-400 text-sm uppercase tracking-wider mb-4 block">
                Live Preview
              </Label>
              
              {/* Mini Hero Preview */}
              <div 
                className="rounded-xl overflow-hidden border border-slate-600"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}10 100%)`,
                }}
              >
                <div className="p-8 space-y-6">
                  {/* Logo */}
                  {logoUrl && (
                    <img 
                      src={logoUrl}
                      alt="Logo"
                      className="h-8 object-contain"
                    />
                  )}
                  
                  {/* Headline */}
                  <h2 
                    className="text-3xl font-bold text-white leading-tight"
                    style={{ fontFamily: headingFont }}
                  >
                    {websiteIntelligence.companyName || 'Your Company'}
                  </h2>
                  
                  {/* Subheadline */}
                  <p 
                    className="text-slate-400"
                    style={{ fontFamily: bodyFont }}
                  >
                    {websiteIntelligence.tagline || 'Transform your business with our innovative solutions that deliver real results.'}
                  </p>
                  
                  {/* CTA Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      className="px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90"
                      style={{ 
                        backgroundColor: primaryColor,
                        fontFamily: bodyFont,
                      }}
                    >
                      Get Started
                    </button>
                    <button
                      className="px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
                      style={{ 
                        backgroundColor: `${secondaryColor}20`,
                        color: secondaryColor,
                        fontFamily: bodyFont,
                      }}
                    >
                      Learn More
                    </button>
                  </div>
                  
                  {/* Stats Preview */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
                    {['500+', '98%', '24/7'].map((stat, i) => (
                      <div key={i} className="text-center">
                        <div 
                          className="text-2xl font-bold"
                          style={{ color: primaryColor, fontFamily: headingFont }}
                        >
                          {stat}
                        </div>
                        <div 
                          className="text-xs text-slate-500"
                          style={{ fontFamily: bodyFont }}
                        >
                          {['Clients', 'Satisfaction', 'Support'][i]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Color Legend */}
              <div className="flex gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="text-slate-500">Primary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <span className="text-slate-500">Secondary</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Actions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between items-center mt-10 pt-6 border-t border-slate-800"
        >
          <Button
            variant="ghost"
            onClick={onUseDefaults}
            className="text-slate-500 hover:text-slate-300 hover:bg-slate-800"
          >
            Use Industry Defaults Instead
          </Button>
          <Button
            onClick={handleContinue}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-8"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default BrandCustomization;
