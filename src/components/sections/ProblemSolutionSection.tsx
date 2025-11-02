import { AlertCircle, CheckCircle } from "lucide-react";

interface ProblemSolutionSectionProps {
  content: {
    problem: string;
    solution: string;
  };
  onUpdate: (content: any) => void;
}

export function ProblemSolutionSection({ content }: ProblemSolutionSectionProps) {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4 p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-xl font-bold">The Problem</h3>
            </div>
            <p className="text-muted-foreground">{content.problem}</p>
          </div>

          <div className="space-y-4 p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-secondary">
              <CheckCircle className="w-6 h-6" />
              <h3 className="text-xl font-bold">Our Solution</h3>
            </div>
            <p className="text-muted-foreground">{content.solution}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
