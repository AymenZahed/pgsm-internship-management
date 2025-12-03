import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, Paperclip } from "lucide-react";
import { useState } from "react";

const conversations = [
  {
    id: "1",
    name: "Dr. Hassan Alami",
    role: "Tutor - Pediatrics",
    lastMessage: "Great work on today's rounds!",
    time: "10:30 AM",
    unread: 2,
    avatar: "/avatars/doctor1.jpg",
  },
  {
    id: "2",
    name: "Hospital Admin",
    role: "CHU Ibn Rochd",
    lastMessage: "Your attendance has been confirmed",
    time: "Yesterday",
    unread: 0,
    avatar: "/avatars/admin.jpg",
  },
  {
    id: "3",
    name: "Dr. Fatima Zahra",
    role: "Tutor - Internal Medicine",
    lastMessage: "Please review the case files I sent",
    time: "2 days ago",
    unread: 1,
    avatar: "/avatars/doctor2.jpg",
  },
];

const messages = [
  {
    id: "1",
    sender: "Dr. Hassan Alami",
    content: "Great work on today's rounds!",
    time: "10:30 AM",
    isOwn: false,
  },
  {
    id: "2",
    sender: "You",
    content: "Thank you Dr. Alami! I learned a lot today.",
    time: "10:35 AM",
    isOwn: true,
  },
  {
    id: "3",
    sender: "Dr. Hassan Alami",
    content: "Keep up the excellent work. I'll see you tomorrow for the morning consultation.",
    time: "10:40 AM",
    isOwn: false,
  },
];

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);

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
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedConversation.id === conversation.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={conversation.avatar} />
                      <AvatarFallback>{conversation.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
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
                <Avatar>
                  <AvatarImage src={selectedConversation.avatar} />
                  <AvatarFallback>{selectedConversation.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedConversation.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedConversation.role}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] ${message.isOwn ? "order-2" : ""}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-1">{message.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Input placeholder="Type a message..." className="flex-1" />
                <Button variant="hero" size="icon">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
