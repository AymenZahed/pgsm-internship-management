import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Mail, Bell, Shield, Globe, Database } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AdminConfiguration() {
  const { toast } = useToast();
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "PGSM - Plateforme de Gestion des Stages Médicaux",
    supportEmail: "support@pgsm.ma",
    defaultLanguage: "fr",
    timezone: "Africa/Casablanca",
    maintenanceMode: false,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.pgsm.ma",
    smtpPort: "587",
    smtpUser: "noreply@pgsm.ma",
    enableNotifications: true,
    welcomeEmailEnabled: true,
    reminderEmailEnabled: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    twoFactorEnabled: false,
    sessionTimeout: "30",
    maxLoginAttempts: "5",
    passwordMinLength: "8",
  });

  const [internshipSettings, setInternshipSettings] = useState({
    maxApplicationsPerStudent: "5",
    applicationDeadlineDays: "14",
    autoAssignTutor: false,
    requireDocuments: true,
    minAttendanceRate: "80",
  });

  const handleSave = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully.`,
    });
  };

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Configuration</h1>
          <p className="text-muted-foreground mt-1">Manage platform settings and preferences</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="internships">Internships</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  General Settings
                </CardTitle>
                <CardDescription>Basic platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Platform Name</Label>
                    <Input
                      value={generalSettings.platformName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Language</Label>
                    <Select 
                      value={generalSettings.defaultLanguage} 
                      onValueChange={(v) => setGeneralSettings({ ...generalSettings, defaultLanguage: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select 
                      value={generalSettings.timezone} 
                      onValueChange={(v) => setGeneralSettings({ ...generalSettings, timezone: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Casablanca">Africa/Casablanca (GMT+1)</SelectItem>
                        <SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Disable platform access for non-admin users</p>
                  </div>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })}
                  />
                </div>

                <Button onClick={() => handleSave("General")}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Settings
                </CardTitle>
                <CardDescription>Configure email notifications and SMTP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMTP Host</Label>
                    <Input
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Port</Label>
                    <Input
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>SMTP User</Label>
                  <Input
                    value={emailSettings.smtpUser}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>Enable Email Notifications</Label>
                    <Switch
                      checked={emailSettings.enableNotifications}
                      onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, enableNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>Welcome Email on Registration</Label>
                    <Switch
                      checked={emailSettings.welcomeEmailEnabled}
                      onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, welcomeEmailEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>Reminder Emails</Label>
                    <Switch
                      checked={emailSettings.reminderEmailEnabled}
                      onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, reminderEmailEnabled: checked })}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave("Email")}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Authentication and access control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Login Attempts</Label>
                    <Input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Password Length</Label>
                  <Input
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label>Require Email Verification</Label>
                      <p className="text-sm text-muted-foreground">Users must verify email before accessing platform</p>
                    </div>
                    <Switch
                      checked={securitySettings.requireEmailVerification}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, requireEmailVerification: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave("Security")}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="internships">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Internship Settings
                </CardTitle>
                <CardDescription>Configure internship rules and requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Applications per Student</Label>
                    <Input
                      type="number"
                      value={internshipSettings.maxApplicationsPerStudent}
                      onChange={(e) => setInternshipSettings({ ...internshipSettings, maxApplicationsPerStudent: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Application Deadline (days before start)</Label>
                    <Input
                      type="number"
                      value={internshipSettings.applicationDeadlineDays}
                      onChange={(e) => setInternshipSettings({ ...internshipSettings, applicationDeadlineDays: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Attendance Rate (%)</Label>
                  <Input
                    type="number"
                    value={internshipSettings.minAttendanceRate}
                    onChange={(e) => setInternshipSettings({ ...internshipSettings, minAttendanceRate: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label>Auto-assign Tutor</Label>
                      <p className="text-sm text-muted-foreground">Automatically assign available tutors to new interns</p>
                    </div>
                    <Switch
                      checked={internshipSettings.autoAssignTutor}
                      onCheckedChange={(checked) => setInternshipSettings({ ...internshipSettings, autoAssignTutor: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label>Require Documents</Label>
                      <p className="text-sm text-muted-foreground">Students must upload required documents with applications</p>
                    </div>
                    <Switch
                      checked={internshipSettings.requireDocuments}
                      onCheckedChange={(checked) => setInternshipSettings({ ...internshipSettings, requireDocuments: checked })}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave("Internship")}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
