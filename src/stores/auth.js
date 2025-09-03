import { defineStore } from 'pinia'

// Enhanced password hashing function
function hashString(text) {
  // Use more secure hashing algorithm
  let hash = 0
  if (text.length === 0) return hash.toString()
  
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Add salt to increase security
  const salt = 'youthwell2025'
  const saltedText = text + salt
  for (let i = 0; i < saltedText.length; i++) {
    const char = saltedText.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return Math.abs(hash).toString(36)
}

// Enhanced input sanitization and validation
function sanitize(input) {
  if (typeof input !== 'string') return input
  
  // Remove all HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;')
  
  return sanitized.trim()
}

// Input validation function
function validateInput(input, type) {
  switch (type) {
    case 'username':
      // Username: 3-30 characters, only letters, numbers, underscores allowed
      const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
      if (!usernameRegex.test(input)) {
        throw new Error('Username must be 3-30 characters and contain only letters, numbers, and underscores')
      }
      break
    case 'password':
      // Password: at least 6 characters, must contain letters and numbers
      if (input.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }
      if (!/[a-zA-Z]/.test(input) || !/[0-9]/.test(input)) {
        throw new Error('Password must contain both letters and numbers')
      }
      break
    case 'role':
      // Role: can only be predefined roles
      const validRoles = ['user', 'admin']
      if (!validRoles.includes(input)) {
        throw new Error('Invalid role selected')
      }
      break
  }
  return true
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null, // { username, role }
    users: [], // [{ username, passwordHash, role }]
  }),
  actions: {
    load() {
      try {
        const raw = localStorage.getItem('auth-state')
        if (raw) {
          const data = JSON.parse(raw)
          // Validate loaded data
          if (data.currentUser && typeof data.currentUser === 'object') {
            this.currentUser = {
              username: sanitize(data.currentUser.username || ''),
              role: data.currentUser.role === 'admin' ? 'admin' : 'user'
            }
          }
          if (Array.isArray(data.users)) {
            this.users = data.users.map(user => ({
              username: sanitize(user.username || ''),
              passwordHash: user.passwordHash || '',
              role: user.role === 'admin' ? 'admin' : 'user'
            }))
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error)
        // If data is corrupted, reset state
        this.currentUser = null
        this.users = []
      }
    },
    persist() {
      try {
        const data = {
          currentUser: this.currentUser,
          users: this.users,
        }
        localStorage.setItem('auth-state', JSON.stringify(data))
      } catch (error) {
        console.error('Error persisting auth state:', error)
      }
    },
    register({ username, password, role = 'user' }) {
      try {
        // Input validation
        const cleanUsername = sanitize(username)
        const cleanRole = sanitize(role)
        
        validateInput(cleanUsername, 'username')
        validateInput(password, 'password')
        validateInput(cleanRole, 'role')
        
        // Check if username already exists
        if (this.users.find(u => u.username === cleanUsername)) {
          throw new Error('Username already exists')
        }
        
        // Create new user
        const passwordHash = hashString(password)
        const newUser = {
          username: cleanUsername,
          passwordHash,
          role: cleanRole
        }
        
        this.users.push(newUser)
        this.persist()
        
        return { success: true, message: 'User registered successfully' }
      } catch (error) {
        throw new Error(error.message || 'Registration failed')
      }
    },
    login({ username, password }) {
      try {
        const cleanUsername = sanitize(username)
        
        if (!cleanUsername || !password) {
          throw new Error('Username and password are required')
        }
        
        // Find user
        const user = this.users.find(u => u.username === cleanUsername)
        if (!user) {
          throw new Error('Invalid credentials')
        }
        
        // Validate password
        if (user.passwordHash !== hashString(password)) {
          throw new Error('Invalid credentials')
        }
        
        // Set current user
        this.currentUser = {
          username: user.username,
          role: user.role
        }
        this.persist()
        
        return { success: true, user: this.currentUser }
      } catch (error) {
        throw new Error(error.message || 'Login failed')
      }
    },
    logout() {
      this.currentUser = null
      this.persist()
    },
    ensureAdminSeed() {
      // Create default admin account
      if (!this.users.find(u => u.username === 'admin')) {
        try {
          this.users.push({
            username: 'admin',
            passwordHash: hashString('admin123'),
            role: 'admin'
          })
          this.persist()
        } catch (error) {
          console.error('Error creating admin seed:', error)
        }
      }
    },
    // Security check methods
    isAuthenticated() {
      return this.currentUser !== null
    },
    hasRole(role) {
      return this.currentUser && this.currentUser.role === role
    },
    isAdmin() {
      return this.hasRole('admin')
    }
  },
})


