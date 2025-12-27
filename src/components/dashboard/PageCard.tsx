import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  Eye, 
  Copy, 
  Trash2, 
  MoreHorizontal,
  History,
  RotateCcw,
  FileText,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface PageVersion {
  id: string;
  updated_at: string;
  is_current_version: boolean;
  last_change_summary?: string;
}

export interface PageWithVersions {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_change_summary?: string;
  hero_thumbnail_url?: string;
  sections?: any[];
  styles?: {
    colors?: {
      primary?: string;
    };
  };
  consultation_data?: {
    industry?: string;
    target_audience?: string;
  };
  parent_page_id?: string | null;
  version_number: number;
  is_current_version: boolean;
  versions?: PageVersion[];
}

interface PageCardProps {
  page: PageWithVersions;
  onEdit: (id: string) => void;
  onRestore: (pageId: string, versionId: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function PageCard({ 
  page, 
  onEdit, 
  onRestore, 
  onDelete, 
  onDuplicate 
}: PageCardProps) {
  const [showVersions, setShowVersions] = useState(false);
  
  const relativeTime = formatDistanceToNow(new Date(page.updated_at), { 
    addSuffix: true 
  });

  // Get hero preview data
  const heroSection = page.sections?.find((s: any) => s.type === 'hero');
  const heroHeadline = heroSection?.content?.headline || page.title;
  const heroImage = heroSection?.content?.backgroundImage || page.hero_thumbnail_url;
  const primaryColor = page.styles?.colors?.primary || '#6366f1';
  
  const industry = page.consultation_data?.industry;
  const targetAudience = page.consultation_data?.target_audience;

  return (
    <div className="group relative">
      <div className="rounded-xl border border-border bg-card overflow-hidden 
                      transition-all duration-200 hover:border-primary/50 hover:shadow-lg">
        <div className="flex gap-4 p-4">
          {/* Hero Thumbnail */}
          <div 
            className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 
                       bg-gradient-to-br from-primary/20 to-primary/5"
            style={{ 
              background: heroImage 
                ? undefined 
                : `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}05)` 
            }}
          >
            {heroImage ? (
              <img 
                src={heroImage} 
                alt={page.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {heroHeadline ? (
                  <span className="text-[8px] font-bold text-primary/60 text-center px-1 line-clamp-3">
                    {heroHeadline}
                  </span>
                ) : (
                  <FileText className="w-6 h-6 text-primary/40" />
                )}
              </div>
            )}
          </div>

          {/* Page Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {page.title || 'Untitled Page'}
                </h3>
                {industry && targetAudience && (
                  <p className="text-xs text-muted-foreground truncate">
                    {industry} → {targetAudience}
                  </p>
                )}
              </div>
              
              {/* Status Badge */}
              <Badge 
                variant={page.status === 'published' ? 'default' : 'secondary'}
                className="flex-shrink-0 text-xs"
              >
                {page.status === 'published' ? '● Published' : '● Draft'}
              </Badge>
            </div>

            {/* Timestamp & Change Summary */}
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Last edited {relativeTime}</span>
              {page.last_change_summary && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-primary/80">
                    <Sparkles className="h-3 w-3" />
                    {page.last_change_summary}
                  </span>
                </>
              )}
            </div>

            {/* Version History Toggle */}
            {page.versions && page.versions.length > 1 && (
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="mt-2 flex items-center gap-1 text-xs text-primary 
                           hover:text-primary/80 transition-colors"
              >
                {showVersions ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                <History className="h-3 w-3" />
                Version History ({page.versions.length})
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(page.id)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(`/preview/${page.id}`, '_blank')}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onDuplicate(page.id)}
                  className="cursor-pointer"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(page.id)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Version History Expanded */}
        {showVersions && page.versions && (
          <div className="border-t border-border bg-muted/30 p-3 space-y-2">
            {page.versions.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg 
                           bg-background/50 hover:bg-background transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono">
                    {format(new Date(version.updated_at), 'h:mm a')}
                  </span>
                  <span className="text-sm text-foreground">
                    {version.last_change_summary || 'Autosave'}
                  </span>
                  {version.is_current_version && (
                    <Badge variant="outline" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>

                {!version.is_current_version && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRestore(page.id, version.id)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restore
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
