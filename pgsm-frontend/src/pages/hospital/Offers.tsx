import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, Users, Eye, Edit, Trash2, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { offerService } from "@/services/offer.service";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";

import { Offer } from "@/services/offer.service";

export default function HospitalOffers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const navigate = useNavigate();

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await offerService.getHospitalOffers();
      if (response.success) {
        setOffers(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const getStatusBadge = (status: Offer["status"]) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Published</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-600 hover:bg-red-500/30">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (offer.department || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || offer.status === activeTab || 
      (activeTab === "active" && offer.status === "published");
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: offers.length,
    active: offers.filter(o => o.status === "published").length,
    totalPositions: offers.filter(o => o.status === "published").reduce((acc, o) => acc + o.positions, 0),
    totalApplicants: offers.filter(o => o.status === "published").reduce((acc, o) => acc + (o.applicants || 0), 0),
  };

  const handleView = (offer: Offer) => {
    setSelectedOffer(offer);
    setViewDialogOpen(true);
  };

  const handleEdit = (offer: Offer) => {
    setSelectedOffer({ ...offer });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;
    try {
      const response = await offerService.updateOffer(selectedOffer.id, {
        title: selectedOffer.title,
        department: selectedOffer.department,
        description: selectedOffer.description,
        duration_weeks: selectedOffer.duration_weeks,
        start_date: selectedOffer.start_date,
        end_date: selectedOffer.end_date,
        positions: selectedOffer.positions,
        status: selectedOffer.status,
        requirements: selectedOffer.requirements,
      });
      if (response.success) {
        toast.success("Offer updated successfully");
        setEditDialogOpen(false);
        fetchOffers();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update offer");
    }
  };

  const handleCopy = async (offer: Offer) => {
    try {
      const response = await offerService.createOffer({
        title: `${offer.title} (Copy)`,
        department: offer.department,
        description: offer.description,
        duration_weeks: offer.duration_weeks,
        start_date: offer.start_date,
        end_date: offer.end_date,
        positions: offer.positions,
        status: "draft",
        requirements: offer.requirements,
      });
      if (response.success) {
        toast.success("Offer duplicated successfully");
        fetchOffers();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to duplicate offer");
    }
  };

  const handleDelete = async (offerId: string) => {
    try {
      const response = await offerService.deleteOffer(offerId);
      if (response.success) {
        toast.success("Offer deleted successfully");
        fetchOffers();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete offer");
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
              placeholder="Search offers..."
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
                    <p className="text-muted-foreground">{offer.department}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {offer.duration_weeks ? `${offer.duration_weeks} weeks` : 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {offer.positions} positions
                      </span>
                      <span>
                        {new Date(offer.start_date).toLocaleDateString()} - {new Date(offer.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    {offer.requirements && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {offer.requirements.split(',').map((req, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{req.trim()}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {offer.status === "published" && (
                      <div className="text-center px-4 py-2 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{offer.applicants || 0}</p>
                        <p className="text-xs text-muted-foreground">Applicants</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(offer)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(offer)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleCopy(offer)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(offer.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No offers found</p>
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
                <p className="text-muted-foreground">{selectedOffer.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium">{selectedOffer.department}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{selectedOffer.duration_weeks ? `${selectedOffer.duration_weeks} weeks` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Start Date:</span>
                    <p className="font-medium">{new Date(selectedOffer.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End Date:</span>
                    <p className="font-medium">{new Date(selectedOffer.end_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Positions:</span>
                    <p className="font-medium">{selectedOffer.positions}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Applicants:</span>
                    <p className="font-medium">{selectedOffer.applicants || 0}</p>
                  </div>
                </div>
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
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Offer</DialogTitle>
              <DialogDescription>Update internship offer details</DialogDescription>
            </DialogHeader>
            {selectedOffer && (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={selectedOffer.title}
                    onChange={(e) => setSelectedOffer({ ...selectedOffer, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={selectedOffer.department}
                      onChange={(e) => setSelectedOffer({ ...selectedOffer, department: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (weeks)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={selectedOffer.duration_weeks || ''}
                      onChange={(e) => setSelectedOffer({ ...selectedOffer, duration_weeks: parseInt(e.target.value) || undefined })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={selectedOffer.start_date?.split('T')[0]}
                      onChange={(e) => setSelectedOffer({ ...selectedOffer, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={selectedOffer.end_date?.split('T')[0]}
                      onChange={(e) => setSelectedOffer({ ...selectedOffer, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="positions">Positions</Label>
                    <Input
                      id="positions"
                      type="number"
                      value={selectedOffer.positions}
                      onChange={(e) => setSelectedOffer({ ...selectedOffer, positions: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={selectedOffer.status}
                      onValueChange={(value: "draft" | "published" | "closed" | "cancelled") => setSelectedOffer({ ...selectedOffer, status: value })}
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
                    value={selectedOffer.description}
                    onChange={(e) => setSelectedOffer({ ...selectedOffer, description: e.target.value })}
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
      </div>
    </AppLayout>
  );
}
