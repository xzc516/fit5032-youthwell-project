/**
 * Mock Data Generator for DataTable Demonstration
 * Generates realistic test data to showcase pagination, sorting, and search features
 */

// Sample data pools
const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Sophia', 'James', 'Isabella', 'Oliver',
  'Charlotte', 'Benjamin', 'Amelia', 'Elijah', 'Mia', 'Lucas', 'Harper', 'Mason', 'Evelyn', 'Logan',
  'Abigail', 'Alexander', 'Emily', 'Ethan', 'Ella', 'Jacob', 'Madison', 'Michael', 'Scarlett', 'Daniel',
  'Victoria', 'Henry', 'Aria', 'Jackson', 'Grace', 'Sebastian', 'Chloe', 'Aiden', 'Camila', 'Matthew',
  'Penelope', 'Samuel', 'Riley', 'David', 'Layla', 'Joseph', 'Lillian', 'Carter', 'Nora', 'Owen'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
]

const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com']

const postTitles = [
  'Dealing with anxiety at university',
  'Tips for managing stress during exams',
  'How I overcame social anxiety',
  'My journey with depression',
  'Finding balance in life',
  'Coping with family pressure',
  'Mindfulness techniques that helped me',
  'Struggling with perfectionism',
  'How to talk about mental health',
  'My experience with therapy',
  'Dealing with loneliness',
  'Managing work-life balance',
  'Overcoming fear of failure',
  'Finding motivation when feeling low',
  'Tips for better sleep',
  'Exercise and mental health',
  'Dealing with academic pressure',
  'How I found my support network',
  'Managing panic attacks',
  'Self-care routines that work',
  'Breaking the stigma around mental health',
  'Dealing with grief and loss',
  'Finding purpose and meaning',
  'Managing digital overwhelm',
  'Tips for healthy relationships'
]

const postContentSnippets = [
  'I wanted to share my experience with everyone here because I know many of us struggle with similar issues...',
  'After months of trying different approaches, I finally found something that works for me...',
  'This is something I wish someone had told me earlier in my journey...',
  'I hope this can help someone who is going through what I went through...',
  'Mental health is a journey, not a destination. Here\'s what I learned along the way...',
  'It took me a while to realize that it\'s okay to ask for help. Here\'s my story...',
  'I want to share some practical tips that have made a real difference in my daily life...',
  'Remember that everyone\'s journey is different, but we\'re all in this together...',
  'These are the strategies that helped me during my darkest times...',
  'If you\'re struggling right now, please know that you\'re not alone. Here\'s what helped me...'
]

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Get a random item from an array
 */
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Generate a random date between start and end dates
 */
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

/**
 * Generate mock users
 * @param {number} count - Number of users to generate
 * @returns {Array} Array of mock user objects
 */
export function generateMockUsers(count = 50) {
  const users = []
  const usedUsernames = new Set()

  for (let i = 0; i < count; i++) {
    const firstName = randomItem(firstNames)
    const lastName = randomItem(lastNames)
    let username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`

    // Ensure unique usernames
    let counter = 1
    while (usedUsernames.has(username)) {
      username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}${counter}`
      counter++
    }
    usedUsernames.add(username)

    const email = `${username}@${randomItem(domains)}`
    const role = Math.random() < 0.1 ? 'admin' : 'user' // 10% admins
    const createdAt = randomDate(new Date(2023, 0, 1), new Date())

    users.push({
      id: `mock_user_${i + 1}`,
      username,
      email,
      role,
      createdAt: {
        seconds: Math.floor(createdAt.getTime() / 1000),
        nanoseconds: 0
      },
      displayName: `${firstName} ${lastName}`,
      lastLogin: {
        seconds: Math.floor(randomDate(new Date(2024, 0, 1), new Date()).getTime() / 1000),
        nanoseconds: 0
      }
    })
  }

  return users
}

/**
 * Generate mock forum posts
 * @param {number} count - Number of posts to generate
 * @param {Array} users - Array of users to use as authors
 * @returns {Array} Array of mock post objects
 */
export function generateMockPosts(count = 30, users = []) {
  const posts = []

  // Use provided users or generate author names
  const authors = users.length > 0
    ? users.map(u => u.username)
    : Array.from({ length: 20 }, (_, i) => `user_${i + 1}`)

  for (let i = 0; i < count; i++) {
    const title = randomItem(postTitles)
    const author = randomItem(authors)
    const summary = randomItem(postContentSnippets) + ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    const timestamp = randomDate(new Date(2024, 0, 1), new Date()).toISOString()

    // Generate random ratings
    const ratingCount = randomInt(0, 50)
    const ratings = {}
    for (let j = 0; j < ratingCount; j++) {
      const userId = `user_${randomInt(1, 100)}`
      ratings[userId] = randomInt(1, 5)
    }

    // Calculate average rating
    const ratingValues = Object.values(ratings)
    const avgRating = ratingValues.length > 0
      ? (ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length).toFixed(1)
      : '0.0'

    posts.push({
      id: `mock_post_${i + 1}`,
      title: `${title} ${i > 24 ? `(Part ${i - 24})` : ''}`, // Make titles unique
      author,
      summary,
      timestamp,
      ratings,
      avgRating: parseFloat(avgRating),
      ratingCount
    })
  }

  return posts
}

/**
 * Generate mock assessment results
 * @param {number} count - Number of assessments to generate
 * @param {string} userId - User ID to associate assessments with
 * @returns {Array} Array of mock assessment objects
 */
export function generateMockAssessments(count = 20, userId = 'mock_user_1') {
  const assessments = []
  const assessmentTypes = ['PHQ-9', 'GAD-7']

  for (let i = 0; i < count; i++) {
    const type = randomItem(assessmentTypes)
    const score = type === 'PHQ-9' ? randomInt(0, 27) : randomInt(0, 21)
    const timestamp = randomDate(new Date(2024, 0, 1), new Date())

    let severity
    if (type === 'PHQ-9') {
      if (score <= 4) severity = 'Minimal'
      else if (score <= 9) severity = 'Mild'
      else if (score <= 14) severity = 'Moderate'
      else if (score <= 19) severity = 'Moderately Severe'
      else severity = 'Severe'
    } else {
      if (score <= 4) severity = 'Minimal'
      else if (score <= 9) severity = 'Mild'
      else if (score <= 14) severity = 'Moderate'
      else severity = 'Severe'
    }

    assessments.push({
      id: `mock_assessment_${i + 1}`,
      userId,
      type,
      score,
      severity,
      timestamp: {
        seconds: Math.floor(timestamp.getTime() / 1000),
        nanoseconds: 0
      },
      createdAt: timestamp.toISOString()
    })
  }

  return assessments.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
}

/**
 * Generate mock appointments
 * @param {number} count - Number of appointments to generate
 * @param {string} userId - User ID to associate appointments with
 * @returns {Array} Array of mock appointment objects
 */
export function generateMockAppointments(count = 15, userId = 'mock_user_1') {
  const appointments = []
  const serviceTypes = [
    'Individual Counseling',
    'Group Therapy',
    'Crisis Intervention',
    'Mental Health Assessment',
    'Family Counseling',
    'Cognitive Behavioral Therapy',
    'Mindfulness Session'
  ]
  const statuses = ['confirmed', 'completed', 'cancelled']

  for (let i = 0; i < count; i++) {
    const serviceType = randomItem(serviceTypes)
    const start = randomDate(new Date(2024, 0, 1), new Date(2025, 11, 31))
    const duration = randomItem([30, 60, 90])
    const end = new Date(start.getTime() + duration * 60000)

    appointments.push({
      id: `mock_appointment_${i + 1}`,
      userId,
      username: 'mock_user',
      serviceType,
      start: start.toISOString(),
      end: end.toISOString(),
      duration,
      notes: 'Generated mock appointment for testing purposes',
      status: randomItem(statuses),
      createdAt: randomDate(new Date(2023, 0, 1), start)
    })
  }

  return appointments.sort((a, b) => new Date(a.start) - new Date(b.start))
}

/**
 * Clear all mock data (optional - for cleanup)
 */
export function clearMockData() {
  console.log('Mock data cleared (client-side only)')
}

// Export default object with all functions
export default {
  generateMockUsers,
  generateMockPosts,
  generateMockAssessments,
  generateMockAppointments,
  clearMockData
}
