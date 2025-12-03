import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Check, X, Clock } from "lucide-react";
import { useState } from "react";

const attendanceRecords = [
  { date: "2025-01-20", status: "present" as const, signedBy: "Dr. Hassan Alami" },
  { date: "2025-01-19", status: "present" as const, signedBy: "Dr. Hassan Alami" },
  { date: "2025-01-18", status: "present" as const, signedBy: "Dr. Hassan Alami" },
  { date: "2025-01-17", status: "absent" as const, signedBy: "Dr. Hassan Alami" },
  { date: "2025-01-16", status: "present" as const, signedBy: "Dr. Hassan Alami" },
];

export default function Attendance() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const presentDays = attendanceRecords.filter(r => r.status === "present").length;
  const totalDays = attendanceRecords.length;
  const attendanceRate = Math.round((presentDays / totalDays) * 100);

  return (
    <AppLayout role="student" userName="Ahmed Benali">
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track your internship attendance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
              <p className="text-3xl font-bold text-success">{attendanceRate}%</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Present Days</p>
              <p className="text-3xl font-bold">{presentDays}/{totalDays}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current Internship</p>
              <p className="text-lg font-semibold">Pediatrics Rotation</p>
              <p className="text-sm text-muted-foreground">Hôpital d'Enfants, Rabat</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Calendar View</h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </Card>

          {/* Recent Records */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Recent Records</h3>
            <div className="space-y-3">
              {attendanceRecords.map((record) => (
                <div
                  key={record.date}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      record.status === "present" ? "bg-success/10" : "bg-destructive/10"
                    }`}>
                      {record.status === "present" ? (
                        <Check className="w-5 h-5 text-success" />
                      ) : (
                        <X className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(record.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">Signed by {record.signedBy}</p>
                    </div>
                  </div>
                  <Badge variant={record.status === "present" ? "default" : "destructive"}>
                    {record.status === "present" ? "Present" : "Absent"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Today's Attendance */}
        <Card className="p-6 border-primary/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">Today's Attendance</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <Button variant="hero" size="lg">Mark Present</Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
