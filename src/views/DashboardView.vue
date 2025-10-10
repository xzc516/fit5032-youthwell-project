<template>
  <div class="dashboard-view">
    <div class="container py-4">
      <!-- Header -->
      <div class="text-white mb-4">
        <h1 class="display-5 fw-bold mb-2">Personal Dashboard</h1>
        <p class="lead">Track your mental health journey and progress over time</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center text-white py-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading your dashboard...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ error }}
      </div>

      <!-- Dashboard Content -->
      <div v-else>
        <!-- User Profile Card -->
        <div class="card shadow mb-4">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-8">
                <h4 class="mb-2">
                  <i class="bi bi-person-circle me-2 text-primary"></i>
                  Welcome back, {{ auth.currentUser?.username }}!
                </h4>
                <p class="text-muted mb-0">
                  Member since {{ formatDate(auth.currentUser?.createdAt) }}
                </p>
              </div>
              <div class="col-md-4 text-md-end mt-3 mt-md-0">
                <button @click="$router.push('/assessment')" class="btn btn-primary">
                  <i class="bi bi-clipboard-check me-2"></i>
                  Take Assessment
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="row g-4 mb-4">
          <div class="col-md-3">
            <div class="card shadow-sm h-100 border-primary">
              <div class="card-body text-center">
                <i class="bi bi-clipboard-check text-primary fs-1 mb-2"></i>
                <h3 class="mb-0">{{ assessmentResults.length }}</h3>
                <p class="text-muted mb-0">Assessments</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm h-100 border-success">
              <div class="card-body text-center">
                <i class="bi bi-chat-dots text-success fs-1 mb-2"></i>
                <h3 class="mb-0">{{ userPosts.length }}</h3>
                <p class="text-muted mb-0">Forum Posts</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm h-100 border-info">
              <div class="card-body text-center">
                <i class="bi bi-calendar-check text-info fs-1 mb-2"></i>
                <h3 class="mb-0">{{ daysActive }}</h3>
                <p class="text-muted mb-0">Days Active</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm h-100 border-warning">
              <div class="card-body text-center">
                <i class="bi bi-bookmark text-warning fs-1 mb-2"></i>
                <h3 class="mb-0">{{ savedResources.length }}</h3>
                <p class="text-muted mb-0">Saved Resources</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Assessment History -->
        <div class="card shadow mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
              <i class="bi bi-graph-up me-2"></i>
              Assessment History & Progress
            </h5>
          </div>
          <div class="card-body">
            <div v-if="assessmentResults.length === 0" class="text-center py-5">
              <i class="bi bi-clipboard-x text-muted fs-1 mb-3"></i>
              <h5 class="text-muted">No assessments yet</h5>
              <p class="text-muted">Take your first mental health assessment to start tracking your progress.</p>
              <button @click="$router.push('/assessment')" class="btn btn-primary">
                Take Assessment Now
              </button>
            </div>

            <div v-else>
              <!-- Chart Placeholder -->
              <div class="alert alert-info mb-4">
                <i class="bi bi-info-circle me-2"></i>
                <strong>Progress Chart:</strong> Visual progress tracking will be displayed here in production (using Chart.js or similar library)
              </div>

              <!-- Assessment Results Table -->
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Assessment Type</th>
                      <th>Score</th>
                      <th>Severity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="result in sortedAssessments" :key="result.id">
                      <td>{{ formatDate(result.timestamp) }}</td>
                      <td>{{ result.assessmentTitle }}</td>
                      <td>
                        <span class="badge bg-secondary">{{ result.score }}</span>
                      </td>
                      <td>
                        <span class="badge" :class="getSeverityBadgeClass(result.severity)">
                          {{ result.severity }}
                        </span>
                      </td>
                      <td>
                        <button @click="viewAssessmentDetails(result)" class="btn btn-sm btn-outline-primary me-2">
                          <i class="bi bi-eye"></i> View
                        </button>
                        <button @click="deleteAssessment(result.id)" class="btn btn-sm btn-outline-danger">
                          <i class="bi bi-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Forum Activity -->
        <div class="card shadow mb-4">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">
              <i class="bi bi-chat-dots me-2"></i>
              Your Recent Forum Activity
            </h5>
          </div>
          <div class="card-body">
            <div v-if="userPosts.length === 0" class="text-center py-4">
              <i class="bi bi-chat-x text-muted fs-1 mb-3"></i>
              <h5 class="text-muted">No forum posts yet</h5>
              <p class="text-muted">Join the conversation and connect with the community.</p>
              <button @click="$router.push('/forum')" class="btn btn-success">
                Visit Forum
              </button>
            </div>

            <div v-else class="list-group">
              <div
                v-for="post in recentPosts"
                :key="post.id"
                class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between align-items-start">
                  <div>
                    <h6 class="mb-1">{{ post.title }}</h6>
                    <p class="mb-1 text-muted small">{{ truncate(post.content, 100) }}</p>
                    <small class="text-muted">
                      <i class="bi bi-tag me-1"></i>{{ post.category || 'General' }}
                      <i class="bi bi-star-fill ms-3 me-1"></i>{{ post.rating || 0 }} ratings
                    </small>
                  </div>
                  <small class="text-muted">{{ formatDate(post.timestamp) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Saved Resources -->
        <div class="card shadow">
          <div class="card-header bg-warning text-dark">
            <h5 class="mb-0">
              <i class="bi bi-bookmark me-2"></i>
              Saved Resources
            </h5>
          </div>
          <div class="card-body">
            <div v-if="savedResources.length === 0" class="text-center py-4">
              <i class="bi bi-bookmark-x text-muted fs-1 mb-3"></i>
              <h5 class="text-muted">No saved resources yet</h5>
              <p class="text-muted">Bookmark helpful resources for quick access.</p>
              <button @click="$router.push('/resources')" class="btn btn-warning">
                Browse Resources
              </button>
            </div>

            <div v-else class="list-group">
              <div
                v-for="resource in savedResources"
                :key="resource.id"
                class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                  <div>
                    <h6 class="mb-1">{{ resource.title }}</h6>
                    <small class="text-muted">{{ resource.category }}</small>
                  </div>
                  <button @click="removeSavedResource(resource.id)" class="btn btn-sm btn-outline-danger">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assessment Details Modal Placeholder -->
    <div v-if="selectedAssessment" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Assessment Details</h5>
            <button @click="selectedAssessment = null" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Date:</strong> {{ formatDate(selectedAssessment.timestamp) }}
              </div>
              <div class="col-md-6">
                <strong>Type:</strong> {{ selectedAssessment.assessmentTitle }}
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Score:</strong> <span class="badge bg-secondary">{{ selectedAssessment.score }}</span>
              </div>
              <div class="col-md-6">
                <strong>Severity:</strong>
                <span class="badge" :class="getSeverityBadgeClass(selectedAssessment.severity)">
                  {{ selectedAssessment.severity }}
                </span>
              </div>
            </div>
            <div class="alert alert-info">
              <strong>Responses:</strong>
              <p class="mb-0 mt-2">{{ selectedAssessment.responses?.length || 0 }} questions answered</p>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="selectedAssessment = null" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFirebaseAuthStore } from '../stores/firebaseAuth'
import { db } from '../firebase/config'
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore'

const auth = useFirebaseAuthStore()

const loading = ref(true)
const error = ref(null)
const assessmentResults = ref([])
const userPosts = ref([])
const savedResources = ref([])
const selectedAssessment = ref(null)

const daysActive = computed(() => {
  if (!auth.currentUser?.createdAt) return 0
  const createdDate = new Date(auth.currentUser.createdAt)
  const today = new Date()
  const diffTime = Math.abs(today - createdDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

const sortedAssessments = computed(() => {
  return [...assessmentResults.value].sort((a, b) => {
    const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp)
    const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp)
    return dateB - dateA
  })
})

const recentPosts = computed(() => {
  return userPosts.value.slice(0, 5)
})

onMounted(async () => {
  await loadDashboardData()
})

async function loadDashboardData() {
  try {
    loading.value = true
    error.value = null

    if (!auth.currentUser?.uid) {
      error.value = 'User not authenticated'
      return
    }

    // Check if Firestore is available
    if (!db) {
      console.warn('Firestore not initialized - using empty data')
      assessmentResults.value = []
      userPosts.value = []
      savedResources.value = []
      loading.value = false
      return
    }

    try {
      // Load assessment results
      // Try with orderBy first, fallback to simple query if index doesn't exist
      try {
        const assessmentsQuery = query(
          collection(db, 'assessmentResults'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('timestamp', 'desc')
        )
        const assessmentsSnapshot = await getDocs(assessmentsQuery)
        assessmentResults.value = assessmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (indexError) {
        // If index doesn't exist, try without orderBy
        console.warn('Index not found, querying without orderBy:', indexError.message)
        const simpleQuery = query(
          collection(db, 'assessmentResults'),
          where('userId', '==', auth.currentUser.uid)
        )
        const assessmentsSnapshot = await getDocs(simpleQuery)
        assessmentResults.value = assessmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Sort manually in JavaScript
        assessmentResults.value.sort((a, b) => {
          const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp)
          const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp)
          return dateB - dateA
        })
      }
    } catch (assessmentError) {
      console.error('Could not load assessments:', assessmentError)
      assessmentResults.value = []
    }

    try {
      // Load user's forum posts
      // Try with orderBy first, fallback to simple query if index doesn't exist
      try {
        const postsQuery = query(
          collection(db, 'posts'),
          where('author', '==', auth.currentUser.username),
          orderBy('timestamp', 'desc')
        )
        const postsSnapshot = await getDocs(postsQuery)
        userPosts.value = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (indexError) {
        // If index doesn't exist, try without orderBy
        console.warn('Index not found, querying without orderBy:', indexError.message)
        const simpleQuery = query(
          collection(db, 'posts'),
          where('author', '==', auth.currentUser.username)
        )
        const postsSnapshot = await getDocs(simpleQuery)
        userPosts.value = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Sort manually in JavaScript
        userPosts.value.sort((a, b) => {
          const dateA = new Date(a.timestamp)
          const dateB = new Date(b.timestamp)
          return dateB - dateA
        })
      }
    } catch (postsError) {
      console.error('Could not load posts:', postsError)
      userPosts.value = []
    }

    // Load saved resources (if implemented)
    savedResources.value = []

  } catch (err) {
    console.error('Error loading dashboard data:', err)

    // If Firestore is not configured, show a helpful message instead of error
    if (err.message.includes('firestore') || err.code === 'failed-precondition') {
      console.warn('Firestore not configured - showing empty dashboard')
      assessmentResults.value = []
      userPosts.value = []
      savedResources.value = []
      error.value = null // Clear error to show dashboard with empty data
    } else {
      error.value = 'Failed to load dashboard data. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

function formatDate(date) {
  if (!date) return 'N/A'
  const d = date?.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getSeverityBadgeClass(severity) {
  const severityLower = severity?.toLowerCase() || ''
  if (severityLower.includes('minimal')) return 'bg-success'
  if (severityLower.includes('mild')) return 'bg-info'
  if (severityLower.includes('moderate')) return 'bg-warning'
  if (severityLower.includes('severe')) return 'bg-danger'
  return 'bg-secondary'
}

function truncate(text, length) {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

function viewAssessmentDetails(result) {
  selectedAssessment.value = result
}

async function deleteAssessment(assessmentId) {
  if (!confirm('Are you sure you want to delete this assessment result?')) return

  try {
    await deleteDoc(doc(db, 'assessmentResults', assessmentId))
    assessmentResults.value = assessmentResults.value.filter(a => a.id !== assessmentId)
    alert('Assessment deleted successfully!')
  } catch (err) {
    console.error('Error deleting assessment:', err)
    alert('Failed to delete assessment. Please try again.')
  }
}

function removeSavedResource(resourceId) {
  // TODO: Implement remove from Firestore
  savedResources.value = savedResources.value.filter(r => r.id !== resourceId)
}
</script>

<style scoped>
.dashboard-view {
  min-height: 100vh;
}

.modal.show {
  display: block !important;
}
</style>
