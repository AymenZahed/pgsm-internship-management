import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Send, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";

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
  },
];

const evaluationCriteria = [
  { name: "Clinical Skills", description: "Patient examination, procedures" },
  { name: "Medical Knowledge", description: "Understanding of conditions and treatments" },
  { name: "Professionalism", description: "Punctuality, ethics, teamwork" },
  { name: "Communication", description: "Patient and team interaction" },
  { name: "Critical Thinking", description: "Problem-solving and clinical reasoning" },
];

export default function DoctorEvaluations() {
  const [selectedStudent, setSelectedStudent] = useState<typeof studentsToEvaluate[0] | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");

  const handleScoreChange = (criterion: string, value: number[]) => {
    setScores(prev => ({ ...prev, [criterion]: value[0] }));
  };

  return (
    <AppLayout role="doctor" userName="Dr. Hassan Alami">
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Evaluations</h1>
          <p className="page-subtitle">Evaluate student performance</p>
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

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({studentsToEvaluate.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {studentsToEvaluate.map((student) => (
              <Card key={student.id} className="p-6">
                <div className="flex items-center justify-between">
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

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="hero" className="gap-2" onClick={() => setSelectedStudent(student)}>
                        <Plus className="w-4 h-4" />
                        Create Evaluation
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

                        {/* Criteria */}
                        <div className="space-y-6">
                          {evaluationCriteria.map((criterion) => (
                            <div key={criterion.name} className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-sm font-medium">{criterion.name}</Label>
                                  <p className="text-xs text-muted-foreground">{criterion.description}</p>
                                </div>
                                <span className="text-lg font-semibold text-primary">
                                  {scores[criterion.name] || 75}%
                                </span>
                              </div>
                              <Slider
                                value={[scores[criterion.name] || 75]}
                                onValueChange={(value) => handleScoreChange(criterion.name, value)}
                                max={100}
                                step={5}
                                className="w-full"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Feedback */}
                        <div className="space-y-2">
                          <Label>Overall Feedback</Label>
                          <Textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Provide detailed feedback for the student..."
                            rows={4}
                          />
                        </div>

                        {/* Average Score */}
                        <Card className="p-4 bg-primary/5 border-primary/20">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Overall Score</span>
                            <span className="text-2xl font-bold text-primary">
                              {Object.values(scores).length > 0
                                ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length)
                                : 75}%
                            </span>
                          </div>
                        </Card>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Save Draft</Button>
                          <Button variant="hero" className="gap-2">
                            <Send className="w-4 h-4" />
                            Submit Evaluation
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
                <div className="flex items-center justify-between">
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
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{evaluation.overallScore}%</p>
                      <p className="text-xs text-muted-foreground">Overall Score</p>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
