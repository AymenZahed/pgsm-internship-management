import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Users, CalendarCheck, BookOpen, Star, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockStats = {
  currentStudents: 6,
  pendingAttendance: 3,
  logbooksToReview: 5,
  pendingEvaluations: 2,
};

const mockStudents = [
  { id: "1", name: "Ahmed Benali", year: "4th Year", period: "Jan 15 - Mar 15", attendance: 92, avatar: "" },
  { id: "2", name: "Fatima Zahra", year: "5th Year", period: "Jan 10 - Mar 10", attendance: 88, avatar: "" },
  { id: "3", name: "Omar Hassan", year: "4th Year", period: "Jan 20 - Mar 20", attendance: 95, avatar: "" },
  { id: "4", name: "Laila Amrani", year: "3rd Year", period: "Feb 1 - Apr 1", attendance: 78, avatar: "" },
];

const mockPendingTasks = [
  { id: "1", type: "attendance", student: "Ahmed Benali", description: "Validate attendance for Dec 15", urgent: true },
  { id: "2", type: "logbook", student: "Fatima Zahra", description: "Review logbook entry", urgent: false },
  { id: "3", type: "evaluation", student: "Omar Hassan", description: "Mid-term evaluation due", urgent: true },
  { id: "4", type: "attendance", student: "Laila Amrani", description: "Validate attendance for Dec 14", urgent: false },
];

const mockActivities = [
  {
    id: "1",
    type: "evaluation" as const,
    title: "Evaluation Completed",
    description: "Final evaluation for Mohamed Ali",
    time: "1h ago",
    status: "success" as const,
  },
  {
    id: "2",
    type: "application" as const,
    title: "Logbook Approved",
    description: "Approved logbook entry for Fatima",
    time: "3h ago",
    status: "default" as const,
  },
  {
    id: "3",
    type: "message" as const,
    title: "New Message",
    description: "Ahmed Benali sent you a question",
    time: "1 day ago",
    status: "info" as const,
  },
];

export default function DoctorDashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout role="doctor" userName="Dr. Hassan Benjelloun">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Welcome back, Dr. Hassan!</h1>
          <p className="page-subtitle">Here's an overview of your students and pending tasks</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Current Students"
            value={mockStats.currentStudents}
            subtitle="Under your supervision"
            icon={Users}
            variant="primary"
            className="animate-slide-up stagger-1"
          />
          <StatCard
            title="Pending Attendance"
            value={mockStats.pendingAttendance}
            subtitle="Needs validation"
            icon={CalendarCheck}
            variant="warning"
            className="animate-slide-up stagger-2"
          />
          <StatCard
            title="Logbooks to Review"
            value={mockStats.logbooksToReview}
            subtitle="Awaiting approval"
            icon={BookOpen}
            variant="info"
            className="animate-slide-up stagger-3"
          />
          <StatCard
            title="Pending Evaluations"
            value={mockStats.pendingEvaluations}
            subtitle="Due this week"
            icon={Star}
            variant="success"
            className="animate-slide-up stagger-4"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Urgent Tasks Alert */}
            {mockPendingTasks.some((t) => t.urgent) && (
              <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-warning-foreground">Urgent Tasks</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You have {mockPendingTasks.filter((t) => t.urgent).length} urgent tasks requiring immediate attention
                  </p>
                </div>
              </div>
            )}

            {/* Pending Tasks List */}
            <div className="stat-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg text-foreground">Pending Tasks</h3>
                <Badge variant="secondary">{mockPendingTasks.length} pending</Badge>
              </div>
              
              <div className="space-y-3">
                {mockPendingTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all animate-fade-in ${
                      task.urgent
                        ? "bg-warning/5 border-warning/30"
                        : "bg-muted/30 border-border"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      task.type === "attendance" ? "bg-primary/10 text-primary" :
                      task.type === "logbook" ? "bg-info/10 text-info" :
                      "bg-success/10 text-success"
                    }`}>
                      {task.type === "attendance" ? <CalendarCheck className="w-5 h-5" /> :
                       task.type === "logbook" ? <BookOpen className="w-5 h-5" /> :
                       <Star className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{task.student}</p>
                      <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                    </div>
                    {task.urgent && (
                      <Badge variant="destructive" className="animate-pulse-soft">Urgent</Badge>
                    )}
                    <Button variant="outline" size="sm">
                      Take Action
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* My Students */}
            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">My Students</h3>
                <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/doctor/students")}>
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {mockStudents.slice(0, 4).map((student) => (
                  <div key={student.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {student.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.year}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        student.attendance >= 90 ? "text-success" :
                        student.attendance >= 80 ? "text-warning" :
                        "text-destructive"
                      }`}>
                        {student.attendance}%
                      </p>
                      <p className="text-xs text-muted-foreground">Attendance</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="stat-card">
              <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
              <ActivityFeed activities={mockActivities} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
