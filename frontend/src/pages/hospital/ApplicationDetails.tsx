import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Phone, GraduationCap, Calendar, FileText, Download, Check, X, Clock, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { applicationService, Application } from "@/services/application.service";
import type { Document } from "@/services/document.service";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ApplicationDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await applicationService.getApplicationById(id);
      if (response.success && response.data) {
        setApplication(response.data);
        setNotes(response.data.notes || "");
      }
    } catch (error) {
      toast.error("Failed to load application details");
      console.error(error);
      navigate("/hospital/applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/30">Pending Review</Badge>;
      case "reviewing":
        return <Badge className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/30">Reviewing</Badge>;
      case "accepted":
        return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-600 hover:bg-red-500/30">Rejected</Badge>;
      case "withdrawn":
        return <Badge className="bg-gray-500/20 text-gray-600 hover:bg-gray-500/30">Withdrawn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleSaveNotes = async () => {
    if (!id || !application) return;

    try {
      setSaving(true);
      await applicationService.updateApplicationStatus(id, {
        status: application.status,
        notes
      });
      toast.success("Notes saved successfully");
    } catch (error) {
      toast.error("Failed to save notes");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;

    try {
      await applicationService.updateApplicationStatus(id, {
        status: newStatus,
        notes,
        ...(newStatus === 'rejected' ? { rejection_reason: 'Application rejected' } : {})
      });

      toast.success(`Application ${newStatus}`);
      navigate("/hospital/applications");
    } catch (error) {
      toast.error("Failed to update application status");
      console.error(error);
    }
  };

  const handleAccept = () => handleStatusUpdate('accepted');
  const handleReject = () => handleStatusUpdate('rejected');

  if (loading) {
    return (
      <AppLayout role="hospital" userName="CHU Ibn Sina">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!application) {
    return (
      <AppLayout role="hospital" userName="CHU Ibn Sina">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold">Application not found</h2>
          <Button onClick={() => navigate("/hospital/applications")} className="mt-4">
            Back to Applications
          </Button>
        </div>
      </AppLayout>
    );
  }

  const profileDocuments: Document[] = (application.profile_documents || []) as Document[];

  // Mock timeline based on application status
  const timeline = [
    {
      date: new Date(application.created_at).toLocaleDateString(),
      action: "Application submitted",
      status: "completed"
    },
    {
      date: application.status !== "pending" ? "2024-01-19" : "-",
      action: "Documents verified",
      status: application.status !== "pending" ? "completed" : "pending"
    },
    {
      date: ["reviewing", "accepted", "rejected"].includes(application.status) ? "2024-01-20" : "-",
      action: "Under review",
      status: application.status === "reviewing" ? "current" :
        ["accepted", "rejected"].includes(application.status) ? "completed" : "pending"
    },
    {
      date: application.status === "accepted" ? "2024-01-25" : "-",
      action: "Interview scheduled",
      status: application.status === "accepted" ? "completed" : "pending"
    },
    {
      date: ["accepted", "rejected"].includes(application.status) ? "2024-01-30" : "-",
      action: "Final decision",
      status: ["accepted", "rejected"].includes(application.status) ? "completed" : "pending"
    },
  ];

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">Application Review</h1>
                {getStatusBadge(application.status)}
              </div>
              <p className="text-muted-foreground mt-1">
                Applied on {new Date(application.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {application.status !== "accepted" && application.status !== "rejected" && application.status !== "withdrawn" && (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={handleReject}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
            )}
            {application.status !== "accepted" && application.status !== "rejected" && application.status !== "withdrawn" && (
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleAccept}>
                <Check className="w-4 h-4 mr-2" />
                Accept
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Applicant Info */}
            <Card>
              <CardHeader>
                <CardTitle>Applicant Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={application.avatar} />
                    <AvatarFallback className="text-lg">
                      {application.first_name?.[0]}{application.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {application.first_name} {application.last_name}
                    </h3>
                    <p className="text-muted-foreground">{application.faculty}</p>
                    <p className="text-sm text-muted-foreground">{application.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {application.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Student Number</p>
                    <p className="font-medium">{application.student_number}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Academic Year</p>
                    <p className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      {application.academic_year}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Applied On</p>
                    <p className="font-medium">
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Documents (Profile-level) */}
            {profileDocuments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Student Documents</CardTitle>
                  <CardDescription>Documents uploaded in the student's profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profileDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between gap-3 border rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground uppercase">{doc.type}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(`${API_BASE_URL.replace(/\/api$/, "")}/${doc.file_path}`, "_blank")}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Cover Letter */}
            {application.cover_letter && (
              <Card>
                <CardHeader>
                  <CardTitle>Cover Letter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground leading-relaxed">
                      {application.cover_letter}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Motivation */}
            {application.motivation && (
              <Card>
                <CardHeader>
                  <CardTitle>Motivation Statement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground leading-relaxed">
                      {application.motivation}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {application.experience && (
              <Card>
                <CardHeader>
                  <CardTitle>Prior Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground leading-relaxed">
                      {application.experience}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Review Notes</CardTitle>
                <CardDescription>Add internal notes about this application</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add notes about this applicant..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[120px]"
                />
                <Button
                  className="mt-3"
                  variant="outline"
                  onClick={handleSaveNotes}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Applied Position */}
            <Card>
              <CardHeader>
                <CardTitle>Applied Position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{application.offer_title}</p>
                  <p className="text-sm text-muted-foreground">{application.department}</p>
                  <p className="text-sm text-muted-foreground">{application.hospital_name}</p>
                </div>
                <div className="space-y-2 text-sm">
                  {application.start_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span>{new Date(application.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {application.end_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date</span>
                      <span>{new Date(application.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {application.availability_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available From</span>
                      <span>{new Date(application.availability_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                {application.offer_id && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/hospital/offers/${application.offer_id}`)}
                  >
                    View Offer Details
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.status === "completed"
                        ? "bg-green-500/20"
                        : item.status === "current"
                          ? "bg-blue-500/20"
                          : "bg-muted"
                        }`}>
                        {item.status === "completed" ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : item.status === "current" ? (
                          <Clock className="w-3 h-3 text-blue-600" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm ${item.status === "pending" ? "text-muted-foreground" : ""}`}>
                          {item.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Interview
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Contract
                </Button>
              </CardContent>
            </Card>

            {/* Rejection Reason */}
            {application.rejection_reason && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-700">Rejection Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-600">{application.rejection_reason}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}