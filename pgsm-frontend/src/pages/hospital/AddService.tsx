import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AddService() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    description: "",
    headDoctor: "",
    capacity: "",
    location: "",
    floor: "",
    phone: "",
    email: "",
    isActive: true,
    acceptsInterns: true,
  });

  const departments = [
    "Cardiology",
    "Emergency Medicine",
    "Pediatrics",
    "General Surgery",
    "Neurology",
    "Internal Medicine",
    "Radiology",
    "Oncology",
    "Orthopedics",
    "Dermatology",
  ];

  const doctors = [
    { id: "1", name: "Dr. Ahmed Benali" },
    { id: "2", name: "Dr. Fatima Zahra" },
    { id: "3", name: "Dr. Khalid Mansouri" },
    { id: "4", name: "Dr. Hassan Alami" },
    { id: "5", name: "Dr. Nadia Chraibi" },
  ];

  const handleSubmit = () => {
    toast({
      title: "Service Created",
      description: `${formData.name} has been added successfully.`,
    });
    navigate("/hospital/services");
  };

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add New Service</h1>
            <p className="text-muted-foreground mt-1">Create a new department or service unit</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
            <CardDescription>Basic details about the service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Cardiology Unit"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Department *</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(v) => setFormData({ ...formData, department: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the services provided by this unit..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Head Doctor</Label>
                <Select 
                  value={formData.headDoctor} 
                  onValueChange={(v) => setFormData({ ...formData, headDoctor: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign head doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(doc => (
                      <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Intern Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="0"
                  placeholder="Maximum number of interns"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location & Contact</CardTitle>
            <CardDescription>Where to find this service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Building / Wing</Label>
                <Input
                  id="location"
                  placeholder="e.g., Building A"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  placeholder="e.g., 3rd Floor"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Extension</Label>
                <Input
                  id="phone"
                  placeholder="e.g., 1234"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Service Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., cardiology@hospital.ma"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Service availability options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-sm text-muted-foreground">Service is operational and visible</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Accept Interns</Label>
                <p className="text-sm text-muted-foreground">Allow students to apply for internships</p>
              </div>
              <Switch
                checked={formData.acceptsInterns}
                onCheckedChange={(checked) => setFormData({ ...formData, acceptsInterns: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            Create Service
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
