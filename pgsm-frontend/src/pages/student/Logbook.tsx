import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, Check, Clock, FileText } from "lucide-react";
import { useState } from "react";

const logbookEntries = [
  {
    id: "1",
    date: "2025-01-20",
    activities: "Observed pediatric consultations, participated in morning rounds",
    skills: "Patient examination, medical history taking",
    reflections: "Learned about common pediatric conditions and communication with children",
    status: "approved" as const,
  },
  {
    id: "2",
    date: "2025-01-19",
    activities: "Emergency department rotation, handled minor trauma cases",
    skills: "Wound suturing, vital signs assessment",
    reflections: "Developed confidence in emergency procedures",
    status: "pending" as const,
  },
];

export default function Logbook() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <input
                    type="date"
                    id="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activities">Activities</Label>
                  <Textarea
                    id="activities"
                    placeholder="Describe your daily activities and procedures observed"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills Practiced</Label>
                  <Textarea
                    id="skills"
                    placeholder="List the clinical skills you practiced"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reflections">Reflections</Label>
                  <Textarea
                    id="reflections"
                    placeholder="Your thoughts and learning points from today"
                    rows={3}
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

        <div className="space-y-4">
          {logbookEntries.map((entry) => (
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
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">Export PDF</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
