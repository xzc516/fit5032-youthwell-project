<template>
  <div class="appointment-view">
    <div class="container py-4">
      <!-- Header -->
      <div class="text-center mb-4">
        <h1 class="display-5 fw-bold">
          <i class="bi bi-calendar-check me-2"></i>Smart Appointment System
        </h1>
        <p class="text-muted">
          Schedule counseling sessions with automatic conflict detection
        </p>
      </div>

      <div class="row">
        <!-- Calendar Section -->
        <div class="col-lg-8 mb-4">
          <div class="card shadow">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="bi bi-calendar3 me-2"></i>Appointment Calendar
              </h5>
            </div>
            <div class="card-body p-3">
              <FullCalendar :options="calendarOptions" />
            </div>
          </div>
        </div>

        <!-- Booking Form -->
        <div class="col-lg-4">
          <div class="card shadow mb-4">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0">
                <i class="bi bi-plus-circle me-2"></i>Book Appointment
              </h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="bookAppointment">
                <div class="mb-3">
                  <label class="form-label">Service Type</label>
                  <input
                    type="text"
                    v-model="bookingForm.serviceType"
                    class="form-control"
                    placeholder="e.g., Individual Counseling, Group Therapy, Crisis Intervention..."
                    required
                    list="serviceTypeSuggestions"
                  />
                  <datalist id="serviceTypeSuggestions">
                    <option value="Individual Counseling">
                    <option value="Group Therapy">
                    <option value="Crisis Intervention">
                    <option value="Mental Health Assessment">
                    <option value="Family Counseling">
                    <option value="Cognitive Behavioral Therapy">
                    <option value="Mindfulness Session">
                    <option value="Anxiety Management">
                    <option value="Depression Support">
                  </datalist>
                  <small class="form-text text-muted">
                    Enter the type of service you need or select from suggestions
                  </small>
                </div>

                <div class="mb-3">
                  <label class="form-label">Date</label>
                  <input
                    type="date"
                    v-model="bookingForm.date"
                    class="form-control"
                    :min="minDate"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label">Time</label>
                  <select v-model="bookingForm.time" class="form-select" required>
                    <option value="">Select time...</option>
                    <option v-for="slot in timeSlots" :key="slot" :value="slot">
                      {{ slot }}
                    </option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Duration</label>
                  <select v-model="bookingForm.duration" class="form-select" required>
                    <option value="30">30 minutes</option>
                    <option value="60" selected>60 minutes</option>
                    <option value="90">90 minutes</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Notes (Optional)</label>
                  <textarea
                    v-model="bookingForm.notes"
                    class="form-control"
                    rows="3"
                    placeholder="Any specific concerns or topics..."
                  ></textarea>
                </div>

                <button type="submit" class="btn btn-success w-100" :disabled="isBooking">
                  <i class="bi bi-check-circle me-2"></i>
                  {{ isBooking ? 'Booking...' : 'Book Appointment' }}
                </button>
              </form>
            </div>
          </div>

          <!-- Upcoming Appointments -->
          <div class="card shadow">
            <div class="card-header bg-info text-white">
              <h5 class="mb-0">
                <i class="bi bi-clock-history me-2"></i>Upcoming Appointments
              </h5>
            </div>
            <div class="card-body">
              <div v-if="upcomingAppointments.length === 0" class="text-center text-muted py-3">
                <i class="bi bi-calendar-x display-4"></i>
                <p class="mt-2">No upcoming appointments</p>
              </div>
              <div v-else class="appointment-list">
                <div
                  v-for="apt in upcomingAppointments"
                  :key="apt.id"
                  class="appointment-item mb-3 p-3 border rounded"
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="mb-1">{{ apt.title }}</h6>
                      <small class="text-muted">
                        <i class="bi bi-calendar3 me-1"></i>{{ formatAppointmentDate(apt.start) }}
                      </small>
                    </div>
                    <button
                      @click="cancelAppointment(apt.id)"
                      class="btn btn-sm btn-outline-danger"
                    >
                      <i class="bi bi-x-circle"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Toast -->
    <div
      v-if="toast.show"
      class="toast-notification"
      :class="toast.type"
    >
      <i :class="toast.type === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'" class="me-2"></i>
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useFirebaseAuthStore } from '../stores/firebaseAuth'
import { db } from '../firebase/config'
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore'

const auth = useFirebaseAuthStore()

// Booking form
const bookingForm = ref({
  serviceType: '',
  date: '',
  time: '',
  duration: '60',
  notes: ''
})

// Calendar events
const events = ref([])
const isBooking = ref(false)

// Toast notification
const toast = ref({
  show: false,
  type: 'success',
  message: ''
})

// Time slots (9 AM to 5 PM)
const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
]

// Minimum date (today)
const minDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Upcoming appointments (next 7 days)
const upcomingAppointments = computed(() => {
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  return events.value
    .filter(event => {
      const eventDate = new Date(event.start)
      return eventDate >= now && eventDate <= nextWeek
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 5)
})

// FullCalendar options
const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  slotMinTime: '09:00:00',
  slotMaxTime: '18:00:00',
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
    startTime: '09:00',
    endTime: '17:00'
  },
  events: events.value,
  eventClick: handleEventClick,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  editable: false,
  eventColor: '#0d6efd'
})

/**
 * Book a new appointment
 */
async function bookAppointment() {
  if (!bookingForm.value.date || !bookingForm.value.time) {
    showToast('error', 'Please select date and time')
    return
  }

  // Create start and end datetime
  const startDateTime = new Date(`${bookingForm.value.date}T${bookingForm.value.time}`)
  const endDateTime = new Date(startDateTime.getTime() + bookingForm.value.duration * 60000)

  // Check for conflicts
  const hasConflict = events.value.some(event => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    return (
      (startDateTime >= eventStart && startDateTime < eventEnd) ||
      (endDateTime > eventStart && endDateTime <= eventEnd) ||
      (startDateTime <= eventStart && endDateTime >= eventEnd)
    )
  })

  if (hasConflict) {
    showToast('error', '⚠️ Time slot conflict detected! Please choose another time.')
    return
  }

  isBooking.value = true

  try {
    // Save to Firestore
    const appointmentData = {
      userId: auth.currentUser?.uid,
      username: auth.currentUser?.username,
      serviceType: bookingForm.value.serviceType,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      duration: bookingForm.value.duration,
      notes: bookingForm.value.notes,
      status: 'confirmed',
      createdAt: new Date()
    }

    const docRef = await addDoc(collection(db, 'appointments'), appointmentData)

    // Add to calendar
    const newEvent = {
      id: docRef.id,
      title: bookingForm.value.serviceType,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      color: getServiceColor(bookingForm.value.serviceType)
    }

    events.value.push(newEvent)
    calendarOptions.value.events = [...events.value]

    // Reset form
    bookingForm.value = {
      serviceType: '',
      date: '',
      time: '',
      duration: '60',
      notes: ''
    }

    showToast('success', '✅ Appointment booked successfully!')

  } catch (error) {
    console.error('Error booking appointment:', error)
    showToast('error', 'Failed to book appointment. Please try again.')
  } finally {
    isBooking.value = false
  }
}

/**
 * Cancel an appointment
 */
async function cancelAppointment(appointmentId) {
  if (!confirm('Are you sure you want to cancel this appointment?')) {
    return
  }

  try {
    // Delete from Firestore
    await deleteDoc(doc(db, 'appointments', appointmentId))

    // Remove from calendar
    events.value = events.value.filter(event => event.id !== appointmentId)
    calendarOptions.value.events = [...events.value]

    showToast('success', 'Appointment cancelled successfully')

  } catch (error) {
    console.error('Error cancelling appointment:', error)
    showToast('error', 'Failed to cancel appointment')
  }
}

/**
 * Handle calendar event click
 */
function handleEventClick(clickInfo) {
  if (confirm(`Cancel appointment: ${clickInfo.event.title}?`)) {
    cancelAppointment(clickInfo.event.id)
  }
}

/**
 * Get color based on service type
 */
function getServiceColor(serviceType) {
  const type = serviceType.toLowerCase()

  if (type.includes('counseling') || type.includes('individual')) return '#0d6efd'
  if (type.includes('group') || type.includes('therapy')) return '#198754'
  if (type.includes('crisis') || type.includes('emergency')) return '#dc3545'
  if (type.includes('assessment') || type.includes('evaluation')) return '#ffc107'
  if (type.includes('cognitive') || type.includes('cbt')) return '#6610f2'
  if (type.includes('mindfulness') || type.includes('meditation')) return '#20c997'
  if (type.includes('anxiety')) return '#fd7e14'
  if (type.includes('depression')) return '#0dcaf0'

  return '#6c757d' // Default gray color
}

/**
 * Format appointment date for display
 */
function formatAppointmentDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-AU', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Show toast notification
 */
function showToast(type, message) {
  toast.value = { show: true, type, message }
  setTimeout(() => {
    toast.value.show = false
  }, 4000)
}

/**
 * Load appointments from Firestore
 */
async function loadAppointments() {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', auth.currentUser?.uid),
      orderBy('start', 'asc')
    )

    const querySnapshot = await getDocs(q)

    events.value = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.serviceType,
        start: data.start,
        end: data.end,
        color: getServiceColor(data.serviceType)
      }
    })

    calendarOptions.value.events = [...events.value]

  } catch (error) {
    console.error('Error loading appointments:', error)
  }
}

onMounted(() => {
  loadAppointments()
})
</script>

<style scoped>
.appointment-view {
  min-height: calc(100vh - 150px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 3rem;
}

.appointment-view h1 {
  color: white;
}

.appointment-view .text-muted {
  color: rgba(255, 255, 255, 0.9) !important;
}

.card {
  border: none;
  border-radius: 10px;
}

.card-header {
  border-radius: 10px 10px 0 0 !important;
}

.appointment-item {
  background: #f8f9fa;
  transition: transform 0.2s;
}

.appointment-item:hover {
  transform: translateX(5px);
  background: #e9ecef;
}

.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 15px 25px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 9999;
  animation: slideIn 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.toast-notification.success {
  background: #28a745;
}

.toast-notification.error {
  background: #dc3545;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* FullCalendar custom styling */
:deep(.fc) {
  font-family: inherit;
}

:deep(.fc-button) {
  background-color: #0d6efd;
  border-color: #0d6efd;
  text-transform: capitalize;
}

:deep(.fc-button:hover) {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

:deep(.fc-button-active) {
  background-color: #0a58ca !important;
  border-color: #0a53be !important;
}

:deep(.fc-event) {
  cursor: pointer;
}

@media (max-width: 992px) {
  .appointment-view {
    padding-bottom: 2rem;
  }

  .toast-notification {
    bottom: 20px;
    right: 20px;
    left: 20px;
  }
}
</style>
