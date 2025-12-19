import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
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
  Stethoscope,
  GraduationCap,
  Shield,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
    titleKey: "sidebar.communication",
    items: [
      { labelKey: "nav.messages", path: "/hospital/messages", icon: MessageSquare },
      { labelKey: "nav.notifications", path: "/hospital/notifications", icon: Bell },
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

interface MobileSidebarProps {
  role: "student" | "hospital" | "doctor" | "admin";
  userName: string;
  userAvatar?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ role, userName, userAvatar, open, onOpenChange }: MobileSidebarProps) {
  const location = useLocation();
  const { t } = useTranslation();

  const menu = roleMenus[role] || studentMenu;

  const roleLabels: Record<string, string> = {
    student: t("auth.student"),
    hospital: t("auth.hospital"),
    doctor: t("auth.doctor"),
    admin: t("auth.admin"),
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground flex flex-col h-full">
        <SheetHeader className="p-4 border-b border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <SheetTitle className="font-bold text-lg text-sidebar-accent-foreground text-left">PGSM</SheetTitle>
              <p className="text-xs text-sidebar-foreground/60">{t("sidebar.medicalInternships")}</p>
            </div>
          </div>
        </SheetHeader>

        {/* User Info */}
        <div className="p-4 border-b border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0 overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-sm text-sidebar-accent-foreground truncate">{userName}</p>
              <p className="text-xs text-sidebar-foreground/60">{roleLabels[role]}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-6">
          {menu.map((section) => (
            <div key={section.titleKey}>
              <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-2 px-3">
                {t(section.titleKey)}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const label = t(item.labelKey);
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={() => onOpenChange(false)}
                        className={cn(
                          "sidebar-item",
                          isActive && "sidebar-item-active"
                        )}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-1 flex-shrink-0">
          <NavLink
            to={`/${role}/settings`}
            onClick={() => onOpenChange(false)}
            className="sidebar-item"
          >
            <Settings className="w-5 h-5" />
            <span>{t("nav.settings")}</span>
          </NavLink>
          <NavLink
            to="/login"
            onClick={() => onOpenChange(false)}
            className="sidebar-item text-destructive/80 hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5" />
            <span>{t("auth.logout")}</span>
          </NavLink>
        </div>
      </SheetContent>
    </Sheet>
  );
}
