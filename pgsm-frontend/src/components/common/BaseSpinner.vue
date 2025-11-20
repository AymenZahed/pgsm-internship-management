<template>
  <div 
    class="base-spinner" 
    :class="[
      `spinner-${size}`,
      { 'is-centered': center, 'is-full-page': fullPage }
    ]"
    :style="{
      '--spinner-color': color,
      '--spinner-size': customSize,
      '--spinner-stroke-width': strokeWidth
    }"
    role="status"
    :aria-label="label"
    :aria-busy="true"
  >
    <svg 
      class="spinner" 
      viewBox="0 0 50 50"
      :width="svgSize"
      :height="svgSize"
    >
      <circle 
        class="spinner-track" 
        cx="25" 
        cy="25" 
        :r="20" 
        fill="none" 
        :stroke-width="strokeWidth"
      />
      <circle 
        class="spinner-fill" 
        cx="25" 
        cy="25" 
        :r="20" 
        fill="none" 
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
      />
    </svg>
    
    <span v-if="showText && $slots.default" class="spinner-text">
      <slot></slot>
    </span>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'BaseSpinner',
  props: {
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    customSize: {
      type: String,
      default: null
    },
    color: {
      type: String,
      default: 'currentColor'
    },
    strokeWidth: {
      type: [Number, String],
      default: 4
    },
    center: {
      type: Boolean,
      default: false
    },
    fullPage: {
      type: Boolean,
      default: false
    },
    showText: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: 'Loading...'
    },
    progress: {
      type: Number,
      default: 0,
      validator: (value) => value >= 0 && value <= 100
    },
    indeterminate: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const circumference = 2 * Math.PI * 20; // 2 * π * r (r = 20 as viewBox is 50x50 and radius is 20)
    
    const dashOffset = computed(() => {
      if (props.indeterminate) return circumference * 0.25; // For indeterminate animation
      return circumference - (props.progress / 100) * circumference;
    });
    
    const svgSize = computed(() => {
      if (props.customSize) return props.customSize;
      
      const sizes = {
        xs: '16px',
        sm: '24px',
        md: '32px',
        lg: '48px',
        xl: '64px'
      };
      
      return sizes[props.size] || '32px';
    });
    
    return {
      circumference,
      dashOffset,
      svgSize
    };
  }
};
</script>

<style scoped>
.base-spinner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--spinner-color, currentColor);
}

.base-spinner.is-centered {
  margin: 0 auto;
  display: flex;
}

.base-spinner.is-full-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.spinner {
  display: inline-block;
  animation: rotate 1.4s linear infinite;
  transform-origin: center;
}

.spinner-track {
  stroke: rgba(0, 0, 0, 0.1);
}

.spinner-fill {
  stroke: currentColor;
  stroke-linecap: round;
  transform-origin: center;
  animation: dash 1.4s ease-in-out infinite;
  stroke-dasharray: 80, 200;
  stroke-dashoffset: 0;
}

.spinner-text {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: inherit;
  text-align: center;
  max-width: 200px;
  line-height: 1.4;
}

/* Sizes */
.spinner-xs {
  --spinner-size: 16px;
}

.spinner-sm {
  --spinner-size: 24px;
}

.spinner-md {
  --spinner-size: 32px;
}

.spinner-lg {
  --spinner-size: 48px;
}

.spinner-xl {
  --spinner-size: 64px;
}

/* Animations */
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 10, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 10, 150;
    stroke-dashoffset: -124;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .base-spinner.is-full-page {
    background-color: rgba(0, 0, 0, 0.7);
  }
  
  .spinner-track {
    stroke: rgba(255, 255, 255, 0.1);
  }
}

/* Indeterminate state */
:deep(.indeterminate) .spinner {
  animation: rotate 1.4s linear infinite;
}

:deep(.indeterminate) .spinner-fill {
  animation: dash 1.4s ease-in-out infinite;
}

/* Progress state */
:deep(.progress) .spinner {
  animation: none;
  transform: rotate(-90deg);
}

:deep(.progress) .spinner-fill {
  animation: none;
  stroke-dasharray: var(--spinner-circumference);
  stroke-dashoffset: var(--spinner-dash-offset);
  transition: stroke-dashoffset 0.35s ease-in-out;
}
</style>
