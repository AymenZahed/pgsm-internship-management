<template>
  <nav class="navbar">
    <div class="navbar-left">
      <button 
        class="sidebar-toggle" 
        @click="$emit('toggle-sidebar')"
        aria-label="Toggle sidebar"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
    
    <div class="navbar-right">
      <div class="navbar-item">
        <button class="icon-button" aria-label="Notifications">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>
      
      <div class="navbar-item has-dropdown">
        <button class="user-menu-button" @click="toggleDropdown">
          <div class="user-avatar">
            <span v-if="userInitials">{{ userInitials }}</span>
          </div>
          <span class="user-name">{{ userName }}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div v-if="showDropdown" class="navbar-dropdown">
          <router-link 
            :to="profileRoute" 
            class="dropdown-item"
            @click="closeDropdown"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </router-link>
          <hr class="dropdown-divider" />
          <button class="dropdown-item" @click="handleLogout">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth';

const emit = defineEmits(['toggle-sidebar']);

const router = useRouter();
const authStore = useAuthStore();

const showDropdown = ref(false);

const user = computed(() => authStore.currentUser);

const userName = computed(() => {
  if (!user.value) return 'User';
  return `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim() || user.value.email;
});

const userInitials = computed(() => {
  if (!user.value) return 'U';
  const name = userName.value;
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const profileRoute = computed(() => {
  const role = authStore.userRole;
  const routes = {
    admin: '/admin/profile',
    hospital: '/hospital/profile',
    doctor: '/doctor/profile',
    student: '/student/profile',
  };
  return routes[role] || '/student/profile';
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
  showDropdown.value = false;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
  closeDropdown();
};

const handleClickOutside = (event) => {
  if (!event.target.closest('.has-dropdown')) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  height: 4rem;
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 30;
}

.navbar-left,
.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sidebar-toggle {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.sidebar-toggle:hover {
  background-color: #f7fafc;
}

.navbar-item {
  position: relative;
}

.icon-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.icon-button:hover {
  background-color: #f7fafc;
}

.user-menu-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.user-menu-button:hover {
  background-color: #f7fafc;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #3182ce;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #2d3748;
}

.navbar-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  background-color: #ffffff;
  min-width: 12rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 0.5rem;
  padding: 0.5rem 0;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.5rem 1rem;
  color: #4a5568;
  text-decoration: none;
  font-size: 0.875rem;
  transition: background-color 0.2s;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.dropdown-item:hover {
  background-color: #f7fafc;
}

.dropdown-divider {
  height: 1px;
  background-color: #e2e8f0;
  margin: 0.5rem 0;
  border: none;
}

@media (max-width: 640px) {
  .user-name {
    display: none;
  }
}
</style>
