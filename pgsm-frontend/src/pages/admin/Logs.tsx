import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, RefreshCw, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { adminService, ActivityLog } from "@/services/admin.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogs() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getActivityLogs({ 
        action: actionFilter !== 'all' ? actionFilter : undefined 
      });
      if (response.success && response.data) {
        setLogs(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [actionFilter]);

  const filteredLogs = logs.filter(log => 
    log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.first_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelIcon = (action: string) => {
    if (action?.includes('error') || action?.includes('fail')) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (action?.includes('warn')) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    if (action?.includes('success') || action?.includes('create') || action?.includes('login')) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  const getLevelBadge = (action: string) => {
    if (action?.includes('error') || action?.includes('fail')) return <Badge className="bg-red-500/20 text-red-600">Error</Badge>;
    if (action?.includes('warn')) return <Badge className="bg-amber-500/20 text-amber-600">Warning</Badge>;
    if (action?.includes('success') || action?.includes('create')) return <Badge className="bg-green-500/20 text-green-600">Success</Badge>;
    return <Badge className="bg-blue-500/20 text-blue-600">Info</Badge>;
  };

  const stats = {
    total: logs.length,
    errors: logs.filter(l => l.action?.includes('error') || l.action?.includes('fail')).length,
    warnings: logs.filter(l => l.action?.includes('warn')).length,
  };

  if (loading) return <AppLayout role="admin" userName="Admin"><LoadingState message="Loading logs..." /></AppLayout>;
  if (error) return <AppLayout role="admin" userName="Admin"><ErrorState message={error} onRetry={fetchLogs} /></AppLayout>;

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold text-foreground">System Logs</h1><p className="text-muted-foreground mt-1">Monitor platform activity and events</p></div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchLogs}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
            <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export Logs</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg"><Info className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total Events</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-red-500/10 rounded-lg"><AlertCircle className="w-5 h-5 text-red-500" /></div><div><p className="text-2xl font-bold text-red-600">{stats.errors}</p><p className="text-sm text-muted-foreground">Errors</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-amber-500/10 rounded-lg"><AlertTriangle className="w-5 h-5 text-amber-500" /></div><div><p className="text-2xl font-bold text-amber-600">{stats.warnings}</p><p className="text-sm text-muted-foreground">Warnings</p></div></CardContent></Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <Select value={actionFilter} onValueChange={setActionFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Action" /></SelectTrigger><SelectContent><SelectItem value="all">All Actions</SelectItem><SelectItem value="login">Login</SelectItem><SelectItem value="create">Create</SelectItem><SelectItem value="update">Update</SelectItem><SelectItem value="delete">Delete</SelectItem></SelectContent></Select>
        </div>

        {filteredLogs.length === 0 ? <EmptyState title="No logs found" description="No activity logs match your search criteria" /> : (
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead className="w-[180px]">Timestamp</TableHead><TableHead className="w-[100px]">Level</TableHead><TableHead>Action</TableHead><TableHead>User</TableHead><TableHead className="w-[120px]">IP Address</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</TableCell>
                    <TableCell>{getLevelBadge(log.action)}</TableCell>
                    <TableCell className="flex items-center gap-2">{getLevelIcon(log.action)}<span className="text-sm">{log.action}</span></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.first_name ? `${log.first_name} ${log.last_name}` : log.email || 'System'}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.ip_address || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        )}
      </div>
    </AppLayout>
  );
}
