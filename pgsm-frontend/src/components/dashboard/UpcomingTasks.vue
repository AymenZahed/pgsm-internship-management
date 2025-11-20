<template>
  <div class="upcoming-tasks">
    <div v-if="tasks.length === 0" class="empty-state">
      <p>No upcoming tasks</p>
    </div>
    
    <div v-else class="tasks-list">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="task-item"
        :class="`task-item--${task.priority}`"
      >
        <div class="task-icon">
          <svg v-if="task.type === 'logbook'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <svg v-else-if="task.type === 'evaluation'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="task-content">
          <h3 class="task-title">{{ task.title }}</h3>
          <p class="task-date">Due: {{ formatDate(task.dueDate) }}</p>
        </div>
        <span :class="['priority-badge', `priority-badge--${task.priority}`]">
          {{ task.priority }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  tasks: {
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
.upcoming-tasks {
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #718096;
  font-size: 0.875rem;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-left: 3px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: #f7fafc;
  transition: all 0.2s;
}

.task-item:hover {
  background-color: #edf2f7;
  transform: translateX(4px);
}

.task-item--high {
  border-left-color: #e53e3e;
}

.task-item--medium {
  border-left-color: #dd6b20;
}

.task-item--low {
  border-left-color: #38a169;
}

.task-icon {
  flex-shrink: 0;
  color: #718096;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.25rem 0;
}

.task-date {
  font-size: 0.75rem;
  color: #718096;
  margin: 0;
}

.priority-badge {
  flex-shrink: 0;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.priority-badge--high {
  background-color: #fed7d7;
  color: #742a2a;
}

.priority-badge--medium {
  background-color: #feebc8;
  color: #7c2d12;
}

.priority-badge--low {
  background-color: #c6f6d5;
  color: #22543d;
}
</style>

