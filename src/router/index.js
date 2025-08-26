import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const ForumView = () => import('../views/ForumView.vue')
const MapView = () => import('../views/MapView.vue')
const LoginView = () => import('../views/LoginView.vue')
const RegisterView = () => import('../views/RegisterView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/forum' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/forum', name: 'forum', component: ForumView, meta: { requiresAuth: true, roles: ['user', 'admin'] } },
    { path: '/map', name: 'map', component: MapView, meta: { requiresAuth: true, roles: ['user', 'admin'] } },
  ],
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  auth.load()
  if (to.meta?.requiresAuth) {
    if (!auth.currentUser) {
      return next({ name: 'login' })
    }
    if (to.meta.roles && !to.meta.roles.includes(auth.currentUser.role)) {
      return next({ name: 'forum' })
    }
  }
  next()
})

export default router
