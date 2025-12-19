import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MapPin, Calendar, Upload, Save, Loader2, Camera, X, GraduationCap, BookOpen, Home } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { DocumentManager } from "@/components/profile/DocumentManager";

interface StudentProfile {
  id: string;
  student_number?: string;
  faculty?: string;
  department?: string;
  academic_year?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  bio?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
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
    student_number: '',
    faculty: '',
    department: '',
    academic_year: '',
    date_of_birth: '',
    address: '',
    city: '',
    emergency_contact: '',
    emergency_phone: '',
    bio: '',
  });

  // Helper function to get correct avatar URL
  const getAvatarUrl = (avatarPath: string | null | undefined): string => {
    if (!avatarPath) return '';

    // If it's already a full URL, blob URL, or data URL, return as is
    if (avatarPath.startsWith('http') || avatarPath.startsWith('blob:') || avatarPath.startsWith('data:')) {
      return avatarPath;
    }

    // For development, prepend the backend URL (localhost:5000)
    // For production, it will work with relative paths
    const isDevelopment = process.env.NODE_ENV === 'development';
    const backendUrl = isDevelopment ? 'http://localhost:5000' : '';

    // If it's a relative path starting with /uploads
    if (avatarPath.startsWith('/uploads')) {
      return backendUrl ? `${backendUrl}${avatarPath}` : avatarPath;
    }

    // If it's a filename without path
    const fullPath = `/uploads/avatars/${avatarPath}`;
    return backendUrl ? `${backendUrl}${fullPath}` : fullPath;
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const userData = response.data.data;
        const studentProfile = userData.profile || {};

        console.log('Student profile data:', userData);

        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || '',
          student_number: studentProfile.student_number || '',
          faculty: studentProfile.faculty || '',
          department: studentProfile.department || '',
          academic_year: studentProfile.academic_year || '',
          date_of_birth: studentProfile.date_of_birth?.split('T')[0] || '',
          address: studentProfile.address || '',
          city: studentProfile.city || '',
          emergency_contact: studentProfile.emergency_contact || '',
          emergency_phone: studentProfile.emergency_phone || '',
          bio: studentProfile.bio || '',
        });

        setProfile(studentProfile);

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
        student_number: formData.student_number,
        faculty: formData.faculty,
        department: formData.department,
        academic_year: formData.academic_year,
        date_of_birth: formData.date_of_birth || null,
        address: formData.address,
        city: formData.city,
        emergency_contact: formData.emergency_contact,
        emergency_phone: formData.emergency_phone,
        bio: formData.bio,
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

  if (loading) return <AppLayout role="student" userName={user?.first_name || 'Student'}><LoadingState message="Loading profile..." /></AppLayout>;
  if (error) return <AppLayout role="student" userName={user?.first_name || 'Student'}><ErrorState message={error} onRetry={fetchProfile} /></AppLayout>;

  return (
    <AppLayout role="student" userName={`${formData.first_name} ${formData.last_name}`}>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal and academic information</p>
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
                  {formData.first_name} {formData.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">{formData.academic_year || 'Student'}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                  <GraduationCap className="w-3 h-3" />
                  <span>{formData.faculty || 'Medical Faculty'}</span>
                </div>
                {formData.student_number && (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                    <BookOpen className="w-3 h-3" />
                    <span>ID: {formData.student_number}</span>
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
                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="birthdate"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="pl-10"
                        placeholder="Full address"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-4">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      value={formData.student_number}
                      onChange={(e) => handleInputChange('student_number', e.target.value)}
                      placeholder="e.g., S2023001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Academic Year</Label>
                    <Input
                      id="year"
                      value={formData.academic_year}
                      onChange={(e) => handleInputChange('academic_year', e.target.value)}
                      placeholder="e.g., 3rd Year"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faculty">Faculty</Label>
                    <Input
                      id="faculty"
                      value={formData.faculty}
                      onChange={(e) => handleInputChange('faculty', e.target.value)}
                      placeholder="e.g., Faculty of Medicine"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="e.g., General Medicine"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergency_contact}
                      onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                      placeholder="e.g., Parent or Guardian"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      value={formData.emergency_phone}
                      onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                      placeholder="e.g., +212 6XXXXXXXX"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-4">Documents</h3>
                <DocumentManager />
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Bio</h3>
                <Textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself, your interests, and career goals..."
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