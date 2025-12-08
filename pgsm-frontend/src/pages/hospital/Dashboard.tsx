import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Button } from "@/components/ui/button";
import { ApplicationStatus } from "@/components/applications/ApplicationStatus";
import { Building2, FileText, Users, ClipboardList, Plus, ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { hospitalService } from "@/services/hospital.service";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { useTranslation } from "react-i18next";

interface DashboardData {
  stats: {
    active_offers: number;
    pending_applications: number;
    current_interns: number;
    total_services: number;
    total_tutors: number;
  };
  recentApplications: any[];
  currentInterns: any[];
}

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await hospitalService.getDashboard();
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
      <AppLayout role="hospital">
        <LoadingState message={t("common.loading")} />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout role="hospital">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </AppLayout>
    );
  }

  const stats = dashboardData?.stats || {
    active_offers: 0,
    pending_applications: 0,
    current_interns: 0,
    total_services: 0,
    total_tutors: 0,
  };

  const recentApplications = dashboardData?.recentApplications || [];

  const mockActivities = recentApplications.slice(0, 3).map((app, i) => ({
    id: String(i),
    type: "application" as const,
    title: "New Application",
    description: `${app.first_name} ${app.last_name} applied for ${app.offer_title}`,
    time: new Date(app.created_at).toLocaleDateString(),
    status: app.status === 'pending' ? 'warning' : 'info' as "info" | "warning" | "success" | "default",
  }));

  const mapStatus = (s: string): "submitted" | "under_review" | "accepted" | "rejected" => {
    if (s === 'pending' || s === 'reviewing') return 'under_review';
    if (s === 'accepted') return 'accepted';
    if (s === 'rejected') return 'rejected';
    return 'submitted';
  };

  return (
    <AppLayout role="hospital">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">Hospital Dashboard</h1>
            <p className="page-subtitle">Manage your internship programs and applications</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/hospital/offers/create")}>
            <Plus className="w-4 h-4" />
            Publish New Offer
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Medical Services"
            value={stats.total_services}
            subtitle="Active departments"
            icon={Building2}
            variant="primary"
            className="animate-slide-up stagger-1"
          />
          <StatCard
            title="Published Offers"
            value={stats.active_offers}
            subtitle={`${stats.total_tutors} tutors available`}
            icon={FileText}
            variant="info"
            className="animate-slide-up stagger-2"
          />
          <StatCard
            title="Applications"
            value={stats.pending_applications}
            subtitle="Pending review"
            icon={ClipboardList}
            variant="warning"
            className="animate-slide-up stagger-3"
          />
          <StatCard
            title="Current Students"
            value={stats.current_interns}
            subtitle="Across all services"
            icon={Users}
            variant="success"
            className="animate-slide-up stagger-4"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <div className="lg:col-span-2 stat-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-foreground">Recent Applications</h3>
              <Button variant="ghost" size="sm" className="text-primary gap-1" onClick={() => navigate("/hospital/applications")}>
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            {recentApplications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Position</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.slice(0, 5).map((app) => (
                      <tr key={app.id}>
                        <td className="font-medium">{app.first_name} {app.last_name}</td>
                        <td className="text-muted-foreground">{app.offer_title}</td>
                        <td>
                          <ApplicationStatus status={mapStatus(app.status)} />
                        </td>
                        <td className="text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</td>
                        <td>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/hospital/applications/${app.id}`)}>
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No applications yet</p>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="stat-card">
              <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
              {mockActivities.length > 0 ? (
                <ActivityFeed activities={mockActivities} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto py-6 flex-col items-center gap-2"
            onClick={() => navigate("/hospital/offers/create")}
          >
            <FileText className="w-6 h-6 text-primary" />
            <span>Create New Offer</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex-col items-center gap-2"
            onClick={() => navigate("/hospital/applications")}
          >
            <ClipboardList className="w-6 h-6 text-primary" />
            <span>Review Applications</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex-col items-center gap-2"
            onClick={() => navigate("/hospital/statistics")}
          >
            <TrendingUp className="w-6 h-6 text-primary" />
            <span>View Statistics</span>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
