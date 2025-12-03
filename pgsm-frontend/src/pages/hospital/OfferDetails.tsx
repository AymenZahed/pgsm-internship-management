import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Users, Clock, Edit, Trash2, Eye, MapPin, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function OfferDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const offer = {
    id: "1",
    title: "Cardiology Clinical Internship",
    department: "Cardiology",
    description: "This internship provides comprehensive exposure to clinical cardiology, including patient assessment, ECG interpretation, echocardiography observation, and participation in ward rounds. Interns will work alongside experienced cardiologists and gain hands-on experience in managing cardiac patients.",
    duration: "3 months",
    startDate: "2024-02-01",
    endDate: "2024-04-30",
    positions: 4,
    filledPositions: 2,
    applicants: 12,
    status: "active" as const,
    requirements: [
      "4th year medical student or above",
      "Basic ECG knowledge",
      "Strong communication skills",
      "Ability to work in a team",
    ],
    objectives: [
      "Perform basic cardiac examinations",
      "Interpret ECG readings",
      "Understand cardiac medications",
      "Participate in patient consultations",
    ],
    supervisor: {
      name: "Dr. Ahmed Benali",
      specialty: "Interventional Cardiology",
      email: "a.benali@chuibnisina.ma",
    },
    location: "Building A, 3rd Floor",
    schedule: "Monday - Friday, 8:00 AM - 4:00 PM",
    createdAt: "2024-01-10",
  };

  const applicants = [
    { id: "1", name: "Youssef El Amrani", university: "Université Mohammed V", status: "pending", gpa: "15.5/20" },
    { id: "2", name: "Salma Benjelloun", university: "Université Mohammed V", status: "reviewing", gpa: "16.2/20" },
    { id: "3", name: "Omar Tazi", university: "UIC Casablanca", status: "accepted", gpa: "14.8/20" },
    { id: "4", name: "Leila Fassi", university: "Université Mohammed VI", status: "rejected", gpa: "13.2/20" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Active</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/30">Pending</Badge>;
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
                <h1 className="text-3xl font-bold text-foreground">{offer.title}</h1>
                {getStatusBadge(offer.status)}
              </div>
              <p className="text-muted-foreground mt-1">{offer.department}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{offer.filledPositions}/{offer.positions}</p>
                <p className="text-sm text-muted-foreground">Positions Filled</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{offer.applicants}</p>
                <p className="text-sm text-muted-foreground">Applicants</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{offer.duration}</p>
                <p className="text-sm text-muted-foreground">Duration</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold">{new Date(offer.startDate).toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground">Start Date</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="applicants">Applicants ({offer.applicants})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{offer.description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Learning Objectives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {offer.objectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-muted-foreground">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {offer.requirements.map((req, idx) => (
                        <Badge key={idx} variant="outline">{req}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Supervisor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{offer.supervisor.name.split(' ').slice(1).map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{offer.supervisor.name}</p>
                        <p className="text-sm text-muted-foreground">{offer.supervisor.specialty}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{offer.supervisor.email}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Schedule & Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{offer.location}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{offer.schedule}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">
                        {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="applicants">
            <Card>
              <CardHeader>
                <CardTitle>Applicants</CardTitle>
                <CardDescription>Students who applied for this internship</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applicants.map((applicant) => (
                    <div key={applicant.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{applicant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{applicant.name}</p>
                          <p className="text-sm text-muted-foreground">{applicant.university}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">GPA: {applicant.gpa}</span>
                        {getStatusBadge(applicant.status)}
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
