import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Clock, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { tutorService } from "@/services/tutor.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/loading-state";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AttendanceRecord {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: "pending" | "approved" | "rejected" | "present" | "absent";
  notes?: string;
  validated_at?: string;
}

export default function AttendanceValidation() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [pendingAttendance, setPendingAttendance] = useState<AttendanceRecord[]>([]);
  const [validatedAttendance, setValidatedAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pendingRes, validatedRes] = await Promise.all([
        tutorService.getTutorAttendance('pending'),
        tutorService.getTutorAttendance('approved,rejected')
      ]);

      if (pendingRes.success) {
        setPendingAttendance(pendingRes.data || []);
      }

      if (validatedRes.success) {
        setValidatedAttendance(validatedRes.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setActionLoading(id);
      const response = await tutorService.validateAttendance(id, { status });

      if (response.success) {
        toast.success(`Attendance ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
        await fetchAttendance();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${status} attendance`);
    } finally {
      setActionLoading(null);
    }
  };

  const todayValidated = validatedAttendance.filter(a =>
    new Date(a.validated_at || a.date).toDateString() === new Date().toDateString()
  );

  const todayApproved = todayValidated.filter(a => a.status === 'approved' || a.status === 'present').length;
  const todayRejected = todayValidated.filter(a => a.status === 'rejected' || a.status === 'absent').length;

  if (loading) {
    return (
      <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}>
        <LoadingState message="Loading attendance..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}>
        <ErrorState message={error} onRetry={fetchAttendance} />
      </AppLayout>
    );
  }

  return (
    <AppLayout role="doctor" userName={user?.first_name || 'Doctor'}>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Attendance Validation</h1>
          <p className="page-subtitle">Review and validate student attendance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingAttendance.length}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved Today</p>
              <p className="text-2xl font-bold">{todayApproved}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <X className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected Today</p>
              <p className="text-2xl font-bold">{todayRejected}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total This Week</p>
              <p className="text-2xl font-bold">{validatedAttendance.length}</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Select Date</h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="pending" className="space-y-4">
              <TabsList>
                <TabsTrigger value="pending">
                  Pending ({pendingAttendance.length})
                </TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {pendingAttendance.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Check className="w-12 h-12 text-success mx-auto mb-4" />
                    <h3 className="font-semibold">All Caught Up!</h3>
                    <p className="text-sm text-muted-foreground">No pending attendance to validate</p>
                  </Card>
                ) : (
                  pendingAttendance.map((record) => (
                    <Card key={record.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={record.avatar} />
                            <AvatarFallback>{record.first_name[0]}{record.last_name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{record.first_name} {record.last_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(record.date).toLocaleDateString()}
                              {record.check_in && ` • Check-in: ${record.check_in}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive"
                            onClick={() => handleValidate(record.id, 'rejected')}
                            disabled={actionLoading === record.id}
                          >
                            {actionLoading === record.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            Reject
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleValidate(record.id, 'approved')}
                            disabled={actionLoading === record.id}
                          >
                            {actionLoading === record.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Approve
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {validatedAttendance.length === 0 ? (
                  <EmptyState title="No history" description="No validated attendance records yet" />
                ) : (
                  validatedAttendance.slice(0, 20).map((record) => (
                    <Card key={record.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{record.first_name} {record.last_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(record.date).toLocaleDateString()}
                            {record.validated_at && ` • Validated: ${new Date(record.validated_at).toLocaleString()}`}
                          </p>
                          {record.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
                          )}
                        </div>
                        <Badge variant={record.status === "approved" || record.status === "present" ? "default" : "destructive"}>
                          {record.status === "approved" || record.status === "present" ? "Approved" : "Rejected"}
                        </Badge>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
