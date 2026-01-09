interface StrategistIconProps {
  size?: number;
  className?: string;
}

export function StrategistIcon({ size = 36, className = '' }: StrategistIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Frame (speech bubble) */}
      <path 
        d="M6 10C6 6.68629 8.68629 4 12 4H52C55.3137 4 58 6.68629 58 10V42C58 45.3137 55.3137 48 52 48H36L28 56V48H12C8.68629 48 6 45.3137 6 42V10Z" 
        fill="#475569"
      />
      {/* Inner area */}
      <rect x="10" y="8" width="44" height="36" rx="4" fill="#1e293b"/>
      {/* Content blocks (purple) */}
      <rect x="14" y="13" width="16" height="11" rx="2.5" fill="#8b5cf6"/>
      <rect x="34" y="13" width="16" height="11" rx="2.5" fill="#8b5cf6"/>
      {/* CTA button (cyan) */}
      <rect x="22" y="30" width="20" height="6" rx="3" fill="#06b6d4"/>
    </svg>
  );
}
