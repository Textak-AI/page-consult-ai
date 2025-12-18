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

  // Generate style-specific CSS based on preset
  const getStyleCSS = () => {
    const style = currentStyle;
    
    // Style-specific color and effect overrides
    const styleOverrides: Record<string, string> = {
      premium: `
        /* Premium: Dark theme with cyan accents */
        .live-preview-container section:first-child {
          background: linear-gradient(135deg, hsl(222, 47%, 11%), hsl(222, 47%, 15%), hsl(222, 47%, 11%)) !important;
        }
        .live-preview-container section:not(:first-child) {
          background: hsl(222, 47%, 11%) !important;
        }
        .live-preview-container section:nth-child(even):not(:first-child) {
          background: hsl(222, 30%, 14%) !important;
        }
        .live-preview-container h1, .live-preview-container h2, .live-preview-container h3,
        .live-preview-container p, .live-preview-container span, .live-preview-container div {
          color: white !important;
        }
        .live-preview-container .text-slate-600, .live-preview-container .text-slate-700,
        .live-preview-container .text-gray-600, .live-preview-container .text-gray-700 {
          color: hsl(215, 20%, 75%) !important;
        }
        .live-preview-container button {
          background: linear-gradient(135deg, hsl(189, 95%, 43%), hsl(189, 95%, 38%)) !important;
          color: white !important;
          border-radius: 0.75rem !important;
          box-shadow: 0 10px 30px -10px hsl(189, 95%, 43%, 0.4) !important;
        }
        .live-preview-container button:hover {
          transform: translateY(-2px) !important;
        }
        .live-preview-container [class*="bg-white"], .live-preview-container [class*="bg-slate-50"] {
          background: hsl(222, 30%, 18%) !important;
          border-color: hsl(222, 30%, 25%) !important;
        }
        .live-preview-container [class*="rounded"] {
          border-radius: 1rem !important;
        }
        .live-preview-container [class*="from-cyan"], .live-preview-container [class*="to-cyan"],
        .live-preview-container [class*="text-cyan"] {
          --tw-gradient-from: hsl(189, 95%, 43%) !important;
          --tw-gradient-to: hsl(264, 83%, 62%) !important;
        }
      `,
      minimal: `
        /* Minimal: Clean white with gray accents */
        .live-preview-container section {
          background: white !important;
        }
        .live-preview-container section:nth-child(even) {
          background: hsl(0, 0%, 98%) !important;
        }
        .live-preview-container h1, .live-preview-container h2, .live-preview-container h3 {
          color: hsl(0, 0%, 10%) !important;
        }
        .live-preview-container p, .live-preview-container span:not([class*="text-white"]) {
          color: hsl(0, 0%, 30%) !important;
        }
        .live-preview-container button {
          background: hsl(0, 0%, 10%) !important;
          color: white !important;
          border-radius: 0.375rem !important;
          box-shadow: 0 1px 3px hsl(0, 0%, 0%, 0.1) !important;
        }
        .live-preview-container button:hover {
          background: hsl(0, 0%, 20%) !important;
        }
        .live-preview-container [class*="bg-gradient"], .live-preview-container [class*="from-slate-900"] {
          background: white !important;
        }
        .live-preview-container [class*="rounded"] {
          border-radius: 0.5rem !important;
        }
        .live-preview-container [class*="shadow"] {
          box-shadow: 0 1px 3px hsl(0, 0%, 0%, 0.08) !important;
        }
        .live-preview-container [class*="border"] {
          border-color: hsl(0, 0%, 90%) !important;
        }
        .live-preview-container [class*="from-cyan"], .live-preview-container [class*="bg-cyan"] {
          background: hsl(0, 0%, 10%) !important;
        }
      `,
      bold: `
        /* Bold: Black with yellow accents */
        .live-preview-container section {
          background: black !important;
        }
        .live-preview-container h1, .live-preview-container h2, .live-preview-container h3 {
          color: white !important;
          font-weight: 900 !important;
        }
        .live-preview-container p, .live-preview-container span:not([class*="text-white"]) {
          color: hsl(0, 0%, 80%) !important;
        }
        .live-preview-container button {
          background: hsl(48, 96%, 53%) !important;
          color: black !important;
          border-radius: 0 !important;
          font-weight: 800 !important;
          box-shadow: 0 0 40px hsl(48, 96%, 53%, 0.4) !important;
        }
        .live-preview-container button:hover {
          transform: translateY(-4px) scale(1.02) !important;
        }
        .live-preview-container [class*="bg-white"], .live-preview-container [class*="bg-slate-50"],
        .live-preview-container [class*="bg-slate-900"], .live-preview-container [class*="bg-gradient"] {
          background: black !important;
          border: 2px solid hsl(48, 96%, 53%) !important;
        }
        .live-preview-container [class*="rounded"] {
          border-radius: 0 !important;
        }
        .live-preview-container [class*="from-cyan"], .live-preview-container [class*="bg-cyan"],
        .live-preview-container [class*="text-cyan"] {
          background: hsl(48, 96%, 53%) !important;
          color: black !important;
          -webkit-text-fill-color: black !important;
        }
        .live-preview-container [class*="shadow"] {
          box-shadow: 0 0 30px hsl(48, 96%, 53%, 0.3) !important;
        }
      `,
      elegant: `
        /* Elegant: Warm cream with amber accents */
        .live-preview-container section {
          background: hsl(43, 13%, 98%) !important;
        }
        .live-preview-container section:first-child {
          background: linear-gradient(135deg, hsl(43, 13%, 96%), hsl(36, 33%, 95%)) !important;
        }
        .live-preview-container section:nth-child(even):not(:first-child) {
          background: hsl(43, 13%, 95%) !important;
        }
        .live-preview-container h1, .live-preview-container h2, .live-preview-container h3 {
          color: hsl(25, 40%, 25%) !important;
          font-family: 'Playfair Display', serif !important;
          font-weight: 400 !important;
        }
        .live-preview-container p, .live-preview-container span:not([class*="text-white"]) {
          color: hsl(25, 20%, 35%) !important;
        }
        .live-preview-container button {
          background: linear-gradient(135deg, hsl(36, 55%, 45%), hsl(36, 55%, 40%)) !important;
          color: white !important;
          border-radius: 0.25rem !important;
          box-shadow: 0 4px 20px hsl(0, 0%, 0%, 0.1) !important;
        }
        .live-preview-container button:hover {
          transform: translateY(-2px) !important;
        }
        .live-preview-container [class*="bg-white"], .live-preview-container [class*="bg-slate-50"],
        .live-preview-container [class*="bg-gradient"] {
          background: white !important;
          border-color: hsl(36, 20%, 85%) !important;
        }
        .live-preview-container [class*="rounded"] {
          border-radius: 0.25rem !important;
        }
        .live-preview-container [class*="from-cyan"], .live-preview-container [class*="bg-cyan"],
        .live-preview-container [class*="text-cyan"] {
          background: hsl(36, 55%, 50%) !important;
          -webkit-text-fill-color: hsl(36, 55%, 45%) !important;
        }
      `,
    };

    return styleOverrides[pageStyle] || styleOverrides.premium;
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
        /* Base typography from style preset */
        .live-preview-container h1, 
        .live-preview-container h2, 
        .live-preview-container h3 {
          font-weight: ${currentStyle.typography.headingWeight};
          font-size: calc(1em * ${currentStyle.typography.headingSize});
          font-family: ${currentStyle.typography.headingFont}, system-ui, sans-serif;
        }
        .live-preview-container section {
          padding-top: calc(${currentStyle.spacing.sectionPadding} * 0.75);
          padding-bottom: calc(${currentStyle.spacing.sectionPadding} * 0.75);
          transition: background-color 0.5s ease, color 0.3s ease;
        }
        
        /* Style-specific overrides */
        ${getStyleCSS()}
        
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
