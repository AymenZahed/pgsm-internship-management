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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  university: string;
  department: string;
  tutor: string;
  startDate: string;
  endDate: string;
  progress: number;
  attendance: number;
  status: "active" | "completed" | "pending";
  phone: string;
}

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Youssef El Amrani",
    email: "y.elamrani@um5.ac.ma",
    university: "Université Mohammed V",
    department: "Cardiology",
    tutor: "Dr. Ahmed Benali",
    startDate: "2024-01-15",
    endDate: "2024-04-15",
    progress: 45,
    attendance: 92,
    status: "active",
    phone: "+212 661 123 456"
  },
  {
    id: "2",
    name: "Salma Benjelloun",
    email: "s.benjelloun@um5.ac.ma",
    university: "Université Mohammed V",
    department: "Emergency",
    tutor: "Dr. Fatima Zahra",
    startDate: "2024-01-10",
    endDate: "2024-03-10",
    progress: 68,
    attendance: 88,
    status: "active",
    phone: "+212 662 234 567"
  },
  {
    id: "3",
    name: "Omar Tazi",
    email: "o.tazi@uic.ac.ma",
    university: "Université Internationale de Casablanca",
    department: "Cardiology",
    tutor: "Dr. Ahmed Benali",
    startDate: "2024-02-01",
    endDate: "2024-05-01",
    progress: 25,
    attendance: 95,
    status: "active",
    phone: "+212 663 345 678"
  },
  {
    id: "4",
    name: "Amina Hassani",
    email: "a.hassani@um6ss.ma",
    university: "Université Mohammed VI",
    department: "Pediatrics",
    tutor: "Dr. Khalid Mansouri",
    startDate: "2023-10-01",
    endDate: "2024-01-01",
    progress: 100,
    attendance: 96,
    status: "completed",
    phone: "+212 664 456 789"
  },
  {
    id: "5",
    name: "Karim Idrissi",
    email: "k.idrissi@um5.ac.ma",
    university: "Université Mohammed V",
    department: "Surgery",
    tutor: "Dr. Hassan Alami",
    startDate: "2024-02-15",
    endDate: "2024-04-15",
    progress: 0,
    attendance: 0,
    status: "pending",
    phone: "+212 665 567 890"
  },
];

export default function HospitalStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messageText, setMessageText] = useState("");
  const navigate = useNavigate();

  const getStatusBadge = (status: Student["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/30">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === "all" || student.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const departments = [...new Set(mockStudents.map(s => s.department))];

  const stats = {
    total: mockStudents.length,
    active: mockStudents.filter(s => s.status === "active").length,
    completed: mockStudents.filter(s => s.status === "completed").length,
    avgAttendance: Math.round(mockStudents.filter(s => s.status === "active").reduce((acc, s) => acc + s.attendance, 0) / mockStudents.filter(s => s.status === "active").length),
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setViewDialogOpen(true);
  };

  const handleMessage = (student: Student) => {
    setSelectedStudent(student);
    setMessageText("");
    setMessageDialogOpen(true);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    toast.success(`Message sent to ${selectedStudent?.name}`);
    setMessageDialogOpen(false);
    setMessageText("");
  };

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Current Students</h1>
          <p className="text-muted-foreground mt-1">Manage interns currently at your hospital</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgAttendance}%</p>
                  <p className="text-sm text-muted-foreground">Avg Attendance</p>
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
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{student.name}</CardTitle>
                      <CardDescription className="text-xs">{student.university}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(student.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium">{student.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tutor</span>
                    <span className="font-medium">{student.tutor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period</span>
                    <span className="font-medium text-xs">
                      {new Date(student.startDate).toLocaleDateString()} - {new Date(student.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {student.status !== "pending" && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{student.progress}%</span>
                      </div>
                      <Progress value={student.progress} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Attendance</span>
                        <span className="font-medium">{student.attendance}%</span>
                      </div>
                      <Progress 
                        value={student.attendance} 
                        className="h-2"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleView(student)}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMessage(student)}>
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No students found</p>
            </CardContent>
          </Card>
        )}

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedStudent.avatar} />
                    <AvatarFallback className="text-lg">{selectedStudent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                    <p className="text-muted-foreground">{selectedStudent.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedStudent.phone}</p>
                    <div className="mt-2">{getStatusBadge(selectedStudent.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">University:</span>
                    <p className="font-medium">{selectedStudent.university}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium">{selectedStudent.department}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tutor:</span>
                    <p className="font-medium">{selectedStudent.tutor}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Internship Period:</span>
                    <p className="font-medium">{new Date(selectedStudent.startDate).toLocaleDateString()} - {new Date(selectedStudent.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedStudent.status !== "pending" && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="font-medium">{selectedStudent.progress}%</span>
                      </div>
                      <Progress value={selectedStudent.progress} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Attendance Rate</span>
                        <span className="font-medium">{selectedStudent.attendance}%</span>
                      </div>
                      <Progress value={selectedStudent.attendance} className="h-3" />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
                  <Button onClick={() => { setViewDialogOpen(false); handleMessage(selectedStudent); }}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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