import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, Trash2, FileText, Calendar, MessageCircle, AlertCircle } from "lucide-react";

const notifications = [
  {
    id: "1",
    type: "evaluation",
    icon: FileText,
    title: "New Evaluation Received",
    message: "Dr. Hassan Alami has submitted your mid-term evaluation",
    time: "2 hours ago",
    isRead: false,
    priority: "high" as const,
  },
  {
    id: "2",
    type: "attendance",
    icon: Calendar,
    title: "Attendance Confirmed",
    message: "Your attendance for today has been marked",
    time: "5 hours ago",
    isRead: false,
    priority: "normal" as const,
  },
  {
    id: "3",
    type: "message",
    icon: MessageCircle,
    title: "New Message",
    message: "Dr. Hassan Alami sent you a message",
    time: "1 day ago",
    isRead: true,
    priority: "normal" as const,
  },
  {
    id: "4",
    type: "deadline",
    icon: AlertCircle,
    title: "Application Deadline",
    message: "Cardiology internship application closes in 3 days",
    time: "1 day ago",
    isRead: true,
    priority: "high" as const,
  },
  {
    id: "5",
    type: "logbook",
    icon: FileText,
    title: "Logbook Entry Approved",
    message: "Your logbook entry for Jan 19 has been approved",
    time: "2 days ago",
    isRead: true,
    priority: "normal" as const,
  },
];

export default function Notifications() {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppLayout role="student" userName="Ahmed Benali">
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">Notifications</h1>
              {unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground">{unreadCount} New</Badge>
              )}
            </div>
            <p className="page-subtitle">Stay updated with your internship activities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="important">Important</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} {...notification} />
            ))}
          </TabsContent>

          <TabsContent value="unread" className="space-y-3">
            {notifications.filter(n => !n.isRead).map((notification) => (
              <NotificationCard key={notification.id} {...notification} />
            ))}
          </TabsContent>

          <TabsContent value="important" className="space-y-3">
            {notifications.filter(n => n.priority === "high").map((notification) => (
              <NotificationCard key={notification.id} {...notification} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function NotificationCard({
  icon: Icon,
  title,
  message,
  time,
  isRead,
  priority,
}: typeof notifications[0]) {
  return (
    <Card className={`p-4 hover:shadow-md transition-all ${!isRead ? "border-primary/50 bg-primary/5" : ""}`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          priority === "high" ? "bg-warning/10" : "bg-primary/10"
        }`}>
          <Icon className={`w-5 h-5 ${priority === "high" ? "text-warning" : "text-primary"}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-medium ${!isRead ? "text-foreground" : "text-muted-foreground"}`}>
              {title}
            </h3>
            {!isRead && (
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{message}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>

        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Check className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
