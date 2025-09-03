import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import ForumView from '../views/ForumView.vue'
import LoginView from '../views/LoginView.vue'
import MapView from '../views/MapView.vue'
import RegisterView from '../views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/forum'
    },
    {
      path: '/forum',
      name: 'forum',
      component: ForumView,
      meta: { requiresAuth: true }
    },
    {
      path: '/map',
      name: 'map',
      component: MapView,
      meta: { requiresAuth: true }
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
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  
  // If page requires authentication
  if (to.meta.requiresAuth) {
    // Check if user is logged in
    if (!auth.isAuthenticated()) {
      // Save the page user wanted to access
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }
  
  // If user is logged in but tries to access login/register pages, redirect to forum
  if (auth.isAuthenticated() && (to.path === '/login' || to.path === '/register')) {
    next('/forum')
    return
  }
  
  next()
})

export default router
