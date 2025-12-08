import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { serviceService, Service } from "@/services/service.service";
import { tutorService, Tutor } from "@/services/tutor.service";

export default function AddService() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [fetchingData, setFetchingData] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    description: "",
    head_doctor_id: "",
    capacity: "",
    floor: "",
    phone: "",
    email: "",
    is_active: true,
    accepts_interns: true,
  });

  // Fetch departments and tutors on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setFetchingData(true);

        // Fetch departments from tutors service
        const departmentsResponse = await tutorService.getDepartments();
        if (departmentsResponse.success && departmentsResponse.data) {
          setDepartments(departmentsResponse.data);
        } else {
          // Fallback to default departments if API fails
          setDepartments([
          ]);
        }

        // Fetch tutors for the hospital
        const tutorsResponse = await tutorService.getHospitalTutors();
        if (tutorsResponse.success && tutorsResponse.data) {
          setTutors(tutorsResponse.data);
        }

      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({
          title: "Error",
          description: "Failed to load departments and tutors",
          variant: "destructive"
        });

        // Set fallback data
        setDepartments([
        ]);
      } finally {
        setFetchingData(false);
      }
    };

    fetchInitialData();
  }, [toast]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddNewDepartment = () => {
    const newDepartment = prompt("Enter new department name:");
    if (newDepartment && newDepartment.trim()) {
      setDepartments(prev => [...prev, newDepartment.trim()]);
      setFormData(prev => ({ ...prev, department: newDepartment.trim() }));
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Service name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.capacity || parseInt(formData.capacity) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid capacity (greater than 0)",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Prepare data for API - ensure hospital_id is included
      const serviceData: Partial<Service> = {
        name: formData.name,
        department: formData.department || undefined,
        description: formData.description || undefined,
        capacity: parseInt(formData.capacity),
        floor: formData.floor || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        is_active: formData.is_active,
        accepts_interns: formData.accepts_interns
      };

      // Add head tutor/doctor if selected
      if (formData.head_doctor_id) {
        serviceData.head_doctor_id = formData.head_doctor_id;
      }

      // Add hospital ID from current user - THIS IS CRITICAL
      const hospitalId = currentUser?.id; // Use the user ID which is the hospital ID
      console.log("Creating service with hospital ID:", hospitalId); // Debug log

      if (!hospitalId) {
        throw new Error("Hospital ID not found. Please log in again.");
      }

      // Add hospital_id to the service data
      const dataToSend = {
        ...serviceData,
        hospital_id: hospitalId
      };

      console.log("Sending service data:", dataToSend); // Debug log

      // Call API to create service
      const response = await serviceService.createService(dataToSend);

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || `${formData.name} has been created successfully.`,
        });
        navigate("/hospital/services");
      } else {
        throw new Error(response.message || "Failed to create service");
      }
    } catch (error: any) {
      console.error("Error creating service:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to create service",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <AppLayout role="hospital" userName={currentUser?.name || "Hospital"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Loading...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="hospital" userName={currentUser?.name || "Hospital"}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
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
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => {
                    if (value === "new") {
                      handleAddNewDepartment();
                    } else {
                      handleInputChange("department", value);
                    }
                  }}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                    <SelectItem value="new">+ Add New Department</SelectItem>
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
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="min-h-[100px]"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Head Doctor/Tutor</Label>
                <Select
                  value={formData.head_doctor_id}
                  onValueChange={(value) => handleInputChange("head_doctor_id", value)}
                  disabled={loading || tutors.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tutors.length === 0 ? "No tutors available" : "Select head doctor/tutor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {tutors.map(tutor => (
                      <SelectItem key={tutor.id} value={tutor.id}>
                        {tutor.title ? `${tutor.title} ` : ''}{tutor.first_name} {tutor.last_name}
                        {tutor.specialization && ` - ${tutor.specialization}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {tutors.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No tutors found in this hospital. You can add tutors first or assign one later.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Intern Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  placeholder="Maximum number of interns"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange("capacity", e.target.value)}
                  disabled={loading}
                  required
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
                <Label htmlFor="floor">Floor / Wing</Label>
                <Input
                  id="floor"
                  placeholder="e.g., 3rd Floor, Building A"
                  value={formData.floor}
                  onChange={(e) => handleInputChange("floor", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="e.g., +212 123 456 789"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Service Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., cardiology@hospital.ma"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={loading}
              />
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
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Accept Interns</Label>
                <p className="text-sm text-muted-foreground">Allow students to apply for internships</p>
              </div>
              <Switch
                checked={formData.accepts_interns}
                onCheckedChange={(checked) => handleInputChange("accepts_interns", checked)}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Service
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}