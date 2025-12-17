import { HeroSection } from "@/components/sections/HeroSection";
import { ProblemSolutionSection } from "@/components/sections/ProblemSolutionSection";
import { CalculatorSection } from "@/components/sections/CalculatorSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { SocialProofSection } from "@/components/sections/SocialProofSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { PhotoGallerySection } from "@/components/sections/PhotoGallerySection";
import { StatsBarSection } from "@/components/sections/StatsBarSection";
import { useEditing } from "@/contexts/EditingContext";
import { EditingToolbar } from "@/components/editor/EditingToolbar";
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
}

export function LivePreview({ sections, onSectionsChange }: LivePreviewProps) {
  const { editingSection, setEditingSection, isEditing, pageStyle } = useEditing();
  const currentStyle = styleVariants[pageStyle];

  const handleSaveEdit = () => {
    setEditingSection(null);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const getSectionId = (type: string) => {
    return `section-${type}`;
  };

  const renderSection = (section: Section, index: number) => {
    if (!section.visible) return null;

    const updateSection = (content: any) => {
      const updated = [...sections];
      updated[index].content = content;
      onSectionsChange(updated);
    };

    const sectionId = getSectionId(section.type);

    switch (section.type) {
      case "hero":
        return (
          <div key={index} id={sectionId} className="transition-all duration-300">
            <HeroSection
              content={section.content}
              onUpdate={updateSection}
              isEditing={editingSection === index}
            />
          </div>
        );
      case "stats-bar":
        return (
          <div key={index} id={sectionId} className="transition-all duration-300">
            <StatsBarSection
              statistics={section.content.statistics || []}
            />
          </div>
        );
      case "problem-solution":
        return (
          <div key={index} id={sectionId} className="transition-all duration-300">
            <ProblemSolutionSection
              content={section.content}
              onUpdate={updateSection}
              isEditing={editingSection === index}
            />
          </div>
        );
      case "calculator":
        return (
          <div key={index} id={sectionId} className="transition-all duration-300">
            <CalculatorSection
              content={section.content}
              onUpdate={updateSection}
            />
          </div>
        );
      case "features":
        return (
          <div key={index} id={sectionId} className="transition-all duration-300">
            <FeaturesSection
              content={section.content}
              onUpdate={updateSection}
            />
          </div>
        );
      case "photo-gallery":
        return (
          <div key={index} id={sectionId} className="transition-all duration-300">
            <PhotoGallerySection
              content={section.content}
              onUpdate={updateSection}
              isEditing={editingSection === index}
            />
          </div>
        );
      case "social-proof":
        return (
          <div key={index} id={sectionId} className="transition-all duration-300">
            <SocialProofSection
              content={section.content}
              onUpdate={updateSection}
            />
          </div>
        );
      case "final-cta":
        return (
          <div key={index} id={sectionId} className="transition-all duration-300">
            <FinalCTASection
              content={section.content}
              onUpdate={updateSection}
              isEditing={editingSection === index}
            />
          </div>
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
      <style>{`
        .live-preview-container h1, 
        .live-preview-container h2, 
        .live-preview-container h3 {
          font-weight: ${currentStyle.typography.headingWeight};
          font-size: calc(1em * ${currentStyle.typography.headingSize});
          font-family: ${currentStyle.typography.headingFont};
        }
        .live-preview-container section {
          padding-top: calc(${currentStyle.spacing.sectionPadding} * 0.75);
          padding-bottom: calc(${currentStyle.spacing.sectionPadding} * 0.75);
        }
        .live-preview-container .btn-primary,
        .live-preview-container button[type="submit"],
        .live-preview-container a[href="#signup"] {
          background: hsl(var(--style-primary)) !important;
          color: white !important;
          border-radius: var(--style-radius) !important;
          box-shadow: var(--style-shadow);
          transition: all 0.3s ease;
        }
        .live-preview-container .btn-primary:hover,
        .live-preview-container button[type="submit"]:hover {
          transform: ${currentStyle.effects.hover};
        }
        .live-preview-container .card,
        .live-preview-container [class*="rounded"] {
          border-radius: var(--style-radius);
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
    </div>
  );
}
