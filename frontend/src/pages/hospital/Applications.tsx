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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { applicationService, Application } from "@/services/application.service";
import { Loader2 } from "lucide-react";

export default function HospitalApplications() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/30">Pending</Badge>;
      case "reviewing":
        return <Badge className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/30">Reviewing</Badge>;
      case "accepted":
        return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-600 hover:bg-red-500/30">Rejected</Badge>;
      case "withdrawn":
        return <Badge className="bg-gray-500/20 text-gray-600 hover:bg-gray-500/30">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getReceivedApplications({
        status: activeTab === "all" ? undefined : activeTab,
        department: departmentFilter !== "all" ? departmentFilter : undefined,
        search: searchQuery || undefined
      });

      if (response.success) {
        setApplications(response.data || []);

        // Extract departments from response or from applications data
        if (response.departments) {
          setDepartments(response.departments);
        } else if (response.data) {
          // Extract unique departments from applications
          const uniqueDepts = [...new Set(
            response.data
              .map((a: any) => a.department || a.service_name)
              .filter(Boolean)
          )];
          setDepartments(uniqueDepts);
        }
      } else {
        toast.error(response.message || "Failed to load applications");
      }
    } catch (error) {
      toast.error("Failed to load applications");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, departmentFilter, activeTab]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // No need for client-side filtering as it's now handled by the API
  const filteredApplications = applications;

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "pending").length,
    reviewing: applications.filter(a => a.status === "reviewing").length,
    accepted: applications.filter(a => a.status === "accepted").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  const handleReview = (application: Application) => {
    setSelectedApplication(application);
    setReviewNotes(application.notes || "");
    setReviewDialogOpen(true);
  };

  const handleStatusUpdate = async (appId: string, status: string, notes?: string) => {
    try {
      await applicationService.updateApplicationStatus(appId, {
        status,
        notes: notes || reviewNotes,
        ...(status === 'rejected' ? { rejection_reason: 'Application rejected' } : {})
      });

      setApplications(applications.map(a =>
        a.id === appId ? { ...a, status: status as any } : a
      ));

      setReviewDialogOpen(false);
      toast.success(`Application ${status}`);
    } catch (error) {
      toast.error("Failed to update application status");
      console.error(error);
    }
  };

  const handleAccept = (appId: string) => {
    handleStatusUpdate(appId, 'accepted');
  };

  const handleReject = (appId: string) => {
    handleStatusUpdate(appId, 'rejected');
  };

  const handleMarkReviewing = (appId: string) => {
    handleStatusUpdate(appId, 'reviewing');
  };

  const viewDetails = (application: Application) => {
    navigate(`/hospital/applications/${application.id}`);
  };

  if (loading) {
    return (
      <AppLayout role="hospital" userName="CHU Ibn Sina">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground mt-1">Review and manage student applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
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
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
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
                      <AvatarImage src={application.avatar} />
                      <AvatarFallback>
                        {application.first_name?.[0]}{application.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">
                          {application.first_name} {application.last_name}
                        </h3>
                        {getStatusBadge(application.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{application.email}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          {application.faculty || application.hospital_name}
                        </span>
                        <span>{application.academic_year}</span>
                        <span>Student No: {application.student_number}</span>
                      </div>
                      <div className="pt-2">
                        <p className="text-sm font-medium">{application.offer_title}</p>
                        <p className="text-xs text-muted-foreground">{application.department}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied {new Date(application.created_at).toLocaleDateString()}
                      </div>
                      {application.availability_date && (
                        <div className="mt-1">
                          Available from: {new Date(application.availability_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleReview(application)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => viewDetails(application)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                      {(application.status === "pending" || application.status === "reviewing") && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAccept(application.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleReject(application.id)}
                          >
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
              <p className="text-muted-foreground">
                {applications.length === 0 ? "No applications received yet" : "No applications match your filters"}
              </p>
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
                    <AvatarImage src={selectedApplication.avatar} />
                    <AvatarFallback className="text-lg">
                      {selectedApplication.first_name?.[0]}{selectedApplication.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedApplication.first_name} {selectedApplication.last_name}
                    </h3>
                    <p className="text-muted-foreground">{selectedApplication.email}</p>
                    <div className="flex gap-2 mt-2">
                      {getStatusBadge(selectedApplication.status)}
                      <Badge variant="outline">{selectedApplication.academic_year}</Badge>
                      <Badge variant="outline">Student No: {selectedApplication.student_number}</Badge>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Faculty:</span>
                    <p className="font-medium">{selectedApplication.faculty}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Applied For:</span>
                    <p className="font-medium">{selectedApplication.offer_title}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium">{selectedApplication.department}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Applied On:</span>
                    <p className="font-medium">
                      {new Date(selectedApplication.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedApplication.availability_date && (
                    <div>
                      <span className="text-muted-foreground">Available From:</span>
                      <p className="font-medium">
                        {new Date(selectedApplication.availability_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedApplication.start_date && (
                    <div>
                      <span className="text-muted-foreground">Internship Start:</span>
                      <p className="font-medium">
                        {new Date(selectedApplication.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Motivation */}
                {selectedApplication.motivation && (
                  <div>
                    <Label className="text-muted-foreground">Motivation</Label>
                    <p className="mt-1 p-3 bg-muted/50 rounded-lg text-sm">
                      {selectedApplication.motivation}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {selectedApplication.experience && (
                  <div>
                    <Label className="text-muted-foreground">Prior Experience</Label>
                    <p className="mt-1 p-3 bg-muted/50 rounded-lg text-sm">
                      {selectedApplication.experience}
                    </p>
                  </div>
                )}

                {/* Cover Letter */}
                {selectedApplication.cover_letter && (
                  <div>
                    <Label className="text-muted-foreground">Cover Letter</Label>
                    <p className="mt-1 p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">
                      {selectedApplication.cover_letter}
                    </p>
                  </div>
                )}

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
                    <Button
                      variant="outline"
                      onClick={() => handleMarkReviewing(selectedApplication.id)}
                    >
                      Mark as Reviewing
                    </Button>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                      Close
                    </Button>
                    {(selectedApplication.status === "pending" || selectedApplication.status === "reviewing") && (
                      <>
                        <Button
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleReject(selectedApplication.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAccept(selectedApplication.id)}
                        >
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