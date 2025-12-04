import api, { ApiResponse } from '@/lib/api';

export const authService = {
  async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.post<ApiResponse>('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await api.post<ApiResponse>('/auth/forgot-password', { email });
    return response.data;
  },

  async getProfile() {
    const response = await api.get<ApiResponse>('/users/profile');
    return response.data;
  },

  async updateProfile(data: any) {
    const response = await api.put<ApiResponse>('/users/profile', data);
    return response.data;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post<ApiResponse>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getSettings() {
    const response = await api.get<ApiResponse>('/users/settings');
    return response.data;
  },

  async updateSettings(data: any) {
    const response = await api.put<ApiResponse>('/users/settings', data);
    return response.data;
  },
};
