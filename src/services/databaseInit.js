/**
 * Database Initialization Service
 * Generates and stores mock data directly to Firebase Firestore
 */

import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../firebase/config'

// Sample data arrays
const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn',
  'Sage', 'River', 'Phoenix', 'Skyler', 'Blake', 'Cameron', 'Drew', 'Emery',
  'Finley', 'Hayden', 'Jamie', 'Kendall', 'Logan', 'Parker', 'Reese', 'Sage'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris'
]

const mentalHealthTopics = [
  'Anxiety Management', 'Depression Support', 'Stress Relief', 'Self-Care Tips',
  'Coping Strategies', 'Mindfulness Practice', 'Sleep Hygiene', 'Social Skills',
  'Academic Pressure', 'Relationship Issues', 'Career Guidance', 'Life Transitions',
  'Crisis Support', 'Recovery Journey', 'Peer Support', 'Professional Help'
]

const assessmentTypes = ['PHQ-9', 'GAD-7', 'DASS-21', 'Beck Depression Inventory', 'Anxiety Scale']
const appointmentTypes = ['Initial Consultation', 'Follow-up', 'Crisis Support', 'Group Therapy', 'Assessment']
const serviceTypes = ['Counselling', 'Crisis Support', 'Youth Services', 'Online Support', 'Group Therapy']

// Utility functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Generate and store users
export async function initializeUsers() {
  try {
    console.log('Initializing users...')
    
    // Check if users already exist
    const usersSnapshot = await getDocs(collection(db, 'mockUsers'))
    if (!usersSnapshot.empty) {
      console.log('Users already exist, skipping initialization')
      return { success: true, message: 'Users already exist' }
    }

    const users = []
    for (let i = 0; i < 50; i++) {
      const firstName = getRandomElement(firstNames)
      const lastName = getRandomElement(lastNames)
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`
      const registrationDate = getRandomDate(new Date(2023, 0, 1), new Date())
      
      const userData = {
        username: `${firstName}${lastName}${i + 1}`,
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: i < 5 ? 'admin' : 'user',
        registrationDate: registrationDate,
        lastLogin: getRandomDate(new Date(2024, 0, 1), new Date()),
        status: Math.random() > 0.1 ? 'active' : 'inactive',
        age: Math.floor(Math.random() * 12) + 13,
        location: getRandomElement(['Melbourne', 'Sydney', 'Brisbane', 'Perth', 'Adelaide']),
        totalPosts: Math.floor(Math.random() * 20),
        totalAssessments: Math.floor(Math.random() * 10),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'mockUsers'), userData)
      users.push({ id: docRef.id, ...userData })
    }

    console.log(`Successfully initialized ${users.length} users`)
    return { success: true, message: `Initialized ${users.length} users`, data: users }
  } catch (error) {
    console.error('Error initializing users:', error)
    return { success: false, message: error.message }
  }
}

// Generate and store forum posts
export async function initializePosts() {
  try {
    console.log('Initializing forum posts...')
    
    const postsSnapshot = await getDocs(collection(db, 'mockPosts'))
    if (!postsSnapshot.empty) {
      console.log('Posts already exist, skipping initialization')
      return { success: true, message: 'Posts already exist' }
    }

    const posts = []
    for (let i = 0; i < 100; i++) {
      const author = getRandomElement(firstNames) + ' ' + getRandomElement(lastNames)
      const topic = getRandomElement(mentalHealthTopics)
      const postDate = getRandomDate(new Date(2023, 6, 1), new Date())
      const ratingCount = Math.floor(Math.random() * 15) + 1
      const avgRating = (Math.random() * 2 + 3).toFixed(1)
      
      const postData = {
        title: `${topic}: ${getRandomElement(['Tips', 'Experience', 'Question', 'Support', 'Advice'])}`,
        author: author,
        content: `This is a detailed post about ${topic.toLowerCase()}. The user is sharing their experience and seeking advice from the community. This post contains valuable insights and personal stories that can help others facing similar challenges.`,
        summary: `Discussion about ${topic.toLowerCase()} with community support and shared experiences.`,
        category: getRandomElement(['General', 'Anxiety', 'Depression', 'Stress', 'Recovery']),
        tags: [topic, getRandomElement(['Support', 'Advice', 'Experience', 'Help']), 'Community'],
        ratingCount: ratingCount,
        avgRating: parseFloat(avgRating),
        views: Math.floor(Math.random() * 200) + 10,
        replies: Math.floor(Math.random() * 10),
        isPinned: Math.random() > 0.9,
        status: Math.random() > 0.05 ? 'published' : 'draft',
        createdAt: postDate,
        updatedAt: postDate,
        timestamp: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'mockPosts'), postData)
      posts.push({ id: docRef.id, ...postData })
    }

    console.log(`Successfully initialized ${posts.length} posts`)
    return { success: true, message: `Initialized ${posts.length} posts`, data: posts }
  } catch (error) {
    console.error('Error initializing posts:', error)
    return { success: false, message: error.message }
  }
}

// Generate and store assessments
export async function initializeAssessments() {
  try {
    console.log('Initializing assessments...')
    
    const assessmentsSnapshot = await getDocs(collection(db, 'mockAssessments'))
    if (!assessmentsSnapshot.empty) {
      console.log('Assessments already exist, skipping initialization')
      return { success: true, message: 'Assessments already exist' }
    }

    const assessments = []
    for (let i = 0; i < 200; i++) {
      const userId = `user_${Math.floor(Math.random() * 50) + 1}`
      const assessmentType = getRandomElement(assessmentTypes)
      const completedDate = getRandomDate(new Date(2023, 6, 1), new Date())
      const totalScore = Math.floor(Math.random() * 27) + 0
      
      let severity = 'Minimal'
      if (totalScore >= 20) severity = 'Severe'
      else if (totalScore >= 15) severity = 'Moderately Severe'
      else if (totalScore >= 10) severity = 'Moderate'
      else if (totalScore >= 5) severity = 'Mild'
      
      const assessmentData = {
        userId: userId,
        assessmentType: assessmentType,
        totalScore: totalScore,
        severity: severity,
        completedDate: completedDate,
        duration: Math.floor(Math.random() * 15) + 5,
        isCompleted: true,
        recommendations: [
          'Consider speaking with a mental health professional',
          'Practice mindfulness and relaxation techniques',
          'Maintain regular sleep schedule',
          'Engage in physical activity'
        ],
        followUpRequired: totalScore >= 10,
        riskLevel: totalScore >= 15 ? 'High' : totalScore >= 10 ? 'Medium' : 'Low',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'mockAssessments'), assessmentData)
      assessments.push({ id: docRef.id, ...assessmentData })
    }

    console.log(`Successfully initialized ${assessments.length} assessments`)
    return { success: true, message: `Initialized ${assessments.length} assessments`, data: assessments }
  } catch (error) {
    console.error('Error initializing assessments:', error)
    return { success: false, message: error.message }
  }
}

// Generate and store appointments
export async function initializeAppointments() {
  try {
    console.log('Initializing appointments...')
    
    const appointmentsSnapshot = await getDocs(collection(db, 'mockAppointments'))
    if (!appointmentsSnapshot.empty) {
      console.log('Appointments already exist, skipping initialization')
      return { success: true, message: 'Appointments already exist' }
    }

    const appointments = []
    for (let i = 0; i < 150; i++) {
      const userId = `user_${Math.floor(Math.random() * 50) + 1}`
      const appointmentDate = getRandomDate(new Date(2024, 0, 1), new Date(2024, 11, 31))
      const appointmentType = getRandomElement(appointmentTypes)
      const duration = appointmentType === 'Group Therapy' ? 60 : 30
      const statuses = ['Scheduled', 'Completed', 'Cancelled', 'No-show']
      
      const appointmentData = {
        userId: userId,
        clientName: getRandomElement(firstNames) + ' ' + getRandomElement(lastNames),
        appointmentType: appointmentType,
        scheduledDate: appointmentDate,
        duration: duration,
        status: getRandomElement(statuses),
        counselor: `Dr. ${getRandomElement(lastNames)}`,
        location: getRandomElement(['Room 101', 'Room 102', 'Online', 'Group Room A']),
        notes: appointmentType === 'Crisis Support' ? 'Urgent support needed' : 'Regular session',
        isOnline: Math.random() > 0.7,
        reminderSent: Math.random() > 0.3,
        followUpRequired: appointmentType === 'Initial Consultation',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'mockAppointments'), appointmentData)
      appointments.push({ id: docRef.id, ...appointmentData })
    }

    console.log(`Successfully initialized ${appointments.length} appointments`)
    return { success: true, message: `Initialized ${appointments.length} appointments`, data: appointments }
  } catch (error) {
    console.error('Error initializing appointments:', error)
    return { success: false, message: error.message }
  }
}

// Generate and store services
export async function initializeServices() {
  try {
    console.log('Initializing services...')
    
    const servicesSnapshot = await getDocs(collection(db, 'mockServices'))
    if (!servicesSnapshot.empty) {
      console.log('Services already exist, skipping initialization')
      return { success: true, message: 'Services already exist' }
    }

    const serviceNames = [
      'Headspace', 'Beyond Blue', 'Lifeline', 'Kids Helpline', 'Orygen',
      'Mind Australia', 'SANE Australia', 'ReachOut', 'Black Dog Institute',
      'Mental Health Foundation', 'Youth Focus', 'Mission Australia'
    ]

    const services = []
    for (let i = 0; i < 30; i++) {
      const serviceName = getRandomElement(serviceNames)
      const serviceType = getRandomElement(serviceTypes)
      const locations = [
        'Melbourne CBD', 'Richmond', 'Fitzroy', 'Carlton', 'Southbank',
        'St Kilda', 'Prahran', 'South Yarra', 'Toorak', 'Hawthorn'
      ]
      
      const serviceData = {
        name: serviceName,
        type: serviceType,
        location: getRandomElement(locations),
        address: `${Math.floor(Math.random() * 999) + 1} ${getRandomElement(['Collins St', 'Bourke St', 'Swanston St', 'Flinders St', 'Elizabeth St'])}`,
        phone: `(03) ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`,
        email: `contact@${serviceName.toLowerCase().replace(/\s+/g, '')}.org.au`,
        website: `https://www.${serviceName.toLowerCase().replace(/\s+/g, '')}.org.au`,
        description: `${serviceName} provides ${serviceType.toLowerCase()} services for youth mental health support.`,
        hours: 'Mon-Fri 9AM-5PM',
        isOnline: Math.random() > 0.6,
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviewCount: Math.floor(Math.random() * 50) + 5,
        cost: Math.random() > 0.5 ? 'Free' : '$50-100 per session',
        accessibility: ['Wheelchair accessible', 'Sign language interpreter available'],
        languages: ['English', 'Mandarin', 'Arabic', 'Vietnamese'],
        ageRange: '13-25 years',
        emergencySupport: serviceType === 'Crisis Support',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'mockServices'), serviceData)
      services.push({ id: docRef.id, ...serviceData })
    }

    console.log(`Successfully initialized ${services.length} services`)
    return { success: true, message: `Initialized ${services.length} services`, data: services }
  } catch (error) {
    console.error('Error initializing services:', error)
    return { success: false, message: error.message }
  }
}

// Initialize all data
export async function initializeAllData() {
  try {
    console.log('Starting database initialization...')
    
    const results = {
      users: await initializeUsers(),
      posts: await initializePosts(),
      assessments: await initializeAssessments(),
      appointments: await initializeAppointments(),
      services: await initializeServices()
    }

    const allSuccess = Object.values(results).every(result => result.success)
    
    if (allSuccess) {
      console.log('Database initialization completed successfully!')
      return { 
        success: true, 
        message: 'All data initialized successfully',
        results: results
      }
    } else {
      console.error('Some data initialization failed')
      return { 
        success: false, 
        message: 'Some data initialization failed',
        results: results
      }
    }
  } catch (error) {
    console.error('Error during database initialization:', error)
    return { success: false, message: error.message }
  }
}

// Check if data exists
export async function checkDataExists() {
  try {
    const [usersSnapshot, postsSnapshot, assessmentsSnapshot, appointmentsSnapshot, servicesSnapshot] = await Promise.all([
      getDocs(collection(db, 'mockUsers')),
      getDocs(collection(db, 'mockPosts')),
      getDocs(collection(db, 'mockAssessments')),
      getDocs(collection(db, 'mockAppointments')),
      getDocs(collection(db, 'mockServices'))
    ])

    return {
      users: !usersSnapshot.empty,
      posts: !postsSnapshot.empty,
      assessments: !assessmentsSnapshot.empty,
      appointments: !appointmentsSnapshot.empty,
      services: !servicesSnapshot.empty,
      totalUsers: usersSnapshot.size,
      totalPosts: postsSnapshot.size,
      totalAssessments: assessmentsSnapshot.size,
      totalAppointments: appointmentsSnapshot.size,
      totalServices: servicesSnapshot.size
    }
  } catch (error) {
    console.error('Error checking data existence:', error)
    return { error: error.message }
  }
}

export default {
  initializeUsers,
  initializePosts,
  initializeAssessments,
  initializeAppointments,
  initializeServices,
  initializeAllData,
  checkDataExists
}
