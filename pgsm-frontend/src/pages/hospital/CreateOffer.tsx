import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, CalendarIcon, Plus, X, Save, Eye, Loader2, Users, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { offerService } from "@/services/offer.service";
import { serviceService } from "@/services/service.service";

interface Service {
  id: string;
  name: string;
  department?: string;
}

export default function CreateOffer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  // Form state - ADD department field back
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    duration_weeks: "4",
    positions: "1",
    type: "required" as "required" | "optional" | "summer",
    status: "draft" as "draft" | "published" | "closed" | "cancelled",
    service_id: "",
    department: "", // ADD THIS BACK - will be auto-filled from service
    has_application_deadline: false,
  });
  
  // Date states
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [applicationDeadline, setApplicationDeadline] = useState<Date>();
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Data from API
  const [services, setServices] = useState<Service[]>([]);
  
  // Requirements management
  const [requirementsList, setRequirementsList] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        
        // Fetch services for current hospital
        const servicesResponse = await serviceService.getServices();
        if (servicesResponse.success && servicesResponse.data) {
          setServices(servicesResponse.data);
        }
        
      } catch (err: any) {
        toast({
          title: "Error",
          description: "Failed to load services. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Handle service selection - AUTO-FILL department
  const handleServiceChange = (serviceId: string) => {
    const selectedService = services.find(s => s.id === serviceId);
    
    setFormData(prev => ({
      ...prev,
      service_id: serviceId,
      department: selectedService?.department || "", // AUTO-FILL department from service
    }));
    
    // Show toast if department was auto-filled
    if (selectedService?.department) {
      toast({
        title: "Department auto-filled",
        description: `Department set to: ${selectedService.department}`,
      });
    }
  };

  // Handle requirements
  const addRequirement = () => {
    if (newRequirement.trim() && !requirementsList.includes(newRequirement.trim())) {
      setRequirementsList([...requirementsList, newRequirement.trim()]);
      setNewRequirement("");
      
      // Update form data with comma-separated requirements
      const updatedRequirements = [...requirementsList, newRequirement.trim()].join(', ');
      setFormData({ ...formData, requirements: updatedRequirements });
    }
  };

  const removeRequirement = (req: string) => {
    const updatedList = requirementsList.filter(r => r !== req);
    setRequirementsList(updatedList);
    
    // Update form data
    const updatedRequirements = updatedList.join(', ');
    setFormData({ ...formData, requirements: updatedRequirements });
  };

  // Handle requirement input key press
  const handleRequirementKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRequirement();
    }
  };

  // Calculate end date based on start date and duration
  useEffect(() => {
    if (startDate && formData.duration_weeks) {
      const durationWeeks = parseInt(formData.duration_weeks);
      const newEndDate = new Date(startDate);
      newEndDate.setDate(newEndDate.getDate() + (durationWeeks * 7));
      setEndDate(newEndDate);
    }
  }, [startDate, formData.duration_weeks]);

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Offer title is required",
        variant: "destructive",
      });
      return false;
    }
    
    if (!startDate || !endDate) {
      toast({
        title: "Validation Error",
        description: "Start date and end date are required",
        variant: "destructive",
      });
      return false;
    }
    
    if (startDate >= endDate) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return false;
    }
    
    if (formData.has_application_deadline && applicationDeadline && applicationDeadline >= startDate) {
      toast({
        title: "Validation Error",
        description: "Application deadline must be before the start date",
        variant: "destructive",
      });
      return false;
    }
    
    const positions = parseInt(formData.positions);
    if (isNaN(positions) || positions < 1) {
      toast({
        title: "Validation Error",
        description: "Number of positions must be at least 1",
        variant: "destructive",
      });
      return false;
    }
    
    const durationWeeks = parseInt(formData.duration_weeks);
    if (isNaN(durationWeeks) || durationWeeks < 1) {
      toast({
        title: "Validation Error",
        description: "Duration must be at least 1 week",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  // Handle form submission - Include department field
  const handleSubmit = async (isDraft: boolean) => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare offer data - Include department from service
      const offerData = {
        title: formData.title,
        description: formData.description || undefined,
        requirements: formData.requirements || undefined,
        responsibilities: formData.responsibilities || undefined,
        benefits: formData.benefits || undefined,
        type: formData.type,
        duration_weeks: parseInt(formData.duration_weeks),
        positions: parseInt(formData.positions),
        start_date: format(startDate!, 'yyyy-MM-dd'),
        end_date: format(endDate!, 'yyyy-MM-dd'),
        application_deadline: formData.has_application_deadline && applicationDeadline 
          ? format(applicationDeadline, 'yyyy-MM-dd')
          : undefined,
        status: isDraft ? 'draft' : 'published',
        service_id: formData.service_id || undefined,
        department: formData.department || undefined, // Include department
      };
      
      console.log("Sending offer data:", offerData);
      
      const response = await offerService.createOffer(offerData);
      
      if (response.success) {
        toast({
          title: isDraft ? "Draft Saved" : "Offer Published",
          description: isDraft 
            ? "Your internship offer has been saved as a draft." 
            : "Your internship offer is now live and accepting applications.",
        });
        
        navigate("/hospital/offers");
      } else {
        throw new Error(response.message || "Failed to create offer");
      }
    } catch (err: any) {
      console.error("Error creating offer:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to create offer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <AppLayout role="hospital" userName={currentUser?.name || "Hospital"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Loading form data...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="hospital" userName={currentUser?.name || "Hospital"}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} disabled={isSubmitting}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create Internship Offer</h1>
            <p className="text-muted-foreground mt-1">Publish a new internship opportunity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>General details about the internship</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Offer Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Cardiology Clinical Internship"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Internship Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(v: "required" | "optional" | "summer") => setFormData({ ...formData, type: v })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="required">Required</SelectItem>
                      <SelectItem value="optional">Optional</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the internship program, objectives, and what interns will learn..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[120px]"
                    disabled={isSubmitting}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Duration & Dates */}
            <Card>
              <CardHeader>
                <CardTitle>Duration & Dates</CardTitle>
                <CardDescription>When the internship will take place</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          disabled={{ before: new Date() }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (weeks) *</Label>
                    <Select 
                      value={formData.duration_weeks} 
                      onValueChange={(v) => setFormData({ ...formData, duration_weeks: v })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 weeks</SelectItem>
                        <SelectItem value="4">4 weeks (1 month)</SelectItem>
                        <SelectItem value="8">8 weeks (2 months)</SelectItem>
                        <SelectItem value="12">12 weeks (3 months)</SelectItem>
                        <SelectItem value="24">24 weeks (6 months)</SelectItem>
                        <SelectItem value="48">48 weeks (1 year)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      value={endDate ? format(endDate, "PPP") : "Calculated based on start date and duration"}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="positions">Number of Positions *</Label>
                    <Input
                      id="positions"
                      type="number"
                      min="1"
                      placeholder="e.g., 4"
                      value={formData.positions}
                      onChange={(e) => setFormData({ ...formData, positions: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-deadline"
                    checked={formData.has_application_deadline}
                    onValueChange={(checked) => setFormData({ ...formData, has_application_deadline: checked })}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="has-deadline">Set application deadline</Label>
                </div>

                {formData.has_application_deadline && (
                  <div className="space-y-2">
                    <Label>Application Deadline</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !applicationDeadline && "text-muted-foreground")}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {applicationDeadline ? format(applicationDeadline, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={applicationDeadline}
                          onSelect={setApplicationDeadline}
                          initialFocus
                          disabled={startDate ? { after: startDate } : { after: new Date() }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
                <CardDescription>Eligibility criteria for applicants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a requirement (press Enter to add)..."
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyDown={handleRequirementKeyPress}
                    disabled={isSubmitting}
                  />
                  <Button type="button" onClick={addRequirement} disabled={isSubmitting}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {requirementsList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {requirementsList.map((req) => (
                      <Badge key={req} variant="secondary" className="pr-1">
                        {req}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 ml-1 hover:bg-transparent"
                          onClick={() => removeRequirement(req)}
                          disabled={isSubmitting}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No requirements added yet</p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements Text</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Additional requirements text (optional)"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    rows={2}
                    disabled={isSubmitting}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Responsibilities & Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities & Benefits</CardTitle>
                <CardDescription>What interns will do and what they'll gain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    placeholder="Describe the daily tasks and responsibilities..."
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea
                    id="benefits"
                    placeholder="What interns will gain from this internship..."
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Assignment - Service selection auto-fills department */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
                <CardDescription>Assign service for this internship</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Service *</Label>
                  <Select 
                    value={formData.service_id} 
                    onValueChange={handleServiceChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} {service.department && `(${service.department})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Selecting a service automatically sets the department
                  </p>
                </div>

                {/* Show auto-filled department */}
                {formData.department && (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department (auto-filled)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="department"
                        value={formData.department}
                        readOnly
                        className="bg-muted"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newDept = prompt("Edit department:", formData.department);
                          if (newDept !== null) {
                            setFormData({ ...formData, department: newDept });
                          }
                        }}
                        disabled={isSubmitting}
                      >
                        Edit
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Department from selected service. You can edit if needed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => handleSubmit(false)} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Publish Offer
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleSubmit(true)} 
                  disabled={isSubmitting}
                >
                  Save as Draft
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => navigate("/hospital/offers")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold">{formData.title || "Untitled Offer"}</h4>
                  
                  {formData.department && (
                    <p className="text-sm text-muted-foreground">{formData.department}</p>
                  )}
                  
                  {formData.service_id && !formData.department && services.find(s => s.id === formData.service_id)?.department && (
                    <p className="text-sm text-muted-foreground">
                      {services.find(s => s.id === formData.service_id)?.department}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{formData.positions} position{formData.positions !== "1" ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formData.duration_weeks} weeks</span>
                    </div>
                  </div>
                  
                  {startDate && endDate && (
                    <p className="text-xs text-muted-foreground">
                      {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                    </p>
                  )}
                  
                  {formData.has_application_deadline && applicationDeadline && (
                    <p className="text-xs text-amber-600">
                      Apply by: {format(applicationDeadline, 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Write a clear, descriptive title</p>
                <p>• Include specific learning objectives</p>
                <p>• List all requirements upfront</p>
                <p>• Set realistic duration and dates</p>
                <p>• Select a service - department will be auto-filled</p>
                <p>• Highlight benefits to attract applicants</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}