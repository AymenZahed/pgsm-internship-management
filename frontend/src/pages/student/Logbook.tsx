import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, Check, Clock, FileText, Download, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { logbookService } from "@/services/logbook.service";
import { studentService } from "@/services/student.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useAuth } from "@/contexts/AuthContext";

interface LogbookEntry {
  id: string;
  date: string;
  title?: string;
  activities: string;
  skills_learned?: string;
  reflections?: string;
  challenges?: string;
  status: "draft" | "pending" | "approved" | "revision_requested";
  supervisor_comments?: string;
  internship_id: string;
  hospital_name?: string;
}

interface Internship {
  id: string;
  hospital_name: string;
  service_name?: string;
  status: string;
}

export default function Logbook() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LogbookEntry | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newEntry, setNewEntry] = useState({
    internship_id: "",
    date: new Date().toISOString().split('T')[0],
    title: "",
    activities: "",
    skills_learned: "",
    reflections: "",
    challenges: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesRes, internshipsRes] = await Promise.all([
        logbookService.getMyEntries(),
        studentService.getDashboard(),
      ]);

      if (entriesRes.success) {
        setEntries(entriesRes.data || []);
      }

      // Get active internships for selection
      if (internshipsRes.success && internshipsRes.data?.stats) {
        // We'll need to fetch internships separately
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load logbook entries');
    } finally {
      setLoading(false);
    }
  };

  const fetchInternships = async () => {
    try {
      const response = await studentService.getMyInternships('active');
      if (response.success && response.data) {
        // Ensure data is an array
        const internshipData = Array.isArray(response.data) ? response.data : [response.data];
        setInternships(internshipData);

        // If there's only one active internship, default to it
        if (internshipData.length > 0) {
          setNewEntry(prev => ({
            ...prev,
            internship_id: internshipData[0].id
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch internships:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchInternships();
  }, []);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.activities.trim()) {
      toast.error("Activities are required");
      return;
    }

    // Ensure we have an internship ID
    const internshipId = newEntry.internship_id || internships[0]?.id;

    if (!internshipId) {
      toast.error("No active internship found. Please contact support.");
      return;
    }

    try {
      setActionLoading(true);
      const response = await logbookService.createEntry({
        ...newEntry,
        internship_id: internshipId,
      });

      if (response.success) {
        toast.success("Logbook entry added successfully");
        setIsDialogOpen(false);
        setNewEntry({
          internship_id: internshipId, // Keep the same internship
          date: new Date().toISOString().split('T')[0],
          title: "",
          activities: "",
          skills_learned: "",
          reflections: "",
          challenges: "",
        });
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add entry");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditEntry = (entry: LogbookEntry) => {
    setEditingEntry({ ...entry });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    try {
      setActionLoading(true);
      const response = await logbookService.updateEntry(editingEntry.id, {
        title: editingEntry.title,
        activities: editingEntry.activities,
        skills_learned: editingEntry.skills_learned,
        reflections: editingEntry.reflections,
        challenges: editingEntry.challenges,
      });

      if (response.success) {
        toast.success("Logbook entry updated successfully");
        setIsEditDialogOpen(false);
        setEditingEntry(null);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update entry");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportPDF = (entry: LogbookEntry) => {
    const content = `
LOGBOOK ENTRY
=============

Date: ${new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Status: ${entry.status === 'approved' ? 'Approved' : entry.status === 'pending' ? 'Pending Review' : entry.status}

ACTIVITIES
----------
${entry.activities}

SKILLS PRACTICED
----------------
${entry.skills_learned || 'N/A'}

REFLECTIONS
-----------
${entry.reflections || 'N/A'}

CHALLENGES
----------
${entry.challenges || 'N/A'}

${entry.supervisor_comments ? `
SUPERVISOR COMMENTS
-------------------
${entry.supervisor_comments}
` : ''}

---
Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logbook-entry-${entry.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Logbook entry exported");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground gap-1"><Check className="w-3 h-3" />Approved</Badge>;
      case 'revision_requested':
        return <Badge variant="destructive" className="gap-1">Revision Requested</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Pending Review</Badge>;
    }
  };

  if (loading) return <AppLayout role="student" userName={user?.first_name || 'Student'}><LoadingState message="Loading logbook..." /></AppLayout>;
  if (error) return <AppLayout role="student" userName={user?.first_name || 'Student'}><ErrorState message={error} onRetry={fetchData} /></AppLayout>;

  return (
    <AppLayout role="student" userName={user?.first_name || 'Student'}>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Logbook</h1>
            <p className="page-subtitle">Document your daily learning activities</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2">
                <Plus className="w-4 h-4" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Logbook Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddEntry} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      type="date"
                      id="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title (Optional)</Label>
                    <Input
                      id="title"
                      placeholder="Entry title..."
                      value={newEntry.title}
                      onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activities">Activities *</Label>
                  <Textarea
                    id="activities"
                    placeholder="Describe your daily activities and procedures observed"
                    rows={3}
                    value={newEntry.activities}
                    onChange={(e) => setNewEntry({ ...newEntry, activities: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills Practiced</Label>
                  <Textarea
                    id="skills"
                    placeholder="List the clinical skills you practiced"
                    rows={2}
                    value={newEntry.skills_learned}
                    onChange={(e) => setNewEntry({ ...newEntry, skills_learned: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reflections">Reflections</Label>
                  <Textarea
                    id="reflections"
                    placeholder="Your thoughts and learning points from today"
                    rows={2}
                    value={newEntry.reflections}
                    onChange={(e) => setNewEntry({ ...newEntry, reflections: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="challenges">Challenges</Label>
                  <Textarea
                    id="challenges"
                    placeholder="Any challenges you faced"
                    rows={2}
                    value={newEntry.challenges}
                    onChange={(e) => setNewEntry({ ...newEntry, challenges: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="hero" disabled={actionLoading}>
                    {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit Entry
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Logbook Entry</DialogTitle>
            </DialogHeader>
            {editingEntry && (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                {editingEntry.supervisor_comments && (
                  <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex gap-3 items-start">
                    <Clock className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm mb-1">Feedback from Supervisor</p>
                      <p className="text-sm">{editingEntry.supervisor_comments}</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={editingEntry.date} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={editingEntry.title || ''}
                      onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-activities">Activities</Label>
                  <Textarea
                    id="edit-activities"
                    rows={3}
                    value={editingEntry.activities}
                    onChange={(e) => setEditingEntry({ ...editingEntry, activities: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-skills">Skills Practiced</Label>
                  <Textarea
                    id="edit-skills"
                    rows={2}
                    value={editingEntry.skills_learned || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, skills_learned: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-reflections">Reflections</Label>
                  <Textarea
                    id="edit-reflections"
                    rows={2}
                    value={editingEntry.reflections || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, reflections: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="hero" disabled={actionLoading}>
                    {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {entries.length === 0 ? (
          <EmptyState
            title="No logbook entries"
            description="Start documenting your learning activities"
            action={<Button onClick={() => setIsDialogOpen(true)}>Add First Entry</Button>}
          />
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {entry.title || new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h3>
                        <p className="text-sm text-muted-foreground">{entry.hospital_name || 'Internship'}</p>
                      </div>
                    </div>
                    {getStatusBadge(entry.status)}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Activities</p>
                      <p className="text-sm">{entry.activities}</p>
                    </div>
                    {entry.skills_learned && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Skills Practiced</p>
                        <p className="text-sm">{entry.skills_learned}</p>
                      </div>
                    )}
                    {entry.reflections && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Reflections</p>
                        <p className="text-sm">{entry.reflections}</p>
                      </div>
                    )}
                    {entry.supervisor_comments && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Supervisor Comments</p>
                        <p className="text-sm">{entry.supervisor_comments}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {entry.status !== 'approved' && (
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleEditEntry(entry)}>
                        <FileText className="w-4 h-4" />
                        Edit
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExportPDF(entry)}>
                      <Download className="w-4 h-4" />
                      Export
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
