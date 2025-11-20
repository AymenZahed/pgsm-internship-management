<template>
  <div class="form-group" :class="{ 'has-error': error, 'disabled': disabled }">
    <label v-if="label" :for="id" class="input-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    
    <div class="input-wrapper">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled || loading"
        :readonly="readonly"
        :class="[inputClass, { 'has-icon': $slots.prepend || $slots.append }]"
        v-bind="$attrs"
        @input="onInput"
        @blur="onBlur"
      />
      
      <span v-if="$slots.prepend" class="input-prepend">
        <slot name="prepend"></slot>
      </span>
      
      <span v-if="$slots.append" class="input-append">
        <slot name="append"></slot>
      </span>
      
      <div v-if="loading" class="input-loading">
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
  name: 'BaseInput',
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
    type: {
      type: String,
      default: 'text',
      validator: (value) => [
        'text', 'password', 'email', 'number', 'tel', 'url', 'search', 'date', 'time', 'datetime-local'
      ].includes(value)
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
    inputClass: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'blur'],
  data() {
    return {
      id: `input-${uuidv4()}`
    };
  },
  methods: {
    onInput(event) {
      this.$emit('update:modelValue', event.target.value);
    },
    onBlur(event) {
      this.$emit('blur', event);
    }
  }
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1.25rem;
  text-align: left;
}

.input-label {
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

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

input {
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
  height: 40px;
}

input:focus {
  color: #495057;
  background-color: #fff;
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

input:disabled,
input[readonly] {
  background-color: #e9ecef;
  opacity: 1;
}

/* Input with icons */
.has-icon {
  padding-left: 2.5rem;
}

.input-prepend,
.input-append {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  pointer-events: none;
  width: 40px;
  height: 100%;
}

.input-prepend {
  left: 0;
}

.input-append {
  right: 0;
}

/* Loading state */
.input-loading {
  position: absolute;
  right: 0.75rem;
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
.has-error input {
  border-color: #e74c3c;
}

.has-error input:focus {
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
.disabled .input-label {
  opacity: 0.6;
}
</style>
