import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Edit2, Sparkles, AlertCircle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Gap {
  field: string;
  message: string;
  guidance: string;
}

interface Props {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack?: () => void;
  inputType?: 'text' | 'textarea';
  placeholder?: string;
  gap?: Gap;
  isAIPrefilled?: boolean;
  required?: boolean;
}

export function PrefilledWizardStep({
  label,
  description,
  value,
  onChange,
  onNext,
  onBack,
  inputType = 'textarea',
  placeholder,
  gap,
  isAIPrefilled = false,
  required = false,
}: Props) {
  const [isEditing, setIsEditing] = useState(!value);
  const [showGuidance, setShowGuidance] = useState(false);

  const canProceed = !required || value.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">{label}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* AI Pre-filled indicator */}
        {isAIPrefilled && value && !isEditing && (
          <div className="flex items-center gap-2 text-sm text-purple-400">
            <Sparkles className="w-4 h-4" />
            Pre-filled from your website — review and edit if needed
          </div>
        )}

        {/* Value display or edit */}
        {isEditing ? (
          <div className="space-y-3">
            {inputType === 'textarea' ? (
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="min-h-[150px] text-base"
                autoFocus
              />
            ) : (
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="text-base"
                autoFocus
              />
            )}
            
            {value && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                <Check className="w-4 h-4 mr-1" />
                Done editing
              </Button>
            )}
          </div>
        ) : value ? (
          <div 
            className={cn(
              "p-4 rounded-lg border bg-card",
              isAIPrefilled && "border-purple-500/30 bg-purple-500/5"
            )}
          >
            <ScrollArea className="max-h-[200px]">
              <p className="text-base whitespace-pre-wrap">{value}</p>
            </ScrollArea>
            
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-muted-foreground"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/5">
            {gap ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">{gap.message}</span>
                </div>
                
                {gap.guidance && (
                  <>
                    <button
                      className="flex items-center gap-1 text-sm text-amber-400/80 hover:text-amber-400"
                      onClick={() => setShowGuidance(!showGuidance)}
                    >
                      <Lightbulb className="w-3 h-3" />
                      How to get this
                      {showGuidance ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    
                    {showGuidance && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="p-3 bg-amber-500/10 rounded text-sm text-amber-200/80 whitespace-pre-wrap"
                      >
                        {gap.guidance}
                      </motion.div>
                    )}
                  </>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Add {label.toLowerCase()}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground mb-3">No {label.toLowerCase()} found</p>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-3 h-3 mr-1" />
                  Add it now
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={onNext}
          disabled={!canProceed}
        >
          {value ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Looks Good
            </>
          ) : required ? (
            'Please fill this in'
          ) : (
            'Skip for now'
          )}
        </Button>
      </div>
    </motion.div>
  );
}
