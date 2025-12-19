import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Check,
  X,
  Loader2,
  User,
  Building,
  Target,
  Star
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  studentService,
  Student,
  LogbookEntry,
  Evaluation,
  Application
} from "@/services/student.service";

export default function StudentDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState({
    student: true,
    logbook: false,
    evaluations: false,
    applications: false
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStudentData();
    }
  }, [id]);

  useEffect(() => {
    if (student && activeTab !== "overview") {
      fetchTabData();
    }
  }, [activeTab, student]);

  const fetchStudentData = async () => {
    try {
      setLoading(prev => ({ ...prev, student: true }));
      const studentRes = await studentService.getStudentById(id!);

      if (studentRes.success) {
        setStudent(studentRes.data);
        // Load initial tab data
        fetchOverviewData(id!);
      } else {
        toast.error(studentRes.message || "Failed to load student data");
        navigate(-1);
      }
    } catch (error) {
      toast.error("Failed to load student data");
      console.error(error);
      navigate(-1);
    } finally {
      setLoading(prev => ({ ...prev, student: false }));
    }
  };

  const fetchOverviewData = async (studentId: string) => {
    try {
      // Fetch initial data for overview
      const [logbookRes, evaluationsRes] = await Promise.all([
        studentService.getStudentLogbook(studentId, { limit: 3 }),
        studentService.getStudentEvaluations(studentId)
      ]);

      if (logbookRes.success) {
        setLogbookEntries(logbookRes.data || []);
      }

      if (evaluationsRes.success) {
        setEvaluations(evaluationsRes.data || []);
      }
    } catch (error) {
      console.error("Failed to load overview data:", error);
    }
  };

  const fetchTabData = async () => {
    if (!student) return;

    switch (activeTab) {
      case "logbook":
        await fetchLogbookData();
        break;
      case "evaluations":
        await fetchEvaluationData();
        break;
      case "applications":
        await fetchApplicationData();
        break;
    }
  };


  const fetchLogbookData = async () => {
    try {
      setLoading(prev => ({ ...prev, logbook: true }));
      const response = await studentService.getStudentLogbook(student!.id);
      if (response.success) {
        setLogbookEntries(response.data || []);
      } else {
        toast.error(response.message || "Failed to load logbook");
      }
    } catch (error) {
      toast.error("Failed to load logbook entries");
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, logbook: false }));
    }
  };

  const fetchEvaluationData = async () => {
    try {
      setLoading(prev => ({ ...prev, evaluations: true }));
      const response = await studentService.getStudentEvaluations(student!.id);
      if (response.success) {
        setEvaluations(response.data || []);
      } else {
        toast.error(response.message || "Failed to load evaluations");
      }
    } catch (error) {
      toast.error("Failed to load evaluations");
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, evaluations: false }));
    }
  };

  const fetchApplicationData = async () => {
    try {
      setLoading(prev => ({ ...prev, applications: true }));
      const response = await studentService.getStudentApplications(student!.id);
      if (response.success) {
        setApplications(response.data || []);
      } else {
        toast.error(response.message || "Failed to load applications");
      }
    } catch (error) {
      toast.error("Failed to load applications");
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, applications: false }));
    }
  };

  const handleSendMessage = async () => {
    if (!student) return;

    try {
      setSendingMessage(true);
      navigate(`/hospital/messages?to=${student.id}`);
    } catch (error) {
      toast.error("Failed to initiate message");
      console.error(error);
    } finally {
      setSendingMessage(false);
    }
  };


  const handleReviewLogbook = async (entryId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await studentService.reviewLogbookEntry(entryId, { status });
      if (response.success) {
        toast.success(`Logbook entry ${status}`);
        fetchLogbookData();
      } else {
        toast.error(response.message || "Failed to review logbook");
      }
    } catch (error) {
      toast.error("Failed to review logbook entry");
      console.error(error);
    }
  };

  const getLogbookStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-600">Approved</Badge>;
      case "rejected":
      case "revision_requested":
        return <Badge className="bg-red-500/20 text-red-600">Revision</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-600">Pending</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500/20 text-green-600">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-600">Rejected</Badge>;
      case "pending":
      case "reviewing":
        return <Badge className="bg-yellow-500/20 text-yellow-600">Pending</Badge>;
      case "withdrawn":
        return <Badge variant="secondary">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEvaluationScore = (evaluation: Evaluation) => {
    if (evaluation.overall_score !== undefined) {
      return { score: evaluation.overall_score, maxScore: 100 };
    }

    // Calculate average if we have individual scores
    const scores = [
      evaluation.technical_skills_score,
      evaluation.patient_relations_score,
      evaluation.teamwork_score,
      evaluation.professionalism_score
    ].filter(score => score !== undefined) as number[];

    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return { score: avg, maxScore: 100 };
    }

    return { score: 0, maxScore: 100 };
  };

  if (loading.student && !student) {
    return (
      <AppLayout role="hospital" userName="CHU Ibn Sina">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout role="hospital" userName="CHU Ibn Sina">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <h2 className="text-2xl font-bold">Student not found</h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar className="w-16 h-16">
              <AvatarImage src={student.avatar} />
              <AvatarFallback className="text-lg">
                {student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{student.name}</h1>
                <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {student.university} • Student
              </p>
            </div>
          </div>
          <Button onClick={handleSendMessage} disabled={sendingMessage}>
            {sendingMessage ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4 mr-2" />
            )}
            Send Message
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Progress</p>
              <div className="mt-2">
                <Progress value={student.progress || 0} className="h-2" />
                <p className="text-lg font-bold mt-1">{student.progress || 0}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Internship Status</p>
              <p className="text-2xl font-bold capitalize">{student.status || "N/A"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Days Remaining</p>
              <p className="text-2xl font-bold">
                {student.endDate ?
                  Math.max(0, Math.ceil((new Date(student.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                  : "N/A"
                }
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="logbook">
              Logbook
              {loading.logbook && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
            </TabsTrigger>
            <TabsTrigger value="evaluations">
              Evaluations
              {loading.evaluations && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
            </TabsTrigger>
            <TabsTrigger value="applications">
              Applications
              {loading.applications && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {student.email || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {student.phone || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">University</p>
                      <p className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        {student.university || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Faculty</p>
                      <p>{student.faculty || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Emergency Contact</p>
                      <p>{student.emergencyContact || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p>{student.address || "N/A"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Logbook Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {logbookEntries.length > 0 ? (
                        logbookEntries.slice(0, 3).map((entry) => {
                          const { score, maxScore } = getEvaluationScore(entry as any);
                          return (
                            <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div>
                                <p className="font-medium">{entry.title || "Logbook Entry"}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(entry.date || entry.created_at).toLocaleDateString()} • {entry.status}
                                </p>
                              </div>
                              {getLogbookStatusBadge(entry.status)}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No logbook entries yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Internship Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium">{student.department || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tutor</span>
                      <span className="font-medium">{student.tutor || "Not assigned"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span className="font-medium">
                        {student.startDate ? new Date(student.startDate).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date</span>
                      <span className="font-medium">
                        {student.endDate ? new Date(student.endDate).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Evaluations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {evaluations.length > 0 ? (
                      evaluations.slice(0, 3).map((eval_, idx) => {
                        const { score, maxScore } = getEvaluationScore(eval_);
                        return (
                          <div key={eval_.id || idx}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{eval_.type?.replace('-', ' ') || "Evaluation"}</span>
                              <span className="font-medium">{Math.round(score)}/{maxScore}</span>
                            </div>
                            <Progress value={(score / maxScore) * 100} className="h-2" />
                            {eval_.evaluator_name && (
                              <p className="text-xs text-muted-foreground mt-1">By: {eval_.evaluator_name}</p>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No evaluations yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logbook">
            <Card>
              <CardHeader>
                <CardTitle>Logbook Entries</CardTitle>
                <CardDescription>Learning activities and experiences</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.logbook ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : logbookEntries.length > 0 ? (
                  <div className="space-y-4">
                    {logbookEntries.map((entry) => (
                      <div key={entry.id} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-lg">{entry.title || "Logbook Entry"}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(entry.date || entry.created_at).toLocaleDateString()} • {entry.status}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getLogbookStatusBadge(entry.status)}
                            {(entry.status === 'pending' || entry.status === 'draft') && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReviewLogbook(entry.id, 'approved')}
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReviewLogbook(entry.id, 'rejected')}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-sm mb-3">{entry.activities || entry.description || "No description provided"}</p>
                        {entry.skills_learned && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Skills Learned:</p>
                            <p className="text-sm">{entry.skills_learned}</p>
                          </div>
                        )}
                        {entry.reflections && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Reflections:</p>
                            <p className="text-sm">{entry.reflections}</p>
                          </div>
                        )}
                        {entry.supervisor_comments && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                            <p className="text-sm font-medium">Supervisor Comments:</p>
                            <p className="text-sm">{entry.supervisor_comments}</p>
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                          <span>
                            Created: {new Date(entry.created_at).toLocaleDateString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => studentService.getLogbookEntryById(entry.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No logbook entries found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluations">
            <Card>
              <CardHeader>
                <CardTitle>Performance Evaluations</CardTitle>
                <CardDescription>Assessment scores across different competencies</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.evaluations ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : evaluations.length > 0 ? (
                  <div className="space-y-6">
                    {evaluations.map((eval_) => {
                      const { score, maxScore } = getEvaluationScore(eval_);
                      return (
                        <div key={eval_.id} className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-medium text-lg capitalize">{eval_.type?.replace('-', ' ') || "Evaluation"}</h4>
                              <p className="text-sm text-muted-foreground">
                                {eval_.evaluator_name && `Evaluated by: ${eval_.evaluator_name}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{Math.round(score)}/{maxScore}</div>
                              <div className="text-sm text-muted-foreground">Overall Score</div>
                            </div>
                          </div>

                          {eval_.technical_skills_score !== undefined && (
                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Technical Skills</span>
                                <span className="font-medium">{eval_.technical_skills_score}/100</span>
                              </div>
                              <Progress value={eval_.technical_skills_score} className="h-2" />
                            </div>
                          )}

                          {eval_.patient_relations_score !== undefined && (
                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Patient Relations</span>
                                <span className="font-medium">{eval_.patient_relations_score}/100</span>
                              </div>
                              <Progress value={eval_.patient_relations_score} className="h-2" />
                            </div>
                          )}

                          {eval_.teamwork_score !== undefined && (
                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Teamwork</span>
                                <span className="font-medium">{eval_.teamwork_score}/100</span>
                              </div>
                              <Progress value={eval_.teamwork_score} className="h-2" />
                            </div>
                          )}

                          {eval_.professionalism_score !== undefined && (
                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Professionalism</span>
                                <span className="font-medium">{eval_.professionalism_score}/100</span>
                              </div>
                              <Progress value={eval_.professionalism_score} className="h-2" />
                            </div>
                          )}

                          {(eval_.strengths || eval_.weaknesses || eval_.feedback) && (
                            <div className="space-y-3 mt-4">
                              {eval_.strengths && (
                                <div>
                                  <p className="text-sm font-medium mb-1">Strengths:</p>
                                  <p className="text-sm">{eval_.strengths}</p>
                                </div>
                              )}

                              {eval_.weaknesses && (
                                <div>
                                  <p className="text-sm font-medium mb-1">Areas for Improvement:</p>
                                  <p className="text-sm">{eval_.weaknesses}</p>
                                </div>
                              )}

                              {eval_.feedback && (
                                <div>
                                  <p className="text-sm font-medium mb-1">Feedback:</p>
                                  <p className="text-sm">{eval_.feedback}</p>
                                </div>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground mt-4">
                            Date: {new Date(eval_.created_at).toLocaleDateString()} • Status: {eval_.status}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No evaluations found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Applications History</CardTitle>
                <CardDescription>Internship applications submitted by student</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.applications ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{app.offer_title || "Internship Application"}</h4>
                            <p className="text-sm text-muted-foreground">
                              Applied: {new Date(app.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {getApplicationStatusBadge(app.status)}
                        </div>
                        {app.motivation && (
                          <p className="text-sm mb-3 line-clamp-2">{app.motivation}</p>
                        )}
                        {app.cover_letter && (
                          <p className="text-sm mb-3 line-clamp-2">{app.cover_letter}</p>
                        )}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            Last updated: {new Date(app.updated_at).toLocaleDateString()}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/hospital/applications/${app.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No applications found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}