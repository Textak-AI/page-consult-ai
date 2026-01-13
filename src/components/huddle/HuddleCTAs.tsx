import { Loader2 } from 'lucide-react';

interface HuddleCTAsProps {
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  loading?: boolean;
}

export function HuddleCTAs({ primaryLabel, secondaryLabel, onPrimary, onSecondary, loading }: HuddleCTAsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      {secondaryLabel && onSecondary && (
        <button
          onClick={onSecondary}
          disabled={loading}
          className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50"
        >
          {secondaryLabel}
        </button>
      )}
      <button
        onClick={onPrimary}
        disabled={loading}
        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg text-white font-medium hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {primaryLabel} →
      </button>
    </div>
  );
}
