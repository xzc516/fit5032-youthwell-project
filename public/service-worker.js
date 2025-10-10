/**
 * YouthWell Service Worker
 * Provides offline functionality for mental health assessments
 */

const CACHE_NAME = 'youthwell-v1'
const RUNTIME_CACHE = 'youthwell-runtime-v1'

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
            })
            .map(cacheName => caches.delete(cacheName))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => {
          return caches.match(request)
            .then(cached => cached || new Response('Offline - API unavailable'))
        })
    )
    return
  }

  // HTML pages - network first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(request)
            .then(cached => cached || caches.match('/offline.html'))
        })
    )
    return
  }

  // Other resources - cache first, network fallback
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          return cached
        }

        return fetch(request)
          .then(response => {
            // Don't cache POST requests or non-successful responses
            if (request.method !== 'GET' || !response || response.status !== 200) {
              return response
            }

            const responseClone = response.clone()
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(request, responseClone)
            })

            return response
          })
      })
  )
})

// Background sync for offline assessment submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-assessments') {
    event.waitUntil(syncAssessments())
  }
})

async function syncAssessments() {
  try {
    // Get pending assessments from IndexedDB
    const db = await openIndexedDB()
    const assessments = await db.getAll('pendingAssessments')

    for (const assessment of assessments) {
      try {
        // Send to server
        await fetch('/api/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assessment.data)
        })

        // Remove from pending after successful sync
        await db.delete('pendingAssessments', assessment.id)
      } catch (error) {
        console.error('Failed to sync assessment:', error)
      }
    }
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

// Helper to open IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('YouthWellDB', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('pendingAssessments')) {
        db.createObjectStore('pendingAssessments', { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

// Push notification support (future feature)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from YouthWell',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200]
  }

  event.waitUntil(
    self.registration.showNotification('YouthWell', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    clients.openWindow('/')
  )
})
