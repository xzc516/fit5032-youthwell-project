<template>
  <div class="assessment-view">
    <div class="container py-4">
      <!-- Header -->
      <div class="text-center text-white mb-5">
        <h1 class="display-5 fw-bold mb-3">Mental Health Self-Assessment</h1>
        <p class="lead">
          Evidence-based screening tools to help you understand your mental health.
          All assessments are anonymous and confidential.
        </p>
      </div>

      <!-- Assessment Selection -->
      <div v-if="!currentAssessment" class="row g-4 mb-5">
        <div class="col-md-6">
          <div class="card h-100 shadow-sm hover-card" @click="startAssessment('phq9')">
            <div class="card-body p-4">
              <div class="d-flex align-items-center mb-3">
                <div class="icon-circle bg-primary bg-opacity-10 me-3">
                  <i class="bi bi-heart-pulse text-primary fs-3"></i>
                </div>
                <div>
                  <h3 class="card-title mb-0">PHQ-9</h3>
                  <small class="text-muted">Depression Screening</small>
                </div>
              </div>
              <p class="card-text mb-3">
                <strong>Patient Health Questionnaire-9</strong> is a validated 9-question tool
                for assessing depression severity.
              </p>
              <ul class="list-unstyled mb-3">
                <li><i class="bi bi-check-circle text-success me-2"></i>9 questions</li>
                <li><i class="bi bi-check-circle text-success me-2"></i>5 minutes to complete</li>
                <li><i class="bi bi-check-circle text-success me-2"></i>Evidence-based</li>
                <li><i class="bi bi-check-circle text-success me-2"></i>Suitable for adolescents</li>
              </ul>
              <button class="btn btn-primary w-100">Start PHQ-9 Assessment</button>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card h-100 shadow-sm hover-card" @click="startAssessment('gad7')">
            <div class="card-body p-4">
              <div class="d-flex align-items-center mb-3">
                <div class="icon-circle bg-warning bg-opacity-10 me-3">
                  <i class="bi bi-lightning text-warning fs-3"></i>
                </div>
                <div>
                  <h3 class="card-title mb-0">GAD-7</h3>
                  <small class="text-muted">Anxiety Screening</small>
                </div>
              </div>
              <p class="card-text mb-3">
                <strong>Generalized Anxiety Disorder-7</strong> is a validated 7-question tool
                for assessing anxiety levels.
              </p>
              <ul class="list-unstyled mb-3">
                <li><i class="bi bi-check-circle text-success me-2"></i>7 questions</li>
                <li><i class="bi bi-check-circle text-success me-2"></i>3 minutes to complete</li>
                <li><i class="bi bi-check-circle text-success me-2"></i>Evidence-based</li>
                <li><i class="bi bi-check-circle text-success me-2"></i>Widely validated</li>
              </ul>
              <button class="btn btn-warning w-100">Start GAD-7 Assessment</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Privacy Notice -->
      <div v-if="!currentAssessment" class="alert alert-info">
        <i class="bi bi-shield-check me-2"></i>
        <strong>Privacy & Confidentiality:</strong> Your responses are anonymous and stored locally on your device only.
        Results are for informational purposes and do not constitute a clinical diagnosis.
        If you're concerned about your mental health, please consult a healthcare professional.
      </div>

      <!-- Assessment Form -->
      <div v-if="currentAssessment && !showResults" class="card shadow">
        <div class="card-header bg-primary text-white">
          <div class="d-flex justify-content-between align-items-center">
            <h4 class="mb-0">{{ assessments[currentAssessment].title }}</h4>
            <button @click="cancelAssessment" class="btn btn-sm btn-outline-light">
              <i class="bi bi-x-lg"></i> Cancel
            </button>
          </div>
          <div class="progress mt-3" style="height: 8px;">
            <div class="progress-bar" role="progressbar"
                 :style="{ width: progressPercentage + '%' }"
                 :aria-valuenow="progressPercentage"
                 aria-valuemin="0"
                 aria-valuemax="100">
            </div>
          </div>
          <small class="mt-2 d-block">
            Question {{ currentQuestionIndex + 1 }} of {{ assessments[currentAssessment].questions.length }}
          </small>
        </div>
        <div class="card-body p-4">
          <p class="lead mb-4">
            <strong>Over the last 2 weeks, how often have you been bothered by the following?</strong>
          </p>

          <div class="question-card p-4 bg-light rounded mb-4">
            <h5 class="mb-4">{{ currentQuestion.text }}</h5>

            <div class="d-grid gap-3">
              <button
                v-for="(option, index) in options"
                :key="index"
                @click="selectAnswer(index)"
                class="btn btn-outline-primary btn-lg text-start option-btn"
                :class="{ 'active': responses[currentQuestionIndex] === index }">
                <div class="d-flex align-items-center">
                  <span class="me-3 fs-5">{{ index }}</span>
                  <span>{{ option }}</span>
                </div>
              </button>
            </div>
          </div>

          <div class="d-flex justify-content-between mt-4">
            <button
              @click="previousQuestion"
              class="btn btn-secondary"
              :disabled="currentQuestionIndex === 0">
              <i class="bi bi-arrow-left me-2"></i>Previous
            </button>
            <button
              v-if="currentQuestionIndex < assessments[currentAssessment].questions.length - 1"
              @click="nextQuestion"
              class="btn btn-primary"
              :disabled="responses[currentQuestionIndex] === null">
              Next<i class="bi bi-arrow-right ms-2"></i>
            </button>
            <button
              v-else
              @click="submitAssessment"
              class="btn btn-success"
              :disabled="responses[currentQuestionIndex] === null">
              Submit<i class="bi bi-check-lg ms-2"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div v-if="showResults" class="card shadow">
        <div class="card-header text-white" :class="resultColorClass">
          <h4 class="mb-0">
            <i class="bi bi-clipboard-check me-2"></i>
            Your {{ assessments[currentAssessment].title }} Results
          </h4>
        </div>
        <div class="card-body p-4">
          <div class="text-center mb-4">
            <div class="display-3 fw-bold mb-2" :class="resultTextClass">
              {{ totalScore }}
            </div>
            <h5 class="text-muted">Total Score</h5>
          </div>

          <div class="alert" :class="resultAlertClass">
            <h5 class="alert-heading">{{ resultInterpretation.severity }}</h5>
            <p class="mb-0">{{ resultInterpretation.description }}</p>
          </div>

          <div class="recommendations bg-light p-4 rounded mb-4">
            <h5 class="mb-3">Recommendations:</h5>
            <ul>
              <li v-for="(rec, index) in resultInterpretation.recommendations" :key="index" class="mb-2">
                {{ rec }}
              </li>
            </ul>
          </div>

          <!-- High Risk Warning -->
          <div v-if="isHighRisk" class="alert alert-danger">
            <h5 class="alert-heading">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              Immediate Support Available
            </h5>
            <p>Your responses indicate you may be experiencing significant distress. Please consider reaching out for professional support:</p>
            <div class="d-grid gap-2">
              <a href="tel:131114" class="btn btn-danger">
                <i class="bi bi-telephone-fill me-2"></i>Call Lifeline 13 11 14 (24/7)
              </a>
              <a href="tel:1800551800" class="btn btn-primary">
                <i class="bi bi-chat-dots-fill me-2"></i>Kids Helpline 1800 55 1800
              </a>
            </div>
          </div>

          <div class="d-flex gap-3 justify-content-center mt-4">
            <button @click="saveResults" class="btn btn-success">
              <i class="bi bi-save me-2"></i>Save to Dashboard
            </button>
            <button @click="takeAnotherAssessment" class="btn btn-primary">
              <i class="bi bi-arrow-repeat me-2"></i>Take Another Assessment
            </button>
            <button @click="$router.push('/resources')" class="btn btn-info">
              <i class="bi bi-book me-2"></i>View Resources
            </button>
          </div>
        </div>
      </div>

      <!-- Emergency Banner -->
      <div v-if="!showResults" class="alert alert-danger mt-4">
        <h6 class="alert-heading">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          If you're in crisis or thinking about self-harm
        </h6>
        <p class="mb-2">Please reach out for immediate help:</p>
        <div class="d-flex gap-2 flex-wrap">
          <a href="tel:131114" class="btn btn-sm btn-danger">Lifeline 13 11 14</a>
          <a href="tel:1800551800" class="btn btn-sm btn-primary">Kids Helpline 1800 55 1800</a>
          <a href="tel:000" class="btn btn-sm btn-dark">Emergency 000</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuthStore } from '../stores/firebaseAuth'
import { db } from '../firebase/config'
import { collection, addDoc } from 'firebase/firestore'

const router = useRouter()
const auth = useFirebaseAuthStore()

const currentAssessment = ref(null)
const currentQuestionIndex = ref(0)
const responses = ref([])
const showResults = ref(false)
const totalScore = ref(0)

const options = [
  'Not at all',
  'Several days',
  'More than half the days',
  'Nearly every day'
]

const assessments = {
  phq9: {
    title: 'PHQ-9 (Depression Screening)',
    questions: [
      { text: 'Little interest or pleasure in doing things' },
      { text: 'Feeling down, depressed, or hopeless' },
      { text: 'Trouble falling or staying asleep, or sleeping too much' },
      { text: 'Feeling tired or having little energy' },
      { text: 'Poor appetite or overeating' },
      { text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down' },
      { text: 'Trouble concentrating on things, such as reading the newspaper or watching television' },
      { text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual' },
      { text: 'Thoughts that you would be better off dead, or of hurting yourself in some way' }
    ],
    scoring: [
      { max: 4, severity: 'Minimal Depression', class: 'success', description: 'Your responses suggest minimal or no depression symptoms.' },
      { max: 9, severity: 'Mild Depression', class: 'info', description: 'Your responses suggest mild depression symptoms.' },
      { max: 14, severity: 'Moderate Depression', class: 'warning', description: 'Your responses suggest moderate depression symptoms.' },
      { max: 19, severity: 'Moderately Severe Depression', class: 'warning', description: 'Your responses suggest moderately severe depression symptoms.' },
      { max: 27, severity: 'Severe Depression', class: 'danger', description: 'Your responses suggest severe depression symptoms.' }
    ]
  },
  gad7: {
    title: 'GAD-7 (Anxiety Screening)',
    questions: [
      { text: 'Feeling nervous, anxious, or on edge' },
      { text: 'Not being able to stop or control worrying' },
      { text: 'Worrying too much about different things' },
      { text: 'Trouble relaxing' },
      { text: 'Being so restless that it\'s hard to sit still' },
      { text: 'Becoming easily annoyed or irritable' },
      { text: 'Feeling afraid as if something awful might happen' }
    ],
    scoring: [
      { max: 4, severity: 'Minimal Anxiety', class: 'success', description: 'Your responses suggest minimal or no anxiety symptoms.' },
      { max: 9, severity: 'Mild Anxiety', class: 'info', description: 'Your responses suggest mild anxiety symptoms.' },
      { max: 14, severity: 'Moderate Anxiety', class: 'warning', description: 'Your responses suggest moderate anxiety symptoms.' },
      { max: 21, severity: 'Severe Anxiety', class: 'danger', description: 'Your responses suggest severe anxiety symptoms.' }
    ]
  }
}

const currentQuestion = computed(() => {
  if (!currentAssessment.value) return null
  return assessments[currentAssessment.value].questions[currentQuestionIndex.value]
})

const progressPercentage = computed(() => {
  if (!currentAssessment.value) return 0
  const total = assessments[currentAssessment.value].questions.length
  return Math.round(((currentQuestionIndex.value + 1) / total) * 100)
})

const resultInterpretation = computed(() => {
  if (!currentAssessment.value) return null

  const assessment = assessments[currentAssessment.value]
  const scoring = assessment.scoring.find(s => totalScore.value <= s.max)

  const baseRecommendations = {
    success: [
      'Continue maintaining healthy lifestyle habits',
      'Stay connected with friends and family',
      'Practice self-care activities regularly',
      'Monitor your mental health over time'
    ],
    info: [
      'Consider talking to a trusted friend or family member',
      'Explore self-help resources and coping strategies',
      'Monitor your symptoms - if they worsen, seek professional help',
      'Practice stress management techniques',
      'Join our community forum for peer support'
    ],
    warning: [
      'Consider scheduling an appointment with a mental health professional',
      'Discuss your symptoms with your GP or school counselor',
      'Use evidence-based self-help resources',
      'Reach out to support services like Beyond Blue or Lifeline',
      'Don\'t wait - early intervention is important'
    ],
    danger: [
      'Strongly recommend seeking professional help immediately',
      'Contact a mental health crisis service or your GP today',
      'Talk to a trusted adult about how you\'re feeling',
      'Call Lifeline (13 11 14) or Kids Helpline (1800 55 1800) for support',
      'Consider going to your nearest emergency department if you\'re in crisis'
    ]
  }

  return {
    severity: scoring.severity,
    description: scoring.description,
    recommendations: baseRecommendations[scoring.class] || baseRecommendations.info
  }
})

const isHighRisk = computed(() => {
  // Check if PHQ-9 question 9 (self-harm) was answered with 2 or 3
  if (currentAssessment.value === 'phq9' && responses.value[8] >= 2) {
    return true
  }
  // Or if total score indicates severe symptoms
  if (totalScore.value >= 15) {
    return true
  }
  return false
})

const resultColorClass = computed(() => {
  if (!currentAssessment.value) return 'bg-primary'
  const assessment = assessments[currentAssessment.value]
  const scoring = assessment.scoring.find(s => totalScore.value <= s.max)
  return 'bg-' + scoring.class
})

const resultTextClass = computed(() => {
  if (!currentAssessment.value) return 'text-primary'
  const assessment = assessments[currentAssessment.value]
  const scoring = assessment.scoring.find(s => totalScore.value <= s.max)
  return 'text-' + scoring.class
})

const resultAlertClass = computed(() => {
  if (!currentAssessment.value) return 'alert-primary'
  const assessment = assessments[currentAssessment.value]
  const scoring = assessment.scoring.find(s => totalScore.value <= s.max)
  return 'alert-' + scoring.class
})

function startAssessment(type) {
  currentAssessment.value = type
  currentQuestionIndex.value = 0
  responses.value = new Array(assessments[type].questions.length).fill(null)
  showResults.value = false
  totalScore.value = 0
}

function selectAnswer(value) {
  responses.value[currentQuestionIndex.value] = value
}

function nextQuestion() {
  if (currentQuestionIndex.value < assessments[currentAssessment.value].questions.length - 1) {
    currentQuestionIndex.value++
  }
}

function previousQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

function submitAssessment() {
  // Calculate total score
  totalScore.value = responses.value.reduce((sum, val) => sum + val, 0)
  showResults.value = true

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelAssessment() {
  if (confirm('Are you sure you want to cancel? Your progress will be lost.')) {
    currentAssessment.value = null
    currentQuestionIndex.value = 0
    responses.value = []
    showResults.value = false
  }
}

async function saveResults() {
  try {
    if (!auth.isAuthenticated) {
      alert('Please log in to save your results to your dashboard.')
      router.push('/login')
      return
    }

    const result = {
      userId: auth.currentUser.uid,
      assessmentType: currentAssessment.value,
      assessmentTitle: assessments[currentAssessment.value].title,
      score: totalScore.value,
      severity: resultInterpretation.value.severity,
      responses: responses.value,
      timestamp: new Date(),
      createdAt: new Date().toISOString()
    }

    await addDoc(collection(db, 'assessmentResults'), result)

    alert('Results saved to your dashboard successfully!')
    router.push('/dashboard')
  } catch (error) {
    console.error('Error saving results:', error)
    alert('Failed to save results. Please try again.')
  }
}

function takeAnotherAssessment() {
  currentAssessment.value = null
  currentQuestionIndex.value = 0
  responses.value = []
  showResults.value = false
  totalScore.value = 0
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.assessment-view {
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

.icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-btn {
  transition: all 0.2s ease;
  border-width: 2px;
}

.option-btn:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.option-btn.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.question-card {
  border: 2px solid #e9ecef;
}

@media (max-width: 768px) {
  .display-5 {
    font-size: 2rem;
  }
}
</style>
