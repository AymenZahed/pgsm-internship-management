import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, GraduationCap, FileText, Check, X, Eye, Clock } from "lucide-react";
import { useState } from "react";

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
}

const mockApplications: Application[] = [
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
    gpa: "15.5/20"
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
    gpa: "16.2/20"
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
    gpa: "14.8/20"
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
    gpa: "13.2/20"
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
    gpa: "15.0/20"
  },
];

export default function HospitalApplications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

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

  const filteredApplications = mockApplications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.offer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || app.status === activeTab;
    const matchesDept = departmentFilter === "all" || app.department === departmentFilter;
    return matchesSearch && matchesTab && matchesDept;
  });

  const stats = {
    total: mockApplications.length,
    pending: mockApplications.filter(a => a.status === "pending").length,
    reviewing: mockApplications.filter(a => a.status === "reviewing").length,
    accepted: mockApplications.filter(a => a.status === "accepted").length,
  };

  const departments = [...new Set(mockApplications.map(a => a.department))];

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
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      {(application.status === "pending" || application.status === "reviewing") && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
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
      </div>
    </AppLayout>
  );
}
