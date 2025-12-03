import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, Clock, Stethoscope, Edit, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Service {
  id: string;
  name: string;
  department: string;
  head: string;
  capacity: number;
  currentInterns: number;
  status: "active" | "full" | "inactive";
  description: string;
}

const mockServices: Service[] = [
  {
    id: "1",
    name: "Cardiology Unit",
    department: "Cardiology",
    head: "Dr. Ahmed Benali",
    capacity: 8,
    currentInterns: 5,
    status: "active",
    description: "Comprehensive cardiac care including interventional cardiology"
  },
  {
    id: "2",
    name: "Emergency Department",
    department: "Emergency Medicine",
    head: "Dr. Fatima Zahra",
    capacity: 12,
    currentInterns: 12,
    status: "full",
    description: "24/7 emergency medical services and trauma care"
  },
  {
    id: "3",
    name: "Pediatric Ward",
    department: "Pediatrics",
    head: "Dr. Khalid Mansouri",
    capacity: 6,
    currentInterns: 3,
    status: "active",
    description: "Child healthcare from newborn to adolescence"
  },
  {
    id: "4",
    name: "Surgical Unit",
    department: "General Surgery",
    head: "Dr. Hassan Alami",
    capacity: 10,
    currentInterns: 7,
    status: "active",
    description: "General and specialized surgical procedures"
  },
  {
    id: "5",
    name: "Neurology Department",
    department: "Neurology",
    head: "Dr. Nadia Chraibi",
    capacity: 5,
    currentInterns: 0,
    status: "inactive",
    description: "Diagnosis and treatment of neurological disorders"
  },
];

export default function HospitalServices() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredServices = mockServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: Service["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Active</Badge>;
      case "full":
        return <Badge className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/30">Full</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Services Management</h1>
            <p className="text-muted-foreground mt-1">Manage hospital departments and services</p>
          </div>
          <Button onClick={() => navigate("/hospital/services/add")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockServices.length}</p>
                  <p className="text-sm text-muted-foreground">Total Services</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockServices.filter(s => s.status === "active").length}</p>
                  <p className="text-sm text-muted-foreground">Active Services</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockServices.reduce((acc, s) => acc + s.currentInterns, 0)}</p>
                  <p className="text-sm text-muted-foreground">Current Interns</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockServices.reduce((acc, s) => acc + s.capacity, 0)}</p>
                  <p className="text-sm text-muted-foreground">Total Capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>{service.department}</CardDescription>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{service.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Head</span>
                    <span className="font-medium">{service.head}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">{service.currentInterns}/{service.capacity} interns</span>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      service.currentInterns >= service.capacity 
                        ? "bg-amber-500" 
                        : "bg-primary"
                    }`}
                    style={{ width: `${(service.currentInterns / service.capacity) * 100}%` }}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
