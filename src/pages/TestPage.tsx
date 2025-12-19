import { useState, useEffect } from "react";
import { LivePreview } from "@/components/editor/LivePreview";
import { EditingProvider } from "@/contexts/EditingContext";
import { generateDesignSystem, designSystemToCSSVariables } from "@/config/designSystem";
import { mapBriefToSections, type StructuredBrief } from "@/utils/sectionMapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Bug } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Hardcoded test data for Acceler8ors
const TEST_BRAND_SETTINGS = {
  logoUrl: 'https://acceler8ors.com/wp-content/uploads/2023/08/cropped-a8-logo-icon.png',
  primaryColor: '#CD86D4', // Pink/purple
  secondaryColor: '#1E3A5F',
  headingFont: 'Inter',
  bodyFont: 'Inter',
  modified: true,
};

const TEST_STRUCTURED_BRIEF: StructuredBrief = {
  headlines: {
    optionA: "Transform Your Business with Strategic Innovation",
    optionB: "Accelerate Growth Through Expert Consulting",
    optionC: "Unlock Your Company's Full Potential",
  },
  subheadline: "We help ambitious businesses scale faster with proven strategies, hands-on support, and measurable results.",
  messagingPillars: [
    {
      title: "Strategic Planning",
      description: "Data-driven strategies tailored to your unique market position and growth goals.",
      icon: "Target",
    },
    {
      title: "Operational Excellence",
      description: "Streamline processes and eliminate inefficiencies to maximize profitability.",
      icon: "Settings",
    },
    {
      title: "Growth Acceleration",
      description: "Proven frameworks to scale revenue while maintaining quality and culture.",
      icon: "TrendingUp",
    },
  ],
  proofPoints: {
    clientCount: "50+ businesses transformed",
    yearsInBusiness: "15 years of consulting excellence",
    achievements: "Award-winning methodology",
    otherStats: ["$100M+ revenue generated for clients", "95% client satisfaction rate"],
  },
  problemStatement: "Many businesses hit a growth ceiling – stuck between startup scrappiness and enterprise scale, unable to break through despite working harder than ever.",
  solutionStatement: "Acceler8ors provides the strategic roadmap and hands-on support you need to break through barriers and achieve sustainable, profitable growth.",
  tone: "professional",
  objections: [
    {
      question: "How is this different from other consulting firms?",
      answer: "We don't just advise – we roll up our sleeves and work alongside your team to implement solutions that stick.",
    },
    {
      question: "What kind of ROI can we expect?",
      answer: "Our clients typically see 3-5x return on their investment within the first year through increased revenue and operational savings.",
    },
    {
      question: "How long does an engagement typically last?",
      answer: "Most transformations take 6-12 months, but we offer flexible engagement models from intensive sprints to ongoing advisory.",
    },
  ],
  pageStructure: ['hero', 'stats-bar', 'problem-solution', 'features', 'faq', 'final-cta'],
  processSteps: null,
  testimonials: [
    {
      quote: "Acceler8ors helped us double our revenue in 18 months. Their strategic insights were game-changing.",
      author: "Sarah Chen",
      title: "CEO, TechStart Inc",
    },
  ],
  ctaText: "Schedule Your Strategy Session",
};

export default function TestPage() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<any[]>([]);
  const [cssVariables, setCssVariables] = useState<string>('');
  const [debugOpen, setDebugOpen] = useState(true);
  const [designSystem, setDesignSystem] = useState<any>(null);

  useEffect(() => {
    generateTestPage();
  }, []);

  const generateTestPage = () => {
    console.log('🧪 TEST PAGE: Generating with hardcoded data');
    console.log('🎨 Brand settings:', TEST_BRAND_SETTINGS);
    
    // Generate design system with brand overrides
    const ds = generateDesignSystem({
      industry: 'Agency / Creative',
      tone: TEST_STRUCTURED_BRIEF.tone,
      brandOverrides: {
        primaryColor: TEST_BRAND_SETTINGS.primaryColor,
        secondaryColor: TEST_BRAND_SETTINGS.secondaryColor,
      },
    });
    
    console.log('🎨 Generated design system:', ds);
    console.log('🎨 Design system primary color:', ds.colors.primary);
    
    setDesignSystem(ds);
    const cssVars = designSystemToCSSVariables(ds);
    setCssVariables(cssVars);
    console.log('🎨 CSS Variables:', cssVars);
    
    // Map brief to sections
    const mappedSections = mapBriefToSections(TEST_STRUCTURED_BRIEF, {
      businessName: 'Acceler8ors',
      heroImageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920',
      logoUrl: TEST_BRAND_SETTINGS.logoUrl,
      primaryColor: TEST_BRAND_SETTINGS.primaryColor,
    });
    
    console.log('📐 Mapped sections:', mappedSections);
    setSections(mappedSections);
  };

  return (
    <EditingProvider>
      <div className="min-h-screen bg-slate-900 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-white font-semibold">Test Page - Acceler8ors Demo</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDebugOpen(!debugOpen)}
              className="text-slate-300 border-slate-600"
            >
              <Bug className="w-4 h-4 mr-2" />
              {debugOpen ? 'Hide' : 'Show'} Debug
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateTestPage}
              className="text-slate-300 border-slate-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Debug Panel */}
          {debugOpen && (
            <div className="w-96 bg-slate-800 border-r border-slate-700 overflow-y-auto p-4">
              <h2 className="text-white font-semibold mb-4">Debug Panel</h2>
              
              {/* Brand Settings */}
              <div className="mb-6">
                <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Brand Settings</h3>
                <div className="bg-slate-900 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border border-slate-600"
                      style={{ backgroundColor: TEST_BRAND_SETTINGS.primaryColor }}
                    />
                    <span className="text-white text-sm font-mono">{TEST_BRAND_SETTINGS.primaryColor}</span>
                    <span className="text-slate-500 text-xs">Primary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border border-slate-600"
                      style={{ backgroundColor: TEST_BRAND_SETTINGS.secondaryColor }}
                    />
                    <span className="text-white text-sm font-mono">{TEST_BRAND_SETTINGS.secondaryColor}</span>
                    <span className="text-slate-500 text-xs">Secondary</span>
                  </div>
                  {TEST_BRAND_SETTINGS.logoUrl && (
                    <div className="flex items-center gap-2 pt-2">
                      <img 
                        src={TEST_BRAND_SETTINGS.logoUrl} 
                        alt="Logo" 
                        className="h-8 object-contain"
                      />
                      <span className="text-slate-500 text-xs">Logo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Design System Output */}
              {designSystem && (
                <div className="mb-6">
                  <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Design System</h3>
                  <div className="bg-slate-900 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border border-slate-600"
                        style={{ backgroundColor: designSystem.colors.primary }}
                      />
                      <span className="text-white text-sm font-mono">{designSystem.colors.primary}</span>
                      <span className="text-slate-500 text-xs">colors.primary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border border-slate-600"
                        style={{ backgroundColor: designSystem.colors.secondary }}
                      />
                      <span className="text-white text-sm font-mono">{designSystem.colors.secondary}</span>
                      <span className="text-slate-500 text-xs">colors.secondary</span>
                    </div>
                    <div className="text-slate-400 text-xs pt-2">
                      <div>ID: {designSystem.id}</div>
                      <div>Heading: {designSystem.typography.headingFont}</div>
                      <div>Body: {designSystem.typography.bodyFont}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* CSS Variables */}
              <div className="mb-6">
                <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">CSS Variables</h3>
                <div className="bg-slate-900 rounded-lg p-3 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-green-400 whitespace-pre-wrap break-all">
                    {cssVariables}
                  </pre>
                </div>
              </div>

              {/* Sections Generated */}
              <div>
                <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">
                  Sections ({sections.length})
                </h3>
                <div className="bg-slate-900 rounded-lg p-3 space-y-1">
                  {sections.map((section, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-white">{section.type}</span>
                      <span className="text-slate-500">order: {section.order}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Content Check */}
              {sections.find(s => s.type === 'hero') && (
                <div className="mt-6">
                  <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Hero Content</h3>
                  <div className="bg-slate-900 rounded-lg p-3 text-xs">
                    <pre className="text-cyan-400 whitespace-pre-wrap">
                      {JSON.stringify(sections.find(s => s.type === 'hero')?.content, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Live Preview */}
          <div className="flex-1 overflow-hidden">
            <LivePreview
              sections={sections}
              onSectionsChange={setSections}
              cssVariables={cssVariables}
            />
          </div>
        </div>
      </div>
    </EditingProvider>
  );
}
