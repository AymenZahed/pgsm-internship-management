import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, Briefcase, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { adminService } from "@/services/admin.service";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";

export default function AdminStatistics() {
  const [period, setPeriod] = useState("6months");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<any>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStatistics();
      if (response.success) {
        setStatsData(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatistics(); }, [period]);

  if (loading) return <AppLayout role="admin" userName="Admin"><LoadingState message="Loading statistics..." /></AppLayout>;
  if (error) return <AppLayout role="admin" userName="Admin"><ErrorState message={error} onRetry={fetchStatistics} /></AppLayout>;

  const monthlyData = statsData?.monthlyData || [];
  const departmentData = statsData?.departmentData || [];
  const universityData = statsData?.universityData || [];
  const applicationStats = statsData?.applicationStats || [];
  const internshipStats = statsData?.internshipStats || [];
  const topHospitals = statsData?.topHospitals || [];

  const hospitalDistribution = topHospitals.slice(0, 5).map((h: any, i: number) => ({
    name: h.name,
    value: h.internship_count || 0,
    color: ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#6b7280"][i]
  }));

  const totalInterns = hospitalDistribution.reduce((acc: number, h: any) => acc + h.value, 0);
  const totalStudents = universityData.reduce((acc: number, u: any) => acc + (u.students || 0), 0);

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold text-foreground">Platform Statistics</h1><p className="text-muted-foreground mt-1">Analytics and performance metrics</p></div>
          <Select value={period} onValueChange={setPeriod}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Select period" /></SelectTrigger><SelectContent><SelectItem value="1month">Last Month</SelectItem><SelectItem value="3months">Last 3 Months</SelectItem><SelectItem value="6months">Last 6 Months</SelectItem><SelectItem value="1year">Last Year</SelectItem></SelectContent></Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg"><Users className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold">{totalStudents}</p><p className="text-sm text-muted-foreground">Total Students</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-500/10 rounded-lg"><GraduationCap className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold">{totalInterns}</p><p className="text-sm text-muted-foreground">Total Interns</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-lg"><Building2 className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{topHospitals.length}</p><p className="text-sm text-muted-foreground">Partner Hospitals</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-amber-500/10 rounded-lg"><Briefcase className="w-5 h-5 text-amber-600" /></div><div><p className="text-2xl font-bold">{internshipStats.find((s: any) => s.status === 'active')?.count || 0}</p><p className="text-sm text-muted-foreground">Active Internships</p></div></div></CardContent></Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="hospitals">Hospitals</TabsTrigger><TabsTrigger value="students">Students</TabsTrigger></TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card><CardHeader><CardTitle>Platform Growth</CardTitle><CardDescription>Monthly registration and internship trends</CardDescription></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="students" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="internships" stackId="2" stroke="hsl(142, 76%, 36%)" fill="hsl(142, 76%, 36%)" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card><CardHeader><CardTitle>Applications Volume</CardTitle><CardDescription>Monthly application submissions</CardDescription></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Bar dataKey="applications" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hospitals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card><CardHeader><CardTitle>Interns by Hospital</CardTitle><CardDescription>Distribution of current interns</CardDescription></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={hospitalDistribution} cx="50%" cy="50%" outerRadius={100} innerRadius={60} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {hospitalDistribution.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card><CardHeader><CardTitle>Interns by Department</CardTitle><CardDescription>Across all hospitals</CardDescription></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Bar dataKey="interns" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card><CardHeader><CardTitle>Students by University</CardTitle><CardDescription>Source universities of registered students</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={universityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" angle={-20} textAnchor="end" height={80} />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
