import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Mail, Phone, Star, Users, Calendar, Edit, MessageSquare } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function TutorDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const tutor = {
    id: "1",
    name: "Dr. Ahmed Benali",
    email: "a.benali@chuibnisina.ma",
    phone: "+212 661 234 567",
    department: "Cardiology",
    specialty: "Interventional Cardiology",
    title: "Professor",
    currentStudents: 3,
    maxStudents: 5,
    totalSupervised: 28,
    rating: 4.8,
    yearsExperience: 15,
    status: "active" as const,
    bio: "Dr. Ahmed Benali is a renowned interventional cardiologist with over 15 years of experience. He has supervised numerous medical students and residents, helping them develop both clinical skills and professional competencies.",
    qualifications: ["MD", "PhD Cardiology", "Fellowship Interventional Cardiology"],
    languages: ["Arabic", "French", "English"],
  };

  const currentStudents = [
    { id: "1", name: "Youssef El Amrani", university: "Université Mohammed V", progress: 45, startDate: "2024-01-15", endDate: "2024-04-15" },
    { id: "2", name: "Omar Tazi", university: "UIC Casablanca", progress: 25, startDate: "2024-02-01", endDate: "2024-05-01" },
    { id: "3", name: "Amina Hassani", university: "Université Mohammed VI", progress: 68, startDate: "2024-01-10", endDate: "2024-04-10" },
  ];

  const pastStudents = [
    { id: "4", name: "Karima Benjelloun", university: "Université Mohammed V", year: "2023", rating: 5 },
    { id: "5", name: "Hassan Tazi", university: "UIC Casablanca", year: "2023", rating: 4 },
    { id: "6", name: "Fatima El Idrissi", university: "Université Mohammed VI", year: "2022", rating: 5 },
  ];

  const reviews = [
    { studentName: "Karima Benjelloun", date: "Dec 2023", rating: 5, comment: "Dr. Benali is an excellent mentor. He took time to explain complex procedures and was always available for questions." },
    { studentName: "Hassan Tazi", date: "Nov 2023", rating: 4, comment: "Great learning experience. Very knowledgeable and professional." },
    { studentName: "Fatima El Idrissi", date: "Jul 2022", rating: 5, comment: "One of the best tutors I've had. Highly recommend for cardiology rotations." },
  ];

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-lg">{tutor.name.split(' ').slice(1).map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{tutor.name}</h1>
                <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Active</Badge>
              </div>
              <p className="text-muted-foreground mt-1">{tutor.specialty} • {tutor.department}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tutor.currentStudents}/{tutor.maxStudents}</p>
                <p className="text-sm text-muted-foreground">Current Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tutor.totalSupervised}</p>
                <p className="text-sm text-muted-foreground">Total Supervised</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold flex items-center gap-1">
                  {tutor.rating}
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </p>
                <p className="text-sm text-muted-foreground">Rating</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tutor.yearsExperience}</p>
                <p className="text-sm text-muted-foreground">Years Experience</p>
              </div>
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
                <p className="text-muted-foreground leading-relaxed">{tutor.bio}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Students</CardTitle>
                <CardDescription>{tutor.currentStudents} students currently assigned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.university}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24">
                          <Progress value={student.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{student.progress}%</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Until {new Date(student.endDate).toLocaleDateString()}
                        </p>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/hospital/students/${student.id}`)}>View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Reviews</CardTitle>
                <CardDescription>Feedback from past students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{review.studentName}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{tutor.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{tutor.phone}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qualifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tutor.qualifications.map((qual, idx) => (
                    <Badge key={idx} variant="secondary">{qual}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tutor.languages.map((lang, idx) => (
                    <Badge key={idx} variant="outline">{lang}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Load</span>
                    <span className="font-medium">{tutor.currentStudents}/{tutor.maxStudents}</span>
                  </div>
                  <Progress value={(tutor.currentStudents / tutor.maxStudents) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {tutor.maxStudents - tutor.currentStudents} spots available
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Past Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pastStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between text-sm">
                      <span>{student.name}</span>
                      <span className="text-muted-foreground">{student.year}</span>
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
