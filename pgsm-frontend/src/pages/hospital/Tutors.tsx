import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Users, Star, Mail, Phone, Edit, Eye } from "lucide-react";
import { useState } from "react";

interface Tutor {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  department: string;
  specialty: string;
  currentStudents: number;
  maxStudents: number;
  totalSupervised: number;
  rating: number;
  status: "active" | "inactive" | "on_leave";
}

const mockTutors: Tutor[] = [
  {
    id: "1",
    name: "Dr. Ahmed Benali",
    email: "a.benali@chuibnisina.ma",
    phone: "+212 661 234 567",
    department: "Cardiology",
    specialty: "Interventional Cardiology",
    currentStudents: 3,
    maxStudents: 5,
    totalSupervised: 28,
    rating: 4.8,
    status: "active"
  },
  {
    id: "2",
    name: "Dr. Fatima Zahra",
    email: "f.zahra@chuibnisina.ma",
    phone: "+212 662 345 678",
    department: "Emergency",
    specialty: "Emergency Medicine",
    currentStudents: 4,
    maxStudents: 6,
    totalSupervised: 45,
    rating: 4.9,
    status: "active"
  },
  {
    id: "3",
    name: "Dr. Khalid Mansouri",
    email: "k.mansouri@chuibnisina.ma",
    phone: "+212 663 456 789",
    department: "Pediatrics",
    specialty: "Pediatric Surgery",
    currentStudents: 2,
    maxStudents: 4,
    totalSupervised: 32,
    rating: 4.7,
    status: "active"
  },
  {
    id: "4",
    name: "Dr. Hassan Alami",
    email: "h.alami@chuibnisina.ma",
    phone: "+212 664 567 890",
    department: "Surgery",
    specialty: "General Surgery",
    currentStudents: 0,
    maxStudents: 4,
    totalSupervised: 18,
    rating: 4.5,
    status: "on_leave"
  },
  {
    id: "5",
    name: "Dr. Nadia Chraibi",
    email: "n.chraibi@chuibnisina.ma",
    phone: "+212 665 678 901",
    department: "Neurology",
    specialty: "Clinical Neurology",
    currentStudents: 0,
    maxStudents: 3,
    totalSupervised: 15,
    rating: 4.6,
    status: "inactive"
  },
];

export default function HospitalTutors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusBadge = (status: Tutor["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "on_leave":
        return <Badge className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/30">On Leave</Badge>;
    }
  };

  const filteredTutors = mockTutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === "all" || tutor.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || tutor.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const departments = [...new Set(mockTutors.map(t => t.department))];

  const stats = {
    total: mockTutors.length,
    active: mockTutors.filter(t => t.status === "active").length,
    totalStudents: mockTutors.reduce((acc, t) => acc + t.currentStudents, 0),
    avgRating: (mockTutors.reduce((acc, t) => acc + t.rating, 0) / mockTutors.length).toFixed(1),
  };

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tutors Management</h1>
            <p className="text-muted-foreground mt-1">Manage doctors supervising interns</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Tutor
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Tutors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Active Tutors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Current Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgRating}</p>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
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
              placeholder="Search tutors..."
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tutors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTutors.map((tutor) => (
            <Card key={tutor.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={tutor.avatar} />
                      <AvatarFallback>{tutor.name.split(' ').slice(1).map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{tutor.name}</CardTitle>
                      <CardDescription className="text-xs">{tutor.specialty}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(tutor.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium">{tutor.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Students</span>
                    <span className="font-medium">{tutor.currentStudents}/{tutor.maxStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Supervised</span>
                    <span className="font-medium">{tutor.totalSupervised}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {tutor.rating}
                    </span>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      tutor.currentStudents >= tutor.maxStudents 
                        ? "bg-amber-500" 
                        : "bg-primary"
                    }`}
                    style={{ width: `${(tutor.currentStudents / tutor.maxStudents) * 100}%` }}
                  />
                </div>

                <div className="flex gap-2 text-xs text-muted-foreground">
                  <a href={`mailto:${tutor.email}`} className="flex items-center gap-1 hover:text-foreground">
                    <Mail className="w-3 h-3" />
                    Email
                  </a>
                  <a href={`tel:${tutor.phone}`} className="flex items-center gap-1 hover:text-foreground">
                    <Phone className="w-3 h-3" />
                    Call
                  </a>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTutors.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No tutors found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
