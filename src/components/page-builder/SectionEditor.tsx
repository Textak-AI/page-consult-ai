import { useMemo } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SCORE_CATEGORIES, getCategoryForSection } from '@/lib/categoryColors';

interface SectionEditorProps {
  section: {
    id: string;
    type: string;
    content?: any;
  };
  isEditing: boolean;
  onClose: () => void;
  onSave: (content: any) => void;
  children: React.ReactNode;
  className?: string;
}

export function SectionEditor({ 
  section, 
  isEditing, 
  onClose, 
  onSave, 
  children,
  className
}: SectionEditorProps) {
  // Get category color for this section type
  const categoryId = useMemo(() => getCategoryForSection(section.type), [section.type]);
  const category = categoryId ? SCORE_CATEGORIES[categoryId] : null;
  const borderColor = category?.color || '#64748B';

  if (!isEditing) {
    return <>{children}</>;
  }

  const sectionTitle = section.type
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className={cn("relative", className)}>
      {/* Outer glow effect */}
      <div 
        className="absolute -inset-1 rounded-2xl blur-md opacity-30 pointer-events-none"
        style={{ backgroundColor: borderColor }}
      />
      
      {/* Editor container with colored border */}
      <div 
        className="relative bg-slate-900 rounded-xl overflow-hidden"
        style={{ 
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: borderColor,
          boxShadow: `0 0 20px ${borderColor}30`
        }}
      >
        {/* Editor header */}
        <div 
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ 
            borderColor: `${borderColor}40`,
            background: `linear-gradient(to right, ${borderColor}15, transparent)`
          }}
        >
          <div className="flex items-center gap-3">
            {/* Category indicator dot */}
            <div 
              className="w-2.5 h-2.5 rounded-full"
              style={{ 
                backgroundColor: borderColor,
                boxShadow: `0 0 8px ${borderColor}`
              }}
            />
            <span className="font-medium text-white">
              Editing {sectionTitle}
            </span>
            {category && (
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: `${borderColor}20`,
                  color: category.colorLight
                }}
              >
                {category.name}
              </span>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-slate-400 hover:text-white h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Editor content */}
        <div className="p-4">
          {children}
        </div>

        {/* Footer with save */}
        <div 
          className="flex justify-end gap-3 px-4 py-3 border-t"
          style={{ borderColor: `${borderColor}40` }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => onSave(section.content)}
            style={{ 
              backgroundColor: borderColor,
              color: 'white'
            }}
            className="hover:opacity-90"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
