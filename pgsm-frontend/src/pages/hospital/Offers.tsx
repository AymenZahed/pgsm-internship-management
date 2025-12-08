import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Search, Calendar as CalendarIcon, Users, Eye, Edit, Trash2, Copy, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { offerService, Offer } from "@/services/offer.service";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";

export default function HospitalOffers() {
  const navigate = useNavigate();
  
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  
  // Form states
  const [editFormData, setEditFormData] = useState<Partial<Offer>>({});
  const [editStartDate, setEditStartDate] = useState<Date>();
  const [editEndDate, setEditEndDate] = useState<Date>();
  const [editApplicationDeadline, setEditApplicationDeadline] = useState<Date>();

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalPositions: 0,
    totalApplicants: 0
  });

  // Fetch offers from API
  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await offerService.getHospitalOffers();
      if (response.success && response.data) {
        setOffers(response.data);
        calculateStats(response.data);
      } else {
        throw new Error(response.message || "Failed to load offers");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load offers");
      toast.error(err.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (offersData: Offer[]) => {
    const activeOffers = offersData.filter(o => o.status === 'published');
    const totalPositions = activeOffers.reduce((acc, o) => acc + o.positions, 0);
    const totalApplicants = activeOffers.reduce((acc, o) => acc + (o.applicants || 0), 0);
    
    setStats({
      total: offersData.length,
      active: activeOffers.length,
      totalPositions,
      totalApplicants
    });
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Status badge component
  const getStatusBadge = (status: Offer["status"]) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Published
        </Badge>;
      case "draft":
        return <Badge variant="secondary" className="flex items-center gap-1">
          Draft
        </Badge>;
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

  // Filter offers based on search and tab
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = 
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (offer.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (offer.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "all" || 
      (activeTab === "active" && offer.status === "published") ||
      (activeTab === "draft" && offer.status === "draft") ||
      (activeTab === "closed" && (offer.status === "closed" || offer.status === "cancelled"));
    
    return matchesSearch && matchesTab;
  });

  // Handle view offer
  const handleView = (offer: Offer) => {
    setSelectedOffer(offer);
    setViewDialogOpen(true);
  };

  // Handle edit offer
  const handleEdit = (offer: Offer) => {
    setSelectedOffer(offer);
    setEditFormData({ ...offer });
    
    // Parse dates for calendar
    if (offer.start_date) setEditStartDate(new Date(offer.start_date));
    if (offer.end_date) setEditEndDate(new Date(offer.end_date));
    if (offer.application_deadline) setEditApplicationDeadline(new Date(offer.application_deadline));
    
    setEditDialogOpen(true);
  };

  // Handle save edited offer
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;
    
    try {
      const updateData = {
        ...editFormData,
        start_date: editStartDate ? format(editStartDate, 'yyyy-MM-dd') : selectedOffer.start_date,
        end_date: editEndDate ? format(editEndDate, 'yyyy-MM-dd') : selectedOffer.end_date,
        application_deadline: editApplicationDeadline ? format(editApplicationDeadline, 'yyyy-MM-dd') : selectedOffer.application_deadline,
      };

      const response = await offerService.updateOffer(selectedOffer.id, updateData);
      
      if (response.success) {
        toast.success("Offer updated successfully");
        setEditDialogOpen(false);
        fetchOffers();
      } else {
        throw new Error(response.message || "Failed to update offer");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update offer");
    }
  };



  // Handle delete offer
  const handleDelete = async (offerId: string) => {
    try {
      const response = await offerService.deleteOffer(offerId);
      if (response.success) {
        toast.success("Offer deleted successfully");
        setDeleteDialogOpen(false);
        fetchOffers();
      } else {
        throw new Error(response.message || "Failed to delete offer");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete offer");
    }
  };

  // Handle publish offer
  const handlePublish = async (offerId: string) => {
    try {
      const response = await offerService.publishOffer(offerId);
      if (response.success) {
        toast.success("Offer published successfully");
        fetchOffers();
      } else {
        throw new Error(response.message || "Failed to publish offer");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to publish offer");
    }
  };

  // Handle close offer
  const handleClose = async (offerId: string) => {
    try {
      const response = await offerService.closeOffer(offerId);
      if (response.success) {
        toast.success("Offer closed successfully");
        fetchOffers();
      } else {
        throw new Error(response.message || "Failed to close offer");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to close offer");
    }
  };
  const handleCancel = async (offerId: string) => {
    try {
      const response = await offerService.cancelOffer(offerId);
      if (response.success) {
        toast.success("Offer Canceled successfully");
        fetchOffers();
      } else {
        throw new Error(response.message || "Failed to Cancel offer");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to Cancele offer");
    }
  };

  if (loading) {
    return (
      <AppLayout role="hospital">
        <LoadingState message="Loading offers..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout role="hospital">
        <ErrorState message={error} onRetry={fetchOffers} />
      </AppLayout>
    );
  }

  return (
    <AppLayout role="hospital">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Internship Offers</h1>
            <p className="text-muted-foreground mt-1">Manage your internship opportunities</p>
          </div>
          <Button onClick={() => navigate("/hospital/offers/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Offer
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Offers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active Offers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{stats.totalPositions}</p>
              <p className="text-sm text-muted-foreground">Open Positions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-primary">{stats.totalApplicants}</p>
              <p className="text-sm text-muted-foreground">Total Applicants</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search offers by title, department, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Offers List */}
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{offer.title}</h3>
                      {getStatusBadge(offer.status)}
                    </div>
                    <p className="text-muted-foreground">{offer.department || "No department specified"}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {offer.duration_weeks} weeks
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {offer.positions} position{offer.positions !== 1 ? 's' : ''}
                        {offer.filled_positions && offer.filled_positions > 0 && (
                          <span className="text-green-600 ml-1">({offer.filled_positions} filled)</span>
                        )}
                      </span>
                      <span>
                        {format(new Date(offer.start_date), 'MMM d, yyyy')} - {format(new Date(offer.end_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {offer.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {offer.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {offer.status === "published" && offer.applicants && offer.applicants > 0 && (
                      <div className="text-center px-4 py-2 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{offer.applicants}</p>
                        <p className="text-xs text-muted-foreground">Applicant{offer.applicants !== 1 ? 's' : ''}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(offer)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/hospital/offers/${offer.id}`)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(offer)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive" 
                        onClick={() => {
                          setSelectedOffer(offer);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons based on status */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  {offer.status === "draft" && (
                    <Button size="sm" onClick={() => handlePublish(offer.id)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Publish Offer
                    </Button>
                  )}
                  {offer.status === "published" && (
                    <Button size="sm" variant="outline" onClick={() => handleClose(offer.id)}>
                      Close Offer
                    </Button>
                  )}
                  {offer.status === "published" && (
                    <Button size="sm" variant="outline" onClick={() => handleCancel(offer.id)}>
                      Cancel Offer
                    </Button>
                  )}
                  {offer.status === "closed" && (
                    <Button size="sm" variant="outline" onClick={() => handlePublish(offer.id)}>
                      Reopen Offer
                    </Button>
                  )}
                  {offer.status === "cancelled" && (
                    <Button size="sm" variant="outline" disabled>
                      Cancelled
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No offers found</p>
              {searchQuery && (
                <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Offer Details</DialogTitle>
              <DialogDescription>View internship offer information</DialogDescription>
            </DialogHeader>
            {selectedOffer && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold">{selectedOffer.title}</h3>
                  {getStatusBadge(selectedOffer.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium">{selectedOffer.department || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{selectedOffer.duration_weeks} weeks</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Start Date:</span>
                    <p className="font-medium">{format(new Date(selectedOffer.start_date), 'PPP')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End Date:</span>
                    <p className="font-medium">{format(new Date(selectedOffer.end_date), 'PPP')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Positions:</span>
                    <p className="font-medium">
                      {selectedOffer.positions} total
                      {selectedOffer.filled_positions && selectedOffer.filled_positions > 0 && 
                        ` (${selectedOffer.filled_positions} filled)`}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Applicants:</span>
                    <p className="font-medium">{selectedOffer.applicants || 0}</p>
                  </div>
                  {selectedOffer.application_deadline && (
                    <div>
                      <span className="text-muted-foreground">Application Deadline:</span>
                      <p className="font-medium">{format(new Date(selectedOffer.application_deadline), 'PPP')}</p>
                    </div>
                  )}
                  {selectedOffer.type && (
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium capitalize">{selectedOffer.type}</p>
                    </div>
                  )}
                </div>
                
                {selectedOffer.description && (
                  <div>
                    <span className="text-muted-foreground text-sm">Description:</span>
                    <p className="mt-1 text-sm">{selectedOffer.description}</p>
                  </div>
                )}
                
                {selectedOffer.requirements && (
                  <div>
                    <span className="text-muted-foreground text-sm">Requirements:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedOffer.requirements.split(',').map((req, idx) => (
                        <Badge key={idx} variant="outline">{req.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedOffer.responsibilities && (
                  <div>
                    <span className="text-muted-foreground text-sm">Responsibilities:</span>
                    <p className="mt-1 text-sm">{selectedOffer.responsibilities}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Offer</DialogTitle>
              <DialogDescription>Update internship offer details</DialogDescription>
            </DialogHeader>
            {selectedOffer && (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={editFormData.title || ""}
                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={editFormData.department || ""}
                      onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_weeks">Duration (weeks) *</Label>
                    <Input
                      id="duration_weeks"
                      type="number"
                      min="1"
                      value={editFormData.duration_weeks || ""}
                      onChange={(e) => setEditFormData({...editFormData, duration_weeks: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !editStartDate && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editStartDate ? format(editStartDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={editStartDate}
                          onSelect={setEditStartDate}
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
                          className={cn("w-full justify-start text-left font-normal", !editEndDate && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editEndDate ? format(editEndDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={editEndDate}
                          onSelect={setEditEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Application Deadline</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !editApplicationDeadline && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editApplicationDeadline ? format(editApplicationDeadline, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={editApplicationDeadline}
                          onSelect={setEditApplicationDeadline}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="positions">Positions *</Label>
                    <Input
                      id="positions"
                      type="number"
                      min="1"
                      value={editFormData.positions || ""}
                      onChange={(e) => setEditFormData({...editFormData, positions: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Internship Type</Label>
                    <Select
                      value={editFormData.type || "required"}
                      onValueChange={(value: "required" | "optional" | "summer") => 
                        setEditFormData({...editFormData, type: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                        <SelectItem value="summer">Summer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editFormData.status || "draft"}
                      onValueChange={(value: "draft" | "published" | "closed" | "cancelled") => 
                        setEditFormData({...editFormData, status: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editFormData.description || ""}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                  <Textarea
                    id="requirements"
                    value={editFormData.requirements || ""}
                    onChange={(e) => setEditFormData({...editFormData, requirements: e.target.value})}
                    rows={2}
                    placeholder="e.g., 4th year medical student, Basic ECG knowledge, Strong communication skills"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    value={editFormData.responsibilities || ""}
                    onChange={(e) => setEditFormData({...editFormData, responsibilities: e.target.value})}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea
                    id="benefits"
                    value={editFormData.benefits || ""}
                    onChange={(e) => setEditFormData({...editFormData, benefits: e.target.value})}
                    rows={2}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Offer</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedOffer?.title}"? This action cannot be undone.
                {selectedOffer?.applicants && selectedOffer.applicants > 0 && (
                  <p className="text-amber-600 font-medium mt-2">
                    Warning: This offer has {selectedOffer.applicants} applicant(s). Deleting it will remove all associated applications.
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => selectedOffer && handleDelete(selectedOffer.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Offer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}