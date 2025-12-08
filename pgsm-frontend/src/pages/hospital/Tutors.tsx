import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Users, Star, Mail, Phone, Edit, Eye, Loader2, Building2, Stethoscope, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { tutorService, Tutor } from "@/services/tutor.service";
import { useAuth } from "@/contexts/AuthContext";

interface TutorWithStats extends Tutor {
  current_students?: number;
  total_supervised?: number;
  rating?: number;
}

export default function HospitalTutors() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [tutors, setTutors] = useState<TutorWithStats[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorWithStats | null>(null);
  const [newTutor, setNewTutor] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    specialization: "",
    department: "",
    title: "",
    license_number: "",
    years_experience: 0,
    max_students: 5,
    is_available: true,
  });

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const response = await tutorService.getHospitalTutors();
      if (response.success) {
        setTutors(response.data || []);
      } else {
        toast.error(response.message || "Failed to load tutors");
      }
    } catch (error: any) {
      console.error("Error fetching tutors:", error);
      toast.error(error.message || "Failed to load tutors");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await tutorService.getDepartments();
      if (response.success) {
        setDepartments(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      // Fallback to extracting departments from tutors if API fails
      const uniqueDepts = [...new Set(tutors.map(t => t.department).filter(Boolean))] as string[];
      setDepartments(uniqueDepts);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  useEffect(() => {
    if (tutors.length > 0) {
      fetchDepartments();
    }
  }, [tutors]);

  const getStatusBadge = (is_available: boolean, max_students: number, current_students?: number) => {
    if (!is_available) {
      return <Badge variant="secondary">Not Available</Badge>;
    }
    if (current_students && current_students >= max_students) {
      return <Badge className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/30">Full</Badge>;
    }
    return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Available</Badge>;
  };

  const filteredTutors = tutors.filter(tutor => {
    const fullName = `${tutor.first_name} ${tutor.last_name}`;
    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tutor.specialization?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (tutor.department?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesDept = departmentFilter === "all" || tutor.department === departmentFilter;
    
    const matchesAvailability = availabilityFilter === "all" || 
      (availabilityFilter === "available" && tutor.is_available) ||
      (availabilityFilter === "not_available" && !tutor.is_available);
    
    return matchesSearch && matchesDept && matchesAvailability;
  });

  const stats = {
    total: tutors.length,
    active: tutors.filter(t => t.is_available).length,
    totalStudents: tutors.reduce((acc, t) => acc + (t.current_students || 0), 0),
    avgRating: (tutors.reduce((acc, t) => acc + (t.rating || 0), 0) / Math.max(tutors.length, 1)).toFixed(1),
  };

  const handleView = (tutor: TutorWithStats) => {
    setSelectedTutor(tutor);
    setViewDialogOpen(true);
  };

  const handleEdit = (tutor: TutorWithStats) => {
    setSelectedTutor({ ...tutor });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutor) return;

    try {
      setSaving(true);
      const updateData = {
        first_name: selectedTutor.first_name,
        last_name: selectedTutor.last_name,
        phone: selectedTutor.phone || '',
        specialization: selectedTutor.specialization,
        department: selectedTutor.department,
        title: selectedTutor.title,
        license_number: selectedTutor.license_number,
        years_experience: selectedTutor.years_experience,
        max_students: selectedTutor.max_students,
        is_available: selectedTutor.is_available,
        bio: selectedTutor.bio,
      };

      const response = await tutorService.updateTutor(selectedTutor.id, updateData);
      if (response.success) {
        await fetchTutors();
        setEditDialogOpen(false);
        toast.success("Tutor updated successfully");
      } else {
        toast.error(response.message || "Failed to update tutor");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update tutor");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newTutor.email || !newTutor.password || !newTutor.first_name || !newTutor.last_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      const response = await tutorService.addTutor({
        email: newTutor.email,
        password: newTutor.password,
        first_name: newTutor.first_name,
        last_name: newTutor.last_name,
        phone: newTutor.phone || undefined,
        specialization: newTutor.specialization || undefined,
        department: newTutor.department || undefined,
        title: newTutor.title || undefined,
        license_number: newTutor.license_number || undefined,
        years_experience: newTutor.years_experience || undefined,
        max_students: newTutor.max_students,
        is_available: newTutor.is_available,
      });

      if (response.success) {
        await fetchTutors();
        setAddDialogOpen(false);
        setNewTutor({
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          phone: "",
          specialization: "",
          department: "",
          title: "",
          license_number: "",
          years_experience: 0,
          max_students: 5,
          is_available: true,
        });
        toast.success("Tutor added successfully");
      } else {
        toast.error(response.message || "Failed to add tutor");
      }
    } catch (error: any) {
      console.error("Error adding tutor:", error);
      toast.error(error.response?.data?.message || "Failed to add tutor");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTutor = async (id: string) => {
    if (!confirm("Are you sure you want to remove this tutor? This action cannot be undone.")) return;

    try {
      const response = await tutorService.removeTutor(id);
      if (response.success) {
        await fetchTutors();
        toast.success("Tutor removed successfully");
      } else {
        toast.error(response.message || "Failed to remove tutor");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove tutor");
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setNewTutor(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <AppLayout role="hospital" userName={user?.first_name || 'Hospital'}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Loading tutors...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="hospital" userName={user?.first_name || 'Hospital'}>
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
                  <p className="text-sm text-muted-foreground">Available Tutors</p>
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
              placeholder="Search by name, specialty or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept, index) => (
                <SelectItem key={dept || `dept-${index}`} value={dept || ''}>
                  {dept || 'Unspecified'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tutors</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="not_available">Not Available</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tutors Grid */}
        {filteredTutors.length === 0 && !loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No tutors found</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchQuery("");
                setDepartmentFilter("all");
                setAvailabilityFilter("all");
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTutors.map((tutor) => (
              <Card key={tutor.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={tutor.avatar} />
                        <AvatarFallback className="text-sm">
                          {tutor.first_name?.[0]}{tutor.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {tutor.title ? `${tutor.title} ` : ''}{tutor.first_name} {tutor.last_name}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                          <Stethoscope className="w-3 h-3" />
                          {tutor.specialization || "Specialist"}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(tutor.is_available, tutor.max_students, tutor.current_students)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium">{tutor.department || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Students</span>
                      <span className="font-medium">{tutor.current_students || 0}/{tutor.max_students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experience</span>
                      <span className="font-medium">{tutor.years_experience || 0} years</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        {tutor.rating?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        tutor.current_students && tutor.current_students >= tutor.max_students 
                          ? "bg-amber-500" 
                          : "bg-primary"
                      }`}
                      style={{ 
                        width: `${tutor.current_students ? (tutor.current_students / tutor.max_students) * 100 : 0}%` 
                      }}
                    />
                  </div>

                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <a href={`mailto:${tutor.email}`} className="flex items-center gap-1 hover:text-foreground">
                      <Mail className="w-3 h-3" />
                      Email
                    </a>
                    {tutor.phone && (
                      <a href={`tel:${tutor.phone}`} className="flex items-center gap-1 hover:text-foreground">
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleView(tutor)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(tutor)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:border-red-300"
                      onClick={() => handleRemoveTutor(tutor.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                    <AvatarFallback className="text-lg">
                      {selectedTutor.first_name?.[0]}{selectedTutor.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedTutor.title ? `${selectedTutor.title} ` : ''}{selectedTutor.first_name} {selectedTutor.last_name}
                    </h3>
                    <p className="text-muted-foreground">
                      <Stethoscope className="w-4 h-4 inline mr-1" />
                      {selectedTutor.specialization || "Specialist"}
                    </p>
                    <div className="mt-2">
                      {getStatusBadge(selectedTutor.is_available, selectedTutor.max_students, selectedTutor.current_students)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedTutor.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{selectedTutor.phone || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium">{selectedTutor.department || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Title:</span>
                    <p className="font-medium">{selectedTutor.title || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">License Number:</span>
                    <p className="font-medium">{selectedTutor.license_number || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Experience:</span>
                    <p className="font-medium">{selectedTutor.years_experience || 0} years</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Students:</span>
                    <p className="font-medium">{selectedTutor.current_students || 0} / {selectedTutor.max_students}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Supervised:</span>
                    <p className="font-medium">{selectedTutor.total_supervised || 0}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hospital:</span>
                    <p className="font-medium flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {selectedTutor.hospital_name || "N/A"}
                    </p>
                  </div>
                </div>

                {selectedTutor.bio && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Bio</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedTutor.bio}</p>
                  </div>
                )}

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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-first_name">First Name *</Label>
                    <Input
                      id="edit-first_name"
                      value={selectedTutor.first_name}
                      onChange={(e) => setSelectedTutor({ ...selectedTutor, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-last_name">Last Name *</Label>
                    <Input
                      id="edit-last_name"
                      value={selectedTutor.last_name}
                      onChange={(e) => setSelectedTutor({ ...selectedTutor, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedTutor.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={selectedTutor.phone || ''}
                    onChange={(e) => setSelectedTutor({ ...selectedTutor, phone: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-specialization">Specialization</Label>
                    <Input
                      id="edit-specialization"
                      value={selectedTutor.specialization || ''}
                      onChange={(e) => setSelectedTutor({ ...selectedTutor, specialization: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-department">Department</Label>
                    <Input
                      id="edit-department"
                      value={selectedTutor.department || ''}
                      onChange={(e) => setSelectedTutor({ ...selectedTutor, department: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={selectedTutor.title || ''}
                      onChange={(e) => setSelectedTutor({ ...selectedTutor, title: e.target.value })}
                      placeholder="e.g., Dr., Chief, Senior Consultant"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-years_experience">Years of Experience</Label>
                    <Input
                      id="edit-years_experience"
                      type="number"
                      value={selectedTutor.years_experience || ''}
                      onChange={(e) => setSelectedTutor({ 
                        ...selectedTutor, 
                        years_experience: e.target.value ? parseInt(e.target.value) : 0 
                      })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-license_number">License Number</Label>
                    <Input
                      id="edit-license_number"
                      value={selectedTutor.license_number || ''}
                      onChange={(e) => setSelectedTutor({ ...selectedTutor, license_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-max_students">Max Students</Label>
                    <Input
                      id="edit-max_students"
                      type="number"
                      value={selectedTutor.max_students}
                      onChange={(e) => setSelectedTutor({ 
                        ...selectedTutor, 
                        max_students: parseInt(e.target.value) 
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-is_available">Availability</Label>
                  <Select
                    value={selectedTutor.is_available.toString()}
                    onValueChange={(value) => setSelectedTutor({ ...selectedTutor, is_available: value === 'true' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Available</SelectItem>
                      <SelectItem value="false">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-bio">Bio</Label>
                  <textarea
                    id="edit-bio"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedTutor.bio || ''}
                    onChange={(e) => setSelectedTutor({ ...selectedTutor, bio: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-first_name">First Name *</Label>
                  <Input
                    id="add-first_name"
                    placeholder="John"
                    value={newTutor.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-last_name">Last Name *</Label>
                  <Input
                    id="add-last_name"
                    placeholder="Doe"
                    value={newTutor.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-email">Email *</Label>
                  <Input
                    id="add-email"
                    type="email"
                    placeholder="email@hospital.ma"
                    value={newTutor.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-password">Password *</Label>
                  <Input
                    id="add-password"
                    type="password"
                    placeholder="Create a password"
                    value={newTutor.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-phone">Phone</Label>
                  <Input
                    id="add-phone"
                    placeholder="+212 6XX XXX XXX"
                    value={newTutor.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-specialization">Specialization</Label>
                  <Input
                    id="add-specialization"
                    placeholder="e.g., Cardiology"
                    value={newTutor.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-department">Department</Label>
                  <Input
                    id="add-department"
                    placeholder="e.g., Emergency"
                    value={newTutor.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-title">Title</Label>
                  <Input
                    id="add-title"
                    placeholder="e.g., Dr., Chief"
                    value={newTutor.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-license_number">License Number</Label>
                  <Input
                    id="add-license_number"
                    placeholder="e.g., ML-2020-12345"
                    value={newTutor.license_number}
                    onChange={(e) => handleInputChange('license_number', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-years_experience">Years Experience</Label>
                  <Input
                    id="add-years_experience"
                    type="number"
                    placeholder="e.g., 10"
                    value={newTutor.years_experience}
                    onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-max_students">Max Students</Label>
                  <Input
                    id="add-max_students"
                    type="number"
                    value={newTutor.max_students}
                    onChange={(e) => handleInputChange('max_students', parseInt(e.target.value) || 5)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-is_available">Availability</Label>
                  <Select
                    value={newTutor.is_available.toString()}
                    onValueChange={(value) => handleInputChange('is_available', value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Available</SelectItem>
                      <SelectItem value="false">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Add Tutor
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
