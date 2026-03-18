<template>
  <div
    class="progress-bar"
    :class="[typeClass, statusClass, speedClass, { 'progress-bar--low-health': showLowHealthWarning }]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    :style="containerStyle"
    ref="containerRef"
  >
    <!-- 背景层 -->
    <div class="progress-background" :style="backgroundStyle"></div>

    <!-- 填充层 -->
    <div
      class="progress-fill"
      :style="fillStyle"
      @mousedown="handleDragStart"
      @touchstart="handleDragStart"
    >
      <!-- 根据类型显示不同内容 -->
      <template v-if="type === 'health'">
        <!-- 血滴效果 -->
        <div class="blood-drops" v-if="showBloodDrops">
          <div
            v-for="(drop, index) in bloodDrops"
            :key="index"
            class="blood-drop"
            :style="drop.style"
          ></div>
        </div>
        <!-- HP数值 -->
        <span v-if="showValue" class="progress-value">
          {{ currentValue }} HP
        </span>
      </template>

      <template v-else-if="type === 'loading'">
        <!-- 条纹动画 -->
        <div class="progress-bar--loading-stripe"></div>
        <!-- 百分比 -->
        <span class="progress-percentage">
          {{ percentage }}%
        </span>
      </template>

      <template v-else-if="type === 'energy'">
        <!-- 流光效果 -->
        <div class="progress-bar--energy-flow"></div>
        <!-- 能量数值 -->
        <span v-if="showValue" class="progress-value">
          {{ currentValue }}
        </span>
      </template>

      <template v-else-if="type === 'pixel'">
        <!-- 像素数值 -->
        <span class="progress-value" style="font-family: 'Courier New', monospace;">
          {{ Math.floor(percentage) }}%
        </span>
      </template>

      <template v-else>
        <!-- 默认数值显示 -->
        <span v-if="showValue" class="progress-value">
          {{ currentValue }}{{ unit }}
        </span>
      </template>
    </div>

    <!-- 边框层 -->
    <div class="progress-border" :style="borderStyle"></div>

    <!-- 状态图标 -->
    <div v-if="statusIcon" class="status-icon">
      <span v-if="status === 'success'">✓</span>
      <span v-else-if="status === 'error'">✗</span>
      <span v-else-if="status === 'loading'">⌛</span>
    </div>

    <!-- Tooltip -->
    <div
      v-if="showTooltip"
      class="progress-tooltip"
      :style="tooltipStyle"
    >
      {{ tooltipContent }}
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref, watch} from 'vue'

// Props定义
const props = defineProps({
  // 基础属性
  type: {
    type: String,
    default: 'simple',
    validator: (value) => ['simple', 'health', 'energy', 'loading', 'pixel', 'glass'].includes(value)
  },
  value: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  },
  max: {
    type: Number,
    default: 100
  },

  // 显示属性
  showValue: {
    type: Boolean,
    default: true
  },
  unit: {
    type: String,
    default: ''
  },

  // 样式属性
  backgroundColor: {
    type: String,
    default: '#f0f0f0'
  },
  fillColor: {
    type: String,
    default: '#1890ff'
  },
  borderColor: {
    type: String,
    default: '#d9d9d9'
  },
  borderWidth: {
    type: Number,
    default: 1
  },
  borderRadius: {
    type: Number,
    default: 4
  },

  // 血条特定属性
  healthStartColor: {
    type: String,
    default: '#8b0000' // 深红
  },
  healthEndColor: {
    type: String,
    default: '#ff0000' // 鲜红
  },
  showBloodDrops: {
    type: Boolean,
    default: true
  },
  lowHealthThreshold: {
    type: Number,
    default: 20
  },
  showLowHealthWarning: {
    type: Boolean,
    default: true
  },

  // 能量条特定属性
  energyStartColor: {
    type: String,
    default: '#1890ff' // 蓝色
  },
  energyEndColor: {
    type: String,
    default: '#722ed1' // 紫色
  },

  // 动画属性
  animate: {
    type: Boolean,
    default: true
  },
  animationSpeed: {
    type: Number,
    default: 0.3,
    validator: (value) => value >= 0.2 && value <= 1
  },

  // 状态属性
  status: {
    type: String,
    default: 'idle',
    validator: (value) => ['idle', 'loading', 'success', 'error'].includes(value)
  },

  // Tooltip属性
  tooltip: {
    type: String,
    default: ''
  },
  assetName: {
    type: String,
    default: ''
  },
  apiStatus: {
    type: String,
    default: ''
  },

  // 尺寸属性
  width: {
    type: [String, Number],
    default: '100%'
  },
  height: {
    type: [String, Number],
    default: 24
  }
})

// Emits定义
const emit = defineEmits([
  'update:value',
  'change',
  'drag-start',
  'drag-end',
  'mouse-enter',
  'mouse-leave'
])

// 响应式状态
const currentValue = ref(props.value)
const isDragging = ref(false)
const showTooltip = ref(false)
const containerRef = ref(null)

// 血滴效果
const bloodDrops = ref([])

// 计算属性
const percentage = computed(() => {
  return Math.min(100, Math.max(0, (currentValue.value / props.max) * 100))
})

const typeClass = computed(() => `progress-bar--${props.type}`)

const statusClass = computed(() => {
  if (props.status === 'error') return 'progress-bar--error'
  if (props.status === 'success') return 'progress-bar--success'
  if (props.status === 'loading') return 'progress-bar--loading'
  return ''
})

const speedClass = computed(() => {
  if (props.animationSpeed <= 0.3) return 'progress-bar--speed-fast'
  if (props.animationSpeed <= 0.6) return 'progress-bar--speed-normal'
  return 'progress-bar--speed-slow'
})

const statusIcon = computed(() => {
  return props.status !== 'idle'
})

const tooltipContent = computed(() => {
  if (props.tooltip) return props.tooltip

  const parts = []
  parts.push(`进度: ${percentage.value.toFixed(1)}%`)

  if (props.assetName) {
    parts.push(`资产: ${props.assetName}`)
  }

  if (props.apiStatus) {
    parts.push(`状态: ${props.apiStatus}`)
  }

  return parts.join(' | ')
})

// 样式计算
const containerStyle = computed(() => {
  const style = {}

  if (typeof props.width === 'number') {
    style.width = `${props.width}px`
  } else {
    style.width = props.width
  }

  if (typeof props.height === 'number') {
    style.height = `${props.height}px`
  } else {
    style.height = props.height
  }

  style.borderRadius = `${props.borderRadius}px`

  return style
})

const backgroundStyle = computed(() => {
  const style = {}

  switch (props.type) {
    case 'health':
      style.background = `linear-gradient(90deg, ${props.healthStartColor}, ${props.healthEndColor})`
      break
    case 'energy':
      style.background = `radial-gradient(circle at center, ${props.energyStartColor}, ${props.energyEndColor})`
      break
    case 'glass':
      style.background = 'rgba(255, 255, 255, 0.1)'
      style.backdropFilter = 'blur(10px)'
      break
    default:
      style.backgroundColor = props.backgroundColor
  }

  return style
})

const fillStyle = computed(() => {
  const style = {
    width: `${percentage.value}%`
  }

  if (props.animate) {
    style.transition = `width ${props.animationSpeed}s ease`
  }

  switch (props.type) {
    case 'simple':
      style.backgroundColor = props.fillColor
      break
    case 'health':
      style.background = `linear-gradient(90deg, ${props.healthStartColor}, ${props.healthEndColor})`
      break
    case 'energy':
      style.background = `radial-gradient(circle at center, ${props.energyStartColor}, ${props.energyEndColor})`
      break
    case 'loading':
      style.background = `repeating-linear-gradient(
        45deg,
        ${props.fillColor},
        ${props.fillColor} 10px,
        ${props.fillColor}80 10px,
        ${props.fillColor}80 20px
      )`
      break
    case 'pixel':
      style.backgroundColor = props.fillColor
      style.clipPath = `inset(0 ${100 - percentage.value}% 0 0)`
      break
    case 'glass':
      style.backgroundColor = `${props.fillColor}80` // 80 = 50%透明度
      break
  }

  return style
})

const borderStyle = computed(() => {
  const style = {
    border: `${props.borderWidth}px solid ${props.borderColor}`
  }

  if (props.type === 'pixel') {
    style.borderImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M0,0 L8,0 L8,8 L0,8 Z' fill='none' stroke='${props.borderColor.replace('#', '%23')}' stroke-width='2'/%3E%3C/svg%3E") 2 stretch`
    style.border = 'none'
  }

  return style
})

const tooltipStyle = computed(() => {
  return {
    '--animation-speed': `${props.animationSpeed}s`
  }
})

// 方法
const handleMouseEnter = () => {
  showTooltip.value = true
  emit('mouse-enter', currentValue.value)
}

const handleMouseLeave = () => {
  showTooltip.value = false
  emit('mouse-leave', currentValue.value)
}

const handleDragStart = (event) => {
  if (!props.animate || props.status === 'loading') return

  isDragging.value = true
  emit('drag-start', currentValue.value)

  const handleDragMove = (moveEvent) => {
    if (!isDragging.value || !containerRef.value) return

    const clientX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX)
    if (!clientX) return

    const rect = containerRef.value.getBoundingClientRect()
    const relativeX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const newValue = Math.round(relativeX * props.max)

    if (newValue !== currentValue.value) {
      currentValue.value = newValue
      emit('update:value', newValue)
      emit('change', newValue)
    }
  }

  const handleDragEnd = () => {
    isDragging.value = false
    emit('drag-end', currentValue.value)

    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchmove', handleDragMove)
    document.removeEventListener('touchend', handleDragEnd)
  }

  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
  document.addEventListener('touchmove', handleDragMove)
  document.addEventListener('touchend', handleDragEnd)

  // 初始移动
  handleDragMove(event)
}

// 生成血滴效果
const generateBloodDrops = () => {
  if (props.type !== 'health' || !props.showBloodDrops) {
    bloodDrops.value = []
    return
  }

  const drops = []
  const dropCount = Math.floor(percentage.value / 10) // 每10%一个血滴

  for (let i = 0; i < dropCount; i++) {
    drops.push({
      style: {
        left: `${Math.random() * percentage.value}%`,
        animationDelay: `${Math.random() * 2}s`,
        width: `${2 + Math.random() * 4}px`,
        height: `${2 + Math.random() * 4}px`
      }
    })
  }

  bloodDrops.value = drops
}

// 监听器
watch(() => props.value, (newVal) => {
  if (props.animate && !isDragging.value) {
    currentValue.value = newVal
  }
})

watch(() => percentage.value, () => {
  generateBloodDrops()
})

// 生命周期
onMounted(() => {
  generateBloodDrops()
})

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('mousemove', () => {})
  document.removeEventListener('mouseup', () => {})
  document.removeEventListener('touchmove', () => {})
  document.removeEventListener('touchend', () => {})
})
</script>

<style scoped>
/* 组件作用域样式 */
.progress-bar {
  cursor: pointer;
  user-select: none;
}

.progress-bar--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 血条低血量警告 */
.progress-bar--low-health {
  animation: shake 0.5s ease-in-out;
}

/* 能量条充能效果 */
.progress-bar--charging .progress-fill {
  animation: charge-pulse 2s infinite;
}

/* 加载条条纹动画 */
.progress-bar--loading-stripe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.3) 10px,
    rgba(255, 255, 255, 0.3) 20px
  );
  animation: stripe 1s linear infinite;
}

/* 能量条流光效果 */
.progress-bar--energy-flow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: flow 2s linear infinite;
}

/* 像素条阶梯动画 */
.progress-bar--step-animation .progress-fill {
  animation: step-fill 2s steps(8, end);
}

/* 玻璃拟态模糊效果 */
.progress-bar--glass-effect .progress-background {
  animation: glass-blur 3s ease-in-out infinite;
}
</style>

