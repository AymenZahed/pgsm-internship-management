<template>
  <div class="file-upload" :class="{ 'has-files': modelValue && modelValue.length > 0 }">
    <div 
      class="file-upload-dropzone"
      :class="{ 'is-dragover': isDragover, 'is-disabled': disabled }"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        class="file-upload-input"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled || loading"
        @change="handleFileChange"
      />
      
      <div v-if="loading" class="file-upload-loading">
        <BaseSpinner size="small" />
        <span class="file-upload-loading-text">Uploading...</span>
      </div>
      
      <div v-else class="file-upload-content">
        <div class="file-upload-icon">
          <i class="icon-upload"></i>
        </div>
        <div class="file-upload-text">
          <p class="file-upload-title">
            {{ title || 'Drag & drop files here or click to browse' }}
          </p>
          <p v-if="subtitle" class="file-upload-subtitle">{{ subtitle }}</p>
          <p v-if="acceptedFormats" class="file-upload-formats">
            Supported formats: {{ acceptedFormats }}
          </p>
          <p v-if="maxSize" class="file-upload-max-size">
            Max size: {{ maxSize }}MB
          </p>
        </div>
      </div>
    </div>

    <!-- Selected files preview -->
    <div v-if="modelValue && modelValue.length > 0" class="file-upload-preview">
      <div v-for="(file, index) in modelValue" :key="index" class="file-preview-item">
        <div class="file-preview-info">
          <i class="file-icon" :class="getFileIcon(file)"></i>
          <div class="file-details">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
        </div>
        <button 
          type="button" 
          class="file-remove-btn"
          :disabled="disabled || loading"
          @click.stop="removeFile(index)"
          aria-label="Remove file"
        >
          <i class="icon-close"></i>
        </button>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="file-upload-error">
      <i class="icon-alert-circle"></i>
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import BaseSpinner from './BaseSpinner.vue';

export default {
  name: 'BaseFileUpload',
  components: {
    BaseSpinner
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    accept: {
      type: String,
      default: '*/*'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    maxFiles: {
      type: Number,
      default: 10
    },
    maxSize: {
      type: Number,
      default: 10 // MB
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    acceptedFormats: {
      type: String,
      default: ''
    },
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'file-added', 'file-removed', 'error'],
  setup(props, { emit }) {
    const fileInput = ref(null);
    const isDragover = ref(false);
    const files = ref([...props.modelValue]);

    // Watch for changes in modelValue
    watch(() => props.modelValue, (newVal) => {
      files.value = [...newVal];
    });

    const triggerFileInput = () => {
      if (!props.disabled && !props.loading) {
        fileInput.value.click();
      }
    };

    const handleDragOver = () => {
      if (!props.disabled && !props.loading) {
        isDragover.value = true;
      }
    };

    const handleDragLeave = () => {
      isDragover.value = false;
    };

    const validateFile = (file) => {
      // Check file size
      const maxSizeInBytes = props.maxSize * 1024 * 1024; // Convert MB to bytes
      if (file.size > maxSizeInBytes) {
        emit('error', `File "${file.name}" exceeds maximum size of ${props.maxSize}MB`);
        return false;
      }

      // Check file type if accept prop is specified
      if (props.accept !== '*/*') {
        const acceptedTypes = props.accept.split(',').map(type => type.trim());
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        
        const isAccepted = acceptedTypes.some(type => {
          // Check MIME type
          if (type.startsWith('.')) {
            return fileName.endsWith(type.toLowerCase());
          }
          // Check MIME type pattern (e.g., image/*)
          if (type.endsWith('/*')) {
            const typePrefix = type.split('/')[0];
            return fileType.startsWith(typePrefix);
          }
          // Exact MIME type match
          return fileType === type;
        });

        if (!isAccepted) {
          emit('error', `File type not supported: ${file.name}`);
          return false;
        }
      }

      return true;
    };

    const processFiles = (fileList) => {
      const newFiles = Array.from(fileList);
      const validFiles = [];
      let hasError = false;

      // Check if adding these files would exceed maxFiles
      if (props.multiple) {
        const remainingSlots = props.maxFiles - files.value.length;
        if (newFiles.length > remainingSlots) {
          emit('error', `You can only upload up to ${props.maxFiles} files`);
          return;
        }
      } else {
        // If not multiple, clear existing files
        files.value = [];
      }

      // Validate each file
      for (const file of newFiles) {
        if (validateFile(file)) {
          validFiles.push(file);
        } else {
          hasError = true;
        }
      }

      if (validFiles.length > 0) {
        const updatedFiles = props.multiple ? [...files.value, ...validFiles] : [validFiles[0]];
        files.value = updatedFiles;
        emit('update:modelValue', updatedFiles);
        emit('file-added', validFiles);
      }

      // Reset file input to allow selecting the same file again
      if (fileInput.value) {
        fileInput.value.value = '';
      }

      return !hasError;
    };

    const handleDrop = (event) => {
      isDragover.value = false;
      if (props.disabled || props.loading) return;
      
      const dt = event.dataTransfer;
      const files = dt.files;
      
      if (files && files.length > 0) {
        processFiles(files);
      }
    };

    const handleFileChange = (event) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        processFiles(files);
      }
    };

    const removeFile = (index) => {
      if (props.disabled || props.loading) return;
      
      const removedFile = files.value[index];
      const updatedFiles = [...files.value];
      updatedFiles.splice(index, 1);
      
      files.value = updatedFiles;
      emit('update:modelValue', updatedFiles);
      emit('file-removed', removedFile);
    };

    const getFileIcon = (file) => {
      const type = file.type.split('/')[0];
      const extension = file.name.split('.').pop().toLowerCase();
      
      const fileIcons = {
        image: 'icon-file-image',
        audio: 'icon-file-audio',
        video: 'icon-file-video',
        'application/pdf': 'icon-file-pdf',
        'application/msword': 'icon-file-word',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'icon-file-word',
        'application/vnd.ms-excel': 'icon-file-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'icon-file-excel',
        'application/vnd.ms-powerpoint': 'icon-file-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'icon-file-powerpoint',
        'text/plain': 'icon-file-text',
        'text/csv': 'icon-file-text',
        'application/zip': 'icon-file-zip',
        'application/x-rar-compressed': 'icon-file-zip',
        'application/x-7z-compressed': 'icon-file-zip'
      };

      // Check for specific extensions
      const extensionIcons = {
        doc: 'icon-file-word',
        docx: 'icon-file-word',
        xls: 'icon-file-excel',
        xlsx: 'icon-file-excel',
        ppt: 'icon-file-powerpoint',
        pptx: 'icon-file-powerpoint',
        txt: 'icon-file-text',
        csv: 'icon-file-text',
        zip: 'icon-file-zip',
        rar: 'icon-file-zip',
        '7z': 'icon-file-zip',
        jpg: 'icon-file-image',
        jpeg: 'icon-file-image',
        png: 'icon-file-image',
        gif: 'icon-file-image',
        bmp: 'icon-file-image',
        svg: 'icon-file-image',
        pdf: 'icon-file-pdf',
        mp3: 'icon-file-audio',
        wav: 'icon-file-audio',
        mp4: 'icon-file-video',
        mov: 'icon-file-video',
        avi: 'icon-file-video'
      };

      return fileIcons[file.type] || 
             fileIcons[type] || 
             extensionIcons[extension] || 
             'icon-file';
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Expose methods to parent component
    const clearFiles = () => {
      files.value = [];
      emit('update:modelValue', []);
    };

    return {
      fileInput,
      isDragover,
      triggerFileInput,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleFileChange,
      removeFile,
      getFileIcon,
      formatFileSize,
      clearFiles
    };
  }
};
</script>

<style scoped>
.file-upload {
  width: 100%;
  margin-bottom: 1rem;
}

.file-upload-dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f9fafb;
  position: relative;
  overflow: hidden;
}

.file-upload-dropzone:hover {
  border-color: #9ca3af;
  background-color: #f3f4f6;
}

.file-upload-dropzone.is-dragover {
  border-color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.05);
}

.file-upload-dropzone.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.file-upload-input {
  display: none;
}

.file-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.file-upload-icon {
  font-size: 2rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

.file-upload-title {
  font-weight: 500;
  color: #1f2937;
  margin: 0;
}

.file-upload-subtitle,
.file-upload-formats,
.file-upload-max-size {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0;
}

.file-upload-preview {
  margin-top: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  overflow: hidden;
}

.file-preview-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
}

.file-preview-item:last-child {
  border-bottom: none;
}

.file-preview-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 1.25rem;
  color: #6b7280;
  flex-shrink: 0;
}

.file-details {
  min-width: 0;
}

.file-name {
  display: block;
  font-size: 0.875rem;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.file-remove-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, background-color 0.2s;
}

.file-remove-btn:hover {
  color: #ef4444;
  background-color: #fef2f2;
}

.file-remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.file-upload-loading-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.file-upload-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #dc2626;
}

/* Dark mode styles */
.dark .file-upload-dropzone {
  border-color: #374151;
  background-color: #1f2937;
}

.dark .file-upload-dropzone:hover {
  border-color: #4b5563;
  background-color: #1f2937;
}

.dark .file-upload-dropzone.is-dragover {
  border-color: #3b82f6;
  background-color: rgba(30, 58, 138, 0.2);
}

.dark .file-upload-title {
  color: #f3f4f6;
}

.dark .file-upload-subtitle,
.dark .file-upload-formats,
.dark .file-upload-max-size {
  color: #9ca3af;
}

.dark .file-preview-item {
  background-color: #1f2937;
  border-color: #374151;
}

.dark .file-name {
  color: #f3f4f6;
}

.dark .file-size {
  color: #9ca3af;
}

.dark .file-remove-btn {
  color: #9ca3af;
}

.dark .file-remove-btn:hover {
  color: #f87171;
  background-color: rgba(220, 38, 38, 0.1);
}
</style>