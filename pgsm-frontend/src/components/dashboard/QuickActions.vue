<template>
  <div class="quick-actions">
    <router-link 
      to="/student/internships" 
      class="action-item"
    >
      <div class="action-icon action-icon--blue">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <div class="action-content">
        <h3 class="action-title">Browse Internships</h3>
        <p class="action-description">Find new opportunities</p>
      </div>
    </router-link>
    
    <router-link 
      to="/student/applications" 
      class="action-item"
    >
      <div class="action-icon action-icon--green">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div class="action-content">
        <h3 class="action-title">My Applications</h3>
        <p class="action-description">Track your applications</p>
      </div>
    </router-link>
    
    <router-link 
      to="/student/logbook" 
      class="action-item"
    >
      <div class="action-icon action-icon--purple">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <div class="action-content">
        <h3 class="action-title">My Logbook</h3>
        <p class="action-description">Update your entries</p>
      </div>
    </router-link>
    
    <router-link 
      to="/student/attendance" 
      class="action-item"
    >
      <div class="action-icon action-icon--orange">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="action-content">
        <h3 class="action-title">Attendance</h3>
        <p class="action-description">View attendance records</p>
      </div>
    </router-link>
    
    <router-link 
      to="/student/profile" 
      class="action-item"
    >
      <div class="action-icon action-icon--gray">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div class="action-content">
        <h3 class="action-title">Update Profile</h3>
        <p class="action-description">Manage your information</p>
      </div>
    </router-link>
  </div>
</template>

<script setup>
// QuickActions component
</script>

<style scoped>
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.action-item:hover {
  background-color: #f7fafc;
  border-color: #cbd5e0;
  transform: translateX(4px);
}

.action-icon {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.action-icon--blue {
  background-color: #ebf8ff;
  color: #3182ce;
}

.action-icon--green {
  background-color: #f0fff4;
  color: #38a169;
}

.action-icon--purple {
  background-color: #faf5ff;
  color: #805ad5;
}

.action-icon--orange {
  background-color: #fffaf0;
  color: #dd6b20;
}

.action-icon--gray {
  background-color: #f7fafc;
  color: #4a5568;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.25rem 0;
}

.action-description {
  font-size: 0.75rem;
  color: #718096;
  margin: 0;
}
</style>

