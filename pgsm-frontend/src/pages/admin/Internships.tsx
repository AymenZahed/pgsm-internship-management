import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Briefcase, Users, Clock, CheckCircle, Eye, Download, Calendar } from "lucide-react";
import { useState } from "react";

interface Internship {
  id: string;
  title: string;
  hospital: string;
  department: string;
  student: string;
  tutor: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: "active" | "completed" | "upcoming" | "cancelled";
}

const mockInternships: Internship[] = [
  { id: "1", title: "Cardiology Clinical Rotation", hospital: "CHU Ibn Sina", department: "Cardiology", student: "Youssef El Amrani", tutor: "Dr. Ahmed Benali", startDate: "2024-01-15", endDate: "2024-04-15", progress: 45, status: "active" },
  { id: "2", title: "Emergency Medicine", hospital: "CHU Ibn Sina", department: "Emergency", student: "Salma Benjelloun", tutor: "Dr. Fatima Zahra", startDate: "2024-01-10", endDate: "2024-03-10", progress: 68, status: "active" },
  { id: "3", title: "Pediatric Care", hospital: "CHU Mohammed VI", department: "Pediatrics", student: "Omar Tazi", tutor: "Dr. Khalid Mansouri", startDate: "2024-02-01", endDate: "2024-05-01", progress: 25, status: "active" },
  { id: "4", title: "General Surgery", hospital: "CHU Ibn Sina", department: "Surgery", student: "Amina Hassani", tutor: "Dr. Hassan Alami", startDate: "2023-10-01", endDate: "2024-01-01", progress: 100, status: "completed" },
  { id: "5", title: "Neurology Rotation", hospital: "CHU Mohammed VI", department: "Neurology", student: "Karim Idrissi", tutor: "Dr. Nadia Chraibi", startDate: "2024-03-01", endDate: "2024-06-01", progress: 0, status: "upcoming" },
  { id: "6", title: "Internal Medicine", hospital: "Hôpital Cheikh Khalifa", department: "Internal Medicine", student: "Leila Fassi", tutor: "Dr. Rachid Taoufik", startDate: "2024-01-05", endDate: "2024-02-05", progress: 30, status: "cancelled" },
];

export default function AdminInternships() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusBadge = (status: Internship["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-600">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/20 text-blue-600">Completed</Badge>;
      case "upcoming":
        return <Badge className="bg-amber-500/20 text-amber-600">Upcoming</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
    }
  };

  const hospitals = [...new Set(mockInternships.map(i => i.hospital))];

  const filteredInternships = mockInternships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHospital = hospitalFilter === "all" || internship.hospital === hospitalFilter;
    const matchesStatus = statusFilter === "all" || internship.status === statusFilter;
    return matchesSearch && matchesHospital && matchesStatus;
  });

  const stats = {
    total: mockInternships.length,
    active: mockInternships.filter(i => i.status === "active").length,
    completed: mockInternships.filter(i => i.status === "completed").length,
    upcoming: mockInternships.filter(i => i.status === "upcoming").length,
  };

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Internships Management</h1>
            <p className="text-muted-foreground mt-1">Monitor all internship programs</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Internships</p>
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
                <p className="text-sm text-muted-foreground">Active</p>
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
                <p className="text-2xl font-bold">{stats.upcoming}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search internships..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Hospital" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hospitals</SelectItem>
              {hospitals.map(hospital => (
                <SelectItem key={hospital} value={hospital}>{hospital}</SelectItem>
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

        {/* Internships Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Internship</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInternships.map((internship) => (
                  <TableRow key={internship.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{internship.title}</p>
                        <p className="text-xs text-muted-foreground">{internship.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{internship.student}</p>
                        <p className="text-xs text-muted-foreground">Tutor: {internship.tutor}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{internship.hospital}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(internship.startDate).toLocaleDateString()} - {new Date(internship.endDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(internship.status)}</TableCell>
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
