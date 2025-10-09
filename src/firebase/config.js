// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpJ9lIVcDPdp5IlJuqBxVBXV4P4NAW_bk",
  authDomain: "fit5032-youthwell-project.firebaseapp.com",
  projectId: "fit5032-youthwell-project",
  storageBucket: "fit5032-youthwell-project.firebasestorage.app",
  messagingSenderId: "490878725011",
  appId: "1:490878725011:web:9aec1778a989059c3f1666",
  measurementId: "G-X44N526509"
}

// Initialize Firebase
let app
let auth
let db

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)

  // Optional: Connect to emulators in development
  // Uncomment these lines if you're using Firebase Emulators
  // if (import.meta.env.DEV) {
  //   connectAuthEmulator(auth, 'http://localhost:9099')
  //   connectFirestoreEmulator(db, 'localhost', 8080)
  // }

  console.log('Firebase initialized successfully')
} catch (error) {
  console.error('Firebase initialization error:', error)
}

export { app, auth, db }
