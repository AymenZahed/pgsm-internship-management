import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users, Clock, Stethoscope, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  department: string;
  head: string;
  capacity: number;
  currentInterns: number;
  status: "active" | "full" | "inactive";
  description: string;
}

const initialServices: Service[] = [
  {
    id: "1",
    name: "Cardiology Unit",
    department: "Cardiology",
    head: "Dr. Ahmed Benali",
    capacity: 8,
    currentInterns: 5,
    status: "active",
    description: "Comprehensive cardiac care including interventional cardiology"
  },
  {
    id: "2",
    name: "Emergency Department",
    department: "Emergency Medicine",
    head: "Dr. Fatima Zahra",
    capacity: 12,
    currentInterns: 12,
    status: "full",
    description: "24/7 emergency medical services and trauma care"
  },
  {
    id: "3",
    name: "Pediatric Ward",
    department: "Pediatrics",
    head: "Dr. Khalid Mansouri",
    capacity: 6,
    currentInterns: 3,
    status: "active",
    description: "Child healthcare from newborn to adolescence"
  },
  {
    id: "4",
    name: "Surgical Unit",
    department: "General Surgery",
    head: "Dr. Hassan Alami",
    capacity: 10,
    currentInterns: 7,
    status: "active",
    description: "General and specialized surgical procedures"
  },
  {
    id: "5",
    name: "Neurology Department",
    department: "Neurology",
    head: "Dr. Nadia Chraibi",
    capacity: 5,
    currentInterns: 0,
    status: "inactive",
    description: "Diagnosis and treatment of neurological disorders"
  },
];

export default function HospitalServices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>(initialServices);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const navigate = useNavigate();

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: Service["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Active</Badge>;
      case "full":
        return <Badge className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/30">Full</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  const handleEdit = (service: Service) => {
    setSelectedService({ ...service });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    setServices(services.map(s => s.id === selectedService.id ? selectedService : s));
    setEditDialogOpen(false);
    toast.success("Service updated successfully");
  };

  const handleDelete = (service: Service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedService) return;
    setServices(services.filter(s => s.id !== selectedService.id));
    setDeleteDialogOpen(false);
    toast.success("Service removed successfully");
  };

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Services Management</h1>
            <p className="text-muted-foreground mt-1">Manage hospital departments and services</p>
          </div>
          <Button onClick={() => navigate("/hospital/services/add")}>
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
                  <p className="text-2xl font-bold">{services.length}</p>
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
                  <p className="text-2xl font-bold">{services.filter(s => s.status === "active").length}</p>
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
                  <p className="text-2xl font-bold">{services.reduce((acc, s) => acc + s.currentInterns, 0)}</p>
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
                  <p className="text-2xl font-bold">{services.reduce((acc, s) => acc + s.capacity, 0)}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>{service.department}</CardDescription>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{service.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Head</span>
                    <span className="font-medium">{service.head}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">{service.currentInterns}/{service.capacity} interns</span>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      service.currentInterns >= service.capacity 
                        ? "bg-amber-500" 
                        : "bg-primary"
                    }`}
                    style={{ width: `${(service.currentInterns / service.capacity) * 100}%` }}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(service)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(service)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
            </DialogHeader>
            {selectedService && (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    value={selectedService.name}
                    onChange={(e) => setSelectedService({ ...selectedService, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={selectedService.department}
                    onChange={(e) => setSelectedService({ ...selectedService, department: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="head">Head</Label>
                  <Input
                    id="head"
                    value={selectedService.head}
                    onChange={(e) => setSelectedService({ ...selectedService, head: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={selectedService.capacity}
                      onChange={(e) => setSelectedService({ ...selectedService, capacity: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={selectedService.status}
                      onValueChange={(value: "active" | "full" | "inactive") => setSelectedService({ ...selectedService, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={selectedService.description}
                    onChange={(e) => setSelectedService({ ...selectedService, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Service</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to remove "{selectedService?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete}>Remove</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}