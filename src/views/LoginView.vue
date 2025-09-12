<template>
  <section class="container py-4">
    <div class="row justify-content-center">
      <div class="col-12 col-md-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">Login</div>
          <div class="card-body">
            <form @submit.prevent="onSubmit" class="row g-3">
              <div class="col-12">
                <label class="form-label">Username</label>
                <input v-model.trim="username" class="form-control" required />
              </div>
              <div class="col-12">
                <label class="form-label">Password</label>
                <input v-model="password" type="password" class="form-control" required />
              </div>
              <div class="col-12 d-flex justify-content-between align-items-center">
                <button class="btn btn-primary" type="submit">Login</button>
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
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { 
  validateFormData, 
  sanitizeWithAllowlist, 
  detectMaliciousContent,
  RateLimiter 
} from '../utils/security'

const auth = useAuthStore()
const username = ref('')
const password = ref('')
const error = ref('')

// Rate limiter for login attempts (5 attempts per minute)
const loginRateLimiter = new RateLimiter(5, 60000)

// Enhanced validation rules
const validationRules = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/,
    patternMessage: 'Username can only contain letters, numbers, and underscores',
    validator: (value) => !detectMaliciousContent(value),
    validatorMessage: 'Username contains invalid characters'
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 50,
    validator: (value) => !detectMaliciousContent(value),
    validatorMessage: 'Password contains invalid characters'
  }
}

// Enhanced input validation function
function validateInput() {
  error.value = ''
  
  // Sanitize inputs
  const cleanUsername = sanitizeWithAllowlist(username.value.trim())
  const cleanPassword = password.value
  
  // Validate using security rules
  const validation = validateFormData(
    { username: cleanUsername, password: cleanPassword }, 
    validationRules
  )
  
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0]
    error.value = firstError
    return false
  }
  
  // Check rate limiting
  const clientId = navigator.userAgent + window.location.hostname
  if (!loginRateLimiter.isAllowed(clientId)) {
    error.value = 'Too many login attempts. Please try again later.'
    return false
  }
  
  // Update the form values with sanitized data
  username.value = cleanUsername
  
  return true
}

onMounted(() => { 
  auth.load(); 
  auth.ensureAdminSeed() 
})

function onSubmit() {
  if (!validateInput()) return
  
  try {
    auth.login({ username: username.value, password: password.value })
    
    if (auth.currentUser?.role === 'admin') {
      window.alert('Logged in as admin')
    }
    
    // Check for redirect parameter
    const urlParams = new URLSearchParams(window.location.search)
    const redirect = urlParams.get('redirect')
    
    // Redirect to previous page or forum
    if (redirect && redirect !== '/login' && redirect !== '/register') {
      window.location.assign(redirect)
    } else {
      window.location.assign('/forum')
    }
  } catch (e) {
    error.value = e.message || 'Login failed'
  }
}
</script>


