import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Search, GraduationCap, Users, Clock, CheckCircle, Eye, Download } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Student {
  id: string;
  name: string;
  email: string;
  university: string;
  year: string;
  currentInternship: string | null;
  hospital: string | null;
  progress: number;
  status: "active" | "completed" | "pending" | "no_internship";
}

const mockStudents: Student[] = [
  { id: "1", name: "Youssef El Amrani", email: "y.elamrani@um5.ac.ma", university: "Université Mohammed V", year: "4th Year", currentInternship: "Cardiology", hospital: "CHU Ibn Sina", progress: 45, status: "active" },
  { id: "2", name: "Salma Benjelloun", email: "s.benjelloun@um5.ac.ma", university: "Université Mohammed V", year: "5th Year", currentInternship: "Emergency", hospital: "CHU Ibn Sina", progress: 68, status: "active" },
  { id: "3", name: "Omar Tazi", email: "o.tazi@uic.ac.ma", university: "UIC Casablanca", year: "4th Year", currentInternship: "Cardiology", hospital: "CHU Ibn Sina", progress: 25, status: "active" },
  { id: "4", name: "Amina Hassani", email: "a.hassani@um6ss.ma", university: "Université Mohammed VI", year: "5th Year", currentInternship: null, hospital: null, progress: 100, status: "completed" },
  { id: "5", name: "Karim Idrissi", email: "k.idrissi@um5.ac.ma", university: "Université Mohammed V", year: "4th Year", currentInternship: null, hospital: null, progress: 0, status: "pending" },
  { id: "6", name: "Leila Fassi", email: "l.fassi@um6ss.ma", university: "Université Mohammed VI", year: "3rd Year", currentInternship: null, hospital: null, progress: 0, status: "no_internship" },
];

export default function AdminStudents() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusBadge = (status: Student["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-600">Active Internship</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/20 text-blue-600">Completed</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-600">Pending</Badge>;
      case "no_internship":
        return <Badge variant="secondary">No Internship</Badge>;
    }
  };

  const universities = [...new Set(mockStudents.map(s => s.university))];

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUniversity = universityFilter === "all" || student.university === universityFilter;
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesUniversity && matchesStatus;
  });

  const stats = {
    total: mockStudents.length,
    active: mockStudents.filter(s => s.status === "active").length,
    completed: mockStudents.filter(s => s.status === "completed").length,
    pending: mockStudents.filter(s => s.status === "pending").length,
  };

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Students Management</h1>
            <p className="text-muted-foreground mt-1">Monitor all registered students</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active Internships</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
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
          <Select value={universityFilter} onValueChange={setUniversityFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="University" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Universities</SelectItem>
              {universities.map(uni => (
                <SelectItem key={uni} value={uni}>{uni}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Internship</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="no_internship">No Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Students Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Current Internship</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.year}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{student.university}</TableCell>
                    <TableCell>
                      {student.currentInternship ? (
                        <div>
                          <p className="font-medium">{student.currentInternship}</p>
                          <p className="text-xs text-muted-foreground">{student.hospital}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {student.status === "active" || student.status === "completed" ? (
                        <div className="w-24">
                          <Progress value={student.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{student.progress}%</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
