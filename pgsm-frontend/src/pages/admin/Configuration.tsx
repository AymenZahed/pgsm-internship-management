import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Mail, Shield, Globe, Database, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { adminService } from "@/services/admin.service";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { useToast } from "@/hooks/use-toast";

export default function AdminConfiguration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [generalSettings, setGeneralSettings] = useState({
    platformName: "PGSM - Plateforme de Gestion des Stages Médicaux",
    supportEmail: "support@pgsm.ma",
    defaultLanguage: "fr",
    timezone: "Africa/Casablanca",
    maintenanceMode: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: "30",
    maxLoginAttempts: "5",
    passwordMinLength: "8",
    requireEmailVerification: true,
    twoFactorEnabled: false,
  });

  const [internshipSettings, setInternshipSettings] = useState({
    maxApplicationsPerStudent: "5",
    applicationDeadlineDays: "14",
    autoAssignTutor: false,
    requireDocuments: true,
    minAttendanceRate: "80",
  });

  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      const response = await adminService.getConfiguration();
      if (response.success && response.data) {
        const config = response.data;
        if (config.general) {
          setGeneralSettings({
            platformName: config.general.platformName || generalSettings.platformName,
            supportEmail: config.general.supportEmail || generalSettings.supportEmail,
            defaultLanguage: config.general.defaultLanguage || generalSettings.defaultLanguage,
            timezone: config.general.timezone || generalSettings.timezone,
            maintenanceMode: config.general.maintenanceMode === 'true',
          });
        }
        if (config.security) {
          setSecuritySettings({
            sessionTimeout: config.security.sessionTimeout || securitySettings.sessionTimeout,
            maxLoginAttempts: config.security.maxLoginAttempts || securitySettings.maxLoginAttempts,
            passwordMinLength: config.security.passwordMinLength || securitySettings.passwordMinLength,
            requireEmailVerification: config.security.requireEmailVerification !== 'false',
            twoFactorEnabled: config.security.twoFactorEnabled === 'true',
          });
        }
        if (config.internship) {
          setInternshipSettings({
            maxApplicationsPerStudent: config.internship.maxApplicationsPerStudent || internshipSettings.maxApplicationsPerStudent,
            applicationDeadlineDays: config.internship.applicationDeadlineDays || internshipSettings.applicationDeadlineDays,
            autoAssignTutor: config.internship.autoAssignTutor === 'true',
            requireDocuments: config.internship.requireDocuments !== 'false',
            minAttendanceRate: config.internship.minAttendanceRate || internshipSettings.minAttendanceRate,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfiguration(); }, []);

  const handleSave = async (section: string) => {
    try {
      setSaving(true);
      let data = {};
      if (section === 'General') {
        data = { general: { ...generalSettings, maintenanceMode: String(generalSettings.maintenanceMode) } };
      } else if (section === 'Security') {
        data = { security: { ...securitySettings, requireEmailVerification: String(securitySettings.requireEmailVerification), twoFactorEnabled: String(securitySettings.twoFactorEnabled) } };
      } else if (section === 'Internship') {
        data = { internship: { ...internshipSettings, autoAssignTutor: String(internshipSettings.autoAssignTutor), requireDocuments: String(internshipSettings.requireDocuments) } };
      }
      
      const response = await adminService.updateConfiguration(data);
      if (response.success) {
        toast({ title: "Settings Saved", description: `${section} settings have been updated successfully.` });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AppLayout role="admin" userName="Admin"><LoadingState message="Loading configuration..." /></AppLayout>;
  if (error) return <AppLayout role="admin" userName="Admin"><ErrorState message={error} onRetry={fetchConfiguration} /></AppLayout>;

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold text-foreground">System Configuration</h1><p className="text-muted-foreground mt-1">Manage platform settings and preferences</p></div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-xl">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="internships">Internships</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" />General Settings</CardTitle><CardDescription>Basic platform configuration</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Platform Name</Label><Input value={generalSettings.platformName} onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Support Email</Label><Input type="email" value={generalSettings.supportEmail} onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Language</Label>
                    <Select value={generalSettings.defaultLanguage} onValueChange={(v) => setGeneralSettings({ ...generalSettings, defaultLanguage: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fr">Français</SelectItem><SelectItem value="ar">العربية</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={generalSettings.timezone} onValueChange={(v) => setGeneralSettings({ ...generalSettings, timezone: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Africa/Casablanca">Africa/Casablanca (GMT+1)</SelectItem><SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem><SelectItem value="UTC">UTC</SelectItem></SelectContent></Select>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div><Label>Maintenance Mode</Label><p className="text-sm text-muted-foreground">Disable platform access for non-admin users</p></div>
                  <Switch checked={generalSettings.maintenanceMode} onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })} />
                </div>
                <Button onClick={() => handleSave("General")} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Security Settings</CardTitle><CardDescription>Authentication and access control</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Session Timeout (minutes)</Label><Input type="number" value={securitySettings.sessionTimeout} onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Max Login Attempts</Label><Input type="number" value={securitySettings.maxLoginAttempts} onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Minimum Password Length</Label><Input type="number" value={securitySettings.passwordMinLength} onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: e.target.value })} /></div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div><Label>Require Email Verification</Label><p className="text-sm text-muted-foreground">Users must verify email before accessing platform</p></div>
                    <Switch checked={securitySettings.requireEmailVerification} onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, requireEmailVerification: checked })} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div><Label>Two-Factor Authentication</Label><p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p></div>
                    <Switch checked={securitySettings.twoFactorEnabled} onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })} />
                  </div>
                </div>
                <Button onClick={() => handleSave("Security")} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="internships">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Database className="w-5 h-5" />Internship Settings</CardTitle><CardDescription>Configure internship rules and requirements</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Max Applications per Student</Label><Input type="number" value={internshipSettings.maxApplicationsPerStudent} onChange={(e) => setInternshipSettings({ ...internshipSettings, maxApplicationsPerStudent: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Application Deadline (days before start)</Label><Input type="number" value={internshipSettings.applicationDeadlineDays} onChange={(e) => setInternshipSettings({ ...internshipSettings, applicationDeadlineDays: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Minimum Attendance Rate (%)</Label><Input type="number" value={internshipSettings.minAttendanceRate} onChange={(e) => setInternshipSettings({ ...internshipSettings, minAttendanceRate: e.target.value })} /></div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div><Label>Auto-assign Tutor</Label><p className="text-sm text-muted-foreground">Automatically assign available tutors to new interns</p></div>
                    <Switch checked={internshipSettings.autoAssignTutor} onCheckedChange={(checked) => setInternshipSettings({ ...internshipSettings, autoAssignTutor: checked })} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div><Label>Require Documents</Label><p className="text-sm text-muted-foreground">Students must upload required documents with applications</p></div>
                    <Switch checked={internshipSettings.requireDocuments} onCheckedChange={(checked) => setInternshipSettings({ ...internshipSettings, requireDocuments: checked })} />
                  </div>
                </div>
                <Button onClick={() => handleSave("Internship")} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
