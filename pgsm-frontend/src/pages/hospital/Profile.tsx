import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Mail, Globe, Clock, Edit, Save } from "lucide-react";
import { useState } from "react";

export default function HospitalProfile() {
  const [isEditing, setIsEditing] = useState(false);

  const hospitalData = {
    name: "Centre Hospitalier Universitaire Ibn Sina",
    type: "University Hospital",
    address: "Rue Lamfadel Cherkaoui, Rabat 10000",
    phone: "+212 537 67 64 64",
    email: "contact@chuibnisina.ma",
    website: "www.chuibnisina.ma",
    description: "Le CHU Ibn Sina est l'un des plus grands centres hospitaliers universitaires du Maroc, offrant des soins de haute qualité et une formation médicale d'excellence.",
    openingHours: "24/7",
    departments: ["Cardiology", "Neurology", "Pediatrics", "Surgery", "Internal Medicine", "Emergency", "Radiology", "Oncology"],
    accreditations: ["JCI Accredited", "ISO 9001:2015", "Ministry of Health Certified"],
    capacity: {
      beds: 1050,
      staff: 3200,
      departments: 42
    }
  };

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Hospital Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your hospital information</p>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hospital Name</Label>
                  <Input 
                    value={hospitalData.name} 
                    disabled={!isEditing}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input 
                    value={hospitalData.type} 
                    disabled={!isEditing}
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={hospitalData.description} 
                  disabled={!isEditing}
                  className="bg-muted/50 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Input 
                    value={hospitalData.address} 
                    disabled={!isEditing}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </Label>
                  <Input 
                    value={hospitalData.phone} 
                    disabled={!isEditing}
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input 
                    value={hospitalData.email} 
                    disabled={!isEditing}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website
                  </Label>
                  <Input 
                    value={hospitalData.website} 
                    disabled={!isEditing}
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Opening Hours
                </Label>
                <Input 
                  value={hospitalData.openingHours} 
                  disabled={!isEditing}
                  className="bg-muted/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Capacity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Beds</span>
                  <span className="font-bold text-xl">{hospitalData.capacity.beds}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Staff</span>
                  <span className="font-bold text-xl">{hospitalData.capacity.staff}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Departments</span>
                  <span className="font-bold text-xl">{hospitalData.capacity.departments}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accreditations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {hospitalData.accreditations.map((acc) => (
                    <Badge key={acc} variant="secondary">{acc}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Departments */}
        <Card>
          <CardHeader>
            <CardTitle>Departments & Services</CardTitle>
            <CardDescription>Available medical departments for internships</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {hospitalData.departments.map((dept) => (
                <Badge key={dept} variant="outline" className="px-3 py-1">
                  {dept}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
