import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, Calendar, FileText, Star, Clock, CheckCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const studentData = {
  id: "1",
  name: "Ahmed Benali",
  avatar: "/avatars/student1.jpg",
  email: "ahmed.benali@fmp.ac.ma",
  phone: "+212 6 12 34 56 78",
  year: "4th Year",
  faculty: "Faculty of Medicine and Pharmacy - Rabat",
  internship: "Pediatrics Rotation",
  startDate: "2025-01-15",
  endDate: "2025-03-15",
  progress: 45,
  attendanceRate: 92,
  status: "active" as const,
};

const recentLogEntries = [
  { date: "2025-01-20", activities: "Observed pediatric consultations", status: "approved" },
  { date: "2025-01-19", activities: "Participated in morning rounds", status: "approved" },
  { date: "2025-01-18", activities: "Patient examinations practice", status: "pending" },
];

const attendanceRecords = [
  { date: "2025-01-20", checkIn: "08:15", checkOut: "17:00", status: "present" },
  { date: "2025-01-19", checkIn: "08:22", checkOut: "17:05", status: "present" },
  { date: "2025-01-18", checkIn: "08:30", checkOut: "16:45", status: "present" },
];

export default function DoctorStudentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <AppLayout role="doctor" userName="Dr. Hassan Alami">
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
              <AvatarFallback className="text-2xl">{studentData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{studentData.name}</h1>
                <Badge variant={studentData.status === "active" ? "default" : "secondary"}>
                  {studentData.status === "active" ? "Active" : "Completed"}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-3">{studentData.year} • {studentData.faculty}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {studentData.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {studentData.phone}
                </span>
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
              <Progress value={studentData.progress} className="w-16 h-2" />
              <span className="text-xl font-bold">{studentData.progress}%</span>
            </div>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Attendance</p>
            <p className={`text-xl font-bold ${studentData.attendanceRate >= 90 ? "text-success" : "text-warning"}`}>
              {studentData.attendanceRate}%
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="text-lg font-semibold">{new Date(studentData.startDate).toLocaleDateString()}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">End Date</p>
            <p className="text-lg font-semibold">{new Date(studentData.endDate).toLocaleDateString()}</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="logbook" className="space-y-4">
          <TabsList>
            <TabsTrigger value="logbook">Recent Logbook</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="logbook" className="space-y-3">
            {recentLogEntries.map((entry, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      entry.status === "approved" ? "bg-success/10" : "bg-warning/10"
                    }`}>
                      {entry.status === "approved" ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <Clock className="w-5 h-5 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{entry.activities}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={entry.status === "approved" ? "default" : "secondary"}>
                    {entry.status}
                  </Badge>
                </div>
              </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={() => navigate("/doctor/logbook")}>
              View All Entries
            </Button>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-3">
            {attendanceRecords.map((record, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Check-in: {record.checkIn} • Check-out: {record.checkOut}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">Present</Badge>
                </div>
              </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={() => navigate("/doctor/attendance")}>
              View All Attendance
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
