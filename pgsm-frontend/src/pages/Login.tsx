import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Mail, Lock, Eye, EyeOff, GraduationCap, Building2, User, Shield, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type UserRole = "student" | "doctor" | "hospital" | "admin";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, isAuthenticated, user } = useAuth();
  useLanguage();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}/dashboard`);
    }
  }, [isAuthenticated, user, navigate]);

  const roles = [
    { id: "student" as UserRole, label: t("auth.student"), icon: GraduationCap, description: t("auth.studentDesc") },
    { id: "doctor" as UserRole, label: t("auth.doctor"), icon: User, description: t("auth.doctorDesc") },
    { id: "hospital" as UserRole, label: t("auth.hospital"), icon: Building2, description: t("auth.hospitalDesc") },
    { id: "admin" as UserRole, label: t("auth.admin"), icon: Shield, description: t("auth.adminDesc") },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Check if user role matches selected role
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.role !== selectedRole) {
            // Role mismatch - logout and show error
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setError(`This account is registered as "${userData.role}", not "${selectedRole}". Please select the correct role.`);
            setIsLoading(false);
            return;
          }
        }
        toast.success(t("auth.loginSuccess"));
        // Navigation will happen automatically via useEffect
      } else {
        setError(result.message || t("auth.loginFailed"));
      }
    } catch (err: any) {
      setError(err.message || t("auth.loginFailed"));
    }
    
    setIsLoading(false);
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-sidebar-accent-foreground">PGSM</h1>
              <p className="text-sm text-sidebar-foreground/60">Medical Internship Platform</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-sidebar-accent-foreground leading-tight">
            {t("landing.heroTitle")}
            <br />
            <span className="text-primary">{t("landing.heroTitleHighlight")}</span>
          </h2>
          <p className="text-lg text-sidebar-foreground/70 max-w-md">{t("landing.heroSubtitle")}</p>
          
          <div className="grid grid-cols-2 gap-4 pt-6">
            {[
              t("landing.features.apply"),
              t("landing.features.track"),
              t("landing.features.attendance"),
              t("landing.features.evaluations"),
            ].map((feature, index) => (
              <div key={feature} className="flex items-center gap-2 text-sidebar-foreground/80 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs text-primary">✓</span>
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-sidebar-foreground/50">{t("footer.copyright")}</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">PGSM</h1>
              <p className="text-sm text-muted-foreground">Medical Internships</p>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">{t("auth.welcomeBack")}</h2>
            <p className="text-muted-foreground mt-1">{t("auth.signInSubtitle")}</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-sm font-medium">{t("auth.selectRole")}</Label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200",
                      isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors", isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className={cn("font-medium text-sm", isSelected && "text-primary")}>{role.label}</p>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder={t("auth.email")} 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="pl-10" 
                  required 
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">{t("auth.forgotPassword")}</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder={t("auth.password")} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="pl-10 pr-10" 
                  required 
                  disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t("auth.needHelp")}{" "}
            <Link to="/contact-support" className="text-primary hover:underline">{t("auth.contactSupport")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
