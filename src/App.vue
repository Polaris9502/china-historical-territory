<template>
  <div class="app-container">
    <!-- 标题栏 -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">
          <span class="title-icon">🗺️</span>
          中国历史疆域演变可视化
        </h1>
        <p class="app-subtitle">从虞朝到现代 · 上下五千年 · {{ totalNations }} 个政权</p>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧时期选择面板 -->
      <aside class="left-panel">
        <DynastyPanel
          :selectedPeriod="selectedPeriod"
          @select="onPeriodSelect"
        />
      </aside>

      <!-- 地图区域 -->
      <main class="map-area">
        <MapView
          ref="mapViewRef"
          :period="selectedPeriod"
          :hiddenNations="hiddenNations"
          @nationHover="onNationHover"
          @nationLeave="onNationLeave"
          @toggleNation="onToggleNation"
        />

        <!-- 悬停提示 -->
        <Transition name="tooltip">
          <div
            v-if="hoverInfo"
            class="hover-tooltip"
          >
            <strong>{{ hoverInfo.name }}</strong>
            <span class="period-label">{{ hoverInfo.periodName }}</span>
            <p v-if="hoverInfo.capital">都城: {{ hoverInfo.capital }}</p>
          </div>
        </Transition>

        <!-- 时期信息卡片 -->
        <DynastyInfo
          :period="selectedPeriod"
          :hiddenNations="hiddenNations"
          @toggleNation="onToggleNation"
        />
      </main>
    </div>

    <!-- 底部时间轴 -->
    <footer class="app-footer">
      <TimeSlider
        v-model="currentYear"
        @periodChange="onPeriodChange"
      />
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import MapView from './components/MapView.vue'
import DynastyPanel from './components/DynastyPanel.vue'
import TimeSlider from './components/TimeSlider.vue'
import DynastyInfo from './components/DynastyInfo.vue'
import { periods, getPeriodByYear } from './data/dynasties'

// 状态
const selectedPeriod = ref(periods[0])
const currentYear = ref(-2070)
const hoverInfo = ref(null)
const mapViewRef = ref(null)
// 当前隐藏的政权 id 列表
const hiddenNations = ref([])

// 计算总政权数
const totalNations = computed(() => {
  let count = 0
  periods.forEach(p => {
    count += p.nations.length
  })
  return count
})

// 时期选择处理
async function onPeriodSelect (period) {
  selectedPeriod.value = period
  currentYear.value = period.startYear
  // 切换时期后重置隐藏状态
  hiddenNations.value = []
}

// 时间轴时期变化处理
function onPeriodChange (period) {
  selectedPeriod.value = period
  // 切换时期后重置隐藏状态
  hiddenNations.value = []
}

// 地图悬停处理
function onNationHover (info) {
  hoverInfo.value = info
}

// 地图悬停离开
function onNationLeave () {
  hoverInfo.value = null
}

// 切换政权显示/隐藏
function onToggleNation (nationId) {
  if (nationId === null) {
    // null 表示重置
    hiddenNations.value = []
  } else {
    const idx = hiddenNations.value.indexOf(nationId)
    if (idx >= 0) {
      // 已隐藏，则显示
      hiddenNations.value = hiddenNations.value.filter(id => id !== nationId)
    } else {
      // 当前显示，则隐藏
      hiddenNations.value = [...hiddenNations.value, nationId]
    }
  }
}
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #FDF5E6;
}

/* 标题栏 */
.app-header {
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  color: white;
  padding: 12px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.header-content {
  text-align: center;
}

.app-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title-icon {
  font-size: 28px;
}

.app-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  opacity: 0.9;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel {
  flex-shrink: 0;
}

.map-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 悬停提示 */
.hover-tooltip {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 300px;
  z-index: 1000;
  border: 1px solid #D7CCC8;
}

.hover-tooltip strong {
  display: block;
  color: #8B4513;
  margin-bottom: 4px;
  font-size: 14px;
}

.period-label {
  display: inline-block;
  background: #FFD700;
  color: #3E2723;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  margin-bottom: 4px;
}

.hover-tooltip p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

/* 底部时间轴 */
.app-footer {
  flex-shrink: 0;
}

/* 过渡动画 */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}
</style>