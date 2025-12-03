import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { InternshipCard } from "@/components/internships/InternshipCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid3X3, List, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

const mockInternships = [
  {
    id: "1",
    title: "Internal Medicine Rotation",
    hospital: "CHU Mohammed VI",
    service: "Internal Medicine",
    location: "Marrakech",
    startDate: "Jan 15",
    endDate: "Mar 15",
    spotsAvailable: 3,
    totalSpots: 5,
    deadline: "Dec 30",
    tags: ["4th Year", "Required"],
  },
  {
    id: "2",
    title: "Surgery Observation",
    hospital: "Hôpital Ibn Sina",
    service: "General Surgery",
    location: "Rabat",
    startDate: "Feb 1",
    endDate: "Apr 1",
    spotsAvailable: 1,
    totalSpots: 4,
    deadline: "Jan 15",
    tags: ["5th Year", "Elective"],
  },
  {
    id: "3",
    title: "Pediatrics Internship",
    hospital: "CHU Hassan II",
    service: "Pediatrics",
    location: "Fes",
    startDate: "Jan 20",
    endDate: "Mar 20",
    spotsAvailable: 5,
    totalSpots: 8,
    deadline: "Jan 10",
    tags: ["3rd Year", "Required"],
  },
  {
    id: "4",
    title: "Cardiology Clinical",
    hospital: "CHU Ibn Rochd",
    service: "Cardiology",
    location: "Casablanca",
    startDate: "Feb 15",
    endDate: "Apr 15",
    spotsAvailable: 0,
    totalSpots: 3,
    deadline: "Feb 1",
    tags: ["6th Year", "Specialty"],
  },
  {
    id: "5",
    title: "Emergency Medicine",
    hospital: "Hôpital Militaire",
    service: "Emergency",
    location: "Rabat",
    startDate: "Mar 1",
    endDate: "May 1",
    spotsAvailable: 2,
    totalSpots: 6,
    deadline: "Feb 15",
    tags: ["5th Year", "Elective"],
  },
  {
    id: "6",
    title: "Obstetrics & Gynecology",
    hospital: "Maternité Souissi",
    service: "OB/GYN",
    location: "Rabat",
    startDate: "Jan 25",
    endDate: "Mar 25",
    spotsAvailable: 4,
    totalSpots: 6,
    deadline: "Jan 20",
    tags: ["4th Year", "Required"],
  },
];

const locations = ["All Locations", "Rabat", "Casablanca", "Marrakech", "Fes"];
const services = ["All Services", "Internal Medicine", "General Surgery", "Pediatrics", "Cardiology", "Emergency", "OB/GYN"];
const years = ["All Years", "3rd Year", "4th Year", "5th Year", "6th Year"];

export default function InternshipsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedService, setSelectedService] = useState("All Services");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [showFilters, setShowFilters] = useState(false);

  const activeFilters = [
    selectedLocation !== "All Locations" && selectedLocation,
    selectedService !== "All Services" && selectedService,
    selectedYear !== "All Years" && selectedYear,
  ].filter(Boolean);

  const filteredInternships = mockInternships.filter((internship) => {
    const matchesSearch =
      internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.service.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation =
      selectedLocation === "All Locations" || internship.location === selectedLocation;
    
    const matchesService =
      selectedService === "All Services" || internship.service === selectedService;
    
    const matchesYear =
      selectedYear === "All Years" || internship.tags.includes(selectedYear);

    return matchesSearch && matchesLocation && matchesService && matchesYear;
  });

  const clearFilters = () => {
    setSelectedLocation("All Locations");
    setSelectedService("All Services");
    setSelectedYear("All Years");
    setSearchQuery("");
  };

  return (
    <AppLayout role="student" userName="Ahmed Benali">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Browse Internships</h1>
          <p className="page-subtitle">Find and apply to medical internships that match your needs</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by title, hospital, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
            
            <div className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-8 w-8"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Service</label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service} value={service}>{service}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Academic Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {activeFilters.map((filter) => (
              <Badge key={filter as string} variant="secondary" className="gap-1">
                {filter}
                <X className="w-3 h-3 cursor-pointer" onClick={clearFilters} />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
              Clear all
            </Button>
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredInternships.length} of {mockInternships.length} internships
        </div>

        {/* Internships Grid/List */}
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              : "space-y-4"
          )}
        >
          {filteredInternships.map((internship, index) => (
            <InternshipCard
              key={internship.id}
              {...internship}
              onApply={(id) => navigate(`/student/internships/${id}/apply`)}
              onViewDetails={(id) => navigate(`/student/internships/${id}`)}
              className={cn(
                "animate-slide-up",
                `stagger-${Math.min(index + 1, 4)}`
              )}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredInternships.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No internships found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find more results
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
