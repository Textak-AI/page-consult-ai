import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Check, X, Loader2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface BrandData {
  id: string;
  name: string;
  industry: string | null;
  industry_vertical: string | null;
  website: string | null;
  brand_colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
  } | null;
  tone_profile: string[] | null;
}

interface BrandDetectionPromptProps {
  onUseBrand: (brand: BrandData) => void;
  onSkip: () => void;
}

export function BrandDetectionPrompt({ onUseBrand, onSkip }: BrandDetectionPromptProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [brand, setBrand] = useState<BrandData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasChecked = useRef(false);
  const onSkipRef = useRef(onSkip);
  
  // Keep ref updated
  onSkipRef.current = onSkip;

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('🔍 [BrandDetection] Waiting for auth to load...');
      return;
    }

    // Prevent double execution
    if (hasChecked.current) {
      console.log('🔍 [BrandDetection] Already checked, skipping...');
      return;
    }

    const checkForBrand = async () => {
      hasChecked.current = true;
      console.log('🔍 [BrandDetection] Starting brand check...');
      console.log('🔍 [BrandDetection] User:', user?.id || 'null');

      if (!user) {
        console.log('⏭️ [BrandDetection] No user, skipping to consultation');
        setIsLoading(false);
        onSkipRef.current();
        return;
      }

      try {
        console.log('🔍 [BrandDetection] Querying brands table for user:', user.id);
        
        // Fetch user's default or most recent brand
        const { data, error } = await supabase
          .from('brands')
          .select('id, name, industry, industry_vertical, website, brand_colors, tone_profile')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        console.log('🔍 [BrandDetection] Query result:', { data, error });

        if (error) {
          console.error('❌ [BrandDetection] Error fetching brand:', error);
          setIsLoading(false);
          onSkipRef.current();
          return;
        }

        if (data && data.name) {
          console.log('✅ [BrandDetection] Brand found:', data.name);
          setBrand(data as BrandData);
          setIsLoading(false);
          setIsVisible(true);
        } else {
          console.log('⏭️ [BrandDetection] No brand found, skipping to consultation');
          setIsLoading(false);
          onSkipRef.current();
        }
      } catch (err) {
        console.error('❌ [BrandDetection] Failed to check for brand:', err);
        setIsLoading(false);
        onSkipRef.current();
      }
    };

    checkForBrand();
  }, [user, authLoading]);

  const handleUseBrand = () => {
    if (brand) {
      console.log('🏢 [BrandDetection] User chose to use brand:', brand.name);
      setIsVisible(false);
      setTimeout(() => onUseBrand(brand), 300);
    }
  };

  const handleSkip = () => {
    console.log('⏭️ [BrandDetection] User chose to start fresh');
    setIsVisible(false);
    setTimeout(() => onSkip(), 300);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        <p className="text-slate-400 text-sm">Checking for your brand setup...</p>
      </div>
    );
  }

  if (!brand) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-cyan-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white mb-1">
                Welcome back! I found your brand setup.
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Would you like me to use <span className="text-cyan-400 font-medium">{brand.name}</span>'s 
                details to personalize this consultation?
              </p>

              {/* Brand preview */}
              <div className="bg-slate-900/60 rounded-lg p-4 mb-4 border border-slate-700/50">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {brand.industry && (
                    <span className="px-2.5 py-1 bg-violet-500/20 text-violet-300 rounded-md">
                      {brand.industry}
                    </span>
                  )}
                  {brand.industry_vertical && (
                    <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 rounded-md">
                      {brand.industry_vertical}
                    </span>
                  )}
                  {brand.brand_colors?.primary && (
                    <div className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-slate-400" />
                      <div 
                        className="w-4 h-4 rounded-full border border-slate-600" 
                        style={{ backgroundColor: brand.brand_colors.primary }}
                      />
                    </div>
                  )}
                  {brand.website && (
                    <span className="text-slate-500 truncate max-w-[180px]">
                      {brand.website.replace(/^https?:\/\//, '')}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleUseBrand}
                  className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white border-0"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Use Brand Details
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Start Fresh
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
