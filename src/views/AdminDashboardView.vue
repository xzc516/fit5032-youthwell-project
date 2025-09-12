<template>
  <section class="admin-dashboard">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-4 text-white">
          <i class="fas fa-tachometer-alt me-2"></i>Admin Dashboard
        </h1>
        <p class="text-center text-white-50 mb-5">Administrator control panel for YouthWell platform</p>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-12 col-md-4">
        <div class="card bg-primary text-white shadow">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="card-title">Total Users</h4>
                <h2 class="mb-0">{{ statistics.totalUsers }}</h2>
              </div>
              <div class="align-self-center">
                <i class="fas fa-users fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="card bg-success text-white shadow">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="card-title">Total Posts</h4>
                <h2 class="mb-0">{{ statistics.totalPosts }}</h2>
              </div>
              <div class="align-self-center">
                <i class="fas fa-comments fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="card bg-info text-white shadow">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="card-title">Admin Users</h4>
                <h2 class="mb-0">{{ statistics.adminUsers }}</h2>
              </div>
              <div class="align-self-center">
                <i class="fas fa-user-shield fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Management Panel -->
    <div class="card shadow-lg mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0"><i class="fas fa-users-cog me-2"></i>User Management</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-dark">
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.username">
                <td>
                  <i class="fas fa-user me-2"></i>{{ user.username }}
                </td>
                <td>
                  <span class="badge" :class="user.role === 'admin' ? 'bg-danger' : 'bg-primary'">
                    {{ user.role.toUpperCase() }}
                  </span>
                </td>
                <td>{{ formatDate(user.registrationDate) }}</td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-warning me-2"
                    @click="changeUserRole(user)"
                    v-if="user.username !== 'admin'"
                  >
                    <i class="fas fa-exchange-alt"></i> Change Role
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteUser(user)"
                    v-if="user.username !== 'admin' && user.username !== auth.currentUser?.username"
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

    <!-- System Information Panel -->
    <div class="card shadow-lg mb-4">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0"><i class="fas fa-server me-2"></i>System Information</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <h6 class="fw-bold">Application Version</h6>
            <p class="text-muted">YouthWell v1.0.0</p>
            
            <h6 class="fw-bold">Database Status</h6>
            <p class="text-success">
              <i class="fas fa-check-circle"></i> LocalStorage Active
            </p>
          </div>
          <div class="col-md-6">
            <h6 class="fw-bold">Security Features</h6>
            <ul class="text-muted">
              <li>Input Sanitization: Active</li>
              <li>XSS Protection: Enabled</li>
              <li>Role-based Access: Enabled</li>
              <li>Password Hashing: Active</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Panel -->
    <div class="card shadow-lg">
      <div class="card-header bg-warning text-dark">
        <h5 class="mb-0"><i class="fas fa-history me-2"></i>Recent Activity</h5>
      </div>
      <div class="card-body">
        <div class="list-group list-group-flush">
          <div v-for="activity in recentActivities" :key="activity.id" class="list-group-item">
            <div class="d-flex w-100 justify-content-between">
              <h6 class="mb-1">{{ activity.action }}</h6>
              <small class="text-muted">{{ formatTime(activity.timestamp) }}</small>
            </div>
            <p class="mb-1">{{ activity.description }}</p>
            <small class="text-muted">User: {{ activity.user }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" class="alert alert-success mt-3" role="alert">
      <i class="fas fa-check-circle me-2"></i>{{ message }}
    </div>
    <div v-if="error" class="alert alert-danger mt-3" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const message = ref('')
const error = ref('')

// Statistics
const statistics = computed(() => ({
  totalUsers: auth.users.length,
  totalPosts: getTotalPosts(),
  adminUsers: auth.users.filter(u => u.role === 'admin').length
}))

// Users list
const users = computed(() => 
  auth.users.map(user => ({
    ...user,
    registrationDate: user.registrationDate || new Date().toISOString()
  }))
)

// Recent activities (mock data)
const recentActivities = ref([
  {
    id: 1,
    action: 'User Registration',
    description: 'New user registered successfully',
    user: 'system',
    timestamp: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 2,
    action: 'Forum Post Created',
    description: 'New mental health discussion post',
    user: auth.currentUser?.username || 'admin',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 3,
    action: 'Admin Login',
    description: 'Administrator accessed dashboard',
    user: auth.currentUser?.username || 'admin',
    timestamp: new Date().toISOString()
  }
])

// Helper functions
function getTotalPosts() {
  try {
    const forumData = localStorage.getItem('forum-posts')
    return forumData ? JSON.parse(forumData).length : 0
  } catch {
    return 0
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleString()
}

function changeUserRole(user) {
  try {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    const userIndex = auth.users.findIndex(u => u.username === user.username)
    
    if (userIndex !== -1) {
      auth.users[userIndex].role = newRole
      auth.persist()
      
      message.value = `User ${user.username} role changed to ${newRole}`
      setTimeout(() => { message.value = '' }, 3000)
      
      // Add to recent activities
      recentActivities.value.unshift({
        id: Date.now(),
        action: 'Role Change',
        description: `User ${user.username} role changed to ${newRole}`,
        user: auth.currentUser?.username || 'admin',
        timestamp: new Date().toISOString()
      })
    }
  } catch (e) {
    error.value = 'Failed to change user role'
    setTimeout(() => { error.value = '' }, 3000)
  }
}

function deleteUser(user) {
  if (!confirm(`Are you sure you want to delete user ${user.username}?`)) {
    return
  }
  
  try {
    const userIndex = auth.users.findIndex(u => u.username === user.username)
    
    if (userIndex !== -1) {
      auth.users.splice(userIndex, 1)
      auth.persist()
      
      message.value = `User ${user.username} deleted successfully`
      setTimeout(() => { message.value = '' }, 3000)
      
      // Add to recent activities
      recentActivities.value.unshift({
        id: Date.now(),
        action: 'User Deleted',
        description: `User ${user.username} was deleted`,
        user: auth.currentUser?.username || 'admin',
        timestamp: new Date().toISOString()
      })
    }
  } catch (e) {
    error.value = 'Failed to delete user'
    setTimeout(() => { error.value = '' }, 3000)
  }
}

onMounted(() => {
  auth.load()
  
  // Add current login to activities
  recentActivities.value.unshift({
    id: Date.now(),
    action: 'Dashboard Access',
    description: 'Administrator accessed the dashboard',
    user: auth.currentUser?.username || 'admin',
    timestamp: new Date().toISOString()
  })
})
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem 0;
}

.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.table th {
  border-top: none;
}

.badge {
  font-size: 0.75rem;
}

.list-group-item {
  border-left: none;
  border-right: none;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:last-child {
  border-bottom: none;
}

.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1050;
  min-width: 300px;
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem 0;
  }
  
  .alert {
    position: relative;
    top: auto;
    right: auto;
    min-width: auto;
  }
}
</style>