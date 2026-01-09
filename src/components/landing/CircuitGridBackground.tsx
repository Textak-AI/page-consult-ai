import { motion } from 'framer-motion';
import { useMemo, useEffect, useState } from 'react';

// Intelligence category colors
const LIGHT_COLORS = [
  '#06b6d4', // cyan - WHO YOU ARE
  '#8b5cf6', // violet - WHAT YOU OFFER
  '#10b981', // emerald - BUYER REALITY
  '#f59e0b', // amber - PROOF & CREDIBILITY
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
    case 0: // Left edge
      col = 0;
      row = Math.floor(Math.random() * rows);
      break;
    case 1: // Top edge
      col = Math.floor(Math.random() * cols);
      row = 0;
      break;
    case 2: // Right edge
      col = cols - 1;
      row = Math.floor(Math.random() * rows);
      break;
    case 3: // Bottom edge
      col = Math.floor(Math.random() * cols);
      row = rows - 1;
      break;
  }
  
  keyframes.push({ x: col * GRID_SIZE, y: row * GRID_SIZE });
  
  // Generate 5-8 segments following grid lines
  const segments = 5 + Math.floor(Math.random() * 4);
  let direction: 'horizontal' | 'vertical' = Math.random() > 0.5 ? 'horizontal' : 'vertical';
  
  for (let i = 0; i < segments; i++) {
    if (direction === 'horizontal') {
      // Move horizontally along row
      const steps = 2 + Math.floor(Math.random() * 4);
      const moveRight = col < cols / 2 ? Math.random() > 0.3 : Math.random() > 0.7;
      col = moveRight 
        ? Math.min(col + steps, cols - 1)
        : Math.max(col - steps, 0);
    } else {
      // Move vertically along column
      const steps = 1 + Math.floor(Math.random() * 3);
      const moveDown = row < rows / 2 ? Math.random() > 0.3 : Math.random() > 0.7;
      row = moveDown
        ? Math.min(row + steps, rows - 1)
        : Math.max(row - steps, 0);
    }
    
    keyframes.push({ x: col * GRID_SIZE, y: row * GRID_SIZE });
    
    // Turn at intersection
    direction = direction === 'horizontal' ? 'vertical' : 'horizontal';
  }
  
  return keyframes;
};

interface CircuitLightProps {
  color: string;
  duration: number;
  delay: number;
  index: number;
  containerWidth: number;
  containerHeight: number;
}

const CircuitLight = ({ color, duration, delay, index, containerWidth, containerHeight }: CircuitLightProps) => {
  const path = useMemo(
    () => generateGridPath(index, containerWidth, containerHeight),
    [index, containerWidth, containerHeight]
  );
  
  const xValues = path.map(p => p.x);
  const yValues = path.map(p => p.y);
  
  // Create opacity array: fade in, stay visible, fade out
  const opacityValues = path.map((_, i) => {
    if (i === 0) return 0;
    if (i === 1) return 0.8;
    if (i === path.length - 1) return 0;
    return 0.8;
  });
  
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: '6px',
        height: '6px',
        backgroundColor: color,
        boxShadow: `0 0 12px 4px ${color}50, 0 0 24px 8px ${color}25`,
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
        repeatDelay: 3,
        ease: "linear",
      }}
    />
  );
};

export function CircuitGridBackground() {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });
  
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: 600,
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const lights = useMemo(() => [
    { color: LIGHT_COLORS[0], duration: 8, delay: 0 },
    { color: LIGHT_COLORS[1], duration: 10, delay: 2 },
    { color: LIGHT_COLORS[2], duration: 9, delay: 4 },
    { color: LIGHT_COLORS[3], duration: 11, delay: 6 },
    { color: LIGHT_COLORS[0], duration: 12, delay: 8 },
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Static grid pattern - VERY subtle 3-4% opacity */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.035 }}>
        <defs>
          <pattern id="circuit-grid-lines" width="60" height="60" patternUnits="userSpaceOnUse">
            <path 
              d="M 60 0 L 0 0 0 60" 
              fill="none" 
              stroke="white" 
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-grid-lines)" />
      </svg>
      
      {/* Nodes at some intersections - even more subtle */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }}>
        <defs>
          <pattern id="circuit-nodes" width="180" height="180" patternUnits="userSpaceOnUse">
            <circle cx="60" cy="60" r="2" fill="white" />
            <circle cx="120" cy="120" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-nodes)" />
      </svg>

      {/* Animated flowing lights - traveling along grid lines */}
      <div className="absolute inset-0">
        {lights.map((light, i) => (
          <CircuitLight
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

      {/* Ambient underglow - centered behind widget area */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '800px',
          height: '500px',
          background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.06) 0%, rgba(6, 182, 212, 0.03) 40%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
    </div>
  );
}
