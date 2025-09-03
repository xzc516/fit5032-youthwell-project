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

const auth = useAuthStore()
const username = ref('')
const password = ref('')
const error = ref('')

// Input validation function
function validateInput() {
  error.value = ''
  
  if (!username.value.trim()) {
    error.value = 'Username is required'
    return false
  }
  
  if (!password.value) {
    error.value = 'Password is required'
    return false
  }
  
  // Check username length
  if (username.value.trim().length < 3) {
    error.value = 'Username must be at least 3 characters long'
    return false
  }
  
  // Check password length
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return false
  }
  
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


