<template>
  <section class="data-tables-demo">
    <div class="container py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h1 class="text-center mb-4 text-white">
            <i class="fas fa-table me-2"></i>Interactive Data Tables Demo
          </h1>
          <p class="text-center text-white-50 mb-3">
            Demonstrating interactive tables with sort, search, and pagination features
          </p>

          <!-- Data Initialization Controls -->
          <div class="text-center mb-4">
            <div v-if="!dataInitialized" class="alert alert-warning d-inline-block">
              <i class="fas fa-exclamation-triangle me-2"></i>
              {{ initMessage }}
            </div>
            <div v-else-if="initMessage" class="alert alert-success d-inline-block">
              <i class="fas fa-check-circle me-2"></i>
              {{ initMessage }}
            </div>

            <div class="mt-3">
              <button
                v-if="!dataInitialized"
                @click="initializeData"
                :disabled="loading"
                class="btn btn-primary btn-lg me-3"
              >
                <i class="fas fa-database me-2"></i>
                {{ loading ? 'Initializing...' : 'Initialize Data' }}
              </button>

              <button
                @click="loadDataFromFirestore"
                :disabled="loading"
                class="btn btn-outline-light btn-lg me-3"
              >
                <i class="fas fa-sync-alt me-2"></i>
                {{ loading ? 'Loading...' : 'Refresh Data' }}
              </button>

              <button
                @click="exportData('users')"
                :disabled="loading"
                class="btn btn-success btn-lg"
              >
                <i class="fas fa-download me-2"></i>
                Export Users CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="card shadow-lg">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="fas fa-users me-2"></i>Users Data Table
                <span class="badge bg-light text-dark ms-2">{{ users.length }} records</span>
              </h5>
            </div>
            <div class="card-body">
              <DataTable
                :data="users"
                :columns="userColumns"
                :items-per-page="10"
                :searchable="true"
                :sortable="true"
                :exportable="true"
                table-id="users-table"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Posts Table -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="card shadow-lg">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0">
                <i class="fas fa-comments me-2"></i>Forum Posts Data Table
                <span class="badge bg-light text-dark ms-2">{{ posts.length }} records</span>
              </h5>
            </div>
            <div class="card-body">
              <DataTable
                :data="posts"
                :columns="postColumns"
                :items-per-page="10"
                :searchable="true"
                :sortable="true"
                :exportable="true"
                table-id="posts-table"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Assessments Table -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="card shadow-lg">
            <div class="card-header bg-warning text-dark">
              <h5 class="mb-0">
                <i class="fas fa-clipboard-check me-2"></i>Mental Health Assessments
                <span class="badge bg-light text-dark ms-2">{{ assessments.length }} records</span>
              </h5>
            </div>
            <div class="card-body">
              <DataTable
                :data="assessments"
                :columns="assessmentColumns"
                :items-per-page="10"
                :searchable="true"
                :sortable="true"
                :exportable="true"
                table-id="assessments-table"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Appointments Table -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="card shadow-lg">
            <div class="card-header bg-info text-white">
              <h5 class="mb-0">
                <i class="fas fa-calendar-alt me-2"></i>Appointments Data Table
                <span class="badge bg-light text-dark ms-2">{{ appointments.length }} records</span>
              </h5>
            </div>
            <div class="card-body">
              <DataTable
                :data="appointments"
                :columns="appointmentColumns"
                :items-per-page="10"
                :searchable="true"
                :sortable="true"
                :exportable="true"
                table-id="appointments-table"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Services Table -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="card shadow-lg">
            <div class="card-header bg-secondary text-white">
              <h5 class="mb-0">
                <i class="fas fa-concierge-bell me-2"></i>Mental Health Services
                <span class="badge bg-light text-dark ms-2">{{ services.length }} records</span>
              </h5>
            </div>
            <div class="card-body">
              <DataTable
                :data="services"
                :columns="serviceColumns"
                :items-per-page="10"
                :searchable="true"
                :sortable="true"
                :exportable="true"
                table-id="services-table"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DataTable from '../components/DataTable.vue'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/config'
import { initializeAllData, checkDataExists } from '../services/databaseInit'
import { exportDataToCSV } from '../services/cloudFunctions'

// Reactive data
const users = ref([])
const posts = ref([])
const assessments = ref([])
const appointments = ref([])
const services = ref([])

// Reactive state for data initialization
const loading = ref(false)
const dataInitialized = ref(false)
const initMessage = ref('')

// Table column definitions
const userColumns = [
  { key: 'username', label: 'Username', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'firstName', label: 'First Name', sortable: true },
  { key: 'lastName', label: 'Last Name', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'age', label: 'Age', sortable: true },
  { key: 'location', label: 'Location', sortable: true },
  { key: 'status', label: 'Status', sortable: true }
]

const postColumns = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'author', label: 'Author', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'avgRating', label: 'Rating', sortable: true },
  { key: 'ratingCount', label: 'Votes', sortable: true },
  { key: 'views', label: 'Views', sortable: true },
  { key: 'replies', label: 'Replies', sortable: true },
  { key: 'status', label: 'Status', sortable: true }
]

const assessmentColumns = [
  { key: 'userId', label: 'User ID', sortable: true },
  { key: 'assessmentType', label: 'Type', sortable: true },
  { key: 'totalScore', label: 'Score', sortable: true },
  { key: 'severity', label: 'Severity', sortable: true },
  { key: 'riskLevel', label: 'Risk Level', sortable: true },
  { key: 'duration', label: 'Duration (min)', sortable: true },
  { key: 'followUpRequired', label: 'Follow-up', sortable: true },
  { key: 'isCompleted', label: 'Completed', sortable: true }
]

const appointmentColumns = [
  { key: 'clientName', label: 'Client', sortable: true },
  { key: 'appointmentType', label: 'Type', sortable: true },
  { key: 'counselor', label: 'Counselor', sortable: true },
  { key: 'scheduledDate', label: 'Date', sortable: true },
  { key: 'duration', label: 'Duration', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'location', label: 'Location', sortable: true },
  { key: 'isOnline', label: 'Online', sortable: true }
]

const serviceColumns = [
  { key: 'name', label: 'Service Name', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'provider', label: 'Provider', sortable: true },
  { key: 'location', label: 'Location', sortable: true },
  { key: 'cost', label: 'Cost', sortable: true },
  { key: 'availability', label: 'Availability', sortable: true },
  { key: 'rating', label: 'Rating', sortable: true },
  { key: 'isOnline', label: 'Online', sortable: true }
]

// Load data from Firestore
async function loadDataFromFirestore() {
  try {
    loading.value = true

    // Check if data exists
    const dataExists = await checkDataExists()

    if (!dataExists.users || !dataExists.posts || !dataExists.assessments || !dataExists.appointments || !dataExists.services) {
      initMessage.value = 'Data not found. Click "Initialize Data" to generate sample data.'
      dataInitialized.value = false
      return
    }

    // Load users
    const usersSnapshot = await getDocs(query(collection(db, 'mockUsers'), orderBy('createdAt', 'desc')))
    users.value = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Load posts
    const postsSnapshot = await getDocs(query(collection(db, 'mockPosts'), orderBy('createdAt', 'desc')))
    posts.value = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Load assessments
    const assessmentsSnapshot = await getDocs(query(collection(db, 'mockAssessments'), orderBy('createdAt', 'desc')))
    assessments.value = assessmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Load appointments
    const appointmentsSnapshot = await getDocs(query(collection(db, 'mockAppointments'), orderBy('createdAt', 'desc')))
    appointments.value = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Load services
    const servicesSnapshot = await getDocs(query(collection(db, 'mockServices'), orderBy('createdAt', 'desc')))
    services.value = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    dataInitialized.value = true
    initMessage.value = `Loaded ${users.value.length} users, ${posts.value.length} posts, ${assessments.value.length} assessments, ${appointments.value.length} appointments, ${services.value.length} services.`

  } catch (error) {
    console.error('Error loading data:', error)
    initMessage.value = 'Error loading data: ' + error.message
    dataInitialized.value = false
  } finally {
    loading.value = false
  }
}

// Initialize data
async function initializeData() {
  try {
    loading.value = true
    initMessage.value = 'Initializing data...'

    const result = await initializeAllData()

    if (result.success) {
      initMessage.value = 'Data initialized successfully! Reloading...'
      await loadDataFromFirestore()
    } else {
      initMessage.value = 'Error initializing data: ' + result.message
    }
  } catch (error) {
    console.error('Error initializing data:', error)
    initMessage.value = 'Error initializing data: ' + error.message
  } finally {
    loading.value = false
  }
}

// Export data using Cloud Functions
async function exportData(dataType) {
  try {
    loading.value = true
    initMessage.value = `Exporting ${dataType} data...`
    
    await exportDataToCSV(dataType)
    initMessage.value = `${dataType} data exported successfully!`
    
    setTimeout(() => {
      initMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error exporting data:', error)
    initMessage.value = 'Error exporting data: ' + error.message
  } finally {
    loading.value = false
  }
}

// Load mock data on component mount
onMounted(() => {
  loadDataFromFirestore()
})
</script>

<style scoped>
.data-tables-demo {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.card {
  border: none;
  border-radius: 15px;
}

.card-header {
  border-radius: 15px 15px 0 0 !important;
  font-weight: 600;
}

.badge {
  font-size: 0.8em;
}

.alert {
  border-radius: 10px;
  border: none;
}

.btn {
  border-radius: 25px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.btn:disabled {
  transform: none;
  box-shadow: none;
}
</style>