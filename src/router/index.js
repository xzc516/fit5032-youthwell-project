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
      meta: { requiresAuth: true, roles: ['user', 'admin'] }
    },
    {
      path: '/map',
      name: 'map',
      component: MapView,
      meta: { requiresAuth: true, roles: ['admin'] }
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

    // If route specifies roles, enforce role-based access
    if (Array.isArray(to.meta.roles) && to.meta.roles.length > 0) {
      const userRole = auth.currentUser?.role
      if (!userRole || !to.meta.roles.includes(userRole)) {
        // Not authorised for this route
        next('/forum')
        return
      }
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
