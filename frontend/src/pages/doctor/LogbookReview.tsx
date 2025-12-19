import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, Clock, Calendar, Eye, MessageSquare, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { tutorService } from "@/services/tutor.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LogbookEntry {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  date: string;
  title?: string;
  activities: string;
  skills_learned?: string;
  reflections?: string;
  status: "pending" | "approved" | "revision_requested";
  supervisor_comments?: string;
  reviewed_at?: string;
}

export default function LogbookReview() {
  const [selectedEntry, setSelectedEntry] = useState<LogbookEntry | null>(null);
  const [feedback, setFeedback] = useState("");
  const [pendingEntries, setPendingEntries] = useState<LogbookEntry[]>([]);
  const [reviewedEntries, setReviewedEntries] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchLogbook();
  }, []);

  const fetchLogbook = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pendingRes, reviewedRes] = await Promise.all([
        tutorService.getPendingLogbook(),
        tutorService.getReviewedLogbook()
      ]);

      if (pendingRes.success) {
        setPendingEntries(pendingRes.data || []);
      }

      if (reviewedRes.success) {
        setReviewedEntries(reviewedRes.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load logbook entries');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status: 'approved' | 'revision_requested') => {
    if (!selectedEntry) return;

    try {
      setActionLoading(true);
      const response = await tutorService.reviewLogbook(selectedEntry.id, {
        status,
        comments: feedback
      });

      if (response.success) {
        toast.success(`Logbook entry ${status === 'approved' ? 'approved' : 'revision requested'} successfully`);
        setDialogOpen(false);
        setFeedback("");
        setSelectedEntry(null);
        await fetchLogbook();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${status} entry`);
    } finally {
      setActionLoading(false);
    }
  };

  const thisWeekApproved = reviewedEntries.filter(e => {
    const reviewDate = new Date(e.reviewed_at || e.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return reviewDate >= weekAgo && e.status === 'approved';
  }).length;

  if (loading) {
    return (
      <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}>
        <LoadingState message="Loading logbook entries..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}>
        <ErrorState message={error} onRetry={fetchLogbook} />
      </AppLayout>
    );
  }

  return (
    <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}>
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
              <p className="text-2xl font-bold">{thisWeekApproved}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold">{pendingEntries.length + reviewedEntries.length}</p>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingEntries.length})</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingEntries.length === 0 ? (
              <EmptyState title="No pending entries" description="All logbook entries have been reviewed" />
            ) : (
              pendingEntries.map((entry) => (
                <Card key={entry.id} className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={entry.avatar} />
                          <AvatarFallback>{entry.first_name[0]}{entry.last_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{entry.first_name} {entry.last_name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-auto">Pending Review</Badge>
                      </div>

                      <div className="space-y-3">
                        {entry.title && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Title</p>
                            <p className="text-sm">{entry.title}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Activities</p>
                          <p className="text-sm">{entry.activities}</p>
                        </div>
                        {entry.skills_learned && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Skills Practiced</p>
                            <p className="text-sm">{entry.skills_learned}</p>
                          </div>
                        )}
                        {entry.reflections && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Reflections</p>
                            <p className="text-sm">{entry.reflections}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2 lg:justify-center">
                      <Dialog open={dialogOpen && selectedEntry?.id === entry.id} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (open) {
                          setSelectedEntry(entry);
                          setFeedback("");
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="gap-2">
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
                                <AvatarFallback>{entry.first_name[0]}{entry.last_name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold">{entry.first_name} {entry.last_name}</p>
                                <p className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                              </div>
                            </div>

                            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                              {entry.title && (
                                <div>
                                  <p className="text-sm font-medium">Title</p>
                                  <p className="text-sm text-muted-foreground">{entry.title}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium">Activities</p>
                                <p className="text-sm text-muted-foreground">{entry.activities}</p>
                              </div>
                              {entry.skills_learned && (
                                <div>
                                  <p className="text-sm font-medium">Skills</p>
                                  <p className="text-sm text-muted-foreground">{entry.skills_learned}</p>
                                </div>
                              )}
                              {entry.reflections && (
                                <div>
                                  <p className="text-sm font-medium">Reflections</p>
                                  <p className="text-sm text-muted-foreground">{entry.reflections}</p>
                                </div>
                              )}
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
                              <Button
                                variant="outline"
                                className="gap-1 text-destructive hover:text-destructive"
                                onClick={() => handleReview('revision_requested')}
                                disabled={actionLoading}
                              >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                Request Revision
                              </Button>
                              <Button
                                variant="hero"
                                className="gap-1"
                                onClick={() => handleReview('approved')}
                                disabled={actionLoading}
                              >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Approve Entry
                              </Button>
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

          <TabsContent value="reviewed" className="space-y-4">
            {reviewedEntries.length === 0 ? (
              <EmptyState title="No reviewed entries" description="No logbook entries have been reviewed yet" />
            ) : (
              reviewedEntries.slice(0, 20).map((entry) => (
                <Card key={entry.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{entry.first_name} {entry.last_name}</p>
                        <Badge variant={entry.status === "approved" ? "default" : "destructive"}>
                          {entry.status === "approved" ? "Approved" : "Revision Requested"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                      {entry.supervisor_comments && (
                        <p className="text-sm mt-2 italic">"{entry.supervisor_comments}"</p>
                      )}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Logbook Entry Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{entry.first_name[0]}{entry.last_name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{entry.first_name} {entry.last_name}</p>
                              <p className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                            </div>
                            <Badge className="ml-auto" variant={entry.status === "approved" ? "default" : "destructive"}>
                              {entry.status === "approved" ? "Approved" : "Revision Requested"}
                            </Badge>
                          </div>

                          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                            {entry.title && (
                              <div>
                                <p className="text-sm font-medium">Title</p>
                                <p className="text-sm text-muted-foreground">{entry.title}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium">Activities</p>
                              <p className="text-sm text-muted-foreground">{entry.activities}</p>
                            </div>
                            {entry.skills_learned && (
                              <div>
                                <p className="text-sm font-medium">Skills</p>
                                <p className="text-sm text-muted-foreground">{entry.skills_learned}</p>
                              </div>
                            )}
                            {entry.reflections && (
                              <div>
                                <p className="text-sm font-medium">Reflections</p>
                                <p className="text-sm text-muted-foreground">{entry.reflections}</p>
                              </div>
                            )}
                          </div>

                          {entry.supervisor_comments && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                Supervisor Feedback
                              </p>
                              <div className="p-3 bg-muted rounded-md text-sm">
                                {entry.supervisor_comments}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
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
