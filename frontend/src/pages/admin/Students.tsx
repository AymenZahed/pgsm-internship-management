import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, GraduationCap, Users, Clock, CheckCircle, Eye, Download, Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { adminService, Student } from "@/services/admin.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useToast } from "@/hooks/use-toast";

export default function AdminStudents() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, pending: 0 });
  
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStudents({ 
        search: searchQuery || undefined,
        faculty: facultyFilter !== 'all' ? facultyFilter : undefined
      });
      if (response.success && response.data) {
        setStudents(response.data);
        const data = response.data;
        setStats({
          total: response.pagination?.total || data.length,
          active: data.filter((s: any) => s.active_internships > 0).length,
          completed: data.filter((s: any) => s.completed_internships > 0).length,
          pending: data.filter((s: any) => s.total_applications > 0 && !s.active_internships).length,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchQuery, facultyFilter, statusFilter]);

  const handleViewStudent = async (student: any) => {
    try {
      setActionLoading(true);
      const response = await adminService.getStudentById(student.id);
      if (response.success) {
        setSelectedStudent(response.data);
        setViewDialogOpen(true);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load student details", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    try {
      setActionLoading(true);
      const response = await adminService.deleteStudent(selectedStudent.id);
      if (response.success) {
        toast({ title: "Success", description: "Student deleted successfully" });
        setDeleteDialogOpen(false);
        fetchStudents();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete student", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await adminService.exportStudents('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students_export.csv';
      a.click();
      toast({ title: "Success", description: "Export started" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to export students", variant: "destructive" });
    }
  };

  const getStatusBadge = (student: any) => {
    if (student.active_internships > 0) return <Badge className="bg-green-500/20 text-green-600">Active Internship</Badge>;
    if (student.completed_internships > 0) return <Badge className="bg-blue-500/20 text-blue-600">Completed</Badge>;
    if (student.total_applications > 0) return <Badge className="bg-amber-500/20 text-amber-600">Pending</Badge>;
    return <Badge variant="secondary">No Internship</Badge>;
  };

  const faculties = [...new Set(students.map(s => s.faculty).filter(Boolean))];

  if (loading) return <AppLayout role="admin" userName="Admin"><LoadingState message="Loading students..." /></AppLayout>;
  if (error) return <AppLayout role="admin" userName="Admin"><ErrorState message={error} onRetry={fetchStudents} /></AppLayout>;

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Students Management</h1>
            <p className="text-muted-foreground mt-1">Monitor all registered students</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg"><GraduationCap className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total Students</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-green-500/10 rounded-lg"><Users className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold">{stats.active}</p><p className="text-sm text-muted-foreground">Active Internships</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-lg"><CheckCircle className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{stats.completed}</p><p className="text-sm text-muted-foreground">Completed</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-amber-500/10 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div><div><p className="text-2xl font-bold">{stats.pending}</p><p className="text-sm text-muted-foreground">Pending</p></div></CardContent></Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={facultyFilter} onValueChange={setFacultyFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="University" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Universities</SelectItem>
              {faculties.map(fac => <SelectItem key={fac} value={fac!}>{fac}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {students.length === 0 ? (
          <EmptyState title="No students found" description="No students match your search criteria" />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Current Internship</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student: any) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8"><AvatarFallback className="text-xs">{`${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}`}</AvatarFallback></Avatar>
                          <div>
                            <p className="font-medium">{student.first_name} {student.last_name}</p>
                            <p className="text-xs text-muted-foreground">{student.academic_year || '-'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{student.faculty || '-'}</TableCell>
                      <TableCell>
                        {student.current_service ? (
                          <div><p className="font-medium">{student.current_service}</p><p className="text-xs text-muted-foreground">{student.current_hospital}</p></div>
                        ) : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        {student.progress !== undefined && student.progress !== null ? (
                          <div className="w-24"><Progress value={student.progress} className="h-2" /><p className="text-xs text-muted-foreground mt-1">{student.progress}%</p></div>
                        ) : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>{getStatusBadge(student)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewStudent(student)}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedStudent(student); setDeleteDialogOpen(true); }}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Student Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>{selectedStudent?.first_name} {selectedStudent?.last_name}</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{selectedStudent.email}</p></div>
                <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{selectedStudent.phone || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Student Number</p><p className="font-medium">{selectedStudent.student_number || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Faculty</p><p className="font-medium">{selectedStudent.faculty || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Academic Year</p><p className="font-medium">{selectedStudent.academic_year || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Applications</p><p className="font-medium">{selectedStudent.total_applications || 0}</p></div>
              </div>
              {selectedStudent.internships?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Internships</h4>
                  <div className="space-y-2">
                    {selectedStudent.internships.map((i: any) => (
                      <div key={i.id} className="p-3 bg-muted rounded-lg">
                        <p className="font-medium">{i.hospital_name}</p>
                        <p className="text-sm text-muted-foreground">{i.service_name} • {i.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete {selectedStudent?.first_name} {selectedStudent?.last_name}? This will also delete their user account.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStudent} className="bg-destructive text-destructive-foreground">{actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
