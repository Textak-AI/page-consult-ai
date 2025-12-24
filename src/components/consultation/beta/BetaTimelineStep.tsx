import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Calendar,
  Clock,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TimelineOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  showDatePicker?: boolean;
}

export type TimelineId = 
  | 'specific' 
  | 'q1-2026' 
  | 'q2-2026' 
  | 'q3-2026' 
  | 'q4-2026' 
  | 'tbd';

const TIMELINE_OPTIONS: TimelineOption[] = [
  { id: 'specific', label: 'Specific date', icon: Calendar, showDatePicker: true },
  { id: 'q1-2026', label: 'Q1 2026', icon: Clock },
  { id: 'q2-2026', label: 'Q2 2026', icon: Clock },
  { id: 'q3-2026', label: 'Q3 2026', icon: Clock },
  { id: 'q4-2026', label: 'Q4 2026', icon: Clock },
  { id: 'tbd', label: "When it's ready", icon: HelpCircle },
];

interface Props {
  value: string | null;
  specificDate: Date | null;
  onChange: (timeline: string) => void;
  onDateChange: (date: Date | null) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function BetaTimelineStep({ 
  value, 
  specificDate, 
  onChange, 
  onDateChange, 
  onContinue, 
  onBack 
}: Props) {
  const selectedOption = TIMELINE_OPTIONS.find(opt => opt.id === value);
  const showDatePicker = selectedOption?.showDatePicker;
  
  const canProceed = value && (value !== 'specific' || specificDate);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          When do you plan to launch?
        </h2>
        <p className="text-slate-400">
          We'll create countdown urgency based on your timeline
        </p>
      </div>

      {/* Timeline Grid - 2x3 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {TIMELINE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.id;

          return (
            <motion.button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={cn(
                "relative p-4 rounded-xl border-2 text-center transition-all",
                isSelected
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-slate-700 hover:border-slate-500 bg-slate-800/50"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon className={cn(
                  "w-4 h-4",
                  isSelected ? "text-cyan-400" : "text-slate-400"
                )} />
                <span className={cn(
                  "font-medium",
                  isSelected ? "text-cyan-400" : "text-white"
                )}>
                  {option.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Conditional Date Picker */}
      {showDatePicker && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex justify-center"
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] justify-start text-left font-normal border-slate-700 bg-slate-800/50",
                  !specificDate && "text-slate-400"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {specificDate ? format(specificDate, "PPP") : "Pick your launch date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="center">
              <CalendarComponent
                mode="single"
                selected={specificDate || undefined}
                onSelect={(date) => onDateChange(date || null)}
                disabled={(date) => date < new Date()}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </motion.div>
      )}
    </div>
  );
}

export { TIMELINE_OPTIONS };
