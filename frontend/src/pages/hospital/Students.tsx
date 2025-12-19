import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Users, Eye, MessageSquare, FileText, Clock, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { studentService, Student, StudentStats } from "@/services/student.service";

export default function HospitalStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messageText, setMessageText] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    total: 0,
    active: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, departmentFilter, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchQuery || undefined,
        department: departmentFilter !== "all" ? departmentFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      };

      const studentsRes = await studentService.getHospitalStudents(params);

      if (studentsRes.success) {
        setStudents(studentsRes.data || []);
        // Extract departments from response
        if (studentsRes.departments) {
          setDepartments(studentsRes.departments);
        } else {
          // Extract unique departments from students
          const depts = [...new Set(studentsRes.data
            .map((s: any) => s.department || s.service_name)
            .filter(Boolean))];
          setDepartments(depts);
        }

        // Calculate stats from actual data
        const list = studentsRes.data || [];
        const activeCount = list.filter((s: any) => s.status === 'active').length;
        const completedCount = list.filter((s: any) => s.status === 'completed').length;

        setStats({
          total: list.length,
          active: activeCount,
          completed: completedCount,
        });
      } else {
        toast.error(studentsRes.message || "Failed to load students");
      }
    } catch (error) {
      toast.error("Failed to load students data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/30">Completed</Badge>;
      case "upcoming":
        return <Badge className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30">Upcoming</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const transformStudentForDisplay = (student: any) => {
    return {
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      avatar: student.avatar,
      university: student.faculty || 'University',
      department: student.department || student.service_name || 'General',
      status: student.status || 'active',
      progress: student.progress || 0,
      startDate: student.start_date,
      endDate: student.end_date,
      tutor: student.tutor_name || 'Not assigned',
      email: student.email
    };
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const dept = (student.department || student.service_name || '').toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
      dept.includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === "all" ||
      (student.department || student.service_name) === departmentFilter;
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleView = (student: any) => {
    setSelectedStudent(transformStudentForDisplay(student));
    setViewDialogOpen(true);
  };

  const handleMessage = (student: any) => {
    const targetUserId = student.user_id || student.id || student.student_id;
    if (!targetUserId) return;
    navigate(`/hospital/messages?to=${targetUserId}`);
  };

  // Legacy handler kept to avoid runtime errors from existing JSX; actual messaging now
  // uses handleMessage to navigate to the HospitalMessages page.
  const handleSendMessage = () => {
    // no-op
  };

  const handleViewDetails = (studentId: string) => {
    if (!studentId) return;
    navigate(`/hospital/students/${studentId}`);
  };

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Current Students</h1>
          <p className="text-muted-foreground mt-1">Manage interns currently at your hospital</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Active Interns</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept, idx) => (
                <SelectItem key={idx} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Students Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading students...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => {
                const displayStudent = transformStudentForDisplay(student);
                return (
                  <Card key={student.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={displayStudent.avatar} />
                            <AvatarFallback>
                              {displayStudent.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{displayStudent.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {displayStudent.university}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(displayStudent.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Department</span>
                          <span className="font-medium">{displayStudent.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tutor</span>
                          <span className="font-medium">{displayStudent.tutor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Period</span>
                          <span className="font-medium text-xs">
                            {displayStudent.startDate ? new Date(displayStudent.startDate).toLocaleDateString() : 'N/A'} -{' '}
                            {displayStudent.endDate ? new Date(displayStudent.endDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {(displayStudent.status === "active" || displayStudent.status === "upcoming") && (
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{displayStudent.progress}%</span>
                            </div>
                            <Progress value={displayStudent.progress} className="h-2" />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewDetails(student.id || student.student_id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleMessage(student)}>
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredStudents.length === 0 && !loading && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No students found</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Message Dialog */}
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message to {selectedStudent?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}