import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, RefreshCw, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  category: string;
  message: string;
  user: string;
  ip: string;
}

const mockLogs: LogEntry[] = [
  { id: "1", timestamp: "2024-01-30 15:45:23", level: "success", category: "Auth", message: "User login successful", user: "admin@pgsm.ma", ip: "192.168.1.100" },
  { id: "2", timestamp: "2024-01-30 15:42:18", level: "info", category: "System", message: "Report generation started", user: "system", ip: "-" },
  { id: "3", timestamp: "2024-01-30 15:38:05", level: "warning", category: "Security", message: "Multiple failed login attempts detected", user: "unknown", ip: "41.92.45.123" },
  { id: "4", timestamp: "2024-01-30 15:35:42", level: "error", category: "Database", message: "Connection timeout - retrying", user: "system", ip: "-" },
  { id: "5", timestamp: "2024-01-30 15:30:11", level: "success", category: "Application", message: "New internship application submitted", user: "y.elamrani@um5.ac.ma", ip: "192.168.1.50" },
  { id: "6", timestamp: "2024-01-30 15:28:33", level: "info", category: "Email", message: "Welcome email sent to new user", user: "system", ip: "-" },
  { id: "7", timestamp: "2024-01-30 15:25:19", level: "success", category: "Auth", message: "User registration completed", user: "o.tazi@uic.ac.ma", ip: "192.168.1.75" },
  { id: "8", timestamp: "2024-01-30 15:22:45", level: "warning", category: "Storage", message: "Disk space below 20%", user: "system", ip: "-" },
  { id: "9", timestamp: "2024-01-30 15:18:30", level: "info", category: "System", message: "Scheduled backup completed", user: "system", ip: "-" },
  { id: "10", timestamp: "2024-01-30 15:15:12", level: "error", category: "API", message: "External API request failed - service unavailable", user: "system", ip: "-" },
];

export default function AdminLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const getLevelIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getLevelBadge = (level: LogEntry["level"]) => {
    switch (level) {
      case "info":
        return <Badge className="bg-blue-500/20 text-blue-600">Info</Badge>;
      case "warning":
        return <Badge className="bg-amber-500/20 text-amber-600">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-500/20 text-red-600">Error</Badge>;
      case "success":
        return <Badge className="bg-green-500/20 text-green-600">Success</Badge>;
    }
  };

  const categories = [...new Set(mockLogs.map(l => l.category))];

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const stats = {
    total: mockLogs.length,
    errors: mockLogs.filter(l => l.level === "error").length,
    warnings: mockLogs.filter(l => l.level === "warning").length,
  };

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Logs</h1>
            <p className="text-muted-foreground mt-1">Monitor platform activity and events</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.warnings}</p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Logs Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead className="w-[100px]">Level</TableHead>
                  <TableHead className="w-[100px]">Category</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="w-[120px]">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.timestamp}</TableCell>
                    <TableCell>{getLevelBadge(log.level)}</TableCell>
                    <TableCell><Badge variant="outline">{log.category}</Badge></TableCell>
                    <TableCell className="flex items-center gap-2">
                      {getLevelIcon(log.level)}
                      <span className="text-sm">{log.message}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.user}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
