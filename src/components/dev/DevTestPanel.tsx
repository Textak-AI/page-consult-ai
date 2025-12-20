/**
 * Developer Test Panel for rapid page generation testing
 * Only visible in dev mode (localhost, preview URLs, lovable.app domains)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Play, 
  FileText, 
  Trash2, 
  Copy, 
  ChevronDown,
  Beaker,
  User,
  MessageSquare,
  HelpCircle,
  Rocket,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface DevTestData {
  // Page configuration
  pageType: 'standard' | 'beta-prelaunch' | 'investor';
  
  // Business info
  businessName: string;
  productName?: string;
  industry: string;
  yearsInBusiness?: string;
  
  // Audience
  targetAudience: string;
  audiencePainPoints?: string[];
  
  // Value prop
  uniqueValue: string;
  
  // Beta-specific
  betaConfig?: {
    stage: 'idea' | 'building' | 'alpha' | 'private-beta' | 'public-beta' | 'pre-launch';
    timeline: string;
    perks: string[];
    viralEnabled: boolean;
    rewardTiers?: Array<{ referrals: number; reward: string }>;
  };
  
  // Founder (optional)
  founder?: {
    name: string;
    title: string;
    story: string;
    credentials: string[];
    photo?: string;
  };
  
  // Proof points (optional)
  proofPoints?: {
    clientCount?: string;
    yearsInBusiness?: string;
    achievements?: string;
  };
  
  // Brand settings
  brandSettings?: {
    primaryColor: string;
    logoUrl?: string;
  };
  
  // CTA
  ctaText: string;
  primaryGoal: string;
}

// ============================================
// PRESET TEST CASES
// ============================================

const PRESETS: Record<string, DevTestData> = {
  'hypeflow-beta': {
    pageType: 'beta-prelaunch',
    businessName: 'Hypeflow AI',
    productName: 'Flower',
    industry: 'AI / Machine Learning',
    targetAudience: 'Knowledge workers drowning in distractions',
    uniqueValue: 'It reads your mind. Detects cognitive state in real-time and protects focus automatically.',
    ctaText: 'Join the Waitlist',
    primaryGoal: 'Build Waitlist',
    betaConfig: {
      stage: 'building',
      timeline: 'Q2 2026',
      perks: ['early-access', 'lifetime-discount', 'founder-access', 'feature-input', 'founding-member'],
      viralEnabled: true,
      rewardTiers: [
        { referrals: 3, reward: 'Early Access' },
        { referrals: 10, reward: '50% Lifetime Discount' },
        { referrals: 25, reward: 'Founding Member Status' }
      ]
    },
    founder: {
      name: 'Alex Chen',
      title: 'Founder & CEO',
      story: `After burning out at my third startup, I became obsessed with understanding why some days I could code for 8 hours straight, and other days I couldn't focus for 8 minutes.

The answer wasn't discipline. It was awareness.

Flower reads your mind — not literally, but close. It learns your patterns, detects your state, and protects your focus automatically.

I'm building the tool I wish I had.`,
      credentials: ['Ex-Google', '2x YC Founder', 'Stanford CS']
    },
    brandSettings: {
      primaryColor: '#06B6D4'
    }
  },
  'manufacturing-standard': {
    pageType: 'standard',
    businessName: 'Precision Manufacturing Consultants',
    industry: 'Manufacturing',
    yearsInBusiness: '15+ years',
    targetAudience: 'Operations VPs at mid-size manufacturers',
    uniqueValue: 'We identify hidden inefficiencies that cost you 15-30% of production capacity',
    ctaText: 'Schedule Assessment',
    primaryGoal: 'Book Meetings',
    proofPoints: {
      clientCount: '200+ manufacturers served',
      yearsInBusiness: '15+ years in business',
      achievements: 'Average 23% efficiency improvement'
    },
    brandSettings: {
      primaryColor: '#1E3A5F'
    }
  },
  'saas-standard': {
    pageType: 'standard',
    businessName: 'CloudSync Pro',
    industry: 'B2B SaaS',
    targetAudience: 'IT Directors at companies with 100-500 employees',
    uniqueValue: 'Sync all your cloud tools in one dashboard with zero engineering effort',
    ctaText: 'Start Free Trial',
    primaryGoal: 'Generate Leads',
    brandSettings: {
      primaryColor: '#6366F1'
    }
  },
  'investor-pitch': {
    pageType: 'investor',
    businessName: 'QuantumLeap Labs',
    productName: 'QuantumOS',
    industry: 'Quantum Computing',
    targetAudience: 'Series A investors focused on deep tech',
    uniqueValue: 'First quantum operating system that runs on existing hardware, reducing quantum computing costs by 90%',
    ctaText: 'Request Deck',
    primaryGoal: 'Investor Outreach',
    proofPoints: {
      clientCount: '3 Fortune 500 pilots',
      achievements: '$2.1M ARR, 340% YoY growth'
    },
    founder: {
      name: 'Dr. Sarah Martinez',
      title: 'CEO & Co-Founder',
      story: 'Former quantum research lead at IBM. PhD MIT. Built the first working prototype in my garage.',
      credentials: ['PhD MIT', 'Ex-IBM Quantum', 'Forbes 30 Under 30']
    },
    brandSettings: {
      primaryColor: '#8B5CF6'
    }
  },
  'minimal': {
    pageType: 'standard',
    businessName: 'Test Company',
    industry: 'Technology',
    targetAudience: 'Business owners',
    uniqueValue: 'We help you succeed',
    ctaText: 'Get Started',
    primaryGoal: 'Generate Leads'
  }
};

// ============================================
// LOG ENTRY TYPES
// ============================================

interface LogEntry {
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warn';
  message: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

interface DevTestPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DevTestPanel({ isOpen, onClose }: DevTestPanelProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [testData, setTestData] = useState<DevTestData>(PRESETS['hypeflow-beta']);
  const [jsonText, setJsonText] = useState(JSON.stringify(PRESETS['hypeflow-beta'], null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Quick toggles
  const [includeFounder, setIncludeFounder] = useState(true);
  const [includeTestimonials, setIncludeTestimonials] = useState(false);
  const [includeFAQ, setIncludeFAQ] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dev_test_panel_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTestData(parsed);
        setJsonText(JSON.stringify(parsed, null, 2));
      } catch (e) {
        // Fall back to default preset on parse error
        const defaultPreset = PRESETS['hypeflow-beta'];
        setTestData(defaultPreset);
        setJsonText(JSON.stringify(defaultPreset, null, 2));
      }
    } else {
      // No saved data, ensure default is loaded with proper JSON text
      const defaultPreset = PRESETS['hypeflow-beta'];
      setTestData(defaultPreset);
      setJsonText(JSON.stringify(defaultPreset, null, 2));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('dev_test_panel_data', JSON.stringify(testData));
  }, [testData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Cmd+Enter to generate
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, testData]);

  // Add log entry
  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, { timestamp: new Date(), type, message }]);
  }, []);

  // Handle JSON text change
  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setTestData(parsed);
      setJsonError(null);
    } catch (err) {
      setJsonError('Invalid JSON syntax');
    }
  };

  // Handle preset selection
  const handlePresetChange = (key: string) => {
    const preset = PRESETS[key];
    if (preset) {
      setTestData(preset);
      setJsonText(JSON.stringify(preset, null, 2));
      setJsonError(null);
      addLog('info', `Loaded preset: ${key}`);
    }
  };

  // Handle page type toggle
  const handlePageTypeChange = (type: 'standard' | 'beta-prelaunch' | 'investor') => {
    const updated = { ...testData, pageType: type };
    setTestData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
    addLog('info', `Changed page type to: ${type}`);
  };

  // Clear all data
  const handleClear = () => {
    const empty = PRESETS['minimal'];
    setTestData(empty);
    setJsonText(JSON.stringify(empty, null, 2));
    setLogs([]);
    addLog('info', 'Cleared all data');
  };

  // Copy current state
  const handleCopyState = () => {
    navigator.clipboard.writeText(JSON.stringify(testData, null, 2));
    toast({
      title: 'Copied!',
      description: 'JSON copied to clipboard',
    });
  };

  // Generate page
  const handleGenerate = async () => {
    if (jsonError) {
      toast({
        title: 'Invalid JSON',
        description: 'Please fix the JSON syntax before generating',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setLogs([]);
    addLog('info', 'Starting page generation...');

    try {
      // Build consultation data from test data
      const consultationData = {
        id: `dev-test-${Date.now()}`,
        industry: testData.industry,
        service_type: testData.productName || testData.businessName,
        goal: testData.primaryGoal,
        target_audience: testData.targetAudience,
        challenge: testData.audiencePainPoints?.join(', ') || 'Struggling to achieve their goals',
        unique_value: testData.uniqueValue,
        offer: testData.ctaText,
        pageType: testData.pageType,
        // Beta-specific fields
        ...(testData.betaConfig && {
          betaStage: testData.betaConfig.stage,
          betaTimeline: testData.betaConfig.timeline,
          betaPerks: testData.betaConfig.perks,
          viralEnabled: testData.betaConfig.viralEnabled,
          rewardTiers: testData.betaConfig.rewardTiers,
        }),
        // Founder fields
        ...(testData.founder && includeFounder && {
          founderName: testData.founder.name,
          founderTitle: testData.founder.title,
          founderStory: testData.founder.story,
          founderCredentials: testData.founder.credentials,
        }),
        // Brand settings
        ...(testData.brandSettings && {
          primaryColor: testData.brandSettings.primaryColor,
          logoUrl: testData.brandSettings.logoUrl,
        }),
        // Feature toggles
        includeFounder,
        includeTestimonials,
        includeFAQ,
      };

      addLog('info', `Page type: ${testData.pageType}`);
      addLog('info', `Industry: ${testData.industry}`);
      addLog('info', `Target audience: ${testData.targetAudience}`);

      if (testData.pageType === 'beta-prelaunch' && testData.betaConfig) {
        addLog('info', `Beta stage: ${testData.betaConfig.stage}`);
        addLog('info', `Beta perks: ${testData.betaConfig.perks.join(', ')}`);
      }

      addLog('info', 'Navigating to generate page with dev mode...');

      // Navigate to generate page with dev mode enabled
      navigate('/generate', {
        state: {
          consultationData,
          devMode: true,
          strategicData: {
            consultationData: {
              ...consultationData,
              businessName: testData.businessName,
              productName: testData.productName,
              pageType: testData.pageType, // CRITICAL: Explicitly pass pageType for beta sections
            },
            brandSettings: {
              primaryColor: testData.brandSettings?.primaryColor || '#06B6D4',
              secondaryColor: '#8B5CF6',
              headingFont: 'Inter',
              bodyFont: 'Inter',
              logoUrl: testData.brandSettings?.logoUrl || null,
              modified: true,
            },
          },
          fromStrategicConsultation: true,
        },
      });

      addLog('success', 'Navigation triggered - page generation starting...');
      onClose();
    } catch (error) {
      addLog('error', `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate brief only
  const handleGenerateBriefOnly = async () => {
    if (jsonError) {
      toast({
        title: 'Invalid JSON',
        description: 'Please fix the JSON syntax before generating',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    addLog('info', 'Generating strategy brief only...');

    try {
      const response = await supabase.functions.invoke('generate-strategy-brief', {
        body: {
          industry: testData.industry,
          targetAudience: testData.targetAudience,
          uniqueValue: testData.uniqueValue,
          goal: testData.primaryGoal,
          pageType: testData.pageType,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      addLog('success', 'Strategy brief generated successfully');
      addLog('info', `Brief preview: ${JSON.stringify(response.data).slice(0, 200)}...`);
      
      // Copy to clipboard
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      toast({
        title: 'Brief generated!',
        description: 'Strategy brief copied to clipboard',
      });
    } catch (error) {
      addLog('error', `Brief generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: 'Brief generation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-full max-w-2xl bg-slate-900 border-r border-slate-700 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                  <Beaker className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Dev Test Panel</h2>
                  <p className="text-xs text-slate-400">Rapid page generation testing</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {/* Preset Selector */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Load Preset</Label>
                  <Select onValueChange={handlePresetChange}>
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue placeholder="Select a preset test case..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hypeflow-beta">
                        🚀 Hypeflow AI - Beta Page
                      </SelectItem>
                      <SelectItem value="manufacturing-standard">
                        🏭 Manufacturing Consultant - Standard
                      </SelectItem>
                      <SelectItem value="saas-standard">
                        ☁️ SaaS Product - Standard
                      </SelectItem>
                      <SelectItem value="investor-pitch">
                        💰 Investor Pitch - IR Page
                      </SelectItem>
                      <SelectItem value="minimal">
                        📝 Minimal Test Data
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Page Type Toggles */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Page Type</Label>
                  <div className="flex gap-2">
                    {(['standard', 'beta-prelaunch', 'investor'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => handlePageTypeChange(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          testData.pageType === type
                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
                        }`}
                      >
                        {type === 'standard' && 'Standard'}
                        {type === 'beta-prelaunch' && 'Beta'}
                        {type === 'investor' && 'Investor'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Toggles */}
                <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Label className="text-slate-300 text-sm font-medium">Section Toggles</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="founder"
                        checked={includeFounder}
                        onCheckedChange={setIncludeFounder}
                      />
                      <Label htmlFor="founder" className="text-sm text-slate-400 cursor-pointer flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        Founder
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="testimonials"
                        checked={includeTestimonials}
                        onCheckedChange={setIncludeTestimonials}
                      />
                      <Label htmlFor="testimonials" className="text-sm text-slate-400 cursor-pointer flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Testimonials
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="faq"
                        checked={includeFAQ}
                        onCheckedChange={setIncludeFAQ}
                      />
                      <Label htmlFor="faq" className="text-sm text-slate-400 cursor-pointer flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        FAQ
                      </Label>
                    </div>
                  </div>
                </div>

                {/* JSON Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">JSON Data</Label>
                    {jsonError && (
                      <span className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {jsonError}
                      </span>
                    )}
                  </div>
                  <Textarea
                    value={jsonText}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className={`font-mono text-sm h-80 bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500 ${
                      jsonError ? 'border-red-500/50' : ''
                    }`}
                    placeholder="Paste consultation JSON here..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !!jsonError}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Generate Page
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={handleGenerateBriefOnly}
                    disabled={isGenerating || !!jsonError}
                    variant="outline"
                    className="border-slate-600 hover:bg-slate-800"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Brief Only
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    className="border-slate-600 hover:bg-slate-800 text-slate-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                  <Button
                    onClick={handleCopyState}
                    variant="outline"
                    className="border-slate-600 hover:bg-slate-800 text-slate-400"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy State
                  </Button>
                </div>

                {/* Console Output */}
                {logs.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Console Output</Label>
                    <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-xs max-h-48 overflow-auto">
                      {logs.map((log, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-2 py-1 ${
                            log.type === 'error' ? 'text-red-400' :
                            log.type === 'success' ? 'text-green-400' :
                            log.type === 'warn' ? 'text-yellow-400' :
                            'text-slate-400'
                          }`}
                        >
                          <span className="text-slate-600 shrink-0">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          {log.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                          {log.type === 'error' && <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                          <span>{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-700 bg-slate-800/30">
              <p className="text-xs text-slate-500">
                Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">⌘⇧D</kbd> to toggle panel • 
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400 ml-1">⌘↵</kbd> to generate
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default DevTestPanel;
