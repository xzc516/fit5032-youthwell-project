import { defineStore } from 'pinia'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { sanitizeContent, validateUsername, validatePassword, validateRole } from '../utils/security'

export const useFirebaseAuthStore = defineStore('firebaseAuth', {
  state: () => ({
    currentUser: null, // { uid, email, username, role, displayName }
    loading: false,
    error: null,
    isInitialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.currentUser,
    isAdmin: (state) => state.currentUser?.role === 'admin',
    userRole: (state) => state.currentUser?.role || 'user'
  },

  actions: {
    // Initialize auth state listener
    initAuth() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            // User is signed in, fetch additional user data from Firestore
            try {
              const userDoc = await getDoc(doc(db, 'users', user.uid))
              if (userDoc.exists()) {
                const userData = userDoc.data()
                this.currentUser = {
                  uid: user.uid,
                  email: user.email,
                  username: userData.username || user.displayName || 'Anonymous',
                  role: userData.role || 'user',
                  displayName: user.displayName || userData.username
                }
              } else {
                // If user doc doesn't exist, create it
                await this.createUserDocument(user, {
                  username: user.email.split('@')[0],
                  role: 'user'
                })
              }
            } catch (error) {
              console.error('Error fetching user data:', error)
              this.error = error.message
            }
          } else {
            // User is signed out
            this.currentUser = null
          }
          this.isInitialized = true
          resolve(user)
        })
      })
    },

    // Create user document in Firestore
    async createUserDocument(user, additionalData = {}) {
      try {
        const userRef = doc(db, 'users', user.uid)
        const userData = {
          uid: user.uid,
          email: user.email,
          username: sanitizeContent(additionalData.username || user.email.split('@')[0]),
          role: additionalData.role || 'user',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          ...additionalData
        }

        await setDoc(userRef, userData, { merge: true })

        this.currentUser = {
          uid: user.uid,
          email: user.email,
          username: userData.username,
          role: userData.role,
          displayName: user.displayName || userData.username
        }

        return userData
      } catch (error) {
        console.error('Error creating user document:', error)
        throw error
      }
    },

    // Register new user
    async register({ email, password, username, role = 'user' }) {
      this.loading = true
      this.error = null

      try {
        // Validate inputs
        const cleanUsername = sanitizeContent(username)
        const cleanRole = role === 'admin' ? 'admin' : 'user'

        if (!validateUsername(cleanUsername)) {
          throw new Error('Username must be 3-30 characters and contain only letters, numbers, and underscores')
        }

        if (!validatePassword(password)) {
          throw new Error('Password must be at least 6 characters and contain both letters and numbers')
        }

        if (!validateRole(cleanRole)) {
          throw new Error('Invalid role selected')
        }

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Update display name
        await updateProfile(user, {
          displayName: cleanUsername
        })

        // Create user document in Firestore
        await this.createUserDocument(user, {
          username: cleanUsername,
          role: cleanRole
        })

        this.loading = false
        return { success: true, user: this.currentUser }
      } catch (error) {
        this.loading = false
        this.error = error.message

        // Handle specific Firebase errors
        if (error.code === 'auth/email-already-in-use') {
          throw new Error('This email is already registered')
        } else if (error.code === 'auth/weak-password') {
          throw new Error('Password is too weak')
        } else if (error.code === 'auth/invalid-email') {
          throw new Error('Invalid email address')
        }

        throw new Error(error.message || 'Registration failed')
      }
    },

    // Login user
    async login({ email, password }) {
      this.loading = true
      this.error = null

      try {
        if (!email || !password) {
          throw new Error('Email and password are required')
        }

        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Update last login timestamp
        const userRef = doc(db, 'users', user.uid)
        await updateDoc(userRef, {
          lastLogin: serverTimestamp()
        })

        // Fetch user data
        const userDoc = await getDoc(userRef)
        if (userDoc.exists()) {
          const userData = userDoc.data()
          this.currentUser = {
            uid: user.uid,
            email: user.email,
            username: userData.username || user.displayName,
            role: userData.role || 'user',
            displayName: user.displayName || userData.username
          }
        }

        this.loading = false
        return { success: true, user: this.currentUser }
      } catch (error) {
        this.loading = false
        this.error = error.message

        // Handle specific Firebase errors
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          throw new Error('Invalid email or password')
        } else if (error.code === 'auth/too-many-requests') {
          throw new Error('Too many failed login attempts. Please try again later.')
        } else if (error.code === 'auth/invalid-credential') {
          throw new Error('Invalid credentials')
        }

        throw new Error(error.message || 'Login failed')
      }
    },

    // Logout user
    async logout() {
      this.loading = true
      this.error = null

      try {
        await signOut(auth)
        this.currentUser = null
        this.loading = false
      } catch (error) {
        this.loading = false
        this.error = error.message
        throw new Error(error.message || 'Logout failed')
      }
    },

    // Update user role (admin only)
    async updateUserRole(userId, newRole) {
      if (!this.isAdmin) {
        throw new Error('Only administrators can update user roles')
      }

      try {
        const userRef = doc(db, 'users', userId)
        await updateDoc(userRef, {
          role: newRole
        })

        return { success: true }
      } catch (error) {
        throw new Error(error.message || 'Failed to update user role')
      }
    },

    // Check if user has specific role
    hasRole(role) {
      return this.isAuthenticated && this.currentUser?.role === role
    }
  }
})
