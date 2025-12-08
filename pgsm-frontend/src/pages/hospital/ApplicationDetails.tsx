import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Phone, GraduationCap, Calendar, FileText, Download, Check, X, Clock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ApplicationDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [notes, setNotes] = useState("");

  const application = {
    id: "1",
    status: "pending" as const,
    appliedAt: "2024-01-18",
    student: {
      name: "Youssef El Amrani",
      email: "y.elamrani@um5.ac.ma",
      phone: "+212 661 123 456",
      university: "Université Mohammed V",
      faculty: "Faculty of Medicine and Pharmacy",
      year: "4th Year",
      gpa: "15.5/20",
      address: "123 Rue Hassan II, Rabat",
    },
    offer: {
      title: "Cardiology Clinical Internship",
      department: "Cardiology",
      duration: "3 months",
      startDate: "2024-02-01",
      positions: 4,
    },
    documents: [
      { name: "Curriculum Vitae", type: "PDF", size: "245 KB" },
      { name: "Cover Letter", type: "PDF", size: "120 KB" },
      { name: "Academic Transcripts", type: "PDF", size: "890 KB" },
      { name: "Recommendation Letter", type: "PDF", size: "180 KB" },
    ],
    coverLetter: `Dear Dr. Benali,

I am writing to express my strong interest in the Cardiology Clinical Internship position at CHU Ibn Sina. As a 4th year medical student at Université Mohammed V with a deep passion for cardiology, I believe this opportunity would be instrumental in my professional development.

Throughout my academic career, I have maintained a GPA of 15.5/20 while actively participating in various clinical rotations. My interest in cardiology began during my internal medicine rotation where I was fascinated by the complexity of cardiac diagnostics and treatment.

I am particularly drawn to CHU Ibn Sina's reputation for excellence in interventional cardiology and the opportunity to learn from renowned specialists like yourself. I am eager to contribute my dedication, strong work ethic, and enthusiasm for learning to your team.

Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to your department.

Sincerely,
Youssef El Amrani`,
    timeline: [
      { date: "2024-01-18", action: "Application submitted", status: "completed" },
      { date: "2024-01-19", action: "Documents verified", status: "completed" },
      { date: "2024-01-20", action: "Under review", status: "current" },
      { date: "-", action: "Interview scheduled", status: "pending" },
      { date: "-", action: "Final decision", status: "pending" },
    ],
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
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleAccept = () => {
    toast({
      title: "Application Accepted",
      description: `${application.student.name} has been accepted for the internship.`,
    });
    navigate("/hospital/applications");
  };

  const handleReject = () => {
    toast({
      title: "Application Rejected",
      description: `${application.student.name}'s application has been rejected.`,
      variant: "destructive",
    });
    navigate("/hospital/applications");
  };

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
              <p className="text-muted-foreground mt-1">Applied on {new Date(application.appliedAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleReject}>
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleAccept}>
              <Check className="w-4 h-4 mr-2" />
              Accept
            </Button>
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
                    <AvatarFallback className="text-lg">{application.student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{application.student.name}</h3>
                    <p className="text-muted-foreground">{application.student.university}</p>
                    <p className="text-sm text-muted-foreground">{application.student.faculty}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {application.student.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {application.student.phone}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Academic Year</p>
                    <p className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      {application.student.year}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">GPA</p>
                    <p className="font-medium">{application.student.gpa}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cover Letter */}
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground leading-relaxed">
                    {application.coverLetter}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Submitted Documents</CardTitle>
                <CardDescription>Review the applicant's supporting documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {application.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                <Button className="mt-3" variant="outline">Save Notes</Button>
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
                  <p className="font-medium">{application.offer.title}</p>
                  <p className="text-sm text-muted-foreground">{application.offer.department}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{application.offer.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date</span>
                    <span>{new Date(application.offer.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Positions</span>
                    <span>{application.offer.positions} available</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/hospital/offers/${id}`)}>
                  View Offer Details
                </Button>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {application.timeline.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.status === "completed" 
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
                  <Phone className="w-4 h-4 mr-2" />
                  Call Applicant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
