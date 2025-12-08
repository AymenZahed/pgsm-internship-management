import api, { ApiResponse } from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  profile?: {
    student_number?: string;
    faculty?: string;
    department?: string;
    academic_year?: string;
    date_of_birth?: string;
    address?: string;
    city?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    bio?: string;
  };
}

export interface UserSettings {
  id?: string;
  user_id?: string;
  language: string;
  theme: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications?: boolean;
  application_updates?: boolean;
  evaluation_alerts?: boolean;
  message_alerts?: boolean;
  internship_reminders?: boolean;
  daily_digest?: boolean;
  two_factor_enabled?: boolean;
  session_timeout?: string;
  login_alerts?: boolean;
  timezone?: string;
  date_format?: string;
}

export const userService = {
  async getProfile(id?: string) {
    const url = id ? `/users/profile/${id}` : '/users/profile';
    const response = await api.get<ApiResponse<UserProfile>>(url);
    return response.data;
  },

  async updateProfile(data: Partial<UserProfile>) {
    const response = await api.put<ApiResponse>('/users/profile', data);
    return response.data;
  },

  async updateAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post<ApiResponse<{ avatar: string }>>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getSettings() {
    const response = await api.get<ApiResponse<UserSettings>>('/users/settings');
    return response.data;
  },

  async updateSettings(data: Partial<UserSettings>) {
    const response = await api.put<ApiResponse>('/users/settings', data);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.post<ApiResponse>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  async sendContactEmail(data: { subject: string; message: string }) {
    const response = await api.post<ApiResponse>('/users/contact', data);
    return response.data;
  },
};
