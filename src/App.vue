<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" href="#" @click.prevent="$router.push('/home')">
          <i class="bi bi-heart-pulse-fill me-2"></i>
          <strong>YouthWell</strong>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="$router.push('/home')" :class="{ active: $route.path === '/home' }">
                <i class="bi bi-house-fill me-1"></i>Home
              </a>
            </li>
            <li class="nav-item" v-if="!auth.isAuthenticated">
              <a class="nav-link" href="#" @click.prevent="$router.push('/login')" :class="{ active: $route.path === '/login' }">
                <i class="bi bi-box-arrow-in-right me-1"></i>Login
              </a>
            </li>
            <li class="nav-item" v-if="!auth.isAuthenticated">
              <a class="nav-link" href="#" @click.prevent="$router.push('/register')" :class="{ active: $route.path === '/register' }">
                <i class="bi bi-person-plus-fill me-1"></i>Register
              </a>
            </li>
            <li class="nav-item" v-if="auth.isAuthenticated">
              <a class="nav-link" href="#" @click.prevent="$router.push('/assessment')" :class="{ active: $route.path === '/assessment' }">
                <i class="bi bi-clipboard-check me-1"></i>Assessment
              </a>
            </li>
            <li class="nav-item" v-if="auth.isAuthenticated">
              <a class="nav-link" href="#" @click.prevent="$router.push('/forum')" :class="{ active: $route.path === '/forum' }">
                <i class="bi bi-chat-dots-fill me-1"></i>Forum
              </a>
            </li>
            <li class="nav-item" v-if="auth.isAuthenticated">
              <a class="nav-link" href="#" @click.prevent="$router.push('/resources')" :class="{ active: $route.path === '/resources' }">
                <i class="bi bi-book-fill me-1"></i>Resources
              </a>
            </li>
            <li class="nav-item" v-if="auth.isAuthenticated">
              <a class="nav-link" href="#" @click.prevent="$router.push('/dashboard')" :class="{ active: $route.path === '/dashboard' }">
                <i class="bi bi-speedometer2 me-1"></i>Dashboard
              </a>
            </li>
            <li class="nav-item" v-if="auth.isAuthenticated">
              <a class="nav-link" href="#" @click.prevent="$router.push('/map')" :class="{ active: $route.path === '/map' }">
                <i class="bi bi-geo-alt-fill me-1"></i>Map
              </a>
            </li>
            <li class="nav-item" v-if="auth.isAuthenticated">
              <a class="nav-link" href="#" @click.prevent="$router.push('/chatbot')" :class="{ active: $route.path === '/chatbot' }">
                <i class="bi bi-robot me-1"></i>AI Chatbot
              </a>
            </li>
            <li class="nav-item" v-if="auth.isAuthenticated">
              <a class="nav-link" href="#" @click.prevent="$router.push('/appointments')" :class="{ active: $route.path === '/appointments' }">
                <i class="bi bi-calendar-check me-1"></i>Appointments
              </a>
            </li>
            <li class="nav-item" v-if="auth.isAdmin">
              <a class="nav-link" href="#" @click.prevent="$router.push('/admin')" :class="{ active: $route.path === '/admin' }">
                <i class="bi bi-shield-fill me-1"></i>Admin
              </a>
            </li>
            <li class="nav-item" v-if="auth.isAuthenticated">
              <span class="navbar-text ms-2 me-2">
                <i class="bi bi-person-circle me-1"></i>{{ auth.currentUser?.username }}
              </span>
            </li>
            <li class="nav-item" v-if="auth.isAuthenticated">
              <a class="nav-link" href="#" @click.prevent="logout">
                <i class="bi bi-box-arrow-right me-1"></i>Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <main class="container mt-4">
      <router-view />
    </main>

    <!-- Crisis Hotline Floating Button -->
    <div class="crisis-floating-btn" @click="showCrisisModal = true">
      <i class="bi bi-telephone-fill"></i>
      <span class="btn-text">Crisis Help</span>
    </div>

    <!-- Crisis Modal -->
    <div v-if="showCrisisModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.7);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="bi bi-telephone-fill me-2"></i>
              24/7 Crisis Support
            </h5>
            <button @click="showCrisisModal = false" type="button" class="btn-close btn-close-white"></button>
          </div>
          <div class="modal-body">
            <p class="lead">If you're in crisis or need immediate support, please reach out:</p>

            <div class="list-group">
              <a href="tel:131114" class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                  <h6 class="mb-1 text-danger">Lifeline Australia</h6>
                  <strong class="text-danger">13 11 14</strong>
                </div>
                <p class="mb-1 small">24-hour crisis support and suicide prevention</p>
              </a>

              <a href="tel:1800551800" class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                  <h6 class="mb-1 text-primary">Kids Helpline</h6>
                  <strong class="text-primary">1800 55 1800</strong>
                </div>
                <p class="mb-1 small">Free counselling for young people aged 5-25</p>
              </a>

              <a href="tel:1300224636" class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                  <h6 class="mb-1 text-success">Beyond Blue</h6>
                  <strong class="text-success">1300 22 4636</strong>
                </div>
                <p class="mb-1 small">Support for depression and anxiety</p>
              </a>

              <a href="tel:000" class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                  <h6 class="mb-1 text-dark">Emergency Services</h6>
                  <strong class="text-dark">000</strong>
                </div>
                <p class="mb-1 small">For life-threatening emergencies</p>
              </a>
            </div>

            <div class="alert alert-info mt-3 mb-0">
              <small>
                <i class="bi bi-info-circle me-1"></i>
                All calls are confidential. You're not alone - help is available 24/7.
              </small>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showCrisisModal = false" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuthStore } from './stores/firebaseAuth'
import { initOfflineManager, isOnline } from './utils/offlineManager'

const auth = useFirebaseAuthStore()
const router = useRouter()
const showCrisisModal = ref(false)

// Initialize offline manager
onMounted(() => {
  initOfflineManager()
})

async function logout() {
  try {
    await auth.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.navbar {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-link {
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #fff !important;
}

.nav-link.active {
  color: #fff !important;
  font-weight: bold;
}

main {
  min-height: calc(100vh - 80px);
}

/* Crisis Floating Button */
.crisis-floating-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
  animation: pulse 2s infinite;
}

.crisis-floating-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(220, 53, 69, 0.6);
  width: 140px;
  border-radius: 30px;
}

.crisis-floating-btn .btn-text {
  display: none;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 2px;
}

.crisis-floating-btn:hover .btn-text {
  display: block;
}

.crisis-floating-btn:hover i {
  font-size: 1.2rem;
  margin-bottom: 2px;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(220, 53, 69, 0.8);
  }
}

.modal.show {
  display: block !important;
}

@media (max-width: 768px) {
  .crisis-floating-btn {
    width: 56px;
    height: 56px;
    bottom: 20px;
    right: 20px;
  }
}
</style>
