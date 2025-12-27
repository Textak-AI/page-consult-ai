import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  MoreHorizontal, 
  Trash2, 
  ExternalLink,
  Search,
  RefreshCw,
  Shield,
  Activity,
  Rocket,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Admin emails - must match edge function
const ADMIN_EMAILS = ['kyle@pageconsult.ai', 'kyle@textak.ai'];

interface AdminStats {
  userCount: number;
  pageCount: number;
  consultationCount: number;
  activeCount: number;
  publishedCount: number;
  betaSignupCount: number;
}

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  page_count: number;
  plan: string;
}

interface PageData {
  id: string;
  user_id: string;
  user_email: string;
  title: string;
  slug: string;
  status: string;
  is_published: boolean;
  ai_seo_score: number | null;
  industry: string;
  created_at: string;
  updated_at: string;
}

interface ConsultationData {
  id: string;
  user_id: string;
  user_email: string;
  business_name: string;
  industry: string;
  status: string;
  service_type: string;
  created_at: string;
  updated_at: string;
}

function StatsCards({ stats, isLoading }: { stats: AdminStats | null; isLoading: boolean }) {
  const cards = [
    { title: 'Total Users', value: stats?.userCount || 0, icon: Users, color: 'text-blue-400' },
    { title: 'Active (7d)', value: stats?.activeCount || 0, icon: Activity, color: 'text-green-400' },
    { title: 'Landing Pages', value: stats?.pageCount || 0, icon: FileText, color: 'text-purple-400' },
    { title: 'Published', value: stats?.publishedCount || 0, icon: Rocket, color: 'text-orange-400' },
    { title: 'Consultations', value: stats?.consultationCount || 0, icon: MessageSquare, color: 'text-pink-400' },
    { title: 'Beta Signups', value: stats?.betaSignupCount || 0, icon: UserPlus, color: 'text-cyan-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {cards.map((card) => (
        <Card key={card.title} className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? '...' : card.value.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UsersTable() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-get-users', {
        body: { search },
      });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      const { error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId: deleteUserId },
      });
      if (error) throw error;
      toast.success('User deleted successfully');
      setDeleteUserId(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'agency': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'pro': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700 text-white"
          />
        </div>
        <Button onClick={fetchUsers} variant="outline" size="icon" className="border-slate-700">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="rounded-lg border border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/50">
              <TableHead className="text-slate-400">Email</TableHead>
              <TableHead className="text-slate-400">Signed Up</TableHead>
              <TableHead className="text-slate-400">Last Active</TableHead>
              <TableHead className="text-slate-400 text-center">Pages</TableHead>
              <TableHead className="text-slate-400">Plan</TableHead>
              <TableHead className="text-slate-400 w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="border-slate-800 hover:bg-slate-900/30">
                  <TableCell className="text-white font-medium">{user.email}</TableCell>
                  <TableCell className="text-slate-400">
                    {format(new Date(user.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {user.last_sign_in_at 
                      ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy')
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                      {user.page_count}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPlanBadgeColor(user.plan)}>
                      {user.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                        <DropdownMenuItem
                          className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                          onClick={() => setDeleteUserId(user.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete the user and all their data including pages, consultations, and usage history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PagesTable() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletePageId, setDeletePageId] = useState<string | null>(null);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-get-pages', {
        body: { search },
      });
      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to fetch pages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPages();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleDeletePage = async () => {
    if (!deletePageId) return;
    try {
      const { error } = await supabase.functions.invoke('admin-delete-page', {
        body: { pageId: deletePageId },
      });
      if (error) throw error;
      toast.success('Page deleted successfully');
      setDeletePageId(null);
      fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700 text-white"
          />
        </div>
        <Button onClick={fetchPages} variant="outline" size="icon" className="border-slate-700">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="rounded-lg border border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/50">
              <TableHead className="text-slate-400">Title</TableHead>
              <TableHead className="text-slate-400">Owner</TableHead>
              <TableHead className="text-slate-400">Industry</TableHead>
              <TableHead className="text-slate-400 text-center">Score</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400">Created</TableHead>
              <TableHead className="text-slate-400 w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                  No pages found
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.id} className="border-slate-800 hover:bg-slate-900/30">
                  <TableCell className="text-white font-medium max-w-[200px] truncate">
                    {page.title}
                  </TableCell>
                  <TableCell className="text-slate-400 max-w-[180px] truncate">
                    {page.user_email}
                  </TableCell>
                  <TableCell className="text-slate-400">{page.industry}</TableCell>
                  <TableCell className="text-center">
                    {page.ai_seo_score !== null ? (
                      <Badge 
                        className={
                          page.ai_seo_score >= 80 
                            ? 'bg-green-500/20 text-green-400' 
                            : page.ai_seo_score >= 50 
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                        }
                      >
                        {page.ai_seo_score}
                      </Badge>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        page.is_published 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-slate-500/20 text-slate-400'
                      }
                    >
                      {page.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {format(new Date(page.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                        <DropdownMenuItem
                          onClick={() => window.open(`/generate/${page.id}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Page
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                          onClick={() => setDeletePageId(page.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Page
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deletePageId} onOpenChange={() => setDeletePageId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Page</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete this landing page. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePage}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ConsultationsTable() {
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConsultationId, setDeleteConsultationId] = useState<string | null>(null);

  const fetchConsultations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-get-consultations', {
        body: { search },
      });
      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      toast.error('Failed to fetch consultations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchConsultations();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleDeleteConsultation = async () => {
    if (!deleteConsultationId) return;
    try {
      const { error } = await supabase.functions.invoke('admin-delete-consultation', {
        body: { consultationId: deleteConsultationId },
      });
      if (error) throw error;
      toast.success('Consultation deleted successfully');
      setDeleteConsultationId(null);
      fetchConsultations();
    } catch (error) {
      console.error('Error deleting consultation:', error);
      toast.error('Failed to delete consultation');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by business name or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700 text-white"
          />
        </div>
        <Button onClick={fetchConsultations} variant="outline" size="icon" className="border-slate-700">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="rounded-lg border border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/50">
              <TableHead className="text-slate-400">Business</TableHead>
              <TableHead className="text-slate-400">Owner</TableHead>
              <TableHead className="text-slate-400">Industry</TableHead>
              <TableHead className="text-slate-400">Service</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400">Created</TableHead>
              <TableHead className="text-slate-400 w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : consultations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                  No consultations found
                </TableCell>
              </TableRow>
            ) : (
              consultations.map((consultation) => (
                <TableRow key={consultation.id} className="border-slate-800 hover:bg-slate-900/30">
                  <TableCell className="text-white font-medium max-w-[180px] truncate">
                    {consultation.business_name}
                  </TableCell>
                  <TableCell className="text-slate-400 max-w-[180px] truncate">
                    {consultation.user_email}
                  </TableCell>
                  <TableCell className="text-slate-400">{consultation.industry}</TableCell>
                  <TableCell className="text-slate-400">{consultation.service_type}</TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        consultation.status === 'completed'
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }
                    >
                      {consultation.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {format(new Date(consultation.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                        <DropdownMenuItem
                          className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                          onClick={() => setDeleteConsultationId(consultation.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Consultation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteConsultationId} onOpenChange={() => setDeleteConsultationId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Consultation</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete this consultation and any associated landing pages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConsultation}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/');
        return;
      }
      
      if (!ADMIN_EMAILS.includes(user.email || '')) {
        toast.error('Access denied');
        navigate('/');
        return;
      }
      
      setIsAdmin(true);
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-get-stats');
      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch stats');
    } finally {
      setStatsLoading(false);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Shield className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm">Manage users, pages, and consultations</p>
          </div>
        </div>

        {/* Stats */}
        <StatsCards stats={stats} isLoading={statsLoading} />

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="pages"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Pages
            </TabsTrigger>
            <TabsTrigger 
              value="consultations"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Consultations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UsersTable />
          </TabsContent>

          <TabsContent value="pages" className="mt-6">
            <PagesTable />
          </TabsContent>

          <TabsContent value="consultations" className="mt-6">
            <ConsultationsTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
