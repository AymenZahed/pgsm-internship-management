import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, GraduationCap, Calendar, Clock, MessageSquare, FileText, Check, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function StudentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const student = {
    id: "1",
    name: "Youssef El Amrani",
    email: "y.elamrani@um5.ac.ma",
    phone: "+212 661 123 456",
    university: "Université Mohammed V",
    faculty: "Faculty of Medicine and Pharmacy",
    year: "4th Year",
    gpa: "15.5/20",
    department: "Cardiology",
    tutor: "Dr. Ahmed Benali",
    startDate: "2024-01-15",
    endDate: "2024-04-15",
    progress: 45,
    attendance: 92,
    status: "active" as const,
    address: "123 Rue Hassan II, Rabat",
    emergencyContact: "+212 622 456 789",
  };

  const attendanceRecords = [
    { date: "2024-01-29", checkIn: "08:15", checkOut: "16:30", status: "present" },
    { date: "2024-01-28", checkIn: "08:00", checkOut: "16:45", status: "present" },
    { date: "2024-01-27", checkIn: "-", checkOut: "-", status: "weekend" },
    { date: "2024-01-26", checkIn: "08:30", checkOut: "16:00", status: "present" },
    { date: "2024-01-25", checkIn: "-", checkOut: "-", status: "absent" },
    { date: "2024-01-24", checkIn: "08:10", checkOut: "16:20", status: "present" },
  ];

  const logbookEntries = [
    { date: "2024-01-29", title: "ECG Interpretation Session", status: "approved" },
    { date: "2024-01-28", title: "Ward Round Participation", status: "approved" },
    { date: "2024-01-26", title: "Patient History Taking", status: "pending" },
    { date: "2024-01-24", title: "Echocardiography Observation", status: "approved" },
  ];

  const evaluations = [
    { name: "Clinical Skills", score: 85, maxScore: 100 },
    { name: "Communication", score: 90, maxScore: 100 },
    { name: "Professionalism", score: 88, maxScore: 100 },
    { name: "Medical Knowledge", score: 82, maxScore: 100 },
  ];

  const getAttendanceStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-500/20 text-green-600">Present</Badge>;
      case "absent":
        return <Badge className="bg-red-500/20 text-red-600">Absent</Badge>;
      case "weekend":
        return <Badge variant="secondary">Weekend</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-lg">{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{student.name}</h1>
                <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Active</Badge>
              </div>
              <p className="text-muted-foreground mt-1">{student.university} • {student.year}</p>
            </div>
          </div>
          <Button>
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Progress</p>
              <div className="mt-2">
                <Progress value={student.progress} className="h-2" />
                <p className="text-lg font-bold mt-1">{student.progress}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
              <p className="text-2xl font-bold text-green-600">{student.attendance}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">GPA</p>
              <p className="text-2xl font-bold">{student.gpa}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Days Remaining</p>
              <p className="text-2xl font-bold">
                {Math.ceil((new Date(student.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="logbook">Logbook</TabsTrigger>
            <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {student.email}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {student.phone}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">University</p>
                      <p className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        {student.university}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Faculty</p>
                      <p>{student.faculty}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Emergency Contact</p>
                      <p>{student.emergencyContact}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p>{student.address}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {logbookEntries.slice(0, 3).map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{entry.title}</p>
                            <p className="text-sm text-muted-foreground">{entry.date}</p>
                          </div>
                          <Badge variant={entry.status === "approved" ? "default" : "secondary"}>
                            {entry.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Internship Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium">{student.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tutor</span>
                      <span className="font-medium">{student.tutor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span className="font-medium">{new Date(student.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date</span>
                      <span className="font-medium">{new Date(student.endDate).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skills Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {evaluations.map((eval_, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{eval_.name}</span>
                          <span className="font-medium">{eval_.score}%</span>
                        </div>
                        <Progress value={eval_.score} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>Recent attendance history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {attendanceRecords.map((record, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{record.date}</span>
                        {record.status === "present" && (
                          <>
                            <span className="text-sm text-muted-foreground">In: {record.checkIn}</span>
                            <span className="text-sm text-muted-foreground">Out: {record.checkOut}</span>
                          </>
                        )}
                      </div>
                      {getAttendanceStatusBadge(record.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logbook">
            <Card>
              <CardHeader>
                <CardTitle>Logbook Entries</CardTitle>
                <CardDescription>Learning activities and experiences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {logbookEntries.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{entry.title}</p>
                        <p className="text-sm text-muted-foreground">{entry.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={entry.status === "approved" ? "default" : "secondary"}>
                          {entry.status}
                        </Badge>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluations">
            <Card>
              <CardHeader>
                <CardTitle>Performance Evaluations</CardTitle>
                <CardDescription>Assessment scores across different competencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {evaluations.map((eval_, idx) => (
                    <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{eval_.name}</span>
                        <span className="text-lg font-bold">{eval_.score}/{eval_.maxScore}</span>
                      </div>
                      <Progress value={eval_.score} className="h-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
