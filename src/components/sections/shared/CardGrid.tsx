import { memo } from 'react';
import type { ReactNode } from 'react';

interface CardGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  centerLastRow?: boolean;
  maxCardWidth?: string;
  minCardWidth?: string;
  className?: string;
}

const gapMap = {
  sm: '16px',
  md: '24px',
  lg: '32px',
};

function CardGridBase({
  children,
  columns = 3,
  gap = 'md',
  centerLastRow = true,
  maxCardWidth = '400px',
  minCardWidth = '280px',
  className = '',
}: CardGridProps) {
  const gapValue = gapMap[gap];
  const basisPercent = `calc(${100 / columns}% - ${gapValue})`;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: centerLastRow ? 'center' : 'flex-start',
        gap: gapValue,
      }}
    >
      {/* Inject flex styles onto children via wrapper divs */}
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              style={{
                flex: `0 1 ${basisPercent}`,
                minWidth: minCardWidth,
                maxWidth: maxCardWidth,
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}

export const CardGrid = memo(CardGridBase);
export default CardGrid;
