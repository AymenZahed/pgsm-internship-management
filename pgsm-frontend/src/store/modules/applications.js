import ApplicationService from '@/services/application.service';

const initialState = {
  applications: [],
  currentApplication: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  filters: {
    status: '',
    internship: '',
    student: '',
    dateFrom: null,
    dateTo: null,
    search: ''
  },
  sort: {
    field: 'appliedAt',
    order: 'desc'
  }
};

export const applications = {
  namespaced: true,
  state: { ...initialState },
  actions: {
    async fetchApplications({ commit, state }, { page = 1, filters = {}, sort = {} } = {}) {
      commit('fetchApplicationsRequest');
      try {
        const response = await ApplicationService.getApplications({
          page,
          ...state.filters,
          ...filters,
          sortBy: sort.field || state.sort.field,
          sortOrder: sort.order || state.sort.order
        });
        
        commit('fetchApplicationsSuccess', {
          applications: response.data,
          pagination: response.pagination
        });
        return Promise.resolve(response);
      } catch (error) {
        commit('fetchApplicationsFailure', error);
        return Promise.reject(error);
      }
    },
    
    async fetchApplicationById({ commit }, id) {
      commit('fetchApplicationRequest');
      try {
        const application = await ApplicationService.getApplicationById(id);
        commit('fetchApplicationSuccess', application);
        return Promise.resolve(application);
      } catch (error) {
        commit('fetchApplicationFailure', error);
        return Promise.reject(error);
      }
    },
    
    async createApplication({ commit }, applicationData) {
      commit('createApplicationRequest');
      try {
        const newApplication = await ApplicationService.createApplication(applicationData);
        commit('createApplicationSuccess', newApplication);
        return Promise.resolve(newApplication);
      } catch (error) {
        commit('createApplicationFailure', error);
        return Promise.reject(error);
      }
    },
    
    async updateApplication({ commit }, { id, data }) {
      commit('updateApplicationRequest');
      try {
        const updatedApplication = await ApplicationService.updateApplication(id, data);
        commit('updateApplicationSuccess', updatedApplication);
        return Promise.resolve(updatedApplication);
      } catch (error) {
        commit('updateApplicationFailure', error);
        return Promise.reject(error);
      }
    },
    
    async deleteApplication({ commit }, id) {
      commit('deleteApplicationRequest');
      try {
        await ApplicationService.deleteApplication(id);
        commit('deleteApplicationSuccess', id);
        return Promise.resolve();
      } catch (error) {
        commit('deleteApplicationFailure', error);
        return Promise.reject(error);
      }
    },
    
    async submitApplication({ commit, dispatch }, applicationData) {
      try {
        const application = await dispatch('createApplication', applicationData);
        await ApplicationService.submitApplication(application.id);
        return Promise.resolve(application);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    
    async updateStatus({ commit }, { id, status, feedback = '' }) {
      commit('updateStatusRequest');
      try {
        const updatedApplication = await ApplicationService.updateStatus(id, status, feedback);
        commit('updateStatusSuccess', updatedApplication);
        return Promise.resolve(updatedApplication);
      } catch (error) {
        commit('updateStatusFailure', error);
        return Promise.reject(error);
      }
    },
    
    updateFilters({ commit }, filters) {
      commit('updateFilters', filters);
    },
    
    updateSort({ commit }, sort) {
      commit('updateSort', sort);
    },
    
    resetFilters({ commit }) {
      commit('resetFilters');
    },
    
    resetState({ commit }) {
      commit('resetState');
    }
  },
  mutations: {
    // Fetch multiple applications
    fetchApplicationsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchApplicationsSuccess(state, { applications, pagination }) {
      state.loading = false;
      state.applications = applications;
      state.pagination = {
        ...state.pagination,
        ...pagination
      };
    },
    fetchApplicationsFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    
    // Fetch single application
    fetchApplicationRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchApplicationSuccess(state, application) {
      state.loading = false;
      state.currentApplication = application;
    },
    fetchApplicationFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    
    // Create application
    createApplicationRequest(state) {
      state.loading = true;
      state.error = null;
    },
    createApplicationSuccess(state, application) {
      state.loading = false;
      state.applications.unshift(application);
      state.pagination.totalItems += 1;
    },
    createApplicationFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    
    // Update application
    updateApplicationRequest(state) {
      state.loading = true;
      state.error = null;
    },
    updateApplicationSuccess(state, updatedApplication) {
      state.loading = false;
      const index = state.applications.findIndex(a => a.id === updatedApplication.id);
      if (index !== -1) {
        state.applications.splice(index, 1, updatedApplication);
      }
      if (state.currentApplication && state.currentApplication.id === updatedApplication.id) {
        state.currentApplication = updatedApplication;
      }
    },
    updateApplicationFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    
    // Delete application
    deleteApplicationRequest(state) {
      state.loading = true;
      state.error = null;
    },
    deleteApplicationSuccess(state, id) {
      state.loading = false;
      state.applications = state.applications.filter(a => a.id !== id);
      state.pagination.totalItems -= 1;
      if (state.currentApplication && state.currentApplication.id === id) {
        state.currentApplication = null;
      }
    },
    deleteApplicationFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    
    // Update status
    updateStatusRequest(state) {
      state.loading = true;
      state.error = null;
    },
    updateStatusSuccess(state, updatedApplication) {
      state.loading = false;
      const index = state.applications.findIndex(a => a.id === updatedApplication.id);
      if (index !== -1) {
        state.applications.splice(index, 1, updatedApplication);
      }
      if (state.currentApplication && state.currentApplication.id === updatedApplication.id) {
        state.currentApplication = updatedApplication;
      }
    },
    updateStatusFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    
    // Filter and sort mutations
    updateFilters(state, filters) {
      state.filters = {
        ...state.filters,
        ...filters
      };
      state.pagination.currentPage = 1;
    },
    
    updateSort(state, sort) {
      state.sort = {
        ...state.sort,
        ...sort
      };
    },
    
    resetFilters(state) {
      state.filters = { ...initialState.filters };
      state.sort = { ...initialState.sort };
      state.pagination.currentPage = 1;
    },
    
    resetState(state) {
      Object.assign(state, initialState);
    }
  },
  getters: {
    allApplications: state => state.applications,
    currentApplication: state => state.currentApplication,
    isLoading: state => state.loading,
    error: state => state.error,
    pagination: state => state.pagination,
    filters: state => state.filters,
    sort: state => state.sort,
    
    // Derived data
    pendingApplications: state => 
      state.applications.filter(a => a.status === 'pending'),
    
    approvedApplications: state => 
      state.applications.filter(a => a.status === 'approved'),
    
    rejectedApplications: state => 
      state.applications.filter(a => a.status === 'rejected'),
    
    // Get applications by status
    applicationsByStatus: state => status => 
      state.applications.filter(a => a.status === status),
    
    // Get applications by student
    applicationsByStudent: state => studentId => 
      state.applications.filter(a => a.studentId === studentId),
    
    // Get applications by internship
    applicationsByInternship: state => internshipId => 
      state.applications.filter(a => a.internshipId === internshipId)
  }
};
