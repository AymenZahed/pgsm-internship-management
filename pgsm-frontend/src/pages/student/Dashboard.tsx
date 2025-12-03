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

const mockStats = {
  applications: 3,
  activeInternships: 1,
  attendanceRate: 92,
  evaluations: 2,
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  useLanguage();

  const mockActivities = [
    {
      id: "1",
      type: "application" as const,
      title: t("dashboard.activities.applicationSubmitted"),
      description: t("dashboard.activities.cardiologyInternship"),
      time: t("dashboard.activities.hoursAgo", { count: 2 }),
      status: "info" as const,
    },
    {
      id: "2",
      type: "evaluation" as const,
      title: t("dashboard.activities.evaluationReceived"),
      description: t("dashboard.activities.midTermEvaluation"),
      time: t("dashboard.activities.dayAgo", { count: 1 }),
      status: "success" as const,
    },
    {
      id: "3",
      type: "message" as const,
      title: t("dashboard.activities.newMessage"),
      description: t("dashboard.activities.doctorSentMessage"),
      time: t("dashboard.activities.daysAgo", { count: 2 }),
      status: "default" as const,
    },
    {
      id: "4",
      type: "internship" as const,
      title: t("dashboard.activities.internshipStartingSoon"),
      description: t("dashboard.activities.pediatricsStarts"),
      time: t("dashboard.activities.daysAgo", { count: 3 }),
      status: "warning" as const,
    },
  ];

  const mockRecommendedInternships = [
    {
      id: "1",
      title: t("dashboard.internships.internalMedicine"),
      hospital: "CHU Mohammed VI",
      service: t("dashboard.internships.internalMedicineService"),
      location: "Marrakech",
      startDate: "Jan 15",
      endDate: "Mar 15",
      spotsAvailable: 3,
      totalSpots: 5,
      deadline: "Dec 30",
      tags: [t("dashboard.internships.fourthYear"), t("dashboard.internships.required")],
    },
    {
      id: "2",
      title: t("dashboard.internships.surgeryObservation"),
      hospital: "Hôpital Ibn Sina",
      service: t("dashboard.internships.generalSurgery"),
      location: "Rabat",
      startDate: "Feb 1",
      endDate: "Apr 1",
      spotsAvailable: 1,
      totalSpots: 4,
      deadline: "Jan 15",
      tags: [t("dashboard.internships.fifthYear"), t("dashboard.internships.elective")],
    },
  ];

  const profileCompletion = {
    progress: 75,
    items: [
      { label: t("dashboard.profile.personalInfo"), completed: true },
      { label: t("dashboard.profile.academicDetails"), completed: true },
      { label: t("dashboard.profile.uploadCV"), completed: true },
      { label: t("dashboard.profile.emergencyContact"), completed: false },
    ],
  };

  const requiredActions = [
    { label: t("dashboard.actions.completeProfile"), urgent: true },
    { label: t("dashboard.actions.submitLogbook"), urgent: false },
    { label: t("dashboard.actions.reviewEvaluation"), urgent: false },
  ];

  return (
    <AppLayout role="student" userName="Ahmed Benali">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">{t("dashboard.welcomeBack", { name: "Ahmed" })} 👋</h1>
          <p className="page-subtitle">{t("dashboard.overviewSubtitle")}</p>
        </div>

        {/* Required Actions Alert */}
        {requiredActions.some((a) => a.urgent) && (
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
            <Button variant="warning" size="sm">
              {t("dashboard.completeNow")}
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t("nav.applications")}
            value={mockStats.applications}
            subtitle={t("dashboard.stats.pendingReview", { count: 2 })}
            icon={FileText}
            variant="primary"
            className="animate-slide-up stagger-1"
          />
          <StatCard
            title={t("dashboard.stats.activeInternships")}
            value={mockStats.activeInternships}
            subtitle={t("dashboard.stats.pediatricsAtCHU")}
            icon={ClipboardList}
            variant="success"
            className="animate-slide-up stagger-2"
          />
          <StatCard
            title={t("dashboard.stats.attendanceRate")}
            value={`${mockStats.attendanceRate}%`}
            trend={{ value: 5, isPositive: true }}
            icon={CalendarCheck}
            variant="info"
            className="animate-slide-up stagger-3"
          />
          <StatCard
            title={t("nav.evaluations")}
            value={mockStats.evaluations}
            subtitle={t("dashboard.stats.newEvaluation")}
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
              <ActivityFeed activities={mockActivities} />
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
              {mockRecommendedInternships.map((internship, index) => (
                <InternshipCard
                  key={internship.id}
                  {...internship}
                  onApply={(id) => navigate(`/student/apply/${id}`)}
                  onViewDetails={(id) => navigate(`/student/internships/${id}`)}
                  className={`animate-slide-up stagger-${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
