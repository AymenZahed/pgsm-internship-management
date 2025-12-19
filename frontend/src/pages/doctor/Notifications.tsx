import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, Trash2, FileText, Calendar, MessageCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { notificationService, Notification } from "@/services/notification.service";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { toast } from "sonner";
import { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
    evaluation: FileText,
    attendance: Calendar,
    message: MessageCircle,
    deadline: AlertCircle,
    logbook: FileText,
    default: Bell,
};

export default function DoctorNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationService.getNotifications();
            if (response.success && response.data) {
                setNotifications(response.data.notifications || []);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (err) {
            toast.error("Failed to mark as read");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            toast.success("All notifications marked as read");
        } catch (err) {
            toast.error("Failed to mark all as read");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(notifications.filter(n => n.id !== id));
            toast.success("Notification deleted");
        } catch (err) {
            toast.error("Failed to delete notification");
        }
    };

    const handleClearAll = async () => {
        try {
            await notificationService.clearAll();
            setNotifications([]);
            toast.success("All notifications cleared");
        } catch (err) {
            toast.error("Failed to clear notifications");
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return "Just now";
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <AppLayout role="doctor">
                <LoadingState message="Loading notifications..." />
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout role="doctor">
                <ErrorState message={error} onRetry={fetchNotifications} />
            </AppLayout>
        );
    }

    return (
        <AppLayout role="doctor">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="page-title">Notifications</h1>
                            {unreadCount > 0 && (
                                <Badge className="bg-primary text-primary-foreground">{unreadCount} New</Badge>
                            )}
                        </div>
                        <p className="page-subtitle">Stay updated with your student activities and deadlines</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                            <Check className="w-4 h-4 mr-2" />
                            Mark All Read
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleClearAll} disabled={notifications.length === 0}>
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
                        {notifications.length === 0 ? (
                            <Card className="p-8 text-center bg-muted/20">
                                <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                                <p className="text-muted-foreground">No notifications yet</p>
                            </Card>
                        ) : (
                            notifications.map((notification) => (
                                <NotificationCard
                                    key={notification.id}
                                    notification={notification}
                                    onMarkRead={() => handleMarkAsRead(notification.id)}
                                    onDelete={() => handleDelete(notification.id)}
                                    formatTime={formatTime}
                                />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="unread" className="space-y-3">
                        {notifications.filter(n => !n.is_read).length === 0 ? (
                            <Card className="p-8 text-center bg-muted/20">
                                <Check className="w-12 h-12 mx-auto text-success mb-4 opacity-50" />
                                <p className="text-muted-foreground">All caught up!</p>
                            </Card>
                        ) : (
                            notifications.filter(n => !n.is_read).map((notification) => (
                                <NotificationCard
                                    key={notification.id}
                                    notification={notification}
                                    onMarkRead={() => handleMarkAsRead(notification.id)}
                                    onDelete={() => handleDelete(notification.id)}
                                    formatTime={formatTime}
                                />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="important" className="space-y-3">
                        {notifications.filter(n => n.priority === "high").length === 0 ? (
                            <Card className="p-8 text-center bg-muted/20">
                                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                                <p className="text-muted-foreground">No important notifications</p>
                            </Card>
                        ) : (
                            notifications.filter(n => n.priority === "high").map((notification) => (
                                <NotificationCard
                                    key={notification.id}
                                    notification={notification}
                                    onMarkRead={() => handleMarkAsRead(notification.id)}
                                    onDelete={() => handleDelete(notification.id)}
                                    formatTime={formatTime}
                                />
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

function NotificationCard({
    notification,
    onMarkRead,
    onDelete,
    formatTime,
}: {
    notification: Notification;
    onMarkRead: () => void;
    onDelete: () => void;
    formatTime: (date: string) => string;
}) {
    const Icon = iconMap[notification.type] || iconMap.default;

    return (
        <Card className={`p-4 hover:shadow-md transition-all ${!notification.is_read ? "border-primary/50 bg-primary/5" : ""}`}>
            <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${notification.priority === "high" ? "bg-warning/10" : "bg-primary/10"
                    }`}>
                    <Icon className={`w-5 h-5 ${notification.priority === "high" ? "text-warning" : "text-primary"}`} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-medium ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                            {notification.title}
                        </h3>
                        {!notification.is_read && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(notification.created_at)}</p>
                </div>

                <div className="flex gap-1">
                    {!notification.is_read && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={onMarkRead}>
                            <Check className="w-4 h-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onDelete}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
