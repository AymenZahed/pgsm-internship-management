<template>
  <div class="form-group" :class="{ 'has-error': error, 'disabled': disabled }">
    <label v-if="label" :for="id" class="select-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    
    <div class="select-wrapper">
      <select
        :id="id"
        :value="modelValue"
        :disabled="disabled || loading"
        :multiple="multiple"
        :class="[selectClass, { 'has-icon': $slots.prepend }]"
        v-bind="$attrs"
        @change="onChange"
        @blur="onBlur"
      >
        <option v-if="placeholder && !multiple" value="" disabled>
          {{ placeholder }}
        </option>
        <option 
          v-for="option in options" 
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
      
      <span v-if="$slots.prepend" class="select-prepend">
        <slot name="prepend"></slot>
      </span>
      
      <div v-if="loading" class="select-loading">
        <span class="loader"></span>
      </div>
      
      <i class="select-arrow"></i>
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
  name: 'BaseSelect',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number, Array],
      default: ''
    },
    options: {
      type: Array,
      required: true,
      validator: (value) => {
        return value.every(option => {
          return typeof option === 'object' && 'value' in option && 'label' in option;
        });
      }
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Select an option'
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
    loading: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    selectClass: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: () => `select-${uuidv4()}`
    }
  },
  emits: ['update:modelValue', 'change', 'blur'],
  methods: {
    onChange(event) {
      const selectedValue = event.target.value;
      this.$emit('update:modelValue', selectedValue);
      this.$emit('change', selectedValue);
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

.select-label {
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

.select-wrapper {
  position: relative;
  width: 100%;
}

select {
  width: 100%;
  padding: 0.625rem 1rem;
  padding-right: 2.5rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  height: 40px;
  appearance: none;
  cursor: pointer;
}

select:focus {
  color: #495057;
  background-color: #fff;
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

select:disabled,
select[readonly] {
  background-color: #e9ecef;
  opacity: 1;
  cursor: not-allowed;
}

/* Select with icon */
.has-icon {
  padding-left: 2.5rem;
}

.select-prepend {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  pointer-events: none;
}

/* Select arrow */
.select-arrow {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #6c757d;
  pointer-events: none;
}

/* Loading state */
.select-loading {
  position: absolute;
  right: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
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
.has-error select {
  border-color: #e74c3c;
}

.has-error select:focus {
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
.disabled .select-label {
  opacity: 0.6;
}

/* Multiple select */
select[multiple] {
  height: auto;
  min-height: 100px;
  padding: 0.5rem;
}

select[multiple] option {
  padding: 0.5rem;
  margin: 0.125rem 0;
  border-radius: 2px;
}

select[multiple] option:checked {
  background-color: #e9ecef;
  color: #495057;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .select-label {
    color: #e2e8f0;
  }
  
  select {
    background-color: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  select:focus {
    background-color: #2d3748;
    border-color: #63b3ed;
    color: #e2e8f0;
    box-shadow: 0 0 0 3px rgba(99, 179, 237, 0.3);
  }
  
  select:disabled {
    background-color: #2d3748;
    opacity: 0.6;
  }
  
  .select-arrow {
    border-top-color: #a0aec0;
  }
  
  .select-prepend {
    color: #a0aec0;
  }
  
  .hint {
    color: #a0aec0;
  }
  
  select[multiple] option:checked {
    background-color: #4a5568;
    color: #ffffff;
  }
}
</style>
