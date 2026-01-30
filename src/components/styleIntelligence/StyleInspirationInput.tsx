/**
 * STYLE INSPIRATION INPUT
 * 
 * A reusable component for capturing website inspiration URLs.
 * Used in consultation, brand setup, and editor sidebar.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Globe, Loader2, Check, X, 
  Palette, Type, Layout, ChevronDown, ChevronUp,
  ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  extractStyleInspiration, 
  saveInspirationUrl, 
  getInspirationUrls 
} from '@/lib/styleIntelligence';
import type { StyleInspiration } from '@/lib/styleIntelligence';

interface StyleInspirationInputProps {
  onStyleExtracted: (style: StyleInspiration) => void;
  className?: string;
  compact?: boolean;
  showRecentUrls?: boolean;
  placeholder?: string;
}

export function StyleInspirationInput({
  onStyleExtracted,
  className = '',
  compact = false,
  showRecentUrls = true,
  placeholder = 'https://stripe.com, linear.app, etc.',
}: StyleInspirationInputProps) {
  const [url, setUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedStyle, setExtractedStyle] = useState<StyleInspiration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const recentUrls = showRecentUrls ? getInspirationUrls() : [];

  const handleExtract = useCallback(async () => {
    if (!url.trim()) return;
    
    setIsExtracting(true);
    setError(null);
    setExtractedStyle(null);
    
    const result = await extractStyleInspiration(url.trim());
    
    setIsExtracting(false);
    
    if (result.success && result.inspiration) {
      setExtractedStyle(result.inspiration);
      saveInspirationUrl(url.trim());
      onStyleExtracted(result.inspiration);
    } else {
      setError(result.error || 'Failed to analyze website');
    }
  }, [url, onStyleExtracted]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExtracting) {
      handleExtract();
    }
  };

  const handleRecentClick = (recentUrl: string) => {
    setUrl(recentUrl);
    // Auto-extract when clicking recent
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('[data-inspiration-input]');
      if (input) input.value = recentUrl;
    }, 0);
  };

  const clearExtraction = () => {
    setExtractedStyle(null);
    setUrl('');
  };

  if (compact) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Input
          data-inspiration-input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isExtracting}
          className="flex-1 bg-background/50 border-border"
        />
        <Button
          onClick={handleExtract}
          disabled={isExtracting || !url.trim()}
          size="sm"
          variant={extractedStyle ? 'outline' : 'default'}
        >
          {isExtracting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : extractedStyle ? (
            <Check className="w-4 h-4 text-primary" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-foreground">Style Inspiration</h3>
          <p className="text-xs text-muted-foreground">Share a website you love the look of</p>
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-inspiration-input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isExtracting}
            className="pl-10 bg-background/50 border-border"
          />
        </div>
        <Button
          onClick={handleExtract}
          disabled={isExtracting || !url.trim()}
          className="shrink-0"
        >
          {isExtracting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Extract Style
            </>
          )}
        </Button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
          >
            <X className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extracted Style Preview */}
      <AnimatePresence>
        {extractedStyle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card/50 border border-border rounded-xl p-4 space-y-4"
          >
            {/* Header with success */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Style captured!</span>
                <span className="text-xs text-muted-foreground capitalize">
                  ({extractedStyle.mood.primary} · {extractedStyle.extractionConfidence} confidence)
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearExtraction}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Preview */}
            <div className="grid grid-cols-3 gap-3">
              {/* Colors */}
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <div className="flex gap-1">
                  {extractedStyle.colors.all.slice(0, 4).map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded border border-white/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Typography */}
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">
                  {extractedStyle.typography.headingFont}
                </span>
              </div>

              {/* Layout */}
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground capitalize">
                  {extractedStyle.spacing.density}
                </span>
              </div>
            </div>

            {/* Expand/Collapse Details */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Hide details
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Show details
                </>
              )}
            </button>

            {/* Detailed View */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 border-t border-border pt-3"
                >
                  {/* Colors */}
                  <div>
                    <span className="text-xs text-muted-foreground">Colors</span>
                    <div className="flex gap-2 mt-1">
                      {[
                        { label: 'Primary', color: extractedStyle.colors.primary },
                        { label: 'Secondary', color: extractedStyle.colors.secondary },
                        { label: 'Accent', color: extractedStyle.colors.accent },
                        { label: 'Background', color: extractedStyle.colors.background },
                      ].filter(c => c.color).map((item, i) => (
                        <div key={i} className="text-center">
                          <div
                            className="w-8 h-8 rounded-lg border border-white/20 mx-auto"
                            style={{ backgroundColor: item.color! }}
                          />
                          <span className="text-[10px] text-muted-foreground mt-1 block">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Typography */}
                  <div>
                    <span className="text-xs text-muted-foreground">Typography</span>
                    <div className="flex gap-4 mt-1">
                      <div>
                        <span 
                          className="text-lg font-bold text-foreground"
                          style={{ fontFamily: extractedStyle.typography.headingFont }}
                        >
                          Heading
                        </span>
                        <span className="text-xs text-muted-foreground block">
                          {extractedStyle.typography.headingFont}
                        </span>
                      </div>
                      <div>
                        <span 
                          className="text-base text-foreground"
                          style={{ fontFamily: extractedStyle.typography.bodyFont }}
                        >
                          Body text
                        </span>
                        <span className="text-xs text-muted-foreground block">
                          {extractedStyle.typography.bodyFont}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Components */}
                  <div>
                    <span className="text-xs text-muted-foreground">Components</span>
                    <div className="flex gap-3 mt-1">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Button: </span>
                        <span className="text-foreground capitalize">
                          {extractedStyle.components.buttonStyle}
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Radius: </span>
                        <span className="text-foreground">
                          {extractedStyle.components.buttonRadius}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Effects */}
                  <div className="flex gap-3">
                    {extractedStyle.effects.hasGradients && (
                      <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">
                        Gradients
                      </span>
                    )}
                    {extractedStyle.effects.hasGlassmorphism && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                        Glassmorphism
                      </span>
                    )}
                    {extractedStyle.effects.hasShadows && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        {extractedStyle.effects.shadowIntensity} shadows
                      </span>
                    )}
                  </div>

                  {/* Source */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                    <ExternalLink className="w-3 h-3" />
                    <a 
                      href={extractedStyle.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors truncate"
                    >
                      {extractedStyle.sourceUrl}
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent URLs */}
      {showRecentUrls && recentUrls.length > 0 && !extractedStyle && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Recent inspirations</span>
          <div className="flex flex-wrap gap-2">
            {recentUrls.slice(0, 3).map((recentUrl, i) => (
              <button
                key={i}
                onClick={() => handleRecentClick(recentUrl)}
                className="text-xs bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg transition-colors truncate max-w-[200px]"
              >
                {recentUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
