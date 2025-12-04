import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, MessageSquare, Clock, AlertCircle, Eye, Reply, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { adminService, SupportTicket } from "@/services/admin.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useToast } from "@/hooks/use-toast";

export default function AdminSupport() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSupportTickets({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined
      });
      if (response.success && response.data) {
        setTickets(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [statusFilter, priorityFilter]);

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    try {
      setActionLoading(true);
      const response = await adminService.replySupportTicket(selectedTicket.id, replyMessage);
      if (response.success) {
        toast({ title: "Success", description: "Reply sent successfully" });
        setReplyDialogOpen(false);
        setReplyMessage("");
        fetchTickets();
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to send reply", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (ticket: SupportTicket, status: string) => {
    try {
      const response = await adminService.updateSupportTicket(ticket.id, { status: status as any });
      if (response.success) {
        toast({ title: "Success", description: "Ticket status updated" });
        fetchTickets();
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low": return <Badge variant="secondary">Low</Badge>;
      case "medium": return <Badge className="bg-blue-500/20 text-blue-600">Medium</Badge>;
      case "high": return <Badge className="bg-amber-500/20 text-amber-600">High</Badge>;
      case "urgent": return <Badge className="bg-red-500/20 text-red-600">Urgent</Badge>;
      default: return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge className="bg-green-500/20 text-green-600">Open</Badge>;
      case "in_progress": return <Badge className="bg-blue-500/20 text-blue-600">In Progress</Badge>;
      case "resolved": return <Badge className="bg-purple-500/20 text-purple-600">Resolved</Badge>;
      case "closed": return <Badge variant="secondary">Closed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in_progress").length,
    urgent: tickets.filter(t => t.priority === "urgent" && t.status !== "closed").length,
  };

  if (loading) return <AppLayout role="admin" userName="Admin"><LoadingState message="Loading tickets..." /></AppLayout>;
  if (error) return <AppLayout role="admin" userName="Admin"><ErrorState message={error} onRetry={fetchTickets} /></AppLayout>;

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold text-foreground">Support Tickets</h1><p className="text-muted-foreground mt-1">Manage user support requests</p></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg"><MessageSquare className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total Tickets</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-green-500/10 rounded-lg"><AlertCircle className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold">{stats.open}</p><p className="text-sm text-muted-foreground">Open</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-lg"><Clock className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{stats.inProgress}</p><p className="text-sm text-muted-foreground">In Progress</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-red-500/10 rounded-lg"><AlertCircle className="w-5 h-5 text-red-500" /></div><div><p className="text-2xl font-bold text-red-600">{stats.urgent}</p><p className="text-sm text-muted-foreground">Urgent</p></div></CardContent></Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="open">Open</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="resolved">Resolved</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent><SelectItem value="all">All Priority</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent></Select>
        </div>

        {filteredTickets.length === 0 ? <EmptyState title="No tickets found" description="No support tickets match your search criteria" /> : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm text-muted-foreground">TKT-{ticket.id.slice(0, 6)}</span>
                          {getPriorityBadge(ticket.priority)}
                          {getStatusBadge(ticket.status)}
                          {ticket.category && <Badge variant="outline">{ticket.category}</Badge>}
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6"><AvatarFallback className="text-xs">{ticket.user_name?.split(' ').map(n => n[0]).join('') || '?'}</AvatarFallback></Avatar>
                          <span>{ticket.user_name || ticket.user_email}</span>
                          {ticket.user_role && <Badge variant="outline" className="text-xs">{ticket.user_role}</Badge>}
                        </div>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(ticket.created_at).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{ticket.responses_count || 0} responses</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={ticket.status} onValueChange={(v) => handleUpdateStatus(ticket, v)}>
                        <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={() => { setSelectedTicket(ticket); setReplyDialogOpen(true); }}><Reply className="w-4 h-4 mr-1" />Reply</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Reply to Ticket</DialogTitle><DialogDescription>{selectedTicket?.subject}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg"><p className="text-sm">{selectedTicket?.description}</p></div>
            <div className="space-y-2">
              <Label>Your Reply</Label>
              <textarea className="w-full min-h-[120px] p-3 border rounded-md" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Type your response..." />
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setReplyDialogOpen(false)}>Cancel</Button><Button onClick={handleReply} disabled={actionLoading || !replyMessage.trim()}>{actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Send Reply</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
