import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Bell, Search, Menu, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppLayoutProps {
  children: ReactNode;
  role: "student" | "hospital" | "doctor" | "admin";
  userName?: string;
  userAvatar?: string;
}

export function AppLayout({ children, role, userName: propUserName, userAvatar }: AppLayoutProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const userName = propUserName || (user ? `${user.first_name} ${user.last_name}` : "User");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNotificationClick = () => {
    navigate(`/${role}/notifications`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or filter current page
      console.log('Search:', searchQuery);
    }
  };
  
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <AppSidebar role={role} userName={userName} userAvatar={userAvatar} />
      </div>
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        role={role} 
        userName={userName} 
        userAvatar={userAvatar}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-10 h-14 lg:h-16 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-6 flex items-center justify-between gap-2 lg:gap-4">
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden flex-shrink-0"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("common.search", "Search") + "..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-transparent focus:border-border h-9 lg:h-10 text-sm"
              />
            </div>
          </form>
          
          <div className="flex items-center gap-1 lg:gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-9 w-9 lg:h-10 lg:w-10"
              onClick={handleNotificationClick}
            >
              <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("auth.logout", "Logout")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("auth.confirmLogout", "Confirm Logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
