import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, Calendar, Users, Clock, Edit, Trash2, Eye, MapPin, User, CheckCircle, XCircle, Loader2, Mail, Phone, Stethoscope, Briefcase, Award } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { offerService, Offer } from "@/services/offer.service";
import { tutorService } from "@/services/tutor.service";
import { serviceService } from "@/services/service.service";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";

interface Applicant {
  id: string;
  name: string;
  university: string;
  status: string;
  gpa: string;
  avatar?: string;
}

interface Tutor {
  id: string;
  first_name: string;
  last_name: string;
  specialization?: string;
  department?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  title?: string;
}

interface Service {
  id: string;
  name: string;
  department?: string;
  floor?: string;
  phone?: string;
  email?: string;
  head_doctor_id?: string;
  head_doctor_name?: string;
}

export default function OfferDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  // State management
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supervisor, setSupervisor] = useState<Tutor | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Fetch offer details
  const fetchOfferDetails = async () => {
    if (!id) {
      setError("Offer ID is required");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch offer
      const response = await offerService.getOfferById(id);
      
      if (response.success && response.data) {
        const offerData = response.data;
        setOffer(offerData);
        
        // Fetch service if service_id exists
        if (offerData.service_id) {
          try {
            const serviceResponse = await serviceService.getServiceById(offerData.service_id);
            if (serviceResponse.success && serviceResponse.data) {
              const serviceData = serviceResponse.data;
              setService(serviceData);
              
              // Fetch supervisor from service's head_doctor_id
              if (serviceData.head_doctor_id) {
                try {
                  const tutorResponse = await tutorService.getTutorById(serviceData.head_doctor_id);
                  if (tutorResponse.success && tutorResponse.data) {
                    setSupervisor(tutorResponse.data);
                  }
                } catch (tutorError) {
                  console.warn("Could not fetch tutor:", tutorError);
                  // If tutor not found, use head_doctor_name from service if available
                  if (serviceData.head_doctor_name) {
                    setSupervisor({
                      id: serviceData.head_doctor_id!,
                      first_name: serviceData.head_doctor_name.split(' ')[0] || '',
                      last_name: serviceData.head_doctor_name.split(' ').slice(1).join(' ') || '',
                      specialization: serviceData.department,
                      department: serviceData.department,
                    });
                  }
                }
              }
            }
          } catch (serviceError) {
            console.warn("Could not fetch service:", serviceError);
          }
        }
        
        // TODO: Fetch applicants from API
        // For now, using mock data
        setApplicants([
          { id: "1", name: "Youssef El Amrani", university: "Université Mohammed V", status: "pending", gpa: "15.5/20" },
          { id: "2", name: "Salma Benjelloun", university: "Université Mohammed V", status: "reviewing", gpa: "16.2/20" },
          { id: "3", name: "Omar Tazi", university: "UIC Casablanca", status: "accepted", gpa: "14.8/20" },
          { id: "4", name: "Leila Fassi", university: "Université Mohammed VI", status: "rejected", gpa: "13.2/20" },
        ]);
        
      } else {
        throw new Error(response.message || "Offer not found");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to load offer details";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOfferDetails();
  }, [id]);
  
  // Status badge component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Published
        </Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "closed":
        return <Badge className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/30">Closed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-600 hover:bg-red-500/30 flex items-center gap-1">
          <XCircle className="w-3 h-3" /> Cancelled
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  // Applicant status badge
  const getApplicantStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/30">Pending</Badge>;
      case "reviewing":
        return <Badge className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/30">Reviewing</Badge>;
      case "accepted":
        return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-600 hover:bg-red-500/30">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  // Handle delete offer
  const handleDelete = async () => {
    if (!offer) return;
    
    try {
      setActionLoading(true);
      const response = await offerService.deleteOffer(offer.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Offer deleted successfully",
        });
        navigate("/hospital/offers");
      } else {
        throw new Error(response.message || "Failed to delete offer");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete offer",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // Handle publish offer
  const handlePublish = async () => {
    if (!offer) return;
    
    try {
      setActionLoading(true);
      const response = await offerService.publishOffer(offer.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Offer published successfully",
        });
        fetchOfferDetails(); // Refresh offer data
      } else {
        throw new Error(response.message || "Failed to publish offer");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to publish offer",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle close offer
  const handleClose = async () => {
    if (!offer) return;
    
    try {
      setActionLoading(true);
      const response = await offerService.closeOffer(offer.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Offer closed successfully",
        });
        fetchOfferDetails(); // Refresh offer data
      } else {
        throw new Error(response.message || "Failed to close offer");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to close offer",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Format requirements into array
  const getRequirementsArray = () => {
    if (!offer?.requirements) return [];
    return offer.requirements.split(',').map(req => req.trim());
  };
  
  // Calculate available positions
  const availablePositions = offer ? 
    offer.positions - (offer.filled_positions || 0) : 0;
  
  // Get supervisor display name
  const getSupervisorDisplayName = () => {
    if (supervisor) {
      return `${supervisor.first_name} ${supervisor.last_name}`;
    } else if (service?.head_doctor_name) {
      return service.head_doctor_name;
    }
    return null;
  };
  
  // Get supervisor title/role
  const getSupervisorRole = () => {
    if (supervisor?.title) {
      return supervisor.title;
    } else if (service?.head_doctor_name) {
      return "Head Doctor";
    }
    return "Supervisor";
  };
  
  // Loading state
  if (loading) {
    return (
      <AppLayout role="hospital" userName={currentUser?.name || "Hospital"}>
        <LoadingState message="Loading offer details..." />
      </AppLayout>
    );
  }
  
  // Error state
  if (error || !offer) {
    return (
      <AppLayout role="hospital" userName={currentUser?.name || "Hospital"}>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Offer Details</h1>
          </div>
          <ErrorState 
            message={error || "Offer not found"} 
            onRetry={fetchOfferDetails}
          />
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout role="hospital" userName={currentUser?.name || "Hospital"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{offer.title}</h1>
                {getStatusBadge(offer.status)}
              </div>
              <p className="text-muted-foreground mt-1">
                {offer.department || "No department specified"}
                {service && ` • ${service.name}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {offer.filled_positions || 0}/{offer.positions}
                </p>
                <p className="text-sm text-muted-foreground">Positions Filled</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{offer.applicants || 0}</p>
                <p className="text-sm text-muted-foreground">Applicants</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{offer.duration_weeks} weeks</p>
                <p className="text-sm text-muted-foreground">Duration</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  {format(new Date(offer.start_date), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">Start Date</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Action buttons based on status */}
        <div className="flex gap-2">
          {offer.status === "draft" && (
            <Button onClick={handlePublish} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Publish Offer
                </>
              )}
            </Button>
          )}
          
          {offer.status === "published" && (
            <Button variant="outline" onClick={handleClose} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Closing...
                </>
              ) : (
                "Close Offer"
              )}
            </Button>
          )}
          
          {offer.status === "closed" && (
            <Button variant="outline" onClick={handlePublish} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reopening...
                </>
              ) : (
                "Reopen Offer"
              )}
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="applicants">
              Applicants ({offer.applicants || 0})
            </TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {offer.description || "No description available."}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Requirements */}
                {offer.requirements && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {getRequirementsArray().map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-muted-foreground">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                {/* Responsibilities */}
                {offer.responsibilities && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Responsibilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {offer.responsibilities}
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                {/* Benefits */}
                {offer.benefits && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Benefits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {offer.benefits}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div className="space-y-6">
                {/* Supervisor - Now from service */}
                <Card>
                  <CardHeader>
                    <CardTitle>Service Head / Supervisor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {service?.head_doctor_id || service?.head_doctor_name ? (
                      <>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getSupervisorDisplayName()?.split(' ').map(n => n[0]).join('') || 'HD'}
                            </AvatarFallback>
                            {supervisor?.avatar && <AvatarImage src={supervisor.avatar} />}
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {getSupervisorDisplayName() || "Service Head"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {getSupervisorRole()}
                              {supervisor?.specialization && ` • ${supervisor.specialization}`}
                              {!supervisor?.specialization && service?.department && ` • ${service.department}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          {supervisor?.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span>{supervisor.email}</span>
                            </div>
                          )}
                          {service?.email && !supervisor?.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span>{service.email}</span>
                            </div>
                          )}
                          {supervisor?.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{supervisor.phone}</span>
                            </div>
                          )}
                          {service?.phone && !supervisor?.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{service.phone}</span>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <User className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No head doctor assigned to this service</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => navigate(`/hospital/services/${service?.id}`)}
                        >
                          Manage Service
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Service Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Service Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {service ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Stethoscope className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">{service.name}</p>
                              {service.department && (
                                <p className="text-sm text-muted-foreground">{service.department}</p>
                              )}
                            </div>
                          </div>
                          
                          {service.floor && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <span className="text-sm">{service.floor}</span>
                            </div>
                          )}
                          
                          {service.phone && (
                            <div className="flex items-start gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <span className="text-sm">{service.phone}</span>
                            </div>
                          )}
                          
                          {service.email && (
                            <div className="flex items-start gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <span className="text-sm">{service.email}</span>
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-4"
                          onClick={() => navigate(`/hospital/services/${service.id}`)}
                        >
                          View Service Details
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No service assigned</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => navigate(`/hospital/offers/edit/${offer.id}`)}
                        >
                          Assign Service
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{offer.duration_weeks} weeks</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">
                        {format(new Date(offer.start_date), 'PPP')}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium">
                        {format(new Date(offer.end_date), 'PPP')}
                      </p>
                    </div>
                    
                    {offer.application_deadline && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Application Deadline</p>
                        <p className="font-medium text-amber-600">
                          {format(new Date(offer.application_deadline), 'PPP')}
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Internship Type</p>
                      <p className="font-medium capitalize">{offer.type || "required"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Applicants Tab */}
          <TabsContent value="applicants">
            <Card>
              <CardHeader>
                <CardTitle>Applicants</CardTitle>
                <CardDescription>
                  Students who applied for this internship
                  {availablePositions > 0 && (
                    <span className="text-green-600 ml-2">
                      ({availablePositions} position{availablePositions !== 1 ? 's' : ''} available)
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applicants.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No applicants yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Applicants will appear here once they apply
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applicants.map((applicant) => (
                      <div key={applicant.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {applicant.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                            {applicant.avatar && <AvatarImage src={applicant.avatar} />}
                          </Avatar>
                          <div>
                            <p className="font-medium">{applicant.name}</p>
                            <p className="text-sm text-muted-foreground">{applicant.university}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">GPA: {applicant.gpa}</span>
                          {getApplicantStatusBadge(applicant.status)}
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Internship Timeline</CardTitle>
                <CardDescription>Key dates and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current status */}
                  <div className="flex items-start gap-4">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      offer.status === 'published' ? 'bg-green-500' :
                      offer.status === 'draft' ? 'bg-gray-400' :
                      offer.status === 'closed' ? 'bg-blue-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium">Current Status: {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}</p>
                      <p className="text-sm text-muted-foreground">
                        {offer.status === 'published' ? 'Accepting applications' :
                         offer.status === 'draft' ? 'Not yet published' :
                         offer.status === 'closed' ? 'No longer accepting applications' :
                         'Cancelled - not available'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Application period */}
                  <div className="flex items-start gap-4">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      !offer.application_deadline || new Date(offer.application_deadline) > new Date() 
                        ? 'bg-amber-500' 
                        : 'bg-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium">Application Period</p>
                      <p className="text-sm text-muted-foreground">
                        {offer.application_deadline 
                          ? `Apply by: ${format(new Date(offer.application_deadline), 'PPP')}`
                          : 'No application deadline set'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* Internship period */}
                  <div className="flex items-start gap-4">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      new Date(offer.start_date) > new Date() ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="font-medium">Internship Period</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(offer.start_date), 'PPP')} - {format(new Date(offer.end_date), 'PPP')}
                        <span className="ml-2">({offer.duration_weeks} weeks)</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Positions */}
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mt-1.5" />
                    <div>
                      <p className="font-medium">Positions</p>
                      <p className="text-sm text-muted-foreground">
                        {offer.positions} total positions
                        {offer.filled_positions && offer.filled_positions > 0 && (
                          <span className="ml-2">
                            ({offer.filled_positions} filled, {availablePositions} available)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Created at */}
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-gray-400 mt-1.5" />
                    <div>
                      <p className="font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {offer.created_at ? format(new Date(offer.created_at), 'PPP') : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Offer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{offer.title}"? This action cannot be undone.
              {offer.applicants && offer.applicants > 0 && (
                <p className="text-amber-600 font-medium mt-2">
                  Warning: This offer has {offer.applicants} applicant(s). Deleting it will remove all associated applications.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Offer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}