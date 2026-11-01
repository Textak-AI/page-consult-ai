interface StrategistIconProps {
  size?: number;
  className?: string;
}

/** The PageConsult mark wherever the product speaks (demo chat, consultant). One logo family: public/brand. */
export function StrategistIcon({ size = 36, className = '' }: StrategistIconProps) {
  return <img src="/brand/pageconsult-icon.svg" alt="PageConsult" width={size} height={size} className={className} style={{ width: size, height: size, objectFit: 'contain' }} />;
}
