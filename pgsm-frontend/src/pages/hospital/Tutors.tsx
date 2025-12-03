import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Users, Star, Mail, Phone, Edit, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

const initialTutors: Tutor[] = [
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
  const [tutors, setTutors] = useState<Tutor[]>(initialTutors);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [newTutor, setNewTutor] = useState<Partial<Tutor>>({
    name: "",
    email: "",
    phone: "",
    department: "",
    specialty: "",
    maxStudents: 4,
    status: "active"
  });

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

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === "all" || tutor.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || tutor.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const departments = [...new Set(tutors.map(t => t.department))];

  const stats = {
    total: tutors.length,
    active: tutors.filter(t => t.status === "active").length,
    totalStudents: tutors.reduce((acc, t) => acc + t.currentStudents, 0),
    avgRating: (tutors.reduce((acc, t) => acc + t.rating, 0) / tutors.length).toFixed(1),
  };

  const handleView = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setViewDialogOpen(true);
  };

  const handleEdit = (tutor: Tutor) => {
    setSelectedTutor({ ...tutor });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutor) return;
    setTutors(tutors.map(t => t.id === selectedTutor.id ? selectedTutor : t));
    setEditDialogOpen(false);
    toast.success("Tutor updated successfully");
  };

  const handleAddTutor = (e: React.FormEvent) => {
    e.preventDefault();
    const tutor: Tutor = {
      id: Date.now().toString(),
      name: newTutor.name || "",
      email: newTutor.email || "",
      phone: newTutor.phone || "",
      department: newTutor.department || "",
      specialty: newTutor.specialty || "",
      currentStudents: 0,
      maxStudents: newTutor.maxStudents || 4,
      totalSupervised: 0,
      rating: 0,
      status: newTutor.status as Tutor["status"] || "active"
    };
    setTutors([tutor, ...tutors]);
    setAddDialogOpen(false);
    setNewTutor({
      name: "",
      email: "",
      phone: "",
      department: "",
      specialty: "",
      maxStudents: 4,
      status: "active"
    });
    toast.success("Tutor added successfully");
  };

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tutors Management</h1>
            <p className="text-muted-foreground mt-1">Manage doctors supervising interns</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
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
                      {tutor.rating || "N/A"}
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
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleView(tutor)}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(tutor)}>
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

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tutor Details</DialogTitle>
            </DialogHeader>
            {selectedTutor && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedTutor.avatar} />
                    <AvatarFallback className="text-lg">{selectedTutor.name.split(' ').slice(1).map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedTutor.name}</h3>
                    <p className="text-muted-foreground">{selectedTutor.specialty}</p>
                    <div className="mt-2">{getStatusBadge(selectedTutor.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedTutor.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{selectedTutor.phone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium">{selectedTutor.department}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rating:</span>
                    <p className="font-medium flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {selectedTutor.rating || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Students:</span>
                    <p className="font-medium">{selectedTutor.currentStudents} / {selectedTutor.maxStudents}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Supervised:</span>
                    <p className="font-medium">{selectedTutor.totalSupervised}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
                  <Button onClick={() => { setViewDialogOpen(false); handleEdit(selectedTutor); }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Tutor</DialogTitle>
            </DialogHeader>
            {selectedTutor && (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedTutor.name}
                    onChange={(e) => setSelectedTutor({ ...selectedTutor, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={selectedTutor.email}
                      onChange={(e) => setSelectedTutor({ ...selectedTutor, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={selectedTutor.phone}
                      onChange={(e) => setSelectedTutor({ ...selectedTutor, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-department">Department</Label>
                    <Input
                      id="edit-department"
                      value={selectedTutor.department}
                      onChange={(e) => setSelectedTutor({ ...selectedTutor, department: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-specialty">Specialty</Label>
                    <Input
                      id="edit-specialty"
                      value={selectedTutor.specialty}
                      onChange={(e) => setSelectedTutor({ ...selectedTutor, specialty: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-maxStudents">Max Students</Label>
                    <Input
                      id="edit-maxStudents"
                      type="number"
                      value={selectedTutor.maxStudents}
                      onChange={(e) => setSelectedTutor({ ...selectedTutor, maxStudents: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={selectedTutor.status}
                      onValueChange={(value: "active" | "inactive" | "on_leave") => setSelectedTutor({ ...selectedTutor, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Tutor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTutor} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Name</Label>
                <Input
                  id="add-name"
                  placeholder="Dr. Full Name"
                  value={newTutor.name}
                  onChange={(e) => setNewTutor({ ...newTutor, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-email">Email</Label>
                  <Input
                    id="add-email"
                    type="email"
                    placeholder="email@hospital.ma"
                    value={newTutor.email}
                    onChange={(e) => setNewTutor({ ...newTutor, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-phone">Phone</Label>
                  <Input
                    id="add-phone"
                    placeholder="+212 6XX XXX XXX"
                    value={newTutor.phone}
                    onChange={(e) => setNewTutor({ ...newTutor, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-department">Department</Label>
                  <Input
                    id="add-department"
                    placeholder="e.g. Cardiology"
                    value={newTutor.department}
                    onChange={(e) => setNewTutor({ ...newTutor, department: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-specialty">Specialty</Label>
                  <Input
                    id="add-specialty"
                    placeholder="e.g. Interventional Cardiology"
                    value={newTutor.specialty}
                    onChange={(e) => setNewTutor({ ...newTutor, specialty: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-maxStudents">Max Students</Label>
                  <Input
                    id="add-maxStudents"
                    type="number"
                    value={newTutor.maxStudents}
                    onChange={(e) => setNewTutor({ ...newTutor, maxStudents: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-status">Status</Label>
                  <Select
                    value={newTutor.status}
                    onValueChange={(value: "active" | "inactive" | "on_leave") => setNewTutor({ ...newTutor, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Add Tutor</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}