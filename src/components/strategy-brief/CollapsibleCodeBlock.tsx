import { useState } from 'react';
import { ChevronDown, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapsibleCodeBlockProps {
  children: React.ReactNode;
  title?: string;
  defaultOpen?: boolean;
}

export function CollapsibleCodeBlock({ 
  children, 
  title = 'View Code',
  defaultOpen = false 
}: CollapsibleCodeBlockProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg overflow-hidden my-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-muted/50 
                   hover:bg-muted transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
