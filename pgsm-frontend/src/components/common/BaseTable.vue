<template>
  <div class="table-container">
    <!-- Table Controls -->
    <div v-if="showControls" class="table-controls">
      <div class="table-actions">
        <slot name="table-actions">
          <BaseButton 
            v-if="selectable && selectedRows.length > 0" 
            size="small" 
            variant="outline" 
            @click="clearSelection"
          >
            Clear Selection ({{ selectedRows.length }})
          </BaseButton>
        </slot>
      </div>
      
      <div v-if="searchable" class="table-search">
        <BaseInput
          v-model="searchQuery"
          placeholder="Search..."
          :loading="loading"
          size="small"
        >
          <template #prepend>
            <i class="icon-search"></i>
          </template>
        </BaseInput>
      </div>
    </div>
    
    <!-- Table Wrapper -->
    <div class="table-responsive">
      <table class="base-table" :class="{ 'is-loading': loading, 'is-selectable': selectable }">
        <!-- Table Header -->
        <thead>
          <tr>
            <th 
              v-if="selectable" 
              class="select-column"
            >
              <BaseCheckbox 
                :model-value="allRowsSelected"
                :indeterminate="someRowsSelected"
                @update:modelValue="toggleSelectAll"
              />
            </th>
            
            <th 
              v-for="(column, index) in columns" 
              :key="index"
              :class="[
                column.align ? `text-${column.align}` : '',
                column.sortable ? 'is-sortable' : '',
                { 'is-sorted': sortBy === column.field },
                column.headerClass || ''
              ]"
              :style="column.width ? { width: column.width } : {}"
              @click="column.sortable ? sort(column.field) : null"
            >
              <div class="header-content">
                <span>{{ column.label }}</span>
                <i 
                  v-if="column.sortable" 
                  class="sort-icon"
                  :class="{
                    'icon-arrow-up': sortBy === column.field && sortDirection === 'asc',
                    'icon-arrow-down': sortBy === column.field && sortDirection === 'desc',
                    'icon-chevron-down': sortBy !== column.field
                  }"
                ></i>
              </div>
            </th>
            
            <th v-if="hasActions" class="actions-column">
              Actions
            </th>
          </tr>
        </thead>
        
        <!-- Table Body -->
        <tbody>
          <tr v-if="loading && !paginatedData.length">
            <td :colspan="totalColumns" class="loading-row">
              <div class="loading-content">
                <BaseSpinner size="small" />
                <span>Loading data...</span>
              </div>
            </td>
          </tr>
          
          <tr v-else-if="!loading && !filteredData.length">
            <td :colspan="totalColumns" class="empty-row">
              <div class="empty-content">
                <i class="icon-inbox"></i>
                <p>No data available</p>
              </div>
            </td>
          </tr>
          
          <tr 
            v-for="(row, rowIndex) in paginatedData" 
            v-else
            :key="rowIndex"
            :class="{
              'is-selected': isRowSelected(row),
              'is-clickable': clickableRows,
              'is-striped': striped && rowIndex % 2 === 0
            }"
            @click="clickableRows ? $emit('row-click', row, $event) : null"
          >
            <td v-if="selectable" class="select-cell" @click.stop>
              <BaseCheckbox 
                :model-value="isRowSelected(row)"
                @update:modelValue="(val) => toggleRowSelection(row, val)"
              />
            </td>
            
            <td 
              v-for="(column, colIndex) in columns" 
              :key="colIndex"
              :class="[
                column.align ? `text-${column.align}` : '',
                column.cellClass ? column.cellClass(row) : ''
              ]"
            >
              <slot 
                :name="`cell-${column.field}`" 
                :value="row[column.field]" 
                :row="row"
                :index="rowIndex"
              >
                {{ formatCellValue(row[column.field], column) }}
              </slot>
            </td>
            
            <td v-if="hasActions" class="actions-cell" @click.stop>
              <slot name="actions" :row="row" :index="rowIndex"></slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Table Footer -->
    <div v-if="showFooter" class="table-footer">
      <div class="table-info">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredData.length }} entries
        <span v-if="filteredData.length < totalItems">
          (filtered from {{ totalItems }} total entries)
        </span>
      </div>
      
      <BasePagination
        v-if="pagination"
        v-model:current-page="currentPage"
        :total-items="filteredData.length"
        :items-per-page="itemsPerPage"
        :show-page-size="showPageSize"
        :page-sizes="pageSizes"
        @update:items-per-page="updateItemsPerPage"
      />
    </div>
  </div>
</template>

<script>
import { computed, ref, toRefs, watch } from 'vue';
import BaseButton from './BaseButton.vue';
import BaseInput from './BaseInput.vue';
import BaseCheckbox from './BaseCheckbox.vue';
import BaseSpinner from './BaseSpinner.vue';
import BasePagination from './BasePagination.vue';

export default {
  name: 'BaseTable',
  components: {
    BaseButton,
    BaseInput,
    BaseCheckbox,
    BaseSpinner,
    BasePagination
  },
  props: {
    columns: {
      type: Array,
      required: true,
      validator: (value) => {
        return value.every(col => {
          return typeof col === 'object' && 'field' in col && 'label' in col;
        });
      }
    },
    data: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    selectable: {
      type: Boolean,
      default: false
    },
    clickableRows: {
      type: Boolean,
      default: false
    },
    striped: {
      type: Boolean,
      default: true
    },
    pagination: {
      type: [Boolean, Object],
      default: () => ({
        enabled: true,
        itemsPerPage: 10,
        showPageSize: true,
        pageSizes: [10, 25, 50, 100]
      })
    },
    searchable: {
      type: Boolean,
      default: true
    },
    searchFields: {
      type: Array,
      default: null // If null, all string fields will be searchable
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    showControls: {
      type: Boolean,
      default: true
    },
    initialSort: {
      type: Object,
      default: () => ({
        field: '',
        direction: 'asc' // 'asc' or 'desc'
      })
    },
    selected: {
      type: Array,
      default: () => []
    },
    rowKey: {
      type: String,
      default: 'id'
    }
  },
  emits: [
    'update:selected',
    'sort-change',
    'row-click',
    'selection-change',
    'page-change',
    'items-per-page-change'
  ],
  setup(props, { emit }) {
    const { data, initialSort, selected: selectedRows } = toRefs(props);
    
    // Search
    const searchQuery = ref('');
    
    // Sorting
    const sortBy = ref(initialSort.value.field);
    const sortDirection = ref(initialSort.value.direction || 'asc');
    
    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(
      typeof props.pagination === 'object' 
        ? props.pagination.itemsPerPage || 10 
        : 10
    );
    
    const showPageSize = ref(
      typeof props.pagination === 'object' 
        ? props.pagination.showPageSize ?? true 
        : true
    );
    
    const pageSizes = ref(
      typeof props.pagination === 'object' 
        ? props.pagination.pageSizes || [10, 25, 50, 100] 
        : [10, 25, 50, 100]
    );
    
    // Computed properties
    const filteredData = computed(() => {
      if (!searchQuery.value) return [...data.value];
      
      const query = searchQuery.value.toLowerCase();
      const searchableFields = props.searchFields || 
        props.columns
          .filter(col => col.searchable !== false)
          .map(col => col.field);
      
      return data.value.filter(row => {
        return searchableFields.some(field => {
          const value = String(row[field] || '').toLowerCase();
          return value.includes(query);
        });
      });
    });
    
    const sortedData = computed(() => {
      if (!sortBy.value) return filteredData.value;
      
      return [...filteredData.value].sort((a, b) => {
        let valueA = a[sortBy.value];
        let valueB = b[sortBy.value];
        
        // Handle null/undefined values
        if (valueA == null) return sortDirection.value === 'asc' ? -1 : 1;
        if (valueB == null) return sortDirection.value === 'asc' ? 1 : -1;
        
        // Convert to string for comparison if not already
        if (typeof valueA === 'string') valueA = valueA.toLowerCase();
        if (typeof valueB === 'string') valueB = valueB.toLowerCase();
        
        // Compare values
        if (valueA < valueB) return sortDirection.value === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection.value === 'asc' ? 1 : -1;
        return 0;
      });
    });
    
    const paginatedData = computed(() => {
      if (!props.pagination) return sortedData.value;
      
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      
      return sortedData.value.slice(start, end);
    });
    
    const totalItems = computed(() => data.value.length);
    const totalPages = computed(() => 
      Math.ceil(filteredData.value.length / itemsPerPage.value)
    );
    
    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value;
    });
    
    const endIndex = computed(() => {
      const end = startIndex.value + itemsPerPage.value;
      return end > filteredData.value.length ? filteredData.value.length : end;
    });
    
    const totalColumns = computed(() => {
      return props.columns.length + 
             (props.selectable ? 1 : 0) + 
             (props.$slots.actions ? 1 : 0);
    });
    
    const hasActions = computed(() => {
      return !!props.$slots.actions;
    });
    
    const allRowsSelected = computed(() => {
      if (!props.selectable || !paginatedData.value.length) return false;
      return paginatedData.value.every(row => 
        selectedRows.value.some(selected => 
          selected[props.rowKey] === row[props.rowKey]
        )
      );
    });
    
    const someRowsSelected = computed(() => {
      if (!props.selectable || !paginatedData.value.length) return false;
      const selectedCount = paginatedData.value.filter(row => 
        selectedRows.value.some(selected => 
          selected[props.rowKey] === row[props.rowKey]
        )
      ).length;
      return selectedCount > 0 && selectedCount < paginatedData.value.length;
    });
    
    // Methods
    const sort = (field) => {
      if (sortBy.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortBy.value = field;
        sortDirection.value = 'asc';
      }
      
      currentPage.value = 1; // Reset to first page when sorting
      
      emit('sort-change', {
        field: sortBy.value,
        direction: sortDirection.value
      });
    };
    
    const toggleSelectAll = (isSelected) => {
      if (isSelected) {
        // Add all current page rows to selection
        const newSelection = [...selectedRows.value];
        paginatedData.value.forEach(row => {
          if (!newSelection.some(selected => selected[props.rowKey] === row[props.rowKey])) {
            newSelection.push(row);
          }
        });
        emit('update:selected', newSelection);
        emit('selection-change', newSelection);
      } else {
        // Remove all current page rows from selection
        const pageRowIds = new Set(paginatedData.value.map(row => row[props.rowKey]));
        const newSelection = selectedRows.value.filter(
          row => !pageRowIds.has(row[props.rowKey])
        );
        emit('update:selected', newSelection);
        emit('selection-change', newSelection);
      }
    };
    
    const toggleRowSelection = (row, isSelected) => {
      let newSelection;
      
      if (isSelected) {
        newSelection = [...selectedRows.value, row];
      } else {
        newSelection = selectedRows.value.filter(
          selected => selected[props.rowKey] !== row[props.rowKey]
        );
      }
      
      emit('update:selected', newSelection);
      emit('selection-change', newSelection);
    };
    
    const isRowSelected = (row) => {
      return selectedRows.value.some(
        selected => selected[props.rowKey] === row[props.rowKey]
      );
    };
    
    const clearSelection = () => {
      emit('update:selected', []);
      emit('selection-change', []);
    };
    
    const updateItemsPerPage = (newSize) => {
      itemsPerPage.value = newSize;
      currentPage.value = 1; // Reset to first page when changing page size
      emit('items-per-page-change', newSize);
    };
    
    const formatCellValue = (value, column) => {
      if (column.formatter) {
        return column.formatter(value);
      }
      
      if (value === null || value === undefined) {
        return column.emptyValue || '-';
      }
      
      if (column.format === 'date' && value) {
        return new Date(value).toLocaleDateString();
      }
      
      if (column.format === 'currency' && typeof value === 'number') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: column.currency || 'USD'
        }).format(value);
      }
      
      return value;
    };
    
    // Watchers
    watch(searchQuery, () => {
      currentPage.value = 1; // Reset to first page when searching
    });
    
    watch(() => props.data, () => {
      // Reset to first page when data changes
      currentPage.value = 1;
    });
    
    return {
      // Refs
      searchQuery,
      sortBy,
      sortDirection,
      currentPage,
      itemsPerPage,
      showPageSize,
      pageSizes,
      
      // Computed
      filteredData,
      sortedData,
      paginatedData,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      totalColumns,
      hasActions,
      allRowsSelected,
      someRowsSelected,
      
      // Methods
      sort,
      toggleSelectAll,
      toggleRowSelection,
      isRowSelected,
      clearSelection,
      updateItemsPerPage,
      formatCellValue
    };
  }
};
</script>

<style scoped>
.table-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f2f5;
  background-color: #f8fafc;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.table-search {
  width: 300px;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.base-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  position: relative;
}

.base-table th,
.base-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f2f5;
  vertical-align: middle;
}

.base-table th {
  background-color: #f8fafc;
  color: #4a5568;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  white-space: nowrap;
  user-select: none;
}

.base-table th.is-sortable {
  cursor: pointer;
  transition: background-color 0.2s;
}

.base-table th.is-sortable:hover {
  background-color: #edf2f7;
}

.base-table th.is-sorted {
  color: #3182ce;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-icon {
  font-size: 0.875rem;
  opacity: 0.7;
  transition: transform 0.2s;
}

th.is-sorted .sort-icon {
  opacity: 1;
}

.base-table tbody tr {
  transition: background-color 0.2s;
}

.base-table tbody tr:hover {
  background-color: #f8fafc;
}

.base-table tbody tr.is-clickable:hover {
  cursor: pointer;
  background-color: #f0f7ff;
}

.base-table tbody tr.is-selected {
  background-color: #ebf8ff;
}

.base-table tbody tr.is-striped {
  background-color: #f8fafc;
}

.base-table tbody tr.is-striped:hover {
  background-color: #f0f5ff;
}

.base-table tbody tr.is-selected.is-striped {
  background-color: #e1f0ff;
}

.select-column {
  width: 40px;
  padding: 0 0.5rem !important;
  text-align: center !important;
}

.select-cell {
  padding: 0 0.5rem !important;
  text-align: center !important;
}

.actions-column {
  width: 100px;
  text-align: center !important;
}

.actions-cell {
  padding: 0.5rem !important;
  text-align: center !important;
  white-space: nowrap;
}

.loading-row,
.empty-row {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-content,
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #718096;
}

.loading-content {
  min-height: 100px;
}

.empty-content i {
  font-size: 2.5rem;
  opacity: 0.5;
}

.empty-content p {
  margin: 0;
  font-size: 1rem;
  color: #4a5568;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f2f5;
  background-color: #f8fafc;
  font-size: 0.875rem;
  color: #4a5568;
}

.table-info {
  font-size: 0.85rem;
  color: #718096;
}

/* Responsive styles */
@media (max-width: 768px) {
  .table-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .table-search {
    width: 100%;
  }
  
  .table-footer {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .table-container {
    background-color: #2d3748;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  
  .table-controls,
  .table-footer {
    background-color: #2d3748;
    border-color: #4a5568;
  }
  
  .base-table th {
    background-color: #2d3748;
    color: #a0aec0;
    border-color: #4a5568;
  }
  
  .base-table th.is-sorted {
    color: #63b3ed;
  }
  
  .base-table th.is-sortable:hover {
    background-color: #4a5568;
  }
  
  .base-table td {
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .base-table tbody tr {
    background-color: #2d3748;
  }
  
  .base-table tbody tr:hover {
    background-color: #4a5568;
  }
  
  .base-table tbody tr.is-clickable:hover {
    background-color: #3a4a6b;
  }
  
  .base-table tbody tr.is-selected {
    background-color: #2c5282;
  }
  
  .base-table tbody tr.is-striped {
    background-color: #2d3748;
  }
  
  .base-table tbody tr.is-striped:hover {
    background-color: #4a5568;
  }
  
  .base-table tbody tr.is-selected.is-striped {
    background-color: #2c5282;
  }
  
  .empty-content i,
  .empty-content p {
    color: #a0aec0;
  }
  
  .table-info {
    color: #a0aec0;
  }
}
</style>
