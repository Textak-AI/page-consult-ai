import { ArrowRight, ExternalLink, Edit3, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

type PageStatus = 'draft' | 'mid-consultation' | 'published';

interface PageItemProps {
  page: {
    id: string;
    title?: string;
    sections?: { hero?: { headline?: string } };
    updated_at: string;
    view_count?: number;
    published_url?: string;
    slug?: string;
    consultation_id?: string;
  };
  status: PageStatus;
  onEdit: () => void;
  onView?: () => void;
  onContinue?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
}

export function PageItem({ 
  page, 
  status, 
  onEdit, 
  onView, 
  onContinue,
  onDuplicate,
  onArchive 
}: PageItemProps) {
  const title = page.title || (page.sections?.hero as any)?.headline || 'Untitled';
  const timeAgo = formatDistanceToNow(new Date(page.updated_at), { addSuffix: true });

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-card/50 hover:bg-card transition-colors group">
      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-foreground truncate">{title}</h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
          {status === 'published' && (
            <>
              <span className="text-emerald-400 font-medium">Live</span>
              <span>·</span>
              {(page.view_count ?? 0) > 0 && (
                <>
                  <span>{page.view_count} views</span>
                  <span>·</span>
                </>
              )}
            </>
          )}
          {status === 'draft' && <span className="text-amber-400">Draft</span>}
          {status === 'mid-consultation' && <span className="text-violet-400">In consultation</span>}
          {status !== 'published' && <span>·</span>}
          <span>Updated {timeAgo}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {status === 'mid-consultation' && onContinue && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onContinue}
            className="text-violet-400 hover:text-violet-300"
          >
            Continue <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}
        
        {status === 'published' && onView && (
          <Button size="sm" variant="ghost" onClick={onView}>
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
        
        {status === 'draft' ? (
          <Button size="sm" variant="ghost" onClick={onEdit}>
            Edit <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit3 className="w-4 h-4" />
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDuplicate}>Duplicate</DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>Create Variant</DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={onArchive}
            >
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
