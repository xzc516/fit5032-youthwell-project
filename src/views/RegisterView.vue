<template>
  <section class="container py-4">
    <div class="row justify-content-center">
      <div class="col-12 col-md-7">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">Register</div>
          <div class="card-body">
            <form @submit.prevent="onSubmit" class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label">Email</label>
                <input v-model.trim="email" type="email" class="form-control" required placeholder="your@email.com" autocomplete="email" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Username</label>
                <input v-model.trim="username" class="form-control" required minlength="3" maxlength="30" placeholder="Username" autocomplete="username" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Password</label>
                <input v-model="password" @input="updatePasswordStrength" type="password" class="form-control" required minlength="6" autocomplete="new-password" />
                <div v-if="passwordStrength" class="mt-1">
                  <small class="text-muted">Password strength: </small>
                  <span :class="{
                    'text-danger': passwordStrength === 'weak',
                    'text-warning': passwordStrength === 'medium',
                    'text-success': passwordStrength === 'strong'
                  }">{{ passwordStrength.toUpperCase() }}</span>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Confirm Password</label>
                <input v-model="confirm" type="password" class="form-control" required autocomplete="new-password" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Role</label>
                <select v-model="role" class="form-select">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="col-12 d-flex justify-content-between align-items-center">
                <button class="btn btn-primary" type="submit" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Creating Account...' : 'Create Account' }}
                </button>
                <button class="btn btn-link" type="button" @click="$router.push('/login')">Back to login</button>
              </div>
              <p v-if="error" class="text-danger mb-0">{{ error }}</p>
              <p v-if="success" class="text-success mb-0">{{ success }}</p>
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
import { checkPasswordStrength, RateLimiter } from '../utils/security'

const auth = useFirebaseAuthStore()
const router = useRouter()

const email = ref('')
const username = ref('')
const password = ref('')
const confirm = ref('')
const role = ref('user')
const error = ref('')
const success = ref('')
const loading = ref(false)
const passwordStrength = ref('')

// Rate limiter for registration attempts (3 attempts per minute)
const registerRateLimiter = new RateLimiter(3, 60000)

// Watch password for strength indicator
function updatePasswordStrength() {
  if (!password.value) {
    passwordStrength.value = ''
    return
  }

  const strength = checkPasswordStrength(password.value)
  passwordStrength.value = strength
}

async function onSubmit() {
  error.value = ''

  // Basic validation
  if (!email.value || !username.value || !password.value || !confirm.value) {
    error.value = 'All fields are required'
    return
  }

  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match'
    return
  }

  // Check password strength
  const strength = checkPasswordStrength(password.value)
  if (strength === 'weak') {
    error.value = 'Password is too weak. Use at least 8 characters with letters, numbers, and symbols.'
    return
  }

  // Check rate limiting
  const clientId = navigator.userAgent + window.location.hostname
  if (!registerRateLimiter.isAllowed(clientId)) {
    error.value = 'Too many registration attempts. Please try again later.'
    return
  }

  loading.value = true

  try {
    await auth.register({
      email: email.value,
      password: password.value,
      username: username.value,
      role: role.value
    })

    success.value = 'Account created successfully! Redirecting to login...'

    // Clear form
    email.value = ''
    username.value = ''
    password.value = ''
    confirm.value = ''
    role.value = 'user'

    // Delay redirect
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (e) {
    error.value = e.message || 'Registration failed'
    loading.value = false
  }
}
</script>


