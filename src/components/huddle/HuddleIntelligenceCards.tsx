import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Card {
  id: string;
  label: string;
  value: string;
  confidence: 'high' | 'medium' | 'low';
  notePrompt: string;
}

interface HuddleIntelligenceCardsProps {
  cards: Card[];
  notes: Record<string, string>;
  onNoteChange: (cardId: string, note: string) => void;
}

export function HuddleIntelligenceCards({ cards, notes, onNoteChange }: HuddleIntelligenceCardsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConfidenceWidth = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'w-full';
      case 'medium': return 'w-2/3';
      case 'low': return 'w-1/3';
      default: return 'w-0';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {cards.map((card) => (
        <div 
          key={card.id}
          className="bg-[#1a1a2e] rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {card.label}
            </span>
            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getConfidenceColor(card.confidence)} ${getConfidenceWidth(card.confidence)} transition-all`}
              />
            </div>
          </div>

          <p className="text-white font-medium mb-3 line-clamp-2">
            {card.value || <span className="text-gray-500 italic">Not captured</span>}
          </p>

          {/* Note section */}
          {notes[card.id] ? (
            <div className="bg-purple-900/20 rounded p-2 border border-purple-500/20">
              <p className="text-sm text-purple-200">📝 {notes[card.id]}</p>
              <button 
                onClick={() => setExpandedCard(card.id)}
                className="text-xs text-purple-400 mt-1 hover:text-purple-300"
              >
                Edit note
              </button>
            </div>
          ) : (
            <button
              onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              + Add a note
              {expandedCard === card.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {/* Expanded note input */}
          {expandedCard === card.id && (
            <div className="mt-3">
              <textarea
                placeholder={card.notePrompt}
                value={notes[card.id] || ''}
                onChange={(e) => onNoteChange(card.id, e.target.value)}
                className="w-full bg-[#0d0d1a] border border-gray-600 rounded p-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                rows={2}
                maxLength={280}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">
                  {(notes[card.id] || '').length}/280
                </span>
                <button 
                  onClick={() => setExpandedCard(null)}
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
