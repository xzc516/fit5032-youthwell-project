<template>
  <section class="container py-4">
    <div class="row justify-content-center">
      <div class="col-12 col-md-7">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">Register</div>
          <div class="card-body">
            <form @submit.prevent="onSubmit" class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label">Username</label>
                <input v-model.trim="username" class="form-control" required minlength="3" maxlength="30" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Role</label>
                <select v-model="role" class="form-select">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Password</label>
                <input v-model="password" @input="updatePasswordStrength" type="password" class="form-control" required minlength="6" />
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
                <input v-model="confirm" type="password" class="form-control" required />
              </div>
              <div class="col-12 d-flex justify-content-between align-items-center">
                <button class="btn btn-primary" type="submit">Create Account</button>
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
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { 
  validateFormData, 
  sanitizeWithAllowlist, 
  detectMaliciousContent,
  checkPasswordStrength,
  RateLimiter 
} from '../utils/security'

const auth = useAuthStore()
const username = ref('')
const password = ref('')
const confirm = ref('')
const role = ref('user')
const error = ref('')
const success = ref('')
const passwordStrength = ref('')

// Rate limiter for registration attempts (3 attempts per minute)
const registerRateLimiter = new RateLimiter(3, 60000)

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
    validator: (value) => {
      if (detectMaliciousContent(value)) return false
      const hasLetter = /[a-zA-Z]/.test(value)
      const hasNumber = /[0-9]/.test(value)
      return hasLetter && hasNumber
    },
    validatorMessage: 'Password must contain both letters and numbers'
  },
  confirm: {
    required: true,
    validator: (value) => value === password.value,
    validatorMessage: 'Passwords do not match'
  },
  role: {
    required: true,
    validator: (value) => ['user', 'admin'].includes(value),
    validatorMessage: 'Invalid role selected'
  }
}

// Watch password for strength indicator
function updatePasswordStrength() {
  if (!password.value) {
    passwordStrength.value = ''
    return
  }
  
  const strength = checkPasswordStrength(password.value)
  passwordStrength.value = strength
}

// Enhanced input validation function
function validateInput() {
  error.value = ''
  
  // Sanitize inputs
  const cleanUsername = sanitizeWithAllowlist(username.value.trim())
  const cleanPassword = password.value
  const cleanConfirm = confirm.value
  const cleanRole = role.value
  
  // Validate using security rules
  const validation = validateFormData({
    username: cleanUsername,
    password: cleanPassword,
    confirm: cleanConfirm,
    role: cleanRole
  }, validationRules)
  
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0]
    error.value = firstError
    return false
  }
  
  // Check password strength
  const strength = checkPasswordStrength(cleanPassword)
  if (strength === 'weak') {
    error.value = 'Password is too weak. Consider using a longer password with mixed case letters, numbers, and symbols.'
    return false
  }
  
  // Check rate limiting
  const clientId = navigator.userAgent + window.location.hostname
  if (!registerRateLimiter.isAllowed(clientId)) {
    error.value = 'Too many registration attempts. Please try again later.'
    return false
  }
  
  // Update form values with sanitized data
  username.value = cleanUsername
  
  return true
}

onMounted(() => auth.load())

function onSubmit() {
  if (!validateInput()) return
  
  try {
    auth.register({ 
      username: username.value, 
      password: password.value, 
      role: role.value 
    })
    
    success.value = 'Account created successfully! Redirecting to login...'
    
    // Clear form
    username.value = ''
    password.value = ''
    confirm.value = ''
    role.value = 'user'
    
    // Delay redirect
    setTimeout(() => { 
      window.location.assign('/login') 
    }, 2000)
  } catch (e) {
    error.value = e.message || 'Registration failed'
  }
}
</script>


