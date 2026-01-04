import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, MoreHorizontal, Eye, Copy, Mail, 
  ExternalLink, Archive, Flame, TrendingUp, Clock, Users,
  ChevronDown, Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import QuickPivotModal from '@/components/quick-pivot/QuickPivotModal';

interface Prospect {
  id: string;
  first_name: string;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  company: string | null;
  job_title: string | null;
  industry: string | null;
  slug: string;
  status: string | null;
  engagement_score: number | null;
  view_count: number | null;
  first_viewed_at: string | null;
  last_viewed_at: string | null;
  created_at: string | null;
  personalized_headline: string | null;
  meeting_context: string | null;
  base_page_title?: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  new: { label: 'New', variant: 'secondary' },
  contacted: { label: 'Contacted', variant: 'outline' },
  engaged: { label: 'Engaged', variant: 'default' },
  hot: { label: 'Hot', variant: 'destructive' },
  converted: { label: 'Converted', variant: 'default' },
  cold: { label: 'Cold', variant: 'secondary' },
};

const INDUSTRY_LABELS: Record<string, string> = {
  'saas': 'SaaS / Software',
  'healthcare': 'Healthcare',
  'financial-services': 'Financial Services',
  'logistics': 'Logistics',
  'manufacturing': 'Manufacturing',
  'professional-services': 'Professional Services',
  'ecommerce': 'E-commerce',
  'real-estate': 'Real Estate',
  'education': 'Education',
  'marketing': 'Marketing',
  'construction': 'Construction',
  'other': 'Other',
};

export default function ProspectsDashboard() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [quickPivotOpen, setQuickPivotOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProspects();

    const channel = supabase
      .channel('prospects-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prospects' },
        () => {
          fetchProspects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProspects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signup');
        return;
      }

      const { data, error } = await supabase
        .from('prospects')
        .select(`
          *,
          landing_pages:base_page_id (title)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProspects(
        (data || []).map((p: any) => ({
          ...p,
          base_page_title: p.landing_pages?.title,
        }))
      );
    } catch (err) {
      console.error('Error fetching prospects:', err);
      toast({
        title: 'Error',
        description: 'Failed to load prospects',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProspects = prospects
    .filter((p) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          p.full_name?.toLowerCase().includes(query) ||
          p.first_name?.toLowerCase().includes(query) ||
          p.company?.toLowerCase().includes(query) ||
          p.email?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (industryFilter !== 'all' && p.industry !== industryFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'engagement':
          return (b.engagement_score || 0) - (a.engagement_score || 0);
        case 'views':
          return (b.view_count || 0) - (a.view_count || 0);
        case 'last_viewed':
          return new Date(b.last_viewed_at || 0).getTime() - new Date(a.last_viewed_at || 0).getTime();
        case 'name':
          return (a.full_name || a.first_name || '').localeCompare(b.full_name || b.first_name || '');
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

  const stats = {
    total: prospects.length,
    hot: prospects.filter((p) => p.status === 'hot').length,
    engaged: prospects.filter((p) => (p.engagement_score || 0) >= 50).length,
    viewedToday: prospects.filter((p) => {
      if (!p.last_viewed_at) return false;
      const today = new Date();
      const viewed = new Date(p.last_viewed_at);
      return viewed.toDateString() === today.toDateString();
    }).length,
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied!' });
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await supabase.from('prospects').update({ status }).eq('id', id);
      setProspects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      );
      toast({ title: `Status updated to ${status}` });
    } catch (err) {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Prospects</h1>
              <p className="text-muted-foreground text-sm">
                Track engagement across all your personalized pages
              </p>
            </div>
            <Button onClick={() => setQuickPivotOpen(true)} className="gap-2">
              <Zap className="w-4 h-4" />
              Quick Pivot
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Users className="w-4 h-4" />
                  Total
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Hot
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.hot}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  Engaged
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.engaged}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Viewed Today
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.viewedToday}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, company, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="engaged">Engaged</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Newest</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="last_viewed">Last Viewed</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        ) : filteredProspects.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              {prospects.length === 0 ? 'No prospects yet' : 'No matches found'}
            </h3>
            <p className="text-muted-foreground mt-1">
              {prospects.length === 0
                ? 'Create your first personalized page with Quick Pivot'
                : 'Try adjusting your filters'}
            </p>
            {prospects.length === 0 && (
              <Button onClick={() => setQuickPivotOpen(true)} className="mt-4">
                <Zap className="w-4 h-4 mr-2" />
                Quick Pivot
              </Button>
            )}
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prospect</TableHead>
                    <TableHead className="hidden md:table-cell">Industry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Score</TableHead>
                    <TableHead className="hidden sm:table-cell">Views</TableHead>
                    <TableHead className="hidden lg:table-cell">Last Viewed</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProspects.map((prospect) => (
                    <TableRow key={prospect.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {prospect.full_name || prospect.first_name}
                          </p>
                          {prospect.company && (
                            <p className="text-sm text-muted-foreground">{prospect.company}</p>
                          )}
                          {prospect.email && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {prospect.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {INDUSTRY_LABELS[prospect.industry || ''] || prospect.industry || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-auto p-0">
                              <Badge variant={STATUS_CONFIG[prospect.status || 'new']?.variant || 'secondary'}>
                                {STATUS_CONFIG[prospect.status || 'new']?.label || prospect.status}
                                <ChevronDown className="w-3 h-3 ml-1" />
                              </Badge>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                              <DropdownMenuItem
                                key={value}
                                onClick={() => updateStatus(prospect.id, value)}
                              >
                                {config.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          {(prospect.engagement_score || 0) >= 100 && (
                            <Flame className="w-4 h-4 text-orange-500" />
                          )}
                          <span className={`font-medium ${
                            (prospect.engagement_score || 0) >= 100
                              ? 'text-orange-600'
                              : (prospect.engagement_score || 0) >= 50
                              ? 'text-purple-600'
                              : 'text-muted-foreground'
                          }`}>
                            {prospect.engagement_score || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          {prospect.view_count || 0}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(prospect.last_viewed_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyLink(prospect.slug)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`/p/${prospect.slug}`, '_blank')}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Page
                            </DropdownMenuItem>
                            {prospect.email && (
                              <DropdownMenuItem onClick={() => window.open(`mailto:${prospect.email}`, '_blank')}>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      {/* Quick Pivot Modal */}
      <QuickPivotModal isOpen={quickPivotOpen} onClose={() => setQuickPivotOpen(false)} />
    </div>
  );
}
