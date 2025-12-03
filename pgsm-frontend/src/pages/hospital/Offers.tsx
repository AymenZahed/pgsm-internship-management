import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, Users, Eye, Edit, Trash2, Copy } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Offer {
  id: string;
  title: string;
  department: string;
  duration: string;
  startDate: string;
  endDate: string;
  positions: number;
  applicants: number;
  status: "active" | "draft" | "closed" | "filled";
  requirements: string[];
  createdAt: string;
  description: string;
}

const initialOffers: Offer[] = [
  {
    id: "1",
    title: "Cardiology Clinical Internship",
    department: "Cardiology",
    duration: "3 months",
    startDate: "2024-02-01",
    endDate: "2024-04-30",
    positions: 4,
    applicants: 12,
    status: "active",
    requirements: ["4th year medical student", "Basic ECG knowledge"],
    createdAt: "2024-01-10",
    description: "Hands-on clinical experience in cardiology department"
  },
  {
    id: "2",
    title: "Emergency Medicine Rotation",
    department: "Emergency",
    duration: "2 months",
    startDate: "2024-03-01",
    endDate: "2024-04-30",
    positions: 6,
    applicants: 18,
    status: "active",
    requirements: ["BLS certification", "Available for night shifts"],
    createdAt: "2024-01-15",
    description: "Fast-paced emergency department rotation"
  },
  {
    id: "3",
    title: "Pediatric Care Internship",
    department: "Pediatrics",
    duration: "3 months",
    startDate: "2024-04-01",
    endDate: "2024-06-30",
    positions: 3,
    applicants: 0,
    status: "draft",
    requirements: ["Passion for child healthcare"],
    createdAt: "2024-01-20",
    description: "Comprehensive pediatric care training"
  },
  {
    id: "4",
    title: "Surgery Observation Program",
    department: "Surgery",
    duration: "1 month",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    positions: 2,
    applicants: 8,
    status: "filled",
    requirements: ["5th year student", "Strong anatomy knowledge"],
    createdAt: "2024-01-01",
    description: "Surgical observation and assistance"
  },
  {
    id: "5",
    title: "Internal Medicine Rotation",
    department: "Internal Medicine",
    duration: "2 months",
    startDate: "2023-12-01",
    endDate: "2024-01-31",
    positions: 4,
    applicants: 4,
    status: "closed",
    requirements: ["Clinical examination skills"],
    createdAt: "2023-11-15",
    description: "Internal medicine clinical rotation"
  },
];

export default function HospitalOffers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const navigate = useNavigate();

  const getStatusBadge = (status: Offer["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Active</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      case "filled":
        return <Badge className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/30">Filled</Badge>;
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || offer.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: offers.length,
    active: offers.filter(o => o.status === "active").length,
    totalPositions: offers.filter(o => o.status === "active").reduce((acc, o) => acc + o.positions, 0),
    totalApplicants: offers.filter(o => o.status === "active").reduce((acc, o) => acc + o.applicants, 0),
  };

  const handleView = (offer: Offer) => {
    setSelectedOffer(offer);
    setViewDialogOpen(true);
  };

  const handleEdit = (offer: Offer) => {
    setSelectedOffer({ ...offer });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;
    setOffers(offers.map(o => o.id === selectedOffer.id ? selectedOffer : o));
    setEditDialogOpen(false);
    toast.success("Offer updated successfully");
  };

  const handleCopy = (offer: Offer) => {
    const newOffer: Offer = {
      ...offer,
      id: Date.now().toString(),
      title: `${offer.title} (Copy)`,
      status: "draft",
      applicants: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setOffers([newOffer, ...offers]);
    toast.success("Offer duplicated successfully");
  };

  const handleDelete = (offerId: string) => {
    setOffers(offers.filter(o => o.id !== offerId));
    toast.success("Offer deleted successfully");
  };

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
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
                        {offer.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {offer.positions} positions
                      </span>
                      <span>
                        {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {offer.requirements.map((req, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{req}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {offer.status === "active" && (
                      <div className="text-center px-4 py-2 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{offer.applicants}</p>
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
                    <p className="font-medium">{selectedOffer.duration}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Start Date:</span>
                    <p className="font-medium">{new Date(selectedOffer.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End Date:</span>
                    <p className="font-medium">{new Date(selectedOffer.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Positions:</span>
                    <p className="font-medium">{selectedOffer.positions}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Applicants:</span>
                    <p className="font-medium">{selectedOffer.applicants}</p>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Requirements:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedOffer.requirements.map((req, idx) => (
                      <Badge key={idx} variant="outline">{req}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Offer</DialogTitle>
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
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={selectedOffer.duration}
                      onChange={(e) => setSelectedOffer({ ...selectedOffer, duration: e.target.value })}
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
                      value={selectedOffer.startDate}
                      onChange={(e) => setSelectedOffer({ ...selectedOffer, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={selectedOffer.endDate}
                      onChange={(e) => setSelectedOffer({ ...selectedOffer, endDate: e.target.value })}
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
                      onValueChange={(value: "active" | "draft" | "closed" | "filled") => setSelectedOffer({ ...selectedOffer, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="filled">Filled</SelectItem>
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