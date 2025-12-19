import api, { ApiResponse } from '@/lib/api';

// In your offer.service.ts file, update the Offer interface:
export interface Offer {
  id: string;
  title: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  department?: string; // This is from the service's department
  type?: 'required' | 'optional' | 'summer';
  duration_weeks: number;
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
  // REMOVE tutor_id since it doesn't exist in your database
  // tutor_id?: string;
  hospital_id?: string;
  service_id?: string;
  skills_required?: string[];
  benefits?: string;
}

export interface FilterOptions {
  cities: string[];
  departments: string[];
}

export interface OfferStats {
  total: number;
  active: number;
  totalPositions: number;
  totalApplicants: number;
}

export interface Service {
  id: string;
  name: string;
  department?: string;
}

export interface Tutor {
  id: string;
  first_name: string;
  last_name: string;
  specialization?: string;
  department?: string;
  title?: string;
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
    status?: string;
  }) {
    const response = await api.get<ApiResponse<Offer[]>>('/offers', { params });
    return response.data;
  },

  async getOfferById(id: string) {
    const response = await api.get<ApiResponse<Offer>>(`/offers/${id}`);
    return response.data;
  },

  async getMyOffers(status?: string) {
    const response = await api.get<ApiResponse<Offer[]>>('/offers/my-offers', { 
      params: status ? { status } : {} 
    });
    return response.data;
  },

  async getHospitalOffers() {
    const response = await api.get<ApiResponse<Offer[]>>('/offers/my-offers');
    return response.data;
  },

  async createOffer(data: Partial<Offer>) {
    const response = await api.post<ApiResponse<Offer>>('/offers/', data);
    return response.data;
  },

  async updateOffer(id: string, data: Partial<Offer>) {
    const response = await api.put<ApiResponse<Offer>>(`/offers/${id}`, data);
    return response.data;
  },

  async deleteOffer(id: string) {
    const response = await api.delete<ApiResponse>(`/offers/${id}`);
    return response.data;
  },

  async getFilterOptions() {
    const response = await api.get<ApiResponse<FilterOptions>>('/offers/filter-options');
    return response.data;
  },

  async getDepartments() {
    const response = await api.get<ApiResponse<string[]>>('/offers/departments');
    return response.data;
  },

  async publishOffer(id: string) {
    const response = await api.patch<ApiResponse>(`/offers/${id}/publish`);
    return response.data;
  },

  async closeOffer(id: string) {
    const response = await api.patch<ApiResponse>(`/offers/${id}/close`);
    return response.data;
  },

  async cancelOffer(id: string) {
    const response = await api.patch<ApiResponse>(`/offers/${id}/cancel`);
    return response.data;
  },

  async getServices() {
    const response = await api.get<ApiResponse<Service[]>>('/services');
    return response.data;
  },

  async getTutors() {
    const response = await api.get<ApiResponse<Tutor[]>>('/tutors');
    return response.data;
  },

  async getHospitalStats() {
    const response = await api.get<ApiResponse<OfferStats>>('/offers/stats');
    return response.data;
  }
};