/**
 * Immersive AI Working Visualization
 * Three-layer structure: scrolling code, frosted glass, loading UI
 */

import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const codeLines = [
  "analyzing target audience psychographics...",
  "extracting competitive differentiation...",
  "mapping objection handling framework...",
  "generating headline variations...",
  "synthesizing proof points...",
  "building page structure...",
  "calibrating tone guidelines...",
  "finalizing brief...",
];

const statusMessages = [
  "Analyzing your inputs...",
  "Researching your market...",
  "Crafting recommendations...",
  "Generating headlines...",
  "Finalizing your brief...",
];

const xPositions = ['10%', '25%', '40%', '60%', '75%'];

interface CodeLine {
  id: number;
  text: string;
  x: string;
  startTime: number;
}

interface AIWorkingLoaderProps {
  onComplete?: () => void;
}

export function AIWorkingLoader({ onComplete }: AIWorkingLoaderProps) {
  const [codeLinesList, setCodeLinesList] = useState<CodeLine[]>([]);
  const [statusIndex, setStatusIndex] = useState(0);
  const [statusVisible, setStatusVisible] = useState(true);
  const nextIdRef = useRef(0);
  const lineIndexRef = useRef(0);

  // Add new code lines periodically
  useEffect(() => {
    const addLine = () => {
      const newLine: CodeLine = {
        id: nextIdRef.current++,
        text: codeLines[lineIndexRef.current % codeLines.length],
        x: xPositions[Math.floor(Math.random() * xPositions.length)],
        startTime: Date.now(),
      };
      lineIndexRef.current++;
      setCodeLinesList(prev => [...prev, newLine]);
    };

    // Add initial lines
    for (let i = 0; i < 5; i++) {
      setTimeout(() => addLine(), i * 200);
    }

    // Add new line every 600ms
    const interval = setInterval(addLine, 600);
    
    return () => clearInterval(interval);
  }, []);

  // Clean up old lines
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setCodeLinesList(prev => prev.filter(line => now - line.startTime < 8000));
    }, 1000);

    return () => clearInterval(cleanup);
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
      {/* LAYER 1: CODE BACKGROUND */}
      <div className="absolute inset-0 bg-slate-950 z-0">
        {codeLinesList.map((line) => (
          <div
            key={line.id}
            className="absolute font-mono text-sm text-cyan-400 whitespace-nowrap animate-scroll-up"
            style={{
              left: line.x,
              bottom: '-20px',
              animationDuration: '8s',
              animationTimingFunction: 'linear',
              animationFillMode: 'forwards',
            }}
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* LAYER 2: FROSTED GLASS OVERLAY */}
      <div 
        className="fixed inset-0 z-10 bg-slate-900/40"
        style={{
          backdropFilter: 'blur(64px)',
          WebkitBackdropFilter: 'blur(64px)',
        }}
      />

      {/* LAYER 3: LOADING UI */}
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

      {/* CSS for scroll animation */}
      <style>{`
        @keyframes scroll-up {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          5% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-100vh);
            opacity: 0;
          }
        }
        .animate-scroll-up {
          animation: scroll-up 8s linear forwards;
        }
      `}</style>
    </div>
  );
}

export default AIWorkingLoader;
