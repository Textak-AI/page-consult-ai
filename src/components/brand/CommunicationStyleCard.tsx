import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Sparkles, Loader2 } from 'lucide-react';

interface CommunicationStyle {
  tone: { descriptors: string[]; primary: string };
  voice: { pov: string; addressesReader: boolean; sentenceStyle: string };
  vocabulary: { favoredWords: string[]; avoidedPatterns: string[] };
  formality: { level: number; description: string };
}

interface CommunicationStyleCardProps {
  style: CommunicationStyle | null;
  onEdit?: () => void;
  loading?: boolean;
}

export function CommunicationStyleCard({ style, onEdit, loading }: CommunicationStyleCardProps) {
  const getPovLabel = (pov: string) => {
    const labels: Record<string, string> = {
      'first_plural': 'We/Our',
      'first_singular': 'I/My',
      'second_person': 'You/Your',
      'third_person': 'Third Person'
    };
    return labels[pov] || pov;
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
          <span>Analyzing communication style...</span>
        </div>
      </div>
    );
  }

  if (!style) return null;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Communication Style</h3>
            <p className="text-sm text-slate-400">How your brand speaks</p>
          </div>
        </div>
        {onEdit && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEdit}
            className="text-slate-400 hover:text-white"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Tone */}
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Tone</p>
          <div className="flex flex-wrap gap-2">
            {style.tone.descriptors.map((desc, i) => (
              <Badge 
                key={i} 
                variant="secondary"
                className="bg-violet-500/20 text-violet-300 border-violet-500/30 hover:bg-violet-500/30"
              >
                {desc}
              </Badge>
            ))}
          </div>
        </div>

        {/* Voice */}
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Voice</p>
          <p className="text-slate-300 text-sm">
            {getPovLabel(style.voice.pov)}
            {style.voice.addressesReader && ' • Addresses reader directly'}
            {' • '}{style.voice.sentenceStyle} sentences
          </p>
        </div>

        {/* Vocabulary */}
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Vocabulary</p>
          <div className="space-y-1">
            {style.vocabulary.favoredWords.length > 0 && (
              <p className="text-sm text-emerald-400">
                💚 Uses: {style.vocabulary.favoredWords.slice(0, 5).join(', ')}
              </p>
            )}
            {style.vocabulary.avoidedPatterns.length > 0 && (
              <p className="text-sm text-slate-400">
                🚫 Avoids: {style.vocabulary.avoidedPatterns.slice(0, 3).join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Formality */}
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Formality</p>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-full ${
                    level <= style.formality.level 
                      ? 'bg-violet-500' 
                      : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-slate-300 text-sm">{style.formality.description}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
