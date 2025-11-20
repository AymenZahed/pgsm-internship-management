import UserService from '@/services/user.service';

const initialState = {
  profile: null,
  loading: false,
  error: null
};

export const user = {
  namespaced: true,
  state: { ...initialState },
  actions: {
    async fetchProfile({ commit }) {
      commit('fetchProfileRequest');
      try {
        const profile = await UserService.getProfile();
        commit('fetchProfileSuccess', profile);
        return Promise.resolve(profile);
      } catch (error) {
        commit('fetchProfileFailure', error);
        return Promise.reject(error);
      }
    },
    async updateProfile({ commit }, userData) {
      commit('updateProfileRequest');
      try {
        const updatedProfile = await UserService.updateProfile(userData);
        commit('updateProfileSuccess', updatedProfile);
        return Promise.resolve(updatedProfile);
      } catch (error) {
        commit('updateProfileFailure', error);
        return Promise.reject(error);
      }
    },
    async changePassword(_, { currentPassword, newPassword }) {
      try {
        await UserService.changePassword(currentPassword, newPassword);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async updateAvatar(_, avatarFile) {
      try {
        const avatarUrl = await UserService.updateAvatar(avatarFile);
        return Promise.resolve(avatarUrl);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    resetState({ commit }) {
      commit('resetState');
    }
  },
  mutations: {
    fetchProfileRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProfileSuccess(state, profile) {
      state.loading = false;
      state.profile = profile;
    },
    fetchProfileFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    updateProfileRequest(state) {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess(state, profile) {
      state.loading = false;
      state.profile = profile;
    },
    updateProfileFailure(state, error) {
      state.loading = false;
      state.error = error;
    },
    resetState(state) {
      Object.assign(state, initialState);
    }
  },
  getters: {
    userProfile: state => state.profile,
    isLoading: state => state.loading,
    error: state => state.error
  }
};
