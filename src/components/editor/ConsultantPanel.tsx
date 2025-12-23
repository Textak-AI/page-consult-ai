import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Pencil, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CopySuggestion, SECTION_LABELS, IMPACT_STYLES } from '@/lib/consultantSuggestions';
import { toast } from 'sonner';

interface ConsultantPanelProps {
  isOpen: boolean;
  summary: string;
  suggestions: CopySuggestion[];
  onAccept: (id: string, value: string) => void;
  onSkip: (id: string) => void;
  onAcceptAll: () => void;
  onDismiss: () => void;
}

export function ConsultantPanel({
  isOpen,
  summary,
  suggestions,
  onAccept,
  onSkip,
  onAcceptAll,
  onDismiss
}: ConsultantPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const hasAccepted = suggestions.some(s => s.status === 'accepted' || s.status === 'modified');

  // Show toast when panel first opens with suggestions
  useEffect(() => {
    if (isOpen && suggestions.length > 0 && !hasShownToast) {
      toast(
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Strategic insights available</span>
        </div>,
        { duration: 3000 }
      );
      setHasShownToast(true);
    }
    if (!isOpen) {
      setHasShownToast(false);
    }
  }, [isOpen, suggestions.length, hasShownToast]);

  const handleStartEdit = (suggestion: CopySuggestion) => {
    setEditingId(suggestion.id);
    setEditValue(suggestion.suggestedValue);
  };

  const handleSaveEdit = (id: string) => {
    onAccept(id, editValue);
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-4 top-20 w-96 max-h-[calc(100vh-6rem)] bg-background border border-border rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-purple-500/10 to-blue-500/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Strategic Insights</h3>
                  <p className="text-xs text-muted-foreground">
                    {pendingSuggestions.length} suggestion{pendingSuggestions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8"
                >
                  {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDismiss}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Summary */}
              <div className="p-4 border-b bg-muted/30">
                <p className="text-sm text-foreground leading-relaxed">{summary}</p>
              </div>

              {/* Suggestions */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {suggestions.map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      suggestion.status === 'accepted' && "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700",
                      suggestion.status === 'skipped' && "opacity-50",
                      suggestion.status === 'pending' && "bg-card hover:border-purple-300"
                    )}
                  >
                    {/* Section label + impact badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {SECTION_LABELS[suggestion.section] || suggestion.section} → {suggestion.field}
                      </span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border", IMPACT_STYLES[suggestion.impact])}>
                        {suggestion.impact} impact
                      </span>
                    </div>

                    {/* Current vs Suggested */}
                    {editingId === suggestion.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm min-h-[80px]"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveEdit(suggestion.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2 mb-3">
                          <div className="text-sm">
                            <span className="text-muted-foreground line-through">{suggestion.currentValue}</span>
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            {suggestion.suggestedValue}
                          </div>
                        </div>

                        {/* Reasoning */}
                        <p className="text-sm text-muted-foreground mb-3 italic">
                          "{suggestion.reasoning}"
                        </p>

                        {/* Actions */}
                        {suggestion.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => onAccept(suggestion.id, suggestion.suggestedValue)}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartEdit(suggestion)}
                            >
                              <Pencil className="w-3 h-3 mr-1" />
                              Modify
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onSkip(suggestion.id)}
                            >
                              Skip
                            </Button>
                          </div>
                        )}

                        {suggestion.status === 'accepted' && (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                            <Check className="w-4 h-4" />
                            Applied
                          </div>
                        )}

                        {suggestion.status === 'skipped' && (
                          <div className="text-sm text-muted-foreground">
                            Skipped
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-muted/30 flex justify-between">
                <Button variant="ghost" onClick={onDismiss}>
                  Dismiss All
                </Button>
                {pendingSuggestions.length > 0 && (
                  <Button onClick={onAcceptAll} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Check className="w-4 h-4 mr-2" />
                    Accept All ({pendingSuggestions.length})
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Minimized state */}
          {isMinimized && (
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {pendingSuggestions.length} pending · {hasAccepted ? 'Changes applied' : 'Review suggestions'}
              </span>
              <Button size="sm" variant="ghost" onClick={() => setIsMinimized(false)}>
                Expand
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
