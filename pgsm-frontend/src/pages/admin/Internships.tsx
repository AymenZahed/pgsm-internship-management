import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Briefcase, Users, Clock, CheckCircle, Eye, Download, Calendar, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { adminService, Internship } from "@/services/admin.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useToast } from "@/hooks/use-toast";

export default function AdminInternships() {
  const { toast } = useToast();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, upcoming: 0 });
  
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<any>(null);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const response = await adminService.getInternships({ 
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      if (response.success && response.data) {
        setInternships(response.data);
        const data = response.data;
        setStats({
          total: response.pagination?.total || data.length,
          active: data.filter((i: any) => i.status === 'active').length,
          completed: data.filter((i: any) => i.status === 'completed').length,
          upcoming: data.filter((i: any) => i.status === 'upcoming').length,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInternships(); }, [searchQuery, hospitalFilter, statusFilter]);

  const handleExport = async () => {
    try {
      const blob = await adminService.exportInternships('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'internships_export.csv';
      a.click();
      toast({ title: "Success", description: "Export started" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to export internships", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500/20 text-green-600">Active</Badge>;
      case "completed": return <Badge className="bg-blue-500/20 text-blue-600">Completed</Badge>;
      case "upcoming": return <Badge className="bg-amber-500/20 text-amber-600">Upcoming</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const hospitals = [...new Set(internships.map((i: any) => i.hospital_name).filter(Boolean))];

  if (loading) return <AppLayout role="admin" userName="Admin"><LoadingState message="Loading internships..." /></AppLayout>;
  if (error) return <AppLayout role="admin" userName="Admin"><ErrorState message={error} onRetry={fetchInternships} /></AppLayout>;

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold text-foreground">Internships Management</h1><p className="text-muted-foreground mt-1">Monitor all internship programs</p></div>
          <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Export Report</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg"><Briefcase className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total Internships</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-green-500/10 rounded-lg"><Users className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold">{stats.active}</p><p className="text-sm text-muted-foreground">Active</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-lg"><CheckCircle className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{stats.completed}</p><p className="text-sm text-muted-foreground">Completed</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-amber-500/10 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div><div><p className="text-2xl font-bold">{stats.upcoming}</p><p className="text-sm text-muted-foreground">Upcoming</p></div></CardContent></Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search internships..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <Select value={hospitalFilter} onValueChange={setHospitalFilter}><SelectTrigger className="w-[200px]"><SelectValue placeholder="Hospital" /></SelectTrigger><SelectContent><SelectItem value="all">All Hospitals</SelectItem>{hospitals.map(hospital => <SelectItem key={hospital} value={hospital!}>{hospital}</SelectItem>)}</SelectContent></Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="upcoming">Upcoming</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select>
        </div>

        {internships.length === 0 ? <EmptyState title="No internships found" description="No internships match your search criteria" /> : (
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Internship</TableHead><TableHead>Student</TableHead><TableHead>Hospital</TableHead><TableHead>Period</TableHead><TableHead>Status</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {internships.map((internship: any) => (
                  <TableRow key={internship.id}>
                    <TableCell><div><p className="font-medium">{internship.service_name || 'General'}</p><p className="text-xs text-muted-foreground">{internship.tutor_name || 'No tutor assigned'}</p></div></TableCell>
                    <TableCell><div><p className="font-medium">{internship.first_name} {internship.last_name}</p><p className="text-xs text-muted-foreground">{internship.email}</p></div></TableCell>
                    <TableCell className="text-muted-foreground">{internship.hospital_name}</TableCell>
                    <TableCell><div className="flex items-center gap-1 text-sm text-muted-foreground"><Calendar className="w-3 h-3" />{new Date(internship.start_date).toLocaleDateString()} - {new Date(internship.end_date).toLocaleDateString()}</div></TableCell>
                    <TableCell>{getStatusBadge(internship.status)}</TableCell>
                    <TableCell><Button variant="outline" size="sm" onClick={() => { setSelectedInternship(internship); setViewDialogOpen(true); }}><Eye className="w-4 h-4 mr-1" />View</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Internship Details</DialogTitle><DialogDescription>{selectedInternship?.service_name || 'General Internship'}</DialogDescription></DialogHeader>
          {selectedInternship && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Student</p><p className="font-medium">{selectedInternship.first_name} {selectedInternship.last_name}</p></div>
                <div><p className="text-sm text-muted-foreground">Hospital</p><p className="font-medium">{selectedInternship.hospital_name}</p></div>
                <div><p className="text-sm text-muted-foreground">Service</p><p className="font-medium">{selectedInternship.service_name || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Tutor</p><p className="font-medium">{selectedInternship.tutor_name || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Start Date</p><p className="font-medium">{new Date(selectedInternship.start_date).toLocaleDateString()}</p></div>
                <div><p className="text-sm text-muted-foreground">End Date</p><p className="font-medium">{new Date(selectedInternship.end_date).toLocaleDateString()}</p></div>
                <div><p className="text-sm text-muted-foreground">Status</p>{getStatusBadge(selectedInternship.status)}</div>
                <div><p className="text-sm text-muted-foreground">Progress</p><p className="font-medium">{selectedInternship.progress || 0}%</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
