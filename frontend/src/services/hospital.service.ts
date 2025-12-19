import api, { ApiResponse } from '@/lib/api';

export const hospitalService = {
  async getDashboard() {
    const response = await api.get<ApiResponse>('/hospitals/dashboard');
    return response.data;
  },

  async getAllHospitals(params?: { page?: number; limit?: number; search?: string; city?: string; type?: string }) {
    const response = await api.get<ApiResponse>('/hospitals', { params });
    return response.data;
  },

  async getHospitalById(id: string) {
    const response = await api.get<ApiResponse>(`/hospitals/${id}`);
    return response.data;
  },

  async getHospitalStudents(status?: string) {
    const response = await api.get<ApiResponse>('/hospitals/students', { params: { status } });
    return response.data;
  },

  async getStatistics() {
    const response = await api.get<ApiResponse>('/hospitals/statistics');
    return response.data;
  },

  async getProfile() {
    const response = await api.get<ApiResponse>('/hospitals/profile');
    return response.data;
  },

  async updateProfile(data: {
    name?: string;
    type?: string;
    description?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    contact_phone?: string;
  }) {
    const response = await api.put<ApiResponse>('/hospitals/profile', data);
    return response.data;
  },

  // Service management
  async getServices() {
    // Assuming route is /services based on typical pattern, will verify with routes file check
    const response = await api.get<ApiResponse>('/services');
    return response.data;
  },

  async getDepartments() {
    const response = await api.get<ApiResponse>('/services/departments');
    return response.data;
  },

  async createService(data: any) {
    const response = await api.post<ApiResponse>('/services', data);
    return response.data;
  },

  async updateService(id: string, data: any) {
    const response = await api.put<ApiResponse>(`/services/${id}`, data);
    return response.data;
  },

  async deleteService(id: string) {
    const response = await api.delete<ApiResponse>(`/services/${id}`);
    return response.data;
  },
};

export interface Service {
  id: string;
  name: string;
  department: string;
  description?: string;
  capacity: number;
  current_interns?: number;
  floor?: string;
  phone?: string;
  email?: string;
  head_doctor_name?: string;
  head_doctor_id?: string;
  is_active: boolean;
  accepts_interns: boolean;
  hospital_id: string;
}
