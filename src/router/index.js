import { createRouter, createWebHistory } from 'vue-router'

const ForumView = () => import('../views/ForumView.vue')
const MapView = () => import('../views/MapView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/forum' },
    { path: '/forum', name: 'forum', component: ForumView },
    { path: '/map', name: 'map', component: MapView },
  ],
})

export default router
