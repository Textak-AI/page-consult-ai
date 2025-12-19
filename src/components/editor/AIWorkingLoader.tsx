/**
 * Immersive AI Working Visualization
 * Three-layer structure: scrolling code, frosted glass, loading UI
 */

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const codeLines = [
  "analyzing target audience psychographics...",
  "extracting competitive differentiation...",
  "mapping objection handling framework...",
  "cross-referencing market data...",
  "generating headline variations...",
  "synthesizing proof points...",
  "calibrating tone guidelines...",
  "building page structure...",
  "evaluating positioning strategy...",
  "finalizing strategic brief...",
];

const statusMessages = [
  "Analyzing your inputs...",
  "Researching your market...",
  "Crafting recommendations...",
  "Generating headlines...",
  "Finalizing your brief...",
];

const xPositions = ['5%', '20%', '45%', '70%', '15%', '55%', '35%', '80%'];

interface CodeLineData {
  id: number;
  text: string;
  x: string;
  delay: number;
}

interface AIWorkingLoaderProps {
  onComplete?: () => void;
}

export function AIWorkingLoader({ onComplete }: AIWorkingLoaderProps) {
  const [lines, setLines] = useState<CodeLineData[]>([]);
  const [statusIndex, setStatusIndex] = useState(0);
  const [statusVisible, setStatusVisible] = useState(true);

  // Initialize lines with staggered delays
  useEffect(() => {
    const initialLines: CodeLineData[] = [];
    for (let i = 0; i < 20; i++) {
      initialLines.push({
        id: i,
        text: codeLines[i % codeLines.length],
        x: xPositions[i % xPositions.length],
        delay: i * 0.5, // Stagger by 0.5s each
      });
    }
    setLines(initialLines);
  }, []);

  // Rotate status messages
  useEffect(() => {
    const rotateStatus = () => {
      setStatusVisible(false);
      setTimeout(() => {
        setStatusIndex(prev => (prev + 1) % statusMessages.length);
        setStatusVisible(true);
      }, 300);
    };

    const interval = setInterval(rotateStatus, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* LAYER 1: CODE BACKGROUND (z-0) */}
      <div className="fixed inset-0 bg-slate-950 z-0 overflow-hidden">
        {lines.map((line) => (
          <div
            key={line.id}
            className="absolute font-mono text-sm text-cyan-400 opacity-70 whitespace-nowrap"
            style={{
              left: line.x,
              animation: `float-up 10s linear infinite`,
              animationDelay: `${line.delay}s`,
            }}
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* LAYER 2: FROSTED GLASS OVERLAY (z-10) */}
      <div 
        className="fixed inset-0 z-10 bg-slate-900/30 backdrop-blur-xl"
      />

      {/* LAYER 3: LOADING UI (z-20) */}
      <div className="fixed inset-0 z-20 flex flex-col items-center justify-center">
        {/* Spinner */}
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        
        {/* Title */}
        <h2 className="text-xl font-semibold text-white mt-6">
          Building Your Strategy Brief...
        </h2>
        
        {/* Rotating status message */}
        <p 
          className={cn(
            "text-slate-400 text-sm mt-2 transition-opacity duration-300",
            statusVisible ? "opacity-100" : "opacity-0"
          )}
        >
          {statusMessages[statusIndex]}
        </p>
      </div>

      {/* CSS for float-up animation */}
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(100vh);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-100px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default AIWorkingLoader;
