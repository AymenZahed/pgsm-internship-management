import InternshipService from '@/services/internship.service';

const initialState = {
  internships: [],
  currentInternship: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  filters: {
    search: '',
    status: '',
    hospital: '',
    specialty: '',
    startDate: null,
    endDate: null
  },
  sort: {
    field: 'createdAt',
    order: 'desc'
  }
};

export const internships = {
  namespaced: true,
  state: { ...initialState },
  actions: {
    async fetchInternships({ commit, state }, { page = 1, filters = {}, sort = {} } = {}) {
      commit('fetchInternshipsRequest');
      try {
        const response = await InternshipService.getInternships({
          page,
          ...state.filters,
          ...filters,
          sortBy: sort.field || state.sort.field,
          sortOrder: sort.order || state.sort.order
        });
        
        commit('fetchInternshipsSuccess', {
          internships: response.data,
          pagination: response.pagination
        });
        return Promise.resolve(response);
      } catch (error) {
        commit('fetchInternshipsFailure', error);
        return Promise.reject(error);
      }
    },
    
    async fetchInternshipById({ commit }, id) {
      commit('fetchInternshipRequest');
      try {
        const internship = await InternshipService.getInternshipById(id);
        commit('fetchInternshipSuccess', internship);
        return Promise.resolve(internship);
      } catch (error) {
        commit('fetchInternshipFailure', error);
        return Promise.reject(error);
      }
    },
    
    async createInternship({ commit }, internshipData) {
      commit('createInternshipRequest');
      try {
        const newInternship = await InternshipService.createInternship(internshipData);
        commit('createInternshipSuccess', newInternship);
        return Promise.resolve(newInternship);
      } catch (error) {
        commit('createInternshipFailure', error);
        return Promise.reject(error);
      }
    },
    
    async updateInternship({ commit }, { id, data }) {
      commit('updateInternshipRequest');
      try {
        const updatedInternship = await InternshipService.updateInternship(id, data);
        commit('updateInternshipSuccess', updatedInternship);
        return Promise.resolve(updatedInternship);
      } catch (error) {
        commit('updateInternshipFailure', error);
        return Promise.reject(error);
      }
    },
    
    async deleteInternship({ commit }, id) {
      commit('deleteInternshipRequest');
      try {
        await InternshipService.deleteInternship(id);
        commit('deleteInternshipSuccess', id);
        return Promise.resolve();
      } catch (error) {
        commit('deleteInternshipFailure', error);
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
    // Fetch multiple internships
    fetchInternshipsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchInternshipsSuccess(state, { internships, pagination }) {
      state.loading = false;
      state.internships = internships;
      state.pagination = {
        ...state.pagination,
        ...pagination
      };
    },
    fetchInternshipsFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    
    // Fetch single internship
    fetchInternshipRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchInternshipSuccess(state, internship) {
      state.loading = false;
      state.currentInternship = internship;
    },
    fetchInternshipFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    
    // Create internship
    createInternshipRequest(state) {
      state.loading = true;
      state.error = null;
    },
    createInternshipSuccess(state, internship) {
      state.loading = false;
      state.internships.unshift(internship);
    },
    createInternshipFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    
    // Update internship
    updateInternshipRequest(state) {
      state.loading = true;
      state.error = null;
    },
    updateInternshipSuccess(state, updatedInternship) {
      state.loading = false;
      const index = state.internships.findIndex(i => i.id === updatedInternship.id);
      if (index !== -1) {
        state.internships.splice(index, 1, updatedInternship);
      }
      if (state.currentInternship && state.currentInternship.id === updatedInternship.id) {
        state.currentInternship = updatedInternship;
      }
    },
    updateInternshipFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    
    // Delete internship
    deleteInternshipRequest(state) {
      state.loading = true;
      state.error = null;
    },
    deleteInternshipSuccess(state, id) {
      state.loading = false;
      state.internships = state.internships.filter(i => i.id !== id);
      if (state.currentInternship && state.currentInternship.id === id) {
        state.currentInternship = null;
      }
    },
    deleteInternshipFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    
    // Filter and sort mutations
    updateFilters(state, filters) {
      state.filters = {
        ...state.filters,
        ...filters
      };
      state.pagination.currentPage = 1; // Reset to first page when filters change
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
    allInternships: state => state.internships,
    currentInternship: state => state.currentInternship,
    isLoading: state => state.loading,
    error: state => state.error,
    pagination: state => state.pagination,
    filters: state => state.filters,
    sort: state => state.sort,
    
    // Derived data
    activeInternships: state => 
      state.internships.filter(i => i.status === 'active'),
    
    upcomingInternships: state => 
      state.internships.filter(i => i.status === 'upcoming'),
    
    completedInternships: state => 
      state.internships.filter(i => i.status === 'completed'),
    
    // Get internships by hospital
    internshipsByHospital: state => hospitalId => 
      state.internships.filter(i => i.hospitalId === hospitalId),
    
    // Get internships by status
    internshipsByStatus: state => status => 
      state.internships.filter(i => i.status === status)
  }
};
