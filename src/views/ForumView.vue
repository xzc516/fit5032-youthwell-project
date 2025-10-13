<template>
  <section class="forum-section">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-4 text-white">
          <i class="fas fa-comments me-2"></i>Mental Health Forum
        </h1>
        <p class="text-center text-white-50 mb-5">Share your thoughts and support others in their mental health journey</p>
      </div>
    </div>

    <!-- Post Form -->
    <div class="card shadow-lg mb-5">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0"><i class="fas fa-plus me-2"></i>Create New Post</h5>
      </div>
      <div class="card-body">
        <form class="row g-3" @submit.prevent="submitPost">
          <div class="col-12 col-md-6">
            <label class="form-label fw-bold">Title</label>
            <input
              v-model.trim="form.title"
              type="text"
              class="form-control"
              :class="{'is-invalid': errors.title}"
              placeholder="Enter title (3-50 characters)"
            />
            <div class="invalid-feedback">{{ errors.title }}</div>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label fw-bold">Category</label>
            <select v-model="form.category" class="form-select" :class="{'is-invalid': errors.category}">
              <option value="">Select a category...</option>
              <option value="anxiety">Anxiety</option>
              <option value="depression">Depression</option>
              <option value="stress">Stress & Pressure</option>
              <option value="relationships">Relationships</option>
              <option value="school">School & Study</option>
              <option value="family">Family Issues</option>
              <option value="self-esteem">Self-Esteem</option>
              <option value="general">General Support</option>
            </select>
            <div class="invalid-feedback">{{ errors.category }}</div>
          </div>
          <div class="col-12">
            <label class="form-label fw-bold">Content</label>
            <textarea
              v-model.trim="form.summary"
              class="form-control"
              rows="4"
              :class="{'is-invalid': errors.summary}"
              placeholder="Share your thoughts, experiences, or advice (minimum 10 characters)"
            ></textarea>
            <div class="invalid-feedback">{{ errors.summary }}</div>
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label fw-bold">Your Rating (1-5)</label>
            <input
              v-model.number="form.rating"
              type="number"
              min="1"
              max="5"
              class="form-control"
              :class="{'is-invalid': errors.rating}"
            />
            <div class="invalid-feedback">{{ errors.rating }}</div>
          </div>
          <div class="col-12">
            <button type="submit" class="btn btn-primary btn-lg">
              <i class="fas fa-paper-plane me-2"></i>Publish Post
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Category Filter -->
    <div class="row mb-4">
      <div class="col-md-8">
        <h3 class="text-white mb-3">
          <i class="fas fa-list me-2"></i>Community Posts
        </h3>
      </div>
      <div class="col-md-4">
        <select v-model="selectedCategory" class="form-select form-select-lg">
          <option value="all">All Categories</option>
          <option value="anxiety">Anxiety</option>
          <option value="depression">Depression</option>
          <option value="stress">Stress & Pressure</option>
          <option value="relationships">Relationships</option>
          <option value="school">School & Study</option>
          <option value="family">Family Issues</option>
          <option value="self-esteem">Self-Esteem</option>
          <option value="general">General Support</option>
        </select>
      </div>
    </div>

    <!-- Professional Monitoring Notice -->
    <div class="alert alert-info mb-4">
      <i class="bi bi-shield-check me-2"></i>
      <strong>Safe Space:</strong> This forum is monitored by mental health professionals.
      Share your experiences with the community.
    </div>

    <div class="row g-4">
      <div v-for="post in filteredPosts" :key="post.id" class="col-12 col-lg-6">
        <div class="card post-card h-100 shadow" @click="openPost(post)" style="cursor: pointer;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title text-primary mb-0">{{ post.title }}</h5>
            </div>
            <div class="mb-2">
              <span class="badge bg-info">{{ getCategoryLabel(post.category) }}</span>
              <small class="text-muted ms-2">
                by {{ post.author }}
              </small>
            </div>
            <p class="card-text">{{ truncateText(post.summary, 150) }}</p>
            <div class="rating-section">
              <label class="form-label fw-bold">Rate this post:</label>
              <div class="rating-stars">
                <button
                  v-for="n in 5"
                  :key="n"
                  :class="{ 'star-active': n <= Math.round(getAverageRating(post)) }"
                  @click.stop="ratePost(post.id, n)"
                  class="star-btn"
                >
                  ★
                </button>
                <span class="rating-text ms-2">{{ getAverageRating(post).toFixed(1) }}/5 ({{ getRatingCount(post) }})</span>
              </div>
            </div>
          </div>
          <div class="card-footer text-muted">
            <small>Posted on {{ new Date(post.id).toLocaleDateString() }}</small>
            <button class="btn btn-sm btn-outline-primary float-end" @click.stop="openPost(post)">
              <i class="fas fa-eye me-1"></i>View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- No Posts Message -->
    <div v-if="filteredPosts.length === 0" class="text-center text-white py-5">
      <i class="bi bi-chat-x fs-1 mb-3"></i>
      <h4>No posts found in this category</h4>
      <p>Be the first to share in this category!</p>
    </div>

    <!-- Post Detail Modal -->
    <div class="modal fade" id="postModal" tabindex="-1" ref="postModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedPost?.title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedPost">
              <p class="lead">{{ selectedPost.summary }}</p>
              <div class="rating-section">
                <label class="form-label fw-bold">Rate this post:</label>
                <div class="rating-stars">
                  <button
                    v-for="n in 5"
                    :key="n"
                    :class="{ 'star-active': n <= Math.round(getAverageRating(selectedPost)) }"
                    @click="ratePost(selectedPost.id, n)"
                    class="star-btn"
                  >
                    ★
                  </button>
                  <span class="rating-text ms-2">{{ getAverageRating(selectedPost).toFixed(1) }}/5 ({{ getRatingCount(selectedPost) }})</span>
                </div>
              </div>
              <hr>
              <div class="post-meta">
                <small class="text-muted">
                  <i class="fas fa-calendar me-1"></i>
                  Posted on {{ new Date(selectedPost.id).toLocaleDateString() }}
                </small>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useFirebaseAuthStore } from '../stores/firebaseAuth'
import { useForumStore } from '../stores/forum'
import {
  validateFormData,
  sanitizeWithAllowlist,
  detectMaliciousContent,
  RateLimiter
} from '../utils/security'

const auth = useFirebaseAuthStore()
const forumStore = useForumStore()
const posts = computed(() => forumStore.sortedPosts)
const form = ref({ title: '', summary: '', rating: 3, category: '' })
const errors = ref({ title: '', summary: '', rating: '', category: '' })
const selectedPost = ref(null)
const postModal = ref(null)
const selectedCategory = ref('all')

const categoryLabels = {
  anxiety: 'Anxiety',
  depression: 'Depression',
  stress: 'Stress & Pressure',
  relationships: 'Relationships',
  school: 'School & Study',
  family: 'Family Issues',
  'self-esteem': 'Self-Esteem',
  general: 'General Support'
}

const filteredPosts = computed(() => {
  if (selectedCategory.value === 'all') {
    return posts.value
  }
  return posts.value.filter(post => post.category === selectedCategory.value)
})

// Content sanitization function - prevents XSS attacks
function sanitizeContent(content) {
  if (typeof content !== 'string') return ''
  
  // Remove all HTML tags
  let sanitized = content.replace(/<[^>]*>/g, '')
  
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

// Enhanced input validation
function validateInput(input, type) {
  switch (type) {
    case 'title':
      if (!input || input.trim().length === 0) {
        return 'Title is required'
      }
      if (input.trim().length < 3) {
        return 'Title must be at least 3 characters long'
      }
      if (input.trim().length > 50) {
        return 'Title must be no more than 50 characters long'
      }
      // Check for malicious content
      if (/script|javascript|on\w+\s*=|<|>/.test(input.toLowerCase())) {
        return 'Title contains invalid characters'
      }
      return ''
      
    case 'summary':
      if (!input || input.trim().length === 0) {
        return 'Content is required'
      }
      if (input.trim().length < 10) {
        return 'Content must be at least 10 characters long'
      }
      if (input.trim().length > 1000) {
        return 'Content must be no more than 1000 characters long'
      }
      // Check for malicious content
      if (/script|javascript|on\w+\s*=|<|>/.test(input.toLowerCase())) {
        return 'Content contains invalid characters'
      }
      return ''
      
    case 'rating':
      const rating = parseInt(input)
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return 'Rating must be a number between 1 and 5'
      }
      return ''
  }
  return ''
}

onMounted(() => {
  // Subscribe to real-time Firestore updates
  forumStore.subscribeToPosts()
})

onUnmounted(() => {
  // Clean up Firestore listener
  forumStore.unsubscribeFromPosts()
})

function getAverageRating(post) {
  return forumStore.getAverageRating(post)
}

function getRatingCount(post) {
  return forumStore.getRatingCount(post)
}

async function ratePost(id, value) {
  try {
    const username = auth.currentUser?.username || 'Anonymous'
    const userId = auth.currentUser?.uid || 'anonymous'

    await forumStore.ratePost(id, value, username, userId)
  } catch (error) {
    console.error('Error rating post:', error)
    alert('Failed to rate post: ' + error.message)
  }
}

function getCategoryLabel(category) {
  return categoryLabels[category] || 'General'
}

function truncateText(text, length) {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

function validate() {
  errors.value = { title: '', summary: '', rating: '', category: '' }

  // Validate title
  errors.value.title = validateInput(form.value.title, 'title')

  // Validate content
  errors.value.summary = validateInput(form.value.summary, 'summary')

  // Validate rating
  errors.value.rating = validateInput(form.value.rating, 'rating')

  // Validate category
  if (!form.value.category) {
    errors.value.category = 'Please select a category'
  }

  return !errors.value.title && !errors.value.summary && !errors.value.rating && !errors.value.category
}

async function submitPost() {
  if (!validate()) return

  try {
    const author = auth.currentUser?.username || 'User'
    const authorId = auth.currentUser?.uid || 'anonymous'

    console.log('Submitting post with category:', form.value.category)

    await forumStore.createPost({
      title: form.value.title,
      summary: form.value.summary,
      rating: form.value.rating,
      category: form.value.category,
      author,
      authorId
    })

    form.value = { title: '', summary: '', rating: 3, category: '' }

    // Show success message
    alert('Post published successfully!')
  } catch (error) {
    console.error('Error submitting post:', error)
    alert('Error publishing post: ' + error.message)
  }
}

function openPost(post) {
  try {
    selectedPost.value = {
      ...post,
      title: sanitizeContent(post.title),
      summary: sanitizeContent(post.summary)
    }
    
    // Use Bootstrap modal
    const modal = new bootstrap.Modal(postModal.value)
    modal.show()
  } catch (error) {
    console.error('Error opening post:', error)
  }
}
</script>

<style scoped>
.forum-section {
  padding: 20px 0;
}

.post-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
  border-radius: 15px;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
  border-color: #667eea;
}

.post-card:active {
  transform: translateY(-2px);
}

.card-title {
  color: #667eea !important;
  font-weight: bold;
}

.rating-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 5px;
}

.star-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #ddd;
  transition: color 0.3s ease, transform 0.2s ease;
  padding: 0;
  line-height: 1;
}

.star-btn:hover {
  color: #ffd700;
  transform: scale(1.1);
}

.star-active {
  color: #ffd700 !important;
}

.rating-text {
  font-weight: bold;
  color: #666;
}

.card-footer {
  background: #f8f9fa;
  border-top: 1px solid #eee;
  border-radius: 0 0 15px 15px !important;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.form-control {
  border-radius: 10px;
  border: 2px solid #e9ecef;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.card {
  border-radius: 15px;
  overflow: hidden;
}

.card-header {
  border-bottom: none;
  padding: 20px;
}

.card-body {
  padding: 25px;
}
</style>


