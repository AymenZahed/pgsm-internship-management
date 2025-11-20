<template>
  <div class="my-internships">
    <div v-if="internships.length === 0" class="empty-state">
      <p>No active internships</p>
      <router-link to="/student/internships" class="btn-link">Browse Internships</router-link>
    </div>
    
    <div v-else class="internships-list">
      <div
        v-for="internship in internships"
        :key="internship.id"
        class="internship-item"
      >
        <div class="internship-header">
          <h3 class="internship-title">{{ internship.title }}</h3>
          <span :class="['status-badge', `status-badge--${internship.status}`]">
            {{ internship.status }}
          </span>
        </div>
        <p class="internship-hospital">{{ internship.hospital }}</p>
        <div class="internship-dates">
          <span>{{ formatDate(internship.startDate) }} - {{ formatDate(internship.endDate) }}</span>
        </div>
        <div class="internship-progress">
          <div class="progress-header">
            <span class="progress-label">Progress</span>
            <span class="progress-value">{{ internship.progress }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${internship.progress}%` }"
            ></div>
          </div>
        </div>
        <router-link 
          :to="`/student/internships/${internship.id}`" 
          class="internship-link"
        >
          View Details →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  internships: {
    type: Array,
    default: () => []
  }
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};
</script>

<style scoped>
.my-internships {
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #718096;
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

.internships-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.internship-item {
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.internship-item:hover {
  background-color: #f7fafc;
  border-color: #cbd5e0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.internship-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.internship-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
  flex: 1;
}

.status-badge {
  flex-shrink: 0;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge--active {
  background-color: #c6f6d5;
  color: #22543d;
}

.status-badge--completed {
  background-color: #bee3f8;
  color: #2c5282;
}

.status-badge--pending {
  background-color: #fefcbf;
  color: #744210;
}

.internship-hospital {
  font-size: 0.875rem;
  color: #718096;
  margin: 0 0 0.5rem 0;
}

.internship-dates {
  font-size: 0.75rem;
  color: #a0aec0;
  margin-bottom: 1rem;
}

.internship-progress {
  margin-bottom: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.75rem;
  color: #718096;
  font-weight: 500;
}

.progress-value {
  font-size: 0.75rem;
  color: #3182ce;
  font-weight: 600;
}

.progress-bar {
  height: 0.5rem;
  background-color: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #3182ce;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.internship-link {
  display: inline-block;
  font-size: 0.875rem;
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.internship-link:hover {
  color: #2c5aa0;
  text-decoration: underline;
}
</style>

