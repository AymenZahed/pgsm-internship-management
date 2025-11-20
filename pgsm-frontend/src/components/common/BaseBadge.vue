<template>
  <component
    :is="tag"
    class="base-badge"
    :class="[
      `badge-${type}`,
      `badge-${size}`,
      { 
        'is-pill': pill,
        'is-outline': outline,
        'has-icon': $slots.icon || icon,
        'is-clickable': $attrs.onClick || $attrs.onClick === ''
      }
    ]"
    :style="{
      '--badge-bg-color': bgColor,
      '--badge-text-color': textColor,
      '--badge-border-color': borderColor
    }"
    v-bind="$attrs"
    @click="handleClick"
  >
    <span v-if="$slots.icon || icon" class="badge-icon">
      <slot name="icon">
        <i :class="icon"></i>
      </slot>
    </span>
    
    <span class="badge-content">
      <slot></slot>
    </span>
    
    <button 
      v-if="dismissible" 
      type="button" 
      class="badge-close"
      @click.stop="handleDismiss"
      :aria-label="dismissLabel"
    >
      <i class="icon-x"></i>
    </button>
  </component>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'BaseBadge',
  inheritAttrs: false,
  props: {
    type: {
      type: String,
      default: 'default',
      validator: (value) => [
        'default', 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'
      ].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value)
    },
    pill: {
      type: Boolean,
      default: false
    },
    outline: {
      type: Boolean,
      default: false
    },
    dismissible: {
      type: Boolean,
      default: false
    },
    dismissLabel: {
      type: String,
      default: 'Remove badge'
    },
    icon: {
      type: String,
      default: ''
    },
    bgColor: {
      type: String,
      default: ''
    },
    textColor: {
      type: String,
      default: ''
    },
    borderColor: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: 'span'
    }
  },
  emits: ['dismiss', 'click'],
  setup(props, { emit }) {
    const handleClick = (event) => {
      emit('click', event);
    };
    
    const handleDismiss = (event) => {
      event.stopPropagation();
      emit('dismiss', event);
    };
    
    return {
      handleClick,
      handleDismiss
    };
  }
};
</script>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25em 0.6em;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  vertical-align: middle;
  border-radius: 4px;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
  background-color: var(--badge-bg-color);
  color: var(--badge-text-color);
  border-color: var(--badge-border-color);
}

/* Sizes */
.badge-xs {
  font-size: 0.625rem;
  padding: 0.15em 0.4em;
  line-height: 1.2;
}

.badge-sm {
  font-size: 0.6875rem;
  padding: 0.2em 0.5em;
  line-height: 1.3;
}

.badge-md {
  font-size: 0.75rem;
  padding: 0.25em 0.6em;
  line-height: 1.4;
}

.badge-lg {
  font-size: 0.875rem;
  padding: 0.35em 0.8em;
  line-height: 1.5;
}

/* Badge with icon */
.badge-icon {
  display: inline-flex;
  align-items: center;
  margin-right: 0.35em;
  font-size: 0.9em;
  line-height: 1;
}

.badge-content {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* Close button */
.badge-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.35em;
  margin-right: -0.25em;
  padding: 0.1em;
  background: none;
  border: none;
  border-radius: 50%;
  font-size: 0.9em;
  line-height: 1;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease, background-color 0.2s ease;
  color: inherit;
}

.badge-close:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
}

/* Pill style */
.is-pill {
  border-radius: 50rem;
}

/* Outline style */
.is-outline {
  background-color: transparent !important;
  border-width: 1px;
  border-style: solid;
}

/* Clickable */
.is-clickable {
  cursor: pointer;
  user-select: none;
}

.is-clickable:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.is-clickable:active {
  transform: translateY(0);
}

/* Badge Types */
.badge-default {
  --badge-bg-color: #f3f4f6;
  --badge-text-color: #4b5563;
  --badge-border-color: #e5e7eb;
}

.badge-primary {
  --badge-bg-color: #3b82f6;
  --badge-text-color: #ffffff;
  --badge-border-color: #3b82f6;
}

.badge-secondary {
  --badge-bg-color: #6b7280;
  --badge-text-color: #ffffff;
  --badge-border-color: #6b7280;
}

.badge-success {
  --badge-bg-color: #10b981;
  --badge-text-color: #ffffff;
  --badge-border-color: #10b981;
}

.badge-danger {
  --badge-bg-color: #ef4444;
  --badge-text-color: #ffffff;
  --badge-border-color: #ef4444;
}

.badge-warning {
  --badge-bg-color: #f59e0b;
  --badge-text-color: #ffffff;
  --badge-border-color: #f59e0b;
}

.badge-info {
  --badge-bg-color: #3b82f6;
  --badge-text-color: #ffffff;
  --badge-border-color: #3b82f6;
}

.badge-light {
  --badge-bg-color: #f9fafb;
  --badge-text-color: #4b5563;
  --badge-border-color: #f3f4f6;
}

.badge-dark {
  --badge-bg-color: #111827;
  --badge-text-color: #ffffff;
  --badge-border-color: #111827;
}

/* Outline variants */
.is-outline.badge-default {
  --badge-text-color: #4b5563;
  --badge-border-color: #d1d5db;
}

.is-outline.badge-primary {
  --badge-text-color: #3b82f6;
  --badge-border-color: #93c5fd;
}

.is-outline.badge-secondary {
  --badge-text-color: #6b7280;
  --badge-border-color: #d1d5db;
}

.is-outline.badge-success {
  --badge-text-color: #10b981;
  --badge-border-color: #6ee7b7;
}

.is-outline.badge-danger {
  --badge-text-color: #ef4444;
  --badge-border-color: #fca5a5;
}

.is-outline.badge-warning {
  --badge-text-color: #f59e0b;
  --badge-border-color: #fcd34d;
}

.is-outline.badge-info {
  --badge-text-color: #3b82f6;
  --badge-border-color: #93c5fd;
}

.is-outline.badge-light {
  --badge-text-color: #6b7280;
  --badge-border-color: #f3f4f6;
}

.is-outline.badge-dark {
  --badge-text-color: #111827;
  --badge-border-color: #9ca3af;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .badge-default {
    --badge-bg-color: #374151;
    --badge-text-color: #e5e7eb;
    --badge-border-color: #4b5563;
  }
  
  .badge-light {
    --badge-bg-color: #4b5563;
    --badge-text-color: #f9fafb;
    --badge-border-color: #6b7280;
  }
  
  .is-outline.badge-light {
    --badge-text-color: #e5e7eb;
    --badge-border-color: #4b5563;
  }
  
  .badge-close:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
