<template>
  <div class="dynasty-panel">
    <div class="panel-header">
      <h2>历史时期</h2>
      <span class="dynasty-count">共 {{ periods.length }} 个时期</span>
    </div>

    <div class="dynasty-list" ref="listRef">
      <div
        v-for="period in periods"
        :key="period.id"
        class="dynasty-item"
        :class="{
          active: selectedPeriod?.id === period.id,
          'multi-state': period.isMultiState
        }"
        :style="{ '--period-color': period.color }"
        @click="selectPeriod(period)"
      >
        <div class="dynasty-color-bar"></div>
        <div class="dynasty-content">
          <div class="dynasty-name">
            {{ period.nameFull }}
            <span v-if="period.isMultiState" class="multi-badge">多国</span>
          </div>
          <div class="dynasty-period">
            {{ formatPeriod(period.startYear, period.endYear) }}
            <span v-if="period.isMultiState" class="nation-count">
              · {{ period.nations.length }} 个政权
            </span>
          </div>
        </div>
        <div class="dynasty-arrow">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="panel-footer">
      <span class="footer-hint">点击时期查看疆域</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { periods, formatYear } from '../data/dynasties'

const props = defineProps({
  selectedPeriod: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select'])

const listRef = ref(null)

function selectPeriod(period) {
  emit('select', period)
}

function formatPeriod(startYear, endYear) {
  const start = formatYear(startYear).replace('年', '')
  const end = formatYear(endYear).replace('年', '')
  return `${start} - ${end}`
}

onMounted(() => {
  if (listRef.value && props.selectedPeriod) {
    const index = periods.findIndex(d => d.id === props.selectedPeriod.id)
    if (index >= 0) {
      const item = listRef.value.children[index]
      if (item) {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }
})
</script>

<style scoped>
.dynasty-panel {
  width: 280px;
  height: 100%;
  background: rgba(255, 248, 240, 0.95);
  border-right: 1px solid #D7CCC8;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #D7CCC8;
  background: linear-gradient(to bottom, rgba(255, 248, 240, 1), rgba(255, 248, 240, 0.9));
}

.panel-header h2 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #3E2723;
}

.dynasty-count {
  font-size: 12px;
  color: #888;
}

.dynasty-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.dynasty-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  background: transparent;
}

.dynasty-item:hover {
  background: rgba(139, 69, 19, 0.08);
}

.dynasty-item.active {
  background: rgba(139, 69, 19, 0.15);
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.2);
}

.dynasty-item.multi-state {
  border-left: 3px solid #FFD700;
}

.dynasty-color-bar {
  width: 4px;
  height: 40px;
  border-radius: 2px;
  background: var(--period-color, #8B4513);
  margin-right: 12px;
  transition: width 0.2s ease;
}

.dynasty-item:hover .dynasty-color-bar,
.dynasty-item.active .dynasty-color-bar {
  width: 6px;
}

.dynasty-content {
  flex: 1;
}

.dynasty-name {
  font-size: 15px;
  font-weight: 600;
  color: #3E2723;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dynasty-item.active .dynasty-name {
  color: var(--period-color, #8B4513);
}

.multi-badge {
  display: inline-block;
  background: #FFD700;
  color: #3E2723;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.dynasty-period {
  font-size: 12px;
  color: #888;
}

.nation-count {
  color: #B8860B;
  font-weight: 500;
}

.dynasty-arrow {
  color: #ccc;
  transition: transform 0.2s ease, color 0.2s ease;
}

.dynasty-item:hover .dynasty-arrow,
.dynasty-item.active .dynasty-arrow {
  color: var(--period-color, #8B4513);
  transform: translateX(2px);
}

.panel-footer {
  padding: 12px 20px;
  border-top: 1px solid #D7CCC8;
  text-align: center;
  background: rgba(255, 248, 240, 0.8);
}

.footer-hint {
  font-size: 12px;
  color: #999;
}

.dynasty-list::-webkit-scrollbar {
  width: 4px;
}

.dynasty-list::-webkit-scrollbar-track {
  background: transparent;
}

.dynasty-list::-webkit-scrollbar-thumb {
  background: rgba(139, 69, 19, 0.3);
  border-radius: 2px;
}

.dynasty-list::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 69, 19, 0.5);
}
</style>