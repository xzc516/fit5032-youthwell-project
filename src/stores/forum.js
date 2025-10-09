import { defineStore } from 'pinia'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { sanitizeContent, validateContentLength } from '../utils/security'

export const useForumStore = defineStore('forum', {
  state: () => ({
    posts: [],
    loading: false,
    error: null,
    unsubscribe: null
  }),

  getters: {
    sortedPosts: (state) => {
      return [...state.posts].sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : a.timestamp || 0
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : b.timestamp || 0
        return timeB - timeA
      })
    }
  },

  actions: {
    // Subscribe to real-time posts updates
    subscribeToPosts() {
      this.loading = true

      try {
        const postsQuery = query(
          collection(db, 'posts'),
          orderBy('timestamp', 'desc')
        )

        // Set up real-time listener
        this.unsubscribe = onSnapshot(
          postsQuery,
          (snapshot) => {
            this.posts = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              // Convert Firestore timestamp to milliseconds for compatibility
              timestamp: doc.data().timestamp?.toMillis
                ? doc.data().timestamp.toMillis()
                : Date.now()
            }))
            this.loading = false
          },
          (error) => {
            console.error('Error fetching posts:', error)
            this.error = error.message
            this.loading = false
          }
        )
      } catch (error) {
        console.error('Error subscribing to posts:', error)
        this.error = error.message
        this.loading = false
      }
    },

    // Unsubscribe from real-time updates
    unsubscribeFromPosts() {
      if (this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = null
      }
    },

    // Load posts once (without real-time updates)
    async loadPosts() {
      this.loading = true
      this.error = null

      try {
        const postsQuery = query(
          collection(db, 'posts'),
          orderBy('timestamp', 'desc')
        )

        const snapshot = await getDocs(postsQuery)
        this.posts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toMillis
            ? doc.data().timestamp.toMillis()
            : Date.now()
        }))

        this.loading = false
      } catch (error) {
        console.error('Error loading posts:', error)
        this.error = error.message
        this.loading = false
        throw error
      }
    },

    // Create new post
    async createPost({ title, summary, rating, author, authorId }) {
      this.loading = true
      this.error = null

      try {
        // Validate inputs
        const cleanTitle = sanitizeContent(title)
        const cleanSummary = sanitizeContent(summary)

        if (!validateContentLength(cleanTitle, 3, 50)) {
          throw new Error('Title must be between 3 and 50 characters')
        }

        if (!validateContentLength(cleanSummary, 10, 1000)) {
          throw new Error('Content must be between 10 and 1000 characters')
        }

        const validRating = Math.max(1, Math.min(5, parseInt(rating) || 3))

        // Create post document
        const postData = {
          title: cleanTitle,
          summary: cleanSummary,
          author: sanitizeContent(author || 'Anonymous'),
          authorId: authorId || 'anonymous',
          ratings: [
            {
              user: sanitizeContent(author || 'Anonymous'),
              userId: authorId || 'anonymous',
              score: validRating
            }
          ],
          timestamp: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }

        const docRef = await addDoc(collection(db, 'posts'), postData)

        this.loading = false
        return { success: true, id: docRef.id }
      } catch (error) {
        console.error('Error creating post:', error)
        this.error = error.message
        this.loading = false
        throw new Error(error.message || 'Failed to create post')
      }
    },

    // Rate a post
    async ratePost(postId, rating, username, userId) {
      try {
        const validRating = Math.max(1, Math.min(5, parseInt(rating) || 1))
        const post = this.posts.find(p => p.id === postId)

        if (!post) {
          throw new Error('Post not found')
        }

        const postRef = doc(db, 'posts', postId)

        // Check if user already rated
        const existingRatingIndex = post.ratings?.findIndex(
          r => r.userId === userId || r.user === username
        )

        let updatedRatings = [...(post.ratings || [])]

        if (existingRatingIndex !== -1) {
          // Update existing rating
          updatedRatings[existingRatingIndex] = {
            user: sanitizeContent(username),
            userId: userId || 'anonymous',
            score: validRating
          }
        } else {
          // Add new rating
          updatedRatings.push({
            user: sanitizeContent(username),
            userId: userId || 'anonymous',
            score: validRating
          })
        }

        await updateDoc(postRef, {
          ratings: updatedRatings,
          updatedAt: serverTimestamp()
        })

        return { success: true }
      } catch (error) {
        console.error('Error rating post:', error)
        throw new Error(error.message || 'Failed to rate post')
      }
    },

    // Delete post
    async deletePost(postId) {
      this.loading = true
      this.error = null

      try {
        await deleteDoc(doc(db, 'posts', postId))
        this.loading = false
        return { success: true }
      } catch (error) {
        console.error('Error deleting post:', error)
        this.error = error.message
        this.loading = false
        throw new Error(error.message || 'Failed to delete post')
      }
    },

    // Get average rating for a post
    getAverageRating(post) {
      const ratings = post?.ratings || []
      if (ratings.length === 0) return 0

      const sum = ratings.reduce((acc, r) => {
        const score = Math.max(1, Math.min(5, parseInt(r.score) || 0))
        return acc + score
      }, 0)

      return sum / ratings.length
    },

    // Get rating count for a post
    getRatingCount(post) {
      return post?.ratings?.length || 0
    }
  }
})
