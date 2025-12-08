import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, Paperclip, GraduationCap, Building2 } from "lucide-react";
import { useState } from "react";

const conversations = [
  {
    id: "1",
    name: "Ahmed Benali",
    role: "4th Year Student",
    type: "student" as const,
    lastMessage: "Thank you Dr. Alami, I'll prepare for tomorrow",
    time: "10:30 AM",
    unread: 0,
    avatar: "/avatars/student1.jpg",
  },
  {
    id: "2",
    name: "Fatima Zahra Ouardi",
    role: "5th Year Student",
    type: "student" as const,
    lastMessage: "Could you review my logbook entry?",
    time: "Yesterday",
    unread: 1,
    avatar: "/avatars/student2.jpg",
  },
  {
    id: "3",
    name: "Hospital Admin",
    role: "Hôpital d'Enfants",
    type: "hospital" as const,
    lastMessage: "New rotation schedule is available",
    time: "2 days ago",
    unread: 0,
    avatar: "/avatars/admin.jpg",
  },
];

const messages = [
  {
    id: "1",
    sender: "Ahmed Benali",
    content: "Good morning Dr. Alami, I have a question about the case we discussed yesterday",
    time: "10:15 AM",
    isOwn: false,
  },
  {
    id: "2",
    sender: "You",
    content: "Good morning Ahmed. Of course, what would you like to know?",
    time: "10:20 AM",
    isOwn: true,
  },
  {
    id: "3",
    sender: "Ahmed Benali",
    content: "I was wondering about the differential diagnosis approach for the pediatric patient with respiratory symptoms",
    time: "10:25 AM",
    isOwn: false,
  },
  {
    id: "4",
    sender: "You",
    content: "Great question! Let's discuss this during tomorrow's rounds. I'll prepare some additional cases for you to review.",
    time: "10:28 AM",
    isOwn: true,
  },
  {
    id: "5",
    sender: "Ahmed Benali",
    content: "Thank you Dr. Alami, I'll prepare for tomorrow",
    time: "10:30 AM",
    isOwn: false,
  },
];

export default function DoctorMessages() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageInput, setMessageInput] = useState("");

  return (
    <AppLayout role="doctor" userName="Dr. Hassan Alami">
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
                      <div className="flex items-center gap-1 mb-1">
                        {conversation.type === "student" ? (
                          <GraduationCap className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <Building2 className="w-3 h-3 text-muted-foreground" />
                        )}
                        <p className="text-xs text-muted-foreground">{conversation.role}</p>
                      </div>
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
                <Input 
                  placeholder="Type a message..." 
                  className="flex-1"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
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
