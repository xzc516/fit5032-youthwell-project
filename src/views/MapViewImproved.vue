<template>
  <section class="map-section">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-4 text-white">
          <i class="fas fa-map-marked-alt me-2"></i>Mental Health Resources Map
        </h1>
        <p class="text-center text-white-50 mb-4">Find mental health services and support near you</p>
      </div>
    </div>

    <div class="row">
      <!-- Search and Filter Panel -->
      <div class="col-12 col-lg-4 mb-4">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0"><i class="fas fa-search me-2"></i>Search Services</h5>
          </div>
          <div class="card-body">
            <!-- Search Input -->
            <div class="mb-3">
              <label class="form-label fw-bold" for="service-search">Search by name or service type</label>
              <div class="input-group">
                <input
                  id="service-search"
                  v-model="searchQuery"
                  type="text"
                  class="form-control"
                  placeholder="e.g., Headspace, counselling..."
                  aria-label="Search mental health services"
                  @input="filterServices"
                />
                <button
                  class="btn btn-primary"
                  @click="filterServices"
                  aria-label="Search button"
                >
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>

            <!-- Use Current Location -->
            <div class="mb-3">
              <button
                class="btn btn-outline-success w-100"
                @click="useCurrentLocation"
                :disabled="loadingLocation"
                aria-label="Use my current location"
              >
                <i class="fas fa-location-arrow me-2"></i>
                {{ loadingLocation ? 'Getting location...' : 'Use My Location' }}
              </button>
            </div>

            <!-- Service Type Filter -->
            <div class="mb-3">
              <label class="form-label fw-bold">Filter by Service Type</label>
              <select
                v-model="selectedServiceType"
                class="form-select"
                @change="filterServices"
                aria-label="Filter by service type"
              >
                <option value="">All Services</option>
                <option value="Youth Mental Health Service">Youth Services</option>
                <option value="Mental Health Support">Mental Health Support</option>
                <option value="Youth Support Service">Youth Support</option>
                <option value="Online Mental Health">Online Services</option>
              </select>
            </div>

            <!-- Results List -->
            <div class="service-list">
              <h6 class="fw-bold mb-3">
                Found {{ filteredLocations.length }} service(s)
              </h6>
              <div
                v-for="location in filteredLocations"
                :key="location.id"
                class="service-card mb-3"
                :class="{ 'selected': selectedLocation?.id === location.id }"
                @click="selectLocation(location)"
                role="button"
                tabindex="0"
                @keypress.enter="selectLocation(location)"
                :aria-label="`Select ${location.name}`"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div class="flex-grow-1">
                    <h6 class="mb-1 fw-bold text-primary">{{ location.name }}</h6>
                    <p class="small text-muted mb-1">{{ location.type }}</p>
                    <p class="small mb-1">
                      <i class="fas fa-map-marker-alt me-1"></i>{{ location.address }}
                    </p>
                    <p class="small mb-1">
                      <i class="fas fa-phone me-1"></i>{{ location.phone }}
                    </p>
                    <p class="small mb-1">
                      <i class="fas fa-clock me-1"></i>{{ location.hours }}
                    </p>
                    <div class="rating mb-2">
                      <i class="fas fa-star text-warning"></i>
                      <span class="small">{{ location.rating }} / 5.0</span>
                    </div>
                  </div>
                </div>
                <div class="service-tags">
                  <span
                    v-for="(service, idx) in location.services"
                    :key="idx"
                    class="badge bg-secondary me-1 mb-1"
                  >
                    {{ service }}
                  </span>
                </div>
                <button
                  v-if="selectedLocation?.id === location.id && userLocation"
                  class="btn btn-sm btn-outline-primary mt-2 w-100"
                  @click.stop="getDirectionsToLocation(location)"
                  aria-label="Get directions"
                >
                  <i class="fas fa-directions me-1"></i>Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Map Display -->
      <div class="col-12 col-lg-8">
        <div class="card shadow">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0"><i class="fas fa-map me-2"></i>Map View</h5>
          </div>
          <div class="card-body p-0">
            <!-- Interactive MapBox Map -->
            <MapBoxMap
              :userLocation="userLocation"
              :nearestService="nearestLocation"
              :selectedService="selectedLocation"
              @service-selected="selectLocation"
            />
          </div>
        </div>

        <!-- Directions Panel -->
        <div v-if="directions" class="card shadow mt-3">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0"><i class="fas fa-route me-2"></i>Directions</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <strong>Distance:</strong> {{ (directions.distance / 1000).toFixed(2) }} km<br />
              <strong>Duration:</strong> {{ Math.ceil(directions.duration / 60) }} minutes
            </div>
            <h6 class="fw-bold">Step-by-Step:</h6>
            <ol class="directions-list">
              <li v-for="(step, idx) in directions.steps" :key="idx" class="mb-2">
                {{ step.maneuver.instruction }}
                <small class="text-muted d-block">{{ (step.distance / 1000).toFixed(2) }} km</small>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- Emergency Contacts -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card shadow border-danger">
          <div class="card-header bg-danger text-white">
            <h5 class="mb-0"><i class="fas fa-phone-volume me-2"></i>Emergency Contacts</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-12 col-md-4">
                <h6 class="fw-bold">Lifeline</h6>
                <p class="mb-1"><i class="fas fa-phone me-2"></i><a href="tel:131114">13 11 14</a></p>
                <p class="small text-muted">24/7 Crisis Support</p>
              </div>
              <div class="col-12 col-md-4">
                <h6 class="fw-bold">Kids Helpline</h6>
                <p class="mb-1"><i class="fas fa-phone me-2"></i><a href="tel:1800551800">1800 55 1800</a></p>
                <p class="small text-muted">For young people 5-25</p>
              </div>
              <div class="col-12 col-md-4">
                <h6 class="fw-bold">Beyond Blue</h6>
                <p class="mb-1"><i class="fas fa-phone me-2"></i><a href="tel:1300224636">1300 22 4636</a></p>
                <p class="small text-muted">Mental Health Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import MapBoxMap from '../components/MapBoxMap.vue'
import {
  mentalHealthLocations,
  searchServices,
  getDirections,
  findNearestService
} from '../services/mapService'

const searchQuery = ref('')
const selectedServiceType = ref('')
const selectedLocation = ref(null)
const userLocation = ref(null)
const nearestLocation = ref(null)
const loadingLocation = ref(false)
const directions = ref(null)

const filteredLocations = ref([...mentalHealthLocations])

function filterServices() {
  let results = searchServices(searchQuery.value)

  if (selectedServiceType.value) {
    results = results.filter(loc => loc.type === selectedServiceType.value)
  }

  filteredLocations.value = results
}

function selectLocation(location) {
  selectedLocation.value = location
  // TODO: Center map on selected location
  console.log('Selected location:', location)
}

function useCurrentLocation() {
  loadingLocation.value = true

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => {
        userLocation.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        loadingLocation.value = false

        // Find nearest service
        const nearest = findNearestService([position.coords.longitude, position.coords.latitude])
        if (nearest) {
          nearestLocation.value = nearest
          alert(`Nearest service: ${nearest.name} (${nearest.distance.toFixed(2)} km away)`)
          selectLocation(nearest)
        }
      },
      error => {
        loadingLocation.value = false
        alert('Unable to get your location. Please enable location services.')
        console.error('Geolocation error:', error)
      }
    )
  } else {
    loadingLocation.value = false
    alert('Geolocation is not supported by your browser')
  }
}

async function getDirectionsToLocation(location) {
  if (!userLocation.value) {
    alert('Please enable location services first')
    return
  }

  const start = [userLocation.value.longitude, userLocation.value.latitude]
  const result = await getDirections(start, location.coordinates)

  if (result) {
    directions.value = result
  } else {
    alert('Unable to get directions. Please check MapBox configuration.')
  }
}
</script>

<style scoped>
.map-section {
  padding: 20px 0;
}

.service-card {
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.service-card:hover,
.service-card:focus {
  border-color: #667eea;
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  outline: none;
}

.service-card.selected {
  border-color: #667eea;
  background-color: #e7f3ff;
}

.service-list {
  max-height: 500px;
  overflow-y: auto;
}

.service-tags .badge {
  font-size: 0.75rem;
}

.map-placeholder {
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 40px;
}

.map-setup-message {
  max-width: 600px;
}

.map-setup-message code {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

.map-setup-message a {
  color: white;
  text-decoration: underline;
}

.directions-list {
  max-height: 400px;
  overflow-y: auto;
}

.rating {
  color: #ffc107;
}

@media (max-width: 768px) {
  .map-section {
    padding: 10px 0;
  }

  .service-list {
    max-height: 300px;
  }
}
</style>
