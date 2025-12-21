/**
 * Floating Dev Button - Always visible in dev mode
 * Triggers the DevTestPanel
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Beaker, Palette } from 'lucide-react';
import { DevTestPanel } from './DevTestPanel';

/**
 * Check if we're in a dev environment
 * - localhost
 * - preview URLs (lovableproject.com)
 * - lovable.app domains
 * - Vite DEV mode
 */
function isDevEnvironment(): boolean {
  // Vite development mode
  if (import.meta.env.DEV) {
    return true;
  }
  
  const hostname = window.location.hostname;
  
  // localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return true;
  }
  
  // Preview URLs
  if (hostname.includes('lovableproject.com')) {
    return true;
  }
  
  // Lovable staging domains
  if (hostname.includes('lovable.app')) {
    return true;
  }
  
  // Check localStorage override (for testing on production)
  if (localStorage.getItem('dev_mode_override') === 'true') {
    return true;
  }
  
  return false;
}

export function DevFloatingButton() {
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    // Check dev environment on mount
    setIsDevMode(isDevEnvironment());

    // Keyboard shortcut: Cmd+Shift+D
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        if (isDevEnvironment()) {
          setIsPanelOpen(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Don't render anything if not in dev mode
  if (!isDevMode) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isPanelOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPanelOpen(true)}
            className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 shadow-lg shadow-black/25 hover:shadow-xl hover:border-cyan-500/50 transition-all duration-200 group"
            title="Open Dev Test Panel (⌘⇧D)"
          >
            <Beaker className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
            <span className="text-sm font-medium text-slate-200 group-hover:text-white">
              Dev Panel
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              ⌘⇧D
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Brand Settings Button */}
      <AnimatePresence>
        {!isPanelOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/settings/brand')}
            className="fixed bottom-20 left-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-800 to-purple-700 border border-purple-600 shadow-lg shadow-black/25 hover:shadow-xl hover:border-purple-400/50 transition-all duration-200 group"
            title="Brand Settings"
          >
            <Palette className="w-4 h-4 text-purple-300 group-hover:text-purple-200" />
            <span className="text-sm font-medium text-purple-200 group-hover:text-white">
              Brand
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Test Panel */}
      <DevTestPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
      />
    </>
  );
}

export default DevFloatingButton;
