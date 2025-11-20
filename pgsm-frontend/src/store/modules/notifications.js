import NotificationService from '@/services/notification.service';

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  filters: {
    read: null,
    type: '',
    dateFrom: null,
    dateTo: null
  }
};

export const notifications = {
  namespaced: true,
  state: { ...initialState },
  actions: {
    async fetchNotifications({ commit, state }, { page = 1, markAsRead = false, filters = {} } = {}) {
      commit('fetchNotificationsRequest');
      try {
        const response = await NotificationService.getNotifications({
          page,
          ...state.filters,
          ...filters
        });
        
        if (markAsRead) {
          // Mark all fetched notifications as read
          await NotificationService.markAllAsRead();
          response.data = response.data.map(n => ({ ...n, read: true }));
        }
        
        commit('fetchNotificationsSuccess', {
          notifications: response.data,
          pagination: response.pagination,
          unreadCount: response.unreadCount || 0
        });
        return Promise.resolve(response);
      } catch (error) {
        commit('fetchNotificationsFailure', error);
        return Promise.reject(error);
      }
    },
    
    async markAsRead({ commit }, notificationId) {
      commit('markAsReadRequest');
      try {
        await NotificationService.markAsRead(notificationId);
        commit('markAsReadSuccess', notificationId);
        return Promise.resolve();
      } catch (error) {
        commit('markAsReadFailure', error);
        return Promise.reject(error);
      }
    },
    
    async markAllAsRead({ commit, state }) {
      commit('markAllAsReadRequest');
      try {
        await NotificationService.markAllAsRead();
        commit('markAllAsReadSuccess');
        return Promise.resolve();
      } catch (error) {
        commit('markAllAsReadFailure', error);
        return Promise.reject(error);
      }
    },
    
    async deleteNotification({ commit }, notificationId) {
      commit('deleteNotificationRequest');
      try {
        await NotificationService.deleteNotification(notificationId);
        commit('deleteNotificationSuccess', notificationId);
        return Promise.resolve();
      } catch (error) {
        commit('deleteNotificationFailure', error);
        return Promise.reject(error);
      }
    },
    
    async clearAll({ commit }) {
      commit('clearAllRequest');
      try {
        await NotificationService.clearAll();
        commit('clearAllSuccess');
        return Promise.resolve();
      } catch (error) {
        commit('clearAllFailure', error);
        return Promise.reject(error);
      }
    },
    
    updateFilters({ commit }, filters) {
      commit('updateFilters', filters);
    },
    
    resetFilters({ commit }) {
      commit('resetFilters');
    },
    
    // WebSocket or real-time updates
    addNotification({ commit }, notification) {
      commit('addNotification', notification);
    },
    
    resetState({ commit }) {
      commit('resetState');
    }
  },
  mutations: {
    // Fetch notifications
    fetchNotificationsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchNotificationsSuccess(state, { notifications, pagination, unreadCount }) {
      state.loading = false;
      state.notifications = notifications;
      state.pagination = {
        ...state.pagination,
        ...pagination
      };
      state.unreadCount = unreadCount;
    },
    fetchNotificationsFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    
    // Mark as read
    markAsReadRequest(state) {
      state.loading = true;
      state.error = null;
    },
    markAsReadSuccess(state, notificationId) {
      state.loading = false;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    markAsReadFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    
    // Mark all as read
    markAllAsReadRequest(state) {
      state.loading = true;
      state.error = null;
    },
    markAllAsReadSuccess(state) {
      state.loading = false;
      state.notifications = state.notifications.map(notification => ({
        ...notification,
        read: true
      }));
      state.unreadCount = 0;
    },
    markAllAsReadFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    
    // Delete notification
    deleteNotificationRequest(state) {
      state.loading = true;
      state.error = null;
    },
    deleteNotificationSuccess(state, notificationId) {
      state.loading = false;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== notificationId);
      state.pagination.totalItems -= 1;
    },
    deleteNotificationFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    
    // Clear all
    clearAllRequest(state) {
      state.loading = true;
      state.error = null;
    },
    clearAllSuccess(state) {
      state.loading = false;
      state.notifications = [];
      state.unreadCount = 0;
      state.pagination = {
        ...state.pagination,
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
      };
    },
    clearAllFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    
    // Add new notification (for real-time)
    addNotification(state, notification) {
      state.notifications.unshift(notification);
      if (!notification.read) {
        state.unreadCount += 1;
      }
      state.pagination.totalItems += 1;
    },
    
    // Filter mutations
    updateFilters(state, filters) {
      state.filters = {
        ...state.filters,
        ...filters
      };
      state.pagination.currentPage = 1;
    },
    
    resetFilters(state) {
      state.filters = { ...initialState.filters };
      state.pagination.currentPage = 1;
    },
    
    resetState(state) {
      Object.assign(state, initialState);
    }
  },
  getters: {
    allNotifications: state => state.notifications,
    unreadNotifications: state => state.notifications.filter(n => !n.read),
    readNotifications: state => state.notifications.filter(n => n.read),
    unreadCount: state => state.unreadCount,
    isLoading: state => state.loading,
    error: state => state.error,
    pagination: state => state.pagination,
    filters: state => state.filters,
    
    // Get notifications by type
    notificationsByType: state => type => 
      state.notifications.filter(n => n.type === type),
    
    // Get unread notifications by type
    unreadNotificationsByType: (state, getters) => type => 
      getters.unreadNotifications.filter(n => n.type === type)
  }
};
