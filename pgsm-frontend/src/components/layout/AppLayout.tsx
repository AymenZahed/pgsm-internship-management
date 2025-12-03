import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface AppLayoutProps {
  children: ReactNode;
  role: "student" | "hospital" | "doctor" | "admin";
  userName: string;
  userAvatar?: string;
}

export function AppLayout({ children, role, userName, userAvatar }: AppLayoutProps) {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  
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
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("common.search") + "..."}
                className="pl-10 bg-muted/50 border-transparent focus:border-border h-9 lg:h-10 text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-1 lg:gap-2">
            <Button variant="ghost" size="icon" className="relative h-9 w-9 lg:h-10 lg:w-10">
              <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
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
