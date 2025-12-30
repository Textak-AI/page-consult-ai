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
import { useDevMode } from './DevToolbar';

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
  
  // NEW: Credibility fields
  identitySentence?: string;
  concreteProofStory?: string;
  proofStoryContext?: string;
  methodologySteps?: string[];
  calculatorTypicalResults?: string;
  calculatorDisclaimer?: string;
  calculatorNextStep?: string;
  
  // NEW: Credibility strip stats
  proofStats?: Array<{
    value: string;
    label: string;
    icon?: string;
  }>;
  
  // NEW: Differentiation fields
  painSpike?: string;
  sharpDifferentiator?: string;
  audienceExclusion?: string;
  secondaryCTA?: 'none' | 'see-demo' | 'explore-features' | 'view-cases' | 'get-guide' | 'talk-customer' | 'custom';
  secondaryCTACustom?: string;
  
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
  // 🎯 Consulting Firm
  'consulting': {
    pageType: 'standard',
    businessName: 'Stratford Advisory Group',
    industry: 'Professional Services',
    yearsInBusiness: '12 years',
    targetAudience: 'CEOs and executive teams at mid-market companies ($50M-$500M)',
    uniqueValue: 'We help leadership teams unlock growth by aligning strategy, operations, and culture',
    ctaText: 'Schedule a Discovery Call',
    primaryGoal: 'Book Meetings',
    identitySentence: 'Former Fortune 500 executives who specialize in scaling mid-market companies',
    concreteProofStory: 'A regional logistics company doubled revenue in 18 months after implementing our growth framework',
    proofStoryContext: 'We realigned their sales organization and introduced performance metrics that drove accountability',
    methodologySteps: [
      'Executive alignment session to surface hidden challenges',
      'Strategic roadmap with prioritized initiatives',
      'Quarterly progress reviews with course corrections'
    ],
    painSpike: 'Your leadership team is working harder than ever but growth has plateaued — and you\'re not sure why',
    sharpDifferentiator: 'Unlike big consulting firms, we stay engaged through implementation — not just strategy decks',
    audienceExclusion: 'Not for early-stage startups or companies seeking transactional project work',
    secondaryCTA: 'view-cases',
    proofStats: [
      { value: '150+', label: 'Clients Served', icon: 'users' },
      { value: '12', label: 'Years Experience', icon: 'clock' },
      { value: '$2.3B', label: 'Client Revenue Growth', icon: 'trending-up' }
    ],
    brandSettings: {
      primaryColor: '#0D9488' // Teal
    }
  },

  // 🏭 Manufacturing Company
  'manufacturing': {
    pageType: 'standard',
    businessName: 'Precision Manufacturing Consultants',
    industry: 'Manufacturing',
    yearsInBusiness: '15+ years',
    targetAudience: 'Operations VPs at mid-size manufacturers',
    uniqueValue: 'We identify hidden inefficiencies that cost you 15-30% of production capacity',
    ctaText: 'Schedule Assessment',
    primaryGoal: 'Book Meetings',
    identitySentence: 'Former plant operators who specialize in finding hidden capacity without capital investment',
    concreteProofStory: 'A food & beverage manufacturer found 18% idle capacity within 60 days',
    proofStoryContext: 'We mapped their changeover process and found 40 minutes of waste per shift',
    methodologySteps: [
      'Floor walk and supervisor interviews',
      'Constraint mapping and takt time analysis',
      'Findings presentation with prioritized recommendations'
    ],
    calculatorTypicalResults: 'Most clients see 15-30% improvement in production capacity',
    calculatorDisclaimer: 'Does not account for implementation time or capital investments',
    calculatorNextStep: 'Schedule your capacity assessment to validate these numbers',
    painSpike: 'Your best operators are fighting fires instead of improving throughput — and every unplanned stop costs $10,000+',
    sharpDifferentiator: 'We find hidden capacity without capital investment — most clients recover 6 figures in the first 90 days',
    audienceExclusion: 'Not for job shops under $5M revenue, or facilities without in-house maintenance teams',
    secondaryCTA: 'view-cases',
    proofStats: [
      { value: '200+', label: 'Manufacturers Served', icon: 'users' },
      { value: '15+', label: 'Years Experience', icon: 'clock' },
      { value: '23%', label: 'Avg. Capacity Recovered', icon: 'trending-up' }
    ],
    brandSettings: {
      primaryColor: '#1E3A5F' // Navy
    }
  },

  // 💻 SaaS Product
  'saas': {
    pageType: 'standard',
    businessName: 'CloudSync Pro',
    productName: 'CloudSync',
    industry: 'B2B SaaS',
    targetAudience: 'IT Directors at companies with 100-500 employees',
    uniqueValue: 'Sync all your cloud tools in one dashboard with zero engineering effort',
    ctaText: 'Start Free Trial',
    primaryGoal: 'Generate Leads',
    identitySentence: 'Purpose-built for IT teams managing 30-200 SaaS tools without a dedicated integration team',
    concreteProofStory: 'A 50-person SaaS company reduced integration maintenance from 20 hours/week to 2',
    proofStoryContext: 'Our pre-built connectors eliminated their custom Zapier workflows entirely',
    methodologySteps: [
      'Discovery call to map your current tool stack',
      'One-click connections with your critical systems',
      'Go-live with monitoring dashboard in under a week'
    ],
    painSpike: 'Integration failures breaking revenue workflows at 2am with no one to fix them',
    sharpDifferentiator: 'Only iPaaS with built-in security review automation — no more 6-week vendor approvals',
    audienceExclusion: 'Not for companies with dedicated integration engineers or enterprises with existing iPaaS contracts',
    secondaryCTA: 'see-demo',
    proofStats: [
      { value: '500+', label: 'Teams Using', icon: 'users' },
      { value: '99.9%', label: 'Uptime', icon: 'award' },
      { value: '4.8★', label: 'G2 Rating', icon: 'award' }
    ],
    brandSettings: {
      primaryColor: '#6366F1' // Indigo
    }
  },

  // 🏥 Healthcare Provider
  'healthcare': {
    pageType: 'standard',
    businessName: 'Meridian Health Partners',
    industry: 'Healthcare',
    yearsInBusiness: '20+ years',
    targetAudience: 'Hospital administrators and healthcare executives',
    uniqueValue: 'We optimize clinical workflows to reduce burnout and improve patient outcomes',
    ctaText: 'Request Consultation',
    primaryGoal: 'Book Meetings',
    identitySentence: 'Former hospital administrators who understand the balance between care quality and operational efficiency',
    concreteProofStory: 'A 300-bed regional hospital reduced nurse overtime by 35% while improving patient satisfaction scores',
    proofStoryContext: 'We redesigned their shift scheduling and patient flow processes',
    methodologySteps: [
      'Workflow assessment with frontline staff interviews',
      'Process redesign with change management support',
      'Implementation with ongoing optimization'
    ],
    painSpike: 'Staff burnout is driving turnover — and every departing nurse costs you $50,000+ to replace',
    sharpDifferentiator: 'We work with your staff, not around them — sustainable change that sticks',
    audienceExclusion: 'Not for single-physician practices or facilities without dedicated operations leadership',
    secondaryCTA: 'view-cases',
    proofStats: [
      { value: '75+', label: 'Healthcare Facilities', icon: 'users' },
      { value: '20+', label: 'Years in Healthcare', icon: 'clock' },
      { value: '28%', label: 'Avg. Efficiency Gain', icon: 'trending-up' }
    ],
    brandSettings: {
      primaryColor: '#0891B2' // Cyan
    }
  },

  // 💰 Financial Services
  'financial': {
    pageType: 'standard',
    businessName: 'Cornerstone Wealth Advisors',
    industry: 'Financial Services',
    yearsInBusiness: '25 years',
    targetAudience: 'High-net-worth individuals and family offices',
    uniqueValue: 'Comprehensive wealth management that protects and grows multi-generational assets',
    ctaText: 'Schedule Private Consultation',
    primaryGoal: 'Book Meetings',
    identitySentence: 'CFP® professionals who specialize in complex wealth situations',
    concreteProofStory: 'A business owner successfully transferred $15M in assets to the next generation with minimal tax impact',
    proofStoryContext: 'We structured a 10-year succession plan with coordinated estate planning',
    methodologySteps: [
      'Confidential discovery meeting to understand your complete financial picture',
      'Custom strategy presentation with scenario analysis',
      'Ongoing quarterly reviews and proactive adjustments'
    ],
    painSpike: 'You\'ve built significant wealth but aren\'t confident it\'s structured to last generations',
    sharpDifferentiator: 'Fee-only advisors with no product sales — your interests are our only interests',
    audienceExclusion: 'Not for investors with less than $2M in investable assets',
    secondaryCTA: 'get-guide',
    proofStats: [
      { value: '$3.2B', label: 'Assets Under Management', icon: 'trending-up' },
      { value: '25', label: 'Years Serving Clients', icon: 'clock' },
      { value: '98%', label: 'Client Retention', icon: 'award' }
    ],
    brandSettings: {
      primaryColor: '#1E40AF' // Blue
    }
  },

  // 🎨 Creative Agency
  'creative': {
    pageType: 'standard',
    businessName: 'Spark Creative Studio',
    industry: 'Design / Creative Agency',
    yearsInBusiness: '8 years',
    targetAudience: 'Marketing directors at growth-stage companies',
    uniqueValue: 'We create brand identities that help you stand out in crowded markets',
    ctaText: 'Start a Project',
    primaryGoal: 'Generate Leads',
    identitySentence: 'Brand strategists and designers who build visual identities with business impact',
    concreteProofStory: 'A B2B software company saw 40% increase in qualified leads after our rebrand',
    proofStoryContext: 'We repositioned them from "enterprise tool" to "growth partner" with a complete visual overhaul',
    methodologySteps: [
      'Brand discovery workshop with key stakeholders',
      'Strategic positioning and visual concept development',
      'Complete brand system with usage guidelines'
    ],
    painSpike: 'Your brand looks like every competitor — prospects can\'t remember what makes you different',
    sharpDifferentiator: 'Strategy-led design that connects business goals to creative execution',
    audienceExclusion: 'Not for companies seeking template-based or low-cost design services',
    secondaryCTA: 'view-cases',
    proofStats: [
      { value: '200+', label: 'Brands Created', icon: 'users' },
      { value: '15', label: 'Design Awards', icon: 'award' },
      { value: '8', label: 'Years in Business', icon: 'clock' }
    ],
    brandSettings: {
      primaryColor: '#EC4899' // Pink
    }
  },

  // 🎓 Education/Training
  'education': {
    pageType: 'standard',
    businessName: 'Elevate Learning Academy',
    productName: 'Leadership Accelerator',
    industry: 'Education / Training',
    targetAudience: 'HR leaders and L&D professionals at enterprise companies',
    uniqueValue: 'Transform high-potential employees into effective leaders with our research-backed program',
    ctaText: 'Download Program Guide',
    primaryGoal: 'Generate Leads',
    identitySentence: 'Learning scientists and executive coaches who design programs that drive behavior change',
    concreteProofStory: 'A Fortune 500 tech company promoted 65% of program graduates within 18 months',
    proofStoryContext: 'Our cohort-based approach created peer networks that accelerated development',
    methodologySteps: [
      'Needs assessment aligned to business objectives',
      '12-week cohort program with executive coaching',
      'Impact measurement with manager feedback loops'
    ],
    painSpike: 'Your high-performers are leaving because they don\'t see a path to leadership',
    sharpDifferentiator: 'Unlike generic training, we customize every cohort to your company\'s leadership competencies',
    audienceExclusion: 'Not for companies seeking one-time workshops or off-the-shelf content',
    secondaryCTA: 'see-demo',
    proofStats: [
      { value: '10,000+', label: 'Leaders Trained', icon: 'users' },
      { value: '94%', label: 'Completion Rate', icon: 'award' },
      { value: '65%', label: 'Promotion Rate', icon: 'trending-up' }
    ],
    brandSettings: {
      primaryColor: '#8B5CF6' // Purple
    }
  },

  // 🏠 Real Estate
  'realestate': {
    pageType: 'standard',
    businessName: 'Summit Property Group',
    industry: 'Real Estate',
    yearsInBusiness: '18 years',
    targetAudience: 'Commercial real estate investors and developers',
    uniqueValue: 'We identify and acquire undervalued commercial properties with strong upside potential',
    ctaText: 'View Current Opportunities',
    primaryGoal: 'Generate Leads',
    identitySentence: 'Real estate professionals who combine local market expertise with institutional-grade analysis',
    concreteProofStory: 'A retail center acquisition generated 22% IRR over 5 years through strategic repositioning',
    proofStoryContext: 'We identified tenant mix optimization opportunities the previous owner missed',
    methodologySteps: [
      'Market analysis and opportunity identification',
      'Due diligence and financial modeling',
      'Acquisition execution and asset management'
    ],
    painSpike: 'You\'re competing for deals with deep-pocketed institutional buyers who move faster',
    sharpDifferentiator: 'Off-market deal flow from our 18-year broker network — access properties before they hit the market',
    audienceExclusion: 'Not for residential investors or those seeking turnkey management services',
    secondaryCTA: 'view-cases',
    proofStats: [
      { value: '$850M', label: 'Assets Managed', icon: 'trending-up' },
      { value: '18', label: 'Years Experience', icon: 'clock' },
      { value: '24%', label: 'Avg. IRR', icon: 'award' }
    ],
    brandSettings: {
      primaryColor: '#059669' // Green
    }
  },

  // 🚀 Beta/Pre-Launch
  'beta': {
    pageType: 'beta-prelaunch',
    businessName: 'FlowState AI',
    productName: 'FlowState',
    industry: 'AI / Productivity',
    targetAudience: 'Knowledge workers drowning in distractions',
    uniqueValue: 'AI that detects your cognitive state and protects your focus automatically',
    ctaText: 'Join the Waitlist',
    primaryGoal: 'Build Waitlist',
    identitySentence: 'Neuroscience-backed focus protection for teams who can\'t afford distraction debt',
    painSpike: 'Every context switch costs 23 minutes of recovery time — and your best people lose 3+ hours daily',
    sharpDifferentiator: 'The only focus tool that detects cognitive state in real-time — no more guessing when to protect deep work',
    audienceExclusion: 'Not for open floor plan offices without private focus spaces',
    secondaryCTA: 'see-demo',
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
      name: 'Jordan Chen',
      title: 'Founder & CEO',
      story: 'After burning out at my third startup, I became obsessed with understanding why some days I could work for 8 hours straight, and other days I couldn\'t focus for 8 minutes. The answer wasn\'t discipline — it was awareness.',
      credentials: ['Ex-Google', '2x Founder', 'Stanford CS']
    },
    brandSettings: {
      primaryColor: '#06B6D4' // Cyan
    }
  },

  // 💼 Investor Pitch
  'investor': {
    pageType: 'investor',
    businessName: 'NexGen Quantum',
    productName: 'QuantumOS',
    industry: 'Quantum Computing',
    targetAudience: 'Series A investors focused on deep tech',
    uniqueValue: 'First quantum operating system that runs on existing hardware, reducing quantum computing costs by 90%',
    ctaText: 'Request Investor Deck',
    primaryGoal: 'Investor Outreach',
    identitySentence: 'Making quantum computing accessible to enterprises without specialized hardware',
    painSpike: 'Quantum computing promises 1000x speedups but requires $10M+ in specialized infrastructure',
    sharpDifferentiator: 'Our software layer runs quantum algorithms on classical hardware — 90% cost reduction',
    proofStats: [
      { value: '$2.1M', label: 'ARR', icon: 'trending-up' },
      { value: '340%', label: 'YoY Growth', icon: 'trending-up' },
      { value: '3', label: 'Fortune 500 Pilots', icon: 'users' }
    ],
    proofPoints: {
      clientCount: '3 Fortune 500 pilots',
      achievements: '$2.1M ARR, 340% YoY growth'
    },
    founder: {
      name: 'Dr. Sarah Martinez',
      title: 'CEO & Co-Founder',
      story: 'Former quantum research lead at IBM. Built the first working prototype solving real optimization problems.',
      credentials: ['PhD MIT', 'Ex-IBM Quantum', 'Forbes 30 Under 30']
    },
    brandSettings: {
      primaryColor: '#8B5CF6' // Purple
    }
  },

  // Minimal test case
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
  const [isDevModeEnabled, setIsDevModeEnabled] = useDevMode();
  
  // State
  const [testData, setTestData] = useState<DevTestData>(PRESETS['consulting']);
  const [jsonText, setJsonText] = useState(JSON.stringify(PRESETS['consulting'], null, 2));
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
        const defaultPreset = PRESETS['consulting'];
        setTestData(defaultPreset);
        setJsonText(JSON.stringify(defaultPreset, null, 2));
      }
    } else {
      // No saved data, ensure default is loaded with proper JSON text
      const defaultPreset = PRESETS['consulting'];
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

  // Reset brand brief for testing
  const handleResetBrand = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Not logged in',
          description: 'You need to be logged in to reset brand',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('brand_briefs')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: 'Error resetting brand',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Brand reset',
        description: 'Navigating to fresh brand setup...',
      });
      addLog('success', 'Brand brief deleted — navigating to fresh setup');
      
      // Navigate to brand-setup with fresh=true to avoid loading stale data
      window.location.href = '/brand-setup?fresh=true';
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to reset brand',
        variant: 'destructive',
      });
    }
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
        
        // NEW: Credibility fields
        identitySentence: testData.identitySentence || null,
        concreteProofStory: testData.concreteProofStory || null,
        proofStoryContext: testData.proofStoryContext || null,
        methodologySteps: testData.methodologySteps || null,
        calculatorTypicalResults: testData.calculatorTypicalResults || null,
        calculatorDisclaimer: testData.calculatorDisclaimer || null,
        calculatorNextStep: testData.calculatorNextStep || null,
        
        // NEW: Differentiation fields
        painSpike: testData.painSpike || null,
        sharpDifferentiator: testData.sharpDifferentiator || null,
        audienceExclusion: testData.audienceExclusion || null,
        secondaryCTA: testData.secondaryCTA || null,
        secondaryCTACustom: testData.secondaryCTACustom || null,
        proofStats: testData.proofStats || null,
        
        // Beta-specific fields
        ...(testData.betaConfig && {
          betaStage: testData.betaConfig.stage,
          betaTimeline: testData.betaConfig.timeline,
          betaPerks: testData.betaConfig.perks,
          viralEnabled: testData.betaConfig.viralEnabled,
          rewardTiers: testData.betaConfig.rewardTiers,
        }),
        // Founder fields - pass both nested object and flat fields
        ...(testData.founder && includeFounder && {
          founder: testData.founder,
          founderName: testData.founder.name,
          founderTitle: testData.founder.title,
          founderStory: testData.founder.story,
          founderCredentials: testData.founder.credentials,
          founderPhoto: testData.founder.photo,
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

      // Build navigation state - pass brandSettings at multiple levels for compatibility
      const navigationState = {
        consultationData: {
          ...consultationData,
          primaryColor: testData.brandSettings?.primaryColor || '#06B6D4',
          brandSettings: testData.brandSettings,
        },
        devMode: true,
        devTimestamp: Date.now(), // Forces React to see new state
        strategicData: {
          consultationData: {
            ...consultationData,
            businessName: testData.businessName,
            productName: testData.productName,
            pageType: testData.pageType, // CRITICAL: Explicitly pass pageType for beta sections
            primaryColor: testData.brandSettings?.primaryColor || '#06B6D4',
            brandSettings: testData.brandSettings,
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
      };

      // Always store in sessionStorage as backup
      sessionStorage.setItem('devPanelState', JSON.stringify(navigationState));
      
      // Check if already on /generate page
      const currentPath = window.location.pathname;
      
      if (currentPath === '/generate' || currentPath.includes('/generate')) {
        addLog('info', 'Already on generate page - navigating away then back to force remount');
        
        // Close the panel first
        onClose();
        
        // Navigate away then back to force component remount
        navigate('/', { replace: true });
        
        // Small delay then navigate to generate with state
        setTimeout(() => {
          navigate('/generate', { 
            state: navigationState,
            replace: true 
          });
        }, 100);
      } else {
        // Navigate to generate page with dev mode enabled
        navigate('/generate', { state: navigationState });
        addLog('success', 'Navigation triggered - page generation starting...');
        onClose();
      }
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
              <div className="flex items-center gap-4">
                {/* Dev Mode Toggle */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600">
                  <Label htmlFor="dev-mode-toggle" className="text-xs text-slate-300 cursor-pointer">
                    Dev Mode
                  </Label>
                  <Switch
                    id="dev-mode-toggle"
                    checked={isDevModeEnabled}
                    onCheckedChange={() => {
                      setIsDevModeEnabled();
                      if (isDevModeEnabled) {
                        onClose();
                        window.location.reload();
                      }
                    }}
                  />
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
                  <Button
                    onClick={handleResetBrand}
                    variant="outline"
                    className="border-red-600/50 hover:bg-red-900/30 text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset Brand
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
