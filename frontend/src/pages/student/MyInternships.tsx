import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, Calendar, MapPin, User, FileText, Clock, Eye, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { studentService } from "@/services/student.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useDateFormat } from "@/hooks/useDateFormat";

interface Internship {
  id: string;
  title: string;
  hospital_name: string;
  hospital_city: string;
  tutor_name?: string;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "pending";
  progress?: number;
  attendance_rate?: number;
  final_grade?: string;
}

export default function MyInternships() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { formatDate } = useDateFormat();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeInternships, setActiveInternships] = useState<Internship[]>([]);
  const [completedInternships, setCompletedInternships] = useState<Internship[]>([]);

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true);
        setError(null);

        const [activeRes, completedRes] = await Promise.all([
          studentService.getMyInternships('active'),
          studentService.getMyInternships('completed'),
        ]);

        if (activeRes.success) {
          setActiveInternships(activeRes.data || []);
        }
        if (completedRes.success) {
          setCompletedInternships(completedRes.data || []);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, [t]);

  // Calculate progress based on dates
  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();

    if (now <= start) return 0;
    if (now >= end) return 100;

    return Math.round(((now - start) / (end - start)) * 100);
  };

  if (loading) {
    return (
      <AppLayout role="student" userName={user?.first_name || 'Student'}>
        <LoadingState message={t('common.loading')} />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout role="student" userName={user?.first_name || 'Student'}>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </AppLayout>
    );
  }

  return (
    <AppLayout role="student" userName={user?.first_name || 'Student'}>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">{t('nav.myInternships')}</h1>
          <p className="page-subtitle">{t('myInternships.subtitle', 'View your current and past internships')}</p>
        </div>

        {/* Active Internships */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">{t('myInternships.active', 'Active Internships')}</h2>
            <Badge variant="default">{activeInternships.length} {t('common.active')}</Badge>
          </div>

          {activeInternships.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">{t('myInternships.noActive', 'No active internships')}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/student/internships')}
              >
                {t('sidebar.browseInternships')}
              </Button>
            </Card>
          ) : (
            activeInternships.map((internship) => {
              const progress = internship.progress || calculateProgress(internship.start_date, internship.end_date);

              return (
                <Card key={internship.id} className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-base sm:text-lg">{internship.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{internship.hospital_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span>{internship.hospital_city}</span>
                          </div>
                          {internship.tutor_name && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4 flex-shrink-0" />
                              <span>{internship.tutor_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-success text-success-foreground w-fit">{t('common.active')}</Badge>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {t('myInternships.duration', 'Duration')}
                        </p>
                        <p className="font-medium text-sm">
                          {formatDate(internship.start_date)} - {formatDate(internship.end_date)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{t('myInternships.progress', 'Progress')}</p>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="flex-1" />
                          <span className="text-sm font-medium">{progress}%</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{t('myInternships.attendanceRate', 'Attendance Rate')}</p>
                        <p className="font-medium text-success">{internship.attendance_rate || 0}%</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 w-full sm:w-auto"
                        onClick={() => navigate('/student/logbook')}
                      >
                        <FileText className="w-4 h-4" />
                        {t('myInternships.viewLogbook', 'View Logbook')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 w-full sm:w-auto"
                        onClick={() => navigate('/student/attendance')}
                      >
                        <Clock className="w-4 h-4" />
                        {t('myInternships.markAttendance', 'Mark Attendance')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 w-full sm:w-auto"
                        onClick={() => navigate(`/student/my-internships/${internship.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                        {t('myInternships.viewDetails', 'View Details')}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Completed Internships */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">{t('myInternships.completed', 'Completed Internships')}</h2>
            <Badge variant="secondary">{completedInternships.length} {t('common.completed')}</Badge>
          </div>

          {completedInternships.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">{t('myInternships.noCompleted', 'No completed internships yet')}</p>
            </Card>
          ) : (
            completedInternships.map((internship) => (
              <Card key={internship.id} className="p-4 sm:p-6 bg-muted/30">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-base sm:text-lg">{internship.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{internship.hospital_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span>{internship.hospital_city}</span>
                        </div>
                        {internship.tutor_name && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span>{internship.tutor_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="w-fit">{t('common.completed')}</Badge>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {t('myInternships.duration', 'Duration')}
                      </p>
                      <p className="font-medium text-sm">
                        {formatDate(internship.start_date)} - {formatDate(internship.end_date)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {t('myInternships.finalGrade', 'Final Grade')}
                      </p>
                      <p className="font-medium text-success text-lg">{internship.final_grade || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 w-full sm:w-auto"
                      onClick={() => navigate('/student/logbook')}
                    >
                      <FileText className="w-4 h-4" />
                      {t('myInternships.viewLogbook', 'View Logbook')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 w-full sm:w-auto"
                      onClick={() => navigate(`/student/my-internships/${internship.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                      {t('myInternships.viewDetails', 'View Details')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
