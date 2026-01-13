interface HuddleGapCalloutProps {
  field: string;
  prompt: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function HuddleGapCallout({ prompt, placeholder, value, onChange }: HuddleGapCalloutProps) {
  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-violet-900/30 rounded-lg p-5 border border-purple-500/30 mb-6">
      <div className="flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div className="flex-1">
          <p className="text-white font-medium mb-3">
            Strengthen your page
          </p>
          <p className="text-gray-300 text-sm mb-3">
            {prompt}
          </p>
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#1a1a2e] border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
