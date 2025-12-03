import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/components/theme-provider";
import { Save, User, Bell, Shield, Palette, Globe, Key } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";

export default function StudentSettings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  
  const [accountSettings, setAccountSettings] = useState({
    name: "Ahmed Benali",
    email: "ahmed.benali@fmp.ac.ma",
    phone: "+212 6 12 34 56 78",
    studentId: "ETU-2024-001",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    applicationUpdates: true,
    evaluationAlerts: true,
    messageAlerts: true,
    internshipReminders: true,
    dailyDigest: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: "30",
    loginAlerts: true,
  });

  const [preferences, setPreferences] = useState({
    timezone: "Africa/Casablanca",
    dateFormat: "DD/MM/YYYY",
  });

  const handleSave = (section: string) => {
    toast({
      title: t("settings.savedSuccess"),
      description: `${section} ${t("settings.savedSuccessDesc")}`,
    });
  };

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
  };

  return (
    <AppLayout role="student" userName="Ahmed Benali">
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
                    <Label>{t("settings.fullName")}</Label>
                    <Input
                      value={accountSettings.name}
                      onChange={(e) => setAccountSettings({ ...accountSettings, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("settings.email")}</Label>
                    <Input
                      type="email"
                      value={accountSettings.email}
                      onChange={(e) => setAccountSettings({ ...accountSettings, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("settings.phone")}</Label>
                    <Input
                      value={accountSettings.phone}
                      onChange={(e) => setAccountSettings({ ...accountSettings, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("settings.studentId")}</Label>
                    <Input
                      value={accountSettings.studentId}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">{t("settings.changePassword")}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t("settings.currentPassword")}</Label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("settings.newPassword")}</Label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("settings.confirmPassword")}</Label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                  </div>
                </div>

                <Button onClick={() => handleSave(t("settings.accountSettings"))}>
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
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
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
                      checked={notificationSettings.applicationUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, applicationUpdates: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label>{t("settings.evaluationAlerts")}</Label>
                      <p className="text-sm text-muted-foreground">{t("settings.evaluationAlertsDesc")}</p>
                    </div>
                    <Switch
                      checked={notificationSettings.evaluationAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, evaluationAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label>{t("settings.messages")}</Label>
                      <p className="text-sm text-muted-foreground">{t("settings.messagesDesc")}</p>
                    </div>
                    <Switch
                      checked={notificationSettings.messageAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, messageAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label>{t("settings.internshipReminders")}</Label>
                      <p className="text-sm text-muted-foreground">{t("settings.internshipRemindersDesc")}</p>
                    </div>
                    <Switch
                      checked={notificationSettings.internshipReminders}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, internshipReminders: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label>{t("settings.dailyDigest")}</Label>
                      <p className="text-sm text-muted-foreground">{t("settings.dailyDigestDesc")}</p>
                    </div>
                    <Switch
                      checked={notificationSettings.dailyDigest}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, dailyDigest: checked })}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave(t("settings.notificationSettingsName"))}>
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
                      {t("settings.twoFactor")}
                    </Label>
                    <p className="text-sm text-muted-foreground">{t("settings.twoFactorDesc")}</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.sessionTimeout")}</Label>
                  <Select 
                    value={securitySettings.sessionTimeout} 
                    onValueChange={(v) => setSecuritySettings({ ...securitySettings, sessionTimeout: v })}
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
                    checked={securitySettings.loginAlerts}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, loginAlerts: checked })}
                  />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">{t("settings.activeSessions")}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{t("settings.currentSession")}</p>
                        <p className="text-xs text-muted-foreground">Chrome sur Windows • 192.168.1.100</p>
                      </div>
                      <Button variant="outline" size="sm" disabled>{t("settings.current")}</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{t("settings.mobileApp")}</p>
                        <p className="text-xs text-muted-foreground">Android • {t("settings.lastActive")} 3h</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-destructive">{t("settings.revoke")}</Button>
                    </div>
                  </div>
                </div>

                <Button onClick={() => handleSave(t("settings.securitySettingsName"))}>
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
                        variant={theme === themeOption.value ? "default" : "outline"}
                        onClick={() => setTheme(themeOption.value as "light" | "dark" | "system")}
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
                  <Label>{t("settings.dateFormat")}</Label>
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

                <Button onClick={() => handleSave(t("settings.preferencesSettings"))}>
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
