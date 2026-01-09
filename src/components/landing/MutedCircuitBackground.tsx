import { motion } from 'framer-motion';
import { useMemo, useEffect, useState } from 'react';

// Intelligence category colors - same as main but used at lower opacity
const LIGHT_COLORS = [
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#f59e0b', // amber
];

const GRID_SIZE = 60;

// Generate a path that follows grid lines exactly
const generateGridPath = (index: number, containerWidth: number, containerHeight: number) => {
  const cols = Math.floor(containerWidth / GRID_SIZE);
  const rows = Math.floor(containerHeight / GRID_SIZE);
  
  const keyframes: { x: number; y: number }[] = [];
  
  // Start from different edges based on index
  const startEdge = index % 4;
  let col = 0, row = 0;
  
  switch (startEdge) {
    case 0:
      col = 0;
      row = Math.floor(Math.random() * rows);
      break;
    case 1:
      col = Math.floor(Math.random() * cols);
      row = 0;
      break;
    case 2:
      col = cols - 1;
      row = Math.floor(Math.random() * rows);
      break;
    case 3:
      col = Math.floor(Math.random() * cols);
      row = rows - 1;
      break;
  }
  
  keyframes.push({ x: col * GRID_SIZE, y: row * GRID_SIZE });
  
  const segments = 5 + Math.floor(Math.random() * 4);
  let direction: 'horizontal' | 'vertical' = Math.random() > 0.5 ? 'horizontal' : 'vertical';
  
  for (let i = 0; i < segments; i++) {
    if (direction === 'horizontal') {
      const steps = 2 + Math.floor(Math.random() * 4);
      const moveRight = col < cols / 2 ? Math.random() > 0.3 : Math.random() > 0.7;
      col = moveRight 
        ? Math.min(col + steps, cols - 1)
        : Math.max(col - steps, 0);
    } else {
      const steps = 1 + Math.floor(Math.random() * 3);
      const moveDown = row < rows / 2 ? Math.random() > 0.3 : Math.random() > 0.7;
      row = moveDown
        ? Math.min(row + steps, rows - 1)
        : Math.max(row - steps, 0);
    }
    
    keyframes.push({ x: col * GRID_SIZE, y: row * GRID_SIZE });
    direction = direction === 'horizontal' ? 'vertical' : 'horizontal';
  }
  
  return keyframes;
};

interface MutedCircuitLightProps {
  color: string;
  duration: number;
  delay: number;
  index: number;
  containerWidth: number;
  containerHeight: number;
}

const MutedCircuitLight = ({ color, duration, delay, index, containerWidth, containerHeight }: MutedCircuitLightProps) => {
  const path = useMemo(
    () => generateGridPath(index, containerWidth, containerHeight),
    [index, containerWidth, containerHeight]
  );
  
  const xValues = path.map(p => p.x);
  const yValues = path.map(p => p.y);
  
  // Much lower opacity for muted version: 10-15%
  const opacityValues = path.map((_, i) => {
    if (i === 0) return 0;
    if (i === 1) return 0.12;
    if (i === path.length - 1) return 0;
    return 0.12;
  });
  
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: '4px',
        height: '4px',
        backgroundColor: color,
        boxShadow: `0 0 8px 2px ${color}20, 0 0 16px 4px ${color}10`,
      }}
      animate={{
        x: xValues,
        y: yValues,
        opacity: opacityValues,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: 4,
        ease: "linear",
      }}
    />
  );
};

export function MutedCircuitBackground() {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth * 0.6,
        height: window.innerHeight * 0.8,
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const lights = useMemo(() => [
    { color: LIGHT_COLORS[0], duration: 10, delay: 0 },
    { color: LIGHT_COLORS[1], duration: 12, delay: 3 },
    { color: LIGHT_COLORS[2], duration: 11, delay: 6 },
    { color: LIGHT_COLORS[3], duration: 13, delay: 9 },
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Static grid pattern - VERY subtle 2-3% opacity */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.025 }}>
        <defs>
          <pattern id="muted-circuit-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path 
              d="M 60 0 L 0 0 0 60" 
              fill="none" 
              stroke="white" 
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#muted-circuit-grid)" />
      </svg>
      
      {/* Nodes at intersections - very subtle */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.02 }}>
        <defs>
          <pattern id="muted-circuit-nodes" width="180" height="180" patternUnits="userSpaceOnUse">
            <circle cx="60" cy="60" r="1.5" fill="white" />
            <circle cx="120" cy="120" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#muted-circuit-nodes)" />
      </svg>

      {/* Animated flowing lights - muted version */}
      <div className="absolute inset-0">
        {lights.map((light, i) => (
          <MutedCircuitLight
            key={i}
            color={light.color}
            duration={light.duration}
            delay={light.delay}
            index={i}
            containerWidth={dimensions.width}
            containerHeight={dimensions.height}
          />
        ))}
      </div>
    </div>
  );
}
