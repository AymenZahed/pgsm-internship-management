import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/components/theme-provider";
import { Save, Building2, Bell, Shield, Palette, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { hospitalService } from "@/services/hospital.service";

export default function HospitalSettings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [accountSettings, setAccountSettings] = useState({
    hospitalName: "",
    email: "",
    phone: "",
    website: "",
  });

  const [loadingAccount, setLoadingAccount] = useState(true);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newApplications: true,
    applicationUpdates: true,
    internshipReminders: true,
    systemAlerts: true,
    weeklyReports: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    showOnPublicListing: true,
    allowDirectContact: true,
    shareStatistics: false,
  });

  const [preferences, setPreferences] = useState({
    language: "fr",
    timezone: "Africa/Casablanca",
    dateFormat: "DD/MM/YYYY",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await hospitalService.getProfile();
        if (res.success && res.data) {
          const data: any = res.data;
          setAccountSettings({
            hospitalName: data.name || "",
            email: data.email || "",
            phone: data.phone || data.user_phone || "",
            website: data.website || "",
          });
        }
      } catch (error) {
        console.error("Failed to load hospital profile", error);
        toast({
          title: "Error",
          description: "Failed to load hospital profile",
          variant: "destructive",
        });
      } finally {
        setLoadingAccount(false);
      }
    };

    loadProfile();
  }, [toast]);

  const handleSave = async (section: string) => {
    if (section === "Account") {
      try {
        const res = await hospitalService.updateProfile({
          name: accountSettings.hospitalName,
          email: accountSettings.email,
          phone: accountSettings.phone,
          website: accountSettings.website,
          contact_phone: accountSettings.phone,
        });

        if (!res.success) {
          throw new Error(res.message || "Failed to update profile");
        }

        toast({
          title: "Settings Saved",
          description: "Account settings have been updated successfully.",
        });
      } catch (error: any) {
        console.error("Failed to save account settings", error);
        toast({
          title: "Error",
          description: error?.response?.data?.message || error.message || "Failed to save account settings",
          variant: "destructive",
        });
      }
      return;
    }

    // Fallback for other sections (still local-only for now)
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully.`,
    });
  };

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your hospital account settings</p>
        </div>

        <Tabs defaultValue="account" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Update your hospital's account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingAccount && (
                  <p className="text-sm text-muted-foreground">Loading account information...</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hospital Name</Label>
                    <Input
                      value={accountSettings.hospitalName}
                      onChange={(e) => setAccountSettings({ ...accountSettings, hospitalName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={accountSettings.email}
                      onChange={(e) => setAccountSettings({ ...accountSettings, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={accountSettings.phone}
                      onChange={(e) => setAccountSettings({ ...accountSettings, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      value={accountSettings.website}
                      onChange={(e) => setAccountSettings({ ...accountSettings, website: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Change Password</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                  </div>
                </div>

                <Button onClick={() => handleSave("Account")}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                  />
                </div>

                <div className="space-y-3 pt-4">
                  <h4 className="font-medium">Notification Types</h4>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>New Applications</Label>
                    <Switch
                      checked={notificationSettings.newApplications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, newApplications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>Application Status Updates</Label>
                    <Switch
                      checked={notificationSettings.applicationUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, applicationUpdates: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>Internship Reminders</Label>
                    <Switch
                      checked={notificationSettings.internshipReminders}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, internshipReminders: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>System Alerts</Label>
                    <Switch
                      checked={notificationSettings.systemAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, systemAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>Weekly Reports</Label>
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, weeklyReports: checked })}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave("Notification")}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>Control your hospital's visibility and data sharing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <Label>Show on Public Listing</Label>
                    <p className="text-sm text-muted-foreground">Display hospital in the public directory</p>
                  </div>
                  <Switch
                    checked={privacySettings.showOnPublicListing}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showOnPublicListing: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <Label>Allow Direct Contact</Label>
                    <p className="text-sm text-muted-foreground">Let students contact you directly</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowDirectContact}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, allowDirectContact: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <Label>Share Statistics</Label>
                    <p className="text-sm text-muted-foreground">Share anonymized statistics with platform</p>
                  </div>
                  <Switch
                    checked={privacySettings.shareStatistics}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, shareStatistics: checked })}
                  />
                </div>

                <Button onClick={() => handleSave("Privacy")}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Display Preferences
                </CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="flex gap-2">
                    {["light", "dark", "system"].map((t) => (
                      <Button
                        key={t}
                        variant={theme === t ? "default" : "outline"}
                        onClick={() => setTheme(t as "light" | "dark" | "system")}
                        className="flex-1"
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Language
                    </Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(v) => setPreferences({ ...preferences, language: v })}
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
                      value={preferences.timezone}
                      onValueChange={(v) => setPreferences({ ...preferences, timezone: v })}
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

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(v) => setPreferences({ ...preferences, dateFormat: v })}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={() => handleSave("Preferences")}>
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
