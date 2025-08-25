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
            <label class="form-label fw-bold">Initial Rating (1-5)</label>
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
                  :class="{ 'star-active': n <= post.rating }"
                  @click.stop="ratePost(post.id, n)"
                  class="star-btn"
                >
                  ★
                </button>
                <span class="rating-text ms-2">{{ post.rating }}/5</span>
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
                    :class="{ 'star-active': n <= selectedPost.rating }"
                    @click="ratePost(selectedPost.id, n)"
                    class="star-btn"
                  >
                    ★
                  </button>
                  <span class="rating-text ms-2">{{ selectedPost.rating }}/5</span>
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

const posts = ref([])
const form = ref({ title: '', summary: '', rating: 3 })
const errors = ref({ title: '', summary: '', rating: '' })
const selectedPost = ref(null)
const postModal = ref(null)

onMounted(() => {
  const saved = localStorage.getItem('forum-posts')
  posts.value = saved ? JSON.parse(saved) : [
    { id: 1, title: 'How to Deal with Exam Anxiety?', summary: 'Share practical methods and breathing exercises to help manage stress during exam periods.', rating: 4 },
    { id: 2, title: 'University Social Skills', summary: 'Tips on building connections and support networks in new environments.', rating: 3 },
  ]
})

watch(posts, (val) => {
  localStorage.setItem('forum-posts', JSON.stringify(val))
}, { deep: true })

function ratePost(id, value) {
  const target = posts.value.find(p => p.id === id)
  if (!target) return
  target.rating = value
}

function validate() {
  errors.value = { title: '', summary: '', rating: '' }
  // Validation 1: Required + Length (title)
  if (!form.value.title) {
    errors.value.title = 'Title is required'
  } else if (form.value.title.length < 3 || form.value.title.length > 50) {
    errors.value.title = 'Title must be between 3-50 characters'
  }
  // Validation 2: Minimum length (content)
  if (!form.value.summary || form.value.summary.length < 10) {
    errors.value.summary = 'Content must be at least 10 characters'
  }
  // Validation 3: Numeric range (rating)
  if (isNaN(form.value.rating) || form.value.rating < 1 || form.value.rating > 5) {
    errors.value.rating = 'Rating must be between 1-5'
  }
  return !errors.value.title && !errors.value.summary && !errors.value.rating
}

function submitPost() {
  if (!validate()) return
  const newPost = {
    id: Date.now(),
    title: form.value.title,
    summary: form.value.summary,
    rating: form.value.rating,
  }
  posts.value = [newPost, ...posts.value]
  form.value = { title: '', summary: '', rating: 3 }
}

function openPost(post) {
  selectedPost.value = post
  // Use Bootstrap modal
  const modal = new bootstrap.Modal(postModal.value)
  modal.show()
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


