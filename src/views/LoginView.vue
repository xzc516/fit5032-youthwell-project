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

onMounted(() => { auth.load(); auth.ensureAdminSeed() })

function onSubmit() {
  error.value = ''
  try {
    auth.login({ username: username.value, password: password.value })
    if (auth.currentUser?.role === 'admin') {
      window.alert('Logged in as admin')
    }
    history.state?.from ?  
      window.location.assign(history.state.from) : 
      window.location.assign('/forum')
  } catch (e) {
    error.value = e.message || 'Login failed'
  }
}
</script>


