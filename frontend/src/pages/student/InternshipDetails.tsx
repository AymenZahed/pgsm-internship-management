import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { offerService, Offer } from "@/services/offer.service";
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  Users,
  User,
  ArrowLeft,
  FileText,
  CheckCircle,
  Briefcase,
  GraduationCap
} from "lucide-react";

export default function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffer = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await offerService.getOfferById(id);
        if (res.success && res.data) {
          setOffer(res.data);
        } else {
          setError(res.message || "Offer not found");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to load offer");
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]);

  if (loading) {
    return (
      <AppLayout role="student">
        <LoadingState message="Loading internship details..." />
      </AppLayout>
    );
  }

  if (error || !offer) {
    return (
      <AppLayout role="student">
        <ErrorState message={error || "Internship not found"} onRetry={() => navigate(-1)} />
      </AppLayout>
    );
  }

  const availableSpots =
    typeof offer.filled_positions === "number"
      ? Math.max(offer.positions - offer.filled_positions, 0)
      : offer.available_positions ?? offer.positions;

  const tags: string[] = [];
  if (offer.type) tags.push(offer.type);
  if (offer.department) tags.push(offer.department);

  return (
    <AppLayout role="student">
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/student/internships")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Internships
        </Button>

        {/* Header Card */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-10 h-10 text-primary" />
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                <h1 className="text-2xl font-bold">{offer.title}</h1>
                <p className="text-lg text-muted-foreground">{offer.hospital_name}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  {offer.service_name || offer.department}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {offer.hospital_city}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {offer.duration_weeks ? `${offer.duration_weeks} weeks` : undefined}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {availableSpots}/{offer.positions} spots available
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <Button
                variant="hero"
                size="lg"
                className="gap-2"
                onClick={() => navigate(`/student/internships/${id}/apply`)}
              >
                <FileText className="w-5 h-5" />
                Apply Now
              </Button>
              <p className="text-sm text-muted-foreground">
                {offer.application_deadline && (
                  <>Deadline: {new Date(offer.application_deadline).toLocaleDateString()}</>
                )}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {offer.description || "No description provided."}
              </p>
            </Card>

            {/* Learning Objectives */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Learning Objectives
              </h2>
              <ul className="space-y-3">
                {offer.requirements
                  ? offer.requirements.split("\n").map((line, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{line}</span>
                    </li>
                  ))
                  : (
                    <li className="text-sm text-muted-foreground">
                      No specific learning objectives provided.
                    </li>
                  )}
              </ul>
            </Card>

            {/* Requirements */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Requirements</h2>
              <ul className="space-y-3">
                {offer.requirements
                  ? offer.requirements.split("\n").map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  ))
                  : (
                    <li className="text-sm text-muted-foreground">
                      No specific requirements listed.
                    </li>
                  )}
              </ul>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Details */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Key Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{new Date(offer.start_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{new Date(offer.end_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Schedule</p>
                    <p className="font-medium">{offer.benefits || "Schedule not specified"}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Supervisor */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Supervisor</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{offer.hospital_name}</p>
                  <p className="text-sm text-muted-foreground">{offer.hospital_city}</p>
                </div>
              </div>
            </Card>

            {/* Apply Card */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h2 className="font-semibold text-lg mb-2">Ready to Apply?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Submit your application before the deadline to secure your spot.
              </p>
              <Button
                variant="hero"
                className="w-full gap-2"
                onClick={() => navigate(`/student/internships/${id}/apply`)}
              >
                <FileText className="w-4 h-4" />
                Apply Now
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                {offer.application_deadline && (
                  <>Application deadline: {new Date(offer.application_deadline).toLocaleDateString()}</>
                )}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
