import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Building2, Users, FileText, MapPin, Eye, Plus, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { adminService, Hospital } from "@/services/admin.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useToast } from "@/hooks/use-toast";

export default function AdminHospitals() {
  const { toast } = useToast();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, active: 0, totalOffers: 0, totalInterns: 0 });

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [newHospital, setNewHospital] = useState({ email: '', password: '', name: '', type: 'public', city: '', address: '', phone: '', capacity: '' });
  const [editHospitalData, setEditHospitalData] = useState({ name: '', type: '', city: '', address: '', phone: '', capacity: '', is_active: true });

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await adminService.getHospitals({ search: searchQuery || undefined, type: typeFilter !== 'all' ? typeFilter : undefined, status: statusFilter !== 'all' ? statusFilter : undefined });
      if (response.success && response.data) {
        setHospitals(response.data);
        const data = response.data;
        setStats({
          total: response.pagination?.total || data.length,
          active: data.filter((h: any) => h.is_active).length,
          totalOffers: data.reduce((acc: number, h: any) => acc + (h.active_offers || 0), 0),
          totalInterns: data.reduce((acc: number, h: any) => acc + (h.current_interns || 0), 0),
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHospitals(); }, [searchQuery, typeFilter, statusFilter]);

  const handleCreateHospital = async () => {
    try {
      setActionLoading(true);
      const response = await adminService.createHospital({ ...newHospital, capacity: parseInt(newHospital.capacity) || 0 });
      if (response.success) {
        toast({ title: "Success", description: "Hospital created successfully" });
        setAddDialogOpen(false);
        setNewHospital({ email: '', password: '', name: '', type: 'public', city: '', address: '', phone: '', capacity: '' });
        fetchHospitals();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to create hospital", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewHospital = async (hospital: any) => {
    try {
      setActionLoading(true);
      const response = await adminService.getHospitalById(hospital.id);
      if (response.success) {
        setSelectedHospital(response.data);
        setViewDialogOpen(true);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load hospital details", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateHospital = async () => {
    if (!selectedHospital) return;
    try {
      setActionLoading(true);
      const response = await adminService.updateHospital(selectedHospital.id, { ...editHospitalData, capacity: parseInt(String(editHospitalData.capacity)) || 0 });
      if (response.success) {
        toast({ title: "Success", description: "Hospital updated successfully" });
        setEditDialogOpen(false);
        fetchHospitals();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to update hospital", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteHospital = async () => {
    if (!selectedHospital) return;
    try {
      setActionLoading(true);
      const response = await adminService.deleteHospital(selectedHospital.id);
      if (response.success) {
        toast({ title: "Success", description: "Hospital deleted successfully" });
        setDeleteDialogOpen(false);
        fetchHospitals();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete hospital", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (hospital: any) => {
    if (!hospital.is_active) return <Badge variant="secondary">Inactive</Badge>;
    if (!hospital.is_verified) return <Badge className="bg-amber-500/20 text-amber-600">Pending</Badge>;
    return <Badge className="bg-green-500/20 text-green-600">Active</Badge>;
  };

  const types = [...new Set(hospitals.map((h: any) => h.type).filter(Boolean))];

  if (loading) return <AppLayout role="admin" userName="Admin"><LoadingState message="Loading hospitals..." /></AppLayout>;
  if (error) return <AppLayout role="admin" userName="Admin"><ErrorState message={error} onRetry={fetchHospitals} /></AppLayout>;

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold text-foreground">Hospitals Management</h1><p className="text-muted-foreground mt-1">Manage partner hospitals and clinics</p></div>
          <Button onClick={() => setAddDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Add Hospital</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg"><Building2 className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total Hospitals</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-green-500/10 rounded-lg"><Building2 className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold">{stats.active}</p><p className="text-sm text-muted-foreground">Active Partners</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{stats.totalOffers}</p><p className="text-sm text-muted-foreground">Active Offers</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-amber-500/10 rounded-lg"><Users className="w-5 h-5 text-amber-600" /></div><div><p className="text-2xl font-bold">{stats.totalInterns}</p><p className="text-sm text-muted-foreground">Current Interns</p></div></CardContent></Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search hospitals..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem>{types.map(type => <SelectItem key={type} value={type!}>{type}</SelectItem>)}</SelectContent></Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="pending">Pending</SelectItem></SelectContent></Select>
        </div>

        {hospitals.length === 0 ? <EmptyState title="No hospitals found" description="No hospitals match your search criteria" /> : (
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Hospital</TableHead><TableHead>Type</TableHead><TableHead>Active Offers</TableHead><TableHead>Interns</TableHead><TableHead>Status</TableHead><TableHead className="w-[70px]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {hospitals.map((hospital: any) => (
                  <TableRow key={hospital.id}>
                    <TableCell><div><p className="font-medium">{hospital.name}</p><p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{hospital.city || '-'}</p></div></TableCell>
                    <TableCell className="text-muted-foreground">{hospital.type || '-'}</TableCell>
                    <TableCell><span className="font-medium">{hospital.active_offers || 0}</span></TableCell>
                    <TableCell><span className="font-medium">{hospital.current_interns || 0}</span><span className="text-muted-foreground">/{hospital.capacity || 0}</span></TableCell>
                    <TableCell>{getStatusBadge(hospital)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewHospital(hospital)}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedHospital(hospital); setEditHospitalData({ name: hospital.name, type: hospital.type, city: hospital.city, address: hospital.address, phone: hospital.phone, capacity: String(hospital.capacity), is_active: hospital.is_active }); setEditDialogOpen(true); }}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedHospital(hospital); setDeleteDialogOpen(true); }}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        )}
      </div>

      {/* Add Hospital Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Add New Hospital</DialogTitle><DialogDescription>Create a new hospital account via basic credentials.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Hospital Name</Label><Input value={newHospital.name} onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={newHospital.email} onChange={(e) => setNewHospital({ ...newHospital, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={newHospital.password} onChange={(e) => setNewHospital({ ...newHospital, password: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateHospital} disabled={actionLoading}>{actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create Hospital</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Hospital Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Edit Hospital</DialogTitle><DialogDescription>Update hospital information</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Hospital Name</Label><Input value={editHospitalData.name} onChange={(e) => setEditHospitalData({ ...editHospitalData, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Type</Label><Select value={editHospitalData.type} onValueChange={(v) => setEditHospitalData({ ...editHospitalData, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="public">Public</SelectItem><SelectItem value="private">Private</SelectItem><SelectItem value="university">University</SelectItem><SelectItem value="clinic">Clinic</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Status</Label><Select value={editHospitalData.is_active ? "active" : "inactive"} onValueChange={(v) => setEditHospitalData({ ...editHospitalData, is_active: v === "active" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button><Button onClick={handleUpdateHospital} disabled={actionLoading}>{actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Hospital Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Hospital Details</DialogTitle><DialogDescription>{selectedHospital?.name}</DialogDescription></DialogHeader>
          {selectedHospital && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Type</p><p className="font-medium">{selectedHospital.type}</p></div>
                <div><p className="text-sm text-muted-foreground">City</p><p className="font-medium">{selectedHospital.city || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{selectedHospital.phone || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Capacity</p><p className="font-medium">{selectedHospital.capacity || 0}</p></div>
                <div><p className="text-sm text-muted-foreground">Services</p><p className="font-medium">{selectedHospital.services?.length || 0}</p></div>
                <div><p className="text-sm text-muted-foreground">Tutors</p><p className="font-medium">{selectedHospital.tutors?.length || 0}</p></div>
              </div>
              {selectedHospital.services?.length > 0 && (
                <div><h4 className="font-semibold mb-2">Services</h4><div className="flex flex-wrap gap-2">{selectedHospital.services.map((s: any) => <Badge key={s.id} variant="outline">{s.name}</Badge>)}</div></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Hospital</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete {selectedHospital?.name}? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteHospital} className="bg-destructive text-destructive-foreground">{actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
