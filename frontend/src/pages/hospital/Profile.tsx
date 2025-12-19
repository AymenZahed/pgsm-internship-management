import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Building2, MapPin, Phone, Mail, Globe, Clock, Edit, Save, Loader2, Camera, Upload, X, Users, Bed, Calendar, Award, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";

interface HospitalProfileData {
  id: string;
  user_id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  capacity: number;
  opening_hours?: string;
  departments?: string[] | string;
  accreditations?: string[] | string;
  logo?: string;
}

export default function HospitalProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<HospitalProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');
  const [newAccreditation, setNewAccreditation] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    capacity: '',
    opening_hours: '',
    departments: [] as string[],
    accreditations: [] as string[],
  });

  // Helper function to get correct logo URL
  const getLogoUrl = (logoPath: string | null | undefined): string => {
    if (!logoPath) return '';

    // If it's already a full URL, blob URL, or data URL, return as is
    if (logoPath.startsWith('http') || logoPath.startsWith('blob:') || logoPath.startsWith('data:')) {
      return logoPath;
    }

    // For development, prepend the backend URL (localhost:5000)
    // For production, it will work with relative paths
    const isDevelopment = process.env.NODE_ENV === 'development';
    const backendUrl = isDevelopment ? 'http://localhost:5000' : '';

    // If it's a relative path starting with /uploads
    if (logoPath.startsWith('/uploads')) {
      return backendUrl ? `${backendUrl}${logoPath}` : logoPath;
    }

    // If it's a filename without path
    const fullPath = `/uploads/avatars/${logoPath}`;
    return backendUrl ? `${backendUrl}${fullPath}` : fullPath;
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const userData = response.data.data;
        const hospitalProfile = userData.profile || {};

        console.log('Hospital profile data:', userData);

        // Parse departments from JSON
        let departments: string[] = [];
        if (hospitalProfile.departments) {
          try {
            departments = typeof hospitalProfile.departments === 'string'
              ? JSON.parse(hospitalProfile.departments)
              : hospitalProfile.departments;
          } catch (error) {
            console.error('Error parsing departments:', error);
            departments = [];
          }
        }

        // Parse accreditations from JSON
        let accreditations: string[] = [];
        if (hospitalProfile.accreditations) {
          try {
            accreditations = typeof hospitalProfile.accreditations === 'string'
              ? JSON.parse(hospitalProfile.accreditations)
              : hospitalProfile.accreditations;
          } catch (error) {
            console.error('Error parsing accreditations:', error);
            accreditations = [];
          }
        }

        setFormData({
          name: hospitalProfile.name || '',
          type: hospitalProfile.type || '',
          address: hospitalProfile.address || '',
          city: hospitalProfile.city || '',
          postal_code: hospitalProfile.postal_code || '',
          phone: hospitalProfile.phone || '',
          email: hospitalProfile.email || '',
          website: hospitalProfile.website || '',
          description: hospitalProfile.description || '',
          capacity: hospitalProfile.capacity?.toString() || '',
          opening_hours: hospitalProfile.opening_hours || '24/7',
          departments: departments || [],
          accreditations: accreditations || [],
        });

        setProfile(hospitalProfile);

        // Set preview URL from hospital logo (uses avatar field)
        if (userData.avatar) {
          const logoUrl = getLogoUrl(userData.avatar);
          console.log('Setting logo URL:', logoUrl);
          setPreviewUrl(logoUrl);
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

  const handleUploadLogo = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    try {
      setUploading(true);

      const formDataObj = new FormData();
      formDataObj.append('avatar', selectedFile);

      const response = await api.post('/users/avatar', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Hospital logo updated successfully');

        // Get the new logo URL from response
        const newLogoUrl = response.data.data?.avatar;
        console.log('Upload response logo:', newLogoUrl);

        // Update user context with new logo
        if (user && newLogoUrl) {
          const fullLogoUrl = getLogoUrl(newLogoUrl);
          updateUser({
            ...user,
            avatar: fullLogoUrl
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
        if (newLogoUrl) {
          const fullLogoUrl = getLogoUrl(newLogoUrl);
          setPreviewUrl(fullLogoUrl);
        }

        // Fetch updated profile to sync all data
        await fetchProfile();
      } else {
        toast.error(response.data.message || 'Failed to upload logo');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setUploading(true);

      const response = await api.delete('/users/avatar');

      if (response.data.success) {
        toast.success('Hospital logo removed successfully');

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
        toast.error(response.data.message || 'Failed to remove logo');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // FIXED: Include first_name and last_name for users table
      const profileData = {
        first_name: formData.name,
        last_name: 'Hospital', // Required field for users table
        name: formData.name,
        type: formData.type,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        description: formData.description,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        opening_hours: formData.opening_hours,
        departments: formData.departments.length > 0 ? JSON.stringify(formData.departments) : null,
        accreditations: formData.accreditations.length > 0 ? JSON.stringify(formData.accreditations) : null,
      };

      const response = await api.put('/hospitals/profile', profileData);

      if (response.data.success) {
        toast.success("Hospital profile updated successfully");
        updateUser({
          ...user!,
          first_name: formData.name,
          last_name: 'Hospital',
          phone: formData.phone
        });
        setIsEditing(false);
        fetchProfile(); // Refresh the profile data
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddDepartment = () => {
    if (newDepartment.trim()) {
      const newDepartments = [...formData.departments, newDepartment.trim()];
      handleInputChange('departments', newDepartments);
      setNewDepartment('');
    }
  };

  const handleRemoveDepartment = (index: number) => {
    const newDepartments = [...formData.departments];
    newDepartments.splice(index, 1);
    handleInputChange('departments', newDepartments);
  };

  const handleAddAccreditation = () => {
    if (newAccreditation.trim()) {
      const newAccreditations = [...formData.accreditations, newAccreditation.trim()];
      handleInputChange('accreditations', newAccreditations);
      setNewAccreditation('');
    }
  };

  const handleRemoveAccreditation = (index: number) => {
    const newAccreditations = [...formData.accreditations];
    newAccreditations.splice(index, 1);
    handleInputChange('accreditations', newAccreditations);
  };

  // Get current logo URL for display
  const getCurrentLogoUrl = () => {
    if (previewUrl) return previewUrl;
    if (user?.avatar) return getLogoUrl(user.avatar);
    return '';
  };

  // Get logo fallback initials
  const getLogoFallback = () => {
    return formData.name.substring(0, 2).toUpperCase();
  };

  const hasLogo = () => {
    return !!user?.avatar || !!previewUrl;
  };

  if (loading) return <AppLayout role="hospital" userName={user?.first_name || 'Hospital'}><LoadingState message="Loading hospital profile..." /></AppLayout>;
  if (error) return <AppLayout role="hospital" userName={user?.first_name || 'Hospital'}><ErrorState message={error} onRetry={fetchProfile} /></AppLayout>;

  return (
    <AppLayout role="hospital" userName={formData.name || 'Hospital'}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Hospital Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your hospital information</p>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  fetchProfile(); // Reload original data
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hospital Logo & Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Hospital Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                    <AvatarImage
                      src={getCurrentLogoUrl()}
                      alt={formData.name}
                      className="object-cover"
                      onError={(e) => {
                        console.error('Failed to load logo image:', getCurrentLogoUrl());
                      }}
                    />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getLogoFallback()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="logo-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </label>
                </div>

                <input
                  id="logo-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

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
                            setPreviewUrl(user?.avatar ? getLogoUrl(user.avatar) : null);
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
                        onClick={handleUploadLogo}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {uploading ? 'Uploading...' : 'Upload Logo'}
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
                        Change Logo
                      </Button>
                      {hasLogo() && (
                        <Button
                          variant="ghost"
                          className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={handleRemoveLogo}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          {uploading ? 'Removing...' : 'Remove Logo'}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Bed className="w-4 h-4" />
                    Bed Capacity
                  </span>
                  <span className="font-bold text-xl">{formData.capacity || '0'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Departments
                  </span>
                  <span className="font-bold text-xl">{formData.departments.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Accreditations
                  </span>
                  <span className="font-bold text-xl">{formData.accreditations.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Information */}
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
                  <Label>Hospital Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted/50" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hospital Type *</Label>
                  <Input
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted/50" : ""}
                    placeholder="e.g., University Hospital, Private Clinic"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={!isEditing}
                  className={`${!isEditing ? "bg-muted/50" : ""} min-h-[100px]`}
                  placeholder="Describe your hospital, services, and specialties..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address *
                  </Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted/50" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted/50" : ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    value={formData.postal_code}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted/50" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone *
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted/50" : ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email *
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted/50" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website
                  </Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted/50" : ""}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Opening Hours
                  </Label>
                  <Input
                    value={formData.opening_hours}
                    onChange={(e) => handleInputChange('opening_hours', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted/50" : ""}
                    placeholder="e.g., 24/7, Mon-Fri 8:00-18:00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bed Capacity *</Label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted/50" : ""}
                    placeholder="Number of beds"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Departments & Accreditations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Departments & Services</CardTitle>
                  <CardDescription>Available medical departments for internships</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.departments.map((dept, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {dept}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveDepartment(index)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {formData.departments.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No departments added yet</p>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a department (e.g., Cardiology, Emergency)"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newDepartment.trim()) {
                        e.preventDefault();
                        handleAddDepartment();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddDepartment}
                    disabled={!newDepartment.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Accreditations</CardTitle>
                  <CardDescription>Hospital certifications and accreditations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.accreditations.map((acc, index) => (
                  <Badge key={index} variant="secondary">
                    {acc}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveAccreditation(index)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {formData.accreditations.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No accreditations added yet</p>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an accreditation (e.g., JCI Accredited, ISO 9001)"
                    value={newAccreditation}
                    onChange={(e) => setNewAccreditation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newAccreditation.trim()) {
                        e.preventDefault();
                        handleAddAccreditation();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddAccreditation}
                    disabled={!newAccreditation.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}