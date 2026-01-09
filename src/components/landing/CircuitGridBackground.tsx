import { motion } from 'framer-motion';
import { useMemo } from 'react';

// Intelligence category colors
const LIGHT_COLORS = [
  { color: '#06b6d4', name: 'cyan' },    // WHO YOU ARE
  { color: '#8b5cf6', name: 'violet' },  // WHAT YOU OFFER
  { color: '#10b981', name: 'emerald' }, // BUYER REALITY
  { color: '#f59e0b', name: 'amber' },   // PROOF & CREDIBILITY
];

// Generate random path for a light to travel
const generatePath = (index: number, gridSize: number) => {
  const segments = 4 + Math.floor(Math.random() * 3); // 4-6 segments
  const xPath: number[] = [];
  const yPath: number[] = [];
  
  // Start from edge
  const startEdge = index % 4;
  let x = 0, y = 0;
  
  switch (startEdge) {
    case 0: x = 0; y = Math.floor(Math.random() * 6) * gridSize; break;
    case 1: x = Math.floor(Math.random() * 8) * gridSize; y = 0; break;
    case 2: x = 8 * gridSize; y = Math.floor(Math.random() * 6) * gridSize; break;
    case 3: x = Math.floor(Math.random() * 8) * gridSize; y = 6 * gridSize; break;
  }
  
  xPath.push(x);
  yPath.push(y);
  
  for (let i = 0; i < segments; i++) {
    const moveHorizontal = Math.random() > 0.5;
    if (moveHorizontal) {
      x += (Math.random() > 0.5 ? 1 : -1) * gridSize * (1 + Math.floor(Math.random() * 3));
      x = Math.max(0, Math.min(x, 8 * gridSize));
    } else {
      y += (Math.random() > 0.5 ? 1 : -1) * gridSize * (1 + Math.floor(Math.random() * 2));
      y = Math.max(0, Math.min(y, 6 * gridSize));
    }
    xPath.push(x);
    yPath.push(y);
  }
  
  return { xPath, yPath };
};

interface CircuitLightProps {
  color: string;
  duration: number;
  delay: number;
  index: number;
}

const CircuitLight = ({ color, duration, delay, index }: CircuitLightProps) => {
  const gridSize = 60;
  const paths = useMemo(() => generatePath(index, gridSize), [index]);
  
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{
        backgroundColor: color,
        boxShadow: `0 0 20px 8px ${color}40, 0 0 40px 16px ${color}20`,
      }}
      initial={{ opacity: 0, x: paths.xPath[0], y: paths.yPath[0] }}
      animate={{
        x: paths.xPath,
        y: paths.yPath,
        opacity: [0, 1, 1, 1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: 2,
        ease: "linear",
        times: [0, 0.05, 0.3, 0.7, 0.95, 1],
      }}
    />
  );
};

export function CircuitGridBackground() {
  const lights = useMemo(() => [
    { color: LIGHT_COLORS[0].color, duration: 10, delay: 0 },
    { color: LIGHT_COLORS[1].color, duration: 12, delay: 2.5 },
    { color: LIGHT_COLORS[2].color, duration: 11, delay: 5 },
    { color: LIGHT_COLORS[3].color, duration: 9, delay: 7.5 },
    { color: LIGHT_COLORS[0].color, duration: 13, delay: 10 },
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Static grid pattern */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
        <defs>
          <pattern id="circuit-grid-lines" width="60" height="60" patternUnits="userSpaceOnUse">
            <path 
              d="M 60 0 L 0 0 0 60" 
              fill="none" 
              stroke="white" 
              strokeWidth="1"
            />
          </pattern>
          {/* Node pattern - circles at some intersections */}
          <pattern id="circuit-nodes" width="120" height="120" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="2" fill="white" />
            <circle cx="60" cy="60" r="2.5" fill="white" />
            <circle cx="120" cy="0" r="2" fill="white" />
            <circle cx="0" cy="120" r="2" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-grid-lines)" />
        <rect width="100%" height="100%" fill="url(#circuit-nodes)" style={{ opacity: 0.5 }} />
      </svg>

      {/* Animated flowing lights */}
      <div className="absolute inset-0" style={{ padding: '60px' }}>
        {lights.map((light, i) => (
          <CircuitLight
            key={i}
            color={light.color}
            duration={light.duration}
            delay={light.delay}
            index={i}
          />
        ))}
      </div>

      {/* Ambient underglow - centered behind widget */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '700px',
          height: '500px',
          background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.08) 0%, rgba(6, 182, 212, 0.04) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
    </div>
  );
}
