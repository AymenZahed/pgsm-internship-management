<template>
  <div class="pagination" :class="{ 'is-centered': centered }">
    <ul class="pagination-list">
      <!-- First Page -->
      <li>
        <button 
          class="pagination-link" 
          :disabled="currentPage <= 1"
          @click="goToPage(1)"
          aria-label="Go to first page"
        >
          <span class="icon">
            <i class="icon-chevrons-left"></i>
          </span>
        </button>
      </li>
      
      <!-- Previous Page -->
      <li>
        <button 
          class="pagination-link" 
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
          aria-label="Go to previous page"
        >
          <span class="icon">
            <i class="icon-chevron-left"></i>
          </span>
        </button>
      </li>

      <!-- Page Numbers -->
      <template v-for="page in pagesToShow" :key="page">
        <li v-if="page === '...'" class="ellipsis">
          <span>…</span>
        </li>
        <li v-else>
          <button 
            class="pagination-link" 
            :class="{ 'is-current': currentPage === page }"
            @click="goToPage(page)"
            :aria-label="`Go to page ${page}`"
            :aria-current="currentPage === page ? 'page' : null"
          >
            {{ page }}
          </button>
        </li>
      </template>

      <!-- Next Page -->
      <li>
        <button 
          class="pagination-link" 
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
          aria-label="Go to next page"
        >
          <span class="icon">
            <i class="icon-chevron-right"></i>
          </span>
        </button>
      </li>
      
      <!-- Last Page -->
      <li>
        <button 
          class="pagination-link" 
          :disabled="currentPage >= totalPages"
          @click="goToPage(totalPages)"
          aria-label="Go to last page"
        >
          <span class="icon">
            <i class="icon-chevrons-right"></i>
          </span>
        </button>
      </li>
    </ul>
    
    <!-- Items per page selector -->
    <div v-if="showPageSize" class="pagination-page-size">
      <span class="page-size-label">Items per page:</span>
      <select 
        :value="itemsPerPage" 
        @change="updateItemsPerPage($event.target.value)"
        class="page-size-select"
        aria-label="Items per page"
      >
        <option v-for="size in pageSizes" :key="size" :value="size">
          {{ size }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'BasePagination',
  props: {
    currentPage: {
      type: Number,
      required: true,
      validator: value => value > 0
    },
    totalItems: {
      type: Number,
      required: true,
      validator: value => value >= 0
    },
    itemsPerPage: {
      type: Number,
      default: 10,
      validator: value => value > 0
    },
    showPageSize: {
      type: Boolean,
      default: true
    },
    pageSizes: {
      type: Array,
      default: () => [10, 25, 50, 100],
      validator: value => value.every(size => size > 0)
    },
    maxVisiblePages: {
      type: Number,
      default: 5,
      validator: value => value >= 3 && value % 2 === 1
    },
    centered: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:currentPage', 'update:itemsPerPage', 'page-change'],
  setup(props, { emit }) {
    const totalPages = computed(() => 
      Math.ceil(props.totalItems / props.itemsPerPage) || 1
    );

    const pagesToShow = computed(() => {
      const pages = [];
      const maxVisible = Math.min(props.maxVisiblePages, totalPages.value);
      
      if (totalPages.value <= maxVisible) {
        // Show all pages if total pages are less than max visible
        for (let i = 1; i <= totalPages.value; i++) {
          pages.push(i);
        }
      } else {
        // Always show first page
        pages.push(1);
        
        const leftSide = Math.floor(maxVisible / 2);
        const rightSide = maxVisible - leftSide - 1;
        
        let startPage = Math.max(2, props.currentPage - leftSide);
        let endPage = Math.min(totalPages.value - 1, props.currentPage + rightSide);
        
        // Adjust if we're at the start or end
        if (props.currentPage <= leftSide + 1) {
          endPage = maxVisible - 1;
        } else if (props.currentPage >= totalPages.value - rightSide) {
          startPage = totalPages.value - maxVisible + 2;
        }
        
        // Add ellipsis after first page if needed
        if (startPage > 2) {
          pages.push('...');
        }
        
        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
        
        // Add ellipsis before last page if needed
        if (endPage < totalPages.value - 1) {
          pages.push('...');
        }
        
        // Always show last page
        if (totalPages.value > 1) {
          pages.push(totalPages.value);
        }
      }
      
      return pages;
    });

    const goToPage = (page) => {
      if (page < 1 || page > totalPages.value || page === props.currentPage) {
        return;
      }
      emit('update:currentPage', page);
      emit('page-change', page);
    };

    const updateItemsPerPage = (size) => {
      const newSize = parseInt(size, 10);
      emit('update:itemsPerPage', newSize);
      // Reset to first page when changing items per page
      emit('update:currentPage', 1);
      emit('page-change', 1);
    };

    return {
      totalPages,
      pagesToShow,
      goToPage,
      updateItemsPerPage
    };
  }
};
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
}

.pagination.is-centered {
  justify-content: center;
}

.pagination-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.pagination-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.25em;
  height: 2.25em;
  padding: 0.25em 0.5em;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: #ffffff;
  color: #374151;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-link:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
  color: #111827;
}

.pagination-link.is-current {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
  cursor: default;
}

.pagination-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f3f4f6;
}

.ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.25em;
  height: 2.25em;
  padding: 0.25em 0.5em;
  color: #6b7280;
  user-select: none;
}

.pagination-page-size {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.page-size-select {
  padding: 0.25rem 1.75rem 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: #ffffff;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1em;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.page-size-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .pagination-link {
    background-color: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }
  
  .pagination-link:hover:not(:disabled) {
    background-color: #4b5563;
    border-color: #6b7280;
    color: #ffffff;
  }
  
  .pagination-link.is-current {
    background-color: #3b82f6;
    border-color: #3b82f6;
    color: #ffffff;
  }
  
  .pagination-link:disabled {
    background-color: #374151;
  }
  
  .ellipsis {
    color: #9ca3af;
  }
  
  .pagination-page-size {
    color: #9ca3af;
  }
  
  .page-size-select {
    background-color: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  }
  
  .page-size-select:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .pagination {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .pagination-list {
    justify-content: center;
  }
  
  .pagination-page-size {
    justify-content: center;
  }
}
</style>
