import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users, Clock, Stethoscope, Edit, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { hospitalService, Service } from "@/services/hospital.service";

export default function HospitalServices() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    description: "",
    capacity: 0,
    floor: "",
    phone: "",
    email: "",
    head_doctor_name: "",
    is_active: true,
    accepts_interns: true
  });
  
  const navigate = useNavigate();

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await hospitalService.getServices();
      
      if (response.success && response.data) {
        setServices(response.data);
      } else {
        throw new Error(response.message || "Failed to load services");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load services");
      toast({
        title: "Error",
        description: err.message || "Failed to load services",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await hospitalService.getDepartments();
      console.log("Departments:", response.data);
      // Could store departments in state for dropdown if needed
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchDepartments();
  }, []);

  // Calculate stats
  const stats = {
    total: services.length,
    active: services.filter(s => s.is_active).length,
    currentInterns: services.reduce((acc, s) => acc + (s.current_interns || 0), 0),
    totalCapacity: services.reduce((acc, s) => acc + s.capacity, 0)
  };

  // Filter services
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Status badge
  const getStatusBadge = (service: Service) => {
    if (!service.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    const currentInterns = service.current_interns || 0;
    if (currentInterns >= service.capacity) {
      return <Badge className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/30">Full</Badge>;
    }
    
    return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Active</Badge>;
  };

  // Handle edit
  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      department: service.department,
      description: service.description || "",
      capacity: service.capacity,
      floor: service.floor || "",
      phone: service.phone || "",
      email: service.email || "",
      head_doctor_name: service.head_doctor_name || "",
      is_active: service.is_active,
      accepts_interns: service.accepts_interns
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    try {
      setActionLoading(true);
      
      const updateData = {
        name: formData.name,
        department: formData.department,
        description: formData.description,
        capacity: formData.capacity,
        floor: formData.floor || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        head_doctor_name: formData.head_doctor_name || undefined,
        is_active: formData.is_active,
        accepts_interns: formData.accepts_interns
      };

      const response = await hospitalService.updateService(selectedService.id, updateData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Service updated successfully"
        });
        setEditDialogOpen(false);
        fetchServices();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update service",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = (service: Service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedService) return;

    try {
      setActionLoading(true);
      const response = await hospitalService.deleteService(selectedService.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Service deleted successfully"
        });
        setDeleteDialogOpen(false);
        fetchServices();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete service",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Navigation
  const handleAddService = () => {
    navigate("/hospital/services/add");
  };

  // Loading and error states
  if (loading) {
    return (
      <AppLayout role="hospital" userName={currentUser?.name || "Hospital"}>
        <LoadingState message="Loading services..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout role="hospital" userName={currentUser?.name || "Hospital"}>
        <ErrorState message={error} onRetry={fetchServices} />
      </AppLayout>
    );
  }

  return (
    <AppLayout role="hospital" userName={currentUser?.name || "Hospital"}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Services Management</h1>
            <p className="text-muted-foreground mt-1">Manage hospital departments and services</p>
          </div>
          <Button onClick={handleAddService}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Services</p>
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
                  <p className="text-sm text-muted-foreground">Active Services</p>
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
                  <p className="text-2xl font-bold">{stats.currentInterns}</p>
                  <p className="text-sm text-muted-foreground">Current Interns</p>
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
                  <p className="text-2xl font-bold">{stats.totalCapacity}</p>
                  <p className="text-sm text-muted-foreground">Total Capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <EmptyState 
            title="No services found" 
            description={searchQuery ? "Try a different search term" : "Add your first service to get started"}
            icon={<Stethoscope className="w-12 h-12 text-muted-foreground" />}
          >
            {!searchQuery && (
              <Button onClick={handleAddService} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            )}
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>{service.department}</CardDescription>
                      {service.floor && (
                        <p className="text-xs text-muted-foreground mt-1">Floor: {service.floor}</p>
                      )}
                    </div>
                    {getStatusBadge(service)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    {service.head_doctor_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Head</span>
                        <span className="font-medium">{service.head_doctor_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium">
                        {service.current_interns || 0}/{service.capacity} interns
                      </span>
                    </div>
                    {!service.accepts_interns && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Accepts Interns</span>
                        <Badge variant="outline" className="text-amber-600">No</Badge>
                      </div>
                    )}
                  </div>

                  {/* Capacity Bar */}
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        (service.current_interns || 0) >= service.capacity 
                          ? "bg-amber-500" 
                          : "bg-primary"
                      }`}
                      style={{ 
                        width: `${Math.min(((service.current_interns || 0) / service.capacity) * 100, 100)}%` 
                      }}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:text-destructive" 
                      onClick={() => handleDelete(service)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>Update service information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="0"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="head_doctor_name">Head Doctor Name</Label>
                <Input
                  id="head_doctor_name"
                  value={formData.head_doctor_name}
                  onChange={(e) => setFormData({...formData, head_doctor_name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="is_active">Status</Label>
                  <Select
                    value={formData.is_active ? "active" : "inactive"}
                    onValueChange={(value) => setFormData({...formData, is_active: value === "active"})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accepts_interns">Accepts Interns</Label>
                  <Select
                    value={formData.accepts_interns ? "yes" : "no"}
                    onValueChange={(value) => setFormData({...formData, accepts_interns: value === "yes"})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={actionLoading}
                >
                  {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Service</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove "{selectedService?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete} 
                className="bg-destructive text-destructive-foreground"
                disabled={actionLoading}
              >
                {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}