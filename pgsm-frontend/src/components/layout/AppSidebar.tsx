import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import {
  LayoutDashboard,
  User,
  Search,
  FileText,
  ClipboardList,
  BookOpen,
  CalendarCheck,
  Star,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Building2,
  Users,
  Briefcase,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  GraduationCap,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MenuItem {
  labelKey: string;
  path: string;
  icon: React.ElementType;
}

interface MenuSection {
  titleKey: string;
  items: MenuItem[];
}

const studentMenu: MenuSection[] = [
  {
    titleKey: "sidebar.main",
    items: [
      { labelKey: "nav.dashboard", path: "/student/dashboard", icon: LayoutDashboard },
      { labelKey: "nav.profile", path: "/student/profile", icon: User },
    ],
  },
  {
    titleKey: "sidebar.internships",
    items: [
      { labelKey: "sidebar.browseInternships", path: "/student/internships", icon: Search },
      { labelKey: "sidebar.myApplications", path: "/student/applications", icon: FileText },
      { labelKey: "nav.myInternships", path: "/student/my-internships", icon: ClipboardList },
    ],
  },
  {
    titleKey: "sidebar.activity",
    items: [
      { labelKey: "nav.logbook", path: "/student/logbook", icon: BookOpen },
      { labelKey: "nav.attendance", path: "/student/attendance", icon: CalendarCheck },
      { labelKey: "nav.evaluations", path: "/student/evaluations", icon: Star },
    ],
  },
  {
    titleKey: "sidebar.communication",
    items: [
      { labelKey: "nav.messages", path: "/student/messages", icon: MessageSquare },
      { labelKey: "nav.notifications", path: "/student/notifications", icon: Bell },
    ],
  },
];

const hospitalMenu: MenuSection[] = [
  {
    titleKey: "sidebar.main",
    items: [
      { labelKey: "nav.dashboard", path: "/hospital/dashboard", icon: LayoutDashboard },
      { labelKey: "nav.profile", path: "/hospital/profile", icon: Building2 },
    ],
  },
  {
    titleKey: "sidebar.management",
    items: [
      { labelKey: "nav.services", path: "/hospital/services", icon: Briefcase },
      { labelKey: "sidebar.internshipOffers", path: "/hospital/offers", icon: FileText },
      { labelKey: "nav.applications", path: "/hospital/applications", icon: ClipboardList },
      { labelKey: "sidebar.currentStudents", path: "/hospital/students", icon: Users },
      { labelKey: "nav.tutors", path: "/hospital/tutors", icon: Stethoscope },
    ],
  },
  {
    titleKey: "sidebar.analytics",
    items: [
      { labelKey: "nav.statistics", path: "/hospital/statistics", icon: BarChart3 },
    ],
  },
];

const doctorMenu: MenuSection[] = [
  {
    titleKey: "sidebar.main",
    items: [
      { labelKey: "nav.dashboard", path: "/doctor/dashboard", icon: LayoutDashboard },
      { labelKey: "nav.profile", path: "/doctor/profile", icon: User },
    ],
  },
  {
    titleKey: "sidebar.supervision",
    items: [
      { labelKey: "sidebar.myStudents", path: "/doctor/students", icon: GraduationCap },
      { labelKey: "nav.attendance", path: "/doctor/attendance", icon: CalendarCheck },
      { labelKey: "sidebar.logbookReview", path: "/doctor/logbook", icon: BookOpen },
      { labelKey: "nav.evaluations", path: "/doctor/evaluations", icon: Star },
    ],
  },
  {
    titleKey: "sidebar.communication",
    items: [
      { labelKey: "nav.messages", path: "/doctor/messages", icon: MessageSquare },
    ],
  },
];

const adminMenu: MenuSection[] = [
  {
    titleKey: "sidebar.main",
    items: [
      { labelKey: "nav.dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    titleKey: "sidebar.userManagement",
    items: [
      { labelKey: "sidebar.allUsers", path: "/admin/users", icon: Users },
      { labelKey: "nav.students", path: "/admin/students", icon: GraduationCap },
      { labelKey: "nav.hospitals", path: "/admin/hospitals", icon: Building2 },
    ],
  },
  {
    titleKey: "sidebar.platform",
    items: [
      { labelKey: "sidebar.internshipsOverview", path: "/admin/internships", icon: Briefcase },
      { labelKey: "nav.statistics", path: "/admin/statistics", icon: BarChart3 },
      { labelKey: "nav.reports", path: "/admin/reports", icon: FileText },
      { labelKey: "nav.configuration", path: "/admin/configuration", icon: Settings },
    ],
  },
  {
    titleKey: "sidebar.system",
    items: [
      { labelKey: "nav.logs", path: "/admin/logs", icon: Shield },
      { labelKey: "nav.support", path: "/admin/support", icon: MessageSquare },
    ],
  },
];

const roleMenus: Record<string, MenuSection[]> = {
  student: studentMenu,
  hospital: hospitalMenu,
  doctor: doctorMenu,
  admin: adminMenu,
};

interface AppSidebarProps {
  role: "student" | "hospital" | "doctor" | "admin";
  userName: string;
  userAvatar?: string;
}

export function AppSidebar({ role, userName, userAvatar }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  useLanguage(); // Initialize RTL support
  
  const menu = roleMenus[role] || studentMenu;

  const roleLabels: Record<string, string> = {
    student: t("auth.student"),
    hospital: t("auth.hospital"),
    doctor: t("auth.doctor"),
    admin: t("auth.admin"),
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-sidebar text-sidebar-foreground h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-lg text-sidebar-accent-foreground">PGSM</h1>
              <p className="text-xs text-sidebar-foreground/60">{t("sidebar.medicalInternships")}</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0 overflow-hidden">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <p className="font-medium text-sm text-sidebar-accent-foreground truncate">{userName}</p>
              <p className="text-xs text-sidebar-foreground/60">{roleLabels[role]}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {menu.map((section) => (
          <div key={section.titleKey}>
            {!collapsed && (
              <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-2 px-3">
                {t(section.titleKey)}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                const label = t(item.labelKey);
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={cn(
                        "sidebar-item",
                        isActive && "sidebar-item-active",
                        collapsed && "justify-center px-0"
                      )}
                      title={collapsed ? label : undefined}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <NavLink
          to={`/${role}/settings`}
          className={cn("sidebar-item", collapsed && "justify-center px-0")}
          title={collapsed ? t("nav.settings") : undefined}
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span>{t("nav.settings")}</span>}
        </NavLink>
        <NavLink
          to="/login"
          className={cn("sidebar-item text-destructive/80 hover:text-destructive hover:bg-destructive/10", collapsed && "justify-center px-0")}
          title={collapsed ? t("auth.logout") : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>{t("auth.logout")}</span>}
        </NavLink>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-sm hover:bg-muted"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </Button>
    </aside>
  );
}
