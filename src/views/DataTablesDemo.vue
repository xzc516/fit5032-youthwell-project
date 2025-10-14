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
                class="btn btn-outline-light btn-lg"
              >
                <i class="fas fa-sync-alt me-2"></i>
                {{ loading ? 'Loading...' : 'Refresh Data' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="card shadow-lg mb-5">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">
            <i class="fas fa-users me-2"></i>Users Management Table
            <span class="badge bg-light text-dark ms-2">{{ users.length }} users</span>
          </h5>
        </div>
        <div class="card-body">
          <DataTable
            title="Users"
            :columns="userColumns"
            :data="users"
            :hasActions="true"
            :defaultItemsPerPage="10"
          >
            <template #cell-role="{ value }">
              <span class="badge" :class="value === 'admin' ? 'bg-danger' : 'bg-primary'">
                {{ value.toUpperCase() }}
              </span>
            </template>
            <template #cell-status="{ value }">
              <span class="badge" :class="value === 'active' ? 'bg-success' : 'bg-secondary'">
                {{ value.toUpperCase() }}
              </span>
            </template>
            <template #cell-registrationDate="{ value }">
              {{ formatDate(value) }}
            </template>
            <template #cell-lastLogin="{ value }">
              {{ formatDate(value) }}
            </template>
            <template #actions="{ row }">
              <button
                class="btn btn-sm btn-outline-info me-2"
                @click="viewUser(row)"
                :aria-label="`View user ${row.username}`"
              >
                <i class="fas fa-eye"></i> View
              </button>
              <button
                class="btn btn-sm btn-outline-warning me-2"
                @click="editUser(row)"
                :aria-label="`Edit user ${row.username}`"
              >
                <i class="fas fa-edit"></i> Edit
              </button>
              <button
                class="btn btn-sm btn-outline-danger"
                @click="deleteUser(row)"
                :aria-label="`Delete user ${row.username}`"
              >
                <i class="fas fa-trash"></i> Delete
              </button>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Forum Posts Table -->
      <div class="card shadow-lg mb-5">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0">
            <i class="fas fa-comments me-2"></i>Forum Posts Management
            <span class="badge bg-light text-dark ms-2">{{ posts.length }} posts</span>
          </h5>
        </div>
        <div class="card-body">
          <DataTable
            title="Forum Posts"
            :columns="postColumns"
            :data="posts"
            :hasActions="true"
            :defaultItemsPerPage="10"
          >
            <template #cell-avgRating="{ value }">
              <div class="d-flex align-items-center">
                <i class="fas fa-star text-warning me-1"></i>
                <span class="fw-bold">{{ value }}</span>
              </div>
            </template>
            <template #cell-ratingCount="{ value }">
              <span class="badge bg-info">{{ value }} ratings</span>
            </template>
            <template #cell-category="{ value }">
              <span class="badge bg-secondary">{{ value }}</span>
            </template>
            <template #cell-createdAt="{ value }">
              {{ formatDate(value) }}
            </template>
            <template #cell-status="{ value }">
              <span class="badge" :class="value === 'published' ? 'bg-success' : 'bg-warning'">
                {{ value.toUpperCase() }}
              </span>
            </template>
            <template #actions="{ row }">
              <button
                class="btn btn-sm btn-outline-info me-2"
                @click="viewPost(row)"
                :aria-label="`View post ${row.title}`"
              >
                <i class="fas fa-eye"></i> View
              </button>
              <button
                class="btn btn-sm btn-outline-warning me-2"
                @click="editPost(row)"
                :aria-label="`Edit post ${row.title}`"
              >
                <i class="fas fa-edit"></i> Edit
              </button>
              <button
                class="btn btn-sm btn-outline-danger"
                @click="deletePost(row)"
                :aria-label="`Delete post ${row.title}`"
              >
                <i class="fas fa-trash"></i> Delete
              </button>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Mental Health Assessments Table -->
      <div class="card shadow-lg mb-5">
        <div class="card-header bg-info text-white">
          <h5 class="mb-0">
            <i class="fas fa-clipboard-check me-2"></i>Mental Health Assessments
            <span class="badge bg-light text-dark ms-2">{{ assessments.length }} assessments</span>
          </h5>
        </div>
        <div class="card-body">
          <DataTable
            title="Assessments"
            :columns="assessmentColumns"
            :data="assessments"
            :hasActions="true"
            :defaultItemsPerPage="10"
          >
            <template #cell-totalScore="{ value }">
              <span class="fw-bold text-primary">{{ value }}</span>
            </template>
            <template #cell-severity="{ value }">
              <span class="badge" :class="getSeverityClass(value)">
                {{ value.toUpperCase() }}
              </span>
            </template>
            <template #cell-riskLevel="{ value }">
              <span class="badge" :class="getRiskClass(value)">
                {{ value.toUpperCase() }}
              </span>
            </template>
            <template #cell-completedDate="{ value }">
              {{ formatDate(value) }}
            </template>
            <template #cell-followUpRequired="{ value }">
              <i class="fas" :class="value ? 'fa-exclamation-triangle text-warning' : 'fa-check text-success'"></i>
            </template>
            <template #actions="{ row }">
              <button
                class="btn btn-sm btn-outline-info me-2"
                @click="viewAssessment(row)"
                :aria-label="`View assessment ${row.id}`"
              >
                <i class="fas fa-eye"></i> View
              </button>
              <button
                class="btn btn-sm btn-outline-success"
                @click="generateReport(row)"
                :aria-label="`Generate report for assessment ${row.id}`"
              >
                <i class="fas fa-file-pdf"></i> Report
              </button>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Appointments Table -->
      <div class="card shadow-lg mb-5">
        <div class="card-header bg-warning text-dark">
          <h5 class="mb-0">
            <i class="fas fa-calendar-alt me-2"></i>Appointments Management
            <span class="badge bg-dark text-light ms-2">{{ appointments.length }} appointments</span>
          </h5>
        </div>
        <div class="card-body">
          <DataTable
            title="Appointments"
            :columns="appointmentColumns"
            :data="appointments"
            :hasActions="true"
            :defaultItemsPerPage="10"
          >
            <template #cell-appointmentType="{ value }">
              <span class="badge bg-primary">{{ value }}</span>
            </template>
            <template #cell-status="{ value }">
              <span class="badge" :class="getStatusClass(value)">
                {{ value.toUpperCase() }}
              </span>
            </template>
            <template #cell-scheduledDate="{ value }">
              {{ formatDateTime(value) }}
            </template>
            <template #cell-duration="{ value }">
              {{ value }} min
            </template>
            <template #cell-isOnline="{ value }">
              <i class="fas" :class="value ? 'fa-video text-success' : 'fa-building text-info'"></i>
            </template>
            <template #actions="{ row }">
              <button
                class="btn btn-sm btn-outline-info me-2"
                @click="viewAppointment(row)"
                :aria-label="`View appointment ${row.id}`"
              >
                <i class="fas fa-eye"></i> View
              </button>
              <button
                class="btn btn-sm btn-outline-warning me-2"
                @click="editAppointment(row)"
                :aria-label="`Edit appointment ${row.id}`"
              >
                <i class="fas fa-edit"></i> Edit
              </button>
              <button
                class="btn btn-sm btn-outline-danger"
                @click="cancelAppointment(row)"
                :aria-label="`Cancel appointment ${row.id}`"
              >
                <i class="fas fa-times"></i> Cancel
              </button>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Statistics Summary -->
      <div class="row">
        <div class="col-12">
          <div class="card shadow-lg">
            <div class="card-header bg-dark text-white">
              <h5 class="mb-0">
                <i class="fas fa-chart-bar me-2"></i>Data Tables Summary
              </h5>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-md-3">
                  <div class="stat-item">
                    <h3 class="text-primary">{{ users.length }}</h3>
                    <p class="text-muted">Total Users</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-item">
                    <h3 class="text-success">{{ posts.length }}</h3>
                    <p class="text-muted">Forum Posts</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-item">
                    <h3 class="text-info">{{ assessments.length }}</h3>
                    <p class="text-muted">Assessments</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-item">
                    <h3 class="text-warning">{{ appointments.length }}</h3>
                    <p class="text-muted">Appointments</p>
                  </div>
                </div>
              </div>
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

// Reactive data
const users = ref([])
const posts = ref([])
const assessments = ref([])
const appointments = ref([])

// Table column definitions
const userColumns = [
  { key: 'username', label: 'Username', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'firstName', label: 'First Name', sortable: true },
  { key: 'lastName', label: 'Last Name', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'age', label: 'Age', sortable: true },
  { key: 'location', label: 'Location', sortable: true },
  { key: 'registrationDate', label: 'Registration Date', sortable: true },
  { key: 'lastLogin', label: 'Last Login', sortable: true }
]

const postColumns = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'author', label: 'Author', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'avgRating', label: 'Rating', sortable: true },
  { key: 'ratingCount', label: 'Ratings', sortable: true },
  { key: 'views', label: 'Views', sortable: true },
  { key: 'replies', label: 'Replies', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'createdAt', label: 'Created', sortable: true }
]

const assessmentColumns = [
  { key: 'userId', label: 'User ID', sortable: true },
  { key: 'assessmentType', label: 'Type', sortable: true },
  { key: 'totalScore', label: 'Score', sortable: true },
  { key: 'severity', label: 'Severity', sortable: true },
  { key: 'riskLevel', label: 'Risk Level', sortable: true },
  { key: 'duration', label: 'Duration (min)', sortable: true },
  { key: 'followUpRequired', label: 'Follow-up', sortable: true },
  { key: 'completedDate', label: 'Completed', sortable: true }
]

const appointmentColumns = [
  { key: 'clientName', label: 'Client', sortable: true },
  { key: 'appointmentType', label: 'Type', sortable: true },
  { key: 'counselor', label: 'Counselor', sortable: true },
  { key: 'scheduledDate', label: 'Scheduled', sortable: true },
  { key: 'duration', label: 'Duration', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'location', label: 'Location', sortable: true },
  { key: 'isOnline', label: 'Online', sortable: true }
]

// Reactive state for data initialization
const loading = ref(false)
const dataInitialized = ref(false)
const initMessage = ref('')

// Load data from Firestore
async function loadDataFromFirestore() {
  try {
    loading.value = true
    
    // Check if data exists
    const dataExists = await checkDataExists()
    
    if (!dataExists.users || !dataExists.posts || !dataExists.assessments || !dataExists.appointments) {
      initMessage.value = 'Data not found. Click "Initialize Data" to generate sample data.'
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

    dataInitialized.value = true
    initMessage.value = `Loaded ${users.value.length} users, ${posts.value.length} posts, ${assessments.value.length} assessments, ${appointments.value.length} appointments`
    
  } catch (error) {
    console.error('Error loading data:', error)
    initMessage.value = 'Error loading data: ' + error.message
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

// Load mock data
onMounted(() => {
  loadDataFromFirestore()
})

// Utility functions
function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

function formatDateTime(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString()
}

function getSeverityClass(severity) {
  const classes = {
    'Minimal': 'bg-success',
    'Mild': 'bg-info',
    'Moderate': 'bg-warning',
    'Moderately Severe': 'bg-danger',
    'Severe': 'bg-dark'
  }
  return classes[severity] || 'bg-secondary'
}

function getRiskClass(risk) {
  const classes = {
    'Low': 'bg-success',
    'Medium': 'bg-warning',
    'High': 'bg-danger'
  }
  return classes[risk] || 'bg-secondary'
}

function getStatusClass(status) {
  const classes = {
    'Scheduled': 'bg-primary',
    'Completed': 'bg-success',
    'Cancelled': 'bg-danger',
    'No-show': 'bg-dark'
  }
  return classes[status] || 'bg-secondary'
}

// Action handlers
function viewUser(user) {
  alert(`Viewing user: ${user.username}`)
}

function editUser(user) {
  alert(`Editing user: ${user.username}`)
}

function deleteUser(user) {
  if (confirm(`Delete user ${user.username}?`)) {
    alert(`User ${user.username} deleted`)
  }
}

function viewPost(post) {
  alert(`Viewing post: ${post.title}`)
}

function editPost(post) {
  alert(`Editing post: ${post.title}`)
}

function deletePost(post) {
  if (confirm(`Delete post "${post.title}"?`)) {
    alert(`Post "${post.title}" deleted`)
  }
}

function viewAssessment(assessment) {
  alert(`Viewing assessment: ${assessment.assessmentType} (Score: ${assessment.totalScore})`)
}

function generateReport(assessment) {
  alert(`Generating report for ${assessment.assessmentType} assessment`)
}

function viewAppointment(appointment) {
  alert(`Viewing appointment: ${appointment.appointmentType}`)
}

function editAppointment(appointment) {
  alert(`Editing appointment: ${appointment.appointmentType}`)
}

function cancelAppointment(appointment) {
  if (confirm(`Cancel appointment with ${appointment.clientName}?`)) {
    alert(`Appointment cancelled`)
  }
}
</script>

<style scoped>
.data-tables-demo {
  padding: 20px 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  border: none;
  border-radius: 15px;
  overflow: hidden;
}

.card-header {
  border-bottom: none;
  padding: 20px;
}

.card-body {
  padding: 25px;
}

.stat-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 15px;
}

.stat-item h3 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-item p {
  margin: 0;
  font-size: 1.1rem;
}

.badge {
  font-size: 0.8rem;
  padding: 6px 12px;
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
  .data-tables-demo {
    padding: 10px 0;
  }
  
  .card-body {
    padding: 15px;
  }
  
  .stat-item {
    padding: 15px;
  }
  
  .stat-item h3 {
    font-size: 2rem;
  }
}
</style>
