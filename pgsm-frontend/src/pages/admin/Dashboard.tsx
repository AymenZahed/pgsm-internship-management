import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Briefcase, FileText, AlertTriangle, ArrowRight, TrendingUp, UserPlus, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockStats = {
  totalUsers: 1250,
  hospitals: 45,
  activeInternships: 320,
  pendingApplications: 89,
};

const mockAlerts = [
  { id: "1", type: "error", message: "3 students have excessive absences", count: 3 },
  { id: "2", type: "warning", message: "5 evaluations are overdue", count: 5 },
  { id: "3", type: "info", message: "12 new user registrations pending approval", count: 12 },
];

const mockActivities = [
  {
    id: "1",
    type: "application" as const,
    title: "New Hospital Registered",
    description: "CHU Agadir joined the platform",
    time: "1h ago",
    status: "success" as const,
  },
  {
    id: "2",
    type: "internship" as const,
    title: "Batch Import Complete",
    description: "150 students imported successfully",
    time: "3h ago",
    status: "info" as const,
  },
  {
    id: "3",
    type: "message" as const,
    title: "Support Ticket",
    description: "New ticket from CHU Rabat",
    time: "5h ago",
    status: "warning" as const,
  },
  {
    id: "4",
    type: "evaluation" as const,
    title: "Monthly Report Ready",
    description: "November 2025 report is available",
    time: "1 day ago",
    status: "default" as const,
  },
];

const mockUserDistribution = [
  { role: "Students", count: 980, color: "bg-primary" },
  { role: "Doctors", count: 180, color: "bg-info" },
  { role: "Hospitals", count: 45, color: "bg-success" },
  { role: "Admins", count: 15, color: "bg-warning" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const totalUsers = mockUserDistribution.reduce((acc, item) => acc + item.count, 0);

  return (
    <AppLayout role="admin" userName="Admin Central">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">Platform Overview</h1>
            <p className="page-subtitle">Monitor and manage the entire PGSM platform</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Button className="gap-2" onClick={() => navigate("/admin/users/new")}>
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Priority Alerts */}
        {mockAlerts.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h3 className="font-semibold">Priority Alerts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {mockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    alert.type === "error" ? "bg-destructive/5 border-destructive/30" :
                    alert.type === "warning" ? "bg-warning/5 border-warning/30" :
                    "bg-info/5 border-info/30"
                  }`}
                >
                  <Badge
                    variant={
                      alert.type === "error" ? "destructive" :
                      alert.type === "warning" ? "default" : "secondary"
                    }
                  >
                    {alert.count}
                  </Badge>
                  <span className="text-sm flex-1">{alert.message}</span>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={mockStats.totalUsers.toLocaleString()}
            trend={{ value: 8, isPositive: true }}
            icon={Users}
            variant="primary"
            className="animate-slide-up stagger-1"
          />
          <StatCard
            title="Hospitals"
            value={mockStats.hospitals}
            subtitle="Across 12 cities"
            icon={Building2}
            variant="success"
            className="animate-slide-up stagger-2"
          />
          <StatCard
            title="Active Internships"
            value={mockStats.activeInternships}
            trend={{ value: 15, isPositive: true }}
            icon={Briefcase}
            variant="info"
            className="animate-slide-up stagger-3"
          />
          <StatCard
            title="Pending Applications"
            value={mockStats.pendingApplications}
            subtitle="Awaiting review"
            icon={FileText}
            variant="warning"
            className="animate-slide-up stagger-4"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts and Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Distribution */}
            <div className="stat-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg text-foreground">User Distribution</h3>
                <Button variant="ghost" size="sm" className="text-primary gap-1" onClick={() => navigate("/admin/users")}>
                  Manage Users
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {mockUserDistribution.map((item) => {
                  const percentage = Math.round((item.count / totalUsers) * 100);
                  return (
                    <div key={item.role} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.role}</span>
                        <span className="text-muted-foreground">
                          {item.count.toLocaleString()} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${item.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: UserPlus, label: "Add User", path: "/admin/users/new" },
                { icon: Building2, label: "Add Hospital", path: "/admin/hospitals/new" },
                { icon: TrendingUp, label: "View Reports", path: "/admin/reports" },
                { icon: Download, label: "Export Data", path: "/admin/export" },
              ].map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto py-4 flex-col items-center gap-2"
                  onClick={() => navigate(action.path)}
                >
                  <action.icon className="w-5 h-5 text-primary" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Platform Health */}
            <div className="stat-card">
              <h3 className="font-semibold text-foreground mb-4">Platform Health</h3>
              <div className="space-y-4">
                {[
                  { label: "System Status", value: "Operational", status: "success" },
                  { label: "Database", value: "Healthy", status: "success" },
                  { label: "API Response", value: "45ms", status: "success" },
                  { label: "Storage Used", value: "68%", status: "warning" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <Badge
                      variant={
                        item.status === "success" ? "default" :
                        item.status === "warning" ? "secondary" : "destructive"
                      }
                      className={
                        item.status === "success" ? "bg-success/10 text-success border-success/30" :
                        item.status === "warning" ? "bg-warning/10 text-warning border-warning/30" :
                        ""
                      }
                    >
                      {item.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Recent Activity</h3>
                <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/admin/logs")}>
                  View Logs
                </Button>
              </div>
              <ActivityFeed activities={mockActivities} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
