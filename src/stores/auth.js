import { defineStore } from 'pinia'

function hashString(text) {
  // Simple hash for demo (NOT for production). Prefer Web Crypto in real apps.
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i)
    hash |= 0
  }
  return String(hash)
}

function sanitize(input) {
  if (typeof input !== 'string') return input
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null, // { username, role }
    users: [], // [{ username, passwordHash, role }]
  }),
  actions: {
    load() {
      const raw = localStorage.getItem('auth-state')
      if (raw) {
        const data = JSON.parse(raw)
        this.currentUser = data.currentUser
        this.users = data.users || []
      }
    },
    persist() {
      localStorage.setItem('auth-state', JSON.stringify({
        currentUser: this.currentUser,
        users: this.users,
      }))
    },
    register({ username, password, role = 'user' }) {
      username = sanitize(username.trim())
      if (!username || !password) throw new Error('Username and password are required')
      if (this.users.find(u => u.username === username)) throw new Error('Username already exists')
      const passwordHash = hashString(password)
      this.users.push({ username, passwordHash, role })
      this.persist()
    },
    login({ username, password }) {
      username = sanitize(username.trim())
      const user = this.users.find(u => u.username === username)
      if (!user) throw new Error('Invalid credentials')
      if (user.passwordHash !== hashString(password)) throw new Error('Invalid credentials')
      this.currentUser = { username: user.username, role: user.role }
      this.persist()
    },
    logout() {
      this.currentUser = null
      this.persist()
    },
    ensureAdminSeed() {
      // seed an admin user if none exists
      if (!this.users.find(u => u.username === 'admin')) {
        this.users.push({ username: 'admin', passwordHash: hashString('admin123'), role: 'admin' })
        this.persist()
      }
    },
  },
})


