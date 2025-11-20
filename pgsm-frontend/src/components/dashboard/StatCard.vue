<template>
  <div class="stat-card" :class="`stat-card--${color}`">
    <div class="stat-icon">
      <svg v-if="icon === 'document'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <svg v-else-if="icon === 'briefcase'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <svg v-else-if="icon === 'clipboard'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <svg v-else-if="icon === 'bell'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </div>
    <div class="stat-content">
      <div class="stat-header">
        <h3 class="stat-value">{{ value }}</h3>
        <span v-if="badge" class="stat-badge">{{ badge }}</span>
      </div>
      <p class="stat-label">{{ label }}</p>
      <p v-if="trend" class="stat-trend">{{ trend }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  value: {
    type: [Number, String],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'document'
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'orange', 'purple', 'red'].includes(value)
  },
  trend: {
    type: String,
    default: null
  },
  badge: {
    type: [Number, String],
    default: null
  }
});
</script>

<style scoped>
.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.stat-card--blue .stat-icon {
  color: #3182ce;
}

.stat-card--green .stat-icon {
  color: #38a169;
}

.stat-card--orange .stat-icon {
  color: #dd6b20;
}

.stat-card--purple .stat-icon {
  color: #805ad5;
}

.stat-card--red .stat-icon {
  color: #e53e3e;
}

.stat-icon {
  flex-shrink: 0;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #f7fafc;
}

.stat-card--blue .stat-icon {
  background-color: #ebf8ff;
}

.stat-card--green .stat-icon {
  background-color: #f0fff4;
}

.stat-card--orange .stat-icon {
  background-color: #fffaf0;
}

.stat-card--purple .stat-icon {
  background-color: #faf5ff;
}

.stat-card--red .stat-icon {
  background-color: #fff5f5;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  line-height: 1;
}

.stat-badge {
  background-color: #e53e3e;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
  margin: 0.5rem 0 0 0;
  font-weight: 500;
}

.stat-trend {
  font-size: 0.75rem;
  color: #38a169;
  margin: 0.25rem 0 0 0;
  font-weight: 500;
}
</style>

