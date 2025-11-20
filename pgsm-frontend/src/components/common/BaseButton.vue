<template>
  <button 
    :type="type"
    :class="['base-button', { 'full-width': fullWidth }, variant, size]"
    :disabled="loading || disabled"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="button-loader"></span>
    <span v-else><slot></slot></span>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    type: {
      type: String,
      default: 'button'
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'outline', 'text', 'danger'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  line-height: 1.5;
  position: relative;
  white-space: nowrap;
  user-select: none;
}

/* Sizes */
.small {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
}

.large {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

/* Variants */
.primary {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.primary:hover:not(:disabled) {
  background-color: #2980b9;
  border-color: #2980b9;
}

.secondary {
  background-color: #2ecc71;
  color: white;
  border-color: #2ecc71;
}

.secondary:hover:not(:disabled) {
  background-color: #27ae60;
  border-color: #27ae60;
}

.outline {
  background-color: transparent;
  border: 1px solid #3498db;
  color: #3498db;
}

.outline:hover:not(:disabled) {
  background-color: rgba(52, 152, 219, 0.1);
}

.text {
  background: none;
  border: none;
  color: #3498db;
  padding: 0.25rem 0.5rem;
}

.text:hover:not(:disabled) {
  text-decoration: underline;
  background-color: rgba(0, 0, 0, 0.05);
}

.danger {
  background-color: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

.danger:hover:not(:disabled) {
  background-color: #c0392b;
  border-color: #c0392b;
}

/* States */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.full-width {
  width: 100%;
  display: flex;
}

/* Loading animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.button-loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s ease-in-out infinite;
  margin: 0 auto;
}

.text .button-loader,
.outline .button-loader {
  border-top-color: #3498db;
}
</style>
