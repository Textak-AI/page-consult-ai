import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Globe, ArrowRight, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

interface ExtractedBrand {
  companyName?: string;
  domain?: string;
  faviconUrl?: string;
  themeColor?: string;
  websiteUrl?: string;
}

interface Props {
  websiteUrl: string;
  extractedBrand: ExtractedBrand | null;
  onAnalysisComplete: (analysis: any) => void;
  onSkip: () => void;
}

export function WebsiteAnalyzer({ websiteUrl, extractedBrand, onAnalysisComplete, onSkip }: Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setProgress(10);
    setStatus('Reading your website...');

    try {
      await new Promise(r => setTimeout(r, 300));
      setProgress(30);
      setStatus('Analyzing your business...');

      const { data, error } = await supabase.functions.invoke('analyze-website', {
        body: { url: websiteUrl, extractedBrand }
      });

      if (error) throw error;

      setProgress(70);
      setStatus('Extracting key insights...');
      await new Promise(r => setTimeout(r, 300));

      setProgress(100);
      setStatus('Ready!');

      if (data.success && data.analysis) {
        await new Promise(r => setTimeout(r, 500));
        onAnalysisComplete(data.analysis);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setStatus('Could not analyze — continuing manually');
      setTimeout(() => onSkip(), 1500);
    }
  };

  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] p-8"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Analyzing {extractedBrand?.companyName || 'your site'}...
          </h2>
          <p className="text-muted-foreground">{status}</p>
        </div>

        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-2" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto p-6"
    >
      {/* Brand Preview */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-card border mb-8">
        {extractedBrand?.faviconUrl && (
          <img 
            src={extractedBrand.faviconUrl} 
            alt="" 
            className="w-12 h-12 rounded-lg object-contain bg-white p-1"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">
            {extractedBrand?.companyName || extractedBrand?.domain}
          </h3>
          <p className="text-sm text-muted-foreground truncate">{websiteUrl}</p>
        </div>
        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
      </div>

      {/* Main Option */}
      <div className="p-6 rounded-xl border-2 border-purple-500/30 bg-purple-500/5 mb-4">
        <div className="flex items-center gap-2 text-purple-400 text-sm font-medium mb-3">
          <Zap className="w-4 h-4" />
          Recommended
        </div>
        
        <h2 className="text-xl font-bold mb-2">Let PageConsult Fill It In</h2>
        
        <p className="text-muted-foreground mb-4">
          We'll analyze your website and pre-fill each step. You review and tweak as needed.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-6 text-sm">
          {['Industry & audience', 'Problem & solution', 'What makes you different', 'Proof points', 'Best CTA', 'Gaps + guidance'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-muted-foreground">
              <Check className="w-3 h-3 text-purple-400" />
              {item}
            </div>
          ))}
        </div>

        <Button 
          onClick={handleAnalyze} 
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Analyze My Site
        </Button>
      </div>

      {/* Skip */}
      <div className="text-center">
        <button
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          Answer manually instead
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
