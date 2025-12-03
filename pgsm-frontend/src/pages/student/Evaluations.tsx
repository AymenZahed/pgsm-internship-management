import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Download, Eye } from "lucide-react";

const evaluations = [
  {
    id: "1",
    internship: "Pediatrics Rotation",
    evaluator: "Dr. Hassan Alami",
    date: "2025-01-15",
    type: "Mid-term",
    overallScore: 85,
    categories: [
      { name: "Clinical Skills", score: 90 },
      { name: "Medical Knowledge", score: 85 },
      { name: "Professionalism", score: 88 },
      { name: "Communication", score: 82 },
    ],
    feedback: "Excellent progress. Shows strong clinical reasoning and patient interaction skills.",
  },
  {
    id: "2",
    internship: "Internal Medicine",
    evaluator: "Dr. Fatima Zahra",
    date: "2024-12-01",
    type: "Final",
    overallScore: 92,
    categories: [
      { name: "Clinical Skills", score: 95 },
      { name: "Medical Knowledge", score: 90 },
      { name: "Professionalism", score: 92 },
      { name: "Communication", score: 91 },
    ],
    feedback: "Outstanding performance throughout the rotation. Highly recommended.",
  },
];

export default function Evaluations() {
  const averageScore = Math.round(evaluations.reduce((acc, e) => acc + e.overallScore, 0) / evaluations.length);

  return (
    <AppLayout role="student" userName="Ahmed Benali">
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
                <p className="text-3xl font-bold text-primary">{averageScore}%</p>
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
                <p className="text-3xl font-bold">{evaluations.length}</p>
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
                <p className="text-3xl font-bold">{Math.max(...evaluations.map(e => e.overallScore))}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Evaluations List */}
        <div className="space-y-4">
          {evaluations.map((evaluation) => (
            <Card key={evaluation.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{evaluation.internship}</h3>
                      <Badge>{evaluation.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Evaluated by {evaluation.evaluator} • {new Date(evaluation.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{evaluation.overallScore}%</div>
                    <p className="text-xs text-muted-foreground">Overall Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {evaluation.categories.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{category.name}</span>
                        <span className="font-medium">{category.score}%</span>
                      </div>
                      <Progress value={category.score} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-1">Evaluator Feedback</p>
                  <p className="text-sm text-muted-foreground">{evaluation.feedback}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
