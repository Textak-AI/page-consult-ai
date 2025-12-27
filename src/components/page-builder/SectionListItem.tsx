import { cn } from '@/lib/utils';
import { SCORE_CATEGORIES, getCategoryForSection } from '@/lib/categoryColors';
import { GripVertical } from 'lucide-react';

interface SectionListItemProps {
  section: {
    id: string;
    type: string;
    content?: any;
  };
  isEditing?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  draggable?: boolean;
}

export function SectionListItem({ 
  section, 
  isEditing = false,
  isSelected = false,
  onClick,
  className,
  draggable = false
}: SectionListItemProps) {
  const categoryId = getCategoryForSection(section.type);
  const category = categoryId ? SCORE_CATEGORIES[categoryId] : null;
  const color = category?.color || '#64748B';

  const sectionTitle = section.type
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
        "hover:bg-slate-800/50",
        isEditing && "border-l-2",
        isSelected && "bg-slate-800/70",
        !isEditing && "border-l-2 border-transparent",
        className
      )}
      style={{
        borderLeftColor: isEditing ? color : undefined,
        backgroundColor: isEditing ? `${color}10` : undefined,
      }}
    >
      {/* Drag handle */}
      {draggable && (
        <GripVertical className="w-4 h-4 text-slate-500 flex-shrink-0" />
      )}
      
      {/* Category color dot */}
      <div 
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ 
          backgroundColor: color,
          boxShadow: isEditing ? `0 0 6px ${color}` : undefined
        }}
      />
      
      {/* Section name */}
      <span className={cn(
        "text-sm truncate",
        isEditing ? "text-white font-medium" : "text-slate-300"
      )}>
        {sectionTitle}
      </span>

      {/* Editing indicator */}
      {isEditing && (
        <span className="text-xs text-slate-500 ml-auto">[editing]</span>
      )}
    </button>
  );
}
