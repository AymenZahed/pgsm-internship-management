import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, Check, Clock, FileText, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface LogbookEntry {
  id: string;
  date: string;
  activities: string;
  skills: string;
  reflections: string;
  status: "approved" | "pending";
}

const initialEntries: LogbookEntry[] = [
  {
    id: "1",
    date: "2025-01-20",
    activities: "Observed pediatric consultations, participated in morning rounds",
    skills: "Patient examination, medical history taking",
    reflections: "Learned about common pediatric conditions and communication with children",
    status: "approved",
  },
  {
    id: "2",
    date: "2025-01-19",
    activities: "Emergency department rotation, handled minor trauma cases",
    skills: "Wound suturing, vital signs assessment",
    reflections: "Developed confidence in emergency procedures",
    status: "pending",
  },
];

export default function Logbook() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [entries, setEntries] = useState<LogbookEntry[]>(initialEntries);
  const [editingEntry, setEditingEntry] = useState<LogbookEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    activities: "",
    skills: "",
    reflections: "",
  });

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: LogbookEntry = {
      id: Date.now().toString(),
      ...newEntry,
      status: "pending",
    };
    setEntries([entry, ...entries]);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      activities: "",
      skills: "",
      reflections: "",
    });
    setIsDialogOpen(false);
    toast.success("Logbook entry added successfully");
  };

  const handleEditEntry = (entry: LogbookEntry) => {
    setEditingEntry({ ...entry });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;
    
    setEntries(entries.map(entry => 
      entry.id === editingEntry.id ? { ...editingEntry, status: "pending" } : entry
    ));
    setIsEditDialogOpen(false);
    setEditingEntry(null);
    toast.success("Logbook entry updated successfully");
  };

  const handleExportPDF = (entry: LogbookEntry) => {
    const content = `
LOGBOOK ENTRY
=============

Date: ${new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Status: ${entry.status === 'approved' ? 'Approved' : 'Pending Review'}

ACTIVITIES
----------
${entry.activities}

SKILLS PRACTICED
----------------
${entry.skills}

REFLECTIONS
-----------
${entry.reflections}

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

  return (
    <AppLayout role="student" userName="Ahmed Benali">
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
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <input
                    type="date"
                    id="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activities">Activities</Label>
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
                    value={newEntry.skills}
                    onChange={(e) => setNewEntry({ ...newEntry, skills: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reflections">Reflections</Label>
                  <Textarea
                    id="reflections"
                    placeholder="Your thoughts and learning points from today"
                    rows={3}
                    value={newEntry.reflections}
                    onChange={(e) => setNewEntry({ ...newEntry, reflections: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero">Submit Entry</Button>
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
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <input
                    type="date"
                    id="edit-date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editingEntry.date}
                    onChange={(e) => setEditingEntry({ ...editingEntry, date: e.target.value })}
                    required
                  />
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
                    value={editingEntry.skills}
                    onChange={(e) => setEditingEntry({ ...editingEntry, skills: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-reflections">Reflections</Label>
                  <Textarea
                    id="edit-reflections"
                    rows={3}
                    value={editingEntry.reflections}
                    onChange={(e) => setEditingEntry({ ...editingEntry, reflections: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero">Save Changes</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

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
                      <h3 className="font-semibold">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                      <p className="text-sm text-muted-foreground">Pediatrics Rotation</p>
                    </div>
                  </div>
                  {entry.status === "approved" ? (
                    <Badge className="bg-success text-success-foreground gap-1">
                      <Check className="w-3 h-3" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="w-3 h-3" />
                      Pending Review
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Activities</p>
                    <p className="text-sm">{entry.activities}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Skills Practiced</p>
                    <p className="text-sm">{entry.skills}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Reflections</p>
                    <p className="text-sm">{entry.reflections}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleEditEntry(entry)}
                  >
                    <FileText className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleExportPDF(entry)}
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
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