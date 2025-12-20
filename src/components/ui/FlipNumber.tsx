import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlipNumberProps {
  value: number;
  className?: string;
}

export function FlipNumber({ value, className = '' }: FlipNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const digits = String(displayValue).padStart(2, '0').split('');

  return (
    <div className={`flex ${className}`}>
      {digits.map((digit, index) => (
        <div
          key={index}
          className="relative w-[1ch] overflow-hidden"
        >
          <AnimatePresence mode="popLayout">
            <motion.span
              key={digit}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="inline-block"
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
