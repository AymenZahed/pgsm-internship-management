import api, { ApiResponse } from '@/lib/api';

export interface Offer {
  id: string;
  title: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  department?: string;
  type?: 'required' | 'optional' | 'summer';
  duration_weeks?: number;
  positions: number;
  filled_positions?: number;
  start_date: string;
  end_date: string;
  application_deadline?: string;
  status: 'draft' | 'published' | 'closed' | 'cancelled';
  hospital_name?: string;
  hospital_city?: string;
  hospital_logo?: string;
  service_name?: string;
  available_positions?: number;
  applicants?: number;
  created_at?: string;
  tutor_id?: string;
}

export const offerService = {
  async getAllOffers(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    city?: string; 
    department?: string;
    type?: string;
    hospital_id?: string;
  }) {
    const response = await api.get<ApiResponse<Offer[]>>('/offers', { params });
    return response.data;
  },

  async getOfferById(id: string) {
    const response = await api.get<ApiResponse<Offer>>(`/offers/${id}`);
    return response.data;
  },

  async getMyOffers(status?: string) {
    const response = await api.get<ApiResponse<Offer[]>>('/offers/my-offers', { params: { status } });
    return response.data;
  },

  async getHospitalOffers() {
    const response = await api.get<ApiResponse<Offer[]>>('/offers/my-offers');
    return response.data;
  },

  async createOffer(data: Partial<Offer>) {
    const response = await api.post<ApiResponse<{ id: string }>>('/offers', data);
    return response.data;
  },

  async updateOffer(id: string, data: Partial<Offer>) {
    const response = await api.put<ApiResponse>(`/offers/${id}`, data);
    return response.data;
  },

  async deleteOffer(id: string) {
    const response = await api.delete<ApiResponse>(`/offers/${id}`);
    return response.data;
  },

  async copyOffer(id: string) {
    const response = await api.post<ApiResponse<{ id: string }>>(`/offers/${id}/copy`);
    return response.data;
  },

  async getFilterOptions() {
    const response = await api.get<ApiResponse<{ cities: string[]; departments: string[] }>>('/offers/filter-options');
    return response.data;
  },
};
