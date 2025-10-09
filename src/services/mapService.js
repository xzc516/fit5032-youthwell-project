/**
 * MapBox/Mapify Map Service
 *
 * SETUP INSTRUCTIONS:
 * 1. Sign up for MapBox: https://account.mapbox.com/auth/signup/
 * 2. Get your access token: https://account.mapbox.com/access-tokens/
 * 3. Replace the token below
 *
 * Alternative: Mapify (https://www.mapify.ai/)
 */

// TODO: Replace with your MapBox access token
export const MAPBOX_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN_HERE'

/**
 * Initialize map configuration
 */
export function getMapConfig() {
  return {
    accessToken: MAPBOX_TOKEN,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [144.9631, -37.8136], // Melbourne, Australia
    zoom: 12
  }
}

/**
 * Mental health service locations in Melbourne
 * These are example locations - replace with real data
 */
export const mentalHealthLocations = [
  {
    id: 1,
    name: 'Headspace Melbourne',
    type: 'Youth Mental Health Service',
    address: '401 Brunswick St, Fitzroy VIC 3065',
    phone: '(03) 9427 8900',
    coordinates: [144.9784, -37.7981],
    hours: 'Mon-Fri: 9AM-5PM',
    services: ['Counselling', 'Mental Health Support', 'Youth Services'],
    rating: 4.5
  },
  {
    id: 2,
    name: 'Beyond Blue Support Service',
    type: 'Mental Health Support',
    address: 'PO Box 6100, Hawthorn West VIC 3122',
    phone: '1300 22 4636',
    coordinates: [145.0268, -37.8207],
    hours: '24/7',
    services: ['Phone Support', 'Online Chat', 'Information'],
    rating: 4.8
  },
  {
    id: 3,
    name: 'Orygen Youth Health',
    type: 'Youth Mental Health',
    address: '35 Poplar Rd, Parkville VIC 3052',
    phone: '(03) 9966 9100',
    coordinates: [144.9523, -37.7859],
    hours: 'Mon-Fri: 9AM-5PM',
    services: ['Clinical Care', 'Research', 'Training'],
    rating: 4.6
  },
  {
    id: 4,
    name: 'Kids Helpline',
    type: 'Youth Support Service',
    address: 'Phone Service',
    phone: '1800 55 1800',
    coordinates: [144.9631, -37.8236],
    hours: '24/7',
    services: ['Phone Counselling', 'Email Support', 'Web Chat'],
    rating: 4.7
  },
  {
    id: 5,
    name: 'ReachOut Australia',
    type: 'Online Mental Health',
    address: 'Online Service',
    phone: 'N/A',
    coordinates: [144.9431, -37.8336],
    hours: '24/7 Online',
    services: ['Online Forums', 'Self-help Tools', 'Information'],
    rating: 4.4
  }
]

/**
 * Search for mental health services by location or keyword
 */
export function searchServices(query) {
  if (!query) return mentalHealthLocations

  const lowercaseQuery = query.toLowerCase()
  return mentalHealthLocations.filter(
    location =>
      location.name.toLowerCase().includes(lowercaseQuery) ||
      location.type.toLowerCase().includes(lowercaseQuery) ||
      location.services.some(service => service.toLowerCase().includes(lowercaseQuery))
  )
}

/**
 * Get directions between two points
 * This would use MapBox Directions API
 */
export async function getDirections(start, end) {
  if (MAPBOX_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
    console.warn('MapBox token not configured')
    return null
  }

  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?access_token=${MAPBOX_TOKEN}&geometries=geojson&steps=true`

    const response = await fetch(url)
    const data = await response.json()

    if (data.routes && data.routes.length > 0) {
      return {
        distance: data.routes[0].distance,
        duration: data.routes[0].duration,
        geometry: data.routes[0].geometry,
        steps: data.routes[0].legs[0].steps
      }
    }

    return null
  } catch (error) {
    console.error('Directions error:', error)
    return null
  }
}

/**
 * Geocode address to coordinates
 */
export async function geocodeAddress(address) {
  if (MAPBOX_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
    console.warn('MapBox token not configured')
    return null
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`

    const response = await fetch(url)
    const data = await response.json()

    if (data.features && data.features.length > 0) {
      return {
        coordinates: data.features[0].center,
        placeName: data.features[0].place_name
      }
    }

    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Find nearest mental health service to user location
 */
export function findNearestService(userCoordinates) {
  let nearest = null
  let minDistance = Infinity

  mentalHealthLocations.forEach(location => {
    const distance = calculateDistance(
      userCoordinates[1],
      userCoordinates[0],
      location.coordinates[1],
      location.coordinates[0]
    )

    if (distance < minDistance) {
      minDistance = distance
      nearest = { ...location, distance }
    }
  })

  return nearest
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180
}
