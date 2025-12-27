import { useState, useCallback, useMemo, memo } from "react";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProblemSolutionSection } from "@/components/sections/ProblemSolutionSection";
import { CalculatorSection } from "@/components/sections/CalculatorSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { SocialProofSection } from "@/components/sections/SocialProofSection";
import { ThreeStageShowcase } from "@/components/sections/ThreeStageShowcase";
import { PhotoGallerySection } from "@/components/sections/PhotoGallerySection";
import { StatsBarSection } from "@/components/sections/StatsBarSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { DifferentiatorCalloutSection } from "@/components/sections/DifferentiatorCalloutSection";
import { AudienceFitSection } from "@/components/sections/AudienceFitSection";
import { CredibilityStripSection } from "@/components/sections/CredibilityStripSection";
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
  getSectionLockStatus?: (sectionType: string) => {
    status: 'unlocked' | 'partial' | 'locked';
    isLocked: boolean;
    isPartial: boolean;
    requirement?: string;
    progress?: string;
  };
}

export function LivePreview({ sections, onSectionsChange, cssVariables, iconStyle = "outline", strategyBrief, seoData, getSectionLockStatus }: LivePreviewProps) {
  const { editingSection, setEditingSection, isEditing, pageStyle } = useEditing();
  const currentStyle = styleVariants[pageStyle];
  
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiChatSection, setAiChatSection] = useState<{ index: number; type: string; content: any } | null>(null);
  
  const [imageGenOpen, setImageGenOpen] = useState(false);
  const [imageGenSection, setImageGenSection] = useState<{ index: number; type: string; content: any } | null>(null);
  
  const [logoUploadOpen, setLogoUploadOpen] = useState(false);
  const [logoUploadSection, setLogoUploadSection] = useState<{ index: number; content: any } | null>(null);
  
  // Testimonial acquisition modal state
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);

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
    // Debug logging
    console.log('🎨 [LivePreview] Rendering section:', section.type, 'industryVariant:', section.content?.industryVariant);
    
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
            content={section.content}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "stats-bar":
        console.log('🎨 [LivePreview] Rendering stats-bar with industryVariant:', section.content.industryVariant);
        return renderSectionWithToolbar(
          section,
          index,
          <StatsBarSection 
            statistics={section.content.statistics || []} 
            industryVariant={section.content.industryVariant}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "problem-solution":
        return renderSectionWithToolbar(
          section,
          index,
          <ProblemSolutionSection
            content={section.content}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "calculator":
        return renderSectionWithToolbar(
          section,
          index,
          <CalculatorSection content={section.content} onUpdate={updateSection} />
        );
      case "features":
        return renderSectionWithToolbar(
          section,
          index,
          <FeaturesSection
            content={section.content}
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
            content={section.content}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "social-proof":
        return renderSectionWithToolbar(
          section,
          index,
          <SocialProofSection 
            content={section.content} 
            onUpdate={updateSection} 
            isEditing={editingSection === index}
          />
        );
      case "final-cta":
        console.log('🎯 [FinalCTA] Rendering ThreeStageShowcase');
        return renderSectionWithToolbar(
          section,
          index,
          <ThreeStageShowcase 
            primaryColor={section.content?.primaryColor}
          />
        );
      case "faq":
        return renderSectionWithToolbar(
          section,
          index,
          <FAQSection
            content={section.content}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "how-it-works":
        return renderSectionWithToolbar(
          section,
          index,
          <HowItWorksSection 
            content={section.content} 
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
            content={section.content}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "beta-perks":
        return renderSectionWithToolbar(
          section,
          index,
          <BetaPerksSection content={section.content} onUpdate={updateSection} />
        );
      case "waitlist-proof":
        return renderSectionWithToolbar(
          section,
          index,
          <WaitlistProofSection content={section.content} />
        );
      case "beta-final-cta":
        return renderSectionWithToolbar(
          section,
          index,
          <BetaFinalCTASection
            content={section.content}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "differentiator-callout":
        return renderSectionWithToolbar(
          section,
          index,
          <DifferentiatorCalloutSection content={section.content} />
        );
      case "audience-fit":
        return renderSectionWithToolbar(
          section,
          index,
          <AudienceFitSection
            content={section.content}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "credibility-strip":
        return renderSectionWithToolbar(
          section,
          index,
          <CredibilityStripSection content={section.content} />
        );
      case "founder":
        return renderSectionWithToolbar(
          section,
          index,
          <FounderCredibilitySection
            content={section.content}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
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
      {/* Inject design system CSS variables */}
      {cssVariables && (
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      )}
      <style>{`
        /* Base typography from style preset */
        .live-preview-container h1, 
        .live-preview-container h2, 
        .live-preview-container h3 {
          font-weight: ${currentStyle.typography.headingWeight};
          font-size: calc(1em * ${currentStyle.typography.headingSize});
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
      <div className="min-h-full bg-background live-preview-container">
        {sections
          .sort((a, b) => a.order - b.order)
          .map((section, index) => renderSection(section, index))}
        
        {/* Footer */}
        <PageFooter />
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
    </div>
  );
}