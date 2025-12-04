import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ContactSupport from "./pages/ContactSupport";
import NotFound from "./pages/NotFound";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import InternshipsList from "./pages/student/InternshipsList";
import StudentProfile from "./pages/student/Profile";
import Applications from "./pages/student/Applications";
import ApplicationDetails from "./pages/student/ApplicationDetails";
import MyInternships from "./pages/student/MyInternships";
import MyInternshipDetails from "./pages/student/MyInternshipDetails";
import Logbook from "./pages/student/Logbook";
import Attendance from "./pages/student/Attendance";
import Evaluations from "./pages/student/Evaluations";
import Messages from "./pages/student/Messages";
import Notifications from "./pages/student/Notifications";
import StudentSettings from "./pages/student/Settings";
import InternshipDetails from "./pages/student/InternshipDetails";
import ApplyInternship from "./pages/student/ApplyInternship";

// Hospital Pages
import HospitalDashboard from "./pages/hospital/Dashboard";
import HospitalProfile from "./pages/hospital/Profile";
import HospitalServices from "./pages/hospital/Services";
import HospitalOffers from "./pages/hospital/Offers";
import HospitalApplications from "./pages/hospital/Applications";
import HospitalStudents from "./pages/hospital/Students";
import HospitalTutors from "./pages/hospital/Tutors";
import HospitalStatistics from "./pages/hospital/Statistics";
import CreateOffer from "./pages/hospital/CreateOffer";
import AddService from "./pages/hospital/AddService";
import OfferDetails from "./pages/hospital/OfferDetails";
import ServiceDetails from "./pages/hospital/ServiceDetails";
import HospitalStudentDetails from "./pages/hospital/StudentDetails";
import HospitalTutorDetails from "./pages/hospital/TutorDetails";
import HospitalApplicationDetails from "./pages/hospital/ApplicationDetails";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorProfile from "./pages/doctor/Profile";
import DoctorStudents from "./pages/doctor/Students";
import AttendanceValidation from "./pages/doctor/AttendanceValidation";
import LogbookReview from "./pages/doctor/LogbookReview";
import DoctorEvaluations from "./pages/doctor/Evaluations";
import DoctorMessages from "./pages/doctor/Messages";
import DoctorSettings from "./pages/doctor/Settings";
import DoctorStudentDetails from "./pages/doctor/StudentDetails";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminStudents from "./pages/admin/Students";
import AdminHospitals from "./pages/admin/Hospitals";
import AdminInternships from "./pages/admin/Internships";
import AdminStatistics from "./pages/admin/Statistics";
import AdminReports from "./pages/admin/Reports";
import AdminConfiguration from "./pages/admin/Configuration";
import AdminLogs from "./pages/admin/Logs";
import AdminSupport from "./pages/admin/Support";
import AdminSettings from "./pages/admin/Settings";
import HospitalSettings from "./pages/hospital/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="pgsm-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/contact-support" element={<ContactSupport />} />
              
              {/* Student Routes */}
              <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/internships" element={<ProtectedRoute allowedRoles={['student']}><InternshipsList /></ProtectedRoute>} />
              <Route path="/student/internships/:id" element={<ProtectedRoute allowedRoles={['student']}><InternshipDetails /></ProtectedRoute>} />
              <Route path="/student/internships/:id/apply" element={<ProtectedRoute allowedRoles={['student']}><ApplyInternship /></ProtectedRoute>} />
              <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>} />
              <Route path="/student/applications" element={<ProtectedRoute allowedRoles={['student']}><Applications /></ProtectedRoute>} />
              <Route path="/student/applications/:id" element={<ProtectedRoute allowedRoles={['student']}><ApplicationDetails /></ProtectedRoute>} />
              <Route path="/student/my-internships" element={<ProtectedRoute allowedRoles={['student']}><MyInternships /></ProtectedRoute>} />
              <Route path="/student/my-internships/:id" element={<ProtectedRoute allowedRoles={['student']}><MyInternshipDetails /></ProtectedRoute>} />
              <Route path="/student/logbook" element={<ProtectedRoute allowedRoles={['student']}><Logbook /></ProtectedRoute>} />
              <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><Attendance /></ProtectedRoute>} />
              <Route path="/student/evaluations" element={<ProtectedRoute allowedRoles={['student']}><Evaluations /></ProtectedRoute>} />
              <Route path="/student/messages" element={<ProtectedRoute allowedRoles={['student']}><Messages /></ProtectedRoute>} />
              <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><Notifications /></ProtectedRoute>} />
              <Route path="/student/settings" element={<ProtectedRoute allowedRoles={['student']}><StudentSettings /></ProtectedRoute>} />
              
              {/* Hospital Routes */}
              <Route path="/hospital/dashboard" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalDashboard /></ProtectedRoute>} />
              <Route path="/hospital/profile" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalProfile /></ProtectedRoute>} />
              <Route path="/hospital/services" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalServices /></ProtectedRoute>} />
              <Route path="/hospital/services/add" element={<ProtectedRoute allowedRoles={['hospital']}><AddService /></ProtectedRoute>} />
              <Route path="/hospital/services/:id" element={<ProtectedRoute allowedRoles={['hospital']}><ServiceDetails /></ProtectedRoute>} />
              <Route path="/hospital/offers" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalOffers /></ProtectedRoute>} />
              <Route path="/hospital/offers/create" element={<ProtectedRoute allowedRoles={['hospital']}><CreateOffer /></ProtectedRoute>} />
              <Route path="/hospital/offers/:id" element={<ProtectedRoute allowedRoles={['hospital']}><OfferDetails /></ProtectedRoute>} />
              <Route path="/hospital/applications" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalApplications /></ProtectedRoute>} />
              <Route path="/hospital/applications/:id" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalApplicationDetails /></ProtectedRoute>} />
              <Route path="/hospital/students" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalStudents /></ProtectedRoute>} />
              <Route path="/hospital/students/:id" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalStudentDetails /></ProtectedRoute>} />
              <Route path="/hospital/tutors" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalTutors /></ProtectedRoute>} />
              <Route path="/hospital/tutors/:id" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalTutorDetails /></ProtectedRoute>} />
              <Route path="/hospital/statistics" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalStatistics /></ProtectedRoute>} />
              <Route path="/hospital/settings" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalSettings /></ProtectedRoute>} />
              
              {/* Doctor Routes */}
              <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
              <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorProfile /></ProtectedRoute>} />
              <Route path="/doctor/students" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorStudents /></ProtectedRoute>} />
              <Route path="/doctor/students/:id" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorStudentDetails /></ProtectedRoute>} />
              <Route path="/doctor/attendance" element={<ProtectedRoute allowedRoles={['doctor']}><AttendanceValidation /></ProtectedRoute>} />
              <Route path="/doctor/logbook" element={<ProtectedRoute allowedRoles={['doctor']}><LogbookReview /></ProtectedRoute>} />
              <Route path="/doctor/evaluations" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorEvaluations /></ProtectedRoute>} />
              <Route path="/doctor/messages" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorMessages /></ProtectedRoute>} />
              <Route path="/doctor/settings" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorSettings /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>} />
              <Route path="/admin/hospitals" element={<ProtectedRoute allowedRoles={['admin']}><AdminHospitals /></ProtectedRoute>} />
              <Route path="/admin/internships" element={<ProtectedRoute allowedRoles={['admin']}><AdminInternships /></ProtectedRoute>} />
              <Route path="/admin/statistics" element={<ProtectedRoute allowedRoles={['admin']}><AdminStatistics /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
              <Route path="/admin/configuration" element={<ProtectedRoute allowedRoles={['admin']}><AdminConfiguration /></ProtectedRoute>} />
              <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['admin']}><AdminLogs /></ProtectedRoute>} />
              <Route path="/admin/support" element={<ProtectedRoute allowedRoles={['admin']}><AdminSupport /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
