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
import { Plus, FileText, Send, Clock, CheckCircle, Stethoscope, Users, Heart, Award, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const studentsToEvaluate = [
  {
    id: "1",
    name: "Ahmed Benali",
    avatar: "/avatars/student1.jpg",
    internship: "Pediatrics Rotation",
    progress: 45,
    dueDate: "2025-01-25",
    type: "mid-term" as const,
  },
  {
    id: "2",
    name: "Fatima Zahra Ouardi",
    avatar: "/avatars/student2.jpg",
    internship: "Pediatrics Rotation",
    progress: 48,
    dueDate: "2025-01-25",
    type: "mid-term" as const,
  },
];

const completedEvaluations = [
  {
    id: "3",
    studentName: "Youssef Amrani",
    internship: "Pediatrics Rotation",
    date: "2025-01-05",
    type: "final",
    overallScore: 88,
    domainScores: {
      technical: 90,
      patientRelations: 85,
      teamwork: 88,
      professionalism: 92,
    },
  },
];

// Structured evaluation domains with weights as per requirements
const evaluationDomains = [
  { 
    id: "technical",
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
    id: "patientRelations",
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
    id: "teamwork",
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
    id: "professionalism",
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
  const [selectedStudent, setSelectedStudent] = useState<typeof studentsToEvaluate[0] | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    technical: 75,
    patientRelations: 75,
    teamwork: 75,
    professionalism: 75,
  });
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<typeof completedEvaluations[0] | null>(null);

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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`Evaluation for ${selectedStudent.name} submitted successfully!`);
    setIsSubmitting(false);
    setDialogOpen(false);
    setFeedback("");
    setScores({
      technical: 75,
      patientRelations: 75,
      teamwork: 75,
      professionalism: 75,
    });
  };

  const weightedScore = calculateWeightedScore();

  return (
    <AppLayout role="doctor" userName="Dr. Hassan Alami">
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
              <p className="text-2xl font-bold">12</p>
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
            {studentsToEvaluate.map((student) => (
              <Card key={student.id} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">{student.internship}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{student.type === "mid-term" ? "Mid-term" : "Final"}</Badge>
                        <span className="text-xs text-muted-foreground">Due: {new Date(student.dueDate).toLocaleDateString()}</span>
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
                        <DialogTitle>Evaluate {student.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <Avatar>
                            <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.internship} • {student.type === "mid-term" ? "Mid-term" : "Final"} Evaluation</p>
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
                          <p className="text-xs text-muted-foreground">
                            {feedback.length}/500 characters
                          </p>
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
                            Save Draft
                          </Button>
                          <Button 
                            variant="hero" 
                            className="gap-2"
                            onClick={handleSubmitEvaluation}
                            disabled={isSubmitting || !feedback.trim()}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedEvaluations.map((evaluation) => (
              <Card key={evaluation.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{evaluation.studentName}</p>
                      <Badge>{evaluation.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {evaluation.internship} • {new Date(evaluation.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Domain scores preview */}
                    <div className="hidden md:flex gap-2">
                      {evaluationDomains.map(domain => {
                        const Icon = domain.icon;
                        const score = evaluation.domainScores[domain.id as keyof typeof evaluation.domainScores];
                        return (
                          <div key={domain.id} className="flex items-center gap-1 text-xs">
                            <Icon className="w-3 h-3 text-muted-foreground" />
                            <span>{score}%</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
                        {evaluation.overallScore}%
                      </p>
                      <p className="text-xs text-muted-foreground">Weighted Score</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => {
                        setSelectedEvaluation(evaluation);
                        setViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* View Evaluation Dialog */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Evaluation Details</DialogTitle>
              </DialogHeader>
              {selectedEvaluation && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar>
                      <AvatarFallback>{selectedEvaluation.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{selectedEvaluation.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedEvaluation.internship} • {selectedEvaluation.type === "final" ? "Final" : "Mid-term"} Evaluation
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(selectedEvaluation.overallScore)}`}>
                        {selectedEvaluation.overallScore}%
                      </p>
                      <p className="text-xs text-muted-foreground">{getScoreLabel(selectedEvaluation.overallScore)}</p>
                    </div>
                  </div>

                  {/* Domain Scores */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Domain Scores</h4>
                    {evaluationDomains.map(domain => {
                      const Icon = domain.icon;
                      const score = selectedEvaluation.domainScores[domain.id as keyof typeof selectedEvaluation.domainScores];
                      return (
                        <div key={domain.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{domain.name}</span>
                              <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
                            </div>
                            <Progress value={score} className="h-2" />
                          </div>
                          <Badge variant="outline" className="text-xs">{domain.weight}%</Badge>
                        </div>
                      );
                    })}
                  </div>

                  {/* Evaluation Info */}
                  <div className="p-3 bg-muted/50 rounded-lg text-sm">
                    <p className="text-muted-foreground">
                      Evaluated on {new Date(selectedEvaluation.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </Tabs>
      </div>
    </AppLayout>
  );
}
