<template>
  <Transition name="fade-slide">
    <div
      v-if="period"
      class="dynasty-info"
      :style="{ '--period-color': period.color }"
    >
      <div class="info-header">
        <div class="header-top">
          <div class="dynasty-badge">
            <span class="badge-name">{{ period.name }}</span>
          </div>
          <div class="period-info">
            <h2 class="dynasty-title">{{ period.nameFull }}</h2>
            <p class="dynasty-period">{{ periodText }} · {{ durationText }}</p>
          </div>
        </div>
      </div>

      <div class="info-divider"></div>

      <!-- 多国时期显示政权网格 -->
      <div
        v-if="period.isMultiState"
        class="nations-section"
      >
        <div class="nations-header">
          <h3 class="nations-title">主要政权（{{ period.nations.length }}）</h3>
          <button
            v-if="hiddenNations.length > 0"
            class="reset-btn"
            @click="emit('toggleNation', null)"
            title="重置显示状态"
          >
            ↻ 重置
          </button>
        </div>
        <div class="nations-grid">
          <div
            v-for="nation in period.nations"
            :key="nation.id"
            class="nation-card"
            :class="{ hidden: hiddenNations.includes(nation.id) }"
            :style="{ '--nation-color': nation.color }"
            @click="emit('toggleNation', nation.id)"
            :title="hiddenNations.includes(nation.id) ? '点击显示' : '点击隐藏'"
          >
            <div class="nation-color-dot"></div>
            <div class="nation-info">
              <div class="nation-name">{{ nation.name }}</div>
              <div class="nation-capital">{{ nation.capital }}</div>
            </div>
            <div class="nation-toggle-icon">
              {{ hiddenNations.includes(nation.id) ? '○' : '●' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 单一朝代显示都城 -->
      <div
        v-else
        class="info-content"
      >
        <div class="info-item">
          <div class="info-icon">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <path
                fill="currentColor"
                d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"
              />
            </svg>
          </div>
          <div class="info-text">
            <span class="info-label">都城</span>
            <span class="info-value">{{ period.capital }}</span>
          </div>
        </div>
      </div>

      <div class="info-divider"></div>

      <div class="info-description">
        <p>{{ period.description }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { formatYear } from '../data/dynasties'

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

const emit = defineEmits(['toggleNation'])

const periodText = computed(() => {
  if (!props.period) return ''
  const start = formatYear(props.period.startYear)
  const end = formatYear(props.period.endYear)
  return `${start.replace('年', '')} - ${end.replace('年', '')}`
})

const durationText = computed(() => {
  if (!props.period) return ''
  let years = props.period.endYear - props.period.startYear
  if (props.period.startYear < 0 && props.period.endYear > 0) {
    years = props.period.endYear - props.period.startYear - 1
  }
  return `约${years}年`
})
</script>

<style scoped>
.dynasty-info {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 300px;
  max-height: calc(100vh - 220px);
  overflow-y: auto;
  background: rgba(255, 248, 240, 0.97);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 16px;
  border: 1px solid #D7CCC8;
  z-index: 1000;
}

.info-header {
  margin-bottom: 8px;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dynasty-badge {
  background: var(--period-color, #8B4513);
  color: white;
  padding: 6px 14px;
  border-radius: 16px;
  flex-shrink: 0;
}

.badge-name {
  font-size: 22px;
  font-weight: 700;
}

.period-info {
  flex: 1;
  min-width: 0;
}

.dynasty-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #3E2723;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dynasty-period {
  font-size: 11px;
  color: #888;
  margin: 2px 0 0;
}

.info-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #D7CCC8, transparent);
  margin: 10px 0;
}

.info-content {
  display: flex;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.info-icon {
  width: 32px;
  height: 32px;
  background: rgba(139, 69, 19, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #D2691E;
  flex-shrink: 0;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.info-label {
  font-size: 11px;
  color: #888;
}

.info-value {
  font-size: 13px;
  font-weight: 500;
  color: #3E2723;
}

.nations-section {
  margin-top: 4px;
}

.nations-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.nations-title {
  font-size: 13px;
  font-weight: 600;
  color: #3E2723;
  margin: 0;
}

.reset-btn {
  font-size: 11px;
  background: rgba(139, 69, 19, 0.1);
  color: #8B4513;
  border: 1px solid rgba(139, 69, 19, 0.2);
  border-radius: 4px;
  padding: 2px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: rgba(139, 69, 19, 0.2);
}

.nations-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.nation-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 5px 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  min-width: 0;
  cursor: pointer;
  user-select: none;
}

.nation-card:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateX(2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.nation-card.hidden {
  opacity: 0.45;
  background: rgba(200, 200, 200, 0.3);
}

.nation-card.hidden .nation-color-dot {
  background: #999 !important;
}

.nation-card.hidden .nation-name,
.nation-card.hidden .nation-capital {
  text-decoration: line-through;
  color: #999;
}

.nation-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--nation-color, #888);
  margin-right: 6px;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.5);
  transition: background 0.2s ease;
}

.nation-info {
  flex: 1;
  min-width: 0;
}

.nation-name {
  font-size: 12px;
  font-weight: 600;
  color: #3E2723;
  line-height: 1.2;
}

.nation-capital {
  font-size: 10px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nation-toggle-icon {
  font-size: 14px;
  color: var(--nation-color, #888);
  flex-shrink: 0;
  margin-left: 4px;
  opacity: 0.6;
}

.nation-card.hidden .nation-toggle-icon {
  color: #4CAF50;
  opacity: 1;
}

.nation-card:not(.hidden) .nation-toggle-icon {
  color: #E57373;
}

.info-description {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.info-description p {
  margin: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.dynasty-info::-webkit-scrollbar {
  width: 4px;
}

.dynasty-info::-webkit-scrollbar-thumb {
  background: rgba(139, 69, 19, 0.3);
  border-radius: 2px;
}
</style>