<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="handleOverlayClick">
      <div 
        class="modal-container"
        :class="[size, { 'no-padding': noPadding }]"
        :style="{ maxWidth: width }"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? `${modalId}-title` : null"
      >
        <div v-if="showHeader" class="modal-header">
          <h2 v-if="title" :id="`${modalId}-title`" class="modal-title">
            <slot name="title">{{ title }}</slot>
          </h2>
          <button 
            v-if="showCloseButton" 
            class="close-button" 
            @click="closeModal"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        
        <div class="modal-content">
          <slot></slot>
        </div>
        
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'BaseModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'xlarge', 'full'].includes(value)
    },
    width: {
      type: String,
      default: ''
    },
    showCloseButton: {
      type: Boolean,
      default: true
    },
    closeOnOverlayClick: {
      type: Boolean,
      default: true
    },
    noPadding: {
      type: Boolean,
      default: false
    },
    showHeader: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:isOpen', 'close'],
  data() {
    return {
      modalId: `modal-${uuidv4()}`
    };
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', this.handleKeydown);
      } else {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', this.handleKeydown);
      }
    }
  },
  beforeUnmount() {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this.handleKeydown);
  },
  methods: {
    closeModal() {
      this.$emit('update:isOpen', false);
      this.$emit('close');
    },
    handleOverlayClick() {
      if (this.closeOnOverlayClick) {
        this.closeModal();
      }
    },
    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.closeModal();
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 2rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.modal-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modal-appear 0.3s ease-out;
}

/* Modal sizes */
.small {
  max-width: 400px;
}

.medium {
  max-width: 600px;
}

.large {
  max-width: 900px;
}

.xlarge {
  max-width: 1100px;
}

.full {
  max-width: 95%;
  max-height: 95%;
  width: 95%;
  height: 95%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.5;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.75rem;
  font-weight: 300;
  color: #6c757d;
  cursor: pointer;
  line-height: 1;
  padding: 0.5rem;
  margin: -0.5rem -0.5rem -0.5rem 0.5rem;
  transition: color 0.2s ease;
  background: transparent;
}

.close-button:hover {
  color: #343a40;
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
  -webkit-overflow-scrolling: touch;
}

.modal-content.no-padding {
  padding: 0;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-container {
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-content {
    padding: 1rem;
  }
  
  .modal-footer {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
  }
}

/* Print styles */
@media print {
  .modal-overlay {
    position: static;
    background: none;
    padding: 0;
  }
  
  .modal-container {
    max-height: none;
    box-shadow: none;
    border: 1px solid #dee2e6;
  }
  
  .close-button {
    display: none;
  }
}
</style>
