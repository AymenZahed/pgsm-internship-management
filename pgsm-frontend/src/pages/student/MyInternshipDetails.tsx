import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft,
  FileText,
  CheckCircle,
  Award,
  TrendingUp
} from "lucide-react";

const mockInternshipData = {
  "1": {
    id: "1",
    title: "Pediatrics Rotation",
    hospital: "Hôpital d'Enfants",
    service: "Pediatrics",
    location: "Rabat",
    tutor: "Dr. Hassan Alami",
    tutorTitle: "Head of Pediatrics",
    startDate: "2025-01-15",
    endDate: "2025-03-15",
    progress: 45,
    attendanceRate: 92,
    status: "active" as const,
    schedule: "Monday - Friday, 8:00 AM - 4:00 PM",
    description: "This rotation provides comprehensive exposure to pediatric medicine, covering diagnosis and management of common childhood conditions.",
    completedTasks: 12,
    totalTasks: 25,
    logbookEntries: 18,
    evaluations: 2,
  },
  "2": {
    id: "2",
    title: "Internal Medicine",
    hospital: "CHU Ibn Rochd",
    service: "Internal Medicine",
    location: "Casablanca",
    tutor: "Dr. Fatima Zahra",
    tutorTitle: "Senior Physician",
    startDate: "2024-10-01",
    endDate: "2024-12-01",
    progress: 100,
    attendanceRate: 95,
    status: "completed" as const,
    schedule: "Monday - Friday, 8:00 AM - 4:00 PM",
    description: "Comprehensive internal medicine rotation covering diagnosis and management of adult medical conditions.",
    completedTasks: 30,
    totalTasks: 30,
    logbookEntries: 45,
    evaluations: 4,
    finalGrade: "A",
  },
};

export default function MyInternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const internship = mockInternshipData[id as keyof typeof mockInternshipData];

  if (!internship) {
    return (
      <AppLayout role="student" userName="Ahmed Benali">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('common.notFound', 'Internship not found')}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/student/my-internships')}
          >
            {t('common.back', 'Go Back')}
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isActive = internship.status === "active";

  return (
    <AppLayout role="student" userName="Ahmed Benali">
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/student/my-internships")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('myInternships.backToInternships', 'Back to My Internships')}
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
                  <Badge className={isActive ? "bg-success text-success-foreground" : ""} variant={isActive ? "default" : "secondary"}>
                    {isActive ? t('common.active') : t('common.completed')}
                  </Badge>
                  {'finalGrade' in internship && internship.finalGrade && (
                    <Badge variant="outline" className="gap-1">
                      <Award className="w-3 h-3" />
                      {t('myInternships.grade', 'Grade')}: {internship.finalGrade}
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold">{internship.title}</h1>
                <p className="text-base sm:text-lg text-muted-foreground">{internship.hospital}</p>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {internship.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 flex-shrink-0" />
                  {internship.tutor}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  {internship.schedule}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Section */}
            <Card className="p-4 sm:p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {t('myInternships.progress', 'Progress')}
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{t('myInternships.overallProgress', 'Overall Progress')}</span>
                    <span className="font-medium">{internship.progress}%</span>
                  </div>
                  <Progress value={internship.progress} className="h-3" />
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{internship.attendanceRate}%</p>
                    <p className="text-xs text-muted-foreground">{t('myInternships.attendanceRate', 'Attendance')}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{internship.completedTasks}/{internship.totalTasks}</p>
                    <p className="text-xs text-muted-foreground">{t('myInternships.tasks', 'Tasks')}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{internship.logbookEntries}</p>
                    <p className="text-xs text-muted-foreground">{t('myInternships.logbookEntries', 'Logbook Entries')}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{internship.evaluations}</p>
                    <p className="text-xs text-muted-foreground">{t('myInternships.evaluations', 'Evaluations')}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-4 sm:p-6">
              <h2 className="font-semibold text-lg mb-4">{t('common.description', 'Description')}</h2>
              <p className="text-muted-foreground">
                {internship.description}
              </p>
            </Card>

            {/* Quick Actions */}
            {isActive && (
              <Card className="p-4 sm:p-6">
                <h2 className="font-semibold text-lg mb-4">{t('myInternships.quickActions', 'Quick Actions')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="gap-2 justify-start"
                    onClick={() => navigate('/student/logbook')}
                  >
                    <FileText className="w-4 h-4" />
                    {t('myInternships.viewLogbook', 'View Logbook')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2 justify-start"
                    onClick={() => navigate('/student/attendance')}
                  >
                    <Clock className="w-4 h-4" />
                    {t('myInternships.markAttendance', 'Mark Attendance')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2 justify-start"
                    onClick={() => navigate('/student/evaluations')}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('myInternships.viewEvaluations', 'View Evaluations')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2 justify-start"
                    onClick={() => navigate('/student/messages')}
                  >
                    <User className="w-4 h-4" />
                    {t('myInternships.contactTutor', 'Contact Tutor')}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Details */}
            <Card className="p-4 sm:p-6">
              <h2 className="font-semibold text-lg mb-4">{t('common.details', 'Key Details')}</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('common.startDate', 'Start Date')}</p>
                    <p className="font-medium">{new Date(internship.startDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('common.endDate', 'End Date')}</p>
                    <p className="font-medium">{new Date(internship.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('common.service', 'Service')}</p>
                    <p className="font-medium">{internship.service}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tutor */}
            <Card className="p-4 sm:p-6">
              <h2 className="font-semibold text-lg mb-4">{t('myInternships.tutor', 'Tutor')}</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{internship.tutor}</p>
                  <p className="text-sm text-muted-foreground">{internship.tutorTitle}</p>
                </div>
              </div>
              {isActive && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4 gap-2"
                  onClick={() => navigate('/student/messages')}
                >
                  {t('myInternships.sendMessage', 'Send Message')}
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
