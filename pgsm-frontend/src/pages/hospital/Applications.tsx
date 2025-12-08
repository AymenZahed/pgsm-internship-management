import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Calendar, GraduationCap, FileText, Check, X, Eye, Clock, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ApplicationStatus = "pending" | "reviewing" | "accepted" | "rejected";

interface Application {
  id: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  university: string;
  year: string;
  offer: string;
  department: string;
  appliedAt: string;
  status: ApplicationStatus;
  documents: string[];
  gpa: string;
  motivation: string;
  experience: string;
}

const initialApplications: Application[] = [
  {
    id: "1",
    studentName: "Youssef El Amrani",
    studentEmail: "y.elamrani@um5.ac.ma",
    university: "Université Mohammed V",
    year: "4th Year",
    offer: "Cardiology Clinical Internship",
    department: "Cardiology",
    appliedAt: "2024-01-18",
    status: "pending",
    documents: ["CV", "Cover Letter", "Transcripts"],
    gpa: "15.5/20",
    motivation: "I am passionate about cardiology and would like to gain hands-on experience in this field.",
    experience: "Completed a 1-month observation at a local clinic."
  },
  {
    id: "2",
    studentName: "Salma Benjelloun",
    studentEmail: "s.benjelloun@um5.ac.ma",
    university: "Université Mohammed V",
    year: "5th Year",
    offer: "Emergency Medicine Rotation",
    department: "Emergency",
    appliedAt: "2024-01-17",
    status: "reviewing",
    documents: ["CV", "Cover Letter", "Transcripts", "Recommendation Letter"],
    gpa: "16.2/20",
    motivation: "Emergency medicine fascinates me due to its fast-paced nature and critical decision-making.",
    experience: "Volunteer at Red Cross for 2 years."
  },
  {
    id: "3",
    studentName: "Omar Tazi",
    studentEmail: "o.tazi@uic.ac.ma",
    university: "Université Internationale de Casablanca",
    year: "4th Year",
    offer: "Cardiology Clinical Internship",
    department: "Cardiology",
    appliedAt: "2024-01-16",
    status: "accepted",
    documents: ["CV", "Cover Letter"],
    gpa: "14.8/20",
    motivation: "Cardiac health has been my primary interest since my second year of medical school.",
    experience: "Research assistant in cardiology lab."
  },
  {
    id: "4",
    studentName: "Leila Fassi",
    studentEmail: "l.fassi@um6ss.ma",
    university: "Université Mohammed VI",
    year: "3rd Year",
    offer: "Pediatric Care Internship",
    department: "Pediatrics",
    appliedAt: "2024-01-15",
    status: "rejected",
    documents: ["CV", "Cover Letter"],
    gpa: "13.2/20",
    motivation: "I want to specialize in pediatric care.",
    experience: "No prior clinical experience."
  },
  {
    id: "5",
    studentName: "Karim Idrissi",
    studentEmail: "k.idrissi@um5.ac.ma",
    university: "Université Mohammed V",
    year: "5th Year",
    offer: "Emergency Medicine Rotation",
    department: "Emergency",
    appliedAt: "2024-01-14",
    status: "pending",
    documents: ["CV", "Cover Letter", "Transcripts"],
    gpa: "15.0/20",
    motivation: "Emergency medicine aligns with my career goals.",
    experience: "Completed summer internship at a regional hospital."
  },
];

export default function HospitalApplications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/30">Pending</Badge>;
      case "reviewing":
        return <Badge className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/30">Reviewing</Badge>;
      case "accepted":
        return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-600 hover:bg-red-500/30">Rejected</Badge>;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.offer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || app.status === activeTab;
    const matchesDept = departmentFilter === "all" || app.department === departmentFilter;
    return matchesSearch && matchesTab && matchesDept;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "pending").length,
    reviewing: applications.filter(a => a.status === "reviewing").length,
    accepted: applications.filter(a => a.status === "accepted").length,
  };

  const departments = [...new Set(applications.map(a => a.department))];

  const handleReview = (application: Application) => {
    setSelectedApplication(application);
    setReviewNotes("");
    setReviewDialogOpen(true);
  };

  const handleAccept = (appId: string) => {
    setApplications(applications.map(a => 
      a.id === appId ? { ...a, status: "accepted" as ApplicationStatus } : a
    ));
    setReviewDialogOpen(false);
    toast.success("Application accepted");
  };

  const handleReject = (appId: string) => {
    setApplications(applications.map(a => 
      a.id === appId ? { ...a, status: "rejected" as ApplicationStatus } : a
    ));
    setReviewDialogOpen(false);
    toast.success("Application rejected");
  };

  const handleMarkReviewing = (appId: string) => {
    setApplications(applications.map(a => 
      a.id === appId ? { ...a, status: "reviewing" as ApplicationStatus } : a
    ));
    toast.success("Application marked as reviewing");
  };

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground mt-1">Review and manage student applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.reviewing}</p>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.accepted}</p>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="reviewing">Reviewing</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={application.studentAvatar} />
                      <AvatarFallback>{application.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{application.studentName}</h3>
                        {getStatusBadge(application.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{application.studentEmail}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          {application.university}
                        </span>
                        <span>{application.year}</span>
                        <span>GPA: {application.gpa}</span>
                      </div>
                      <div className="pt-2">
                        <p className="text-sm font-medium">{application.offer}</p>
                        <p className="text-xs text-muted-foreground">{application.department}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied {new Date(application.appliedAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {application.documents.map((doc, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{doc}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleReview(application)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      {(application.status === "pending" || application.status === "reviewing") && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAccept(application.id)}>
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleReject(application.id)}>
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No applications found</p>
            </CardContent>
          </Card>
        )}

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Review</DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedApplication.studentAvatar} />
                    <AvatarFallback className="text-lg">{selectedApplication.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedApplication.studentName}</h3>
                    <p className="text-muted-foreground">{selectedApplication.studentEmail}</p>
                    <div className="flex gap-2 mt-2">
                      {getStatusBadge(selectedApplication.status)}
                      <Badge variant="outline">{selectedApplication.year}</Badge>
                      <Badge variant="outline">GPA: {selectedApplication.gpa}</Badge>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">University:</span>
                    <p className="font-medium">{selectedApplication.university}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Applied For:</span>
                    <p className="font-medium">{selectedApplication.offer}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium">{selectedApplication.department}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Applied On:</span>
                    <p className="font-medium">{new Date(selectedApplication.appliedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Motivation */}
                <div>
                  <Label className="text-muted-foreground">Motivation</Label>
                  <p className="mt-1 p-3 bg-muted/50 rounded-lg text-sm">{selectedApplication.motivation}</p>
                </div>

                {/* Experience */}
                <div>
                  <Label className="text-muted-foreground">Prior Experience</Label>
                  <p className="mt-1 p-3 bg-muted/50 rounded-lg text-sm">{selectedApplication.experience}</p>
                </div>

                {/* Documents */}
                <div>
                  <Label className="text-muted-foreground">Submitted Documents</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedApplication.documents.map((doc, idx) => (
                      <Button key={idx} variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        {doc}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Review Notes */}
                <div>
                  <Label htmlFor="notes">Review Notes (Internal)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes about this application..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t">
                  {selectedApplication.status === "pending" && (
                    <Button variant="outline" onClick={() => handleMarkReviewing(selectedApplication.id)}>
                      Mark as Reviewing
                    </Button>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                      Close
                    </Button>
                    {(selectedApplication.status === "pending" || selectedApplication.status === "reviewing") && (
                      <>
                        <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleReject(selectedApplication.id)}>
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAccept(selectedApplication.id)}>
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}