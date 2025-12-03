import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, Clock, Calendar, Eye, MessageSquare } from "lucide-react";
import { useState } from "react";

const pendingEntries = [
  {
    id: "1",
    studentName: "Ahmed Benali",
    studentAvatar: "/avatars/student1.jpg",
    date: "2025-01-20",
    activities: "Observed pediatric consultations, participated in morning rounds, assisted with patient examinations",
    skills: "Patient examination, medical history taking, vital signs assessment",
    reflections: "Learned about common pediatric conditions and effective communication with children and their parents",
    status: "pending" as const,
  },
  {
    id: "2",
    studentName: "Fatima Zahra Ouardi",
    studentAvatar: "/avatars/student2.jpg",
    date: "2025-01-20",
    activities: "Emergency department rotation, handled minor trauma cases, observed procedures",
    skills: "Wound care, suturing assistance, triage assessment",
    reflections: "Developed confidence in emergency procedures and quick decision-making",
    status: "pending" as const,
  },
];

const reviewedEntries = [
  {
    id: "3",
    studentName: "Ahmed Benali",
    date: "2025-01-19",
    activities: "Participated in ward rounds, reviewed patient charts",
    status: "approved" as const,
    feedback: "Good work on the case presentations. Continue to develop your clinical reasoning skills.",
  },
  {
    id: "4",
    studentName: "Fatima Zahra Ouardi",
    date: "2025-01-19",
    activities: "Assisted with vaccinations, health education sessions",
    status: "approved" as const,
    feedback: "Excellent patient communication. Well done!",
  },
];

export default function LogbookReview() {
  const [selectedEntry, setSelectedEntry] = useState<typeof pendingEntries[0] | null>(null);
  const [feedback, setFeedback] = useState("");

  return (
    <AppLayout role="doctor" userName="Dr. Hassan Alami">
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Logbook Review</h1>
          <p className="page-subtitle">Review and validate student logbook entries</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-bold">{pendingEntries.length}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved This Week</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingEntries.length})</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingEntries.map((entry) => (
              <Card key={entry.id} className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={entry.studentAvatar} />
                        <AvatarFallback>{entry.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{entry.studentName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-auto">Pending Review</Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Activities</p>
                        <p className="text-sm">{entry.activities}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Skills Practiced</p>
                        <p className="text-sm">{entry.skills}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Reflections</p>
                        <p className="text-sm">{entry.reflections}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2 lg:justify-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2" onClick={() => setSelectedEntry(entry)}>
                          <Eye className="w-4 h-4" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Review Logbook Entry</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{entry.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{entry.studentName}</p>
                              <p className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium">Activities</p>
                              <p className="text-sm text-muted-foreground">{entry.activities}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Skills</p>
                              <p className="text-sm text-muted-foreground">{entry.skills}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Reflections</p>
                              <p className="text-sm text-muted-foreground">{entry.reflections}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-medium flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              Feedback (optional)
                            </p>
                            <Textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="Provide feedback or comments for the student..."
                              rows={3}
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" className="gap-1 text-destructive hover:text-destructive">
                              <X className="w-4 h-4" />
                              Request Revision
                            </Button>
                            <Button variant="hero" className="gap-1">
                              <Check className="w-4 h-4" />
                              Approve Entry
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reviewed" className="space-y-4">
            {reviewedEntries.map((entry) => (
              <Card key={entry.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{entry.studentName}</p>
                      <Badge variant={entry.status === "approved" ? "default" : "destructive"}>
                        {entry.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                    {entry.feedback && (
                      <p className="text-sm mt-2 italic">"{entry.feedback}"</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">View Details</Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
