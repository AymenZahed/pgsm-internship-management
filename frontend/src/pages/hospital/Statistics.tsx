import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, Calendar, Clock, GraduationCap, FileText } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const monthlyData = [
  { month: "Jan", applications: 45, accepted: 12, interns: 28 },
  { month: "Feb", applications: 52, accepted: 15, interns: 32 },
  { month: "Mar", applications: 68, accepted: 18, interns: 35 },
  { month: "Apr", applications: 42, accepted: 10, interns: 30 },
  { month: "May", applications: 38, accepted: 8, interns: 25 },
  { month: "Jun", applications: 55, accepted: 14, interns: 33 },
];

const departmentData = [
  { name: "Cardiology", students: 8, color: "#3b82f6" },
  { name: "Emergency", students: 12, color: "#ef4444" },
  { name: "Pediatrics", students: 6, color: "#22c55e" },
  { name: "Surgery", students: 10, color: "#f59e0b" },
  { name: "Neurology", students: 4, color: "#8b5cf6" },
];

const attendanceData = [
  { week: "W1", rate: 92 },
  { week: "W2", rate: 88 },
  { week: "W3", rate: 95 },
  { week: "W4", rate: 91 },
  { week: "W5", rate: 89 },
  { week: "W6", rate: 94 },
  { week: "W7", rate: 90 },
  { week: "W8", rate: 93 },
];

const universityData = [
  { name: "Université Mohammed V", students: 18 },
  { name: "Université Mohammed VI", students: 12 },
  { name: "UIC Casablanca", students: 8 },
  { name: "FMPR", students: 6 },
  { name: "Other", students: 4 },
];

export default function HospitalStatistics() {
  const [period, setPeriod] = useState("6months");

  return (
    <AppLayout role="hospital" userName="CHU Ibn Sina">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Statistics & Analytics</h1>
            <p className="text-muted-foreground mt-1">Overview of internship program performance</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">300</p>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-xs text-green-600">+12% vs last period</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">77</p>
                  <p className="text-sm text-muted-foreground">Accepted Interns</p>
                  <p className="text-xs text-green-600">25.7% acceptance rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">40</p>
                  <p className="text-sm text-muted-foreground">Active Interns</p>
                  <p className="text-xs text-muted-foreground">Across 8 departments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">91.5%</p>
                  <p className="text-sm text-muted-foreground">Avg Attendance</p>
                  <p className="text-xs text-green-600">+2.3% vs last period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="universities">Universities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Applications Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Applications & Acceptances</CardTitle>
                  <CardDescription>Monthly trend of applications received and accepted</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }} 
                      />
                      <Bar dataKey="applications" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="accepted" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Attendance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Rate</CardTitle>
                  <CardDescription>Weekly attendance percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" className="text-xs" />
                      <YAxis domain={[80, 100]} className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rate" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Students by Department</CardTitle>
                  <CardDescription>Current intern distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                        dataKey="students"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Department Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Breakdown by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentData.map((dept) => (
                      <div key={dept.name} className="flex items-center gap-4">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: dept.color }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{dept.name}</span>
                            <span className="text-sm text-muted-foreground">{dept.students} students</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all"
                              style={{ 
                                width: `${(dept.students / Math.max(...departmentData.map(d => d.students))) * 100}%`,
                                backgroundColor: dept.color 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="universities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Students by University</CardTitle>
                <CardDescription>Source universities of current interns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={universityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" width={150} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Bar dataKey="students" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
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
