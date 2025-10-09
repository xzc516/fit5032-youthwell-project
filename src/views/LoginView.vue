<template>
  <section class="container py-4">
    <div class="row justify-content-center">
      <div class="col-12 col-md-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">Login</div>
          <div class="card-body">
            <form @submit.prevent="onSubmit" class="row g-3">
              <div class="col-12">
                <label class="form-label">Email</label>
                <input v-model.trim="email" type="email" class="form-control" required placeholder="your@email.com" autocomplete="email" />
              </div>
              <div class="col-12">
                <label class="form-label">Password</label>
                <input v-model="password" type="password" class="form-control" required autocomplete="current-password" />
              </div>
              <div class="col-12 d-flex justify-content-between align-items-center">
                <button class="btn btn-primary" type="submit" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Logging in...' : 'Login' }}
                </button>
                <button class="btn btn-link" type="button" @click="$router.push('/register')">Create account</button>
              </div>
              <p v-if="error" class="text-danger mb-0">{{ error }}</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuthStore } from '../stores/firebaseAuth'
import { RateLimiter } from '../utils/security'

const auth = useFirebaseAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

// Rate limiter for login attempts (5 attempts per minute)
const loginRateLimiter = new RateLimiter(5, 60000)

async function onSubmit() {
  error.value = ''

  // Basic validation
  if (!email.value || !password.value) {
    error.value = 'Email and password are required'
    return
  }

  // Check rate limiting
  const clientId = navigator.userAgent + window.location.hostname
  if (!loginRateLimiter.isAllowed(clientId)) {
    error.value = 'Too many login attempts. Please try again later.'
    return
  }

  loading.value = true

  try {
    await auth.login({
      email: email.value,
      password: password.value
    })

    // Check for redirect parameter
    const urlParams = new URLSearchParams(window.location.search)
    const redirect = urlParams.get('redirect')

    // Determine redirect based on user role
    let targetRoute = '/forum' // Default for regular users

    if (redirect && redirect !== '/login' && redirect !== '/register') {
      // If there's a redirect parameter, use it
      targetRoute = redirect
    } else {
      // Otherwise, redirect based on role
      if (auth.currentUser?.role === 'admin') {
        targetRoute = '/admin' // Admin users go to admin dashboard
      } else {
        targetRoute = '/forum' // Regular users go to forum
      }
    }

    router.push(targetRoute)
  } catch (e) {
    error.value = e.message || 'Login failed'
    loading.value = false
  }
}
</script>


