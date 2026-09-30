<template>
  <div class="time-slider">
    <div class="slider-header">
      <span class="time-label">时间轴</span>
      <span class="current-time">{{ displayYear }}</span>
    </div>
    
    <div class="slider-container">
      <div class="slider-track">
        <!-- 朝代标记 -->
        <div
          v-for="mark in timeMarks"
          :key="mark.year"
          class="time-mark"
          :class="{ 'has-dynasty': mark.hasDynasty }"
          :style="{ left: getMarkPosition(mark.year) + '%' }"
          @click="jumpToYear(mark.year)"
        >
          <div class="mark-line"></div>
          <div v-if="mark.hasDynasty" class="mark-label">{{ mark.label }}</div>
        </div>
      </div>
      
      <!-- 滑块 -->
      <div class="slider-wrapper">
        <input
          type="range"
          :min="minYear"
          :max="maxYear"
          :value="currentYear"
          @input="onSliderChange"
          class="slider-input"
        />
        <div
          class="slider-thumb"
          :style="{ left: getThumbPosition() + '%' }"
        >
          <div class="thumb-label">{{ displayYear }}</div>
        </div>
      </div>
    </div>

    <div class="slider-footer">
      <span class="year-label">{{ formatYear(minYear) }}</span>
      <div class="control-buttons">
        <button class="control-btn" @click="playAnimation" :disabled="isPlaying">
          <svg v-if="!isPlaying" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
        <button class="control-btn" @click="resetSlider">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>
      </div>
      <span class="year-label">{{ formatYear(maxYear) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { periods, getPeriodByYear, formatYear } from '../data/dynasties'

const props = defineProps({
  modelValue: {
    type: Number,
    default: -2070
  }
})

const emit = defineEmits(['update:modelValue', 'dynastyChange'])

// 时间范围：公元前2070年到2026年
const minYear = -2070
const maxYear = 2026

const currentYear = ref(props.modelValue)
const isPlaying = ref(false)
let playInterval = null

// 计算属性：显示年份
const displayYear = computed(() => {
  return formatYear(currentYear.value)
})

// 时间标记（每个朝代开始年份）
const timeMarks = computed(() => {
  return periods.map(d => ({
    year: d.startYear,
    label: d.name,
    hasDynasty: true
  }))
})

// 获取标记位置百分比
function getMarkPosition(year) {
  return ((year - minYear) / (maxYear - minYear)) * 100
}

// 获取滑块位置百分比
function getThumbPosition() {
  return ((currentYear.value - minYear) / (maxYear - minYear)) * 100
}

// 滑块变化处理
function onSliderChange(e) {
  const year = parseInt(e.target.value)
  currentYear.value = year
  emit('update:modelValue', year)

  // 查找对应的时期
  const period = getPeriodByYear(year)
  if (period) {
    emit('periodChange', period)
  }
}

// 跳转到指定年份
function jumpToYear(year) {
  currentYear.value = year
  emit('update:modelValue', year)

  const period = getPeriodByYear(year)
  if (period) {
    emit('periodChange', period)
  }
}

// 播放动画
function playAnimation() {
  if (isPlaying.value) {
    stopAnimation()
    return
  }

  isPlaying.value = true

  playInterval = setInterval(() => {
    if (currentYear.value >= maxYear) {
      currentYear.value = minYear
    } else {
      // 根据时间段调整步长
      let step = 1
      if (currentYear.value < -221) step = 50 // 先秦时期大步长
      else if (currentYear.value < 618) step = 5 // 秦汉到隋
      else if (currentYear.value < 1368) step = 10 // 唐宋元
      else step = 5 // 明清以后

      currentYear.value = Math.min(currentYear.value + step, maxYear)
    }

    emit('update:modelValue', currentYear.value)

    const period = getPeriodByYear(currentYear.value)
    if (period) {
      emit('periodChange', period)
    }
  }, 500)
}

// 停止动画
function stopAnimation() {
  isPlaying.value = false
  if (playInterval) {
    clearInterval(playInterval)
    playInterval = null
  }
}

// 重置滑块
function resetSlider() {
  stopAnimation()
  currentYear.value = minYear
  emit('update:modelValue', minYear)

  const period = getPeriodByYear(minYear)
  if (period) {
    emit('periodChange', period)
  }
}

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== currentYear.value) {
    currentYear.value = newVal
  }
})

// 组件卸载时清理
onUnmounted(() => {
  stopAnimation()
})
</script>

<style scoped>
.time-slider {
  background: var(--panel-bg, rgba(255, 248, 240, 0.95));
  border-top: 1px solid var(--border-color, #D7CCC8);
  padding: 16px 24px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.time-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color, #3E2723);
}

.current-time {
  font-size: 20px;
  font-weight: 700;
  color: var(--secondary-color, #D2691E);
}

.slider-container {
  position: relative;
  height: 60px;
  margin-bottom: 12px;
}

.slider-track {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, 
    #9370DB 0%, #20B2AA 12%, #FFD700 24%, #FF6347 36%, 
    #2F4F4F 42%, #4169E1 48%, #9932CC 54%, #3CB371 60%, 
    #FF4500 66%, #87CEEB 72%, #00CED1 78%, #DC143C 84%, 
    #FFD700 90%, #708090 96%, #FF0000 100%
  );
  border-radius: 1px;
}

.time-mark {
  position: absolute;
  top: -4px;
  transform: translateX(-50%);
  cursor: pointer;
}

.mark-line {
  width: 2px;
  height: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 1px;
}

.time-mark.has-dynasty .mark-line {
  height: 16px;
  background: var(--secondary-color, #D2691E);
}

.mark-label {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: #666;
  white-space: nowrap;
}

.time-mark.has-dynasty .mark-label {
  color: var(--secondary-color, #D2691E);
  font-weight: 600;
}

.slider-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.slider-input {
  width: 100%;
  height: 40px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  position: relative;
  z-index: 2;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--secondary-color, #D2691E);
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: grab;
  margin-top: 10px;
}

.slider-input::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.1);
}

.slider-input::-webkit-slider-runnable-track {
  height: 2px;
  background: transparent;
}

.slider-thumb {
  position: absolute;
  top: 18px;
  transform: translateX(-50%);
  pointer-events: none;
}

.thumb-label {
  background: var(--secondary-color, #D2691E);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transform: translateX(10px);
}

.slider-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.year-label {
  font-size: 12px;
  color: #888;
  min-width: 70px;
}

.year-label:last-child {
  text-align: right;
}

.control-buttons {
  display: flex;
  gap: 8px;
}

.control-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: var(--secondary-color, #D2691E);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  background: var(--primary-color, #8B4513);
  transform: scale(1.05);
}

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
