import { defineStore } from 'pinia';
import AuthService from '@/services/auth.service';

const user = JSON.parse(localStorage.getItem('user'));

export const useAuthStore = defineStore('auth', {
  state: () => ({
    status: {
      loggedIn: !!user,
    },
    user: user || null,
  }),

  getters: {
    isAuthenticated: (state) => state.status.loggedIn,
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role,
    accessToken: (state) => state.user?.accessToken,
    refreshToken: (state) => state.user?.refreshToken,
    isAdmin: (state) => state.user?.role === 'admin',
    isHospital: (state) => state.user?.role === 'hospital',
    isDoctor: (state) => state.user?.role === 'doctor',
    isStudent: (state) => state.user?.role === 'student',
  },

  actions: {
    async login({ email, password }) {
      try {
        const response = await AuthService.login(email, password);
        const userData = response.data?.user || response;
        
        this.status.loggedIn = true;
        this.user = userData;
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        return userData;
      } catch (error) {
        this.status.loggedIn = false;
        this.user = null;
        throw error;
      }
    },

    logout() {
      AuthService.logout();
      this.status.loggedIn = false;
      this.user = null;
    },

    async refreshToken() {
      try {
        const refreshToken = this.user?.refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await AuthService.refreshToken(refreshToken);
        const { accessToken, refreshToken: newRefreshToken } = response.data || response;
        
        this.user = {
          ...this.user,
          accessToken,
          refreshToken: newRefreshToken || refreshToken,
        };
        
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return { accessToken, refreshToken: newRefreshToken || refreshToken };
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    setUser(user) {
      this.status.loggedIn = true;
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },

    async register(userData) {
      try {
        const response = await AuthService.register(userData);
        return response.data || response;
      } catch (error) {
        throw error;
      }
    },

    async forgotPassword(email) {
      try {
        await AuthService.forgotPassword(email);
      } catch (error) {
        throw error;
      }
    },

    async resetPassword({ token, password }) {
      try {
        await AuthService.resetPassword(token, password);
      } catch (error) {
        throw error;
      }
    },
  },
});
