import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Building2, Users, FileText, MapPin, Eye, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface Hospital {
  id: string;
  name: string;
  type: string;
  city: string;
  activeOffers: number;
  currentInterns: number;
  totalCapacity: number;
  status: "active" | "inactive" | "pending";
  createdAt: string;
}

const mockHospitals: Hospital[] = [
  { id: "1", name: "CHU Ibn Sina", type: "University Hospital", city: "Rabat", activeOffers: 8, currentInterns: 45, totalCapacity: 80, status: "active", createdAt: "2023-01-15" },
  { id: "2", name: "CHU Mohammed VI", type: "University Hospital", city: "Marrakech", activeOffers: 6, currentInterns: 38, totalCapacity: 70, status: "active", createdAt: "2023-02-20" },
  { id: "3", name: "Hôpital Cheikh Khalifa", type: "Private Hospital", city: "Casablanca", activeOffers: 4, currentInterns: 20, totalCapacity: 40, status: "active", createdAt: "2023-03-10" },
  { id: "4", name: "CHR Al Farabi", type: "Regional Hospital", city: "Oujda", activeOffers: 3, currentInterns: 15, totalCapacity: 35, status: "active", createdAt: "2023-04-05" },
  { id: "5", name: "Clinique Atlas", type: "Private Clinic", city: "Fes", activeOffers: 2, currentInterns: 8, totalCapacity: 20, status: "pending", createdAt: "2024-01-10" },
  { id: "6", name: "Hôpital Provincial", type: "Provincial Hospital", city: "Kenitra", activeOffers: 0, currentInterns: 0, totalCapacity: 25, status: "inactive", createdAt: "2023-06-15" },
];

export default function AdminHospitals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusBadge = (status: Hospital["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-600">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-600">Pending</Badge>;
    }
  };

  const types = [...new Set(mockHospitals.map(h => h.type))];

  const filteredHospitals = mockHospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || hospital.type === typeFilter;
    const matchesStatus = statusFilter === "all" || hospital.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: mockHospitals.length,
    active: mockHospitals.filter(h => h.status === "active").length,
    totalOffers: mockHospitals.reduce((acc, h) => acc + h.activeOffers, 0),
    totalInterns: mockHospitals.reduce((acc, h) => acc + h.currentInterns, 0),
  };

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Hospitals Management</h1>
            <p className="text-muted-foreground mt-1">Manage partner hospitals and clinics</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Hospital
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Hospitals</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active Partners</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalOffers}</p>
                <p className="text-sm text-muted-foreground">Active Offers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalInterns}</p>
                <p className="text-sm text-muted-foreground">Current Interns</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search hospitals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hospitals Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Active Offers</TableHead>
                  <TableHead>Interns</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHospitals.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{hospital.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {hospital.city}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{hospital.type}</TableCell>
                    <TableCell>
                      <span className="font-medium">{hospital.activeOffers}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{hospital.currentInterns}</span>
                      <span className="text-muted-foreground">/{hospital.totalCapacity}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(hospital.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
