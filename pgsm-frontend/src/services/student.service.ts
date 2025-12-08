import api, { ApiResponse } from '@/lib/api';

export const studentService = {
  async getDashboard() {
    const response = await api.get<ApiResponse>('/students/dashboard');
    return response.data;
  },

  async getAllStudents(params?: { page?: number; limit?: number; search?: string; faculty?: string }) {
    const response = await api.get<ApiResponse>('/students', { params });
    return response.data;
  },

  async getStudentById(id: string) {
    const response = await api.get<ApiResponse>(`/students/${id}`);
    return response.data;
  },

  async getStudentInternships(id: string, status?: string) {
    const response = await api.get<ApiResponse>(`/students/${id}/internships`, { params: { status } });
    return response.data;
  },

  async getStudentApplications(id: string, status?: string) {
    const response = await api.get<ApiResponse>(`/students/${id}/applications`, { params: { status } });
    return response.data;
  },
};
