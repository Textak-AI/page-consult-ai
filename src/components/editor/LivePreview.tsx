import { useState } from "react";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProblemSolutionSection } from "@/components/sections/ProblemSolutionSection";
import { CalculatorSection } from "@/components/sections/CalculatorSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { SocialProofSection } from "@/components/sections/SocialProofSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { PhotoGallerySection } from "@/components/sections/PhotoGallerySection";
import { StatsBarSection } from "@/components/sections/StatsBarSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { useEditing } from "@/contexts/EditingContext";
import { EditingToolbar } from "@/components/editor/EditingToolbar";
import { SectionToolbar } from "@/components/editor/SectionToolbar";
import { SectionAIChat } from "@/components/editor/SectionAIChat";
import { SectionImageGenerator } from "@/components/editor/SectionImageGenerator";
import { styleVariants } from "@/lib/styleVariants";

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
}

export function LivePreview({ sections, onSectionsChange, cssVariables, iconStyle = "outline", strategyBrief }: LivePreviewProps) {
  const { editingSection, setEditingSection, isEditing, pageStyle } = useEditing();
  const currentStyle = styleVariants[pageStyle];
  
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiChatSection, setAiChatSection] = useState<{ index: number; type: string; content: any } | null>(null);
  
  const [imageGenOpen, setImageGenOpen] = useState(false);
  const [imageGenSection, setImageGenSection] = useState<{ index: number; type: string; content: any } | null>(null);

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
    if (imageGenSection) {
      const updated = [...sections];
      const content = updated[imageGenSection.index].content;
      
      // Apply image based on section type
      if (imageGenSection.type === 'hero') {
        content.backgroundImage = imageUrl;
      } else if (imageGenSection.type === 'photo-gallery') {
        // Add to gallery images
        content.images = [...(content.images || []), { url: imageUrl, alt: 'AI Generated' }];
      } else {
        // For features, problem-solution, etc - set as main image
        content.image = imageUrl;
      }
      
      updated[imageGenSection.index].content = content;
      onSectionsChange(updated);
    }
    setImageGenOpen(false);
    setImageGenSection(null);
  };

  const renderSectionWithToolbar = (section: Section, index: number, sectionElement: React.ReactNode) => {
    const sectionId = getSectionId(section.type);
    
    return (
      <div 
        key={index} 
        id={sectionId} 
        className="relative group transition-all duration-300"
      >
        <SectionToolbar
          sectionType={section.type}
          sectionContent={section.content}
          onEdit={() => handleEditSection(index)}
          onAIAssist={() => handleAIAssist(index, section.type, section.content)}
          onImageGenerate={() => handleImageGenerate(index, section.type, section.content)}
          isEditing={editingSection === index}
        />
        {sectionElement}
      </div>
    );
  };

  const renderSection = (section: Section, index: number) => {
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
        return renderSectionWithToolbar(
          section,
          index,
          <StatsBarSection statistics={section.content.statistics || []} />
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
          <SocialProofSection content={section.content} onUpdate={updateSection} />
        );
      case "final-cta":
        return renderSectionWithToolbar(
          section,
          index,
          <FinalCTASection
            content={section.content}
            onUpdate={updateSection}
            isEditing={editingSection === index}
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
          <HowItWorksSection content={section.content} onUpdate={updateSection} />
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
      <div className="min-h-full bg-background live-preview-container">
        {sections
          .sort((a, b) => a.order - b.order)
          .map((section, index) => renderSection(section, index))}
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
    </div>
  );
}