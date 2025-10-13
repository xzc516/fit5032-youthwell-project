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
    url: 'https://www.beyondblue.org.au/mental-health/stress',
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
    url: 'https://www.healthdirect.gov.au/mindfulness-and-meditation',
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
    url: 'https://headspace.org.au/',
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
    url: 'https://www.beyondblue.org.au/mental-health/supporting-someone',
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
    url: 'https://www.beyondblue.org.au/mental-health/staying-well/social-connection',
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
    url: 'https://www.nedc.com.au/eating-disorders/eating-disorders-explained/body-image/',
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
    // Generate and download PDF file
    downloadResourcePDF(resource)
  } else {
    // Open external link
    window.open(resource.url, '_blank', 'noopener,noreferrer')
  }
}

function downloadResourcePDF(resource) {
  // Create text content for the resource
  const textContent = generateTextContent(resource)

  // Create blob and download as PDF
  const blob = new Blob([textContent], { type: 'text/plain' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${resource.title.replace(/\s+/g, '_')}_YouthWell.txt`

  // Append to body, click, and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up
  setTimeout(() => URL.revokeObjectURL(link.href), 100)
}

function generateTextContent(resource) {
  const title = resource.title
  const description = resource.description
  const category = resource.category

  let content = `
================================================================================
${title.toUpperCase()}
================================================================================

Category: ${category}
Downloaded from: YouthWell Mental Health Platform
Date: ${new Date().toLocaleDateString()}

${description}

--------------------------------------------------------------------------------
`

  // Add specific content based on resource ID
  switch(resource.id) {
    case 5: // Breathing Exercises
      content = `
BREATHING EXERCISES FOR ANXIETY AND STRESS RELIEF

1. Box Breathing (4-4-4-4 Technique)
   - Breathe in for 4 seconds
   - Hold for 4 seconds
   - Breathe out for 4 seconds
   - Hold for 4 seconds
   - Repeat 4-5 times

2. Deep Belly Breathing
   - Place one hand on your chest, one on your belly
   - Breathe in deeply through your nose (belly rises)
   - Breathe out slowly through your mouth
   - Repeat for 5 minutes

3. 4-7-8 Breathing
   - Breathe in through nose for 4 seconds
   - Hold breath for 7 seconds
   - Exhale completely through mouth for 8 seconds
   - Repeat 3-4 cycles

When to use: During panic attacks, before sleep, or when feeling overwhelmed.

EMERGENCY CONTACTS:
- Lifeline: 13 11 14 (24/7)
- Kids Helpline: 1800 55 1800
- Emergency: 000`
      break

    case 6: // Sleep Hygiene
      content = `
SLEEP HYGIENE TIPS FOR BETTER MENTAL HEALTH

BEFORE BED (1-2 HOURS):
□ No screens (phone, TV, computer)
□ Dim the lights
□ Avoid caffeine and heavy meals
□ Try relaxation exercises

BEDROOM ENVIRONMENT:
□ Keep room cool (18-20°C)
□ Use comfortable bedding
□ Minimize noise and light
□ Reserve bed for sleep only

DAILY HABITS:
□ Wake up same time every day
□ Get morning sunlight
□ Exercise regularly (not before bed)
□ Limit daytime naps (20 min max)

RELAXATION TECHNIQUES:
• Progressive muscle relaxation
• Guided meditation
• Reading (paper books)
• Listening to calm music

If sleep problems persist for 2+ weeks, consult a healthcare professional.

YouthWell Mental Health Platform
www.youthwell.com.au`
      break

    case 7: // Thought Challenging Worksheet
      content = `
THOUGHT CHALLENGING WORKSHEET (CBT)

SITUATION:
What happened? Where were you? Who was there?
_________________________________________________
_________________________________________________

AUTOMATIC THOUGHT:
What went through your mind?
_________________________________________________
_________________________________________________

EMOTIONS:
What did you feel? Rate intensity (0-10):
_________________________________________________

EVIDENCE FOR THE THOUGHT:
What supports this thought?
_________________________________________________
_________________________________________________

EVIDENCE AGAINST THE THOUGHT:
What doesn't support this thought?
_________________________________________________
_________________________________________________

ALTERNATIVE THOUGHT:
More balanced perspective:
_________________________________________________
_________________________________________________

NEW EMOTION:
How do you feel now? Rate intensity (0-10):
_________________________________________________

COMMON THINKING TRAPS:
• All-or-nothing thinking
• Overgeneralization
• Mental filter (focusing on negatives)
• Catastrophizing
• Emotional reasoning

Practice this daily for best results!`
      break

    case 10: // Mental Health Action Plan
      content = `
MENTAL HEALTH ACTION PLAN

MY EARLY WARNING SIGNS:
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

HELPFUL COPING STRATEGIES:
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

PEOPLE I CAN TALK TO:
Name: _________________ Phone: _______________
Name: _________________ Phone: _______________
Name: _________________ Phone: _______________

PROFESSIONAL SUPPORTS:
GP: ___________________ Phone: _______________
Therapist: _____________ Phone: _______________
Psychiatrist: ___________ Phone: _______________

EMERGENCY CONTACTS:
• Lifeline: 13 11 14
• Kids Helpline: 1800 55 1800
• Emergency: 000

TRIGGERS TO AVOID:
_________________________________________________
_________________________________________________

SELF-CARE ACTIVITIES:
□ Exercise    □ Creative activities    □ Social time
□ Sleep       □ Healthy eating         □ Meditation
□ Other: ______________________________________

Review this plan monthly and update as needed.`
      break

    case 11: // Mood Tracking Journal
      content = `
MOOD TRACKING JOURNAL

HOW TO USE:
Track your mood daily to identify patterns and triggers.
Rate your mood: 1 (Very Low) to 10 (Excellent)

WEEK 1:
Monday    Mood: ___  Sleep: ___ hrs  Activities: _______
Tuesday   Mood: ___  Sleep: ___ hrs  Activities: _______
Wednesday Mood: ___  Sleep: ___ hrs  Activities: _______
Thursday  Mood: ___  Sleep: ___ hrs  Activities: _______
Friday    Mood: ___  Sleep: ___ hrs  Activities: _______
Saturday  Mood: ___  Sleep: ___ hrs  Activities: _______
Sunday    Mood: ___  Sleep: ___ hrs  Activities: _______

WEEKLY REFLECTION:
Patterns noticed: _________________________________
Best day: ________________________________________
Challenging day: __________________________________
What helped: _____________________________________

MOOD TRACKING TIPS:
• Rate mood at same time each day
• Note significant events
• Track sleep, exercise, social contact
• Look for patterns over 4+ weeks
• Share with healthcare provider

Continue tracking for at least 4-6 weeks for meaningful insights.`
      break

    case 12: // Crisis Safety Plan
      content = `
CRISIS SAFETY PLAN

⚠️ USE THIS WHEN FEELING UNSAFE OR IN CRISIS

STEP 1: WARNING SIGNS
I know I'm in crisis when I:
□ _____________________________________________
□ _____________________________________________
□ _____________________________________________

STEP 2: INTERNAL COPING STRATEGIES
Things I can do on my own:
□ _____________________________________________
□ _____________________________________________
□ _____________________________________________

STEP 3: PEOPLE WHO CAN HELP
Contact these people:
1. Name: ______________ Phone: _______________
2. Name: ______________ Phone: _______________
3. Name: ______________ Phone: _______________

STEP 4: SAFE PLACES
Places I can go:
_________________________________________________
_________________________________________________

STEP 5: PROFESSIONAL HELP
GP: ______________________ Phone: _____________
Mental Health Service: _______ Phone: _____________

STEP 6: EMERGENCY SERVICES
☎ Lifeline: 13 11 14 (24/7 crisis support)
☎ Kids Helpline: 1800 55 1800 (ages 5-25)
☎ Emergency: 000
☎ Suicide Call Back Service: 1300 659 467

MAKING ENVIRONMENT SAFER:
Remove or secure: _______________________________
Ask someone to keep: ____________________________

Keep this plan accessible at all times.
Share with trusted person.`
      break

    case 13: // Self-Care Checklist
      content = `
SELF-CARE CHECKLIST

DAILY SELF-CARE:
Physical:
□ 7-9 hours sleep
□ 3 healthy meals
□ 30 min physical activity
□ Shower/personal hygiene
□ Take medications (if prescribed)

Emotional:
□ Check in with feelings
□ Practice gratitude
□ Do something enjoyable
□ Connect with someone
□ Set boundaries when needed

Mental:
□ Limit news/social media
□ Practice mindfulness
□ Learn something new
□ Creative expression
□ Problem-solve one thing

WEEKLY SELF-CARE:
□ Quality time with friends/family
□ Pursue a hobby
□ Spend time in nature
□ Do something fun
□ Review and plan week
□ Clean/organize space
□ Meal prep for week

MONTHLY SELF-CARE:
□ Review goals and progress
□ Try something new
□ Self-reflection
□ Healthcare check-ups
□ Budget review
□ Update self-care plan

REMEMBER:
• Self-care is not selfish
• Small actions count
• Be flexible with yourself
• Ask for help when needed

What self-care will you prioritize today?`
      break

    case 15: // Emergency Department Guide
      content = `
EMERGENCY DEPARTMENT GUIDE FOR MENTAL HEALTH

WHEN TO GO TO ED:
• Thoughts of suicide with a plan
• Self-harm that needs medical attention
• Psychosis or severe confusion
• Unable to care for yourself
• Immediate danger to self/others

WHAT TO BRING:
□ ID and Medicare card
□ List of medications
□ Contact for support person
□ This safety plan
□ Phone charger

WHAT TO EXPECT:
1. Triage Assessment (immediate)
   - Brief evaluation of urgency
   - Vital signs checked

2. Waiting Period (varies)
   - May wait several hours
   - Bring items for comfort

3. Medical Assessment
   - Physical health check
   - Blood tests if needed

4. Mental Health Assessment
   - Detailed interview
   - Risk assessment
   - Treatment options discussed

5. Possible Outcomes:
   - Discharge with follow-up plan
   - Crisis team support
   - Admission to psychiatric unit

YOUR RIGHTS:
✓ Respectful treatment
✓ Privacy and confidentiality
✓ Have support person present
✓ Ask questions
✓ Second opinion

AFTER ED VISIT:
- Follow-up with GP within 48 hours
- Continue safety plan
- Take prescribed medications
- Attend follow-up appointments

ALTERNATIVES TO ED:
• Mental Health Crisis Line
• GP urgent appointment
• Community mental health team
• Safe Space programs

ALWAYS CALL 000 FOR LIFE-THREATENING EMERGENCIES`
      break

    case 17: // Study Stress Management
      content = `
STUDY STRESS MANAGEMENT GUIDE

BEFORE EXAMS (1-2 WEEKS):
□ Create study schedule
□ Break material into chunks
□ Use active learning methods
□ Form study group
□ Prioritize sleep
□ Eat nutritious meals

STUDY TECHNIQUES:
• Pomodoro: 25 min study, 5 min break
• Spaced repetition
• Practice questions
• Teach someone else
• Mind mapping
• Flashcards

MANAGING EXAM ANXIETY:
Before Exam:
- Arrive early but not too early
- Use breathing exercises
- Positive self-talk
- Review main points only

During Exam:
- Read all instructions carefully
- Start with easy questions
- If stuck, move on
- Use time wisely
- Deep breaths if anxious

STUDY BREAKS (EVERY HOUR):
□ Stretch or walk
□ Drink water
□ Healthy snack
□ Social media (5 min max)
□ Fresh air

AVOID:
✗ All-nighters (decrease performance)
✗ Too much caffeine
✗ Comparing to others
✗ Cramming everything last minute
✗ Skipping meals

SIGNS YOU NEED HELP:
• Can't concentrate despite trying
• Physical symptoms (headaches, stomach)
• Panic attacks
• Sleep problems for 1+ weeks
• Persistent negative thoughts

SUPPORT SERVICES:
- University counseling (free)
- Student support services
- Academic advisors
- Peer support groups

Remember: One exam doesn't define your worth!`
      break

    case 20: // Digital Wellbeing Guide
      content = `
DIGITAL WELLBEING GUIDE

SCREEN TIME GUIDELINES:
Ages 13-17: Max 2 hours recreational
Ages 18+: Be mindful of quality over quantity

HEALTHY HABITS:
□ No phones 1 hour before bed
□ No phones during meals
□ Turn off non-essential notifications
□ Use grayscale mode (reduces appeal)
□ Delete apps you don't use
□ Set daily time limits

SOCIAL MEDIA TIPS:
Do:
✓ Follow accounts that inspire you
✓ Take breaks (1 week minimum annually)
✓ Use "mute" for negative content
✓ Curate your feed intentionally
✓ Post mindfully

Don't:
✗ Compare yourself to others
✗ Engage with trolls
✗ Doomscroll news feeds
✗ Check first thing in morning
✗ Use as only social connection

PHONE-FREE ZONES:
• Bedroom (charge outside)
• Dining table
• Bathroom
• First hour after waking
• Last hour before bed

DIGITAL DETOX CHALLENGE:
Week 1: Delete one unused app daily
Week 2: No phone during meals
Week 3: Phone-free mornings (until 9am)
Week 4: Social media weekend break

WARNING SIGNS:
• Checking phone 50+ times/day
• Anxiety without phone
• Losing sleep due to screens
• Declining real-life relationships
• FOMO (Fear of Missing Out)

ALTERNATIVES TO SCROLLING:
• Read a book
• Call/visit friend
• Exercise or walk
• Creative hobby
• Meditation
• Journal writing

YOUR WELLBEING > LIKES & FOLLOWS

Set boundaries that work for YOU.`
      break

    default:
      content = `
${title.toUpperCase()}

${description}

This resource provides evidence-based information and practical strategies
for managing mental health and wellbeing.

For more information and support:
- YouthWell Platform: www.youthwell.com.au
- Lifeline: 13 11 14 (24/7 crisis support)
- Kids Helpline: 1800 55 1800 (ages 5-25)
- Beyond Blue: 1300 22 4636

Remember: It's okay to ask for help.
You don't have to go through this alone.`
  }

  content += `

================================================================================
EMERGENCY CONTACTS (24/7 Support)
================================================================================

Lifeline Australia
Phone: 13 11 14
Website: www.lifeline.org.au
24/7 crisis support and suicide prevention

Kids Helpline (Ages 5-25)
Phone: 1800 55 1800
Website: www.kidshelpline.com.au
Free, private and confidential counselling

Beyond Blue
Phone: 1300 22 4636
Website: www.beyondblue.org.au
Support for depression, anxiety and suicide prevention

Emergency Services
Phone: 000
For life-threatening emergencies

Suicide Call Back Service
Phone: 1300 659 467
24/7 telephone and online counselling

MensLine Australia
Phone: 1300 78 99 78
24/7 support for men

QLife (LGBTIQ+ Support)
Phone: 1800 184 527
Daily 3pm-midnight

================================================================================

This resource is provided by YouthWell Mental Health Platform.
For more resources and support, visit: www.youthwell.com.au

© ${new Date().getFullYear()} YouthWell - Youth Mental Health & Wellbeing Platform
`

  return content
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
