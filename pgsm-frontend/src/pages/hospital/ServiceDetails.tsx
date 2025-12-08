import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Edit, Users, MapPin, Phone, Mail, Clock, User, Loader2, Stethoscope } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { serviceService, Service } from "@/services/service.service";
import { tutorService, Tutor } from "@/services/tutor.service";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";

interface Intern {
  id: string;
  name: string;
  university: string;
  progress: number;
  startDate: string;
}

export default function ServiceDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [currentInterns, setCurrentInterns] = useState<Intern[]>([]);

  // Fetch service details
  const fetchServiceDetails = async () => {
    if (!id) {
      setError("Service ID is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch service details
      const serviceResponse = await serviceService.getServiceById(id);
      
      if (serviceResponse.success && serviceResponse.data) {
        setService(serviceResponse.data);

        try {
          // Fetch tutors for this hospital
          const tutorsResponse = await tutorService.getHospitalTutors();
          
          if (tutorsResponse.success && tutorsResponse.data) {
            setTutors(tutorsResponse.data);
          }
        } catch (tutorError) {
          console.warn("Could not fetch tutors:", tutorError);
          // Continue without tutors if there's an error
        }

        // TODO: Replace with actual API call for interns
        // For now, using empty array as placeholder
        setCurrentInterns([]);
      } else {
        throw new Error(serviceResponse.message || "Service not found");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to load service details";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const handleEditService = () => {
    if (service) {
      navigate(`/hospital/services/edit/${service.id}`);
    }
  };

  const handleBackToServices = () => {
    navigate("/hospital/services");
  };

  const getStatusBadge = (service: Service) => {
    if (!service.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    const currentInternsCount = service.current_interns || 0;
    if (currentInternsCount >= service.capacity) {
      return <Badge className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/30">Full</Badge>;
    }
    
    return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Active</Badge>;
  };

  // Get equipment based on department
  const getServiceEquipment = (department: string = "") => {
    const equipmentMap: Record<string, string[]> = {
      Cardiology: ["ECG Machines", "Echocardiography", "Cardiac Catheterization Lab", "Holter Monitors"],
      "Emergency Medicine": ["Defibrillators", "Ventilators", "Ultrasound Machines", "Trauma Bays"],
      Pediatrics: ["Neonatal Incubators", "Pediatric Monitors", "Child-sized Equipment", "Play Therapy Area"],
      "General Surgery": ["Operating Tables", "Surgical Lights", "Anesthesia Machines", "Sterilization Equipment"],
      Neurology: ["EEG Machines", "MRI Scanner", "CT Scanner", "Neuro-monitoring Equipment"],
      Radiology: ["X-ray Machines", "Ultrasound", "MRI", "CT Scanner"],
      default: ["Medical Beds", "Monitoring Equipment", "Diagnostic Tools", "Treatment Stations"]
    };

    return equipmentMap[department] || equipmentMap.default;
  };

  // Get services based on department
  const getServiceServices = (department: string = "") => {
    const servicesMap: Record<string, string[]> = {
      Cardiology: ["Cardiac Consultation", "ECG", "Echocardiography", "Stress Testing", "Cardiac Rehabilitation"],
      "Emergency Medicine": ["Trauma Care", "Emergency Surgery", "Critical Care", "Triage", "Resuscitation"],
      Pediatrics: ["Child Health Checkups", "Vaccinations", "Growth Monitoring", "Pediatric Surgery"],
      "General Surgery": ["General Surgery", "Laparoscopic Surgery", "Emergency Surgery", "Post-op Care"],
      Neurology: ["Neurological Consultation", "EEG", "Brain Imaging", "Nerve Conduction Studies"],
      Radiology: ["X-ray Imaging", "Ultrasound Scans", "CT Scans", "MRI Scans", "Fluoroscopy"],
      default: ["Medical Consultation", "Diagnostic Tests", "Treatment Procedures", "Follow-up Care"]
    };

    return servicesMap[department] || servicesMap.default;
  };

  // Loading and error states
  if (loading) {
    return (
      <AppLayout role="hospital" userName={currentUser?.name || "Hospital"}>
        <LoadingState message="Loading service details..." />
      </AppLayout>
    );
  }

  if (error || !service) {
    return (
      <AppLayout role="hospital" userName={currentUser?.name || "Hospital"}>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBackToServices}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Service Details</h1>
          </div>
          <ErrorState 
            message={error || "Service not found"} 
            onRetry={fetchServiceDetails}
          />
        </div>
      </AppLayout>
    );
  }

  const currentInternsCount = service.current_interns || 0;
  const availableSpots = Math.max(0, service.capacity - currentInternsCount);
  const capacityPercentage = service.capacity > 0 ? (currentInternsCount / service.capacity) * 100 : 0;

  return (
    <AppLayout role="hospital" userName={currentUser?.name || "Hospital"}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBackToServices}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{service.name}</h1>
                {getStatusBadge(service)}
              </div>
              <p className="text-muted-foreground mt-1">{service.department || "General Service"}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleEditService}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Service
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentInternsCount}/{service.capacity}</p>
                <p className="text-sm text-muted-foreground">Current Interns</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tutors.length}</p>
                <p className="text-sm text-muted-foreground">Active Tutors</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{availableSpots}</p>
                <p className="text-sm text-muted-foreground">Available Spots</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Capacity Usage</p>
              <Progress value={capacityPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(capacityPercentage)}% filled</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description || "No description available for this service."}
                </p>
              </CardContent>
            </Card>

            {service.department && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Services Provided</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {getServiceServices(service.department).map((svc, idx) => (
                        <Badge key={idx} variant="outline">{svc}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Equipment & Facilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {getServiceEquipment(service.department).map((eq, idx) => (
                        <Badge key={idx} variant="secondary">{eq}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Current Interns</CardTitle>
                <CardDescription>{currentInternsCount} interns currently assigned</CardDescription>
              </CardHeader>
              <CardContent>
                {currentInternsCount === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No interns currently assigned to this service.</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {currentInternsCount} intern{currentInternsCount !== 1 ? 's' : ''} currently assigned.
                    </p>
                    <Button variant="outline" className="mt-4">
                      View Intern Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Head of Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {service.head_doctor_name ? (
                  <>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          {service.head_doctor_name
                            .split(' ')
                            .slice(-1)
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{service.head_doctor_name}</p>
                        <p className="text-sm text-muted-foreground">{service.department || "Department Head"}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {service.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{service.phone}</span>
                        </div>
                      )}
                      {service.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{service.email}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <User className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No head doctor assigned</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={handleEditService}>
                      Assign Head Doctor
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location & Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {service.floor && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>{service.floor}</span>
                  </div>
                )}
                {service.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>{service.phone}</span>
                  </div>
                )}
                {service.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>{service.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span>Status: {service.is_active ? "Active" : "Inactive"}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Stethoscope className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span>Accepts Interns: {service.accepts_interns ? "Yes" : "No"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tutors</CardTitle>
                <CardDescription>Doctors available in this service</CardDescription>
              </CardHeader>
              <CardContent>
                {tutors.length === 0 ? (
                  <div className="text-center py-4">
                    <User className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No tutors found in this hospital</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tutors.slice(0, 5).map((tutor) => (
                      <div key={tutor.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {`${tutor.first_name?.[0] || ''}${tutor.last_name?.[0] || ''}`.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{tutor.first_name} {tutor.last_name}</p>
                            <p className="text-xs text-muted-foreground">{tutor.specialization || tutor.department || "Doctor"}</p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {tutor.active_students || 0} student{(tutor.active_students || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                    {tutors.length > 5 && (
                      <Button variant="ghost" size="sm" className="w-full mt-2">
                        View all {tutors.length} tutors
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}