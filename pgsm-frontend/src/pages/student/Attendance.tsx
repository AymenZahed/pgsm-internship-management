import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { attendanceService } from "@/services/attendance.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useAuth } from "@/contexts/AuthContext";

interface AttendanceRecord {
  id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: "pending" | "present" | "absent" | "late" | "excused" | "approved" | "rejected";
  hours_worked?: number;
  notes?: string;
  hospital_name?: string;
  validated_by?: string;
}

export default function Attendance() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, pending: 0, late: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markDialogOpen, setMarkDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    date: new Date().toISOString().split('T')[0],
    check_in: '',
    check_out: '',
    notes: '',
  });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getMyAttendance();
      if (response.success && response.data) {
        setRecords(response.data.attendance || []);
        setStats(response.data.stats || { total: 0, present: 0, absent: 0, pending: 0, late: 0 });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      // Get internship_id from records or use a default
      const internshipId = records.length > 0 ? records[0].id : '';
      const response = await attendanceService.recordAttendance({
        internship_id: internshipId,
        date: attendanceData.date,
        check_in: attendanceData.check_in || undefined,
        check_out: attendanceData.check_out || undefined,
        notes: attendanceData.notes || undefined,
      });
      
      if (response.success) {
        toast.success("Attendance recorded successfully");
        setMarkDialogOpen(false);
        setAttendanceData({
          date: new Date().toISOString().split('T')[0],
          check_in: '',
          check_out: '',
          notes: '',
        });
        fetchAttendance();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to record attendance");
    } finally {
      setActionLoading(false);
    }
  };

  const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
      case 'approved':
        return <Badge className="bg-success/20 text-success">Present</Badge>;
      case 'absent':
      case 'rejected':
        return <Badge variant="destructive">Absent</Badge>;
      case 'late':
        return <Badge className="bg-warning/20 text-warning">Late</Badge>;
      case 'excused':
        return <Badge variant="secondary">Excused</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) return <AppLayout role="student" userName={user?.first_name || 'Student'}><LoadingState message="Loading attendance..." /></AppLayout>;
  if (error) return <AppLayout role="student" userName={user?.first_name || 'Student'}><ErrorState message={error} onRetry={fetchAttendance} /></AppLayout>;

  return (
    <AppLayout role="student" userName={user?.first_name || 'Student'}>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track your internship attendance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
              <p className="text-3xl font-bold text-success">{attendanceRate}%</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Present Days</p>
              <p className="text-3xl font-bold">{stats.present}/{stats.total}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="text-3xl font-bold text-destructive">{stats.absent}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-warning">{stats.pending}</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Calendar View</h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </Card>

          {/* Recent Records */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Recent Records</h3>
            {records.length === 0 ? (
              <EmptyState title="No records" description="No attendance records yet" />
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {records.slice(0, 10).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        record.status === "present" || record.status === "approved" ? "bg-success/10" : 
                        record.status === "absent" || record.status === "rejected" ? "bg-destructive/10" : "bg-muted"
                      }`}>
                        {record.status === "present" || record.status === "approved" ? (
                          <Check className="w-5 h-5 text-success" />
                        ) : record.status === "absent" || record.status === "rejected" ? (
                          <X className="w-5 h-5 text-destructive" />
                        ) : (
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {new Date(record.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        {record.check_in && record.check_out && (
                          <p className="text-xs text-muted-foreground">
                            {record.check_in} - {record.check_out}
                            {record.hours_worked && ` (${record.hours_worked}h)`}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(record.status)}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Today's Attendance */}
        <Card className="p-6 border-primary/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">Record Attendance</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <Dialog open={markDialogOpen} onOpenChange={setMarkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg">Mark Attendance</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Attendance</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleMarkAttendance} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="att-date">Date</Label>
                    <Input
                      id="att-date"
                      type="date"
                      value={attendanceData.date}
                      onChange={(e) => setAttendanceData({ ...attendanceData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="check-in">Check In</Label>
                      <Input
                        id="check-in"
                        type="time"
                        value={attendanceData.check_in}
                        onChange={(e) => setAttendanceData({ ...attendanceData, check_in: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="check-out">Check Out</Label>
                      <Input
                        id="check-out"
                        type="time"
                        value={attendanceData.check_out}
                        onChange={(e) => setAttendanceData({ ...attendanceData, check_out: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={attendanceData.notes}
                      onChange={(e) => setAttendanceData({ ...attendanceData, notes: e.target.value })}
                      placeholder="Any additional notes..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setMarkDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={actionLoading}>
                      {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Submit
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
