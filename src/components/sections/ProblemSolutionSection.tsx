import { AlertCircle, CheckCircle } from "lucide-react";

interface ProblemSolutionSectionProps {
  content: {
    problem: string;
    solution: string;
  };
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export function ProblemSolutionSection({ content, onUpdate, isEditing }: ProblemSolutionSectionProps) {
  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({
      ...content,
      [field]: e.currentTarget.textContent || content[field as keyof typeof content],
    });
  };

  return (
    <section className={`py-16 px-4 ${isEditing ? "relative" : ""}`}>
      {isEditing && (
        <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none z-10" />
      )}
      <div className="container mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4 p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-xl font-bold">The Problem</h3>
            </div>
            <p 
              className={`text-muted-foreground ${
                isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("problem", e)}
            >
              {content.problem}
            </p>
          </div>

          <div className="space-y-4 p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-secondary">
              <CheckCircle className="w-6 h-6" />
              <h3 className="text-xl font-bold">Our Solution</h3>
            </div>
            <p 
              className={`text-muted-foreground ${
                isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("solution", e)}
            >
              {content.solution}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
