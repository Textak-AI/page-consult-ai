import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Palette, Globe, Type, Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface BrandAssets {
  logo?: File;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  websiteUrl?: string;
  fontStyle?: 'modern' | 'classic' | 'bold' | 'friendly';
  mood?: 'professional' | 'bold' | 'minimal' | 'warm';
}

interface BrandAssetsCaptureProps {
  onSubmit: (assets: BrandAssets) => void;
  onSkip: () => void;
  isExtracting?: boolean;
}

export function BrandAssetsCapture({ 
  onSubmit, 
  onSkip,
  isExtracting = false 
}: BrandAssetsCaptureProps) {
  const [assets, setAssets] = useState<BrandAssets>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAssets(prev => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleRemoveLogo = useCallback(() => {
    setAssets(prev => ({ ...prev, logo: undefined, logoUrl: undefined }));
    setLogoPreview(null);
  }, []);

  const handleExtractFromUrl = useCallback(async () => {
    if (!urlInput) return;
    setAssets(prev => ({ ...prev, websiteUrl: urlInput }));
  }, [urlInput]);

  const handleSubmit = () => {
    onSubmit(assets);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Make It Yours
          </h1>
          <p className="text-muted-foreground">
            Your strategy is ready. Let's make the page look like your brand.
          </p>
        </div>

        {/* Assets Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          
          {/* Logo Upload */}
          <div className="bg-card/50 border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Logo</span>
            </div>
            
            {logoPreview ? (
              <div className="relative aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                <button
                  onClick={handleRemoveLogo}
                  className="absolute top-2 right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-destructive-foreground" />
                </button>
              </div>
            ) : (
              <label className="aspect-square bg-muted/50 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                <div className="text-center">
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">PNG, SVG, JPG</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Colors */}
          <div className="bg-card/50 border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Colors</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Primary</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={assets.primaryColor || '#06b6d4'}
                    onChange={(e) => setAssets(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                  />
                  <Input
                    value={assets.primaryColor || ''}
                    onChange={(e) => setAssets(prev => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="#06b6d4"
                    className="flex-1 bg-muted border-border text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Secondary</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={assets.secondaryColor || '#8b5cf6'}
                    onChange={(e) => setAssets(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                  />
                  <Input
                    value={assets.secondaryColor || ''}
                    onChange={(e) => setAssets(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    placeholder="#8b5cf6"
                    className="flex-1 bg-muted border-border text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Website URL */}
          <div className="bg-card/50 border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Website</span>
            </div>
            
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onBlur={handleExtractFromUrl}
              placeholder="https://yoursite.com"
              className="bg-muted border-border text-sm mb-2"
            />
            <p className="text-xs text-muted-foreground">
              We'll match your existing site's colors
            </p>
          </div>
        </div>

        {/* Style Options */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          
          {/* Typography Style */}
          <div className="bg-card/50 border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Typography Style</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {(['modern', 'classic', 'bold', 'friendly'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setAssets(prev => ({ ...prev, fontStyle: style }))}
                  className={`
                    px-3 py-2 rounded-lg text-sm capitalize transition-all
                    ${assets.fontStyle === style 
                      ? 'bg-primary/20 border-primary/50 text-primary border' 
                      : 'bg-muted/30 border-border/30 text-muted-foreground border hover:border-muted-foreground/50'}
                  `}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Overall Mood */}
          <div className="bg-card/50 border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Overall Mood</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {(['professional', 'bold', 'minimal', 'warm'] as const).map((mood) => (
                <button
                  key={mood}
                  onClick={() => setAssets(prev => ({ ...prev, mood }))}
                  className={`
                    px-3 py-2 rounded-lg text-sm capitalize transition-all
                    ${assets.mood === mood 
                      ? 'bg-secondary/20 border-secondary/50 text-secondary border' 
                      : 'bg-muted/30 border-border/30 text-muted-foreground border hover:border-muted-foreground/50'}
                  `}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-muted-foreground"
          >
            Skip — use smart defaults
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isExtracting}
            className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
          >
            {isExtracting ? 'Extracting...' : 'Generate My Page'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Help text */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Don't have assets ready? No problem — we'll use industry-appropriate defaults based on your brief.
        </p>

      </motion.div>
    </div>
  );
}
