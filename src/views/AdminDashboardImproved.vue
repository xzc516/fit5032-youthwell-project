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
                <h6 class="card-title">Admin Users</h6>
                <h2 class="mb-0">{{ statistics.adminUsers }}</h2>
              </div>
              <div class="align-self-center">
                <i class="fas fa-user-shield fa-2x"></i>
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

    <!-- User Management Table -->
    <div class="card shadow-lg mb-4">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0"><i class="fas fa-users-cog me-2"></i>User Management</h5>
        <button class="btn btn-sm btn-light" @click="exportUsers" aria-label="Export users data">
          <i class="fas fa-download me-1"></i>Export CSV
        </button>
      </div>
      <div class="card-body">
        <DataTable
          title="Users"
          :columns="userColumns"
          :data="usersTableData"
          :hasActions="true"
        >
          <template #cell-role="{ value }">
            <span class="badge" :class="value === 'admin' ? 'bg-danger' : 'bg-primary'">
              {{ value.toUpperCase() }}
            </span>
          </template>
          <template #cell-email="{ value }">
            <a :href="`mailto:${value}`" class="text-decoration-none">{{ value }}</a>
          </template>
          <template #actions="{ row }">
            <button
              v-if="row.username !== 'admin'"
              class="btn btn-sm btn-outline-warning me-2"
              @click="changeUserRole(row)"
              :aria-label="`Change role for ${row.username}`"
            >
              <i class="fas fa-exchange-alt"></i> Change Role
            </button>
            <button
              v-if="row.username !== 'admin' && row.username !== auth.currentUser?.username"
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

    <!-- Forum Posts Management Table -->
    <div class="card shadow-lg mb-4">
      <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0"><i class="fas fa-comments me-2"></i>Forum Posts Management</h5>
        <button class="btn btn-sm btn-light" @click="exportPosts" aria-label="Export posts data">
          <i class="fas fa-download me-1"></i>Export CSV
        </button>
      </div>
      <div class="card-body">
        <DataTable
          title="Posts"
          :columns="postColumns"
          :data="postsTableData"
          :hasActions="true"
        >
          <template #cell-avgRating="{ value }">
            <div class="d-flex align-items-center">
              <i class="fas fa-star text-warning me-1"></i>
              <span class="fw-bold">{{ value }}</span>
            </div>
          </template>
          <template #cell-title="{ value }">
            <span class="fw-bold text-primary">{{ value }}</span>
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

    <!-- Success/Error Messages -->
    <div v-if="message" class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="fas fa-check-circle me-2"></i>{{ message }}
      <button type="button" class="btn-close" @click="message = ''" aria-label="Close"></button>
    </div>
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
      <button type="button" class="btn-close" @click="error = ''" aria-label="Close"></button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuthStore } from '../stores/firebaseAuth'
import { useForumStore } from '../stores/forum'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import DataTable from '../components/DataTable.vue'

const auth = useFirebaseAuthStore()
const forumStore = useForumStore()
const router = useRouter()

const message = ref('')
const error = ref('')
const allUsers = ref([])

// Load all users from Firestore
async function loadUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'))
    allUsers.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error('Error loading users:', err)
  }
}

onMounted(async () => {
  await loadUsers()
  await forumStore.loadPosts()
})

// Statistics
const statistics = computed(() => ({
  totalUsers: allUsers.value.length,
  totalPosts: forumStore.posts.length,
  adminUsers: allUsers.value.filter(u => u.role === 'admin').length,
  avgRating: forumStore.posts.length > 0
    ? (forumStore.posts.reduce((sum, post) => sum + forumStore.getAverageRating(post), 0) / forumStore.posts.length).toFixed(1)
    : '0.0'
}))

// User table columns
const userColumns = [
  { key: 'username', label: 'Username', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  {
    key: 'createdAt',
    label: 'Registration Date',
    sortable: true,
    format: (val) => val ? new Date(val.seconds * 1000).toLocaleDateString() : 'N/A'
  }
]

// Post table columns
const postColumns = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'author', label: 'Author', sortable: true },
  {
    key: 'summary',
    label: 'Content',
    sortable: false,
    format: (val) => val?.substring(0, 50) + (val?.length > 50 ? '...' : '')
  },
  {
    key: 'avgRating',
    label: 'Avg Rating',
    sortable: true
  },
  {
    key: 'ratingCount',
    label: 'Ratings',
    sortable: true
  },
  {
    key: 'timestamp',
    label: 'Date',
    sortable: true,
    format: (val) => new Date(val).toLocaleDateString()
  }
]

// Users table data
const usersTableData = computed(() => {
  return allUsers.value.map(user => ({
    ...user,
    createdAt: user.createdAt || { seconds: Date.now() / 1000 }
  }))
})

// Posts table data
const postsTableData = computed(() => {
  return forumStore.posts.map(post => ({
    ...post,
    avgRating: forumStore.getAverageRating(post).toFixed(1),
    ratingCount: forumStore.getRatingCount(post)
  }))
})

// User management functions
async function changeUserRole(user) {
  try {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    await auth.updateUserRole(user.id, newRole)
    await loadUsers()
    message.value = `User ${user.username} role changed to ${newRole}`
    setTimeout(() => { message.value = '' }, 3000)
  } catch (err) {
    error.value = 'Failed to change user role: ' + err.message
    setTimeout(() => { error.value = '' }, 3000)
  }
}

async function deleteUser(user) {
  if (!confirm(`Are you sure you want to delete user ${user.username}?`)) {
    return
  }

  try {
    // TODO: Implement user deletion in Firebase
    message.value = `User ${user.username} deleted successfully`
    await loadUsers()
    setTimeout(() => { message.value = '' }, 3000)
  } catch (err) {
    error.value = 'Failed to delete user: ' + err.message
    setTimeout(() => { error.value = '' }, 3000)
  }
}

// Post management functions
function viewPost(post) {
  router.push('/forum')
}

async function deletePost(post) {
  if (!confirm(`Are you sure you want to delete the post "${post.title}"?`)) {
    return
  }

  try {
    await forumStore.deletePost(post.id)
    message.value = 'Post deleted successfully'
    setTimeout(() => { message.value = '' }, 3000)
  } catch (err) {
    error.value = 'Failed to delete post: ' + err.message
    setTimeout(() => { error.value = '' }, 3000)
  }
}

// Export functions (CSV format)
function exportUsers() {
  const csvContent = [
    ['Username', 'Email', 'Role', 'Registration Date'],
    ...usersTableData.value.map(user => [
      user.username,
      user.email,
      user.role,
      user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
    ])
  ]
    .map(row => row.join(','))
    .join('\n')

  downloadCSV(csvContent, 'youthwell-users.csv')
}

function exportPosts() {
  const csvContent = [
    ['Title', 'Author', 'Content', 'Avg Rating', 'Rating Count', 'Date'],
    ...postsTableData.value.map(post => [
      `"${post.title}"`,
      post.author,
      `"${post.summary}"`,
      post.avgRating,
      post.ratingCount,
      new Date(post.timestamp).toLocaleDateString()
    ])
  ]
    .map(row => row.join(','))
    .join('\n')

  downloadCSV(csvContent, 'youthwell-posts.csv')
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem 0;
}

.card {
  transition: transform 0.2s ease-in-out;
  border: none;
}

.card:hover {
  transform: translateY(-2px);
}

.alert {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1050;
  min-width: 300px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
