import { AppLayout } from "@/components/layout/AppLayout";
import { ApplicationStatus } from "@/components/applications/ApplicationStatus";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, Calendar, MapPin, Eye, X, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { applicationService, Application } from "@/services/application.service";
import { LoadingState, ErrorState, EmptyState as EmptyStateUI } from "@/components/ui/loading-state";
import { toast } from "sonner";

type ApplicationStatusType = "pending" | "reviewing" | "accepted" | "rejected" | "withdrawn";

export default function Applications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getMyApplications();
      if (response.success) {
        setApplications(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id: string) => {
    try {
      const response = await applicationService.withdrawApplication(id);
      if (response.success) {
        toast.success(t("applications.withdrawSuccess"));
        fetchApplications();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to withdraw application");
    }
  };
  
  const pendingApps = applications.filter(app => app.status === "reviewing" || app.status === "pending");
  const acceptedApps = applications.filter(app => app.status === "accepted");
  const rejectedApps = applications.filter(app => app.status === "rejected");

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
        <ErrorState message={error} onRetry={fetchApplications} />
      </AppLayout>
    );
  }

  return (
    <AppLayout role="student">
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">{t('sidebar.myApplications')}</h1>
          <p className="page-subtitle">{t('applications.subtitle', 'Track your internship applications')}</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex w-auto min-w-full md:min-w-0">
              <TabsTrigger value="all" className="flex-shrink-0">
                {t('common.all')} ({applications.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex-shrink-0">
                {t('common.pending')} ({pendingApps.length})
              </TabsTrigger>
              <TabsTrigger value="accepted" className="flex-shrink-0">
                {t('common.approved')} ({acceptedApps.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex-shrink-0">
                {t('common.rejected')} ({rejectedApps.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-4">
            {applications.length === 0 ? (
              <EmptyApplicationState onBrowse={() => navigate('/student/internships')} />
            ) : (
              applications.map((app) => (
                <ApplicationCard key={app.id} application={app} onWithdraw={handleWithdraw} />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingApps.length === 0 ? (
              <EmptyApplicationState onBrowse={() => navigate('/student/internships')} />
            ) : (
              pendingApps.map((app) => (
                <ApplicationCard key={app.id} application={app} onWithdraw={handleWithdraw} />
              ))
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {acceptedApps.length === 0 ? (
              <EmptyApplicationState onBrowse={() => navigate('/student/internships')} />
            ) : (
              acceptedApps.map((app) => (
                <ApplicationCard key={app.id} application={app} onWithdraw={handleWithdraw} />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedApps.length === 0 ? (
              <EmptyApplicationState onBrowse={() => navigate('/student/internships')} />
            ) : (
              rejectedApps.map((app) => (
                <ApplicationCard key={app.id} application={app} onWithdraw={handleWithdraw} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function ApplicationCard({ application, onWithdraw }: { application: Application; onWithdraw: (id: string) => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id, offer_title, hospital_name, hospital_city, created_at, start_date, status } = application;

  const mapStatus = (s: string): "submitted" | "under_review" | "accepted" | "rejected" => {
    if (s === 'pending' || s === 'reviewing') return 'under_review';
    if (s === 'accepted') return 'accepted';
    if (s === 'rejected') return 'rejected';
    return 'submitted';
  };

  return (
    <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header - Title and Status */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-base sm:text-lg">{offer_title}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{hospital_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{hospital_city}</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <ApplicationStatus status={mapStatus(status)} />
          </div>
        </div>

        {/* Dates */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">{t('applications.applied', 'Applied')}:</span>
            <span className="font-medium">{new Date(created_at).toLocaleDateString()}</span>
          </div>
          {start_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">{t('applications.startDate', 'Start Date')}:</span>
              <span className="font-medium">{new Date(start_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 w-full sm:w-auto"
            onClick={() => navigate(`/student/applications/${id}`)}
          >
            <Eye className="w-4 h-4" />
            {t('applications.viewDetails', 'View Details')}
          </Button>
          {(status === "reviewing" || status === "pending") && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-destructive hover:text-destructive w-full sm:w-auto"
              onClick={() => onWithdraw(id)}
            >
              <X className="w-4 h-4" />
              {t('applications.cancel', 'Cancel Application')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function EmptyApplicationState({ onBrowse }: { onBrowse: () => void }) {
  const { t } = useTranslation();
  
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{t('applications.noApplications', 'No applications yet')}</h3>
      <p className="text-muted-foreground mb-4">
        {t('applications.noApplicationsDesc', 'Start by browsing available internships')}
      </p>
      <Button onClick={onBrowse}>
        {t('sidebar.browseInternships')}
      </Button>
    </div>
  );
}
