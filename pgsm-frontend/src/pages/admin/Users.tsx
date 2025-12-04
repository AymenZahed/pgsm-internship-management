import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Plus, MoreHorizontal, UserCheck, UserX, Edit, Trash2, Mail, Shield, Download, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { adminService, User } from "@/services/admin.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminUsers() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, active: 0, students: 0, doctors: 0 });

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState<{ email: string; password: string; first_name: string; last_name: string; role: 'student' | 'doctor' | 'hospital' | 'admin'; phone: string }>({ email: '', password: '', first_name: '', last_name: '', role: 'student', phone: '' });
  const [editUser, setEditUser] = useState({ first_name: '', last_name: '', phone: '', is_active: true });
  const [emailData, setEmailData] = useState({ subject: '', message: '' });
  const [newRole, setNewRole] = useState('student');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers({ 
        search: searchQuery || undefined, 
        role: roleFilter !== 'all' ? roleFilter : undefined,
        is_active: statusFilter !== 'all' ? statusFilter : undefined
      });
      if (response.success && response.data) {
        setUsers(response.data);
        // Calculate stats
        const allUsers = response.data;
        setStats({
          total: response.pagination?.total || allUsers.length,
          active: allUsers.filter((u: User) => u.is_active).length,
          students: allUsers.filter((u: User) => u.role === 'student').length,
          doctors: allUsers.filter((u: User) => u.role === 'doctor').length,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter, statusFilter]);

  const handleCreateUser = async () => {
    try {
      setActionLoading(true);
      const response = await adminService.createUser(newUser);
      if (response.success) {
        toast({ title: "Success", description: "User created successfully" });
        setAddDialogOpen(false);
        setNewUser({ email: '', password: '', first_name: '', last_name: '', role: 'student', phone: '' });
        fetchUsers();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to create user", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      const response = await adminService.updateUser(selectedUser.id, editUser);
      if (response.success) {
        toast({ title: "Success", description: "User updated successfully" });
        setEditDialogOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to update user", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      const response = await adminService.deleteUser(selectedUser.id);
      if (response.success) {
        toast({ title: "Success", description: "User deleted successfully" });
        setDeleteDialogOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete user", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const response = await adminService.updateUser(user.id, { is_active: !user.is_active });
      if (response.success) {
        toast({ title: "Success", description: `User ${user.is_active ? 'deactivated' : 'activated'} successfully` });
        fetchUsers();
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to update user status", variant: "destructive" });
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      const response = await adminService.updateUser(selectedUser.id, { role: newRole as 'student' | 'doctor' | 'hospital' | 'admin' });
      if (response.success) {
        toast({ title: "Success", description: "User role changed successfully" });
        setRoleDialogOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to change user role", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      const response = await adminService.sendEmail(selectedUser.id, emailData.subject, emailData.message);
      if (response.success) {
        toast({ title: "Success", description: "Email sent successfully" });
        setEmailDialogOpen(false);
        setEmailData({ subject: '', message: '' });
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to send email", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await adminService.exportUsers('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users_export.csv';
      a.click();
      toast({ title: "Success", description: "Export started" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to export users", variant: "destructive" });
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      student: "bg-blue-500/20 text-blue-600",
      doctor: "bg-green-500/20 text-green-600",
      hospital: "bg-purple-500/20 text-purple-600",
      admin: "bg-red-500/20 text-red-600",
    };
    return <Badge className={styles[role] || ""}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge className="bg-green-500/20 text-green-600">Active</Badge>
      : <Badge variant="secondary">Inactive</Badge>;
  };

  if (loading) return <AppLayout role="admin" userName="Admin"><LoadingState message="Loading users..." /></AppLayout>;
  if (error) return <AppLayout role="admin" userName="Admin"><ErrorState message={error} onRetry={fetchUsers} /></AppLayout>;

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
            <p className="text-muted-foreground mt-1">Manage all platform users</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total Users</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{stats.active}</p><p className="text-sm text-muted-foreground">Active Users</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-bold text-blue-600">{stats.students}</p><p className="text-sm text-muted-foreground">Students</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{stats.doctors}</p><p className="text-sm text-muted-foreground">Doctors</p></CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="hospital">Hospital</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        {users.length === 0 ? (
          <EmptyState title="No users found" description="No users match your search criteria" />
        ) : (
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
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">{`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.first_name} {user.last_name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-muted-foreground">{user.last_login ? new Date(user.last_login).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setEditUser({ first_name: user.first_name, last_name: user.last_name, phone: user.phone || '', is_active: user.is_active }); setEditDialogOpen(true); }}>
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setEmailDialogOpen(true); }}>
                              <Mail className="w-4 h-4 mr-2" /> Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setNewRole(user.role); setRoleDialogOpen(true); }}>
                              <Shield className="w-4 h-4 mr-2" /> Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                              {user.is_active ? <><UserX className="w-4 h-4 mr-2" /> Deactivate</> : <><UserCheck className="w-4 h-4 mr-2" /> Activate</>}
                            </DropdownMenuItem>
                            {user.id !== currentUser?.id && (
                              <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedUser(user); setDeleteDialogOpen(true); }}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input value={newUser.first_name} onChange={(e) => setNewUser({...newUser, first_name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={newUser.last_name} onChange={(e) => setNewUser({...newUser, last_name: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} /></div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newUser.role} onValueChange={(v: 'student' | 'doctor' | 'hospital' | 'admin') => setNewUser({...newUser, role: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateUser} disabled={actionLoading}>{actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input value={editUser.first_name} onChange={(e) => setEditUser({...editUser, first_name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={editUser.last_name} onChange={(e) => setEditUser({...editUser, last_name: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>Phone</Label><Input value={editUser.phone} onChange={(e) => setEditUser({...editUser, phone: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser} disabled={actionLoading}>{actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete {selectedUser?.first_name} {selectedUser?.last_name}? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">{actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>Send an email to {selectedUser?.first_name} {selectedUser?.last_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Subject</Label><Input value={emailData.subject} onChange={(e) => setEmailData({...emailData, subject: e.target.value})} /></div>
            <div className="space-y-2"><Label>Message</Label><textarea className="w-full min-h-[120px] p-3 border rounded-md" value={emailData.message} onChange={(e) => setEmailData({...emailData, message: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendEmail} disabled={actionLoading}>{actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Send Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>Change the role for {selectedUser?.first_name} {selectedUser?.last_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleChangeRole} disabled={actionLoading}>{actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Change Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
