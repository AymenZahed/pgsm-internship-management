import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useParams, useNavigate } from "react-router-dom";
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

const mockInternship = {
  id: "1",
  title: "Internal Medicine Rotation",
  hospital: "CHU Mohammed VI",
  hospitalLogo: "/hospitals/chu.jpg",
  service: "Internal Medicine",
  location: "Marrakech, Morocco",
  description: `This rotation provides comprehensive exposure to internal medicine, 
  covering diagnosis and management of common medical conditions. Students will participate 
  in daily rounds, case discussions, and patient care under supervision of experienced physicians.
  
  The rotation emphasizes clinical reasoning, patient communication, and evidence-based practice.
  Students will have opportunities to perform basic procedures and present cases during teaching rounds.`,
  requirements: [
    "4th year medical student or higher",
    "Completed basic clinical rotations",
    "Good academic standing",
    "Valid liability insurance",
  ],
  learningObjectives: [
    "Perform comprehensive patient assessments",
    "Develop differential diagnoses for common conditions",
    "Interpret laboratory and imaging studies",
    "Present cases professionally during rounds",
    "Participate in multidisciplinary team discussions",
  ],
  startDate: "2025-02-01",
  endDate: "2025-04-01",
  duration: "8 weeks",
  spotsAvailable: 3,
  totalSpots: 5,
  applicationDeadline: "2025-01-15",
  supervisor: "Dr. Karim Idrissi",
  supervisorTitle: "Head of Internal Medicine",
  schedule: "Monday - Friday, 8:00 AM - 4:00 PM",
  tags: ["4th Year", "Required", "Clinical"],
};

export default function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <AppLayout role="student" userName="Ahmed Benali">
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
                  {mockInternship.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                <h1 className="text-2xl font-bold">{mockInternship.title}</h1>
                <p className="text-lg text-muted-foreground">{mockInternship.hospital}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  {mockInternship.service}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {mockInternship.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {mockInternship.duration}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {mockInternship.spotsAvailable}/{mockInternship.totalSpots} spots available
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
                Deadline: {new Date(mockInternship.applicationDeadline).toLocaleDateString()}
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
                {mockInternship.description}
              </p>
            </Card>

            {/* Learning Objectives */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Learning Objectives
              </h2>
              <ul className="space-y-3">
                {mockInternship.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{objective}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Requirements */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Requirements</h2>
              <ul className="space-y-3">
                {mockInternship.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <span className="text-muted-foreground">{req}</span>
                  </li>
                ))}
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
                    <p className="font-medium">{new Date(mockInternship.startDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{new Date(mockInternship.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Schedule</p>
                    <p className="font-medium">{mockInternship.schedule}</p>
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
                  <p className="font-semibold">{mockInternship.supervisor}</p>
                  <p className="text-sm text-muted-foreground">{mockInternship.supervisorTitle}</p>
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
                Application deadline: {new Date(mockInternship.applicationDeadline).toLocaleDateString()}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
