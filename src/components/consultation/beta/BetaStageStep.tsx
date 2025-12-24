import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Hammer, 
  FlaskConical, 
  Users, 
  Globe, 
  Rocket
} from 'lucide-react';
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
          This helps us craft the right messaging
        </p>
      </div>

      {/* Stage Grid - 2x3 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {LAUNCH_STAGES.map((stage) => {
          const Icon = stage.icon;
          const isSelected = value === stage.id;

          return (
            <motion.button
              key={stage.id}
              onClick={() => onChange(stage.id)}
              className={cn(
                "relative p-5 rounded-xl border-2 text-center transition-all flex flex-col items-center",
                isSelected
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-slate-700 hover:border-slate-500 bg-slate-800/50"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Circular icon container */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                isSelected ? "bg-cyan-500/20" : "bg-slate-700"
              )}>
                <Icon className={cn(
                  "w-6 h-6",
                  isSelected ? "text-cyan-400" : "text-slate-400"
                )} />
              </div>
              
              {/* Title centered below icon */}
              <h3 className="font-semibold text-white text-sm mb-1">{stage.title}</h3>
              
              {/* Description in smaller text */}
              <p className="text-xs text-slate-400 leading-tight">{stage.description}</p>
            </motion.button>
          );
        })}
      </div>

    </div>
  );
}

export { LAUNCH_STAGES };
