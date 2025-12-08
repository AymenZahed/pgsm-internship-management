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

export interface AddTutorData {
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
  is_available?: boolean;
  hospital_id?: string;
}

export interface UpdateTutorData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  specialization?: string;
  department?: string;
  title?: string;
  license_number?: string;
  years_experience?: number;
  bio?: string;
  is_available?: boolean;
  max_students?: number;
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

  async addTutor(data: AddTutorData) {
    // Ensure proper data structure for backend
    const tutorData = {
      ...data,
      role: 'doctor', // Make sure to include role for user creation
      is_active: true,
      is_available: data.is_available ?? true,
      max_students: data.max_students ?? 5,
    };
    
    const response = await api.post<ApiResponse<{ id: string }>>('/tutors', tutorData);
    return response.data;
  },

  async updateTutor(id: string, data: UpdateTutorData) {
    const response = await api.put<ApiResponse>(`/tutors/${id}`, data);
    return response.data;
  },

  async removeTutor(id: string) {
    const response = await api.delete<ApiResponse>(`/tutors/${id}`);
    return response.data;
  },

  async assignStudent(tutorId: string, internshipId: string) {
    const response = await api.post<ApiResponse>('/tutors/assign', { 
      tutor_id: tutorId, 
      internship_id: internshipId 
    });
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

  async getDepartments() {
    try {
      const response = await api.get<ApiResponse<string[]>>('/tutors/filter/departments');
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      return { success: false, message: 'Failed to fetch departments', data: [] };
    }
  },
};
