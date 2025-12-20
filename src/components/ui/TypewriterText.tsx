import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypewriterText({ 
  text, 
  speed = 50, 
  delay = 0,
  className = '',
  onComplete 
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        onComplete?.();
        setTimeout(() => setShowCursor(false), 2000);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed, started, onComplete]);

  return (
    <span className={className}>
      {displayed}
      {showCursor && (
        <span className="animate-pulse ml-0.5 text-cyan-400">|</span>
      )}
    </span>
  );
}
