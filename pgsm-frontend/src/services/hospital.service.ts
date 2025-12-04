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
};
