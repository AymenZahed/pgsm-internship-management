import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, Check, CheckCheck, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { messageService, Conversation, Message } from "@/services/message.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function DoctorMessages() {
  const { user } = useAuth();
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
  const [searchParams] = useSearchParams();
  const toUserId = searchParams.get('to');

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      if (response.success && response.data) {
        setConversations(response.data);

        // Handle direct messaging via URL
        if (toUserId) {
          const existingConv = response.data.find(c =>
            c.participants.some(p => p.id === toUserId)
          );

          if (existingConv) {
            setSelectedConversation(existingConv);
          } else {
            // Create new temporary conversation or fetch real one
            try {
              const newConvRes = await messageService.getOrCreateConversation(toUserId);
              if (newConvRes.success && newConvRes.data) {
                // @ts-ignore - mismatch in types between creation and list potentially, but usually matches
                // actually getOrCreate returns { id, isNew }, we might need to refetch or assume
                // simpler: reload conversations or just fetch that specific one
                // For now, let's just reload conversations after creation if it was new
                if (newConvRes.data.isNew) {
                  const updatedConvs = await messageService.getConversations();
                  if (updatedConvs.success) {
                    setConversations(updatedConvs.data);
                    const created = updatedConvs.data.find(c => c.id === newConvRes.data.id);
                    if (created) setSelectedConversation(created);
                  }
                } else {
                  // if not new, we should have found it in the list locally unless list is stale
                  // just in case
                  const found = response.data.find(c => c.id === newConvRes.data.id);
                  if (found) setSelectedConversation(found);
                }
              }
            } catch (err) {
              console.error("Failed to create conversation", err);
            }
          }
        } else if (response.data.length > 0 && !selectedConversation) {
          setSelectedConversation(response.data[0]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations');
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
      }
    } catch (err: any) {
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

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
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
      default:
        return null;
    }
  };

  const getParticipantName = (conv: Conversation) => {
    const other = conv.participants.find(p => p.id !== user?.id);
    return other ? `${other.first_name} ${other.last_name}` : conv.name || 'Unknown';
  };

  const getParticipantInitials = (conv: Conversation) => {
    const other = conv.participants.find(p => p.id !== user?.id);
    return other ? `${other.first_name?.[0] || ''}${other.last_name?.[0] || ''}` : '?';
  };

  const getParticipantRole = (conv: Conversation) => {
    const other = conv.participants.find(p => p.id !== user?.id);
    return other?.role || '';
  }

  const filteredConversations = conversations.filter(conv =>
    getParticipantName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <AppLayout role="doctor"><LoadingState message="Loading messages..." /></AppLayout>;
  if (error) return <AppLayout role="doctor"><ErrorState message={error} onRetry={fetchConversations} /></AppLayout>;

  return (
    <AppLayout role="doctor" userName={user?.first_name ? `Dr. ${user.first_name} ${user.last_name}` : 'Doctor'}>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Communicate with students and hospital staff</p>
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
              <EmptyState title="No conversations" description="Start a conversation with a student" />
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
                          <p className="font-medium text-sm truncate">{getParticipantName(conversation)}</p>
                          {conversation.last_message_time && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(conversation.last_message_time).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.last_message || 'No messages yet'}</p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <Badge className="bg-primary text-primary-foreground">{conversation.unread_count}</Badge>
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
                      <p className="text-xs text-muted-foreground capitalize">
                        {getParticipantRole(selectedConversation)}
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
                                isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                              )}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <div className={cn("flex items-center gap-1 mt-1 px-1", isOwn ? "justify-end" : "justify-start")}>
                              <p className="text-xs text-muted-foreground">
                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                      {sendingMessage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState title="Select a conversation" description="Choose a conversation to start messaging" />
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
