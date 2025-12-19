import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: t("common.error") || "Erreur",
        description: t("forgotPassword.emailRequired") || "Veuillez entrer votre adresse email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Import dynamically or assume it's available via import at top if I added it?
      // Wait, need to add import at top first? I can't easily add import with replace_file_content unless I target top.
      // But replace_file_content chunk is local.
      // I will assume authService import is needed.
      // Actually, I should use the 'import { authService } from "@/services/auth.service";'
      // I'll add the import first in a separate call or just use `import` here? No.
      // I will REPLACE the whole file or just use logic. The user has `use-toast` etc.
      // I will assume `authService` is NOT imported yet.
      // I will do 2 chunks? multireplace?
      // I'll just change the handle submit. And then separate tool to add import.

      const { authService } = await import("@/services/auth.service");
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      toast({
        title: t("forgotPassword.emailSent") || "Email envoyé",
        description: t("forgotPassword.checkInbox") || "Vérifiez votre boîte de réception.",
      });
    } catch (err: any) {
      toast({
        title: t("common.error"),
        description: err.message || "Failed to reset password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
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

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-sidebar-accent-foreground leading-tight">
            {t("forgotPassword.resetYour")}
            <br />
            <span className="text-primary">{t("forgotPassword.passwordText")}</span>
          </h2>
          <p className="text-lg text-sidebar-foreground/70 max-w-md">{t("forgotPassword.dontPanic")}</p>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-sidebar-foreground/50">{t("footer.copyright")}</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
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
              <CardTitle className="text-2xl">{t("forgotPassword.title")}</CardTitle>
              <CardDescription>{t("forgotPassword.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="px-0 lg:px-6">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("forgotPassword.emailLabel")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("forgotPassword.emailPlaceholder")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("forgotPassword.sending") : t("forgotPassword.sendLink")}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{t("forgotPassword.successTitle")}</h3>
                    <p className="text-muted-foreground text-sm">
                      {t("forgotPassword.successMessage")} <strong>{email}</strong>{t("forgotPassword.successMessage2")}
                    </p>
                  </div>
                  <div className="pt-4 space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsSubmitted(false);
                        setEmail("");
                      }}
                    >
                      {t("forgotPassword.tryAnotherEmail")}
                    </Button>
                    <Link to="/login">
                      <Button variant="ghost" className="w-full">{t("forgotPassword.backToLogin")}</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            {t("auth.needHelp")}{" "}
            <Link to="/contact-support" className="text-primary hover:underline">{t("auth.contactSupport")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
