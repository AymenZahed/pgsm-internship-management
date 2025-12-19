import api, { ApiResponse } from '@/lib/api';

export interface Service {
  id: string;
  hospital_id: string;
  name: string;
  department?: string;
  description?: string;
  capacity: number;
  floor?: string;
  phone?: string;
  email?: string;
  head_doctor_id?: string;
  head_doctor_name?: string;
  is_active: boolean;
  accepts_interns: boolean;
  current_interns?: number;
}

export const serviceService = {
  async getServices(hospitalId?: string) {
    const response = await api.get<ApiResponse<Service[]>>('/services', { params: { hospital_id: hospitalId } });
    return response.data;
  },

  async getServiceById(id: string) {
    const response = await api.get<ApiResponse<Service>>(`/services/${id}`);
    return response.data;
  },

  async createService(data: Partial<Service>) {
    const response = await api.post<ApiResponse<{ id: string }>>('/services', data);
    return response.data;
  },

  async updateService(id: string, data: Partial<Service>) {
    const response = await api.put<ApiResponse>(`/services/${id}`, data);
    return response.data;
  },

  async deleteService(id: string) {
    const response = await api.delete<ApiResponse>(`/services/${id}`);
    return response.data;
  },
};
