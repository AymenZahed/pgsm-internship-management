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
import { ArrowLeft, CalendarIcon, Plus, X, Save, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { offerService } from "@/services/offer.service";
import { serviceService } from "@/services/service.service";
import { tutorService } from "@/services/tutor.service";

export default function CreateOffer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    description: "",
    positions: "",
    duration: "",
    supervisorId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch services for departments
        const servicesResponse = await serviceService.getServices();
        if (servicesResponse.success && servicesResponse.data) {
          const uniqueDepts = [...new Set(servicesResponse.data.map((s: any) => s.department || s.name))];
          setDepartments(uniqueDepts.filter(Boolean) as string[]);
        }
        
        // Fetch tutors as supervisors
        const tutorsResponse = await tutorService.getTutors();
        if (tutorsResponse.success && tutorsResponse.data) {
          setSupervisors(tutorsResponse.data);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const addRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (req: string) => {
    setRequirements(requirements.filter(r => r !== req));
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!formData.title || !formData.department || !startDate || !endDate || !formData.positions) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await offerService.createOffer({
        title: formData.title,
        department: formData.department,
        description: formData.description,
        positions: parseInt(formData.positions),
        duration_weeks: formData.duration === "1 month" ? 4 : formData.duration === "2 months" ? 8 : formData.duration === "3 months" ? 12 : 24,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        status: isDraft ? "draft" : "published",
        requirements: requirements.join(', '),
        tutor_id: formData.supervisorId || undefined,
      });

      if (response.success) {
        toast({
          title: isDraft ? "Draft Saved" : "Offer Published",
          description: isDraft 
            ? "Your internship offer has been saved as a draft." 
            : "Your internship offer is now live and accepting applications.",
        });
        navigate("/hospital/offers");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create offer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout role="hospital">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
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
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="space-y-2">
                    <Label>Supervisor</Label>
                    <Select 
                      value={formData.supervisorId} 
                      onValueChange={(v) => setFormData({ ...formData, supervisorId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Assign supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        {supervisors.map(sup => (
                          <SelectItem key={sup.id} value={sup.id}>
                            {sup.first_name} {sup.last_name} - {sup.specialty || sup.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the internship program, objectives, and what interns will learn..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Duration & Positions</CardTitle>
                <CardDescription>When and how many positions are available</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
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
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select 
                      value={formData.duration} 
                      onValueChange={(v) => setFormData({ ...formData, duration: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 month">1 Month</SelectItem>
                        <SelectItem value="2 months">2 Months</SelectItem>
                        <SelectItem value="3 months">3 Months</SelectItem>
                        <SelectItem value="6 months">6 Months</SelectItem>
                      </SelectContent>
                    </Select>
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
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
                <CardDescription>Eligibility criteria for applicants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a requirement..."
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                  />
                  <Button type="button" onClick={addRequirement}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {requirements.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {requirements.map((req) => (
                      <Badge key={req} variant="secondary" className="pr-1">
                        {req}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 ml-1 hover:bg-transparent"
                          onClick={() => removeRequirement(req)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}

                {requirements.length === 0 && (
                  <p className="text-sm text-muted-foreground">No requirements added yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Publishing..." : "Publish Offer"}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
                  Save as Draft
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Write a clear, descriptive title</p>
                <p>• Include specific learning objectives</p>
                <p>• List all requirements upfront</p>
                <p>• Assign a supervisor for better applications</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
