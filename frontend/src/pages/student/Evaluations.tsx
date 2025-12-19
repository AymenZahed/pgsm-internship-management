import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Download, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { evaluationService } from "@/services/evaluation.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useAuth } from "@/contexts/AuthContext";

interface Evaluation {
  id: string;
  type?: string;
  overall_score?: number;
  technical_skills_score?: number;
  patient_relations_score?: number;
  teamwork_score?: number;
  professionalism_score?: number;
  strengths?: string;
  weaknesses?: string;
  recommendations?: string;
  feedback?: string;
  evaluator_first_name?: string;
  evaluator_last_name?: string;
  hospital_name?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export default function Evaluations() {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [stats, setStats] = useState({ total: 0, average_score: 0, highest_score: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const response = await evaluationService.getStudentEvaluations();
      if (response.success && response.data) {
        setEvaluations(response.data.evaluations || []);
        setStats(response.data.stats || { total: 0, average_score: 0, highest_score: 0 });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load evaluations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const handleExportPDF = (evaluation: Evaluation) => {
    const content = `
EVALUATION REPORT
=================

Internship: ${evaluation.hospital_name}
Type: ${evaluation.type}
Evaluator: ${evaluation.evaluator_first_name} ${evaluation.evaluator_last_name}
Date: ${new Date(evaluation.created_at).toLocaleDateString()}

SCORES
------
Overall Score: ${evaluation.overall_score}%
Technical Skills: ${evaluation.technical_skills_score}%
Patient Relations: ${evaluation.patient_relations_score}%
Teamwork: ${evaluation.teamwork_score}%
Professionalism: ${evaluation.professionalism_score}%

${evaluation.strengths ? `
STRENGTHS
---------
${evaluation.strengths}
` : ''}

${evaluation.weaknesses ? `
AREAS FOR IMPROVEMENT
---------------------
${evaluation.weaknesses}
` : ''}

${evaluation.recommendations ? `
RECOMMENDATIONS
---------------
${evaluation.recommendations}
` : ''}

${evaluation.feedback ? `
FEEDBACK
--------
${evaluation.feedback}
` : ''}

---
Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-${evaluation.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) return <AppLayout role="student" userName={user?.first_name || 'Student'}><LoadingState message="Loading evaluations..." /></AppLayout>;
  if (error) return <AppLayout role="student" userName={user?.first_name || 'Student'}><ErrorState message={error} onRetry={fetchEvaluations} /></AppLayout>;

  return (
    <AppLayout role="student" userName={user?.first_name || 'Student'}>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Evaluations</h1>
          <p className="page-subtitle">View your performance evaluations</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-3xl font-bold text-primary">{Math.round(stats.average_score)}%</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Evaluations</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Highest Score</p>
                <p className="text-3xl font-bold">{Math.round(stats.highest_score)}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Evaluations List */}
        {evaluations.length === 0 ? (
          <EmptyState 
            title="No evaluations yet" 
            description="Your evaluations will appear here once your tutors submit them"
          />
        ) : (
          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <Card key={evaluation.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{evaluation.hospital_name}</h3>
                        <Badge>{evaluation.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Evaluated by {evaluation.evaluator_first_name} {evaluation.evaluator_last_name} • {new Date(evaluation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{Math.round(evaluation.overall_score)}%</div>
                      <p className="text-xs text-muted-foreground">Overall Score</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Technical Skills (40%)</span>
                        <span className="font-medium">{Math.round(evaluation.technical_skills_score)}%</span>
                      </div>
                      <Progress value={evaluation.technical_skills_score} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Patient Relations (25%)</span>
                        <span className="font-medium">{Math.round(evaluation.patient_relations_score)}%</span>
                      </div>
                      <Progress value={evaluation.patient_relations_score} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Teamwork (20%)</span>
                        <span className="font-medium">{Math.round(evaluation.teamwork_score)}%</span>
                      </div>
                      <Progress value={evaluation.teamwork_score} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Professionalism (15%)</span>
                        <span className="font-medium">{Math.round(evaluation.professionalism_score)}%</span>
                      </div>
                      <Progress value={evaluation.professionalism_score} className="h-2" />
                    </div>
                  </div>

                  {evaluation.feedback && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium mb-1">Evaluator Feedback</p>
                      <p className="text-sm text-muted-foreground">{evaluation.feedback}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExportPDF(evaluation)}>
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
