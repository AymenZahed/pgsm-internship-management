import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Briefcase, FileText, AlertTriangle, ArrowRight, TrendingUp, UserPlus, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { adminService } from "@/services/admin.service";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <AppLayout role="admin" userName="Admin"><LoadingState message="Loading dashboard..." /></AppLayout>;
  if (error) return <AppLayout role="admin" userName="Admin"><ErrorState message={error} onRetry={fetchDashboard} /></AppLayout>;

  const stats = dashboardData?.stats || {};
  const alerts = dashboardData?.alerts || {};
  const recentActivity = dashboardData?.recentActivity || [];

  const mockAlerts = [
    alerts.overdue_applications > 0 && { id: "1", type: "error", message: `${alerts.overdue_applications} applications pending review`, count: alerts.overdue_applications },
    alerts.overdue_evaluations > 0 && { id: "2", type: "warning", message: `${alerts.overdue_evaluations} evaluations overdue`, count: alerts.overdue_evaluations },
    alerts.inactive_users > 0 && { id: "3", type: "info", message: `${alerts.inactive_users} inactive users`, count: alerts.inactive_users },
  ].filter(Boolean);

  const activities = recentActivity.map((a: any, i: number) => ({
    id: String(i),
    type: "application" as const,
    title: `New ${a.status}`,
    description: a.description,
    time: new Date(a.created_at).toLocaleDateString(),
    status: "success" as const,
  }));

  const totalUsers = (stats.total_students || 0) + (stats.total_doctors || 0) + (stats.total_hospitals || 0);
  const userDistribution = [
    { role: "Students", count: stats.total_students || 0, color: "bg-primary" },
    { role: "Doctors", count: stats.total_doctors || 0, color: "bg-info" },
    { role: "Hospitals", count: stats.total_hospitals || 0, color: "bg-success" },
  ];

  return (
    <AppLayout role="admin" userName="Admin Central">
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">Platform Overview</h1>
            <p className="page-subtitle">Monitor and manage the entire PGSM platform</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => navigate("/admin/reports")}>
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Button className="gap-2" onClick={() => navigate("/admin/users")}>
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </div>

        {mockAlerts.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h3 className="font-semibold">Priority Alerts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {mockAlerts.map((alert: any) => (
                <div key={alert.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                  alert.type === "error" ? "bg-destructive/5 border-destructive/30" :
                  alert.type === "warning" ? "bg-warning/5 border-warning/30" : "bg-info/5 border-info/30"
                }`}>
                  <Badge variant={alert.type === "error" ? "destructive" : "default"}>{alert.count}</Badge>
                  <span className="text-sm flex-1">{alert.message}</span>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={totalUsers.toLocaleString()} trend={{ value: 8, isPositive: true }} icon={Users} variant="primary" className="animate-slide-up stagger-1" />
          <StatCard title="Hospitals" value={stats.total_hospitals || 0} subtitle="Partner hospitals" icon={Building2} variant="success" className="animate-slide-up stagger-2" />
          <StatCard title="Active Internships" value={stats.active_internships || 0} trend={{ value: 15, isPositive: true }} icon={Briefcase} variant="info" className="animate-slide-up stagger-3" />
          <StatCard title="Pending Applications" value={stats.pending_applications || 0} subtitle="Awaiting review" icon={FileText} variant="warning" className="animate-slide-up stagger-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg text-foreground">User Distribution</h3>
                <Button variant="ghost" size="sm" className="text-primary gap-1" onClick={() => navigate("/admin/users")}>
                  Manage Users <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {userDistribution.map((item) => {
                  const percentage = totalUsers > 0 ? Math.round((item.count / totalUsers) * 100) : 0;
                  return (
                    <div key={item.role} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.role}</span>
                        <span className="text-muted-foreground">{item.count.toLocaleString()} ({percentage}%)</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${item.color}`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: UserPlus, label: "Add User", path: "/admin/users" },
                { icon: Building2, label: "Add Hospital", path: "/admin/hospitals" },
                { icon: TrendingUp, label: "View Reports", path: "/admin/reports" },
                { icon: Download, label: "Statistics", path: "/admin/statistics" },
              ].map((action) => (
                <Button key={action.label} variant="outline" className="h-auto py-4 flex-col items-center gap-2" onClick={() => navigate(action.path)}>
                  <action.icon className="w-5 h-5 text-primary" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="stat-card">
              <h3 className="font-semibold text-foreground mb-4">Platform Health</h3>
              <div className="space-y-4">
                {[
                  { label: "System Status", value: "Operational", status: "success" },
                  { label: "Active Users", value: stats.active_users || 0, status: "success" },
                  { label: "Active Offers", value: stats.active_offers || 0, status: "success" },
                  { label: "New Today", value: stats.new_users_today || 0, status: "info" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <Badge variant="default" className={
                      item.status === "success" ? "bg-success/10 text-success border-success/30" :
                      item.status === "warning" ? "bg-warning/10 text-warning border-warning/30" : ""
                    }>{item.value}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Recent Activity</h3>
                <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/admin/logs")}>View Logs</Button>
              </div>
              <ActivityFeed activities={activities.slice(0, 5)} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
