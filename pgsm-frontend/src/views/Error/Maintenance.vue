<template>
  <div class="maintenance-page">
    <div class="maintenance-content">
      <h1>🚧 Maintenance in Progress</h1>
      <p>We're currently performing scheduled maintenance. We'll be back shortly.</p>
      <div class="countdown" v-if="maintenanceEndTime">
        <p>Estimated time remaining: {{ formattedTimeRemaining }}</p>
        <div class="progress-bar">
          <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>
      <div class="contact-info">
        <p>If you have any questions, please contact our support team.</p>
        <a href="mailto:support@pgm-internship.com">support@pgm-internship.com</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Maintenance',
  data() {
    return {
      maintenanceEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      currentTime: Date.now(),
      timer: null
    };
  },
  computed: {
    timeRemaining() {
      return Math.max(0, this.maintenanceEndTime - this.currentTime);
    },
    formattedTimeRemaining() {
      if (!this.maintenanceEndTime) return '';
      
      const hours = Math.floor(this.timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((this.timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((this.timeRemaining % (1000 * 60)) / 1000);
      
      return `${hours}h ${minutes}m ${seconds}s`;
    },
    progressPercentage() {
      if (!this.maintenanceEndTime) return 0;
      const totalTime = this.maintenanceEndTime - (this.maintenanceEndTime - 2 * 60 * 60 * 1000);
      return Math.min(100, ((totalTime - this.timeRemaining) / totalTime) * 100);
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.currentTime = Date.now();
    }, 1000);
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
};
</script>

<style scoped>
.maintenance-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  padding: 2rem;
  text-align: center;
}

.maintenance-content {
  max-width: 600px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #e67e22;
  margin-bottom: 1.5rem;
  font-size: 2.2rem;
}

p {
  color: #555;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.countdown {
  margin: 2rem 0;
}

.progress-bar {
  height: 10px;
  background-color: #ecf0f1;
  border-radius: 5px;
  margin-top: 1rem;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #2ecc71;
  transition: width 1s linear;
}

.contact-info {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

a:hover {
  text-decoration: underline;
}
</style>
