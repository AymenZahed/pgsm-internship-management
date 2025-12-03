import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, Building2, Stethoscope, Upload, Save, GraduationCap } from "lucide-react";

export default function DoctorProfile() {
  return (
    <AppLayout role="doctor" userName="Dr. Hassan Alami">
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your professional information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture Card */}
          <Card className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src="/avatars/doctor.jpg" />
                <AvatarFallback className="text-2xl">HA</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Dr. Hassan Alami</h3>
                <p className="text-sm text-muted-foreground">Pediatrics Specialist</p>
                <p className="text-xs text-muted-foreground mt-1">Hôpital d'Enfants, Rabat</p>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Upload className="w-4 h-4" />
                Change Photo
              </Button>
            </div>
          </Card>

          {/* Profile Information */}
          <Card className="lg:col-span-2 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="firstName" defaultValue="Hassan" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="lastName" defaultValue="Alami" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="email" type="email" defaultValue="h.alami@hopital-enfants.ma" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="phone" defaultValue="+212 6 98 76 54 32" className="pl-10" />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-4">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="specialty" defaultValue="Pediatrics" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospital">Hospital</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="hospital" defaultValue="Hôpital d'Enfants" className="pl-10" disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="experience" defaultValue="15 years" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license">Medical License Number</Label>
                    <Input id="license" defaultValue="ML-2010-4532" disabled />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-4">Bio</h3>
                <Textarea 
                  rows={4}
                  defaultValue="Experienced pediatrician with over 15 years of practice. Passionate about medical education and mentoring the next generation of physicians."
                  placeholder="Write a short bio about yourself..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button variant="hero" className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
