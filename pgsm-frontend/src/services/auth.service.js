import api from './api';

class AuthService {
  // Login user with email and password
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    
    // Handle different response formats
    const userData = response.data?.user || response.data || response;
    
    if (userData.accessToken) {
      // Save tokens to local storage
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    return userData;
  }
  
  // Logout user
  logout() {
    // Remove user from local storage
    localStorage.removeItem('user');
  }
  
  // Register new user
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data || response;
  }
  
  // Refresh access token
  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    
    const tokens = response.data || response;
    
    if (tokens.accessToken) {
      // Update tokens in local storage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.accessToken = tokens.accessToken;
      if (tokens.refreshToken) {
        user.refreshToken = tokens.refreshToken;
      }
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return tokens;
  }
  
  // Forgot password
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response;
  }
  
  // Reset password
  async resetPassword(token, password) {
    const response = await api.post('/auth/reset-password', { token, password });
    return response;
  }
  
  // Verify email
  async verifyEmail(token) {
    const response = await api.post('/auth/verify-email', { token });
    return response;
  }
  
  // Get current user from local storage
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }
  
  // Check if user is authenticated
  isAuthenticated() {
    const user = this.getCurrentUser();
    return !!user?.accessToken;
  }
  
  // Get user role
  getUserRole() {
    const user = this.getCurrentUser();
    return user?.role;
  }
  
  // Check if user has required role
  hasRole(requiredRole) {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    
    // Handle role hierarchy if needed
    const roleHierarchy = {
      admin: ['admin', 'hospital', 'doctor', 'student'],
      hospital: ['hospital', 'doctor', 'student'],
      doctor: ['doctor', 'student'],
      student: ['student']
    };
    
    return roleHierarchy[userRole]?.includes(requiredRole) || false;
  }
  
  // Check if user has any of the required roles
  hasAnyRole(requiredRoles) {
    if (!Array.isArray(requiredRoles)) return false;
    return requiredRoles.some(role => this.hasRole(role));
  }
}

export default new AuthService();
