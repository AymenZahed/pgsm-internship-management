import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Edit, Users, MapPin, Phone, Mail, Clock, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function ServiceDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const service = {
    id: "1",
    name: "Cardiology Unit",
    department: "Cardiology",
    description: "Comprehensive cardiac care including interventional cardiology, electrophysiology, and cardiac rehabilitation. Our team provides diagnostic and therapeutic services for all types of cardiovascular conditions.",
    head: {
      name: "Dr. Ahmed Benali",
      specialty: "Interventional Cardiology",
      email: "a.benali@chuibnisina.ma",
      phone: "+212 661 234 567",
    },
    capacity: 8,
    currentInterns: 5,
    location: "Building A, 3rd Floor",
    phone: "Ext. 3401",
    email: "cardiology@chuibnisina.ma",
    schedule: "24/7 Emergency, Outpatient: Mon-Fri 8:00-16:00",
    status: "active" as const,
    equipment: ["ECG Machines", "Echocardiography", "Cardiac Catheterization Lab", "Holter Monitors"],
    services: ["Cardiac Consultation", "ECG", "Echocardiography", "Stress Testing", "Cardiac Rehabilitation"],
  };

  const currentInterns = [
    { id: "1", name: "Youssef El Amrani", university: "Université Mohammed V", progress: 45, startDate: "2024-01-15" },
    { id: "2", name: "Omar Tazi", university: "UIC Casablanca", progress: 25, startDate: "2024-02-01" },
    { id: "3", name: "Amina Hassani", university: "Université Mohammed VI", progress: 68, startDate: "2024-01-10" },
  ];

  const tutors = [
    { id: "1", name: "Dr. Ahmed Benali", students: 2, rating: 4.8 },
    { id: "2", name: "Dr. Rachid Taoufik", students: 2, rating: 4.6 },
    { id: "3", name: "Dr. Samira Bennani", students: 1, rating: 4.9 },
  ];

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{service.name}</h1>
                <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Active</Badge>
              </div>
              <p className="text-muted-foreground mt-1">{service.department}</p>
            </div>
          </div>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Service
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{service.currentInterns}/{service.capacity}</p>
                <p className="text-sm text-muted-foreground">Current Interns</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tutors.length}</p>
                <p className="text-sm text-muted-foreground">Active Tutors</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{service.capacity - service.currentInterns}</p>
                <p className="text-sm text-muted-foreground">Available Spots</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Capacity Usage</p>
              <Progress value={(service.currentInterns / service.capacity) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round((service.currentInterns / service.capacity) * 100)}% filled</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Services Provided</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {service.services.map((svc, idx) => (
                    <Badge key={idx} variant="outline">{svc}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipment & Facilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {service.equipment.map((eq, idx) => (
                    <Badge key={idx} variant="secondary">{eq}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Interns</CardTitle>
                <CardDescription>{service.currentInterns} interns currently assigned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentInterns.map((intern) => (
                    <div key={intern.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{intern.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{intern.name}</p>
                          <p className="text-sm text-muted-foreground">{intern.university}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24">
                          <Progress value={intern.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{intern.progress}% complete</p>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Head of Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>{service.head.name.split(' ').slice(1).map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{service.head.name}</p>
                    <p className="text-sm text-muted-foreground">{service.head.specialty}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{service.head.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{service.head.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location & Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span>{service.location}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span>{service.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span>{service.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span>{service.schedule}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tutors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tutors.map((tutor) => (
                    <div key={tutor.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">{tutor.name.split(' ').slice(1).map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{tutor.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{tutor.students} students</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
