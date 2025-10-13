<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MAPBOX_TOKEN, mentalHealthLocations } from '../services/mapService'

const props = defineProps({
  userLocation: {
    type: Object,
    default: null
  },
  nearestService: {
    type: Object,
    default: null
  },
  selectedService: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['service-selected'])

const mapContainer = ref(null)
let map = null
const markers = []
let userMarker = null

onMounted(() => {
  console.log('MapBox Token:', MAPBOX_TOKEN ? 'Present' : 'Missing')
  console.log('Map Container:', mapContainer.value)

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
    console.error('MapBox token not configured!')
    return
  }

  try {
    mapboxgl.accessToken = MAPBOX_TOKEN

    // Initialize map
    map = new mapboxgl.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [144.9631, -37.8136], // Melbourne center
      zoom: 12
    })

    console.log('Map initialized successfully')

    // Add navigation controls (zoom, rotate)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add fullscreen control
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right')

    // Add service markers after map loads
    map.on('load', () => {
      console.log('Map loaded successfully')
      addServiceMarkers()
    })

    // Error handling
    map.on('error', (e) => {
      console.error('Map error:', e)
    })
  } catch (error) {
    console.error('Error initializing map:', error)
  }
})

// Add service markers
function addServiceMarkers() {
  mentalHealthLocations.forEach(location => {
    // Create marker element
    const el = document.createElement('div')
    el.className = 'custom-marker'
    el.style.backgroundColor = '#0d6efd'
    el.style.width = '30px'
    el.style.height = '30px'
    el.style.borderRadius = '50%'
    el.style.border = '3px solid white'
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
    el.style.cursor = 'pointer'

    // Add icon
    const icon = document.createElement('i')
    icon.className = 'bi bi-hospital-fill'
    icon.style.color = 'white'
    icon.style.fontSize = '14px'
    icon.style.position = 'absolute'
    icon.style.top = '50%'
    icon.style.left = '50%'
    icon.style.transform = 'translate(-50%, -50%)'
    el.appendChild(icon)

    // Create popup
    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      closeOnClick: false
    }).setHTML(`
      <div style="padding: 8px;">
        <h6 style="margin: 0 0 8px 0; color: #0d6efd; font-weight: 600;">
          ${location.name}
        </h6>
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #6c757d;">
          <i class="bi bi-building me-1"></i>${location.type}
        </p>
        <p style="margin: 0 0 4px 0; font-size: 13px;">
          <i class="bi bi-geo-alt me-1"></i>${location.address}
        </p>
        <p style="margin: 0 0 8px 0; font-size: 13px;">
          <i class="bi bi-telephone me-1"></i>${location.phone}
        </p>
        <div style="display: flex; gap: 8px;">
          <a href="tel:${location.phone.replace(/\s/g, '')}"
             class="btn btn-sm btn-success"
             style="font-size: 12px; text-decoration: none;">
            <i class="bi bi-telephone-fill me-1"></i>Call
          </a>
          ${location.phone !== 'N/A' ? `
            <button class="btn btn-sm btn-primary view-details-btn"
                    data-id="${location.id}"
                    style="font-size: 12px;">
              <i class="bi bi-info-circle me-1"></i>Details
            </button>
          ` : ''}
        </div>
      </div>
    `)

    // Create marker
    const marker = new mapboxgl.Marker(el)
      .setLngLat(location.coordinates)
      .setPopup(popup)
      .addTo(map)

    markers.push({ marker, location })

    // Click marker to trigger event
    el.addEventListener('click', () => {
      emit('service-selected', location)
    })
  })
}

// Watch user location changes
watch(() => props.userLocation, (newLocation) => {
  if (newLocation && map) {
    // Remove old user marker
    if (userMarker) {
      userMarker.remove()
    }

    // Create user location marker
    const el = document.createElement('div')
    el.className = 'user-marker'
    el.style.backgroundColor = '#dc3545'
    el.style.width = '20px'
    el.style.height = '20px'
    el.style.borderRadius = '50%'
    el.style.border = '3px solid white'
    el.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.3), 0 2px 8px rgba(0,0,0,0.3)'
    el.style.animation = 'pulse-marker 2s infinite'

    userMarker = new mapboxgl.Marker(el)
      .setLngLat([newLocation.longitude, newLocation.latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 15 })
          .setHTML('<div style="padding: 8px;"><h6 style="margin: 0;">📍 Your Location</h6></div>')
      )
      .addTo(map)

    // Fly to user location
    map.flyTo({
      center: [newLocation.longitude, newLocation.latitude],
      zoom: 13,
      duration: 2000
    })
  }
})

// Watch nearest service changes
watch(() => props.nearestService, (newService) => {
  if (newService && map) {
    // Highlight nearest service
    markers.forEach(({ marker, location }) => {
      const el = marker.getElement()
      if (location.id === newService.id) {
        el.style.backgroundColor = '#28a745'
        el.style.width = '36px'
        el.style.height = '36px'
        el.style.zIndex = '1000'
      }
    })

    // Fly to nearest service
    map.flyTo({
      center: newService.coordinates,
      zoom: 14,
      duration: 2000
    })
  }
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 600px;
  border-radius: 8px;
  background-color: #e0e0e0;
}

/* Pulse animation */
@keyframes pulse-marker {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.3), 0 2px 8px rgba(0,0,0,0.3);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(220, 53, 69, 0.1), 0 2px 8px rgba(0,0,0,0.3);
  }
}

/* MapBox control style adjustments */
:deep(.mapboxgl-ctrl-group) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

:deep(.mapboxgl-popup-content) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  padding: 0;
}

:deep(.mapboxgl-popup-tip) {
  border-top-color: white;
}
</style>
