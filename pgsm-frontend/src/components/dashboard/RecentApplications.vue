<template>
  <div class="recent-applications">
    <div v-if="applications.length === 0" class="empty-state">
      <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p>No applications yet</p>
      <router-link to="/student/internships" class="btn-link">Browse Internships</router-link>
    </div>
    
    <div v-else class="applications-list">
      <div
        v-for="application in applications"
        :key="application.id"
        class="application-item"
      >
        <div class="application-info">
          <h3 class="application-title">{{ application.internshipTitle }}</h3>
          <p class="application-hospital">{{ application.hospital }}</p>
          <p class="application-date">Applied on {{ formatDate(application.appliedDate) }}</p>
        </div>
        <div class="application-status">
          <span :class="['status-badge', `status-badge--${application.statusColor}`]">
            {{ application.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  applications: {
    type: Array,
    default: () => []
  }
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};
</script>

<style scoped>
.recent-applications {
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #718096;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  color: #cbd5e0;
}

.empty-state p {
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.btn-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #3182ce;
  color: white;
  border-radius: 0.375rem;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-link:hover {
  background-color: #2c5aa0;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.application-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.application-item:hover {
  background-color: #f7fafc;
  border-color: #cbd5e0;
}

.application-info {
  flex: 1;
  min-width: 0;
}

.application-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.25rem 0;
}

.application-hospital {
  font-size: 0.875rem;
  color: #718096;
  margin: 0 0 0.25rem 0;
}

.application-date {
  font-size: 0.75rem;
  color: #a0aec0;
  margin: 0;
}

.application-status {
  flex-shrink: 0;
  margin-left: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge--yellow {
  background-color: #fefcbf;
  color: #744210;
}

.status-badge--green {
  background-color: #c6f6d5;
  color: #22543d;
}

.status-badge--red {
  background-color: #fed7d7;
  color: #742a2a;
}

.status-badge--blue {
  background-color: #bee3f8;
  color: #2c5282;
}
</style>

