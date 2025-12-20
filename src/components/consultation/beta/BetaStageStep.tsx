import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Hammer, 
  FlaskConical, 
  Users, 
  Globe, 
  Rocket,
  Check,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LaunchStage {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export type LaunchStageId = 
  | 'idea' 
  | 'building' 
  | 'alpha' 
  | 'private-beta' 
  | 'public-beta' 
  | 'pre-launch';

const LAUNCH_STAGES: LaunchStage[] = [
  { id: 'idea', icon: Lightbulb, title: 'Idea / Concept', description: 'No product yet, validating the concept' },
  { id: 'building', icon: Hammer, title: 'Building', description: 'Product is in active development' },
  { id: 'alpha', icon: FlaskConical, title: 'Alpha', description: 'Internal testing with team/friends' },
  { id: 'private-beta', icon: Users, title: 'Private Beta', description: 'Limited external users testing' },
  { id: 'public-beta', icon: Globe, title: 'Public Beta', description: 'Open signups, still iterating' },
  { id: 'pre-launch', icon: Rocket, title: 'Pre-Launch', description: 'Ready to go, building hype' },
];

interface Props {
  value: string | null;
  onChange: (stage: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function BetaStageStep({ value, onChange, onContinue, onBack }: Props) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          What stage is your product?
        </h2>
        <p className="text-slate-400">
          This helps us tailor your messaging and call-to-action
        </p>
      </div>

      {/* Stage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {LAUNCH_STAGES.map((stage) => {
          const Icon = stage.icon;
          const isSelected = value === stage.id;

          return (
            <motion.button
              key={stage.id}
              onClick={() => onChange(stage.id)}
              className={cn(
                "relative p-5 rounded-xl border-2 text-left transition-all",
                isSelected
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-slate-700 hover:border-slate-500 bg-slate-800/50"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2.5 rounded-lg",
                  isSelected ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-700 text-slate-400"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm">{stage.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{stage.description}</p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} className="text-slate-400">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={onContinue} disabled={!value} className="bg-cyan-500 hover:bg-cyan-600">
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

export { LAUNCH_STAGES };
