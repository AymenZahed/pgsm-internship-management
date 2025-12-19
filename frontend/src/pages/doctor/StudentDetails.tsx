import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, Calendar, FileText, Star, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { tutorService } from "@/services/tutor.service";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { useAuth } from "@/contexts/AuthContext";

export default function DoctorStudentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchStudentDetails();
    }
  }, [id]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tutorService.getStudentById(id!);
      if (response.success && response.data) {
        setStudentData(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load student details');
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

  const calculateAttendanceRate = (): number => {
    if (!studentData?.attendance || studentData.attendance.length === 0) return 0;
    const approvedCount = studentData.attendance.filter((a: any) =>
      a.status === 'approved' || a.status === 'present'
    ).length;
    const totalDays = Math.ceil(
      (new Date(studentData.end_date).getTime() - new Date(studentData.start_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.round((approvedCount / totalDays) * 100);
  };

  if (loading) {
    return (
      <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}>
        <LoadingState message="Loading student details..." />
      </AppLayout>
    );
  }

  if (error || !studentData) {
    return (
      <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}>
        <ErrorState message={error || 'Student not found'} onRetry={fetchStudentDetails} />
      </AppLayout>
    );
  }

  const progress = calculateProgress(studentData.start_date, studentData.end_date);
  const attendanceRate = calculateAttendanceRate();
  const studentName = `${studentData.first_name} ${studentData.last_name}`;

  return (
    <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/doctor/students")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Button>

        {/* Student Header */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={studentData.avatar} />
              <AvatarFallback className="text-2xl">
                {studentData.first_name[0]}{studentData.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{studentName}</h1>
                <Badge variant={studentData.status === "active" ? "default" : "secondary"}>
                  {studentData.status === "active" ? "Active" : "Completed"}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-3">
                {studentData.academic_year} • {studentData.faculty}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {studentData.email}
                </span>
                {studentData.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {studentData.phone}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/doctor/logbook")}>
                <FileText className="w-4 h-4 mr-2" />
                Review Logbook
              </Button>
              <Button variant="hero" onClick={() => navigate("/doctor/evaluations")}>
                <Star className="w-4 h-4 mr-2" />
                Evaluate
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Progress</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Progress value={progress} className="w-16 h-2" />
              <span className="text-xl font-bold">{progress}%</span>
            </div>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Attendance</p>
            <p className={`text-xl font-bold ${attendanceRate >= 90 ? "text-success" : attendanceRate >= 80 ? "text-warning" : "text-destructive"}`}>
              {attendanceRate}%
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="text-lg font-semibold">
              {new Date(studentData.start_date).toLocaleDateString()}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">End Date</p>
            <p className="text-lg font-semibold">
              {new Date(studentData.end_date).toLocaleDateString()}
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="logbook" className="space-y-4">
          <TabsList>
            <TabsTrigger value="logbook">
              Recent Logbook ({studentData.logbookEntries?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="attendance">
              Attendance ({studentData.attendance?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logbook" className="space-y-3">
            {!studentData.logbookEntries || studentData.logbookEntries.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No logbook entries yet</p>
              </Card>
            ) : (
              <>
                {studentData.logbookEntries.map((entry: any) => (
                  <Card key={entry.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${entry.status === "approved" ? "bg-success/10" :
                            entry.status === "revision_requested" ? "bg-destructive/10" : "bg-warning/10"
                          }`}>
                          {entry.status === "approved" ? (
                            <CheckCircle className="w-5 h-5 text-success" />
                          ) : (
                            <Clock className="w-5 h-5 text-warning" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{entry.title || entry.activities}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString('en-US', {
                              weekday: 'long', month: 'long', day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        entry.status === "approved" ? "default" :
                          entry.status === "revision_requested" ? "destructive" : "secondary"
                      }>
                        {entry.status === "revision_requested" ? "Revision Requested" : entry.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
                <Button variant="outline" className="w-full" onClick={() => navigate("/doctor/logbook")}>
                  View All Entries
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="attendance" className="space-y-3">
            {!studentData.attendance || studentData.attendance.length === 0 ? (
              <Card className="p-8 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No attendance records yet</p>
              </Card>
            ) : (
              <>
                {studentData.attendance.slice(0, 10).map((record: any) => (
                  <Card key={record.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${record.status === 'approved' || record.status === 'present'
                            ? 'bg-success/10' : 'bg-destructive/10'
                          }`}>
                          <CheckCircle className={`w-5 h-5 ${record.status === 'approved' || record.status === 'present'
                              ? 'text-success' : 'text-destructive'
                            }`} />
                        </div>
                        <div>
                          <p className="font-medium">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'long', month: 'long', day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {record.check_in && record.check_out
                              ? `Check-in: ${record.check_in} • Check-out: ${record.check_out}`
                              : 'No check-in/out times'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        record.status === 'approved' || record.status === 'present'
                          ? 'default' : 'destructive'
                      }>
                        {record.status === 'approved' || record.status === 'present' ? 'Present' : record.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
                <Button variant="outline" className="w-full" onClick={() => navigate("/doctor/attendance")}>
                  View All Attendance
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
