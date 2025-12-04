import api, { ApiResponse } from '@/lib/api';

export interface Tutor {
  id: string;
  user_id: string;
  hospital_id?: string;
  specialization?: string;
  department?: string;
  title?: string;
  license_number?: string;
  years_experience?: number;
  bio?: string;
  is_available: boolean;
  max_students: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  active_students?: number;
  hospital_name?: string;
  specialty?: string;
}

export const tutorService = {
  async getHospitalTutors() {
    const response = await api.get<ApiResponse<Tutor[]>>('/tutors');
    return response.data;
  },

  async getTutors() {
    const response = await api.get<ApiResponse<Tutor[]>>('/tutors');
    return response.data;
  },

  async getTutorById(id: string) {
    const response = await api.get<ApiResponse<Tutor & { students: any[] }>>(`/tutors/${id}`);
    return response.data;
  },

  async addTutor(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    specialization?: string;
    department?: string;
    title?: string;
    license_number?: string;
    years_experience?: number;
    max_students?: number;
  }) {
    const response = await api.post<ApiResponse<{ id: string }>>('/tutors', data);
    return response.data;
  },

  async updateTutor(id: string, data: Partial<Tutor>) {
    const response = await api.put<ApiResponse>(`/tutors/${id}`, data);
    return response.data;
  },

  async removeTutor(id: string) {
    const response = await api.delete<ApiResponse>(`/tutors/${id}`);
    return response.data;
  },

  async assignStudent(tutorId: string, internshipId: string) {
    const response = await api.post<ApiResponse>('/tutors/assign', { tutor_id: tutorId, internship_id: internshipId });
    return response.data;
  },

  async getDashboard() {
    const response = await api.get<ApiResponse>('/tutors/dashboard');
    return response.data;
  },

  async getStudents() {
    const response = await api.get<ApiResponse>('/tutors/students');
    return response.data;
  },
};
