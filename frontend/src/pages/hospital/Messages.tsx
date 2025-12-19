import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, Check, CheckCheck, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { messageService } from "@/services/message.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useAuth } from "@/contexts/AuthContext";

interface Conversation {
    id: string;
    name?: string;
    last_message?: string;
    last_message_time?: string;
    unread_count: number;
    participants: Array<{
        id: string;
        first_name: string;
        last_name: string;
        avatar?: string;
        role: string;
    }>;
}

interface Message {
    id: string;
    content: string;
    sender_id: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    status?: "sent" | "delivered" | "read";
    created_at: string;
}

export default function HospitalMessages() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [pendingConversationId, setPendingConversationId] = useState<string | null>(null);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await messageService.getConversations();
            if (response.success && response.data) {
                setConversations(response.data);
                if (response.data.length > 0 && !selectedConversation) {
                    setSelectedConversation(response.data[0]);
                }
            }
        } catch (err: any) {
            setError(err.message || "Failed to load conversations");
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        try {
            setMessagesLoading(true);
            const response = await messageService.getMessages(conversationId);
            if (response.success && response.data) {
                setMessages(response.data);
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        } catch (err: any) {
            toast.error("Failed to load messages");
        } finally {
            setMessagesLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    // If we come with ?to=<user_id>, ensure we have a conversation with that user
    useEffect(() => {
        const to = searchParams.get("to");
        if (!to) return;

        (async () => {
            try {
                const res = await messageService.getOrCreateConversation(to);
                if (res.success && res.data) {
                    const convId = res.data.id;
                    setPendingConversationId(convId);
                    await fetchConversations();
                    await fetchMessages(convId);
                }
            } catch (err: any) {
                toast.error("Failed to start conversation");
            }
        })();
        // we intentionally don't include fetchConversations/fetchMessages in deps
        // to avoid re-running on every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
        }
    }, [selectedConversation]);

    // Once conversations are loaded and we have a pendingConversationId,
    // auto-select that conversation
    useEffect(() => {
        if (!pendingConversationId || conversations.length === 0) return;
        const target = conversations.find((c) => c.id === pendingConversationId);
        if (target) {
            setSelectedConversation(target);
            setPendingConversationId(null);
        }
    }, [pendingConversationId, conversations]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            setSendingMessage(true);
            const response = await messageService.sendMessage(selectedConversation.id, newMessage);
            if (response.success) {
                setNewMessage("");
                fetchMessages(selectedConversation.id);
            }
        } catch (err: any) {
            toast.error("Failed to send message");
        } finally {
            setSendingMessage(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getStatusIcon = (status: Message["status"]) => {
        switch (status) {
            case "sent":
                return <Check className="w-3 h-3 text-muted-foreground" />;
            case "delivered":
                return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
            case "read":
                return <CheckCheck className="w-3 h-3 text-primary" />;
        }
    };

    const getParticipantName = (conv: Conversation) => {
        const other = conv.participants.find((p) => p.id !== user?.id);
        return other ? `${other.first_name} ${other.last_name}` : conv.name || "Unknown";
    };

    const getParticipantInitials = (conv: Conversation) => {
        const other = conv.participants.find((p) => p.id !== user?.id);
        return other ? `${other.first_name?.[0] || ""}${other.last_name?.[0] || ""}` : "?";
    };

    const filteredConversations = conversations.filter((conv) =>
        getParticipantName(conv).toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading)
        return (
            <AppLayout role="hospital" userName={user?.first_name || "Hospital"}>
                <LoadingState message="Loading messages..." />
            </AppLayout>
        );
    if (error)
        return (
            <AppLayout role="hospital" userName={user?.first_name || "Hospital"}>
                <ErrorState message={error} onRetry={fetchConversations} />
            </AppLayout>
        );

    return (
        <AppLayout role="hospital" userName={user?.first_name || "Hospital"}>
            <div className="space-y-6">
                <div className="page-header">
                    <h1 className="page-title">Messages</h1>
                    <p className="page-subtitle">Communicate with students and doctors</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                    {/* Conversations List */}
                    <Card className="p-4 flex flex-col">
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search messages..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {filteredConversations.length === 0 ? (
                            <EmptyState
                                title="No conversations"
                                description="Start a conversation with a student or doctor"
                            />
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-2">
                                {filteredConversations.map((conversation) => (
                                    <button
                                        key={conversation.id}
                                        onClick={() => setSelectedConversation(conversation)}
                                        className={cn(
                                            "w-full p-3 rounded-lg text-left transition-colors",
                                            selectedConversation?.id === conversation.id
                                                ? "bg-primary/10 border border-primary/20"
                                                : "hover:bg-muted"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar>
                                                <AvatarFallback>{getParticipantInitials(conversation)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-medium text-sm truncate">
                                                        {getParticipantName(conversation)}
                                                    </p>
                                                    {conversation.last_message_time && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(conversation.last_message_time).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {conversation.last_message || "No messages yet"}
                                                </p>
                                            </div>
                                            {conversation.unread_count > 0 && (
                                                <Badge className="bg-primary text-primary-foreground">
                                                    {conversation.unread_count}
                                                </Badge>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Chat Area */}
                    <Card className="lg:col-span-2 flex flex-col">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{getParticipantInitials(selectedConversation)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{getParticipantName(selectedConversation)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {
                                                    selectedConversation.participants.find((p) => p.id !== user?.id)
                                                        ?.role || ""
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messagesLoading ? (
                                        <LoadingState message="Loading messages..." />
                                    ) : messages.length === 0 ? (
                                        <EmptyState title="No messages" description="Start the conversation" />
                                    ) : (
                                        messages.map((message) => {
                                            const isOwn = message.sender_id === user?.id;
                                            return (
                                                <div
                                                    key={message.id}
                                                    className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                                                >
                                                    <div className="max-w-[70%]">
                                                        <div
                                                            className={cn(
                                                                "p-3 rounded-lg",
                                                                isOwn
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "bg-muted"
                                                            )}
                                                        >
                                                            <p className="text-sm">{message.content}</p>
                                                        </div>
                                                        <div
                                                            className={cn(
                                                                "flex items-center gap-1 mt-1 px-1",
                                                                isOwn ? "justify-end" : "justify-start"
                                                            )}
                                                        >
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(message.created_at).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </p>
                                                            {isOwn && getStatusIcon(message.status)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <div className="p-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="Type a message..."
                                            className="flex-1"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                        />
                                        <Button
                                            variant="hero"
                                            size="icon"
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim() || sendingMessage}
                                        >
                                            {sendingMessage ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <EmptyState
                                    title="Select a conversation"
                                    description="Choose a conversation to start messaging"
                                />
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
