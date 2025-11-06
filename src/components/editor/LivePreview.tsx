import { HeroSection } from "@/components/sections/HeroSection";
import { ProblemSolutionSection } from "@/components/sections/ProblemSolutionSection";
import { CalculatorSection } from "@/components/sections/CalculatorSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { SocialProofSection } from "@/components/sections/SocialProofSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { PhotoGallerySection } from "@/components/sections/PhotoGallerySection";
import { useEditing } from "@/contexts/EditingContext";
import { EditingToolbar } from "@/components/editor/EditingToolbar";

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
  const { editingSection, setEditingSection, isEditing } = useEditing();

  const handleSaveEdit = () => {
    setEditingSection(null);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
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
        return (
          <HeroSection
            key={index}
            content={section.content}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "problem-solution":
        return (
          <ProblemSolutionSection
            key={index}
            content={section.content}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "calculator":
        return (
          <CalculatorSection
            key={index}
            content={section.content}
            onUpdate={updateSection}
          />
        );
      case "features":
        return (
          <FeaturesSection
            key={index}
            content={section.content}
            onUpdate={updateSection}
          />
        );
      case "photo-gallery":
        return (
          <PhotoGallerySection
            key={index}
            content={section.content}
            onUpdate={updateSection}
            isEditing={editingSection === index}
          />
        );
      case "social-proof":
        return (
          <SocialProofSection
            key={index}
            content={section.content}
            onUpdate={updateSection}
          />
        );
      case "final-cta":
        return (
          <FinalCTASection
            key={index}
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
    <div className="flex-1 bg-muted/30 overflow-y-auto">
      {isEditing && (
        <EditingToolbar onSave={handleSaveEdit} onCancel={handleCancelEdit} />
      )}
      <div className="min-h-full bg-background">
        {sections
          .sort((a, b) => a.order - b.order)
          .map((section, index) => renderSection(section, index))}
      </div>
    </div>
  );
}
