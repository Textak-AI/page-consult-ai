import { AlertCircle, CheckCircle } from "lucide-react";

interface CitedStat {
  statistic: string;
  claim: string;
  source: string;
  year: number;
  fullCitation: string;
}

interface ProblemSolutionSectionProps {
  content: {
    problem: string;
    solution: string;
    problemStat?: CitedStat;
    solutionStat?: CitedStat;
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
            
            {content.problemStat && (
              <div className="mt-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div className="text-2xl font-bold text-destructive mb-1">
                  {content.problemStat.statistic}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {content.problemStat.claim}
                </p>
                <cite className="text-xs text-muted-foreground/70 not-italic block">
                  Source: {content.problemStat.fullCitation}
                </cite>
              </div>
            )}
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
            
            {content.solutionStat && (
              <div className="mt-4 p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
                <div className="text-2xl font-bold text-secondary mb-1">
                  {content.solutionStat.statistic}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {content.solutionStat.claim}
                </p>
                <cite className="text-xs text-muted-foreground/70 not-italic block">
                  Source: {content.solutionStat.fullCitation}
                </cite>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
