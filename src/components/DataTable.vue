<template>
  <div class="data-table-container">
    <!-- Search Bar -->
    <div class="row mb-3">
      <div class="col-12 col-md-6">
        <label class="form-label fw-bold">Search:</label>
        <input
          v-model="globalSearch"
          type="text"
          class="form-control"
          :placeholder="`Search ${title}...`"
          aria-label="Global search"
        />
      </div>
      <div class="col-12 col-md-6 d-flex align-items-end">
        <div class="ms-auto">
          <span class="text-muted">Showing {{ paginatedData.length }} of {{ filteredData.length }} entries</span>
        </div>
      </div>
    </div>

    <!-- Column-specific Search -->
    <div class="row mb-3" v-if="enableColumnSearch">
      <div v-for="column in columns" :key="column.key" :class="columnClass">
        <label class="form-label small">{{ column.label }}</label>
        <input
          v-model="columnSearches[column.key]"
          type="text"
          class="form-control form-control-sm"
          :placeholder="`Search ${column.label}...`"
          :aria-label="`Search by ${column.label}`"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="table-responsive">
      <table class="table table-hover table-striped" role="table" aria-label="Data table">
        <thead class="table-dark">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              @click="sortBy(column.key)"
              :class="{ 'sortable': column.sortable !== false }"
              role="columnheader"
              :aria-sort="getSortAriaLabel(column.key)"
              tabindex="0"
              @keypress.enter="sortBy(column.key)"
            >
              {{ column.label }}
              <span v-if="column.sortable !== false" class="sort-icon">
                <i v-if="sortColumn === column.key && sortDirection === 'asc'" class="fas fa-sort-up"></i>
                <i v-else-if="sortColumn === column.key && sortDirection === 'desc'" class="fas fa-sort-down"></i>
                <i v-else class="fas fa-sort text-muted"></i>
              </span>
            </th>
            <th v-if="hasActions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedData.length === 0">
            <td :colspan="columns.length + (hasActions ? 1 : 0)" class="text-center text-muted">
              No data available
            </td>
          </tr>
          <tr v-for="(row, index) in paginatedData" :key="index">
            <td v-for="column in columns" :key="column.key">
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ formatCell(row[column.key], column) }}
              </slot>
            </td>
            <td v-if="hasActions">
              <slot name="actions" :row="row"></slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="row align-items-center">
      <div class="col-12 col-md-6">
        <div class="d-flex align-items-center">
          <label class="me-2">Rows per page:</label>
          <select
            v-model.number="itemsPerPage"
            class="form-select form-select-sm w-auto"
            aria-label="Rows per page"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <nav aria-label="Table pagination">
          <ul class="pagination justify-content-end mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button
                class="page-link"
                @click="currentPage = 1"
                :disabled="currentPage === 1"
                aria-label="First page"
              >
                <i class="fas fa-angle-double-left"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button
                class="page-link"
                @click="currentPage--"
                :disabled="currentPage === 1"
                aria-label="Previous page"
              >
                <i class="fas fa-angle-left"></i>
              </button>
            </li>
            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: currentPage === page }"
            >
              <button class="page-link" @click="currentPage = page" :aria-label="`Page ${page}`">
                {{ page }}
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button
                class="page-link"
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                aria-label="Next page"
              >
                <i class="fas fa-angle-right"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button
                class="page-link"
                @click="currentPage = totalPages"
                :disabled="currentPage === totalPages"
                aria-label="Last page"
              >
                <i class="fas fa-angle-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Table'
  },
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  enableColumnSearch: {
    type: Boolean,
    default: true
  },
  hasActions: {
    type: Boolean,
    default: false
  },
  defaultItemsPerPage: {
    type: Number,
    default: 10
  }
})

const globalSearch = ref('')
const columnSearches = ref({})
const sortColumn = ref('')
const sortDirection = ref('asc')
const currentPage = ref(1)
const itemsPerPage = ref(props.defaultItemsPerPage)

// Initialize column searches
props.columns.forEach(col => {
  columnSearches.value[col.key] = ''
})

// Compute column class for responsive layout
const columnClass = computed(() => {
  const colCount = props.columns.length
  if (colCount <= 2) return 'col-12 col-md-6'
  if (colCount <= 3) return 'col-12 col-md-4'
  if (colCount <= 4) return 'col-12 col-md-3'
  return 'col-12 col-md-2'
})

// Filter data based on search
const filteredData = computed(() => {
  let result = props.data

  // Global search
  if (globalSearch.value) {
    const searchTerm = globalSearch.value.toLowerCase()
    result = result.filter(row =>
      props.columns.some(col =>
        String(row[col.key] || '').toLowerCase().includes(searchTerm)
      )
    )
  }

  // Column-specific search
  Object.keys(columnSearches.value).forEach(key => {
    const searchTerm = columnSearches.value[key]
    if (searchTerm) {
      result = result.filter(row =>
        String(row[key] || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
  })

  return result
})

// Sort data
const sortedData = computed(() => {
  if (!sortColumn.value) return filteredData.value

  return [...filteredData.value].sort((a, b) => {
    let aVal = a[sortColumn.value]
    let bVal = b[sortColumn.value]

    // Handle null/undefined
    if (aVal == null) return 1
    if (bVal == null) return -1

    // Convert to string for comparison
    aVal = String(aVal).toLowerCase()
    bVal = String(bVal).toLowerCase()

    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

// Paginate data
const totalPages = computed(() => Math.ceil(sortedData.value.length / itemsPerPage.value))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedData.value.slice(start, end)
})

// Visible page numbers
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Sort function
function sortBy(column) {
  const col = props.columns.find(c => c.key === column)
  if (col && col.sortable === false) return

  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

// Get aria-sort label
function getSortAriaLabel(column) {
  if (sortColumn.value !== column) return 'none'
  return sortDirection.value === 'asc' ? 'ascending' : 'descending'
}

// Format cell value
function formatCell(value, column) {
  if (value == null) return '-'
  if (column.format) return column.format(value)
  return value
}

// Reset to page 1 when search changes
watch([globalSearch, columnSearches], () => {
  currentPage.value = 1
}, { deep: true })

// Reset to page 1 when items per page changes
watch(itemsPerPage, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.data-table-container {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.table {
  margin-bottom: 20px;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.sortable:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sortable:focus {
  outline: 2px solid #fff;
  outline-offset: -2px;
}

.sort-icon {
  margin-left: 5px;
  font-size: 0.8em;
}

.page-link {
  cursor: pointer;
}

.page-item.disabled .page-link {
  cursor: not-allowed;
}

.table-responsive {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .data-table-container {
    padding: 10px;
  }

  .pagination {
    font-size: 0.875rem;
  }
}
</style>
