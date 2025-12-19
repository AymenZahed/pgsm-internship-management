import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Send, Clock, CheckCircle, Stethoscope, Users, Heart, Award, Eye, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { tutorService } from "@/services/tutor.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useAuth } from "@/contexts/AuthContext";

// Structured evaluation domains with weights as per requirements
const evaluationDomains = [
  {
    id: "technical_skills_score",
    name: "Technical Skills",
    weight: 40,
    icon: Stethoscope,
    description: "Clinical procedures, diagnostic skills, medical knowledge application",
    criteria: [
      "Patient examination techniques",
      "Diagnostic reasoning",
      "Treatment planning",
      "Technical procedures execution",
    ]
  },
  {
    id: "patient_relations_score",
    name: "Patient Relations",
    weight: 25,
    icon: Heart,
    description: "Communication with patients and families, empathy, patient education",
    criteria: [
      "Patient communication",
      "Empathy and compassion",
      "Patient education",
      "Cultural sensitivity",
    ]
  },
  {
    id: "teamwork_score",
    name: "Teamwork",
    weight: 20,
    icon: Users,
    description: "Collaboration with medical team, interprofessional communication",
    criteria: [
      "Collaboration with colleagues",
      "Communication with staff",
      "Accepting feedback",
      "Contributing to team goals",
    ]
  },
  {
    id: "professionalism_score",
    name: "Professionalism",
    weight: 15,
    icon: Award,
    description: "Ethics, punctuality, appearance, documentation, responsibility",
    criteria: [
      "Punctuality and attendance",
      "Professional appearance",
      "Medical documentation",
      "Ethical conduct",
    ]
  },
];

export default function DoctorEvaluations() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    technical_skills_score: 75,
    patient_relations_score: 75,
    teamwork_score: 75,
    professionalism_score: 75,
  });
  const [feedback, setFeedback] = useState("");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);

  const [studentsToEvaluate, setStudentsToEvaluate] = useState<any[]>([]);
  const [completedEvaluations, setCompletedEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pendingRes, completedRes] = await Promise.all([
        tutorService.getPendingEvaluations(),
        tutorService.getMyEvaluations()
      ]);

      if (pendingRes.success) {
        setStudentsToEvaluate(pendingRes.data || []);
      }

      if (completedRes.success) {
        setCompletedEvaluations(completedRes.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load evaluations');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (domainId: string, value: number[]) => {
    setScores(prev => ({ ...prev, [domainId]: value[0] }));
  };

  // Calculate weighted overall score
  const calculateWeightedScore = (): number => {
    let totalWeightedScore = 0;
    evaluationDomains.forEach(domain => {
      const score = scores[domain.id] || 75;
      totalWeightedScore += (score * domain.weight) / 100;
    });
    return Math.round(totalWeightedScore);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Satisfactory";
    if (score >= 50) return "Needs Improvement";
    return "Unsatisfactory";
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedStudent) return;

    if (!feedback.trim()) {
      toast.error("Please provide feedback for the student");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await tutorService.createEvaluation({
        internship_id: selectedStudent.id,
        type: 'mid-term',
        ...scores,
        strengths,
        weaknesses,
        recommendations,
        feedback
      });

      if (response.success) {
        toast.success(`Evaluation submitted successfully!`);
        setDialogOpen(false);
        setFeedback("");
        setStrengths("");
        setWeaknesses("");
        setRecommendations("");
        setScores({
          technical_skills_score: 75,
          patient_relations_score: 75,
          teamwork_score: 75,
          professionalism_score: 75,
        });
        await fetchEvaluations();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const weightedScore = calculateWeightedScore();

  if (loading) {
    return (
      <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}>
        <LoadingState message="Loading evaluations..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}>
        <ErrorState message={error} onRetry={fetchEvaluations} />
      </AppLayout>
    );
  }

  return (
    <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Evaluations</h1>
          <p className="page-subtitle">Evaluate student performance with structured grading</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Evaluations</p>
              <p className="text-2xl font-bold">{studentsToEvaluate.length}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed This Month</p>
              <p className="text-2xl font-bold">{completedEvaluations.length}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Evaluations</p>
              <p className="text-2xl font-bold">{completedEvaluations.length}</p>
            </div>
          </Card>
        </div>

        {/* Evaluation Domains Info */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <h4 className="font-medium mb-3">Evaluation Domains & Weights</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {evaluationDomains.map(domain => {
              const Icon = domain.icon;
              return (
                <div key={domain.id} className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-xs">{domain.name}</p>
                    <p className="text-xs text-muted-foreground">{domain.weight}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({studentsToEvaluate.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {studentsToEvaluate.length === 0 ? (
              <EmptyState title="No pending evaluations" description="All students have been evaluated" />
            ) : (
              studentsToEvaluate.map((student) => (
                <Card key={student.id} className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>{student.first_name?.[0]}{student.last_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{student.first_name} {student.last_name}</h3>
                        <p className="text-sm text-muted-foreground">{student.service_name || 'General Rotation'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">Mid-term</Badge>
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(student.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Dialog open={dialogOpen && selectedStudent?.id === student.id} onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (open) setSelectedStudent(student);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="hero" className="gap-2">
                          <Plus className="w-4 h-4" />
                          Create Evaluation
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Evaluate {student.first_name} {student.last_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Avatar>
                              <AvatarFallback>{student.first_name?.[0]}{student.last_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.first_name} {student.last_name}</p>
                              <p className="text-sm text-muted-foreground">{student.service_name || 'General Rotation'} • Mid-term Evaluation</p>
                            </div>
                          </div>

                          {/* Domain-based Evaluation */}
                          <div className="space-y-6">
                            {evaluationDomains.map((domain) => {
                              const Icon = domain.icon;
                              const score = scores[domain.id] || 75;

                              return (
                                <Card key={domain.id} className="p-4">
                                  <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                          <Icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <Label className="text-base font-semibold">{domain.name}</Label>
                                            <Badge variant="outline" className="text-xs">{domain.weight}% weight</Badge>
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-0.5">{domain.description}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                                          {score}%
                                        </span>
                                        <p className={`text-xs ${getScoreColor(score)}`}>{getScoreLabel(score)}</p>
                                      </div>
                                    </div>

                                    <Slider
                                      value={[score]}
                                      onValueChange={(value) => handleScoreChange(domain.id, value)}
                                      max={100}
                                      step={5}
                                      className="w-full"
                                    />

                                    {/* Criteria hints */}
                                    <div className="flex flex-wrap gap-1">
                                      {domain.criteria.map((criterion, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs font-normal">
                                          {criterion}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>

                          {/* Feedback */}
                          <div className="space-y-2">
                            <Label>Overall Feedback <span className="text-destructive">*</span></Label>
                            <Textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="Provide detailed feedback for the student covering strengths, areas for improvement, and recommendations..."
                              rows={4}
                            />
                          </div>

                          {/* Weighted Score Summary */}
                          <Card className="p-4 bg-primary/5 border-primary/20">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Weighted Overall Score</span>
                                <span className={`text-3xl font-bold ${getScoreColor(weightedScore)}`}>
                                  {weightedScore}%
                                </span>
                              </div>
                              <Progress value={weightedScore} className="h-3" />
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {evaluationDomains.map(domain => (
                                  <div key={domain.id} className="flex justify-between text-muted-foreground">
                                    <span>{domain.name}:</span>
                                    <span className="font-medium">{scores[domain.id]}% × {domain.weight}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Card>

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              variant="hero"
                              className="gap-2"
                              onClick={handleSubmitEvaluation}
                              disabled={isSubmitting || !feedback.trim()}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4" />
                                  Submit Evaluation
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedEvaluations.length === 0 ? (
              <EmptyState title="No completed evaluations" description="You haven't completed any evaluations yet" />
            ) : (
              completedEvaluations.map((evaluation) => (
                <Card key={evaluation.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{evaluation.first_name} {evaluation.last_name}</p>
                        <Badge>{evaluation.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {evaluation.hospital_name} • {new Date(evaluation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getScoreColor(evaluation.overall_score)}`}>
                          {evaluation.overall_score}%
                        </p>
                        <p className="text-xs text-muted-foreground">Weighted Score</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Evaluation Details</DialogTitle>
                          </DialogHeader>

                          <div className="space-y-6">
                            {/* Student Info */}
                            <div className="flex items-center gap-3 pb-4 border-b">
                              <Avatar>
                                <AvatarFallback>{evaluation.first_name[0]}{evaluation.last_name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold">{evaluation.first_name} {evaluation.last_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(evaluation.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="ml-auto text-right">
                                <span className={`text-2xl font-bold ${getScoreColor(evaluation.overall_score)}`}>
                                  {evaluation.overall_score}%
                                </span>
                                <p className="text-xs text-muted-foreground">Overall Score</p>
                              </div>
                            </div>

                            {/* Scores */}
                            <div className="space-y-4">
                              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Performance Scores</h4>
                              <div className="grid gap-4">
                                {evaluationDomains.map(domain => {
                                  const score = evaluation[domain.id];
                                  const Icon = domain.icon;
                                  return (
                                    <div key={domain.id} className="bg-muted/50 p-3 rounded-lg space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Icon className="w-4 h-4 text-primary" />
                                          <span className="font-medium text-sm">{domain.name}</span>
                                        </div>
                                        <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
                                      </div>
                                      <Progress value={score} className="h-2" />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Feedback Section */}
                            <div className="space-y-4">
                              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Qualitative Assessment</h4>

                              <div className="grid sm:grid-cols-2 gap-4">
                                {evaluation.strengths && (
                                  <div className="space-y-1">
                                    <Label className="text-xs">Strengths</Label>
                                    <div className="p-3 bg-success/5 text-success-foreground rounded-lg text-sm">
                                      {evaluation.strengths}
                                    </div>
                                  </div>
                                )}
                                {evaluation.weaknesses && (
                                  <div className="space-y-1">
                                    <Label className="text-xs">Areas for Improvement</Label>
                                    <div className="p-3 bg-warning/5 text-warning-foreground rounded-lg text-sm">
                                      {evaluation.weaknesses}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {evaluation.recommendations && (
                                <div className="space-y-1">
                                  <Label className="text-xs">Recommendations</Label>
                                  <div className="p-3 bg-primary/5 rounded-lg text-sm">
                                    {evaluation.recommendations}
                                  </div>
                                </div>
                              )}

                              <div className="space-y-1">
                                <Label className="text-xs">Overall Feedback</Label>
                                <div className="p-4 bg-muted rounded-lg text-sm italic">
                                  "{evaluation.feedback}"
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
