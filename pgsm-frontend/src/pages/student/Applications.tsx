import { AppLayout } from "@/components/layout/AppLayout";
import { ApplicationStatus } from "@/components/applications/ApplicationStatus";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, Calendar, MapPin, Eye, X, FileText } from "lucide-react";

type ApplicationStatusType = "submitted" | "under_review" | "accepted" | "rejected";

interface Application {
  id: string;
  internshipId: string;
  internship: string;
  hospital: string;
  location: string;
  appliedDate: string;
  startDate: string;
  status: ApplicationStatusType;
}

const mockApplications: Application[] = [
  {
    id: "1",
    internshipId: "1",
    internship: "Cardiology Internship",
    hospital: "CHU Ibn Rochd",
    location: "Casablanca",
    appliedDate: "2025-01-10",
    startDate: "2025-02-01",
    status: "under_review",
  },
  {
    id: "2",
    internshipId: "2",
    internship: "Pediatrics Rotation",
    hospital: "Hôpital d'Enfants",
    location: "Rabat",
    appliedDate: "2025-01-05",
    startDate: "2025-02-15",
    status: "accepted",
  },
  {
    id: "3",
    internshipId: "3",
    internship: "Surgery Observation",
    hospital: "CHU Mohammed VI",
    location: "Marrakech",
    appliedDate: "2024-12-20",
    startDate: "2025-01-15",
    status: "rejected",
  },
];

export default function Applications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const pendingApps = mockApplications.filter(app => app.status === "under_review" || app.status === "submitted");
  const acceptedApps = mockApplications.filter(app => app.status === "accepted");
  const rejectedApps = mockApplications.filter(app => app.status === "rejected");

  return (
    <AppLayout role="student" userName="Ahmed Benali">
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">{t('sidebar.myApplications')}</h1>
          <p className="page-subtitle">{t('applications.subtitle', 'Track your internship applications')}</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex w-auto min-w-full md:min-w-0">
              <TabsTrigger value="all" className="flex-shrink-0">
                {t('common.all')} ({mockApplications.length})
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
            {mockApplications.length === 0 ? (
              <EmptyState onBrowse={() => navigate('/student/internships')} />
            ) : (
              mockApplications.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingApps.length === 0 ? (
              <EmptyState onBrowse={() => navigate('/student/internships')} />
            ) : (
              pendingApps.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {acceptedApps.length === 0 ? (
              <EmptyState onBrowse={() => navigate('/student/internships')} />
            ) : (
              acceptedApps.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedApps.length === 0 ? (
              <EmptyState onBrowse={() => navigate('/student/internships')} />
            ) : (
              rejectedApps.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id, internship, hospital, location, appliedDate, startDate, status } = application;

  return (
    <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header - Title and Status */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-base sm:text-lg">{internship}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{hospital}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{location}</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <ApplicationStatus status={status} />
          </div>
        </div>

        {/* Dates */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">{t('applications.applied', 'Applied')}:</span>
            <span className="font-medium">{new Date(appliedDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">{t('applications.startDate', 'Start Date')}:</span>
            <span className="font-medium">{new Date(startDate).toLocaleDateString()}</span>
          </div>
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
          {(status === "under_review" || status === "submitted") && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-destructive hover:text-destructive w-full sm:w-auto"
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

function EmptyState({ onBrowse }: { onBrowse: () => void }) {
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
