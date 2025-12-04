import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, CalendarCheck, BookOpen, Star, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { tutorService } from "@/services/tutor.service";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";

interface DashboardData {
  stats: {
    current_students: number;
    pending_attendance: number;
    logbooks_to_review: number;
    pending_evaluations: number;
  };
  students: any[];
  pending_tasks: any[];
  activities: any[];
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await tutorService.getDashboard();
        if (response.success) {
          setDashboardData(response.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AppLayout role="doctor">
        <LoadingState message="Loading dashboard..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout role="doctor">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </AppLayout>
    );
  }

  const stats = dashboardData?.stats || {
    current_students: 0,
    pending_attendance: 0,
    logbooks_to_review: 0,
    pending_evaluations: 0,
  };

  const students = dashboardData?.students || [];
  const pendingTasks = dashboardData?.pending_tasks || [];

  const activities = (dashboardData?.activities || []).map((a: any, i: number) => ({
    id: String(i),
    type: a.type || "application",
    title: a.title,
    description: a.description,
    time: a.time || new Date(a.created_at).toLocaleDateString(),
    status: a.status || "default",
  }));

  return (
    <AppLayout role="doctor">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Doctor Dashboard</h1>
          <p className="page-subtitle">Here's an overview of your students and pending tasks</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Current Students"
            value={stats.current_students}
            subtitle="Under your supervision"
            icon={Users}
            variant="primary"
            className="animate-slide-up stagger-1"
          />
          <StatCard
            title="Pending Attendance"
            value={stats.pending_attendance}
            subtitle="Needs validation"
            icon={CalendarCheck}
            variant="warning"
            className="animate-slide-up stagger-2"
          />
          <StatCard
            title="Logbooks to Review"
            value={stats.logbooks_to_review}
            subtitle="Awaiting approval"
            icon={BookOpen}
            variant="info"
            className="animate-slide-up stagger-3"
          />
          <StatCard
            title="Pending Evaluations"
            value={stats.pending_evaluations}
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
            {pendingTasks.some((t: any) => t.urgent) && (
              <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-warning-foreground">Urgent Tasks</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You have {pendingTasks.filter((t: any) => t.urgent).length} urgent tasks requiring immediate attention
                  </p>
                </div>
              </div>
            )}

            {/* Pending Tasks List */}
            <div className="stat-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg text-foreground">Pending Tasks</h3>
                <Badge variant="secondary">{pendingTasks.length} pending</Badge>
              </div>
              
              <div className="space-y-3">
                {pendingTasks.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No pending tasks</p>
                ) : (
                  pendingTasks.map((task: any, index: number) => (
                    <div
                      key={task.id || index}
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
                        <p className="font-medium text-foreground">{task.student_name || task.student}</p>
                        <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                      </div>
                      {task.urgent && (
                        <Badge variant="destructive" className="animate-pulse-soft">Urgent</Badge>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (task.type === "attendance") navigate("/doctor/attendance");
                          else if (task.type === "logbook") navigate("/doctor/logbook");
                          else if (task.type === "evaluation") navigate("/doctor/evaluations");
                        }}
                      >
                        Take Action
                      </Button>
                    </div>
                  ))
                )}
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
                {students.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No students assigned</p>
                ) : (
                  students.slice(0, 4).map((student: any) => (
                    <div key={student.id} className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {student.name?.split(" ").map((n: string) => n[0]).join("") || student.first_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{student.name || `${student.first_name} ${student.last_name}`}</p>
                        <p className="text-xs text-muted-foreground">{student.year || student.university}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          (student.attendance || student.attendance_rate) >= 90 ? "text-success" :
                          (student.attendance || student.attendance_rate) >= 80 ? "text-warning" :
                          "text-destructive"
                        }`}>
                          {student.attendance || student.attendance_rate || 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Attendance</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="stat-card">
              <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
              {activities.length > 0 ? (
                <ActivityFeed activities={activities} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
