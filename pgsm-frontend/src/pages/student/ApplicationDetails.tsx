import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ApplicationStatus } from "@/components/applications/ApplicationStatus";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from "lucide-react";

type ApplicationStatusType = "submitted" | "under_review" | "accepted" | "rejected";

interface ApplicationData {
  id: string;
  internshipId: string;
  internship: string;
  hospital: string;
  service: string;
  location: string;
  appliedDate: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: ApplicationStatusType;
  motivationLetter: string;
  submittedDocuments: string[];
  timeline: {
    date: string;
    event: string;
    status: "completed" | "current" | "pending";
  }[];
}

const mockApplicationData: Record<string, ApplicationData> = {
  "1": {
    id: "1",
    internshipId: "1",
    internship: "Cardiology Internship",
    hospital: "CHU Ibn Rochd",
    service: "Cardiology",
    location: "Casablanca",
    appliedDate: "2025-01-10",
    startDate: "2025-02-01",
    endDate: "2025-04-01",
    duration: "8 weeks",
    status: "under_review",
    motivationLetter: "I am passionate about cardiology and eager to gain hands-on experience in this field. My academic background and previous clinical rotations have prepared me well for this opportunity...",
    submittedDocuments: ["CV", "Motivation Letter", "Transcript", "Insurance Certificate"],
    timeline: [
      { date: "2025-01-10", event: "Application submitted", status: "completed" },
      { date: "2025-01-12", event: "Documents verified", status: "completed" },
      { date: "2025-01-15", event: "Under review by hospital", status: "current" },
      { date: "-", event: "Final decision", status: "pending" },
    ],
  },
  "2": {
    id: "2",
    internshipId: "2",
    internship: "Pediatrics Rotation",
    hospital: "Hôpital d'Enfants",
    service: "Pediatrics",
    location: "Rabat",
    appliedDate: "2025-01-05",
    startDate: "2025-02-15",
    endDate: "2025-04-15",
    duration: "8 weeks",
    status: "accepted",
    motivationLetter: "Working with children has always been my calling. I believe this rotation will help me develop essential skills in pediatric care...",
    submittedDocuments: ["CV", "Motivation Letter", "Transcript", "Insurance Certificate", "Vaccination Record"],
    timeline: [
      { date: "2025-01-05", event: "Application submitted", status: "completed" },
      { date: "2025-01-07", event: "Documents verified", status: "completed" },
      { date: "2025-01-10", event: "Under review by hospital", status: "completed" },
      { date: "2025-01-14", event: "Application accepted", status: "completed" },
    ],
  },
  "3": {
    id: "3",
    internshipId: "3",
    internship: "Surgery Observation",
    hospital: "CHU Mohammed VI",
    service: "General Surgery",
    location: "Marrakech",
    appliedDate: "2024-12-20",
    startDate: "2025-01-15",
    endDate: "2025-03-15",
    duration: "8 weeks",
    status: "rejected",
    motivationLetter: "Surgery has fascinated me since my early years in medical school. I am eager to observe and learn from experienced surgeons...",
    submittedDocuments: ["CV", "Motivation Letter", "Transcript"],
    timeline: [
      { date: "2024-12-20", event: "Application submitted", status: "completed" },
      { date: "2024-12-22", event: "Documents verified", status: "completed" },
      { date: "2024-12-28", event: "Under review by hospital", status: "completed" },
      { date: "2025-01-05", event: "Application rejected", status: "completed" },
    ],
  },
};

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const application = mockApplicationData[id as keyof typeof mockApplicationData];

  if (!application) {
    return (
      <AppLayout role="student" userName="Ahmed Benali">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('common.notFound', 'Application not found')}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/student/applications')}
          >
            {t('common.back', 'Go Back')}
          </Button>
        </div>
      </AppLayout>
    );
  }

  const getStatusIcon = (status: ApplicationStatusType) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <AlertCircle className="w-5 h-5 text-warning" />;
    }
  };

  const getTimelineIcon = (status: "completed" | "current" | "pending") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "current":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <AppLayout role="student" userName="Ahmed Benali">
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/student/applications")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('applications.backToApplications', 'Back to Applications')}
        </Button>

        {/* Header Card */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <ApplicationStatus status={application.status} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold">{application.internship}</h1>
                <p className="text-base sm:text-lg text-muted-foreground">{application.hospital}</p>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  {application.service}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {application.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  {application.duration}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => navigate(`/student/internships/${application.internshipId}`)}
              >
                <Eye className="w-4 h-4" />
                {t('applications.viewInternship', 'View Internship')}
              </Button>
              {(application.status === "under_review" || application.status === "submitted") && (
                <Button 
                  variant="outline" 
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  {t('applications.cancel', 'Cancel Application')}
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <Card className="p-4 sm:p-6">
              <h2 className="font-semibold text-lg mb-4">{t('applications.timeline', 'Application Timeline')}</h2>
              <div className="space-y-4">
                {application.timeline.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getTimelineIcon(item.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${item.status === "pending" ? "text-muted-foreground" : ""}`}>
                        {item.event}
                      </p>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Motivation Letter */}
            <Card className="p-4 sm:p-6">
              <h2 className="font-semibold text-lg mb-4">{t('applications.motivationLetter', 'Motivation Letter')}</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {application.motivationLetter}
              </p>
            </Card>

            {/* Submitted Documents */}
            <Card className="p-4 sm:p-6">
              <h2 className="font-semibold text-lg mb-4">{t('applications.submittedDocuments', 'Submitted Documents')}</h2>
              <div className="space-y-2">
                {application.submittedDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{doc}</span>
                    <CheckCircle className="w-4 h-4 text-success ml-auto flex-shrink-0" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Details */}
            <Card className="p-4 sm:p-6">
              <h2 className="font-semibold text-lg mb-4">{t('applications.applicationDetails', 'Application Details')}</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('applications.applied', 'Applied')}</p>
                    <p className="font-medium">{new Date(application.appliedDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('common.startDate', 'Start Date')}</p>
                    <p className="font-medium">{new Date(application.startDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('common.endDate', 'End Date')}</p>
                    <p className="font-medium">{new Date(application.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Status Card */}
            <Card className={`p-4 sm:p-6 ${
              application.status === "accepted" ? "bg-success/5 border-success/20" :
              application.status === "rejected" ? "bg-destructive/5 border-destructive/20" :
              "bg-warning/5 border-warning/20"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon(application.status)}
                <h2 className="font-semibold text-lg">{t('applications.status', 'Status')}</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {application.status === "accepted" && t('applications.acceptedMessage', 'Congratulations! Your application has been accepted. Please check your email for next steps.')}
                {application.status === "rejected" && t('applications.rejectedMessage', 'Unfortunately, your application was not accepted. You can apply to other internships.')}
                {(application.status === "under_review" || application.status === "submitted") && t('applications.pendingMessage', 'Your application is being reviewed. You will be notified once a decision is made.')}
              </p>
              {application.status === "accepted" && (
                <Button 
                  className="w-full mt-4 gap-2"
                  onClick={() => navigate('/student/my-internships')}
                >
                  {t('applications.goToMyInternships', 'Go to My Internships')}
                </Button>
              )}
              {application.status === "rejected" && (
                <Button 
                  variant="outline"
                  className="w-full mt-4 gap-2"
                  onClick={() => navigate('/student/internships')}
                >
                  {t('applications.browseMore', 'Browse More Internships')}
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
