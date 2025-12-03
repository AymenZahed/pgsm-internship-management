import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Search, Mail, Phone, Calendar, FileText, Eye } from "lucide-react";
import { useState } from "react";

const students = [
  {
    id: "1",
    name: "Ahmed Benali",
    avatar: "/avatars/student1.jpg",
    email: "ahmed.benali@fmp.ac.ma",
    phone: "+212 6 12 34 56 78",
    year: "4th Year",
    internship: "Pediatrics Rotation",
    startDate: "2025-01-15",
    endDate: "2025-03-15",
    progress: 45,
    attendanceRate: 92,
    status: "active" as const,
  },
  {
    id: "2",
    name: "Fatima Zahra Ouardi",
    avatar: "/avatars/student2.jpg",
    email: "fatima.ouardi@fmp.ac.ma",
    phone: "+212 6 22 33 44 55",
    year: "5th Year",
    internship: "Pediatrics Rotation",
    startDate: "2025-01-15",
    endDate: "2025-03-15",
    progress: 48,
    attendanceRate: 100,
    status: "active" as const,
  },
  {
    id: "3",
    name: "Youssef Amrani",
    avatar: "/avatars/student3.jpg",
    email: "youssef.amrani@fmp.ac.ma",
    phone: "+212 6 33 44 55 66",
    year: "4th Year",
    internship: "Pediatrics Rotation",
    startDate: "2024-11-01",
    endDate: "2025-01-01",
    progress: 100,
    attendanceRate: 88,
    status: "completed" as const,
  },
];

export default function DoctorStudents() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeStudents = filteredStudents.filter(s => s.status === "active");
  const completedStudents = filteredStudents.filter(s => s.status === "completed");

  return (
    <AppLayout role="doctor" userName="Dr. Hassan Alami">
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">My Students</h1>
          <p className="page-subtitle">Manage students under your supervision</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search students..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Active Students</p>
            <p className="text-2xl font-bold text-primary">{activeStudents.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Completed Rotations</p>
            <p className="text-2xl font-bold">{completedStudents.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Average Attendance</p>
            <p className="text-2xl font-bold text-success">
              {Math.round(students.reduce((acc, s) => acc + s.attendanceRate, 0) / students.length)}%
            </p>
          </Card>
        </div>

        {/* Active Students */}
        {activeStudents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Active Students</h2>
            <div className="grid gap-4">
              {activeStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completedStudents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Completed Rotations</h2>
            <div className="grid gap-4">
              {completedStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StudentCard({ student }: { student: typeof students[0] }) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="w-16 h-16">
            <AvatarImage src={student.avatar} />
            <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{student.name}</h3>
              <Badge variant={student.status === "active" ? "default" : "secondary"}>
                {student.status === "active" ? "Active" : "Completed"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{student.year} • {student.internship}</p>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {student.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {student.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Progress</p>
              <div className="flex items-center gap-2">
                <Progress value={student.progress} className="w-20 h-2" />
                <span className="font-medium">{student.progress}%</span>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Attendance</p>
              <p className={`font-semibold ${student.attendanceRate >= 90 ? "text-success" : student.attendanceRate >= 80 ? "text-warning" : "text-destructive"}`}>
                {student.attendanceRate}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Period</p>
              <p className="font-medium text-xs">
                {new Date(student.startDate).toLocaleDateString()} - {new Date(student.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <FileText className="w-4 h-4" />
              Logbook
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Eye className="w-4 h-4" />
              View
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
