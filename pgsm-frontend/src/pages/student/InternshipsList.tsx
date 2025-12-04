import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { InternshipCard } from "@/components/internships/InternshipCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid3X3, List, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { offerService } from "@/services/offer.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

interface Offer {
  id: string;
  title: string;
  hospital_name?: string;
  service_name?: string;
  hospital_city?: string;
  start_date: string;
  end_date: string;
  positions: number;
  filled_positions?: number;
  application_deadline?: string;
  department?: string;
  type?: string;
}

interface FilterOptions {
  cities: string[];
  departments: string[];
}

export default function InternshipsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ cities: [], departments: [] });

  // Fetch filter options (cities and departments) from database
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await offerService.getFilterOptions();
      if (response.success && response.data) {
        setFilterOptions({
          cities: response.data.cities || [],
          departments: response.data.departments || [],
        });
      }
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  }, []);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await offerService.getAllOffers({
        search: searchQuery || undefined,
        city: selectedCity !== 'all' ? selectedCity : undefined,
        department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
      });
      if (response.success && response.data) {
        setOffers(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCity, selectedDepartment, t]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchOffers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchOffers]);

  const activeFilters = [
    selectedCity !== "all" && selectedCity,
    selectedDepartment !== "all" && selectedDepartment,
  ].filter(Boolean);

  const clearFilters = () => {
    setSelectedCity("all");
    setSelectedDepartment("all");
    setSearchQuery("");
  };

  if (loading && offers.length === 0) {
    return (
      <AppLayout role="student" userName={user?.first_name || 'Student'}>
        <LoadingState message={t('common.loading')} />
      </AppLayout>
    );
  }

  if (error && offers.length === 0) {
    return (
      <AppLayout role="student" userName={user?.first_name || 'Student'}>
        <ErrorState message={error} onRetry={fetchOffers} />
      </AppLayout>
    );
  }

  return (
    <AppLayout role="student" userName={user?.first_name || 'Student'}>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">{t('sidebar.browseInternships')}</h1>
          <p className="page-subtitle">{t('internships.subtitle', 'Find and apply to medical internships that match your needs')}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t('internships.searchPlaceholder', 'Search by title, hospital, or service...')}
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
              {t('common.filters', 'Filters')}
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

        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('common.city', 'City')}</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder={t('common.selectCity', 'Select city')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.allCities', 'All Cities')}</SelectItem>
                    {filterOptions.cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('common.department', 'Department')}</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.selectDepartment', 'Select department')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.allDepartments', 'All Departments')}</SelectItem>
                    {filterOptions.departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">{t('common.activeFilters', 'Active filters')}:</span>
            {activeFilters.map((filter) => (
              <Badge key={filter as string} variant="secondary" className="gap-1">
                {filter}
                <X className="w-3 h-3 cursor-pointer" onClick={clearFilters} />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
              {t('common.clearAll', 'Clear all')}
            </Button>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          {t('internships.showingCount', 'Showing {{count}} internships', { count: offers.length })}
        </div>

        {offers.length === 0 ? (
          <EmptyState 
            title={t('internships.noResults', 'No internships found')} 
            description={t('internships.noResultsDesc', 'Try adjusting your search or filters to find more results')}
            action={<Button variant="outline" onClick={clearFilters}>{t('common.clearFilters', 'Clear Filters')}</Button>}
          />
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                : "space-y-4"
            )}
          >
            {offers.map((offer, index) => (
              <InternshipCard
                key={offer.id}
                id={offer.id}
                title={offer.title}
                hospital={offer.hospital_name}
                service={offer.service_name || offer.department || ''}
                location={offer.hospital_city}
                startDate={new Date(offer.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                endDate={new Date(offer.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                spotsAvailable={offer.positions - offer.filled_positions}
                totalSpots={offer.positions}
                deadline={offer.application_deadline ? new Date(offer.application_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : undefined}
                tags={[offer.type]}
                onApply={(id) => navigate(`/student/internships/${id}/apply`)}
                onViewDetails={(id) => navigate(`/student/internships/${id}`)}
                className={cn("animate-slide-up", `stagger-${Math.min(index + 1, 4)}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
