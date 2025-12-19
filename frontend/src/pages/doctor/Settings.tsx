import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/components/theme-provider";
import { Save, User, Bell, Shield, Palette, Globe, Key, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { userService, UserSettings } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";

export default function DoctorSettings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile State
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    specialization: "",
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Settings State
  const [settings, setSettings] = useState<UserSettings>({
    language: "fr",
    theme: "system",
    email_notifications: true,
    push_notifications: true,
    student_updates: true,
    logbook_alerts: true,
    message_alerts: true,
    evaluation_reminders: true,
    daily_digest: false,
    two_factor_enabled: false,
    session_timeout: "60",
    login_alerts: true,
    timezone: "Africa/Casablanca",
    date_format: "DD/MM/YYYY"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, settingsRes] = await Promise.all([
        userService.getProfile(),
        userService.getSettings()
      ]);

      if (profileRes.success && profileRes.data) {
        const p = profileRes.data;
        setProfile({
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
          phone: p.phone || "",
          specialization: p.profile?.specialization || "",
        });
      }

      if (settingsRes.success && settingsRes.data) {
        setSettings(prev => ({ ...prev, ...settingsRes.data }));
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load settings data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSettings(prev => ({ ...prev, language: lang }));
    changeLanguage(lang);
  };

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";

    if (ua.indexOf("Firefox") > -1) browser = "Firefox";
    else if (ua.indexOf("SamsungBrowser") > -1) browser = "Samsung Internet";
    else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browser = "Opera";
    else if (ua.indexOf("Trident") > -1) browser = "Internet Explorer";
    else if (ua.indexOf("Edge") > -1) browser = "Edge";
    else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Safari";

    if (ua.indexOf("Win") > -1) os = "Windows";
    else if (ua.indexOf("Mac") > -1) os = "MacOS";
    else if (ua.indexOf("Linux") > -1) os = "Linux";
    else if (ua.indexOf("Android") > -1) os = "Android";
    else if (ua.indexOf("like Mac") > -1) os = "iOS";

    return `${browser} on ${os}`;
  };

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      await userService.updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        // Only update specialization if it's editable
        profile: {
          specialization: profile.specialization
        }
      });
      await refreshUser(); // update context
      toast({
        title: t("settings.savedSuccess") || "Saved",
        description: t("settings.savedSuccessDesc") || "Your changes have been saved successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsSave = async (sectionName: string) => {
    try {
      setSaving(true);
      await userService.updateSettings(settings);

      // Update local app state if needed
      if (settings.theme !== theme) setTheme(settings.theme as "light" | "dark" | "system");
      if (settings.language !== currentLanguage) changeLanguage(settings.language);

      toast({
        title: t("settings.savedSuccess") || "Saved",
        description: `${sectionName} ${t("settings.savedSuccessDesc") || "saved successfully"}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update settings"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: t("settings.passwordsDoNotMatch") || "Passwords do not match"
      });
      return;
    }

    try {
      setSaving(true);
      await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: "Success",
        description: t("settings.passwordChanged") || "Password changed successfully"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to change password"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout role="doctor" userName={user?.first_name || "Doctor"}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout role="doctor" userName={`${profile.first_name} ${profile.last_name}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("settings.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
        </div>

        <Tabs defaultValue="account" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="account">{t("settings.account")}</TabsTrigger>
            <TabsTrigger value="notifications">{t("settings.notifications")}</TabsTrigger>
            <TabsTrigger value="security">{t("settings.security")}</TabsTrigger>
            <TabsTrigger value="preferences">{t("settings.preferences")}</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t("settings.accountInfo")}
                </CardTitle>
                <CardDescription>{t("settings.accountInfoDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("settings.firstName") || "First Name"}</Label>
                    <Input
                      value={profile.first_name}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("settings.lastName") || "Last Name"}</Label>
                    <Input
                      value={profile.last_name}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("settings.email")}</Label>
                    <Input
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("settings.phone")}</Label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.specialty")}</Label>
                  <Input
                    value={profile.specialization}
                    onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                  />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">{t("settings.changePassword")}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t("settings.currentPassword")}</Label>
                      <Input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("settings.newPassword")}</Label>
                      <Input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("settings.confirmPassword")}</Label>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={handlePasswordChange} disabled={saving || !passwordData.currentPassword}>
                      {t("settings.updatePassword") || "Update Password"}
                    </Button>
                  </div>
                </div>

                <Button onClick={handleProfileSave} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  {t("common.save")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {t("settings.notificationSettings")}
                </CardTitle>
                <CardDescription>{t("settings.notificationSettingsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <Label>{t("settings.emailNotifications")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.emailNotificationsDesc")}</p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
                  />
                </div>

                <div className="space-y-3 pt-4">
                  <h4 className="font-medium">{t("settings.notificationTypes")}</h4>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label>{t("settings.studentUpdates")}</Label>
                      <p className="text-sm text-muted-foreground">{t("settings.studentUpdatesDesc")}</p>
                    </div>
                    <Switch
                      checked={settings.student_updates}
                      onCheckedChange={(checked) => setSettings({ ...settings, student_updates: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label>{t("settings.logbookEntries")}</Label>
                      <p className="text-sm text-muted-foreground">{t("settings.logbookEntriesDesc")}</p>
                    </div>
                    <Switch
                      checked={settings.logbook_alerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, logbook_alerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label>{t("settings.messages")}</Label>
                      <p className="text-sm text-muted-foreground">{t("settings.messagesDesc")}</p>
                    </div>
                    <Switch
                      checked={settings.message_alerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, message_alerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label>{t("settings.evaluationReminders")}</Label>
                      <p className="text-sm text-muted-foreground">{t("settings.evaluationRemindersDesc")}</p>
                    </div>
                    <Switch
                      checked={settings.evaluation_reminders}
                      onCheckedChange={(checked) => setSettings({ ...settings, evaluation_reminders: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label>{t("settings.dailyDigest")}</Label>
                      <p className="text-sm text-muted-foreground">{t("settings.dailyDigestDesc")}</p>
                    </div>
                    <Switch
                      checked={settings.daily_digest}
                      onCheckedChange={(checked) => setSettings({ ...settings, daily_digest: checked })}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSettingsSave(t("settings.notificationSettingsName"))} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  {t("common.save")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t("settings.securitySettings")}
                </CardTitle>
                <CardDescription>{t("settings.securitySettingsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      {t("settings.twoFactor") || "Two-Factor Authentication"}
                    </Label>
                    <p className="text-sm text-muted-foreground">{t("settings.twoFactorDesc")}</p>
                  </div>
                  <Switch
                    checked={settings.two_factor_enabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, two_factor_enabled: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.sessionTimeout")}</Label>
                  <Select
                    value={settings.session_timeout}
                    onValueChange={(v) => setSettings({ ...settings, session_timeout: v })}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">{t("settings.minutes15")}</SelectItem>
                      <SelectItem value="30">{t("settings.minutes30")}</SelectItem>
                      <SelectItem value="60">{t("settings.hour1")}</SelectItem>
                      <SelectItem value="120">{t("settings.hours2")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <Label>{t("settings.loginAlerts")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.loginAlertsDesc")}</p>
                  </div>
                  <Switch
                    checked={settings.login_alerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, login_alerts: checked })}
                  />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">{t("settings.activeSessions")}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{t("settings.currentSession")}</p>
                        <p className="text-xs text-muted-foreground">
                          {getBrowserInfo()} • {window.location.hostname}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" disabled className="text-green-600 border-green-200 bg-green-50">
                        {t("settings.current") || "Current"}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button onClick={() => handleSettingsSave(t("settings.securitySettingsName"))} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  {t("common.save")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  {t("settings.displayPreferences")}
                </CardTitle>
                <CardDescription>{t("settings.displayPreferencesDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>{t("settings.theme")}</Label>
                  <div className="flex gap-2">
                    {[
                      { value: "light", label: t("settings.light") },
                      { value: "dark", label: t("settings.dark") },
                      { value: "system", label: t("settings.system") },
                    ].map((themeOption) => (
                      <Button
                        key={themeOption.value}
                        variant={settings.theme === themeOption.value ? "default" : "outline"}
                        onClick={() => setSettings({ ...settings, theme: themeOption.value })}
                        className="flex-1"
                      >
                        {themeOption.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {t("settings.language")}
                    </Label>
                    <Select
                      value={currentLanguage}
                      onValueChange={handleLanguageChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("settings.timezone")}</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(v) => setSettings({ ...settings, timezone: v })}
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
                  <Label>{t("settings.dateFormat")}</Label>
                  <Select
                    value={settings.date_format}
                    onValueChange={(v) => setSettings({ ...settings, date_format: v })}
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

                <Button onClick={() => handleSettingsSave(t("settings.preferencesSettings"))} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  {t("common.save")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
