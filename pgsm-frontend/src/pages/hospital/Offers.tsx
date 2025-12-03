import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Calendar, Users, Eye, Edit, Trash2, Copy } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
}

const mockOffers: Offer[] = [
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
    createdAt: "2024-01-10"
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
    createdAt: "2024-01-15"
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
    createdAt: "2024-01-20"
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
    createdAt: "2024-01-01"
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
    createdAt: "2023-11-15"
  },
];

export default function HospitalOffers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
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

  const filteredOffers = mockOffers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || offer.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: mockOffers.length,
    active: mockOffers.filter(o => o.status === "active").length,
    totalPositions: mockOffers.filter(o => o.status === "active").reduce((acc, o) => acc + o.positions, 0),
    totalApplicants: mockOffers.filter(o => o.status === "active").reduce((acc, o) => acc + o.applicants, 0),
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
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
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
      </div>
    </AppLayout>
  );
}
