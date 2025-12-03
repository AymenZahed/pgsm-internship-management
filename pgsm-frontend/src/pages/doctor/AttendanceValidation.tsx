import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

const pendingAttendance = [
  {
    id: "1",
    studentName: "Ahmed Benali",
    studentAvatar: "/avatars/student1.jpg",
    date: "2025-01-20",
    time: "08:15 AM",
    status: "pending" as const,
  },
  {
    id: "2",
    studentName: "Fatima Zahra Ouardi",
    studentAvatar: "/avatars/student2.jpg",
    date: "2025-01-20",
    time: "08:05 AM",
    status: "pending" as const,
  },
];

const attendanceHistory = [
  {
    id: "3",
    studentName: "Ahmed Benali",
    date: "2025-01-19",
    status: "approved" as const,
    validatedAt: "2025-01-19 16:30",
  },
  {
    id: "4",
    studentName: "Fatima Zahra Ouardi",
    date: "2025-01-19",
    status: "approved" as const,
    validatedAt: "2025-01-19 16:30",
  },
  {
    id: "5",
    studentName: "Ahmed Benali",
    date: "2025-01-18",
    status: "rejected" as const,
    validatedAt: "2025-01-18 17:00",
    reason: "Did not complete full shift",
  },
];

export default function AttendanceValidation() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <AppLayout role="doctor" userName="Dr. Hassan Alami">
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Attendance Validation</h1>
          <p className="page-subtitle">Review and validate student attendance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingAttendance.length}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved Today</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <X className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected Today</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total This Week</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Select Date</h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="pending" className="space-y-4">
              <TabsList>
                <TabsTrigger value="pending">
                  Pending ({pendingAttendance.length})
                </TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {pendingAttendance.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Check className="w-12 h-12 text-success mx-auto mb-4" />
                    <h3 className="font-semibold">All Caught Up!</h3>
                    <p className="text-sm text-muted-foreground">No pending attendance to validate</p>
                  </Card>
                ) : (
                  pendingAttendance.map((record) => (
                    <Card key={record.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={record.studentAvatar} />
                            <AvatarFallback>{record.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{record.studentName}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(record.date).toLocaleDateString()} • Check-in: {record.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive">
                            <X className="w-4 h-4" />
                            Reject
                          </Button>
                          <Button variant="default" size="sm" className="gap-1">
                            <Check className="w-4 h-4" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {attendanceHistory.map((record) => (
                  <Card key={record.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{record.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.date).toLocaleDateString()} • Validated: {record.validatedAt}
                        </p>
                        {record.reason && (
                          <p className="text-sm text-destructive mt-1">{record.reason}</p>
                        )}
                      </div>
                      <Badge variant={record.status === "approved" ? "default" : "destructive"}>
                        {record.status === "approved" ? "Approved" : "Rejected"}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
