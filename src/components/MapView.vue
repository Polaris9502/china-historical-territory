<template>
  <div class="map-container">
    <div ref="mapRef" class="map"></div>
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span>加载地图中...</span>
    </div>
    <div v-if="period" class="legend">
      <div class="legend-title">{{ period.nameFull }}</div>
      <div class="legend-items">
        <div
          v-for="nation in period.nations"
          :key="nation.id"
          class="legend-item"
          :class="{ hidden: hiddenNationsSet.has(nation.id) }"
          @click="toggleNation(nation.id)"
          :title="hiddenNationsSet.has(nation.id) ? '点击显示' : '点击隐藏'"
        >
          <span class="legend-color" :style="{ background: nation.color }"></span>
          <span class="legend-name">{{ nation.name }}</span>
          <span class="legend-capital">· {{ nation.capital }}</span>
          <span class="legend-toggle">
            {{ hiddenNationsSet.has(nation.id) ? '显示' : '隐藏' }}
          </span>
        </div>
      </div>
      <div v-if="hiddenCount > 0" class="legend-actions">
        <button class="legend-btn" @click="showAll">全部显示</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import L from 'leaflet'
import { useTianditu, CHINA_CENTER, switchToNextToken } from '../composables/useTianditu'
import { getProvinceFeatures, loadProvinceGeoJSON } from '../data/provinceCodes'

const props = defineProps({
  period: {
    type: Object,
    default: null
  },
  hiddenNations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['nationHover', 'nationLeave', 'toggleNation'])

const mapRef = ref(null)
const loading = ref(true)
let map = null
let provinceData = null

// 每个 nation 的图层与标记
const nationLayers = new Map() // nationId -> { layer, marker }
let capitalMarkers = []
let boundaryLayers = []

// 当前隐藏的 nation id 集合
const hiddenNationsSet = computed(() => new Set(props.hiddenNations || []))
const hiddenCount = computed(() => (props.hiddenNations || []).length)

// 首都标记图标
function createCapitalIcon(color, name, offsetY = 0) {
  return L.divIcon({
    className: 'capital-marker',
    html: `
      <div class="capital-pin" style="border-color: ${color}; color: ${color}; transform: translateY(${offsetY}px);">
        <span class="capital-dot" style="background: ${color};"></span>
        <span class="capital-name">${name}</span>
      </div>
    `,
    iconSize: [90, 24],
    iconAnchor: [45, 12]
  })
}

// 切换政权可见性
function toggleNation(nationId) {
  emit('toggleNation', nationId)
}

// 全部显示
function showAll() {
  emit('toggleNation', null) // null 表示重置
}

onMounted(async () => {
  // 预加载省份数据
  await loadProvinceGeoJSON()
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

watch(() => props.period, async (newPeriod) => {
  if (newPeriod && map) {
    try {
      await updateBoundaries(newPeriod)
      map.setView(newPeriod.center, newPeriod.zoom || 4)
    } catch (err) {
      console.error('更新疆域失败:', err)
    }
  }
}, { immediate: false })

// 监听隐藏状态变化
watch(hiddenNationsSet, (newSet) => {
  applyVisibility(newSet)
}, { deep: true })

function initMap() {
  map = L.map(mapRef.value, {
    center: CHINA_CENTER,
    zoom: 4,
    minZoom: 2,
    maxZoom: 10,
    zoomControl: false,
    attributionControl: false
  })

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  L.control.attribution({ position: 'bottomleft', prefix: '' })
    .addAttribution('&copy; <a href="https://www.tianditu.gov.cn/">天地图</a>')
    .addTo(map)

  loadTiandituLayers()
}

function loadTiandituLayers() {
  const tk = switchToNextToken()

  const vecLayer = L.tileLayer(
    `https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tk}`,
    { maxZoom: 18, minZoom: 1, attribution: '&copy; 天地图' }
  )

  const cvaLayer = L.tileLayer(
    `https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tk}`,
    { maxZoom: 18, minZoom: 1 }
  )

  // OpenStreetMap 备用底图（当从天地图加载失败时使用）
  const osmLayer = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxZoom: 18, minZoom: 1, attribution: '&copy; OpenStreetMap' }
  )

  // 如果天地图加载失败，添加OSM底图
  let tiandituFailed = false
  let osmAdded = false

  const handleTiandituError = () => {
    if (tiandituFailed) return
    tiandituFailed = true
    console.warn('天地图切片加载失败，添加 OpenStreetMap 备用底图')
    if (!osmAdded) {
      osmAdded = true
      osmLayer.addTo(map)
    }
  }

  vecLayer.on('tileerror', handleTiandituError)
  cvaLayer.on('tileerror', handleTiandituError)

  vecLayer.addTo(map)
  cvaLayer.addTo(map)

  loading.value = false

  // 如果已有时期数据，立即绘制
  if (props.period) {
    updateBoundaries(props.period)
    map.setView(props.period.center, props.period.zoom || 4)
  }
}

function clearAll() {
  boundaryLayers.forEach(layer => map.removeLayer(layer))
  capitalMarkers.forEach(marker => map.removeLayer(marker))
  boundaryLayers = []
  capitalMarkers = []
  nationLayers.clear()
}

// 合并省份为单个 FeatureCollection
function buildNationFeatureCollection(nation) {
  const features = []

  // 添加省份 polygons
  if (nation.provinces && nation.provinces.length > 0) {
    const provinceFeatures = getProvinceFeaturesSync(nation.provinces)
    features.push(...provinceFeatures)
  }

  // 添加特殊多边形
  if (nation.specialPolygon) {
    features.push({
      type: 'Feature',
      properties: { name: nation.name },
      geometry: {
        type: 'Polygon',
        coordinates: [nation.specialPolygon]
      }
    })
  }

  // 添加外域扩展领土（超出今天中国国界的部分）
  if (nation.extraTerritory && Array.isArray(nation.extraTerritory)) {
    nation.extraTerritory.forEach((polygon, idx) => {
      if (polygon && polygon.length >= 3) {
        features.push({
          type: 'Feature',
          properties: { name: `${nation.name}-外域${idx + 1}` },
          geometry: {
            type: 'Polygon',
            coordinates: [polygon]
          }
        })
      }
    })
  }

  return {
    type: 'FeatureCollection',
    features
  }
}

function getProvinceFeaturesSync(codes) {
  if (!provinceData) return []
  const features = []
  provinceData.features.forEach(feature => {
    if (codes.includes(feature.properties.adcode)) {
      features.push(feature)
    }
  })
  return features
}

async function updateBoundaries(period) {
  clearAll()

  if (!period.nations || period.nations.length === 0) return

  // 确保省份数据已加载
  if (!provinceData) {
    provinceData = await loadProvinceGeoJSON()
  }

  // 收集首都位置用于重叠检测
  const capitalMap = new Map()
  period.nations.forEach(nation => {
    if (nation.capitalLocation
        && Array.isArray(nation.capitalLocation)
        && nation.capitalLocation.length === 2
        && nation.capitalLocation.every(v => typeof v === 'number' && !isNaN(v))) {
      const key = `${nation.capitalLocation[0]},${nation.capitalLocation[1]}`
      capitalMap.set(key, (capitalMap.get(key) || 0) + 1)
    }
  })

  // 绘制每个政权的疆域
  period.nations.forEach(nation => {
    const featureCollection = buildNationFeatureCollection(nation)

    if (featureCollection.features.length === 0) return

    const style = {
      fillColor: nation.color,
      fillOpacity: 0.4,
      color: nation.color,
      weight: 2,
      opacity: 0.9
    }

    const highlightStyle = {
      ...style,
      fillOpacity: 0.6,
      weight: 3
    }

    const layer = L.geoJSON(featureCollection, {
      style: style,
      onEachFeature: (feature, lyr) => {
        lyr.on({
          mouseover: (e) => {
            e.target.setStyle(highlightStyle)
            e.target.bringToFront()
            emit('nationHover', {
              name: nation.name,
              capital: nation.capital,
              periodName: period.nameFull
            })
          },
          mouseout: (e) => {
            e.target.setStyle(style)
            emit('nationLeave')
          }
        })
      }
    })

    layer.addTo(map)
    boundaryLayers.push(layer)

    // 首都标记
    let marker = null
    if (nation.capitalLocation
        && Array.isArray(nation.capitalLocation)
        && nation.capitalLocation.length === 2
        && nation.capitalLocation.every(v => typeof v === 'number' && !isNaN(v))) {
      const key = `${nation.capitalLocation[0]},${nation.capitalLocation[1]}`
      const count = capitalMap.get(key)
      const idx = (nationLayers.get(key)?.idx || 0)

      const offsetY = count > 1 ? idx * 22 - (count - 1) * 11 : 0

      marker = L.marker(
        [nation.capitalLocation[1], nation.capitalLocation[0]],
        {
          icon: createCapitalIcon(nation.color, nation.capital, offsetY),
          zIndexOffset: 1000 + idx
        }
      )

      marker.bindTooltip(
        `<div class="capital-tooltip">
          <strong>${nation.name}</strong><br>
          <span>都城：${nation.capital}</span>
        </div>`,
        { direction: 'top', offset: [0, -10] }
      )

      marker.addTo(map)
      capitalMarkers.push(marker)
    }

    // 记录该 nation 的图层和标记
    nationLayers.set(nation.id, { layer, marker, nation })

    // 更新索引
    if (nation.capitalLocation
        && Array.isArray(nation.capitalLocation)
        && nation.capitalLocation.length === 2) {
      const key = `${nation.capitalLocation[0]},${nation.capitalLocation[1]}`
      const entry = nationLayers.get(key)
      if (entry) {
        entry.idx = (entry.idx || 0) + 1
      } else {
        nationLayers.set(key, { idx: 1 })
      }
    }
  })

  // 应用初始可见性
  applyVisibility(hiddenNationsSet.value)
}

// 应用可见性
function applyVisibility(hiddenSet) {
  nationLayers.forEach((data, nationId) => {
    const hidden = hiddenSet.has(nationId)
    if (data.layer) {
      if (hidden) {
        if (map.hasLayer(data.layer)) map.removeLayer(data.layer)
      } else {
        if (!map.hasLayer(data.layer)) data.layer.addTo(map)
      }
    }
    if (data.marker) {
      if (hidden) {
        if (map.hasLayer(data.marker)) map.removeLayer(data.marker)
      } else {
        if (!map.hasLayer(data.marker)) data.marker.addTo(map)
      }
    }
  })
}

defineExpose({ getMap: () => map })
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #D2691E;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.legend {
  position: fixed;
  top: 80px;
  left: 290px;
  background: rgba(255, 248, 240, 0.97);
  padding: 10px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 999;
  max-width: 220px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.legend-title {
  font-size: 13px;
  font-weight: 700;
  color: #3E2723;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #3E2723;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.legend-item:hover {
  background: rgba(139, 69, 19, 0.08);
  transform: translateX(2px);
}

.legend-item.hidden {
  opacity: 0.4;
}

.legend-item.hidden .legend-color {
  background: #999 !important;
}

.legend-item.hidden .legend-name,
.legend-item.hidden .legend-capital {
  text-decoration: line-through;
  color: #888;
}

.legend-item.hidden .legend-toggle {
  color: #4CAF50;
  font-weight: 600;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  transition: background 0.2s ease;
}

.legend-name {
  font-weight: 600;
}

.legend-capital {
  font-size: 11px;
  color: #888;
  flex: 1;
}

.legend-toggle {
  font-size: 10px;
  color: #888;
  padding: 1px 5px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.legend-item:not(.hidden) .legend-toggle {
  color: #E57373;
}

.legend-item:not(.hidden):hover .legend-toggle {
  background: rgba(229, 115, 115, 0.15);
}

.legend-item.hidden:hover .legend-toggle {
  background: rgba(76, 175, 80, 0.15);
}

.legend-actions {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.legend-btn {
  width: 100%;
  padding: 5px 10px;
  font-size: 11px;
  background: #8B4513;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.legend-btn:hover {
  background: #A0522D;
}

.legend::-webkit-scrollbar {
  width: 4px;
}

.legend::-webkit-scrollbar-thumb {
  background: rgba(139, 69, 19, 0.3);
  border-radius: 2px;
}

:global(.capital-marker) {
  background: transparent !important;
  border: none !important;
}

:global(.capital-pin) {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px 2px 4px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  border: 2px solid;
  white-space: nowrap;
  font-family: inherit;
}

:global(.capital-dot) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.8);
}

:global(.capital-name) {
  font-size: 11px;
  font-weight: 600;
  color: #3E2723;
}

:global(.capital-tooltip) {
  font-size: 13px;
  line-height: 1.5;
}

:global(.capital-tooltip strong) {
  color: #8B4513;
  font-size: 14px;
}
</style>