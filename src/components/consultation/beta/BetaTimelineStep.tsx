import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  CalendarIcon,
  Check,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TimelineOption {
  id: string;
  label: string;
  showDatePicker?: boolean;
}

export type TimelineId = 
  | 'specific' 
  | 'q1-2025' 
  | 'q2-2025' 
  | 'q3-2025' 
  | 'q4-2025' 
  | 'tbd';

const TIMELINE_OPTIONS: TimelineOption[] = [
  { id: 'specific', label: 'Specific date', showDatePicker: true },
  { id: 'q1-2025', label: 'Q1 2025' },
  { id: 'q2-2025', label: 'Q2 2025' },
  { id: 'q3-2025', label: 'Q3 2025' },
  { id: 'q4-2025', label: 'Q4 2025' },
  { id: 'tbd', label: "When it's ready" },
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
          When are you planning to launch?
        </h2>
        <p className="text-slate-400">
          This helps set expectations and create urgency
        </p>
      </div>

      {/* Timeline Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {TIMELINE_OPTIONS.map((option) => {
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
                <span className={cn(
                  "font-medium",
                  isSelected ? "text-cyan-400" : "text-white"
                )}>
                  {option.label}
                </span>
                {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
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
                <CalendarIcon className="mr-2 h-4 w-4" />
                {specificDate ? format(specificDate, "PPP") : "Pick your launch date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="center">
              <Calendar
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

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} className="text-slate-400">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button 
          onClick={onContinue} 
          disabled={!canProceed} 
          className="bg-cyan-500 hover:bg-cyan-600"
        >
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

export { TIMELINE_OPTIONS };
