import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, TrendingUp, Share2, Calendar, Download, Search, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

interface Signup {
  id: string;
  email: string;
  name: string | null;
  referral_count: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  position: number;
}

interface BetaDashboardProps {
  pageId: string;
  totalSignups: number;
  signupGoal: number;
  signups: Signup[];
  isLoading?: boolean;
}

type SortField = 'created_at' | 'referral_count' | 'email' | 'name';
type SortDirection = 'asc' | 'desc';

export function BetaDashboard({
  pageId,
  totalSignups,
  signupGoal,
  signups,
  isLoading = false,
}: BetaDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySignups = signups.filter(s => new Date(s.created_at) >= today).length;
    const totalReferrals = signups.reduce((sum, s) => sum + (s.referral_count || 0), 0);
    const signupsWithReferrals = signups.filter(s => s.referral_count > 0).length;
    const viralCoefficient = signups.length > 0 
      ? (totalReferrals / signups.length).toFixed(2) 
      : '0.00';

    return { todaySignups, totalReferrals, viralCoefficient, signupsWithReferrals };
  }, [signups]);

  // Get unique sources for filter
  const sources = useMemo(() => {
    const sourceSet = new Set<string>();
    signups.forEach(s => {
      if (s.utm_source) sourceSet.add(s.utm_source);
    });
    return Array.from(sourceSet);
  }, [signups]);

  // Filter and sort signups
  const filteredSignups = useMemo(() => {
    let result = [...signups];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.email.toLowerCase().includes(query) ||
        (s.name && s.name.toLowerCase().includes(query))
      );
    }

    // Apply source filter
    if (sourceFilter !== 'all') {
      result = result.filter(s => s.utm_source === sourceFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'referral_count':
          comparison = (a.referral_count || 0) - (b.referral_count || 0);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [signups, searchQuery, sourceFilter, sortField, sortDirection]);

  // Handle column sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = ['Position', 'Email', 'Name', 'Referrals', 'Source', 'Medium', 'Campaign', 'Date'];
    const rows = filteredSignups.map(s => [
      s.position,
      s.email,
      s.name || '',
      s.referral_count,
      s.utm_source || '',
      s.utm_medium || '',
      s.utm_campaign || '',
      format(new Date(s.created_at), 'yyyy-MM-dd HH:mm'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `waitlist-signups-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const formatSource = (signup: Signup) => {
    if (signup.utm_source) return signup.utm_source;
    return 'Direct';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Signups
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSignups.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {signupGoal > 0 && `${((totalSignups / signupGoal) * 100).toFixed(1)}% of goal`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Signups
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todaySignups}</div>
            <p className="text-xs text-muted-foreground">
              New today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Viral Coefficient
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.viralCoefficient}</div>
            <p className="text-xs text-muted-foreground">
              {parseFloat(stats.viralCoefficient) >= 1 ? 'Viral growth!' : 'Referrals per signup'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Referrals
            </CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.signupsWithReferrals} active referrers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {sources.map(source => (
                <SelectItem key={source} value={source}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={exportCSV} className="shrink-0">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Signups Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">#</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('email')}
                  >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('name')}
                  >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('referral_count')}
                  >
                    Referrals
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Source</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('created_at')}
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading signups...
                  </TableCell>
                </TableRow>
              ) : filteredSignups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchQuery || sourceFilter !== 'all' 
                      ? 'No signups match your filters' 
                      : 'No signups yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSignups.map((signup) => (
                  <TableRow key={signup.id}>
                    <TableCell className="font-mono text-muted-foreground">
                      #{signup.position}
                    </TableCell>
                    <TableCell className="font-medium">{signup.email}</TableCell>
                    <TableCell>{signup.name || '-'}</TableCell>
                    <TableCell>
                      {signup.referral_count > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {signup.referral_count}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatSource(signup)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(signup.created_at), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredSignups.length} of {signups.length} signups
      </p>
    </div>
  );
}
