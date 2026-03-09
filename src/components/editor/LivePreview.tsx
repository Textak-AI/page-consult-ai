import { useState, useCallback, useMemo, memo } from "react";
import { sanitizeFullCSS } from "@/lib/sanitizeCSS";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProblemSolutionSection } from "@/components/sections/ProblemSolutionSection";
import { CalculatorSection } from "@/components/sections/CalculatorSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { SocialProofSection } from "@/components/sections/SocialProofSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { ThreeStageShowcase } from "@/components/sections/ThreeStageShowcase";
import { PhotoGallerySection } from "@/components/sections/PhotoGallerySection";
import { StatsBarSection } from "@/components/sections/StatsBarSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { DifferentiatorCalloutSection } from "@/components/sections/DifferentiatorCalloutSection";
import { AudienceFitSection } from "@/components/sections/AudienceFitSection";
import { CredibilityStripSection } from "@/components/sections/CredibilityStripSection";
// SDI-driven sections
import { StakesAmplifySection } from "@/components/sections/StakesAmplifySection";
import { RiskReversalSection } from "@/components/sections/RiskReversalSection";
import { ComparisonSection } from "@/components/sections/ComparisonSection";
// Consulting-specific sections (layout template system)
import { CredentialsBarSection } from "@/components/sections/CredentialsBarSection";
import { TheRealChallengeSection } from "@/components/sections/TheRealChallengeSection";
import { OurApproachSection } from "@/components/sections/OurApproachSection";
import { ExpertiseAreasSection } from "@/components/sections/ExpertiseAreasSection";
import { EngagementModelSection } from "@/components/sections/EngagementModelSection";
import { ClientResultsSection } from "@/components/sections/ClientResultsSection";
// Beta sections
import { 
  BetaHeroTeaserSection, 
  BetaPerksSection, 
  WaitlistProofSection, 
  BetaFinalCTASection,
  FounderCredibilitySection 
} from "@/components/sections/beta";
import { useEditing } from "@/contexts/EditingContext";
import { EditingToolbar } from "@/components/editor/EditingToolbar";
import { SectionToolbar } from "@/components/editor/SectionToolbar";
import { SectionAIChat } from "@/components/editor/SectionAIChat";
import { SectionImageGenerator } from "@/components/editor/SectionImageGenerator";
import { LogoUploader } from "@/components/editor/LogoUploader";
import { LockedSectionOverlay } from "@/components/sections/LockedSectionOverlay";
import { TestimonialAcquisitionModal } from "@/components/modals/TestimonialAcquisitionModal";
import { PageFooter } from "@/components/PageFooter";
import { styleVariants } from "@/lib/styleVariants";
import { SEOHead } from "@/components/seo/SEOHead";
import type { SEOHeadData } from "@/lib/aiSeoIntegration";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { getSectionTier, getSectionSpacing, getSectionDivider, getAmbientOrbColors } from "@/lib/premiumPageEffects";
import { resolveArchetypeFromStorage, type DesignProfile } from "@/lib/archetypeProfiles";
import { StrategyConsultantButton } from "@/components/editor/StrategyConsultantButton";
import { StrategyConsultantOverlay, type ChatMessage } from "@/components/editor/StrategyConsultantOverlay";

type Section = {
  type: string;
  order: number;
  visible: boolean;
  content: any;
};

interface LivePreviewProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  cssVariables?: string;
  iconStyle?: "outline" | "solid" | "duotone";
  strategyBrief?: any;
  seoData?: SEOHeadData;
  colorMode?: 'light' | 'dark';
  industryVariant?: string; // Industry variant for CSS custom properties
  // Brand customization props for footer/hero
  brandSettings?: {
    companyName?: string | null;
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    accentColor?: string | null;
  };
  getSectionLockStatus?: (sectionType: string) => {
    status: 'unlocked' | 'partial' | 'locked';
    isLocked: boolean;
    isPartial: boolean;
    requirement?: string;
    progress?: string;
  };
}

export function LivePreview({ sections, onSectionsChange, cssVariables, iconStyle = "outline", strategyBrief, seoData, colorMode = 'dark', industryVariant, brandSettings, getSectionLockStatus }: LivePreviewProps) {
  const { editingSection, setEditingSection, isEditing, pageStyle } = useEditing();
  const currentStyle = styleVariants[pageStyle];
  
  // Resolve archetype design profile from sections or localStorage bridge
  const archetypeProfile = useMemo<DesignProfile>(() => {
    // 1. Check if any section has archetype in content
    const heroContent = sections?.find(s => s.type === 'hero')?.content;
    if (heroContent?.archetype) return heroContent.archetype as DesignProfile;
    // 2. Check localStorage bridge
    return resolveArchetypeFromStorage();
  }, [sections]);
  
  console.log('🎯 [DesignProfile] Active:', archetypeProfile);
  
  // Debug logging for brand handoff - confirms data flow from Generate.tsx
  console.log('🎨 [LivePreview] Received props:', {
    colorMode,
    industryVariant,
    logoUrl: brandSettings?.logoUrl,
    primaryColor: brandSettings?.primaryColor,
    companyName: brandSettings?.companyName,
    archetype: archetypeProfile,
  });
  
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiChatSection, setAiChatSection] = useState<{ index: number; type: string; content: any } | null>(null);
  
  const [imageGenOpen, setImageGenOpen] = useState(false);
  const [imageGenSection, setImageGenSection] = useState<{ index: number; type: string; content: any } | null>(null);
  
  const [logoUploadOpen, setLogoUploadOpen] = useState(false);
  const [logoUploadSection, setLogoUploadSection] = useState<{ index: number; content: any } | null>(null);
  
  // Testimonial acquisition modal state
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  
  // Strategy Consultant state
  const [isConsultantOpen, setIsConsultantOpen] = useState(false);
  const [consultantMessages, setConsultantMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "I'm your AI strategy consultant. I can see your strategy brief and current page. Ask me anything—like 'make my headline more urgent' or 'why is my social proof score low?'",
      timestamp: new Date(),
    }
  ]);

  const handleSaveEdit = () => {
    setEditingSection(null);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const getSectionId = (type: string) => {
    return `section-${type}`;
  };

  const handleEditSection = (index: number) => {
    if (editingSection === index) {
      setEditingSection(null);
    } else {
      setEditingSection(index);
    }
  };

  const handleAIAssist = (index: number, type: string, content: any) => {
    setAiChatSection({ index, type, content });
    setAiChatOpen(true);
  };

  const handleImageGenerate = (index: number, type: string, content: any) => {
    setImageGenSection({ index, type, content });
    setImageGenOpen(true);
  };

  const handleApplyAIChanges = (newContent: any) => {
    if (aiChatSection) {
      const updated = [...sections];
      updated[aiChatSection.index].content = newContent;
      onSectionsChange(updated);
    }
    setAiChatOpen(false);
    setAiChatSection(null);
  };

  const handleApplyImage = (imageUrl: string) => {
    console.log('handleApplyImage called with:', imageUrl);
    console.log('imageGenSection:', imageGenSection);
    
    if (imageGenSection) {
      const updated = [...sections];
      const content = { ...updated[imageGenSection.index].content };
      
      // Apply image based on section type
      if (imageGenSection.type === 'hero') {
        content.backgroundImage = imageUrl;
        console.log('Setting hero backgroundImage to:', imageUrl);
      } else if (imageGenSection.type === 'photo-gallery') {
        // Add to gallery images
        content.images = [...(content.images || []), { url: imageUrl, alt: 'AI Generated' }];
        console.log('Added image to photo-gallery');
      } else {
        // For features, problem-solution, etc - set as main image
        content.image = imageUrl;
        console.log('Setting section image to:', imageUrl);
      }
      
      updated[imageGenSection.index].content = content;
      console.log('Calling onSectionsChange with updated sections');
      onSectionsChange(updated);
    }
    setImageGenOpen(false);
    setImageGenSection(null);
  };

  const handleLogoEdit = (index: number, content: any) => {
    setLogoUploadSection({ index, content });
    setLogoUploadOpen(true);
  };

  const handleLogoApply = (logoUrl: string | null) => {
    if (logoUploadSection) {
      const updated = [...sections];
      updated[logoUploadSection.index].content = {
        ...updated[logoUploadSection.index].content,
        logoUrl: logoUrl,
      };
      onSectionsChange(updated);
    }
    setLogoUploadOpen(false);
    setLogoUploadSection(null);
  };

  const handleUnlockAction = useCallback((sectionType: string, action: string) => {
    console.log('🔓 Unlock action triggered:', { sectionType, action });
    
    switch (action) {
      case 'primary':
        // Open the main unlock modal based on section type
        if (sectionType === 'testimonials' || sectionType === 'social-proof') {
          setTestimonialModalOpen(true);
        } else {
          console.log(`Opening primary unlock modal for ${sectionType}`);
        }
        break;
        
      case 'generate-industry-stats':
        console.log(`Generating industry statistics for ${sectionType}`);
        // TODO: Generate and insert industry statistics section
        break;
        
      case 'add-trust-badges':
        console.log(`Opening trust badge selector for ${sectionType}`);
        // TODO: Open trust badge selector modal
        break;
        
      case 'add-client-logos':
        console.log(`Opening logo upload modal for ${sectionType}`);
        // TODO: Open logo upload modal
        break;
        
      case 'generate-benchmarks':
        console.log(`Generating industry benchmarks for ${sectionType}`);
        // TODO: Generate benchmark section
        break;
        
      case 'expand-process':
        console.log(`Expanding process section for ${sectionType}`);
        // TODO: Expand process/methodology section
        break;
        
      case 'static-roi':
        console.log(`Inserting static ROI projection for ${sectionType}`);
        // TODO: Insert static ROI projection
        break;
        
      case 'show-credentials':
        console.log(`Showing credentials for ${sectionType}`);
        // TODO: Open credentials modal
        break;
        
      default:
        console.log(`Unknown action: ${action}`);
    }
  }, []);

  const renderSectionWithToolbar = useCallback((section: Section, index: number, sectionElement: React.ReactNode) => {
    const sectionId = getSectionId(section.type);
    const lockStatus = getSectionLockStatus?.(section.type);
    const isLocked = lockStatus?.isLocked ?? false;
    const justUpdated = (section as any)._justUpdated;
    
    // If locked, show the gamified overlay
    if (isLocked) {
      return (
        <div 
          key={index} 
          id={sectionId} 
          className="relative group transition-all duration-300"
        >
          <LockedSectionOverlay
            sectionType={section.type}
            onUnlockAction={(action) => handleUnlockAction(section.type, action)}
          >
            {/* Blurred preview of section */}
            {sectionElement}
          </LockedSectionOverlay>
        </div>
      );
    }
    
    return (
      <div 
        key={index} 
        id={sectionId} 
        className={cn(
          "relative group transition-all duration-300",
          justUpdated && "animate-ring-pulse"
        )}
      >
        {/* Updated Badge - shows when consultant applies a change */}
        {justUpdated && (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 px-2 py-1 bg-purple-500/90 text-white text-xs font-medium rounded-full animate-fade-in">
            <Sparkles className="w-3 h-3" />
            Updated
          </div>
        )}
        
        <SectionToolbar
          sectionType={section.type}
          sectionContent={section.content}
          onEdit={() => handleEditSection(index)}
          onAIAssist={() => handleAIAssist(index, section.type, section.content)}
          onImageGenerate={() => handleImageGenerate(index, section.type, section.content)}
          onLogoEdit={() => handleLogoEdit(index, section.content)}
          isEditing={editingSection === index}
        />
        
        {sectionElement}
      </div>
    );
  }, [getSectionLockStatus, handleUnlockAction, editingSection, handleEditSection, handleAIAssist, handleImageGenerate, handleLogoEdit]);

  const renderSection = (section: Section, index: number) => {
    // Inject industryVariant, colorMode, and brand colors into section content if not already present
    const sectionContent = {
      ...section.content,
      industryVariant: section.content?.industryVariant || industryVariant || 'default',
      mode: section.content?.mode || colorMode || 'dark',
      // Inject brand colors so section components can use them for CTAs/buttons
      primaryColor: section.content?.primaryColor || brandSettings?.primaryColor || null,
      logoUrl: section.content?.logoUrl || brandSettings?.logoUrl || null,
      archetype: archetypeProfile, // Archetype design profile
    };
    
    // Debug logging
    console.log('🎨 [LivePreview] Rendering section:', section.type, 'industryVariant:', sectionContent.industryVariant, 'mode:', sectionContent.mode);
    
    if (!section.visible) return null;

    const updateSection = (content: any) => {
      const updated = [...sections];
      updated[index].content = content;
      onSectionsChange(updated);
    };

    switch (section.type) {
      case "hero":
        return renderSectionWithToolbar(
          section,
          index,
          <HeroSection
            content={sectionContent}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "stats-bar":
        return renderSectionWithToolbar(
          section,
          index,
          <StatsBarSection 
            statistics={sectionContent.statistics || []} 
            industryVariant={sectionContent.industryVariant}
            mode={sectionContent.mode}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "problem-solution":
        return renderSectionWithToolbar(
          section,
          index,
          <ProblemSolutionSection
            content={sectionContent}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "calculator":
        return renderSectionWithToolbar(
          section,
          index,
          <CalculatorSection content={sectionContent} onUpdate={updateSection} />
        );
      case "features":
        return renderSectionWithToolbar(
          section,
          index,
          <FeaturesSection
            content={sectionContent}
            onUpdate={updateSection}
            isEditing={editingSection === index}
            iconStyle={iconStyle}
          />
        );
      case "photo-gallery":
        return renderSectionWithToolbar(
          section,
          index,
          <PhotoGallerySection
            content={sectionContent}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "social-proof":
        return renderSectionWithToolbar(
          section,
          index,
          <SocialProofSection 
            content={sectionContent} 
            onUpdate={updateSection} 
            isEditing={editingSection === index}
          />
        );
      case "final-cta": {
        // Check if this is PageConsult's own marketing/demo page
        const isPageConsultDemo = sectionContent?.isPageConsultDemo === true || 
                                  sectionContent?.businessName?.toLowerCase() === 'pageconsult' ||
                                  sectionContent?.showInteractiveDemo === true;
        
        if (isPageConsultDemo) {
          // PageConsult marketing pages get the interactive demo
          return renderSectionWithToolbar(
            section,
            index,
            <ThreeStageShowcase primaryColor={sectionContent?.primaryColor} />
          );
        }
        
        // Customer pages get their personalized CTA
        return renderSectionWithToolbar(
          section,
          index,
          <FinalCTASection
            content={sectionContent}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      }
      case "faq":
        return renderSectionWithToolbar(
          section,
          index,
          <FAQSection
            content={sectionContent}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "how-it-works":
        return renderSectionWithToolbar(
          section,
          index,
          <HowItWorksSection 
            content={sectionContent} 
            onUpdate={updateSection} 
            isEditing={editingSection === index}
          />
        );
      // Beta section types
      case "beta-hero-teaser":
        return renderSectionWithToolbar(
          section,
          index,
          <BetaHeroTeaserSection
            content={sectionContent}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "beta-perks":
        return renderSectionWithToolbar(
          section,
          index,
          <BetaPerksSection content={sectionContent} onUpdate={updateSection} />
        );
      case "waitlist-proof":
        return renderSectionWithToolbar(
          section,
          index,
          <WaitlistProofSection content={sectionContent} />
        );
      case "beta-final-cta":
        return renderSectionWithToolbar(
          section,
          index,
          <BetaFinalCTASection
            content={sectionContent}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "differentiator-callout":
        return renderSectionWithToolbar(
          section,
          index,
          <DifferentiatorCalloutSection content={sectionContent} />
        );
      case "audience-fit":
        return renderSectionWithToolbar(
          section,
          index,
          <AudienceFitSection
            content={sectionContent}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "credibility-strip":
        return renderSectionWithToolbar(
          section,
          index,
          <CredibilityStripSection content={sectionContent} />
        );
      case "founder":
        return renderSectionWithToolbar(
          section,
          index,
          <FounderCredibilitySection
            content={sectionContent}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      // SDI-driven section types
      case "stakes-amplify":
        return renderSectionWithToolbar(
          section,
          index,
          <StakesAmplifySection
            content={sectionContent}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "risk-reversal":
        return renderSectionWithToolbar(
          section,
          index,
          <RiskReversalSection
            content={sectionContent}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "comparison":
        return renderSectionWithToolbar(
          section,
          index,
          <ComparisonSection
            content={sectionContent}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      // Consulting-specific section types (from layout templates)
      case "credentials-bar":
        console.log('🎨 [LivePreview] Rendering section: credentials-bar');
        return renderSectionWithToolbar(
          section,
          index,
          <CredentialsBarSection content={sectionContent} />
        );
      case "the-real-challenge":
        console.log('🎨 [LivePreview] Rendering section: the-real-challenge');
        return renderSectionWithToolbar(
          section,
          index,
          <TheRealChallengeSection content={sectionContent} />
        );
      case "our-approach":
        console.log('🎨 [LivePreview] Rendering section: our-approach');
        return renderSectionWithToolbar(
          section,
          index,
          <OurApproachSection content={sectionContent} />
        );
      case "expertise-areas":
        console.log('🎨 [LivePreview] Rendering section: expertise-areas');
        return renderSectionWithToolbar(
          section,
          index,
          <ExpertiseAreasSection content={sectionContent} />
        );
      case "engagement-model":
        console.log('🎨 [LivePreview] Rendering section: engagement-model');
        return renderSectionWithToolbar(
          section,
          index,
          <EngagementModelSection content={sectionContent} />
        );
      case "client-results":
        console.log('🎨 [LivePreview] Rendering section: client-results');
        return renderSectionWithToolbar(
          section,
          index,
          <ClientResultsSection content={sectionContent} />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="flex-1 bg-muted/30 overflow-y-auto transition-all duration-500"
      style={{
        '--style-primary': currentStyle.colors.primary,
        '--style-secondary': currentStyle.colors.secondary,
        '--style-accent': currentStyle.colors.accent,
        '--style-radius': currentStyle.borders.radius,
        '--style-shadow': currentStyle.effects.shadow,
        '--style-padding': currentStyle.spacing.sectionPadding,
        fontFamily: currentStyle.typography.bodyFont,
      } as React.CSSProperties}
    >
      {/* Inject design system CSS variables (sanitized) */}
      {cssVariables && (
        <style dangerouslySetInnerHTML={{ __html: sanitizeFullCSS(cssVariables) }} />
      )}
      <style>{`
        /* Base typography from style preset */
        .live-preview-container h1, 
        .live-preview-container h2, 
        .live-preview-container h3 {
          font-weight: ${currentStyle.typography.headingWeight};
          /* font-size removed — let Tailwind classes control heading sizes */
          font-family: var(--font-heading, ${currentStyle.typography.headingFont}), system-ui, sans-serif;
        }
        .live-preview-container section {
          padding-top: calc(${currentStyle.spacing.sectionPadding} * 0.75);
          padding-bottom: calc(${currentStyle.spacing.sectionPadding} * 0.75);
          transition: background-color 0.5s ease, color 0.3s ease;
        }
        
        /* Section highlight glow animation */
        .section-highlight-glow {
          animation: section-glow 2s ease-out forwards;
          position: relative;
        }
        .section-highlight-glow::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 8px;
          border: 2px solid hsl(187, 92%, 60%);
          box-shadow: 0 0 20px hsl(187, 92%, 60%, 0.4);
          pointer-events: none;
          animation: glow-fade 2s ease-out forwards;
        }
        @keyframes section-glow {
          0% { background-color: hsl(187, 92%, 60%, 0.05); }
          100% { background-color: transparent; }
        }
        @keyframes glow-fade {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
      {isEditing && (
        <EditingToolbar onSave={handleSaveEdit} onCancel={handleCancelEdit} />
      )}
      
      {/* SEO Head - injects meta tags and schema markup */}
      {seoData && <SEOHead seo={seoData} />}
      <div 
        data-mode={colorMode} 
        data-industry={industryVariant || 'default'}
        data-archetype={archetypeProfile}
        data-card-style={(() => {
          const firstSection = sections.find(s => s.content?.designIntelligence);
          const di = firstSection?.content?.designIntelligence;
          return di?.designTokens?.cardStyle || di?.cardStyle || 'glass';
        })()}
        className={cn(
          "min-h-full live-preview-container relative",
          colorMode === 'light' ? 'bg-white text-slate-900' : 'bg-slate-950 text-slate-50',
          colorMode === 'dark' && 'page-noise-overlay'
        )}
        style={(() => {
          const styles: React.CSSProperties = {};
          if (brandSettings?.primaryColor) {
            styles['--color-brand' as any] = brandSettings.primaryColor;
            styles['--color-primary' as any] = brandSettings.primaryColor;
            styles['--brand-primary' as any] = brandSettings.primaryColor;
          }
          if (brandSettings?.secondaryColor) {
            styles['--color-secondary' as any] = brandSettings.secondaryColor;
            styles['--brand-secondary' as any] = brandSettings.secondaryColor;
          }
          if (brandSettings?.accentColor) {
            styles['--color-accent' as any] = brandSettings.accentColor;
            styles['--brand-accent' as any] = brandSettings.accentColor;
          }
          return Object.keys(styles).length > 0 ? styles : undefined;
        })()}
      >
        {/* Ambient floating orbs — dark mode only */}
        {colorMode === 'dark' && (() => {
          const orbColors = getAmbientOrbColors(industryVariant || 'default');
          return (
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
              <div
                className="absolute w-[500px] h-[500px] rounded-full blur-[120px] animate-float-orb-slow will-change-transform"
                style={{ background: orbColors.primary, top: '10%', right: '-5%' }}
              />
              <div
                className="absolute w-[400px] h-[400px] rounded-full blur-[120px] animate-float-orb-reverse will-change-transform"
                style={{ background: orbColors.secondary, bottom: '15%', left: '-8%' }}
              />
              <div
                className="absolute w-[350px] h-[350px] rounded-full blur-[120px] animate-float-orb-drift will-change-transform"
                style={{ background: orbColors.tertiary, top: '45%', left: '30%' }}
              />
            </div>
          );
        })()}

        {/* Sections with tier wrappers */}
        <div className="relative z-10">
          {sections
            .sort((a, b) => a.order - b.order)
            .map((section, index) => {
              if (!section.visible) return null;
              const tier = getSectionTier(section.type, index);
              const spacing = getSectionSpacing(section.type);
              const divider = getSectionDivider(section.type, index);

              return colorMode === 'dark' ? (
                <div
                  key={`tier-${index}`}
                  className={cn(
                    `section-tier-${tier}`,
                    `section-spacing-${spacing}`,
                    divider,
                    'relative'
                  )}
                >
                  <div className="relative z-10">
                    {renderSection(section, index)}
                  </div>
                </div>
              ) : (
                renderSection(section, index)
              );
            })}
        </div>
        
        {/* Footer with brand customization */}
        <div className="relative z-10">
          <PageFooter 
            companyName={brandSettings?.companyName}
            logoUrl={brandSettings?.logoUrl}
          />
        </div>
      </div>
      
      {/* AI Chat Drawer */}
      <SectionAIChat
        isOpen={aiChatOpen}
        onClose={() => {
          setAiChatOpen(false);
          setAiChatSection(null);
        }}
        sectionType={aiChatSection?.type || ""}
        sectionContent={aiChatSection?.content || {}}
        strategyBrief={strategyBrief}
        onApplyChanges={handleApplyAIChanges}
      />
      
      {/* Image Generator Drawer */}
      <SectionImageGenerator
        isOpen={imageGenOpen}
        onClose={() => {
          setImageGenOpen(false);
          setImageGenSection(null);
        }}
        sectionType={imageGenSection?.type || ""}
        sectionContent={imageGenSection?.content || {}}
        strategyBrief={strategyBrief}
        industryContext={strategyBrief?.industry}
        onApplyImage={handleApplyImage}
      />
      
      {/* Logo Uploader Drawer */}
      <LogoUploader
        isOpen={logoUploadOpen}
        onClose={() => {
          setLogoUploadOpen(false);
          setLogoUploadSection(null);
        }}
        currentLogoUrl={logoUploadSection?.content?.logoUrl}
        onApplyLogo={handleLogoApply}
      />
      
      {/* Testimonial Acquisition Modal */}
      <TestimonialAcquisitionModal
        isOpen={testimonialModalOpen}
        onClose={() => setTestimonialModalOpen(false)}
        businessName={strategyBrief?.businessName || 'Your Business'}
        industry={strategyBrief?.industry || 'consulting'}
        ownerName={strategyBrief?.ownerName}
        serviceDescription={strategyBrief?.serviceDescription}
      />
      
      {/* Strategy Consultant - Hidden in editor phase, only for consultation */}
      {/* NOTE: Strategy Consultant should only appear during consultation, not in editor view 
          Since LivePreview is only used in the editor context, we hide these widgets entirely.
          The consultation chat is handled separately in the Generate page via ConsultantChat. */}
      {/* Commenting out Strategy Consultant in editor - use ConsultantChat in Generate.tsx instead */}
      {/* 
      <StrategyConsultantButton 
        onClick={() => setIsConsultantOpen(true)}
        suggestionCount={0}
      />
      <StrategyConsultantOverlay
        isOpen={isConsultantOpen}
        onClose={() => setIsConsultantOpen(false)}
        messages={consultantMessages}
        onSendMessage={(msg) => {
          setConsultantMessages(prev => [
            ...prev,
            { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() },
            { id: (Date.now() + 1).toString(), role: 'assistant', content: 'AI response coming in Phase 2...', timestamp: new Date() }
          ]);
        }}
        onApplySuggestion={(sectionId, field, value) => {
          const sectionIndex = sections.findIndex(s => s.type === sectionId);
          if (sectionIndex === -1) {
            console.warn(`Section ${sectionId} not found`);
            return;
          }
          
          const updated = [...sections];
          const content = { ...updated[sectionIndex].content };
          
          if (field.includes('.')) {
            const [parent, child] = field.split('.');
            content[parent] = { ...content[parent], [child]: value };
          } else {
            content[field] = value;
          }
          
          updated[sectionIndex].content = content;
          onSectionsChange(updated);
          
          console.log(`✅ Applied suggestion: ${field} in ${sectionId} updated to "${value}"`);
        }}
      />
      */}
    </div>
  );
}