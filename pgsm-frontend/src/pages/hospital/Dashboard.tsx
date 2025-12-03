import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "@/components/applications/ApplicationStatus";
import { Building2, FileText, Users, ClipboardList, Plus, ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockStats = {
  totalServices: 12,
  publishedOffers: 8,
  receivedApplications: 45,
  currentStudents: 23,
};

const mockRecentApplications = [
  { id: "1", student: "Ahmed Benali", offer: "Internal Medicine", status: "under_review" as const, date: "2h ago" },
  { id: "2", student: "Fatima Zahra", offer: "Pediatrics", status: "submitted" as const, date: "5h ago" },
  { id: "3", student: "Omar Hassan", offer: "Surgery", status: "accepted" as const, date: "1 day ago" },
  { id: "4", student: "Laila Amrani", offer: "Cardiology", status: "rejected" as const, date: "2 days ago" },
];

const mockActivities = [
  {
    id: "1",
    type: "application" as const,
    title: "New Application",
    description: "Ahmed Benali applied for Internal Medicine",
    time: "2h ago",
    status: "info" as const,
  },
  {
    id: "2",
    type: "internship" as const,
    title: "Internship Started",
    description: "3 students started their rotation",
    time: "1 day ago",
    status: "success" as const,
  },
  {
    id: "3",
    type: "evaluation" as const,
    title: "Evaluation Submitted",
    description: "Dr. Benali submitted 2 evaluations",
    time: "2 days ago",
    status: "default" as const,
  },
];

const mockServiceStats = [
  { name: "Internal Medicine", students: 5, capacity: 8 },
  { name: "Pediatrics", students: 4, capacity: 6 },
  { name: "Surgery", students: 6, capacity: 6 },
  { name: "Cardiology", students: 3, capacity: 5 },
];

export default function HospitalDashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout role="hospital" userName="CHU Mohammed VI">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">Hospital Dashboard</h1>
            <p className="page-subtitle">Manage your internship programs and applications</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/hospital/offers/new")}>
            <Plus className="w-4 h-4" />
            Publish New Offer
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Medical Services"
            value={mockStats.totalServices}
            subtitle="Active departments"
            icon={Building2}
            variant="primary"
            className="animate-slide-up stagger-1"
          />
          <StatCard
            title="Published Offers"
            value={mockStats.publishedOffers}
            subtitle="4 closing soon"
            icon={FileText}
            variant="info"
            className="animate-slide-up stagger-2"
          />
          <StatCard
            title="Applications"
            value={mockStats.receivedApplications}
            trend={{ value: 12, isPositive: true }}
            icon={ClipboardList}
            variant="warning"
            className="animate-slide-up stagger-3"
          />
          <StatCard
            title="Current Students"
            value={mockStats.currentStudents}
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
                  {mockRecentApplications.map((app) => (
                    <tr key={app.id}>
                      <td className="font-medium">{app.student}</td>
                      <td className="text-muted-foreground">{app.offer}</td>
                      <td>
                        <ApplicationStatus status={app.status} />
                      </td>
                      <td className="text-muted-foreground">{app.date}</td>
                      <td>
                        <Button variant="ghost" size="sm">
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Service Capacity */}
            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Service Capacity</h3>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div className="space-y-4">
                {mockServiceStats.map((service) => {
                  const percentage = Math.round((service.students / service.capacity) * 100);
                  const isFull = service.students >= service.capacity;
                  
                  return (
                    <div key={service.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{service.name}</span>
                        <span className="text-muted-foreground">
                          {service.students}/{service.capacity}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFull ? "bg-destructive" : percentage > 80 ? "bg-warning" : "bg-primary"
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="stat-card">
              <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
              <ActivityFeed activities={mockActivities} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto py-6 flex-col items-center gap-2"
            onClick={() => navigate("/hospital/offers/new")}
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
