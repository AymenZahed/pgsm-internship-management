import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, Download, Calendar as CalendarIcon, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  size: string;
  status: "ready" | "generating" | "failed";
}

const recentReports: Report[] = [
  { id: "1", name: "Monthly Internship Summary - January 2024", type: "Internships", generatedAt: "2024-01-30 14:30", size: "2.4 MB", status: "ready" },
  { id: "2", name: "Student Performance Report Q4 2023", type: "Students", generatedAt: "2024-01-28 09:15", size: "5.1 MB", status: "ready" },
  { id: "3", name: "Hospital Activity Report - January 2024", type: "Hospitals", generatedAt: "2024-01-27 16:45", size: "1.8 MB", status: "ready" },
  { id: "4", name: "Applications Analytics - January 2024", type: "Applications", generatedAt: "2024-01-25 11:20", size: "3.2 MB", status: "ready" },
  { id: "5", name: "Attendance Compliance Report", type: "Attendance", generatedAt: "2024-01-30 15:00", size: "-", status: "generating" },
];

const reportTemplates = [
  { id: "internship_summary", name: "Internship Summary", description: "Overview of all internships with status and progress" },
  { id: "student_performance", name: "Student Performance", description: "Detailed student evaluations and attendance" },
  { id: "hospital_activity", name: "Hospital Activity", description: "Hospital offers, applications, and intern statistics" },
  { id: "application_analytics", name: "Application Analytics", description: "Application trends, acceptance rates, and demographics" },
  { id: "attendance_report", name: "Attendance Report", description: "Attendance compliance across all internships" },
  { id: "evaluation_summary", name: "Evaluation Summary", description: "Summary of all student evaluations by tutors" },
];

export default function AdminReports() {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [format_, setFormat_] = useState("pdf");

  const getStatusBadge = (status: Report["status"]) => {
    switch (status) {
      case "ready":
        return <Badge className="bg-green-500/20 text-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Ready</Badge>;
      case "generating":
        return <Badge className="bg-blue-500/20 text-blue-600"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and download platform reports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generate Report */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
              <CardDescription>Create a new custom report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format_} onValueChange={setFormat_}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel (XLSX)</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-background rounded-lg">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {report.generatedAt}
                          </span>
                          {report.status === "ready" && <span>{report.size}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(report.status)}
                      {report.status === "ready" && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Available Report Templates</CardTitle>
            <CardDescription>Quick access to common report types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportTemplates.map((template) => (
                <div key={template.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
