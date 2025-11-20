<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div>
        <h1 class="page-title">Welcome back, {{ userName }}!</h1>
        <p class="page-subtitle">Here's what's happening with your internships</p>
      </div>
      <div class="header-actions">
        <router-link to="/student/internships" class="btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Browse Internships
        </router-link>
      </div>
    </div>
    
    <!-- Stats Grid -->
    <div class="stats-grid">
      <StatCard
        :value="stats.applications"
        label="My Applications"
        icon="document"
        color="blue"
        :trend="'+2 this month'"
      />
      <StatCard
        :value="stats.activeInternships"
        label="Active Internships"
        icon="briefcase"
        color="green"
      />
      <StatCard
        :value="stats.pendingTasks"
        label="Pending Tasks"
        icon="clipboard"
        color="orange"
      />
      <StatCard
        :value="stats.notifications"
        label="Notifications"
        icon="bell"
        color="purple"
        :badge="stats.unreadNotifications"
      />
    </div>
    
    <!-- Main Content Grid -->
    <div class="dashboard-content">
      <!-- Recent Applications -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">Recent Applications</h2>
          <router-link to="/student/applications" class="section-link">View All</router-link>
        </div>
        <RecentApplications :applications="recentApplications" />
      </div>
      
      <!-- Upcoming Tasks -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">Upcoming Tasks</h2>
        </div>
        <UpcomingTasks :tasks="upcomingTasks" />
      </div>
    </div>
    
    <!-- Secondary Content Grid -->
    <div class="dashboard-content">
      <!-- My Internships -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">My Internships</h2>
          <router-link to="/student/my-internships" class="section-link">View All</router-link>
        </div>
        <MyInternships :internships="myInternships" />
      </div>
      
      <!-- Quick Actions -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">Quick Actions</h2>
        </div>
        <QuickActions />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import StatCard from '@/components/dashboard/StatCard.vue';
import RecentApplications from '@/components/dashboard/RecentApplications.vue';
import UpcomingTasks from '@/components/dashboard/UpcomingTasks.vue';
import MyInternships from '@/components/dashboard/MyInternships.vue';
import QuickActions from '@/components/dashboard/QuickActions.vue';

const authStore = useAuthStore();

const userName = computed(() => {
  const user = authStore.currentUser;
  if (user) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Student';
  }
  return 'Student';
});

// Test data
const stats = ref({
  applications: 5,
  activeInternships: 2,
  pendingTasks: 3,
  notifications: 8,
  unreadNotifications: 3
});

const recentApplications = ref([
  {
    id: 1,
    internshipTitle: 'Cardiology Internship',
    hospital: 'City General Hospital',
    status: 'pending',
    appliedDate: '2024-01-15',
    statusColor: 'yellow'
  },
  {
    id: 2,
    internshipTitle: 'Pediatrics Rotation',
    hospital: 'Children\'s Medical Center',
    status: 'approved',
    appliedDate: '2024-01-10',
    statusColor: 'green'
  },
  {
    id: 3,
    internshipTitle: 'Emergency Medicine',
    hospital: 'Regional Hospital',
    status: 'rejected',
    appliedDate: '2024-01-05',
    statusColor: 'red'
  }
]);

const upcomingTasks = ref([
  {
    id: 1,
    title: 'Submit logbook entry',
    dueDate: '2024-01-20',
    priority: 'high',
    type: 'logbook'
  },
  {
    id: 2,
    title: 'Complete evaluation form',
    dueDate: '2024-01-22',
    priority: 'medium',
    type: 'evaluation'
  },
  {
    id: 3,
    title: 'Attend orientation meeting',
    dueDate: '2024-01-18',
    priority: 'high',
    type: 'meeting'
  }
]);

const myInternships = ref([
  {
    id: 1,
    title: 'Cardiology Internship',
    hospital: 'City General Hospital',
    startDate: '2024-02-01',
    endDate: '2024-05-01',
    progress: 65,
    status: 'active'
  },
  {
    id: 2,
    title: 'Pediatrics Rotation',
    hospital: 'Children\'s Medical Center',
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    progress: 40,
    status: 'active'
  }
]);

onMounted(() => {
  // In a real app, you would fetch this data from the API
  console.log('Dashboard loaded');
});
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #718096;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #3182ce;
  color: white;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #2c5aa0;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.dashboard-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.section-link {
  font-size: 0.875rem;
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.section-link:hover {
  color: #2c5aa0;
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .dashboard {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
