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

    <!-- Posts List -->
    <div class="row">
      <div class="col-12">
        <h3 class="text-white mb-4">
          <i class="fas fa-list me-2"></i>Recent Posts
        </h3>
      </div>
    </div>
    
    <div class="row g-4">
      <div v-for="post in posts" :key="post.id" class="col-12 col-lg-6">
        <div class="card post-card h-100 shadow" @click="openPost(post)" style="cursor: pointer;">
          <div class="card-body">
            <h5 class="card-title text-primary">{{ post.title }}</h5>
            <p class="card-text">{{ post.summary }}</p>
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
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const posts = ref([])
const form = ref({ title: '', summary: '', rating: 3 })
const errors = ref({ title: '', summary: '', rating: '' })
const selectedPost = ref(null)
const postModal = ref(null)

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
  try {
    const saved = localStorage.getItem('forum-posts')
    if (saved) {
      const parsedPosts = JSON.parse(saved)
      // Validate and sanitize loaded data
      if (Array.isArray(parsedPosts)) {
        posts.value = parsedPosts.map(post => {
          // Migrate legacy single rating to ratings array
          const ratingsArray = Array.isArray(post.ratings)
            ? post.ratings.filter(r => r && typeof r.user === 'string' && !isNaN(parseInt(r.score)))
            : (typeof post.rating !== 'undefined'
                ? [{ user: sanitizeContent(post.author || 'Anonymous'), score: Math.max(1, Math.min(5, parseInt(post.rating) || 3)) }]
                : [])

          return {
            id: post.id || Date.now(),
            title: sanitizeContent(post.title || ''),
            summary: sanitizeContent(post.summary || ''),
            ratings: ratingsArray,
            author: sanitizeContent(post.author || 'Anonymous'),
            timestamp: post.timestamp || Date.now()
          }
        })
      }
    } else {
      // Default posts
      posts.value = [
        { 
          id: 1, 
          title: 'How to Deal with Exam Anxiety?', 
          summary: 'Share practical methods and breathing exercises to help manage stress during exam periods.', 
          ratings: [{ user: 'Anonymous', score: 4 }],
          author: 'Anonymous',
          timestamp: Date.now()
        },
        { 
          id: 2, 
          title: 'University Social Skills', 
          summary: 'Tips on building connections and support networks in new environments.', 
          ratings: [{ user: 'Anonymous', score: 3 }],
          author: 'Anonymous',
          timestamp: Date.now()
        },
      ]
    }
  } catch (error) {
    console.error('Error loading forum posts:', error)
    // If data is corrupted, use default data
    posts.value = [
      { 
        id: 1, 
        title: 'How to Deal with Exam Anxiety?', 
        summary: 'Share practical methods and breathing exercises to help manage stress during exam periods.', 
        ratings: [{ user: 'Anonymous', score: 4 }],
        author: 'Anonymous',
        timestamp: Date.now()
      }
    ]
  }
})

watch(posts, (val) => {
  try {
    localStorage.setItem('forum-posts', JSON.stringify(val))
  } catch (error) {
    console.error('Error saving forum posts:', error)
  }
}, { deep: true })

function getAverageRating(post) {
  const list = Array.isArray(post?.ratings) ? post.ratings : []
  if (list.length === 0) return 0
  const sum = list.reduce((acc, r) => acc + Math.max(1, Math.min(5, parseInt(r.score) || 0)), 0)
  return sum / list.length
}

function getRatingCount(post) {
  return Array.isArray(post?.ratings) ? post.ratings.length : 0
}

function ratePost(id, value) {
  try {
    const target = posts.value.find(p => p.id === id)
    if (!target) return
    
    // Validate rating value
    const validRating = Math.max(1, Math.min(5, parseInt(value) || 1))
    const user = auth.currentUser?.username || 'Anonymous'

    // Ensure ratings array exists
    if (!Array.isArray(target.ratings)) target.ratings = []

    // Upsert user's rating (each user can rate once)
    const existing = target.ratings.find(r => r.user === user)
    if (existing) {
      existing.score = validRating
    } else {
      target.ratings.push({ user, score: validRating })
    }
  } catch (error) {
    console.error('Error rating post:', error)
  }
}

function validate() {
  errors.value = { title: '', summary: '', rating: '' }
  
  // Validate title
  errors.value.title = validateInput(form.value.title, 'title')
  
  // Validate content
  errors.value.summary = validateInput(form.value.summary, 'summary')
  
  // Validate rating
  errors.value.rating = validateInput(form.value.rating, 'rating')
  
  return !errors.value.title && !errors.value.summary && !errors.value.rating
}

function submitPost() {
  if (!validate()) return
  
  try {
    const initialRater = auth.currentUser?.username || 'Anonymous'
    const newPost = {
      id: Date.now(),
      title: sanitizeContent(form.value.title),
      summary: sanitizeContent(form.value.summary),
      ratings: [{ user: initialRater, score: parseInt(form.value.rating) }],
      author: initialRater,
      timestamp: Date.now()
    }
    
    posts.value = [newPost, ...posts.value]
    form.value = { title: '', summary: '', rating: 3 }
    
    // Show success message
    alert('Post published successfully!')
  } catch (error) {
    console.error('Error submitting post:', error)
    alert('Error publishing post. Please try again.')
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


