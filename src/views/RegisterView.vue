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

onMounted(() => auth.load())

function onSubmit() {
  error.value = ''
  success.value = ''
  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match'
    return
  }
  try {
    auth.register({ username: username.value, password: password.value, role: role.value })
    success.value = 'Account created. Redirecting to login...'
    setTimeout(() => { window.location.assign('/login') }, 1000)
  } catch (e) {
    error.value = e.message || 'Register failed'
  }
}
</script>


