import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Search, Mail, Phone, Calendar, FileText, Eye, Loader2, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tutorService } from "@/services/tutor.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useAuth } from "@/contexts/AuthContext";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  email: string;
  phone?: string;
  student_number?: string;
  academic_year?: string;
  service_name?: string;
  hospital_name?: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: "active" | "completed";
  attendance_count?: number;
  user_id?: string;
}

export default function DoctorStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tutorService.getStudents();
      if (response.success && response.data) {
        // Calculate progress for each student
        const studentsWithProgress = response.data.map((student: any) => ({
          ...student,
          progress: calculateProgress(student.start_date, student.end_date),
          attendance_count: student.attendance_count || 0
        }));
        setStudents(studentsWithProgress);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (startDate: string, endDate: string): number => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();

    if (now <= start) return 0;
    if (now >= end) return 100;

    return Math.round(((now - start) / (end - start)) * 100);
  };

  const calculateAttendanceRate = (student: Student): number => {
    if (!student.attendance_count) return 0;
    const totalDays = Math.ceil((new Date(student.end_date).getTime() - new Date(student.start_date).getTime()) / (1000 * 60 * 60 * 24));
    return Math.round((student.attendance_count / totalDays) * 100);
  };

  const filteredStudents = students.filter(student =>
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeStudents = filteredStudents.filter(s => s.status === "active");
  const completedStudents = filteredStudents.filter(s => s.status === "completed");

  const averageAttendance = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + calculateAttendanceRate(s), 0) / students.length)
    : 0;

  const handleMessage = (student: Student) => {
    navigate(`/doctor/messages?to=${student.user_id}`);
  };

  if (loading) {
    return (
      <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}>
        <LoadingState message="Loading students..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}>
        <ErrorState message={error} onRetry={fetchStudents} />
      </AppLayout>
    );
  }

  return (
    <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}>
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
            <p className="text-2xl font-bold text-success">{averageAttendance}%</p>
          </Card>
        </div>

        {students.length === 0 ? (
          <EmptyState
            title="No students assigned"
            description="You don't have any students assigned to you yet"
          />
        ) : (
          <>
            {/* Active Students */}
            {activeStudents.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Active Students</h2>
                <div className="grid gap-4">
                  {activeStudents.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      attendanceRate={calculateAttendanceRate(student)}
                      onViewLogbook={() => navigate("/doctor/logbook")}
                      onViewDetails={() => navigate(`/doctor/students/${student.id}`)}
                      onMessage={() => handleMessage(student)}
                    />
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
                    <StudentCard
                      key={student.id}
                      student={student}
                      attendanceRate={calculateAttendanceRate(student)}
                      onViewLogbook={() => navigate("/doctor/logbook")}
                      onViewDetails={() => navigate(`/doctor/students/${student.id}`)}
                      onMessage={() => handleMessage(student)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

function StudentCard({ student, attendanceRate, onViewLogbook, onViewDetails, onMessage }: {
  student: Student;
  attendanceRate: number;
  onViewLogbook: () => void;
  onViewDetails: () => void;
  onMessage: () => void;
}) {
  const studentName = `${student.first_name} ${student.last_name}`;

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="w-16 h-16">
            <AvatarImage src={student.avatar} />
            <AvatarFallback>{student.first_name[0]}{student.last_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{studentName}</h3>
              <Badge variant={student.status === "active" ? "default" : "secondary"}>
                {student.status === "active" ? "Active" : "Completed"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {student.academic_year} • {student.service_name || 'General Rotation'}
            </p>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {student.email}
              </span>
              {student.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {student.phone}
                </span>
              )}
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
              <p className={`font-semibold ${attendanceRate >= 90 ? "text-success" : attendanceRate >= 80 ? "text-warning" : "text-destructive"}`}>
                {attendanceRate}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Period</p>
              <p className="font-medium text-xs">
                {new Date(student.start_date).toLocaleDateString()} - {new Date(student.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={onViewLogbook}>
              <FileText className="w-4 h-4" />
              Logbook
            </Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={onViewDetails}>
              <Eye className="w-4 h-4" />
              View
            </Button>
            <Button variant="outline" size="sm" onClick={onMessage}>
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
