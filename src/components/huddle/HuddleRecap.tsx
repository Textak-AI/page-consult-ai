import { useEffect, useState } from 'react';

interface HuddleRecapProps {
  text: string;
}

export function HuddleRecap({ text }: HuddleRecapProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!text) return;

    let index = 0;
    setDisplayedText('');
    setIsTyping(true);

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-purple-900/20 to-violet-900/20 rounded-xl p-6 border border-purple-500/20">
        <p className="text-lg text-gray-200 leading-relaxed">
          "{displayedText}
          {isTyping && <span className="text-purple-400 animate-pulse">|</span>}"
        </p>
      </div>
    </div>
  );
}
