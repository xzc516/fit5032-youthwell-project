<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section text-center text-white py-5">
      <div class="container">
        <h1 class="display-4 fw-bold mb-4">Welcome to YouthWell</h1>
        <p class="lead mb-4">
          Your safe space for mental health support, resources, and community connection.
        </p>
        <p class="fs-5 mb-4">
          We're here to support young people on their mental health journey with tools, resources, and a caring community.
        </p>
        <div class="d-flex gap-3 justify-content-center flex-wrap">
          <button @click="$router.push('/assessment')" class="btn btn-light btn-lg">
            Take Self-Assessment
          </button>
          <button @click="$router.push('/resources')" class="btn btn-outline-light btn-lg">
            Explore Resources
          </button>
          <button @click="$router.push('/forum')" class="btn btn-outline-light btn-lg">
            Join Community
          </button>
        </div>
      </div>
    </section>

    <!-- Crisis Support Banner -->
    <section class="crisis-banner bg-danger text-white py-4">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h3 class="mb-2">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              In Crisis? Get Immediate Help
            </h3>
            <p class="mb-0">If you're experiencing a mental health emergency, help is available 24/7.</p>
          </div>
          <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="tel:131114" class="btn btn-light btn-lg">
              <i class="bi bi-telephone-fill me-2"></i>
              Call Lifeline 13 11 14
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Access Cards -->
    <section class="quick-access py-5">
      <div class="container">
        <h2 class="text-center text-white mb-5">Quick Access to Popular Resources</h2>
        <div class="row g-4">
          <!-- Self-Assessment Card -->
          <div class="col-md-4">
            <div class="card h-100 shadow-sm hover-card">
              <div class="card-body text-center p-4">
                <div class="icon-circle bg-primary bg-opacity-10 mb-3">
                  <i class="bi bi-clipboard-check text-primary fs-1"></i>
                </div>
                <h4 class="card-title">Mental Health Assessment</h4>
                <p class="card-text">
                  Take validated screening tools (PHQ-9, GAD-7) to understand your mental health.
                </p>
                <button @click="$router.push('/assessment')" class="btn btn-primary">
                  Start Assessment
                </button>
              </div>
            </div>
          </div>

          <!-- Community Forum Card -->
          <div class="col-md-4">
            <div class="card h-100 shadow-sm hover-card">
              <div class="card-body text-center p-4">
                <div class="icon-circle bg-success bg-opacity-10 mb-3">
                  <i class="bi bi-people text-success fs-1"></i>
                </div>
                <h4 class="card-title">Community Support</h4>
                <p class="card-text">
                  Connect with peers, share experiences, and find support in our moderated forum.
                </p>
                <button @click="$router.push('/forum')" class="btn btn-success">
                  Join Forum
                </button>
              </div>
            </div>
          </div>

          <!-- Find Services Card -->
          <div class="col-md-4">
            <div class="card h-100 shadow-sm hover-card">
              <div class="card-body text-center p-4">
                <div class="icon-circle bg-info bg-opacity-10 mb-3">
                  <i class="bi bi-geo-alt text-info fs-1"></i>
                </div>
                <h4 class="card-title">Find Services</h4>
                <p class="card-text">
                  Locate mental health services near you with our interactive map and directions.
                </p>
                <button @click="$router.push('/map')" class="btn btn-info">
                  Open Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Crisis Hotlines Section -->
    <section class="crisis-hotlines py-5 bg-white bg-opacity-10">
      <div class="container">
        <h2 class="text-center text-white mb-5">24/7 Crisis Support Hotlines</h2>
        <div class="row g-4">
          <div class="col-md-6">
            <div class="card border-danger">
              <div class="card-body">
                <h5 class="card-title text-danger">
                  <i class="bi bi-telephone-fill me-2"></i>Lifeline Australia
                </h5>
                <p class="card-text">24-hour crisis support and suicide prevention services</p>
                <a href="tel:131114" class="btn btn-danger btn-lg w-100">
                  Call 13 11 14
                </a>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-primary">
              <div class="card-body">
                <h5 class="card-title text-primary">
                  <i class="bi bi-chat-dots-fill me-2"></i>Kids Helpline
                </h5>
                <p class="card-text">Free, confidential counselling for young people aged 5-25</p>
                <a href="tel:1800551800" class="btn btn-primary btn-lg w-100">
                  Call 1800 55 1800
                </a>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-success">
              <div class="card-body">
                <h5 class="card-title text-success">
                  <i class="bi bi-headset me-2"></i>Beyond Blue
                </h5>
                <p class="card-text">Support for depression, anxiety and related disorders</p>
                <a href="tel:1300224636" class="btn btn-success btn-lg w-100">
                  Call 1300 22 4636
                </a>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-warning">
              <div class="card-body">
                <h5 class="card-title text-warning">
                  <i class="bi bi-chat-square-text-fill me-2"></i>Mensline Australia
                </h5>
                <p class="card-text">Professional support for men with emotional health concerns</p>
                <a href="tel:1300789978" class="btn btn-warning btn-lg w-100">
                  Call 1300 78 99 78
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features py-5">
      <div class="container">
        <h2 class="text-center text-white mb-5">Why Choose YouthWell?</h2>
        <div class="row g-4 text-white">
          <div class="col-md-3 text-center">
            <i class="bi bi-shield-check fs-1 mb-3"></i>
            <h5>Safe & Anonymous</h5>
            <p>Your privacy is protected with anonymous posting options</p>
          </div>
          <div class="col-md-3 text-center">
            <i class="bi bi-people-fill fs-1 mb-3"></i>
            <h5>Peer Support</h5>
            <p>Connect with others who understand your experiences</p>
          </div>
          <div class="col-md-3 text-center">
            <i class="bi bi-bookmark-heart fs-1 mb-3"></i>
            <h5>Evidence-Based</h5>
            <p>Validated assessment tools and professional resources</p>
          </div>
          <div class="col-md-3 text-center">
            <i class="bi bi-clock-fill fs-1 mb-3"></i>
            <h5>24/7 Access</h5>
            <p>Support and resources available anytime you need them</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.home-view {
  margin: -2rem -12px 0;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rem 0 !important;
}

.crisis-banner {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.quick-access {
  background: transparent;
}

.hover-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.card {
  border: none;
  border-radius: 12px;
}

.btn-lg {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .hero-section .lead {
    font-size: 1rem;
  }
}
</style>
