import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { InternshipCard } from "@/components/internships/InternshipCard";
import { Button } from "@/components/ui/button";
import { FileText, ClipboardList, CalendarCheck, Star, ArrowRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { studentService } from "@/services/student.service";
import { offerService } from "@/services/offer.service";
import { userService } from "@/services/user.service";
import { documentService } from "@/services/document.service";
import { useEffect, useState } from "react";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";

interface DashboardData {
  stats: {
    total_applications: number;
    pending_applications: number;
    accepted_applications: number;
    active_internships: number;
    completed_internships: number;
    average_score: number | null;
  };
  deadlines: any[];
  activities: any[];
}

interface ProfileCompletion {
  progress: number;
  items: { label: string; completed: boolean }[];
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recommendedOffers, setRecommendedOffers] = useState<any[]>([]);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion>({
    progress: 0,
    items: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, offersRes, profileRes, documentsRes] = await Promise.all([
          studentService.getDashboard(),
          offerService.getAllOffers({ limit: 4 }),
          userService.getProfile(),
          documentService.getProfileDocuments(),
        ]);

        if (dashboardRes.success) {
          setDashboardData(dashboardRes.data);
        }
        if (offersRes.success) {
          setRecommendedOffers(offersRes.data || []);
        }

        // Calculate profile completion from real data
        if (profileRes.success && profileRes.data) {
          const userData = profileRes.data;
          const profile = userData.profile || {};
          const docs = documentsRes.success && documentsRes.data ? documentsRes.data : [];

          const hasCv = docs.some((d: any) => d.type === "cv");
          const hasTranscript = docs.some((d: any) => d.type === "transcript");

          const items = [
            {
              label: t("dashboard.profile.personalInfo"),
              completed: !!(userData.first_name && userData.last_name && userData.email)
            },
            {
              label: t("dashboard.profile.academicDetails"),
              completed: !!(profile.faculty && profile.department && profile.academic_year)
            },
            {
              label: t("dashboard.profile.uploadCV"),
              completed: hasCv && hasTranscript
            },
            {
              label: t("dashboard.profile.emergencyContact"),
              completed: !!(profile.emergency_contact && profile.emergency_phone)
            },
          ];

          const completedCount = items.filter(item => item.completed).length;
          const progress = Math.round((completedCount / items.length) * 100);

          setProfileCompletion({ progress, items });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const mockActivities = dashboardData?.activities?.map((a: any, i: number) => ({
    id: String(i),
    type: a.type as "application" | "evaluation" | "message" | "internship",
    title: a.type === 'application' ? t("dashboard.activities.applicationSubmitted") : t("dashboard.activities.evaluationReceived"),
    description: a.description,
    time: new Date(a.created_at).toLocaleDateString(),
    status: a.status === 'pending' ? 'warning' : a.status === 'accepted' ? 'success' : 'info' as "info" | "success" | "warning" | "default",
  })) || [];

  const requiredActions = dashboardData?.deadlines?.length ?
    dashboardData.deadlines.map(d => ({ label: `${d.title} - ${t("dashboard.actions.deadline")}: ${new Date(d.application_deadline).toLocaleDateString()}`, urgent: true })) :
    [];

  if (loading) {
    return (
      <AppLayout role="student">
        <LoadingState message={t("common.loading")} />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout role="student">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </AppLayout>
    );
  }

  const stats = {
    total_applications: dashboardData?.stats?.total_applications || 0,
    pending_applications: dashboardData?.stats?.pending_applications || 0,
    active_internships: dashboardData?.stats?.active_internships || 0,
    completed_internships: dashboardData?.stats?.completed_internships || 0,
    accepted_applications: dashboardData?.stats?.accepted_applications || 0,
    average_score: dashboardData?.stats?.average_score || 0,
  };

  return (
    <AppLayout role="student">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">{t("dashboard.welcomeBack", { name: user?.first_name || "Student" })} 👋</h1>
          <p className="page-subtitle">{t("dashboard.overviewSubtitle")}</p>
        </div>

        {/* Required Actions Alert */}
        {requiredActions.length > 0 && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-warning-foreground">{t("dashboard.requiredActions")}</h3>
              <ul className="mt-2 space-y-1">
                {requiredActions.map((action, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className={action.urgent ? "text-warning font-medium" : ""}>
                      {action.urgent && "• "}{action.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <Button variant="warning" size="sm" onClick={() => navigate("/student/internships")}>
              {t("dashboard.completeNow")}
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t("nav.applications")}
            value={stats.total_applications}
            subtitle={t("dashboard.stats.pendingReview", { count: stats.pending_applications })}
            icon={FileText}
            variant="primary"
            className="animate-slide-up stagger-1"
          />
          <StatCard
            title={t("dashboard.stats.activeInternships")}
            value={stats.active_internships}
            subtitle={stats.active_internships > 0 ? t("dashboard.stats.pediatricsAtCHU") : t("common.none")}
            icon={ClipboardList}
            variant="success"
            className="animate-slide-up stagger-2"
          />
          <StatCard
            title={t("dashboard.stats.attendanceRate")}
            value={`${stats.average_score ? Math.round(stats.average_score) : 0}%`}
            icon={CalendarCheck}
            variant="info"
            className="animate-slide-up stagger-3"
          />
          <StatCard
            title={t("nav.evaluations")}
            value={stats.accepted_applications}
            subtitle={stats.accepted_applications > 0 ? t("dashboard.stats.newEvaluation") : t("common.none")}
            icon={Star}
            variant="warning"
            className="animate-slide-up stagger-4"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activity & Profile */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Completion */}
            <ProgressCard
              title={t("dashboard.profileCompletion")}
              progress={profileCompletion.progress}
              description={t("dashboard.profileDescription")}
              items={profileCompletion.items}
            />

            {/* Recent Activity */}
            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">{t("dashboard.recentActivity")}</h3>
                <Button variant="ghost" size="sm" className="text-primary">
                  {t("common.viewAll")}
                </Button>
              </div>
              {mockActivities.length > 0 ? (
                <ActivityFeed activities={mockActivities} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t("common.noData")}</p>
              )}
            </div>
          </div>

          {/* Right Column - Recommended Internships */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{t("dashboard.recommendedInternships")}</h3>
                <p className="text-sm text-muted-foreground">{t("dashboard.basedOnPreferences")}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/student/internships")}
                className="gap-2"
              >
                {t("dashboard.browseAll")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {recommendedOffers.length > 0 ? (
                recommendedOffers.map((offer, index) => (
                  <InternshipCard
                    key={offer.id}
                    id={offer.id}
                    title={offer.title}
                    hospital={offer.hospital_name}
                    service={offer.service_name || offer.department}
                    location={offer.hospital_city}
                    startDate={new Date(offer.start_date).toLocaleDateString()}
                    endDate={new Date(offer.end_date).toLocaleDateString()}
                    spotsAvailable={offer.positions - offer.filled_positions}
                    totalSpots={offer.positions}
                    deadline={offer.application_deadline ? new Date(offer.application_deadline).toLocaleDateString() : undefined}
                    tags={[offer.type, offer.department].filter(Boolean)}
                    onApply={(id) => navigate(`/student/internships/${id}/apply`)}
                    onViewDetails={(id) => navigate(`/student/internships/${id}`)}
                    className={`animate-slide-up stagger-${index + 1}`}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  {t("common.noData")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
