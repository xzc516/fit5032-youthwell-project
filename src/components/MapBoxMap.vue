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

    // 初始化地图
    map = new mapboxgl.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [144.9631, -37.8136], // Melbourne中心
      zoom: 12
    })

    console.log('Map initialized successfully')

    // 添加导航控件（缩放、旋转）
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // 添加全屏控件
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right')

    // 地图加载完成后添加服务标记
    map.on('load', () => {
      console.log('Map loaded successfully')
      addServiceMarkers()
    })

    // 错误处理
    map.on('error', (e) => {
      console.error('Map error:', e)
    })
  } catch (error) {
    console.error('Error initializing map:', error)
  }
})

// 添加服务标记
function addServiceMarkers() {
  mentalHealthLocations.forEach(location => {
    // 创建标记元素
    const el = document.createElement('div')
    el.className = 'custom-marker'
    el.style.backgroundColor = '#0d6efd'
    el.style.width = '30px'
    el.style.height = '30px'
    el.style.borderRadius = '50%'
    el.style.border = '3px solid white'
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
    el.style.cursor = 'pointer'

    // 添加图标
    const icon = document.createElement('i')
    icon.className = 'bi bi-hospital-fill'
    icon.style.color = 'white'
    icon.style.fontSize = '14px'
    icon.style.position = 'absolute'
    icon.style.top = '50%'
    icon.style.left = '50%'
    icon.style.transform = 'translate(-50%, -50%)'
    el.appendChild(icon)

    // 创建弹出框
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

    // 创建标记
    const marker = new mapboxgl.Marker(el)
      .setLngLat(location.coordinates)
      .setPopup(popup)
      .addTo(map)

    markers.push({ marker, location })

    // 点击标记触发事件
    el.addEventListener('click', () => {
      emit('service-selected', location)
    })
  })
}

// 监听用户位置变化
watch(() => props.userLocation, (newLocation) => {
  if (newLocation && map) {
    // 移除旧的用户标记
    if (userMarker) {
      userMarker.remove()
    }

    // 创建用户位置标记
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

    // 飞到用户位置
    map.flyTo({
      center: [newLocation.longitude, newLocation.latitude],
      zoom: 13,
      duration: 2000
    })
  }
})

// 监听最近服务变化
watch(() => props.nearestService, (newService) => {
  if (newService && map) {
    // 高亮最近的服务
    markers.forEach(({ marker, location }) => {
      const el = marker.getElement()
      if (location.id === newService.id) {
        el.style.backgroundColor = '#28a745'
        el.style.width = '36px'
        el.style.height = '36px'
        el.style.zIndex = '1000'
      }
    })

    // 飞到最近服务
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

/* 脉冲动画 */
@keyframes pulse-marker {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.3), 0 2px 8px rgba(0,0,0,0.3);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(220, 53, 69, 0.1), 0 2px 8px rgba(0,0,0,0.3);
  }
}

/* MapBox控件样式调整 */
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
