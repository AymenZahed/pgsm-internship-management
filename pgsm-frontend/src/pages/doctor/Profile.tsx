import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, Building2, Stethoscope, Upload, Save, Loader2, GraduationCap, BriefcaseMedical, MapPin, Camera, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";

interface Hospital {
  id: string;
  name: string;
  city?: string;
  address?: string;
}

interface DoctorProfile {
  id: string;
  hospital_id?: string;
  specialization?: string;
  department?: string;
  title?: string;
  license_number?: string;
  years_experience?: number;
  bio?: string;
  max_students?: number;
  is_available?: boolean;
  hospital?: Hospital;
  hospital_name?: string;
  hospital_city?: string;
}

export default function DoctorProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    specialization: '',
    department: '',
    title: '',
    license_number: '',
    years_experience: '',
    bio: '',
    max_students: '',
    is_available: true,
    hospital_name: '',
    hospital_city: '',
  });

  // Helper function to get correct avatar URL
  // Helper function to get correct avatar URL
const getAvatarUrl = (avatarPath: string | null | undefined): string => {
  if (!avatarPath) return '';
  
  // If it's already a full URL, blob URL, or data URL, return as is
  if (avatarPath.startsWith('http') || avatarPath.startsWith('blob:') || avatarPath.startsWith('data:')) {
    return avatarPath;
  }
  
  // Your backend is running on port 5000
  const backendUrl = 'http://localhost:5000';
  
  // If it's a relative path starting with /uploads
  if (avatarPath.startsWith('/uploads')) {
    return `${backendUrl}${avatarPath}`;
  }
  
  // If it's a filename without path, prepend the full URL
  return `${backendUrl}/uploads/avatars/${avatarPath}`;
};

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        const userData = response.data.data;
        const doctorProfile = userData.profile || {};
        
        console.log('Profile data:', userData);
        console.log('Doctor profile:', doctorProfile);
        
        // Extract hospital name - handle different possible structures
        let hospitalName = '';
        let hospitalCity = '';
        
        if (doctorProfile.hospital_name) {
          hospitalName = doctorProfile.hospital_name;
          hospitalCity = doctorProfile.hospital_city || '';
        } else if (doctorProfile.hospital && typeof doctorProfile.hospital === 'object') {
          hospitalName = doctorProfile.hospital.name || '';
          hospitalCity = doctorProfile.hospital.city || '';
        } else if (doctorProfile.hospital && typeof doctorProfile.hospital === 'string') {
          hospitalName = doctorProfile.hospital;
        }
        
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || '',
          specialization: doctorProfile.specialization || '',
          department: doctorProfile.department || '',
          title: doctorProfile.title || '',
          license_number: doctorProfile.license_number || '',
          years_experience: doctorProfile.years_experience?.toString() || '',
          bio: doctorProfile.bio || '',
          max_students: doctorProfile.max_students?.toString() || '5',
          is_available: doctorProfile.is_available ?? true,
          hospital_name: hospitalName,
          hospital_city: hospitalCity,
        });
        
        setProfile(doctorProfile);
        
        // Set preview URL from user avatar
        if (userData.avatar) {
          const avatarUrl = getAvatarUrl(userData.avatar);
          console.log('Setting avatar URL:', avatarUrl);
          setPreviewUrl(avatarUrl);
        } else {
          setPreviewUrl(null);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Profile photo updated successfully');
        
        // Get the new avatar URL from response
        const newAvatarUrl = response.data.data?.avatar;
        console.log('Upload response avatar:', newAvatarUrl);
        
        // Update user context with new avatar
        if (user && newAvatarUrl) {
          const fullAvatarUrl = getAvatarUrl(newAvatarUrl);
          updateUser({
            ...user,
            avatar: fullAvatarUrl
          });
        }
        
        // Reset file selection
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Clean up blob URL
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
        
        // Update preview URL with the new permanent URL
        if (newAvatarUrl) {
          const fullAvatarUrl = getAvatarUrl(newAvatarUrl);
          setPreviewUrl(fullAvatarUrl);
        }
        
        // Fetch updated profile to sync all data
        await fetchProfile();
      } else {
        toast.error(response.data.message || 'Failed to upload photo');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setUploading(true);
      
      const response = await api.delete('/users/avatar');
      
      if (response.data.success) {
        toast.success('Profile photo removed successfully');
        
        // Update user context
        if (user) {
          updateUser({
            ...user,
            avatar: undefined
          });
        }
        
        // Clear preview
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setSelectedFile(null);
        
        // Fetch updated profile
        await fetchProfile();
      } else {
        toast.error(response.data.message || 'Failed to remove photo');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const profileData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        specialization: formData.specialization,
        department: formData.department,
        title: formData.title,
        license_number: formData.license_number,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
        bio: formData.bio,
        max_students: formData.max_students ? parseInt(formData.max_students) : 5,
        is_available: formData.is_available,
      };

      const response = await api.put('/users/profile', profileData);
      
      if (response.data.success) {
        toast.success("Profile updated successfully");
        updateUser({ 
          ...user!, 
          first_name: formData.first_name, 
          last_name: formData.last_name,
          phone: formData.phone
        });
        fetchProfile(); // Refresh the profile data
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getHospitalInfo = () => {
    if (formData.hospital_name && formData.hospital_city) {
      return `${formData.hospital_name}, ${formData.hospital_city}`;
    } else if (formData.hospital_name) {
      return formData.hospital_name;
    } else if (formData.hospital_city) {
      return formData.hospital_city;
    }
    return 'Not specified';
  };

  // Get current avatar URL for display
  const getCurrentAvatarUrl = () => {
    if (previewUrl) return previewUrl;
    if (user?.avatar) return getAvatarUrl(user.avatar);
    return '';
  };

  // Get avatar fallback initials
  const getAvatarFallback = () => {
    const initials = `${formData.first_name?.[0] || ''}${formData.last_name?.[0] || ''}`;
    return initials.toUpperCase() || <User className="w-8 h-8" />;
  };

  const hasAvatar = () => {
    return !!user?.avatar || !!previewUrl;
  };

  if (loading) return <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}><LoadingState message="Loading profile..." /></AppLayout>;
  if (error) return <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}><ErrorState message={error} onRetry={fetchProfile} /></AppLayout>;

  return (
    <AppLayout role="doctor" userName={`${formData.title ? formData.title + ' ' : ''}${formData.first_name} ${formData.last_name}`}>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your professional information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture Card */}
          <Card className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                  <AvatarImage 
                    src={getCurrentAvatarUrl()} 
                    alt={`${formData.first_name} ${formData.last_name}`}
                    className="object-cover"
                    onError={(e) => {
                      // If image fails to load, fallback will show automatically
                      console.error('Failed to load avatar image:', getCurrentAvatarUrl());
                    }}
                  />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getAvatarFallback()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                >
                  <Camera className="w-8 h-8 text-white" />
                </label>
              </div>
              
              <input
                id="avatar-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              
              <div className="text-center">
                <h3 className="font-semibold text-lg">
                  {formData.title ? `${formData.title} ` : ''}{formData.first_name} {formData.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">{formData.specialization || 'Specialist'}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                  <Building2 className="w-3 h-3" />
                  <span>{getHospitalInfo()}</span>
                </div>
                {formData.years_experience && (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                    <GraduationCap className="w-3 h-3" />
                    <span>{formData.years_experience} years experience</span>
                  </div>
                )}
              </div>

              <div className="w-full space-y-2">
                {selectedFile ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate text-muted-foreground">
                        {selectedFile.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setSelectedFile(null);
                          // Reset to current user avatar if exists
                          setPreviewUrl(user?.avatar ? getAvatarUrl(user.avatar) : null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      className="w-full gap-2"
                      onClick={handleUploadPhoto}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4" />
                      Change Photo
                    </Button>
                    {hasAvatar() && (
                      <Button 
                        variant="ghost" 
                        className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleRemovePhoto}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        {uploading ? 'Removing...' : 'Remove Photo'}
                      </Button>
                    )}
                  </>
                )}
              </div>
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
                      <Input 
                        id="firstName" 
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className="pl-10" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="lastName" 
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className="pl-10" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="email" type="email" value={user?.email || ''} disabled className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="pl-10" 
                      />
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
                      <Input 
                        id="specialty" 
                        value={formData.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        className="pl-10" 
                        placeholder="e.g., Pediatrics, Cardiology"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input 
                      id="department" 
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="e.g., Emergency, Surgery"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Professional Title</Label>
                    <div className="relative">
                      <BriefcaseMedical className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="title" 
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="pl-10" 
                        placeholder="e.g., Chief, Senior Consultant"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="experience" 
                        type="number"
                        value={formData.years_experience}
                        onChange={(e) => handleInputChange('years_experience', e.target.value)}
                        className="pl-10" 
                        placeholder="e.g., 15"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license">Medical License Number</Label>
                    <Input 
                      id="license" 
                      value={formData.license_number}
                      onChange={(e) => handleInputChange('license_number', e.target.value)}
                      placeholder="e.g., ML-2020-12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStudents">Max Students (Capacity)</Label>
                    <Input 
                      id="maxStudents" 
                      type="number"
                      value={formData.max_students}
                      onChange={(e) => handleInputChange('max_students', e.target.value)}
                      placeholder="Maximum students you can supervise"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-4">Hospital Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hospital_name">Hospital Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="hospital_name" 
                        value={formData.hospital_name}
                        onChange={(e) => handleInputChange('hospital_name', e.target.value)}
                        className="pl-10" 
                        placeholder="e.g., Hôpital d'Enfants"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospital_city">Hospital City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="hospital_city" 
                        value={formData.hospital_city}
                        onChange={(e) => handleInputChange('hospital_city', e.target.value)}
                        className="pl-10" 
                        placeholder="e.g., Rabat, Casablanca"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability for Internships</Label>
                    <select
                      id="availability"
                      value={formData.is_available.toString()}
                      onChange={(e) => handleInputChange('is_available', e.target.value === 'true')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="true">Available</option>
                      <option value="false">Not Available</option>
                    </select>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-4">Bio</h3>
                <Textarea 
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Write a short bio about your professional background, experience, and mentoring philosophy..."
                  className="resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={fetchProfile} disabled={saving}>
                  Cancel
                </Button>
                <Button variant="hero" className="gap-2" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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