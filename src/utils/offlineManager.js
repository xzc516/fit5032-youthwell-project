/**
 * Offline Manager
 * Handles offline/online detection and data synchronization
 */

import { ref } from 'vue'

// Online/offline state
export const isOnline = ref(navigator.onLine)

// Pending sync queue
export const syncQueue = ref([])

/**
 * Initialize offline manager
 */
export function initOfflineManager() {
  // Listen for online/offline events
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Check initial state
  updateOnlineStatus()

  // Register service worker
  if ('serviceWorker' in navigator) {
    registerServiceWorker()
  }

  // Load sync queue from localStorage
  loadSyncQueue()
}

/**
 * Register service worker
 */
async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js')
    console.log('Service Worker registered:', registration.scope)

    // Request notification permission (optional)
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  } catch (error) {
    console.error('Service Worker registration failed:', error)
  }
}

/**
 * Handle online event
 */
function handleOnline() {
  console.log('Network: ONLINE')
  updateOnlineStatus()
  syncPendingData()
}

/**
 * Handle offline event
 */
function handleOffline() {
  console.log('Network: OFFLINE')
  updateOnlineStatus()
  showOfflineNotification()
}

/**
 * Update online status
 */
function updateOnlineStatus() {
  isOnline.value = navigator.onLine
}

/**
 * Show offline notification
 */
function showOfflineNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('YouthWell - Offline Mode', {
      body: 'You are now offline. Your data will be saved locally and synced when reconnected.',
      icon: '/icon-192.png'
    })
  }
}

/**
 * Save assessment result offline
 */
export function saveOfflineAssessment(assessmentData) {
  const offlineData = {
    id: Date.now(),
    type: 'assessment',
    data: assessmentData,
    timestamp: new Date().toISOString()
  }

  syncQueue.value.push(offlineData)
  saveSyncQueue()

  return offlineData.id
}

/**
 * Save forum post offline
 */
export function saveOfflinePost(postData) {
  const offlineData = {
    id: Date.now(),
    type: 'post',
    data: postData,
    timestamp: new Date().toISOString()
  }

  syncQueue.value.push(offlineData)
  saveSyncQueue()

  return offlineData.id
}

/**
 * Sync pending data when online
 */
async function syncPendingData() {
  if (syncQueue.value.length === 0) {
    return
  }

  console.log(`Syncing ${syncQueue.value.length} pending items...`)

  const failedItems = []

  for (const item of syncQueue.value) {
    try {
      if (item.type === 'assessment') {
        await syncAssessment(item)
      } else if (item.type === 'post') {
        await syncPost(item)
      }
    } catch (error) {
      console.error('Failed to sync item:', error)
      failedItems.push(item)
    }
  }

  // Update sync queue with failed items only
  syncQueue.value = failedItems
  saveSyncQueue()

  if (failedItems.length === 0) {
    console.log('All items synced successfully')
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('YouthWell - Sync Complete', {
        body: 'All offline data has been synced successfully.',
        icon: '/icon-192.png'
      })
    }
  }
}

/**
 * Sync assessment to Firestore
 */
async function syncAssessment(item) {
  const { addDoc, collection } = await import('firebase/firestore')
  const { db } = await import('../firebase/config')

  await addDoc(collection(db, 'assessmentResults'), item.data)
  console.log('Assessment synced:', item.id)
}

/**
 * Sync post to Firestore
 */
async function syncPost(item) {
  const { useForumStore } = await import('../stores/forum')
  const forumStore = useForumStore()

  await forumStore.createPost(item.data)
  console.log('Post synced:', item.id)
}

/**
 * Save sync queue to localStorage
 */
function saveSyncQueue() {
  try {
    localStorage.setItem('youthwell-sync-queue', JSON.stringify(syncQueue.value))
  } catch (error) {
    console.error('Failed to save sync queue:', error)
  }
}

/**
 * Load sync queue from localStorage
 */
function loadSyncQueue() {
  try {
    const saved = localStorage.getItem('youthwell-sync-queue')
    if (saved) {
      syncQueue.value = JSON.parse(saved)
      console.log(`Loaded ${syncQueue.value.length} pending items from storage`)
    }
  } catch (error) {
    console.error('Failed to load sync queue:', error)
  }
}

/**
 * Clear all offline data
 */
export function clearOfflineData() {
  syncQueue.value = []
  localStorage.removeItem('youthwell-sync-queue')
  console.log('Offline data cleared')
}

/**
 * Get sync queue status
 */
export function getSyncStatus() {
  return {
    isOnline: isOnline.value,
    pendingItems: syncQueue.value.length,
    queue: syncQueue.value
  }
}

/**
 * Manual sync trigger
 */
export async function triggerSync() {
  if (!isOnline.value) {
    throw new Error('Cannot sync while offline')
  }

  await syncPendingData()
}
