import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stethoscope, Mail, User, ArrowLeft, Send, Phone, MapPin, Clock, CheckCircle, MessageSquare, HelpCircle, Bug, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";

export default function ContactSupport() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  useLanguage();

  const categories = [
    { value: "general", labelKey: "contactSupport.categories.general", icon: HelpCircle },
    { value: "account", labelKey: "contactSupport.categories.account", icon: User },
    { value: "technical", labelKey: "contactSupport.categories.technical", icon: Bug },
    { value: "internship", labelKey: "contactSupport.categories.internship", icon: MessageSquare },
    { value: "other", labelKey: "contactSupport.categories.other", icon: Settings },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.message) {
      toast({
        title: t("common.error") || "Erreur",
        description: t("contactSupport.fillAllFields") || "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitted(true);
    setIsLoading(false);
    
    toast({
      title: t("contactSupport.messageSent") || "Message envoyé",
      description: t("contactSupport.teamWillRespond") || "Notre équipe vous répondra rapidement.",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sidebar via-sidebar to-primary/20 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-sidebar-accent-foreground">PGSM</h1>
              <p className="text-sm text-sidebar-foreground/60">{t("sidebar.medicalInternships")}</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-sidebar-accent-foreground leading-tight">
              {t("contactSupport.needHelp")}
              <br />
              <span className="text-primary">{t("contactSupport.contactUs")}</span>
            </h2>
            <p className="text-lg text-sidebar-foreground/70 max-w-md">{t("contactSupport.teamHelp")}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sidebar-foreground/80">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-sidebar-foreground/60">{t("common.email")}</p>
                <p className="font-medium">support@pgsm.ma</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sidebar-foreground/80">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-sidebar-foreground/60">{t("common.phone")}</p>
                <p className="font-medium">+212 5 22 00 00 00</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sidebar-foreground/80">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-sidebar-foreground/60">{t("common.address")}</p>
                <p className="font-medium">Faculté de Médecine, Casablanca</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sidebar-foreground/80">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-sidebar-foreground/60">{t("contactSupport.hours")}</p>
                <p className="font-medium">Lun - Ven: 8h - 18h</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-sidebar-foreground/50">{t("footer.copyright")}</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">PGSM</h1>
              <p className="text-sm text-muted-foreground">{t("sidebar.medicalInternships")}</p>
            </div>
          </div>

          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t("forgotPassword.backToLogin")}
          </Link>

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="space-y-1 px-0 lg:px-6">
              <CardTitle className="text-2xl">{t("contactSupport.title")}</CardTitle>
              <CardDescription>{t("contactSupport.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="px-0 lg:px-6">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("contactSupport.fullName")} *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder={t("contactSupport.namePlaceholder")}
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("common.email")} *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("contactSupport.emailPlaceholder")}
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">{t("contactSupport.category")} *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("contactSupport.selectCategory")} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <cat.icon className="w-4 h-4" />
                              {t(cat.labelKey)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t("contactSupport.subject")} *</Label>
                    <Input
                      id="subject"
                      placeholder={t("contactSupport.subjectPlaceholder")}
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t("contactSupport.message")} *</Label>
                    <Textarea
                      id="message"
                      placeholder={t("contactSupport.messagePlaceholder")}
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className="min-h-[120px] resize-none"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      t("contactSupport.sending")
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t("contactSupport.sendMessage")}
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4 py-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{t("contactSupport.successTitle")}</h3>
                    <p className="text-muted-foreground text-sm">
                      {t("contactSupport.successMessage")} <strong>{formData.email}</strong> {t("contactSupport.successMessage2")}
                    </p>
                  </div>
                  <div className="pt-4 space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ name: "", email: "", category: "", subject: "", message: "" });
                      }}
                    >
                      {t("contactSupport.sendAnother")}
                    </Button>
                    <Link to="/login">
                      <Button variant="ghost" className="w-full">{t("contactSupport.backToLogin")}</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:hidden space-y-3 pt-4 border-t">
            <p className="text-sm font-medium text-center">{t("contactSupport.otherContact")}</p>
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                support@pgsm.ma
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                +212 5 22 00 00 00
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
