<template>
  <div 
    class="base-card" 
    :class="[elevation, { 'hoverable': hoverable, 'clickable': isClickable }]"
    @click="handleClick"
  >
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
      </slot>
      
      <div v-if="$slots['header-actions']" class="header-actions">
        <slot name="header-actions"></slot>
      </div>
    </div>
    
    <div class="card-content">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
    
    <div v-if="loading" class="card-loading">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    hoverable: {
      type: Boolean,
      default: false
    },
    elevation: {
      type: String,
      default: 'medium',
      validator: (value) => ['none', 'small', 'medium', 'large', 'xlarge'].includes(value)
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  computed: {
    isClickable() {
      return this.$listeners.click !== undefined;
    }
  },
  methods: {
    handleClick(event) {
      if (this.isClickable) {
        this.$emit('click', event);
      }
    }
  }
};
</script>

<style scoped>
.base-card {
  position: relative;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e9ecef;
}

/* Elevation levels */
.none {
  box-shadow: none;
}

.small {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}

.medium {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.large {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.xlarge {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Hover effect */
.hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* Clickable effect */
.clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable:active {
  transform: translateY(1px);
}

/* Card header */
.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  background-color: #f8f9fa;
}

.card-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Card content */
.card-content {
  padding: 1.5rem;
  flex-grow: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Card footer */
.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
  flex-shrink: 0;
}

/* Loading state */
.card-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 8px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(52, 152, 219, 0.2);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 0.8s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-header {
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .card-footer {
    padding: 0.75rem 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .base-card {
    background-color: #2d3748;
    border-color: #4a5568;
  }
  
  .card-header,
  .card-footer {
    background-color: #2d3748;
    border-color: #4a5568;
  }
  
  .card-title {
    color: #e2e8f0;
  }
  
  .card-loading {
    background-color: rgba(45, 55, 72, 0.7);
  }
}
</style>
