import api from './api';

class NotificationService {
  // Get all notifications
  async getNotifications(params = {}) {
    const response = await api.get('/notifications', { params });
    return {
      data: response.data.notifications,
      pagination: response.pagination,
      unreadCount: response.unreadCount
    };
  }
  
  // Get notification by ID
  async getNotificationById(notificationId) {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data;
  }
  
  // Mark notification as read
  async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  }
  
  // Mark all notifications as read
  async markAllAsRead() {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  }
  
  // Delete notification
  async deleteNotification(notificationId) {
    await api.delete(`/notifications/${notificationId}`);
  }
  
  // Clear all notifications
  async clearAll() {
    await api.delete('/notifications');
  }
  
  // Get unread count
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  }
  
  // Get notification preferences
  async getPreferences() {
    const response = await api.get('/notifications/preferences');
    return response.data;
  }
  
  // Update notification preferences
  async updatePreferences(preferences) {
    const response = await api.put('/notifications/preferences', { preferences });
    return response.data;
  }
  
  // Subscribe to push notifications
  async subscribeToPushNotifications(subscription) {
    const response = await api.post('/notifications/subscribe', { subscription });
    return response.data;
  }
  
  // Unsubscribe from push notifications
  async unsubscribeFromPushNotifications(subscriptionId) {
    await api.delete(`/notifications/unsubscribe/${subscriptionId}`);
  }
  
  // Get notification settings
  async getNotificationSettings() {
    const response = await api.get('/notifications/settings');
    return response.data;
  }
  
  // Update notification settings
  async updateNotificationSettings(settings) {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
  }
  
  // Get notification history
  async getNotificationHistory(params = {}) {
    const response = await api.get('/notifications/history', { params });
    return {
      data: response.data.notifications,
      pagination: response.pagination
    };
  }
  
  // Create a test notification
  async sendTestNotification(type = 'info') {
    const response = await api.post('/notifications/test', { type });
    return response.data;
  }
}

export default new NotificationService();
