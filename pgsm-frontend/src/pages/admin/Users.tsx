import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, UserCheck, UserX, Edit, Trash2, Mail, Shield } from "lucide-react";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "doctor" | "hospital" | "admin";
  status: "active" | "inactive" | "pending";
  createdAt: string;
  lastLogin: string;
}

const mockUsers: User[] = [
  { id: "1", name: "Youssef El Amrani", email: "y.elamrani@um5.ac.ma", role: "student", status: "active", createdAt: "2024-01-10", lastLogin: "2024-01-29" },
  { id: "2", name: "Dr. Ahmed Benali", email: "a.benali@chuibnisina.ma", role: "doctor", status: "active", createdAt: "2023-09-15", lastLogin: "2024-01-29" },
  { id: "3", name: "CHU Ibn Sina", email: "admin@chuibnisina.ma", role: "hospital", status: "active", createdAt: "2023-06-01", lastLogin: "2024-01-28" },
  { id: "4", name: "Salma Benjelloun", email: "s.benjelloun@um5.ac.ma", role: "student", status: "active", createdAt: "2024-01-12", lastLogin: "2024-01-27" },
  { id: "5", name: "Dr. Fatima Zahra", email: "f.zahra@chuibnisina.ma", role: "doctor", status: "inactive", createdAt: "2023-10-20", lastLogin: "2024-01-15" },
  { id: "6", name: "Omar Tazi", email: "o.tazi@uic.ac.ma", role: "student", status: "pending", createdAt: "2024-01-25", lastLogin: "-" },
  { id: "7", name: "Admin Principal", email: "admin@pgsm.ma", role: "admin", status: "active", createdAt: "2023-01-01", lastLogin: "2024-01-29" },
];

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const getRoleBadge = (role: User["role"]) => {
    const styles = {
      student: "bg-blue-500/20 text-blue-600",
      doctor: "bg-green-500/20 text-green-600",
      hospital: "bg-purple-500/20 text-purple-600",
      admin: "bg-red-500/20 text-red-600",
    };
    return <Badge className={styles[role]}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
  };

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-600">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-600">Pending</Badge>;
    }
  };

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: mockUsers.length,
    active: mockUsers.filter(u => u.status === "active").length,
    students: mockUsers.filter(u => u.role === "student").length,
    doctors: mockUsers.filter(u => u.role === "doctor").length,
  };

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
            <p className="text-muted-foreground mt-1">Manage all platform users</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-blue-600">{stats.students}</p>
              <p className="text-sm text-muted-foreground">Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-600">{stats.doctors}</p>
              <p className="text-sm text-muted-foreground">Doctors</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="hospital">Hospital</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem><Mail className="w-4 h-4 mr-2" /> Send Email</DropdownMenuItem>
                          <DropdownMenuItem><Shield className="w-4 h-4 mr-2" /> Change Role</DropdownMenuItem>
                          {user.status === "active" ? (
                            <DropdownMenuItem><UserX className="w-4 h-4 mr-2" /> Deactivate</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem><UserCheck className="w-4 h-4 mr-2" /> Activate</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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
