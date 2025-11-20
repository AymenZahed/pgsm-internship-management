<template>
  <div class="form-group" :class="{ 'has-error': error, 'disabled': disabled }">
    <label v-if="label" :for="id" class="textarea-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
      <span v-if="showCharacterCount" class="character-count">
        ({{ valueLength }}/{{ maxlength || '∞' }})
      </span>
    </label>
    
    <div class="textarea-wrapper">
      <textarea
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled || loading"
        :readonly="readonly"
        :maxlength="maxlength"
        :rows="rows"
        :class="[textareaClass, { 'has-icon': $slots.prepend }]"
        v-bind="$attrs"
        @input="onInput"
        @blur="onBlur"
        @keydown.enter="onEnter"
      ></textarea>
      
      <span v-if="$slots.prepend" class="textarea-prepend">
        <slot name="prepend"></slot>
      </span>
      
      <div v-if="loading" class="textarea-loading">
        <span class="loader"></span>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="hint && !error" class="hint">
      {{ hint }}
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'BaseTextarea',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    error: {
      type: String,
      default: ''
    },
    hint: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: [Number, String],
      default: null
    },
    rows: {
      type: [Number, String],
      default: 3
    },
    showCharacterCount: {
      type: Boolean,
      default: false
    },
    textareaClass: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: () => `textarea-${uuidv4()}`
    }
  },
  emits: ['update:modelValue', 'blur', 'enter'],
  computed: {
    valueLength() {
      return String(this.modelValue || '').length;
    }
  },
  methods: {
    onInput(event) {
      this.$emit('update:modelValue', event.target.value);
    },
    onBlur(event) {
      this.$emit('blur', event);
    },
    onEnter(event) {
      this.$emit('enter', event);
    }
  }
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1.25rem;
  text-align: left;
}

.textarea-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.required {
  color: #e74c3c;
  margin-left: 0.25rem;
}

.character-count {
  font-size: 0.8rem;
  color: #6c757d;
  margin-left: 0.5rem;
  font-weight: normal;
}

.textarea-wrapper {
  position: relative;
  width: 100%;
}

textarea {
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  resize: vertical;
  min-height: calc(1.5em + 1.25rem + 2px);
}

textarea:focus {
  color: #495057;
  background-color: #fff;
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

textarea:disabled,
textarea[readonly] {
  background-color: #e9ecef;
  opacity: 1;
}

/* Textarea with icon */
.has-icon {
  padding-left: 2.5rem;
}

.textarea-prepend {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 40px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  color: #6c757d;
  pointer-events: none;
  padding-top: 0.75rem;
}

/* Loading state */
.textarea-loading {
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  pointer-events: none;
}

.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error state */
.has-error textarea {
  border-color: #e74c3c;
}

.has-error textarea:focus {
  border-color: #e74c3c;
  box-shadow: 0 0 0 0.2rem rgba(231, 76, 60, 0.25);
}

.error-message {
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  text-align: left;
}

/* Hint text */
.hint {
  color: #6c757d;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  text-align: left;
  font-style: italic;
}

/* Disabled state */
.disabled .textarea-label {
  opacity: 0.6;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .textarea-label {
    color: #e2e8f0;
  }
  
  textarea {
    background-color: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  textarea:focus {
    background-color: #2d3748;
    border-color: #63b3ed;
    color: #e2e8f0;
    box-shadow: 0 0 0 3px rgba(99, 179, 237, 0.3);
  }
  
  textarea:disabled {
    background-color: #2d3748;
    opacity: 0.6;
  }
  
  .character-count {
    color: #a0aec0;
  }
  
  .hint {
    color: #a0aec0;
  }
  
  .textarea-prepend {
    color: #a0aec0;
  }
}
</style>
