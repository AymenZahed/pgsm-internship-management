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
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user.service";

export default function StudentSettings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { user, updateUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [accountSettings, setAccountSettings] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    studentId: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    application_updates: true,
    evaluation_alerts: true,
    message_alerts: true,
    internship_reminders: true,
    daily_digest: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    session_timeout: "30",
    login_alerts: true,
  });

  const [preferences, setPreferences] = useState({
    timezone: "Africa/Casablanca",
    date_format: "DD/MM/YYYY",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const [profileRes, settingsRes] = await Promise.all([
          userService.getProfile(),
          userService.getSettings(),
        ]);

        if (profileRes.success && profileRes.data) {
          const data = profileRes.data;
          setAccountSettings({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            phone: data.phone || "",
            studentId: data.profile?.student_number || "",
          });
        }

        if (settingsRes.success && settingsRes.data) {
          const settings = settingsRes.data;
          setNotificationSettings({
            email_notifications: settings.email_notifications ?? true,
            application_updates: settings.application_updates ?? true,
            evaluation_alerts: settings.evaluation_alerts ?? true,
            message_alerts: settings.message_alerts ?? true,
            internship_reminders: settings.internship_reminders ?? true,
            daily_digest: settings.daily_digest ?? false,
          });
          setSecuritySettings({
            two_factor_enabled: settings.two_factor_enabled ?? false,
            session_timeout: settings.session_timeout || "30",
            login_alerts: settings.login_alerts ?? true,
          });
          setPreferences({
            timezone: settings.timezone || "Africa/Casablanca",
            date_format: settings.date_format || "DD/MM/YYYY",
          });
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast({
          title: t("common.error"),
          description: t("settings.loadError", "Failed to load settings"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast, t]);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await userService.updateProfile({
        first_name: accountSettings.first_name,
        last_name: accountSettings.last_name,
        phone: accountSettings.phone,
      });

      if (response.success) {
        if (user) {
          updateUser({
            ...user,
            first_name: accountSettings.first_name,
            last_name: accountSettings.last_name,
            phone: accountSettings.phone,
          });
        }
        toast({
          title: t("settings.savedSuccess"),
          description: t("settings.accountSavedDesc", "Account settings saved successfully"),
        });
      }
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("settings.saveError", "Failed to save settings"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: t("common.error"),
        description: t("settings.passwordMismatch", "Passwords do not match"),
        variant: "destructive",
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast({
        title: t("common.error"),
        description: t("settings.passwordTooShort", "Password must be at least 6 characters"),
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await userService.changePassword(
        passwords.currentPassword,
        passwords.newPassword
      );

      if (response.success) {
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast({
          title: t("settings.savedSuccess"),
          description: t("settings.passwordChanged", "Password changed successfully"),
        });
      }
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("settings.passwordError", "Failed to change password"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await userService.updateSettings({
        email_notifications: notificationSettings.email_notifications,
        push_notifications: notificationSettings.application_updates,
        ...notificationSettings,
      });

      if (response.success) {
        toast({
          title: t("settings.savedSuccess"),
          description: t("settings.notificationsSavedDesc", "Notification settings saved successfully"),
        });
      }
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("settings.saveError", "Failed to save settings"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await userService.updateSettings(securitySettings);

      if (response.success) {
        toast({
          title: t("settings.savedSuccess"),
          description: t("settings.securitySavedDesc", "Security settings saved successfully"),
        });
      }
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("settings.saveError", "Failed to save settings"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await userService.updateSettings({
        theme,
        language: currentLanguage,
        ...preferences,
      });

      if (response.success) {
        toast({
          title: t("settings.savedSuccess"),
          description: t("settings.preferencesSavedDesc", "Preferences saved successfully"),
        });
      }
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("settings.saveError", "Failed to save settings"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
  };

  if (loading) {
    return (
      <AppLayout role="student" userName={user?.first_name || 'Student'}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="student" userName={user?.first_name || 'Student'}>
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
                <form onSubmit={handleSaveAccount}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("settings.firstName", "First Name")}</Label>
                      <Input
                        value={accountSettings.first_name}
                        onChange={(e) => setAccountSettings({ ...accountSettings, first_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("settings.lastName", "Last Name")}</Label>
                      <Input
                        value={accountSettings.last_name}
                        onChange={(e) => setAccountSettings({ ...accountSettings, last_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>{t("settings.email")}</Label>
                      <Input
                        type="email"
                        value={accountSettings.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("settings.phone")}</Label>
                      <Input
                        value={accountSettings.phone}
                        onChange={(e) => setAccountSettings({ ...accountSettings, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>{t("settings.studentId")}</Label>
                      <Input
                        value={accountSettings.studentId}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="mt-4" disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Save className="w-4 h-4 mr-2" />
                    {t("common.save")}
                  </Button>
                </form>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">{t("settings.changePassword")}</h4>
                  <form onSubmit={handleChangePassword}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>{t("settings.currentPassword")}</Label>
                        <Input 
                          type="password" 
                          placeholder="••••••••"
                          value={passwords.currentPassword}
                          onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("settings.newPassword")}</Label>
                        <Input 
                          type="password" 
                          placeholder="••••••••"
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("settings.confirmPassword")}</Label>
                        <Input 
                          type="password" 
                          placeholder="••••••••"
                          value={passwords.confirmPassword}
                          onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="mt-4" disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {t("settings.updatePassword", "Update Password")}
                    </Button>
                  </form>
                </div>
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
                <form onSubmit={handleSaveNotifications}>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label>{t("settings.emailNotifications")}</Label>
                      <p className="text-sm text-muted-foreground">{t("settings.emailNotificationsDesc")}</p>
                    </div>
                    <Switch
                      checked={notificationSettings.email_notifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, email_notifications: checked })}
                    />
                  </div>

                  <div className="space-y-3 pt-4">
                    <h4 className="font-medium">{t("settings.notificationTypes")}</h4>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <Label>{t("settings.applicationUpdates")}</Label>
                        <p className="text-sm text-muted-foreground">{t("settings.applicationUpdatesDesc")}</p>
                      </div>
                      <Switch
                        checked={notificationSettings.application_updates}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, application_updates: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <Label>{t("settings.evaluationAlerts")}</Label>
                        <p className="text-sm text-muted-foreground">{t("settings.evaluationAlertsDesc")}</p>
                      </div>
                      <Switch
                        checked={notificationSettings.evaluation_alerts}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, evaluation_alerts: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <Label>{t("settings.messages")}</Label>
                        <p className="text-sm text-muted-foreground">{t("settings.messagesDesc")}</p>
                      </div>
                      <Switch
                        checked={notificationSettings.message_alerts}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, message_alerts: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <Label>{t("settings.internshipReminders")}</Label>
                        <p className="text-sm text-muted-foreground">{t("settings.internshipRemindersDesc")}</p>
                      </div>
                      <Switch
                        checked={notificationSettings.internship_reminders}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, internship_reminders: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <Label>{t("settings.dailyDigest")}</Label>
                        <p className="text-sm text-muted-foreground">{t("settings.dailyDigestDesc")}</p>
                      </div>
                      <Switch
                        checked={notificationSettings.daily_digest}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, daily_digest: checked })}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="mt-4" disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Save className="w-4 h-4 mr-2" />
                    {t("common.save")}
                  </Button>
                </form>
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
                <form onSubmit={handleSaveSecurity}>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        {t("settings.twoFactor")}
                      </Label>
                      <p className="text-sm text-muted-foreground">{t("settings.twoFactorDesc")}</p>
                    </div>
                    <Switch
                      checked={securitySettings.two_factor_enabled}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, two_factor_enabled: checked })}
                    />
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label>{t("settings.sessionTimeout")}</Label>
                    <Select 
                      value={securitySettings.session_timeout} 
                      onValueChange={(v) => setSecuritySettings({ ...securitySettings, session_timeout: v })}
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

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mt-4">
                    <div>
                      <Label>{t("settings.loginAlerts")}</Label>
                      <p className="text-sm text-muted-foreground">{t("settings.loginAlertsDesc")}</p>
                    </div>
                    <Switch
                      checked={securitySettings.login_alerts}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, login_alerts: checked })}
                    />
                  </div>

                  <Button type="submit" className="mt-4" disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Save className="w-4 h-4 mr-2" />
                    {t("common.save")}
                  </Button>
                </form>
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
                <form onSubmit={handleSavePreferences}>
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
                          type="button"
                          variant={theme === themeOption.value ? "default" : "outline"}
                          onClick={() => setTheme(themeOption.value as "light" | "dark" | "system")}
                          className="flex-1"
                        >
                          {themeOption.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

                  <div className="space-y-2 mt-4">
                    <Label>{t("settings.dateFormat")}</Label>
                    <Select 
                      value={preferences.date_format} 
                      onValueChange={(v) => setPreferences({ ...preferences, date_format: v })}
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

                  <Button type="submit" className="mt-4" disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Save className="w-4 h-4 mr-2" />
                    {t("common.save")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
