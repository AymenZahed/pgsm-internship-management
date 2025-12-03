import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Send, 
  Search, 
  Paperclip, 
  Check, 
  CheckCheck, 
  Clock,
  FileText,
  Image,
  X,
  Download,
  Eye
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Attachment {
  id: string;
  name: string;
  type: "image" | "document";
  size: string;
  url: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isOwn: boolean;
  status: "sending" | "sent" | "delivered" | "read";
  attachments?: Attachment[];
}

const conversations = [
  {
    id: "1",
    name: "Dr. Hassan Alami",
    role: "Tutor - Pediatrics",
    lastMessage: "Great work on today's rounds!",
    time: "10:30 AM",
    unread: 2,
    avatar: "/avatars/doctor1.jpg",
    online: true,
  },
  {
    id: "2",
    name: "Hospital Admin",
    role: "CHU Ibn Rochd",
    lastMessage: "Your attendance has been confirmed",
    time: "Yesterday",
    unread: 0,
    avatar: "/avatars/admin.jpg",
    online: false,
  },
  {
    id: "3",
    name: "Dr. Fatima Zahra",
    role: "Tutor - Internal Medicine",
    lastMessage: "Please review the case files I sent",
    time: "2 days ago",
    unread: 1,
    avatar: "/avatars/doctor2.jpg",
    online: true,
  },
];

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "Dr. Hassan Alami",
    content: "Great work on today's rounds!",
    time: "10:30 AM",
    isOwn: false,
    status: "read",
  },
  {
    id: "2",
    sender: "You",
    content: "Thank you Dr. Alami! I learned a lot today.",
    time: "10:35 AM",
    isOwn: true,
    status: "read",
  },
  {
    id: "3",
    sender: "Dr. Hassan Alami",
    content: "Keep up the excellent work. I'll see you tomorrow for the morning consultation.",
    time: "10:40 AM",
    isOwn: false,
    status: "read",
  },
  {
    id: "4",
    sender: "Dr. Hassan Alami",
    content: "Here are the case files for review:",
    time: "10:45 AM",
    isOwn: false,
    status: "read",
    attachments: [
      { id: "a1", name: "Case_Study_001.pdf", type: "document", size: "2.4 MB", url: "#" },
      { id: "a2", name: "Patient_Xray.jpg", type: "image", size: "1.1 MB", url: "#" },
    ],
  },
];

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sending":
        return <Clock className="w-3 h-3 text-muted-foreground" />;
      case "sent":
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-primary" />;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 10MB`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 attachments
    
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    const messageAttachments: Attachment[] = attachments.map((file, idx) => ({
      id: `new-${idx}`,
      name: file.name,
      type: file.type.startsWith("image/") ? "image" : "document",
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      url: URL.createObjectURL(file),
    }));

    const message: Message = {
      id: `msg-${Date.now()}`,
      sender: "You",
      content: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      status: "sending",
      attachments: messageAttachments.length > 0 ? messageAttachments : undefined,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
    setAttachments([]);

    // Simulate sending
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === message.id ? { ...m, status: "sent" as const } : m)
      );
    }, 500);

    // Simulate delivered
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === message.id ? { ...m, status: "delivered" as const } : m)
      );
    }, 1000);

    // Simulate read
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === message.id ? { ...m, status: "read" as const } : m)
      );
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AppLayout role="student" userName="Ahmed Benali">
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Communicate with tutors and hospital staff</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Conversations List */}
          <Card className="p-4 flex flex-col">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search messages..." className="pl-10" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-colors",
                    selectedConversation.id === conversation.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conversation.avatar} />
                        <AvatarFallback>{conversation.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {conversation.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm truncate">{conversation.name}</p>
                        <span className="text-xs text-muted-foreground">{conversation.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{conversation.role}</p>
                      <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unread > 0 && (
                      <Badge className="bg-primary text-primary-foreground">{conversation.unread}</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={selectedConversation.avatar} />
                    <AvatarFallback>{selectedConversation.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {selectedConversation.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{selectedConversation.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.online ? "Online" : selectedConversation.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex", message.isOwn ? "justify-end" : "justify-start")}
                >
                  <div className={cn("max-w-[70%]", message.isOwn ? "order-2" : "")}>
                    <div
                      className={cn(
                        "p-3 rounded-lg",
                        message.isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.content && <p className="text-sm">{message.content}</p>}
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-lg",
                                message.isOwn 
                                  ? "bg-primary-foreground/10" 
                                  : "bg-background"
                              )}
                            >
                              <div className={cn(
                                "w-8 h-8 rounded flex items-center justify-center",
                                attachment.type === "image" ? "bg-primary/10" : "bg-muted"
                              )}>
                                {attachment.type === "image" ? (
                                  <Image className="w-4 h-4" />
                                ) : (
                                  <FileText className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-xs font-medium truncate",
                                  message.isOwn ? "text-primary-foreground" : "text-foreground"
                                )}>
                                  {attachment.name}
                                </p>
                                <p className={cn(
                                  "text-xs",
                                  message.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                                )}>
                                  {attachment.size}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => setPreviewAttachment(attachment)}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 mt-1 px-1",
                      message.isOwn ? "justify-end" : "justify-start"
                    )}>
                      <p className="text-xs text-muted-foreground">{message.time}</p>
                      {message.isOwn && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Attachment Preview */}
            {attachments.length > 0 && (
              <div className="px-4 py-2 border-t bg-muted/50">
                <p className="text-xs text-muted-foreground mb-2">Attachments ({attachments.length}/5)</p>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-background rounded-lg border"
                    >
                      {file.type.startsWith("image/") ? (
                        <Image className="w-4 h-4 text-primary" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-xs truncate max-w-[100px]">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
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
                  onClick={sendMessage}
                  disabled={!newMessage.trim() && attachments.length === 0}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Attachment Preview Dialog */}
        <Dialog open={!!previewAttachment} onOpenChange={() => setPreviewAttachment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{previewAttachment?.name}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-4 bg-muted rounded-lg min-h-[300px]">
              {previewAttachment?.type === "image" ? (
                <img 
                  src={previewAttachment.url} 
                  alt={previewAttachment.name}
                  className="max-w-full max-h-[400px] object-contain"
                />
              ) : (
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">Preview not available</p>
                  <Button variant="outline" className="mt-4 gap-2">
                    <Download className="w-4 h-4" />
                    Download to view
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
