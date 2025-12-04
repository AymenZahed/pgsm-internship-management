import api, { ApiResponse } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  role: 'student' | 'doctor' | 'hospital' | 'admin';
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  student_number?: string;
  faculty?: string;
  academic_year?: string;
  is_active: boolean;
  active_internships?: number;
  total_applications?: number;
}

export interface Hospital {
  id: string;
  user_id: string;
  name: string;
  type: string;
  city?: string;
  active_offers?: number;
  current_interns?: number;
  services_count?: number;
  is_verified: boolean;
  created_at: string;
}

export interface Internship {
  id: string;
  student_id: string;
  hospital_id: string;
  first_name: string;
  last_name: string;
  hospital_name: string;
  service_name?: string;
  tutor_name?: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  progress: number;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  user_role?: string;
  responses_count?: number;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  category: string;
}

export interface Report {
  id: string;
  name: string;
  type: string;
  status: 'ready' | 'generating' | 'failed';
  file_path?: string;
  file_size?: string;
  created_at: string;
}

export const adminService = {
  // Dashboard
  async getDashboardStats() {
    const response = await api.get<ApiResponse<{
      stats: any;
      recentActivity: any[];
      monthlyStats: any[];
    }>>('/admin/dashboard');
    return response.data;
  },

  // Users
  async getUsers(params?: { page?: number; limit?: number; search?: string; role?: string; is_active?: string }) {
    const response = await api.get<ApiResponse<User[]>>('/admin/users', { params });
    return response.data;
  },

  async createUser(data: {
    email: string;
    password: string;
    role: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) {
    const response = await api.post<ApiResponse<{ id: string }>>('/admin/users', data);
    return response.data;
  },

  async updateUser(id: string, data: Partial<User>) {
    const response = await api.put<ApiResponse>(`/admin/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await api.delete<ApiResponse>(`/admin/users/${id}`);
    return response.data;
  },

  // Students
  async getStudents(params?: { page?: number; limit?: number; search?: string; faculty?: string; status?: string }) {
    const response = await api.get<ApiResponse<Student[]>>('/admin/students', { params });
    return response.data;
  },

  async getStudentById(id: string) {
    const response = await api.get<ApiResponse<Student>>(`/admin/students/${id}`);
    return response.data;
  },

  async updateStudent(id: string, data: Partial<Student>) {
    const response = await api.put<ApiResponse>(`/admin/students/${id}`, data);
    return response.data;
  },

  async deleteStudent(id: string) {
    const response = await api.delete<ApiResponse>(`/admin/students/${id}`);
    return response.data;
  },

  // Hospitals
  async getHospitals(params?: { page?: number; limit?: number; search?: string; type?: string; status?: string }) {
    const response = await api.get<ApiResponse<Hospital[]>>('/admin/hospitals', { params });
    return response.data;
  },

  async getHospitalById(id: string) {
    const response = await api.get<ApiResponse<Hospital>>(`/admin/hospitals/${id}`);
    return response.data;
  },

  async createHospital(data: any) {
    const response = await api.post<ApiResponse<{ id: string }>>('/admin/hospitals', data);
    return response.data;
  },

  async updateHospital(id: string, data: any) {
    const response = await api.put<ApiResponse>(`/admin/hospitals/${id}`, data);
    return response.data;
  },

  async deleteHospital(id: string) {
    const response = await api.delete<ApiResponse>(`/admin/hospitals/${id}`);
    return response.data;
  },

  // Internships
  async getInternships(params?: { page?: number; limit?: number; search?: string; hospital_id?: string; status?: string }) {
    const response = await api.get<ApiResponse<Internship[]>>('/admin/internships', { params });
    return response.data;
  },

  async getInternshipById(id: string) {
    const response = await api.get<ApiResponse<Internship>>(`/admin/internships/${id}`);
    return response.data;
  },

  // Activity Logs
  async getActivityLogs(params?: { page?: number; limit?: number; user_id?: string; action?: string; date_from?: string; date_to?: string }) {
    const response = await api.get<ApiResponse<ActivityLog[]>>('/admin/logs', { params });
    return response.data;
  },

  // Statistics
  async getStatistics() {
    const response = await api.get<ApiResponse<{
      applicationStats: any[];
      internshipStats: any[];
      topHospitals: any[];
      evaluationStats: any;
      monthlyData: any[];
      departmentData: any[];
      universityData: any[];
    }>>('/admin/statistics');
    return response.data;
  },

  // Support Tickets
  async getSupportTickets(params?: { page?: number; limit?: number; status?: string; priority?: string }) {
    const response = await api.get<ApiResponse<SupportTicket[]>>('/admin/support', { params });
    return response.data;
  },

  async getSupportTicketById(id: string) {
    const response = await api.get<ApiResponse<SupportTicket>>(`/admin/support/${id}`);
    return response.data;
  },

  async updateSupportTicket(id: string, data: Partial<SupportTicket>) {
    const response = await api.put<ApiResponse>(`/admin/support/${id}`, data);
    return response.data;
  },

  async replySupportTicket(id: string, message: string) {
    const response = await api.post<ApiResponse>(`/admin/support/${id}/reply`, { message });
    return response.data;
  },

  // Configuration
  async getConfiguration() {
    const response = await api.get<ApiResponse<Record<string, any>>>('/admin/configuration');
    return response.data;
  },

  async updateConfiguration(data: Record<string, any>) {
    const response = await api.put<ApiResponse>('/admin/configuration', data);
    return response.data;
  },

  // Reports
  async getReports(params?: { page?: number; limit?: number; type?: string }) {
    const response = await api.get<ApiResponse<Report[]>>('/admin/reports', { params });
    return response.data;
  },

  async generateReport(data: { type: string; start_date?: string; end_date?: string; format: string }) {
    const response = await api.post<ApiResponse<{ id: string }>>('/admin/reports/generate', data);
    return response.data;
  },

  async downloadReport(id: string) {
    const response = await api.get(`/admin/reports/${id}/download`, { responseType: 'blob' });
    return response.data;
  },

  // Export
  async exportUsers(format: 'csv' | 'excel' = 'csv') {
    const response = await api.get(`/admin/export/users?format=${format}`, { responseType: 'blob' });
    return response.data;
  },

  async exportStudents(format: 'csv' | 'excel' = 'csv') {
    const response = await api.get(`/admin/export/students?format=${format}`, { responseType: 'blob' });
    return response.data;
  },

  async exportInternships(format: 'csv' | 'excel' = 'csv') {
    const response = await api.get(`/admin/export/internships?format=${format}`, { responseType: 'blob' });
    return response.data;
  },

  // Send email
  async sendEmail(userId: string, subject: string, message: string) {
    const response = await api.post<ApiResponse>('/admin/send-email', { user_id: userId, subject, message });
    return response.data;
  },
};
