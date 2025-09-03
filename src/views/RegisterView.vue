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
                <input v-model="password" type="password" class="form-control" required minlength="6" />
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

const auth = useAuthStore()
const username = ref('')
const password = ref('')
const confirm = ref('')
const role = ref('user')
const error = ref('')
const success = ref('')

// Enhanced input validation function
function validateInput() {
  error.value = ''
  
  // Validate username
  if (!username.value.trim()) {
    error.value = 'Username is required'
    return false
  }
  
  if (username.value.trim().length < 3) {
    error.value = 'Username must be at least 3 characters long'
    return false
  }
  
  if (username.value.trim().length > 30) {
    error.value = 'Username must be no more than 30 characters long'
    return false
  }
  
  // Check username format (only letters, numbers, underscores allowed)
  if (!/^[a-zA-Z0-9_]+$/.test(username.value.trim())) {
    error.value = 'Username can only contain letters, numbers, and underscores'
    return false
  }
  
  // Validate password
  if (!password.value) {
    error.value = 'Password is required'
    return false
  }
  
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return false
  }
  
  if (password.value.length > 50) {
    error.value = 'Password must be no more than 50 characters long'
    return false
  }
  
  // Check password complexity
  if (!/[a-zA-Z]/.test(password.value)) {
    error.value = 'Password must contain at least one letter'
    return false
  }
  
  if (!/[0-9]/.test(password.value)) {
    error.value = 'Password must contain at least one number'
    return false
  }
  
  // Validate confirm password
  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match'
    return false
  }
  
  // Validate role
  if (!['user', 'admin'].includes(role.value)) {
    error.value = 'Invalid role selected'
    return false
  }
  
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


