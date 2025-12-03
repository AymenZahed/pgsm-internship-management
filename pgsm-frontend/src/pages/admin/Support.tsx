import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageSquare, Clock, CheckCircle, AlertCircle, User, Eye, Reply } from "lucide-react";
import { useState } from "react";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  user: string;
  userEmail: string;
  userRole: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  category: string;
  createdAt: string;
  updatedAt: string;
  responses: number;
}

const mockTickets: Ticket[] = [
  { id: "TKT-001", subject: "Unable to submit internship application", description: "I'm getting an error when trying to submit my application for the cardiology internship.", user: "Youssef El Amrani", userEmail: "y.elamrani@um5.ac.ma", userRole: "Student", priority: "high", status: "open", category: "Technical", createdAt: "2024-01-30 14:30", updatedAt: "2024-01-30 14:30", responses: 0 },
  { id: "TKT-002", subject: "How to reset password?", description: "I forgot my password and the reset email is not arriving.", user: "Salma Benjelloun", userEmail: "s.benjelloun@um5.ac.ma", userRole: "Student", priority: "medium", status: "in_progress", category: "Account", createdAt: "2024-01-29 10:15", updatedAt: "2024-01-30 09:00", responses: 2 },
  { id: "TKT-003", subject: "Request to add new department", description: "We would like to add the Ophthalmology department to our hospital profile.", user: "CHU Ibn Sina", userEmail: "admin@chuibnisina.ma", userRole: "Hospital", priority: "low", status: "resolved", category: "Feature Request", createdAt: "2024-01-28 16:45", updatedAt: "2024-01-29 11:30", responses: 3 },
  { id: "TKT-004", subject: "Attendance validation not working", description: "I cannot validate student attendance for the past week.", user: "Dr. Ahmed Benali", userEmail: "a.benali@chuibnisina.ma", userRole: "Doctor", priority: "urgent", status: "open", category: "Technical", createdAt: "2024-01-30 08:20", updatedAt: "2024-01-30 08:20", responses: 0 },
  { id: "TKT-005", subject: "Certificate generation issue", description: "The internship completion certificate has wrong dates.", user: "Omar Tazi", userEmail: "o.tazi@uic.ac.ma", userRole: "Student", priority: "medium", status: "closed", category: "Documents", createdAt: "2024-01-25 13:00", updatedAt: "2024-01-27 15:45", responses: 4 },
];

export default function AdminSupport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const getPriorityBadge = (priority: Ticket["priority"]) => {
    switch (priority) {
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      case "medium":
        return <Badge className="bg-blue-500/20 text-blue-600">Medium</Badge>;
      case "high":
        return <Badge className="bg-amber-500/20 text-amber-600">High</Badge>;
      case "urgent":
        return <Badge className="bg-red-500/20 text-red-600">Urgent</Badge>;
    }
  };

  const getStatusBadge = (status: Ticket["status"]) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-500/20 text-green-600">Open</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500/20 text-blue-600">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-purple-500/20 text-purple-600">Resolved</Badge>;
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
    }
  };

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: mockTickets.length,
    open: mockTickets.filter(t => t.status === "open").length,
    inProgress: mockTickets.filter(t => t.status === "in_progress").length,
    urgent: mockTickets.filter(t => t.priority === "urgent" && t.status !== "closed").length,
  };

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage user support requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.open}</p>
                <p className="text-sm text-muted-foreground">Open</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                <p className="text-sm text-muted-foreground">Urgent</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                        {getPriorityBadge(ticket.priority)}
                        {getStatusBadge(ticket.status)}
                        <Badge variant="outline">{ticket.category}</Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">{ticket.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span>{ticket.user}</span>
                        <Badge variant="outline" className="text-xs">{ticket.userRole}</Badge>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ticket.createdAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {ticket.responses} responses
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm">
                      <Reply className="w-4 h-4 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTickets.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tickets found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
