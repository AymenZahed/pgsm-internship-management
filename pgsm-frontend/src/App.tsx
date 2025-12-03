import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";

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
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/internships" element={<InternshipsList />} />
            <Route path="/student/internships/:id" element={<InternshipDetails />} />
            <Route path="/student/internships/:id/apply" element={<ApplyInternship />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/applications" element={<Applications />} />
          <Route path="/student/applications/:id" element={<ApplicationDetails />} />
          <Route path="/student/my-internships" element={<MyInternships />} />
          <Route path="/student/my-internships/:id" element={<MyInternshipDetails />} />
          <Route path="/student/logbook" element={<Logbook />} />
          <Route path="/student/attendance" element={<Attendance />} />
          
          <Route path="/student/evaluations" element={<Evaluations />} />
          <Route path="/student/messages" element={<Messages />} />
          <Route path="/student/notifications" element={<Notifications />} />
          <Route path="/student/settings" element={<StudentSettings />} />
          
          {/* Hospital Routes */}
          <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
          <Route path="/hospital/profile" element={<HospitalProfile />} />
          <Route path="/hospital/services" element={<HospitalServices />} />
          <Route path="/hospital/services/add" element={<AddService />} />
          <Route path="/hospital/services/:id" element={<ServiceDetails />} />
          <Route path="/hospital/offers" element={<HospitalOffers />} />
          <Route path="/hospital/offers/create" element={<CreateOffer />} />
          <Route path="/hospital/offers/:id" element={<OfferDetails />} />
          <Route path="/hospital/applications" element={<HospitalApplications />} />
          <Route path="/hospital/applications/:id" element={<HospitalApplicationDetails />} />
          <Route path="/hospital/students" element={<HospitalStudents />} />
          <Route path="/hospital/students/:id" element={<HospitalStudentDetails />} />
          <Route path="/hospital/tutors" element={<HospitalTutors />} />
          <Route path="/hospital/tutors/:id" element={<HospitalTutorDetails />} />
          <Route path="/hospital/statistics" element={<HospitalStatistics />} />
          <Route path="/hospital/settings" element={<HospitalSettings />} />
          
          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
          <Route path="/doctor/students" element={<DoctorStudents />} />
          <Route path="/doctor/students/:id" element={<DoctorStudentDetails />} />
          <Route path="/doctor/attendance" element={<AttendanceValidation />} />
          
          <Route path="/doctor/logbook" element={<LogbookReview />} />
          <Route path="/doctor/evaluations" element={<DoctorEvaluations />} />
          <Route path="/doctor/messages" element={<DoctorMessages />} />
          <Route path="/doctor/settings" element={<DoctorSettings />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/hospitals" element={<AdminHospitals />} />
          <Route path="/admin/internships" element={<AdminInternships />} />
          <Route path="/admin/statistics" element={<AdminStatistics />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/configuration" element={<AdminConfiguration />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          <Route path="/admin/support" element={<AdminSupport />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
