import api, { ApiResponse } from '@/lib/api';
import type { Document } from '@/services/document.service';

export interface Application {
  id: string;
  student_id: string;
  offer_id: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn';
  cover_letter?: string;
  motivation?: string;
  experience?: string;
  availability_date?: string;
  notes?: string;
  rejection_reason?: string;
  created_at: string;
  offer_title?: string;
  hospital_name?: string;
  hospital_city?: string;
  department?: string;
  start_date?: string;
  end_date?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar?: string;
  student_number?: string;
  faculty?: string;
  academic_year?: string;
  profile_documents?: Document[];
  application_documents?: Document[];
}

export const applicationService = {
  async createApplication(data: {
    offer_id: string;
    cover_letter?: string;
    motivation?: string;
    experience?: string;
    availability_date?: string;
  }) {
    const response = await api.post<ApiResponse<{ id: string }>>('/applications', data);
    return response.data;
  },

  async getMyApplications(status?: string) {
    const response = await api.get<ApiResponse<Application[]>>('/applications/my-applications', { params: { status } });
    return response.data;
  },

  async getApplicationById(id: string) {
    const response = await api.get<ApiResponse<Application>>(`/applications/${id}`);
    return response.data;
  },

  async getReceivedApplications(params?: { page?: number; limit?: number; status?: string; offer_id?: string }) {
    const response = await api.get<ApiResponse<Application[]>>('/applications/received', { params });
    return response.data;
  },

  async updateApplicationStatus(id: string, data: { status: string; rejection_reason?: string; notes?: string }) {
    const response = await api.put<ApiResponse>(`/applications/${id}/status`, data);
    return response.data;
  },

  async withdrawApplication(id: string) {
    const response = await api.post<ApiResponse>(`/applications/${id}/withdraw`);
    return response.data;
  },
};
