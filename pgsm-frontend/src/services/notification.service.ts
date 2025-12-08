import api, { ApiResponse } from '@/lib/api';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  data?: any;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  priority?: 'high' | 'normal';
}

export const notificationService = {
  async getNotifications(params?: { page?: number; limit?: number; unread_only?: boolean }) {
    const response = await api.get<ApiResponse<{ notifications: Notification[]; unread_count: number }>>('/notifications', { params });
    return response.data;
  },

  async markAsRead(id: string) {
    const response = await api.put<ApiResponse>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.put<ApiResponse>('/notifications/read-all');
    return response.data;
  },

  async deleteNotification(id: string) {
    const response = await api.delete<ApiResponse>(`/notifications/${id}`);
    return response.data;
  },

  async clearAll() {
    const response = await api.delete<ApiResponse>('/notifications/clear-all');
    return response.data;
  },
};
