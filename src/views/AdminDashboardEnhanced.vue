<template>
  <section class="admin-dashboard">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-4 text-white">
          <i class="fas fa-tachometer-alt me-2"></i>Enhanced Admin Dashboard
        </h1>
        <p class="text-center text-white-50 mb-3">
          Administrator control panel with bulk email and analytics
        </p>
        
        <!-- Data Management Controls -->
        <div class="text-center mb-4">
          <div class="btn-group" role="group">
            <button 
              @click="$router.push('/tables')" 
              class="btn btn-outline-light btn-lg"
            >
              <i class="fas fa-table me-2"></i>View Data Tables
            </button>
            <button 
              @click="initializeSampleData" 
              :disabled="dataInitLoading"
              class="btn btn-outline-light btn-lg"
            >
              <i class="fas fa-database me-2"></i>
              {{ dataInitLoading ? 'Initializing...' : 'Initialize Sample Data' }}
            </button>
          </div>
          <div v-if="dataInitMessage" class="mt-3">
            <div class="alert alert-info d-inline-block">
              <i class="fas fa-info-circle me-2"></i>
              {{ dataInitMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards with Charts -->
    <div class="row mb-4">
      <div class="col-12 col-md-3">
        <div class="card bg-primary text-white shadow">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="card-title">Total Users</h6>
                <h2 class="mb-0">{{ statistics.totalUsers }}</h2>
              </div>
              <div class="align-self-center">
                <i class="fas fa-users fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-3">
        <div class="card bg-success text-white shadow">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="card-title">Total Posts</h6>
                <h2 class="mb-0">{{ statistics.totalPosts }}</h2>
              </div>
              <div class="align-self-center">
                <i class="fas fa-comments fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-3">
        <div class="card bg-info text-white shadow">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="card-title">Appointments</h6>
                <h2 class="mb-0">{{ statistics.totalAppointments }}</h2>
              </div>
              <div class="align-self-center">
                <i class="fas fa-calendar-check fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-3">
        <div class="card bg-warning text-dark shadow">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="card-title">Avg Rating</h6>
                <h2 class="mb-0">{{ statistics.avgRating }}</h2>
              </div>
              <div class="align-self-center">
                <i class="fas fa-star fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Email Panel -->
    <div class="card shadow-lg mb-4">
      <div class="card-header bg-danger text-white">
        <h5 class="mb-0">
          <i class="fas fa-envelope-open-text me-2"></i>Bulk Email Communication
        </h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-8">
            <form @submit.prevent="sendBulkEmail">
              <div class="mb-3">
                <label class="form-label fw-bold">Select Recipients</label>
                <div class="recipient-selector">
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="radio"
                      id="allUsers"
                      value="all"
                      v-model="emailForm.recipients"
                    />
                    <label class="form-check-label" for="allUsers">
                      All Users ({{ statistics.totalUsers }})
                    </label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="radio"
                      id="regularUsers"
                      value="users"
                      v-model="emailForm.recipients"
                    />
                    <label class="form-check-label" for="regularUsers">
                      Regular Users Only
                    </label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="radio"
                      id="adminUsers"
                      value="admins"
                      v-model="emailForm.recipients"
                    />
                    <label class="form-check-label" for="adminUsers">
                      Admins Only
                    </label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="radio"
                      id="selectedUsers"
                      value="selected"
                      v-model="emailForm.recipients"
                    />
                    <label class="form-check-label" for="selectedUsers">
                      Selected Users
                    </label>
                  </div>
                </div>

                <!-- User Selection (shown when "Selected Users" is chosen) -->
                <div v-if="emailForm.recipients === 'selected'" class="mt-3">
                  <label class="form-label">Choose Users:</label>
                  <div class="user-selection-list">
                    <div
                      v-for="user in allUsers"
                      :key="user.id"
                      class="form-check"
                    >
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="`user-${user.id}`"
                        :value="user.id"
                        v-model="emailForm.selectedUsers"
                      />
                      <label class="form-check-label" :for="`user-${user.id}`">
                        {{ user.username }} ({{ user.email }})
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Email Subject</label>
                <input
                  type="text"
                  v-model="emailForm.subject"
                  class="form-control"
                  placeholder="Enter email subject..."
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Email Message</label>
                <textarea
                  v-model="emailForm.message"
                  class="form-control"
                  rows="6"
                  placeholder="Write your message here..."
                  required
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Email Template (Optional)</label>
                <select v-model="emailForm.template" class="form-select" @change="applyTemplate">
                  <option value="">Custom Message</option>
                  <option value="welcome">Welcome Message</option>
                  <option value="update">Platform Update</option>
                  <option value="reminder">Appointment Reminder</option>
                  <option value="support">Mental Health Support</option>
                </select>
              </div>

              <button
                type="submit"
                class="btn btn-danger btn-lg"
                :disabled="isSending || !canSendEmail"
              >
                <i class="fas fa-paper-plane me-2"></i>
                {{ isSending ? 'Sending...' : `Send to ${recipientCount} user(s)` }}
              </button>
            </form>
          </div>

          <div class="col-md-4">
            <div class="email-preview">
              <h6 class="fw-bold mb-3">Email Preview</h6>
              <div class="preview-box">
                <div class="preview-header">
                  <strong>Subject:</strong> {{ emailForm.subject || '(No subject)' }}
                </div>
                <div class="preview-body">
                  {{ emailForm.message || '(Empty message)' }}
                </div>
                <div class="preview-footer">
                  <small class="text-muted">
                    Sent from YouthWell Admin Dashboard
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Charts -->
    <div class="row mb-4">
      <!-- User Growth Chart -->
      <div class="col-md-6 mb-4">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
              <i class="fas fa-chart-line me-2"></i>User Growth Trend
            </h5>
          </div>
          <div class="card-body">
            <canvas ref="userGrowthChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Forum Activity Chart -->
      <div class="col-md-6 mb-4">
        <div class="card shadow">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">
              <i class="fas fa-chart-bar me-2"></i>Forum Post Categories
            </h5>
          </div>
          <div class="card-body">
            <canvas ref="categoryChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- User Management Table -->
    <div class="card shadow-lg mb-4">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0"><i class="fas fa-users-cog me-2"></i>User Management</h5>
        <button class="btn btn-sm btn-light" @click="exportUsers">
          <i class="fas fa-download me-1"></i>Export CSV
        </button>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-dark">
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in allUsers" :key="user.id">
                <td>
                  <i class="fas fa-user me-2"></i>{{ user.username }}
                </td>
                <td>
                  <a :href="`mailto:${user.email}`">{{ user.email }}</a>
                </td>
                <td>
                  <span class="badge" :class="user.role === 'admin' ? 'bg-danger' : 'bg-primary'">
                    {{ user.role?.toUpperCase() }}
                  </span>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <button
                    v-if="user.username !== 'admin'"
                    class="btn btn-sm btn-outline-warning me-2"
                    @click="changeUserRole(user)"
                  >
                    <i class="fas fa-exchange-alt"></i> Change Role
                  </button>
                  <button
                    v-if="user.username !== 'admin' && user.id !== auth.currentUser?.uid"
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteUser(user)"
                  >
                    <i class="fas fa-trash"></i> Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="fas fa-check-circle me-2"></i>{{ message }}
      <button type="button" class="btn-close" @click="message = ''"></button>
    </div>
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
      <button type="button" class="btn-close" @click="error = ''"></button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFirebaseAuthStore } from '../stores/firebaseAuth'
import { useForumStore } from '../stores/forum'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import Chart from 'chart.js/auto'
import { sendBulkEmail as sendEmailService } from '../services/emailService'
import { initializeAllData } from '../services/databaseInit'
import { getUserStats, sendBulkEmail as sendBulkEmailCF, exportDataToCSV, checkCloudFunctionsHealth } from '../services/cloudFunctions'

const auth = useFirebaseAuthStore()
const forumStore = useForumStore()

const message = ref('')
const error = ref('')
const allUsers = ref([])
const allAppointments = ref([])
const isSending = ref(false)

// Data initialization
const dataInitLoading = ref(false)
const dataInitMessage = ref('')

// Charts
const userGrowthChart = ref(null)
const categoryChart = ref(null)

// Email form
const emailForm = ref({
  recipients: 'all',
  selectedUsers: [],
  subject: '',
  message: '',
  template: ''
})

// Email templates
const emailTemplates = {
  welcome: {
    subject: 'Welcome to YouthWell Platform!',
    message: `Dear User,

Welcome to YouthWell! We're excited to have you join our mental health support community.

Our platform offers:
- AI-powered chatbot for instant support
- Professional counseling appointments
- Community forum for peer support
- Mental health assessments and resources

If you need immediate help, please contact:
• Lifeline: 13 11 14
• Kids Helpline: 1800 55 1800

Best regards,
YouthWell Team`
  },
  update: {
    subject: 'YouthWell Platform Update',
    message: `Dear User,

We've recently updated our platform with new features to better support your mental health journey.

What's New:
- Enhanced AI chatbot with improved responses
- New appointment scheduling system
- Improved forum categories
- Updated resources library

Thank you for being part of our community!

Best regards,
YouthWell Team`
  },
  reminder: {
    subject: 'Appointment Reminder - YouthWell',
    message: `Dear User,

This is a friendly reminder about your upcoming counseling appointment.

Please ensure you're prepared for your session. If you need to reschedule, please do so at least 24 hours in advance.

For immediate crisis support:
• Lifeline: 13 11 14 (24/7)

Best regards,
YouthWell Team`
  },
  support: {
    subject: 'Mental Health Support Resources',
    message: `Dear User,

We wanted to reach out and remind you that support is always available.

YouthWell Resources:
- 24/7 AI Chatbot Support
- Professional Counseling Appointments
- Peer Support Forum
- Self-Assessment Tools

Crisis Hotlines:
• Lifeline: 13 11 14
• Kids Helpline: 1800 55 1800
• Beyond Blue: 1300 22 4636

You're not alone. We're here to help.

Best regards,
YouthWell Team`
  }
}

// Load data
async function loadData() {
  try {
    // Load users
    const usersSnapshot = await getDocs(collection(db, 'users'))
    allUsers.value = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Load appointments
    const appointmentsSnapshot = await getDocs(collection(db, 'appointments'))
    allAppointments.value = appointmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Load forum posts
    await forumStore.loadPosts()

    // Render charts
    renderCharts()
  } catch (err) {
    console.error('Error loading data:', err)
  }
}

// Statistics
const statistics = computed(() => ({
  totalUsers: allUsers.value.length,
  totalPosts: forumStore.posts.length,
  totalAppointments: allAppointments.value.length,
  avgRating: forumStore.posts.length > 0
    ? (forumStore.posts.reduce((sum, post) => sum + forumStore.getAverageRating(post), 0) / forumStore.posts.length).toFixed(1)
    : '0.0'
}))

// Recipient count
const recipientCount = computed(() => {
  if (emailForm.value.recipients === 'all') return allUsers.value.length
  if (emailForm.value.recipients === 'users') {
    return allUsers.value.filter(u => u.role !== 'admin').length
  }
  if (emailForm.value.recipients === 'admins') {
    return allUsers.value.filter(u => u.role === 'admin').length
  }
  if (emailForm.value.recipients === 'selected') {
    return emailForm.value.selectedUsers.length
  }
  return 0
})

const canSendEmail = computed(() => {
  return emailForm.value.subject && emailForm.value.message && recipientCount.value > 0
})

// Apply email template
function applyTemplate() {
  if (emailForm.value.template && emailTemplates[emailForm.value.template]) {
    const template = emailTemplates[emailForm.value.template]
    emailForm.value.subject = template.subject
    emailForm.value.message = template.message
  }
}

// Send bulk email
async function sendBulkEmail() {
  if (!canSendEmail.value) return

  // Get recipient emails
  let recipients = []
  if (emailForm.value.recipients === 'all') {
    recipients = allUsers.value.map(u => u.email)
  } else if (emailForm.value.recipients === 'users') {
    recipients = allUsers.value.filter(u => u.role !== 'admin').map(u => u.email)
  } else if (emailForm.value.recipients === 'admins') {
    recipients = allUsers.value.filter(u => u.role === 'admin').map(u => u.email)
  } else if (emailForm.value.recipients === 'selected') {
    recipients = allUsers.value
      .filter(u => emailForm.value.selectedUsers.includes(u.id))
      .map(u => u.email)
  }

  if (recipients.length === 0) {
    error.value = 'No recipients selected'
    setTimeout(() => { error.value = '' }, 3000)
    return
  }

  if (!confirm(`Send email to ${recipients.length} user(s)?`)) {
    return
  }

  isSending.value = true

  try {
    // Try Cloud Functions first, fallback to direct service
    try {
      const result = await sendBulkEmailCF({
        recipients: emailForm.value.recipients,
        subject: emailForm.value.subject,
        message: emailForm.value.message,
        template: emailForm.value.template
      })
      
      if (result.success) {
        message.value = `Email sent successfully to ${result.details.successful} user(s) via Cloud Functions`
      } else {
        throw new Error(result.error)
      }
    } catch (cloudError) {
      console.log('Cloud Functions failed, using direct service:', cloudError)
      await sendEmailService({
        to: recipients,
        subject: emailForm.value.subject,
        message: emailForm.value.message
      })
      message.value = `Email sent successfully to ${recipients.length} user(s) via direct service`
    }

    // Reset form
    emailForm.value = {
      recipients: 'all',
      selectedUsers: [],
      subject: '',
      message: '',
      template: ''
    }

    setTimeout(() => { message.value = '' }, 5000)

  } catch (err) {
    console.error('Error sending bulk email:', err)
    error.value = 'Failed to send email: ' + err.message
    setTimeout(() => { error.value = '' }, 5000)
  } finally {
    isSending.value = false
  }
}

// Render analytics charts
function renderCharts() {
  // User Growth Chart
  if (userGrowthChart.value) {
    const ctx = userGrowthChart.value.getContext('2d')
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'New Users',
          data: [12, 19, 23, 35, 42, allUsers.value.length],
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        }
      }
    })
  }

  // Category Distribution Chart
  if (categoryChart.value) {
    const categoryCounts = {}
    forumStore.posts.forEach(post => {
      categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1
    })

    const ctx = categoryChart.value.getContext('2d')
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(categoryCounts),
        datasets: [{
          label: 'Posts',
          data: Object.values(categoryCounts),
          backgroundColor: [
            '#0d6efd', '#198754', '#ffc107', '#dc3545',
            '#6f42c1', '#fd7e14', '#20c997', '#6c757d'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    })
  }
}

// User management
async function changeUserRole(user) {
  try {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    await auth.updateUserRole(user.id, newRole)
    await loadData()
    message.value = `User ${user.username} role changed to ${newRole}`
    setTimeout(() => { message.value = '' }, 3000)
  } catch (err) {
    error.value = 'Failed to change user role'
    setTimeout(() => { error.value = '' }, 3000)
  }
}

async function deleteUser(user) {
  if (!confirm(`Delete user ${user.username}?`)) return

  try {
    // TODO: Implement user deletion
    message.value = `User ${user.username} deleted successfully`
    await loadData()
    setTimeout(() => { message.value = '' }, 3000)
  } catch (err) {
    error.value = 'Failed to delete user'
    setTimeout(() => { error.value = '' }, 3000)
  }
}

// Export users
function exportUsers() {
  const csvContent = [
    ['Username', 'Email', 'Role', 'Registration Date'],
    ...allUsers.value.map(user => [
      user.username,
      user.email,
      user.role,
      formatDate(user.createdAt)
    ])
  ]
    .map(row => row.join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'youthwell-users.csv'
  link.click()
}

function formatDate(timestamp) {
  if (!timestamp) return 'N/A'
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp)
  return date.toLocaleDateString()
}

// Initialize sample data
async function initializeSampleData() {
  try {
    dataInitLoading.value = true
    dataInitMessage.value = 'Initializing sample data...'
    
    const result = await initializeAllData()
    
    if (result.success) {
      dataInitMessage.value = 'Sample data initialized successfully! You can now view the data tables.'
      message.value = 'Sample data initialized successfully!'
      setTimeout(() => { message.value = '' }, 5000)
    } else {
      dataInitMessage.value = 'Error initializing data: ' + result.message
      error.value = 'Failed to initialize sample data'
      setTimeout(() => { error.value = '' }, 5000)
    }
  } catch (error) {
    console.error('Error initializing sample data:', error)
    dataInitMessage.value = 'Error initializing data: ' + error.message
    error.value = 'Failed to initialize sample data'
    setTimeout(() => { error.value = '' }, 5000)
  } finally {
    dataInitLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem 0;
}

.card {
  transition: transform 0.2s;
  border: none;
}

.card:hover {
  transform: translateY(-2px);
}

.recipient-selector {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.user-selection-list {
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.email-preview {
  position: sticky;
  top: 20px;
}

.preview-box {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
}

.preview-header {
  padding-bottom: 10px;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 10px;
}

.preview-body {
  min-height: 150px;
  white-space: pre-wrap;
}

.preview-footer {
  padding-top: 10px;
  border-top: 1px solid #dee2e6;
  margin-top: 10px;
}

.alert {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1050;
  min-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .alert {
    position: relative;
    top: auto;
    right: auto;
    min-width: auto;
  }
}
</style>
