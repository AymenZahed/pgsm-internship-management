<template>
  <div class="app-layout">
    <TheNavbar @toggle-sidebar="toggleSidebar" />
    <TheSidebar 
      :user="user" 
      :menu-items="menuItems"
      :collapsed="sidebarCollapsed"
      @toggle="toggleSidebar"
    />
    <main class="main-content" :class="{ 'sidebar-open': !sidebarCollapsed }">
      <TheBreadcrumb />
      <div class="content-wrapper">
        <router-view />
      </div>
      <TheFooter />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth';
import TheNavbar from './TheNavbar.vue';
import TheSidebar from './TheSidebar.vue';
import TheBreadcrumb from './TheBreadcrumb.vue';
import TheFooter from './TheFooter.vue';

const authStore = useAuthStore();
const route = useRoute();

const sidebarCollapsed = ref(false);

const user = computed(() => {
  const currentUser = authStore.currentUser;
  // For testing, provide default user if not authenticated
  if (!currentUser) {
    return {
      name: 'Test Student',
      role: 'student',
      avatar: '',
    };
  }
  
  return {
    name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email,
    role: currentUser.role || 'student',
    avatar: currentUser.avatar || '',
  };
});

const menuItems = computed(() => {
  const role = authStore.userRole || 'student'; // Default to student for testing
  
  const menus = {
    student: [
      { title: 'Dashboard', to: '/student/dashboard', icon: 'icon-home' },
      { title: 'Internships', to: '/student/internships', icon: 'icon-briefcase' },
      { title: 'My Applications', to: '/student/applications', icon: 'icon-file-text' },
      { title: 'My Internships', to: '/student/my-internships', icon: 'icon-calendar' },
      { title: 'Logbook', to: '/student/logbook', icon: 'icon-book' },
      { title: 'Attendance', to: '/student/attendance', icon: 'icon-check-circle' },
      { title: 'Evaluations', to: '/student/evaluations', icon: 'icon-star' },
      { title: 'Messages', to: '/student/messages', icon: 'icon-message-square' },
      { title: 'Notifications', to: '/student/notifications', icon: 'icon-bell' },
      { title: 'Profile', to: '/student/profile', icon: 'icon-user' },
    ],
    hospital: [
      { title: 'Dashboard', to: '/hospital/dashboard', icon: 'icon-home' },
      { title: 'Internships', to: '/hospital/offers', icon: 'icon-briefcase' },
      { title: 'Applications', to: '/hospital/applications', icon: 'icon-file-text' },
      { title: 'Students', to: '/hospital/students', icon: 'icon-users' },
      { title: 'Tutors', to: '/hospital/tutors', icon: 'icon-user-check' },
      { title: 'Services', to: '/hospital/services', icon: 'icon-settings' },
      { title: 'Statistics', to: '/hospital/statistics', icon: 'icon-bar-chart' },
      { title: 'Profile', to: '/hospital/profile', icon: 'icon-user' },
    ],
    doctor: [
      { title: 'Dashboard', to: '/doctor/dashboard', icon: 'icon-home' },
      { title: 'Students', to: '/doctor/students', icon: 'icon-users' },
      { title: 'Logbook Validation', to: '/doctor/logbook-validation', icon: 'icon-book' },
      { title: 'Attendance', to: '/doctor/attendance-validation', icon: 'icon-check-circle' },
      { title: 'Evaluations', to: '/doctor/evaluations', icon: 'icon-star' },
      { title: 'Messages', to: '/doctor/messages', icon: 'icon-message-square' },
      { title: 'Profile', to: '/doctor/profile', icon: 'icon-user' },
    ],
    admin: [
      { title: 'Dashboard', to: '/admin/dashboard', icon: 'icon-home' },
      { title: 'Users', to: '/admin/users', icon: 'icon-users' },
      { title: 'Hospitals', to: '/admin/hospitals', icon: 'icon-building' },
      { title: 'Students', to: '/admin/students', icon: 'icon-user' },
      { title: 'Internships', to: '/admin/internships', icon: 'icon-briefcase' },
      { title: 'Statistics', to: '/admin/statistics', icon: 'icon-bar-chart' },
      { title: 'Reports', to: '/admin/reports', icon: 'icon-file-text' },
      { title: 'Logs', to: '/admin/logs', icon: 'icon-activity' },
      { title: 'Configuration', to: '/admin/configuration', icon: 'icon-settings' },
    ],
  };

  return menus[role] || [];
});

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

onMounted(() => {
  // Check if sidebar should be collapsed based on screen size
  if (window.innerWidth < 1024) {
    sidebarCollapsed.value = true;
  }
});
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f7fafc;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.main-content.sidebar-open {
  margin-left: 250px;
}

.content-wrapper {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
  }
  
  .main-content.sidebar-open {
    margin-left: 0;
  }
}
</style>
