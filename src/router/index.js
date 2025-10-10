import { createRouter, createWebHistory } from 'vue-router'
import { useFirebaseAuthStore } from '../stores/firebaseAuth'
import HomeView from '../views/HomeView.vue'
import ForumView from '../views/ForumView.vue'
import LoginView from '../views/LoginView.vue'
import MapViewImproved from '../views/MapViewImproved.vue'
import RegisterView from '../views/RegisterView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import AdminDashboardEnhanced from '../views/AdminDashboardEnhanced.vue'
import AssessmentView from '../views/AssessmentView.vue'
import ResourcesView from '../views/ResourcesView.vue'
import DashboardView from '../views/DashboardView.vue'
import ChatbotView from '../views/ChatbotView.vue'
import AppointmentView from '../views/AppointmentView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/forum',
      name: 'forum',
      component: ForumView,
      meta: { requiresAuth: true, roles: ['user', 'admin'] }
    },
    {
      path: '/assessment',
      name: 'assessment',
      component: AssessmentView,
      meta: { requiresAuth: true, roles: ['user', 'admin'] }
    },
    {
      path: '/resources',
      name: 'resources',
      component: ResourcesView,
      meta: { requiresAuth: true, roles: ['user', 'admin'] }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true, roles: ['user', 'admin'] }
    },
    {
      path: '/map',
      name: 'map',
      component: MapViewImproved,
      meta: { requiresAuth: true, roles: ['user', 'admin'] }
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboardEnhanced,
      meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
      path: '/chatbot',
      name: 'chatbot',
      component: ChatbotView,
      meta: { requiresAuth: true, roles: ['user', 'admin'] }
    },
    {
      path: '/appointments',
      name: 'appointments',
      component: AppointmentView,
      meta: { requiresAuth: true, roles: ['user', 'admin'] }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    }
  ]
})

// Route guards - implement role-based access control
router.beforeEach(async (to, from, next) => {
  const auth = useFirebaseAuthStore()

  // Wait for Firebase Auth to initialize (only on first navigation)
  if (!auth.isInitialized) {
    await auth.initAuth()
  }

  // If user is logged in but tries to access login/register pages, redirect based on role
  if (auth.isAuthenticated && (to.path === '/login' || to.path === '/register' || to.path === '/')) {
    const defaultRoute = auth.currentUser?.role === 'admin' ? '/admin' : '/forum'
    next(defaultRoute)
    return
  }

  // If page requires authentication
  if (to.meta.requiresAuth) {
    // Check if user is logged in
    if (!auth.isAuthenticated) {
      // Save the page user wanted to access
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // If route specifies roles, enforce role-based access
    if (Array.isArray(to.meta.roles) && to.meta.roles.length > 0) {
      const userRole = auth.currentUser?.role
      if (!userRole || !to.meta.roles.includes(userRole)) {
        // Not authorised for this route - redirect based on role
        const fallbackRoute = userRole === 'admin' ? '/admin' : '/forum'
        next(fallbackRoute)
        return
      }
    }
  }

  next()
})

export default router
