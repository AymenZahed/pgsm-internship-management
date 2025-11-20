<template>
  <transition name="fade" mode="out-in">
    <div 
      v-if="visible"
      class="base-alert"
      :class="[
        `alert-${type}`,
        { 'has-icon': showIcon, 'is-dismissible': dismissible, 'is-rounded': rounded }
      ]"
      role="alert"
      :aria-live="type === 'error' ? 'assertive' : 'polite'"
    >
      <div class="alert-content">
        <div v-if="showIcon" class="alert-icon">
          <slot name="icon">
            <i :class="iconClass"></i>
          </slot>
        </div>
        
        <div class="alert-message">
          <slot></slot>
        </div>
        
        <button 
          v-if="dismissible"
          type="button"
          class="alert-close"
          @click="dismiss"
          :aria-label="dismissLabel"
        >
          <i class="icon-x"></i>
        </button>
      </div>
      
      <div v-if="$slots.footer" class="alert-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </transition>
</template>

<script>
import { computed, ref } from 'vue';

export default {
  name: 'BaseAlert',
  props: {
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['info', 'success', 'warning', 'error', 'default'].includes(value)
    },
    dismissible: {
      type: Boolean,
      default: false
    },
    dismissLabel: {
      type: String,
      default: 'Dismiss alert'
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    rounded: {
      type: Boolean,
      default: true
    },
    autoDismiss: {
      type: [Boolean, Number],
      default: false,
      validator: (value) => value === false || value > 0
    },
    modelValue: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'dismissed'],
  setup(props, { emit }) {
    const isVisible = ref(props.modelValue);
    let dismissTimeout = null;

    const iconClass = computed(() => {
      const icons = {
        info: 'icon-info',
        success: 'icon-check-circle',
        warning: 'icon-alert-triangle',
        error: 'icon-x-circle',
        default: 'icon-bell'
      };
      return icons[props.type] || 'icon-info';
    });

    const visible = computed({
      get() {
        return isVisible.value && props.modelValue;
      },
      set(value) {
        isVisible.value = value;
        emit('update:modelValue', value);
      }
    });

    const dismiss = () => {
      visible.value = false;
      emit('dismissed');
    };

    // Auto-dismiss functionality
    if (props.autoDismiss && props.autoDismiss > 0) {
      dismissTimeout = setTimeout(() => {
        dismiss();
      }, props.autoDismiss);
    }

    // Clear timeout when component is unmounted
    const clearDismissTimeout = () => {
      if (dismissTimeout) {
        clearTimeout(dismissTimeout);
        dismissTimeout = null;
      }
    };

    // Watch for modelValue changes
    const stopWatch = () => {
      if (props.autoDismiss && props.autoDismiss > 0 && visible.value) {
        clearDismissTimeout();
        dismissTimeout = setTimeout(() => {
          dismiss();
        }, props.autoDismiss);
      }
    };

    return {
      visible,
      iconClass,
      dismiss,
      clearDismissTimeout,
      stopWatch
    };
  },
  watch: {
    modelValue(newVal) {
      if (newVal && this.autoDismiss) {
        this.stopWatch();
      }
    }
  },
  beforeUnmount() {
    this.clearDismissTimeout();
  }
};
</script>

<style scoped>
.base-alert {
  position: relative;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: opacity 0.3s ease, transform 0.3s ease;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.alert-content {
  display: flex;
  align-items: flex-start;
  position: relative;
}

.alert-icon {
  margin-right: 0.75rem;
  font-size: 1.25rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.alert-message {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.alert-close {
  margin-left: 0.75rem;
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
  color: inherit;
  line-height: 1;
  border-radius: 4px;
}

.alert-close:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.05);
}

.alert-footer {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* Alert Types */
.alert-info {
  background-color: #e0f2fe;
  border-color: #bae6fd;
  color: #0369a1;
}

.alert-success {
  background-color: #dcfce7;
  border-color: #bbf7d0;
  color: #15803d;
}

.alert-warning {
  background-color: #fef3c7;
  border-color: #fde68a;
  color: #b45309;
}

.alert-error {
  background-color: #fee2e2;
  border-color: #fecaca;
  color: #b91c1c;
}

.alert-default {
  background-color: #f3f4f6;
  border-color: #e5e7eb;
  color: #374151;
}

/* Rounded */
.is-rounded {
  border-radius: 8px;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .alert-close:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .alert-footer {
    border-top-color: rgba(255, 255, 255, 0.1);
  }
  
  .alert-info {
    background-color: #1e3a8a;
    border-color: #1e40af;
    color: #bfdbfe;
  }
  
  .alert-success {
    background-color: #14532d;
    border-color: #166534;
    color: #bbf7d0;
  }
  
  .alert-warning {
    background-color: #713f12;
    border-color: #854d0e;
    color: #fde68a;
  }
  
  .alert-error {
    background-color: #7f1d1d;
    border-color: #991b1b;
    color: #fecaca;
  }
  
  .alert-default {
    background-color: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .base-alert {
    padding: 0.75rem;
  }
  
  .alert-icon {
    font-size: 1.125rem;
    margin-right: 0.5rem;
  }
  
  .alert-close {
    margin-left: 0.5rem;
  }
}
</style>
