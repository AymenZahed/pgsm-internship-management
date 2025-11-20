import api from './api';

class UserService {
  // Get current user profile
  async getProfile() {
    const response = await api.get('/users/me');
    return response.data;
  }
  
  // Update user profile
  async updateProfile(userData) {
    const response = await api.put('/users/me', userData);
    return response.data;
  }
  
  // Change password
  async changePassword(currentPassword, newPassword) {
    const response = await api.put('/users/me/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
  
  // Update profile picture
  async updateAvatar(avatarFile) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    const response = await api.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.avatarUrl;
  }
  
  // Get user by ID (admin only)
  async getUserById(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }
  
  // Get all users (admin only)
  async getUsers(params = {}) {
    const response = await api.get('/users', { params });
    return response.data;
  }
  
  // Create new user (admin only)
  async createUser(userData) {
    const response = await api.post('/users', userData);
    return response.data;
  }
  
  // Update user (admin only)
  async updateUser(userId, userData) {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  }
  
  // Delete user (admin only)
  async deleteUser(userId) {
    await api.delete(`/users/${userId}`);
  }
  
  // Search users
  async searchUsers(query, params = {}) {
    const response = await api.get('/users/search', {
      params: { query, ...params }
    });
    return response.data;
  }
  
  // Get user statistics
  async getUserStats() {
    const response = await api.get('/users/stats');
    return response.data;
  }
  
  // Verify user email
  async verifyEmail(token) {
    const response = await api.post('/users/verify-email', { token });
    return response.data;
  }
  
  // Resend verification email
  async resendVerificationEmail(email) {
    const response = await api.post('/users/resend-verification', { email });
    return response.data;
  }
  
  // Request account deletion
  async requestAccountDeletion() {
    const response = await api.post('/users/request-deletion');
    return response.data;
  }
  
  // Delete account
  async deleteAccount(confirmation) {
    await api.delete('/users/me', { data: { confirmation } });
  }
}

export default new UserService();
