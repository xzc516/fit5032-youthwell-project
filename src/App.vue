<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" href="#" @click.prevent="$router.push('/forum')">
          <strong>YouthWell</strong>
        </a>
        <div class="navbar-nav ms-auto">
          <a class="nav-link" href="#" @click.prevent="$router.push('/login')" v-if="!auth.currentUser" :class="{ active: $route.path === '/login' }">Login</a>
          <a class="nav-link" href="#" @click.prevent="$router.push('/register')" v-if="!auth.currentUser" :class="{ active: $route.path === '/register' }">Register</a>
          <a class="nav-link" href="#" @click.prevent="$router.push('/forum')" :class="{ active: $route.path === '/forum' }">
            Forum
          </a>
          <a class="nav-link" v-if="auth.isAdmin()" href="#" @click.prevent="$router.push('/map')" :class="{ active: $route.path === '/map' }">
            Map
          </a>
          <span class="navbar-text ms-3" v-if="auth.currentUser">Hello, {{ auth.currentUser.username }} ({{ auth.currentUser.role }})</span>
          <a class="nav-link ms-2" v-if="auth.currentUser" href="#" @click.prevent="logout">Logout</a>
        </div>
      </div>
    </nav>
    <main class="container mt-4">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth'
const auth = useAuthStore()
auth.load()

function logout() {
  auth.logout()
  window.location.assign('/login')
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
</style>
