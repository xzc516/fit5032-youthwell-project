<template>
  <div class="resources-view">
    <div class="container py-4">
      <!-- Header -->
      <div class="text-center text-white mb-5">
        <h1 class="display-5 fw-bold mb-3">Resource Center</h1>
        <p class="lead">
          Evidence-based resources, coping strategies, and educational materials for mental health support
        </p>
      </div>

      <!-- Search and Filter -->
      <div class="card shadow mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-8">
              <input
                v-model="searchQuery"
                type="text"
                class="form-control form-control-lg"
                placeholder="Search resources..."
                aria-label="Search resources">
            </div>
            <div class="col-md-4">
              <select v-model="selectedCategory" class="form-select form-select-lg" aria-label="Filter by category">
                <option value="all">All Categories</option>
                <option value="basics">Mental Health Basics</option>
                <option value="coping">Coping Strategies</option>
                <option value="videos">Videos & Podcasts</option>
                <option value="downloads">Downloadable Resources</option>
                <option value="emergency">Emergency Resources</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Resources Grid -->
      <div class="row g-4">
        <div
          v-for="resource in filteredResources"
          :key="resource.id"
          class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm hover-card">
            <div class="card-header" :class="'bg-' + resource.color + ' bg-opacity-10'">
              <div class="d-flex align-items-center">
                <i :class="'bi bi-' + resource.icon + ' text-' + resource.color + ' fs-3 me-3'"></i>
                <div>
                  <h5 class="card-title mb-0">{{ resource.title }}</h5>
                  <small class="text-muted">{{ resource.category }}</small>
                </div>
              </div>
            </div>
            <div class="card-body">
              <p class="card-text">{{ resource.description }}</p>
              <div class="d-flex gap-2 flex-wrap mb-2">
                <span
                  v-for="tag in resource.tags"
                  :key="tag"
                  class="badge bg-secondary">
                  {{ tag }}
                </span>
              </div>
            </div>
            <div class="card-footer bg-transparent border-0">
              <button
                @click="openResource(resource)"
                class="btn w-100"
                :class="'btn-' + resource.color">
                <i :class="'bi bi-' + (resource.type === 'download' ? 'download' : 'box-arrow-up-right') + ' me-2'"></i>
                {{ resource.type === 'download' ? 'Download' : 'View Resource' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredResources.length === 0" class="text-center text-white py-5">
        <i class="bi bi-search fs-1 mb-3"></i>
        <h4>No resources found</h4>
        <p>Try adjusting your search or filter criteria</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const selectedCategory = ref('all')

const resources = [
  // Mental Health Basics
  {
    id: 1,
    title: 'Understanding Depression',
    category: 'Mental Health Basics',
    categoryKey: 'basics',
    description: 'Learn about depression symptoms, causes, and treatment options for young people.',
    icon: 'heart-pulse',
    color: 'primary',
    type: 'link',
    url: 'https://www.beyondblue.org.au/mental-health/depression',
    tags: ['Depression', 'Education']
  },
  {
    id: 2,
    title: 'Anxiety Explained',
    category: 'Mental Health Basics',
    categoryKey: 'basics',
    description: 'Understanding anxiety disorders, panic attacks, and how to manage them.',
    icon: 'lightning',
    color: 'warning',
    type: 'link',
    url: 'https://www.beyondblue.org.au/mental-health/anxiety',
    tags: ['Anxiety', 'Education']
  },
  {
    id: 3,
    title: 'Stress Management Guide',
    category: 'Mental Health Basics',
    categoryKey: 'basics',
    description: 'Comprehensive guide on identifying and managing stress in everyday life.',
    icon: 'book',
    color: 'info',
    type: 'link',
    url: 'https://www.headspace.org.au/explore-topics/for-young-people/stress/',
    tags: ['Stress', 'Guide']
  },

  // Coping Strategies
  {
    id: 4,
    title: 'Mindfulness & Meditation',
    category: 'Coping Strategies',
    categoryKey: 'coping',
    description: 'Learn mindfulness techniques and guided meditation practices for mental wellness.',
    icon: 'flower1',
    color: 'success',
    type: 'link',
    url: 'https://www.smashingthestigma.org.au/mindfulness',
    tags: ['Mindfulness', 'Meditation', 'Practice']
  },
  {
    id: 5,
    title: 'Breathing Exercises',
    category: 'Coping Strategies',
    categoryKey: 'coping',
    description: 'Simple breathing techniques to reduce anxiety and promote relaxation.',
    icon: 'wind',
    color: 'primary',
    type: 'download',
    url: '#',
    tags: ['Breathing', 'Relaxation', 'Quick Help']
  },
  {
    id: 6,
    title: 'Sleep Hygiene Tips',
    category: 'Coping Strategies',
    categoryKey: 'coping',
    description: 'Improve your sleep quality with evidence-based sleep hygiene practices.',
    icon: 'moon-stars',
    color: 'secondary',
    type: 'download',
    url: '#',
    tags: ['Sleep', 'Wellbeing']
  },
  {
    id: 7,
    title: 'Thought Challenging Worksheet',
    category: 'Coping Strategies',
    categoryKey: 'coping',
    description: 'CBT-based worksheet to identify and challenge negative thought patterns.',
    icon: 'journal-text',
    color: 'warning',
    type: 'download',
    url: '#',
    tags: ['CBT', 'Worksheet', 'Thoughts']
  },

  // Videos & Podcasts
  {
    id: 8,
    title: 'Headspace Youth Mental Health Videos',
    category: 'Videos & Podcasts',
    categoryKey: 'videos',
    description: 'Educational video series about mental health topics relevant to young Australians.',
    icon: 'play-circle',
    color: 'danger',
    type: 'link',
    url: 'https://www.youtube.com/@headspaceAustralia',
    tags: ['Video', 'Education', 'Youth']
  },
  {
    id: 9,
    title: 'ReachOut Podcast',
    category: 'Videos & Podcasts',
    categoryKey: 'videos',
    description: 'Podcast featuring real stories and expert advice on youth mental health.',
    icon: 'mic',
    color: 'info',
    type: 'link',
    url: 'https://www.reachout.com/',
    tags: ['Podcast', 'Stories', 'Expert']
  },

  // Downloadable Resources
  {
    id: 10,
    title: 'Mental Health Action Plan',
    category: 'Downloadable Resources',
    categoryKey: 'downloads',
    description: 'Create your personalized mental health action plan with this template.',
    icon: 'file-earmark-text',
    color: 'primary',
    type: 'download',
    url: '#',
    tags: ['Template', 'Planning', 'Self-help']
  },
  {
    id: 11,
    title: 'Mood Tracking Journal',
    category: 'Downloadable Resources',
    categoryKey: 'downloads',
    description: 'Track your daily mood, activities, and identify patterns over time.',
    icon: 'calendar-heart',
    color: 'success',
    type: 'download',
    url: '#',
    tags: ['Tracking', 'Journal', 'Self-awareness']
  },
  {
    id: 12,
    title: 'Crisis Safety Plan',
    category: 'Downloadable Resources',
    categoryKey: 'downloads',
    description: 'Develop a personal safety plan for managing mental health crises.',
    icon: 'shield-check',
    color: 'danger',
    type: 'download',
    url: '#',
    tags: ['Crisis', 'Safety', 'Planning']
  },
  {
    id: 13,
    title: 'Self-Care Checklist',
    category: 'Downloadable Resources',
    categoryKey: 'downloads',
    description: 'Daily and weekly self-care activities to maintain mental wellness.',
    icon: 'heart',
    color: 'warning',
    type: 'download',
    url: '#',
    tags: ['Self-care', 'Checklist', 'Wellbeing']
  },

  // Emergency Resources
  {
    id: 14,
    title: 'Crisis Hotlines Directory',
    category: 'Emergency Resources',
    categoryKey: 'emergency',
    description: 'Comprehensive list of 24/7 crisis support services in Australia.',
    icon: 'telephone',
    color: 'danger',
    type: 'link',
    url: '/home#crisis',
    tags: ['Crisis', 'Hotline', '24/7']
  },
  {
    id: 15,
    title: 'Emergency Department Guide',
    category: 'Emergency Resources',
    categoryKey: 'emergency',
    description: 'What to expect when seeking help at an emergency department for mental health.',
    icon: 'hospital',
    color: 'danger',
    type: 'download',
    url: '#',
    tags: ['Emergency', 'Hospital', 'Guide']
  },
  {
    id: 16,
    title: 'Supporting a Friend in Crisis',
    category: 'Emergency Resources',
    categoryKey: 'emergency',
    description: 'How to help a friend who may be experiencing a mental health crisis.',
    icon: 'people',
    color: 'warning',
    type: 'link',
    url: 'https://www.lifeline.org.au/resources/supporting-someone-in-crisis/',
    tags: ['Support', 'Friend', 'Crisis']
  },

  // Additional Resources
  {
    id: 17,
    title: 'Study Stress Management',
    category: 'Coping Strategies',
    categoryKey: 'coping',
    description: 'Strategies to manage academic pressure and exam stress effectively.',
    icon: 'mortarboard',
    color: 'info',
    type: 'download',
    url: '#',
    tags: ['Study', 'Stress', 'Academic']
  },
  {
    id: 18,
    title: 'Social Connection Tips',
    category: 'Coping Strategies',
    categoryKey: 'coping',
    description: 'Build and maintain meaningful relationships for better mental health.',
    icon: 'chat-heart',
    color: 'success',
    type: 'link',
    url: 'https://www.headspace.org.au/explore-topics/for-young-people/social-connection/',
    tags: ['Social', 'Connection', 'Relationships']
  },
  {
    id: 19,
    title: 'Body Image & Self-Esteem',
    category: 'Mental Health Basics',
    categoryKey: 'basics',
    description: 'Understanding and improving body image and self-esteem.',
    icon: 'person-check',
    color: 'primary',
    type: 'link',
    url: 'https://www.eatingdisorders.org.au/body-image',
    tags: ['Body Image', 'Self-esteem', 'Identity']
  },
  {
    id: 20,
    title: 'Digital Wellbeing Guide',
    category: 'Coping Strategies',
    categoryKey: 'coping',
    description: 'Manage screen time and social media use for better mental health.',
    icon: 'phone',
    color: 'info',
    type: 'download',
    url: '#',
    tags: ['Digital', 'Screen Time', 'Social Media']
  }
]

const filteredResources = computed(() => {
  let filtered = resources

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(r => r.categoryKey === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(r =>
      r.title.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return filtered
})

function openResource(resource) {
  if (resource.type === 'download') {
    // Simulate download
    alert(`Downloading: ${resource.title}\n\nNote: In production, this would download a PDF file with the resource content.`)
  } else {
    // Open external link
    window.open(resource.url, '_blank', 'noopener,noreferrer')
  }
}
</script>

<style scoped>
.resources-view {
  min-height: 100vh;
}

.hover-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
}

.card-footer {
  padding: 1rem;
}

@media (max-width: 768px) {
  .display-5 {
    font-size: 2rem;
  }
}
</style>
