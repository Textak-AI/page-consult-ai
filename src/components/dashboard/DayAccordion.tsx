import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { PageCard, type PageWithVersions } from './PageCard';

interface DayAccordionProps {
  date: Date;
  pages: PageWithVersions[];
  totalVersions: number;
  defaultExpanded?: boolean;
  onEditPage: (id: string) => void;
  onRestoreVersion: (pageId: string, versionId: string) => void;
  onDeletePage: (id: string) => void;
  onDuplicatePage: (id: string) => void;
}

export function DayAccordion({ 
  date, 
  pages, 
  totalVersions,
  defaultExpanded = false,
  onEditPage,
  onRestoreVersion,
  onDeletePage,
  onDuplicatePage
}: DayAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const formattedDate = format(date, 'MMMM d, yyyy (EEEE)');
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isYesterday = format(date, 'yyyy-MM-dd') === format(
    new Date(Date.now() - 86400000), 'yyyy-MM-dd'
  );
  
  const displayDate = isToday 
    ? 'Today' 
    : isYesterday 
      ? 'Yesterday' 
      : formattedDate;

  return (
    <div className="space-y-2">
      {/* Day Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-muted/50 
                   hover:bg-muted rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-2 text-foreground font-medium">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          {displayDate}
        </div>

        <span className="text-sm text-muted-foreground">
          {pages.length} {pages.length === 1 ? 'page' : 'pages'} • {totalVersions} {totalVersions === 1 ? 'save' : 'saves'}
        </span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-3 pl-2">
          {pages.map((page) => (
            <PageCard
              key={page.id}
              page={page}
              onEdit={onEditPage}
              onRestore={onRestoreVersion}
              onDelete={onDeletePage}
              onDuplicate={onDuplicatePage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
