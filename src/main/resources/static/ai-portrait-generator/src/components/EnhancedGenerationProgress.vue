<template>
  <div class="enhanced-generation-progress">
    <!-- 步骤进度条 -->
    <div class="progress-steps">
      <div
        v-for="(step, index) in enhancedSteps"
        :key="step.id"
        class="step-item"
        :class="{
          'active': stepIndex > index,
          'current': stepIndex === index,
          'pending': stepIndex < index
        }"
        @click="jumpToStep(index)"
      >
        <div class="step-icon">
          <div class="icon-circle">
            <el-icon v-if="stepIndex > index"><Check /></el-icon>
            <span v-else>{{ index + 1 }}</span>
          </div>
        </div>
        <div class="step-info">
          <div class="step-title">{{ step.title }}</div>
          <div class="step-description">{{ step.description }}</div>
          <div class="step-duration" v-if="stepIndex > index && step.duration">
            <el-icon><Timer /></el-icon>
            <span>{{ formatDuration(step.duration) }}</span>
          </div>
        </div>
        <div class="step-progress" v-if="stepIndex === index">
          <el-progress
            :percentage="stepProgress"
            :stroke-width="6"
            :color="stepProgressColor"
            :show-text="false"
          />
        </div>
      </div>
    </div>

    <!-- 进度详情 -->
    <div class="progress-details">
      <!-- 当前步骤详情 -->
      <div class="current-step-section" v-if="currentStep">
        <div class="section-header">
          <h3>当前步骤：{{ currentStep.title }}</h3>
          <div class="step-progress-info">
            <el-tag :type="stepProgressColorType">{{ stepProgress }}%</el-tag>
            <span class="estimated-time" v-if="estimatedTime > 0">
              预计剩余时间：{{ formatTime(estimatedTime) }}
            </span>
          </div>
        </div>
        <div class="step-description-box">
          <p>{{ currentStep.detailedDescription }}</p>
        </div>
        <div class="step-technologies">
          <span class="tech-tag" v-for="tech in currentStep.technologies" :key="tech">
            <el-tag size="small">{{ tech }}</el-tag>
          </span>
        </div>
      </div>

      <!-- 资源使用情况 -->
      <div class="resource-section">
        <div class="section-header">
          <h3>资源使用情况</h3>
          <span class="resource-status">{{ resourceStatus }}</span>
        </div>
        <div class="resource-metrics">
          <div class="metric-item">
            <div class="metric-label">CPU 使用率</div>
            <el-progress
              :percentage="cpuUsage"
              :stroke-width="12"
              :color="getProgressColor(cpuUsage)"
            />
            <div class="metric-value">{{ cpuUsage }}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">GPU 使用率</div>
            <el-progress
              :percentage="gpuUsage"
              :stroke-width="12"
              :color="getProgressColor(gpuUsage)"
            />
            <div class="metric-value">{{ gpuUsage }}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">内存使用</div>
            <el-progress
              :percentage="memoryUsage"
              :stroke-width="12"
              :color="getProgressColor(memoryUsage)"
            />
            <div class="metric-value">{{ memoryUsage }}%</div>
          </div>
        </div>
      </div>

      <!-- 生成日志 -->
      <div class="logs-section" v-if="logs.length > 0">
        <div class="section-header">
          <h3>生成日志</h3>
          <div class="logs-controls">
            <el-button size="small" @click="clearLogs">清空</el-button>
            <el-button size="small" @click="toggleAutoScroll">
              {{ autoScroll ? '暂停滚动' : '自动滚动' }}
            </el-button>
          </div>
        </div>
        <div class="logs-container" ref="logsContainer">
          <div
            v-for="(log, index) in logs"
            :key="index"
            class="log-item"
            :class="log.type"
          >
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <el-tag size="small" :type="getLogTypeColor(log.type)">
              {{ getLogTypeText(log.type) }}
            </el-tag>
            <span class="log-message">{{ log.message }}</span>
            <span class="log-duration" v-if="log.duration">
              ({{ formatDuration(log.duration) }})
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onUnmounted, ref} from 'vue'
import {Check, Timer} from '@element-plus/icons-vue'

interface Step {
  id: string
  title: string
  description: string
  detailedDescription: string
  technologies: string[]
  estimatedDuration: number // 秒
  duration?: number // 实际耗时（秒）
}

interface Log {
  timestamp: number
  type: 'info' | 'success' | 'warning' | 'error' | 'processing'
  message: string
  duration?: number
}

// 8步增强流水线步骤
const enhancedSteps = ref<Step[]>([
  {
    id: 'openpose',
    title: '生成OpenPose骨骼模板',
    description: '创建标准T-pose骨骼线图',
    detailedDescription: '正在根据选择的OpenPose模板生成标准T-pose骨骼线图，作为AI生成的姿势约束基准。',
    technologies: ['OpenPose', 'T-Pose', '骨骼关键点'],
    estimatedDuration: 5
  },
  {
    id: 'controlnet',
    title: '应用ControlNet约束',
    description: '使用姿势约束指导AI生成',
    detailedDescription: '正在应用ControlNet OpenPose约束，确保生成的图像遵循正确的骨骼结构。',
    technologies: ['ControlNet', 'OpenPose', '姿势约束'],
    estimatedDuration: 15
  },
  {
    id: 'ip-adapter',
    title: '提取IP-Adapter特征',
    description: '从参考图提取风格特征',
    detailedDescription: '正在使用IP-Adapter从参考图像中提取风格特征，以保持角色一致性。',
    technologies: ['IP-Adapter', '特征提取', '风格迁移'],
    estimatedDuration: 10
  },
  {
    id: 'flux-generation',
    title: 'Flux.1-dev高清生成',
    description: '生成高质量人物图像',
    detailedDescription: '正在使用Flux.1-dev模型生成2048x2048高清人物图像，结合ControlNet约束和IP-Adapter特征。',
    technologies: ['Flux.1-dev', '高清生成', 'AI绘画'],
    estimatedDuration: 30
  },
  {
    id: 'background-removal',
    title: '背景去除',
    description: '移除图像背景',
    detailedDescription: '正在使用RMBG-2.0模型去除背景，生成透明背景的PNG图像。',
    technologies: ['RMBG-2.0', '背景去除', '透明背景'],
    estimatedDuration: 10
  },
  {
    id: 'sam-segmentation',
    title: 'SAM 2精确分割',
    description: '分割人体肢体部件',
    detailedDescription: '正在使用SAM 2模型基于OpenPose关键点进行精确的肢体部件分割。',
    technologies: ['SAM 2', '语义分割', '部件提取'],
    estimatedDuration: 20
  },
  {
    id: 'skeleton-binding',
    title: '生成骨骼绑定数据',
    description: '创建Spine兼容数据',
    detailedDescription: '正在生成Spine/DragonBones兼容的骨骼绑定数据，包括骨骼结构和动画参数。',
    technologies: ['骨骼绑定', 'Spine', 'DragonBones'],
    estimatedDuration: 15
  },
  {
    id: 'export-packaging',
    title: '打包导出',
    description: '打包为游戏可用资源',
    detailedDescription: '正在将所有部件和骨骼数据打包为ZIP文件，包含多种格式的游戏引擎资源。',
    technologies: ['ZIP打包', '资源导出', '多格式支持'],
    estimatedDuration: 5
  }
])

// 进度相关状态
const stepIndex = ref(0)
const stepProgress = ref(0)
const logs = ref<Log[]>([])
const autoScroll = ref(true)

// 资源监控状态
const cpuUsage = ref(0)
const gpuUsage = ref(0)
const memoryUsage = ref(0)
const resourceUpdateInterval = ref<NodeJS.Timeout | null>(null)

// 当前步骤信息
const currentStep = computed(() => {
  return enhancedSteps.value[stepIndex.value]
})

// 进度条颜色
const stepProgressColor = computed(() => {
  if (stepProgress.value < 50) return '#409eff'
  if (stepProgress.value < 80) return '#e6a23c'
  return '#67c23a'
})

const stepProgressColorType = computed(() => {
  if (stepProgress.value < 50) return 'primary'
  if (stepProgress.value < 80) return 'warning'
  return 'success'
})

// 预计剩余时间
const estimatedTime = computed(() => {
  const totalEstimated = enhancedSteps.value
    .slice(stepIndex.value)
    .reduce((sum, step) => sum + step.estimatedDuration, 0)
  return Math.max(0, totalEstimated - stepIndex.value * 5) // 减去已完成步骤的预估时间
})

// 资源状态
const resourceStatus = computed(() => {
  const maxUsage = Math.max(cpuUsage.value, gpuUsage.value, memoryUsage.value)
  if (maxUsage > 80) return '资源紧张'
  if (maxUsage > 60) return '正常'
  return '空闲'
})

// 格式化时间
const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}分${remainingSeconds}秒`
}

const formatDuration = (seconds: number) => {
  return formatTime(seconds)
}

// 格式化日志时间
const formatLogTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
}

// 获取日志类型颜色
const getLogTypeColor = (type: Log['type']) => {
  switch (type) {
    case 'info': return ''
    case 'success': return 'success'
    case 'warning': return 'warning'
    case 'error': return 'danger'
    case 'processing': return 'primary'
    default: return ''
  }
}

// 获取日志类型文本
const getLogTypeText = (type: Log['type']) => {
  switch (type) {
    case 'info': return '信息'
    case 'success': return '成功'
    case 'warning': return '警告'
    case 'error': return '错误'
    case 'processing': return '处理中'
    default: return type
  }
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#409eff'
  if (percentage < 80) return '#e6a23c'
  return '#67c23a'
}

// 跳转到指定步骤
const jumpToStep = (index: number) => {
  if (index <= stepIndex.value) {
    stepIndex.value = index
    stepProgress.value = 0
    addLog('processing', `跳转到步骤: ${enhancedSteps.value[index].title}`)
  }
}

// 添加日志
const addLog = (type: Log['type'], message: string, duration?: number) => {
  logs.value.push({
    timestamp: Date.now(),
    type,
    message,
    duration
  })

  if (autoScroll.value) {
    nextTick(() => {
      const container = document.querySelector('.logs-container')
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    })
  }
}

// 清空日志
const clearLogs = () => {
  logs.value = []
}

// 切换自动滚动
const toggleAutoScroll = () => {
  autoScroll.value = !autoScroll.value
}

// 模拟资源监控
const startResourceMonitoring = () => {
  resourceUpdateInterval.value = setInterval(() => {
    // 模拟资源使用情况
    cpuUsage.value = Math.min(100, Math.max(20, Math.random() * 100))
    gpuUsage.value = Math.min(100, Math.max(30, Math.random() * 100))
    memoryUsage.value = Math.min(100, Math.max(40, Math.random() * 100))
  }, 2000)
}

// 模拟进度更新（实际使用时应该从后端接收WebSocket更新）
const simulateProgress = () => {
  const totalSteps = enhancedSteps.value.length

  // 重置进度
  stepIndex.value = 0
  stepProgress.value = 0
  logs.value = []

  // 开始模拟
  const stepInterval = setInterval(() => {
    // 更新当前步骤进度
    if (stepProgress.value < 100) {
      stepProgress.value += 5

      // 模拟日志
      if (stepProgress.value % 20 === 0) {
        addLog('info', `${currentStep.value.title} 进度 ${stepProgress.value}%`)
      }
    } else {
      // 记录当前步骤耗时
      const stepDuration = currentStep.value.estimatedDuration
      enhancedSteps.value[stepIndex.value].duration = stepDuration
      addLog('success', `${currentStep.value.title} 完成 (${formatDuration(stepDuration)})`, stepDuration)

      // 移动到下一步骤
      stepIndex.value++
      stepProgress.value = 0

      // 如果所有步骤完成
      if (stepIndex.value >= totalSteps) {
        clearInterval(stepInterval)
        addLog('success', '8步AI骨骼生成流水线完成！')
        return
      }

      // 开始新步骤
      addLog('info', `开始: ${currentStep.value.title}`)
    }
  }, 500) // 500ms 更新一次进度
}

// 开始模拟生成（实际使用时应该由父组件调用）
const startSimulation = () => {
  simulateProgress()
  startResourceMonitoring()
}

// 组件销毁时清理
onUnmounted(() => {
  if (resourceUpdateInterval.value) {
    clearInterval(resourceUpdateInterval.value)
  }
})

// 暴露方法给父组件
defineExpose({
  startSimulation,
  updateProgress: (step: number, progress: number, message?: string) => {
    stepIndex.value = step
    stepProgress.value = progress
    if (message) {
      addLog('info', message)
    }
  },
  addLog,
  resetProgress: () => {
    stepIndex.value = 0
    stepProgress.value = 0
    enhancedSteps.value.forEach(step => {
      delete step.duration
    })
    logs.value = []
  }
})

// 初始化日志
addLog('info', '8步AI骨骼生成流水线就绪')
addLog('processing', '等待开始生成...')
</script>

<style scoped lang="scss">
.enhanced-generation-progress {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.progress-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid #e4e7ed;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #f0f7ff;
    border-color: #c0e0ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
  }

  &.active {
    background: #e6f7ff;
    border-color: #91d5ff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);

    .icon-circle {
      background: #409eff;
      color: white;
    }
  }

  &.current {
    background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%);
    border-color: #409eff;
    border-width: 2px;
    box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);

    .icon-circle {
      background: #1677ff;
      color: white;
      box-shadow: 0 2px 8px rgba(22, 119, 255, 0.3);
    }

    .step-title {
      color: #1677ff;
      font-weight: 600;
    }
  }

  &.pending {
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }
}

.step-icon {
  flex-shrink: 0;
}

.icon-circle {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #d9d9d9;
  color: #8c8c8c;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;

  .el-icon {
    font-size: 18px;
  }
}

.step-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.step-description {
  font-size: 13px;
  color: #606266;
}

.step-duration {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;

  .el-icon {
    font-size: 12px;
  }
}

.step-progress {
  width: 150px;
  flex-shrink: 0;
}

.progress-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.current-step-section {
  padding: 16px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%);
  border-radius: 10px;
  border: 1px solid #91d5ff;

  .step-progress-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .estimated-time {
      font-size: 13px;
      color: #606266;
    }
  }

  .step-description-box {
    padding: 12px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e8e8e8;
    margin: 12px 0;

    p {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      color: #303133;
    }
  }

  .step-technologies {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;

    .tech-tag {
      :deep(.el-tag) {
        font-size: 11px;
        padding: 4px 8px;
      }
    }
  }
}

.resource-section {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;

  .resource-status {
    font-size: 13px;
    padding: 4px 10px;
    border-radius: 12px;
    background: #e6f7ff;
    color: #409eff;
    font-weight: 500;
  }

  .resource-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    .metric-item {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .metric-label {
        font-size: 13px;
        font-weight: 500;
        color: #606266;
      }

      :deep(.el-progress) {
        .el-progress-bar {
          .el-progress-bar__outer {
            border-radius: 4px;
          }

          .el-progress-bar__inner {
            border-radius: 4px;
            transition: width 0.5s ease;
          }
        }
      }

      .metric-value {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        text-align: right;
      }
    }
  }
}

.logs-section {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;

  .logs-controls {
    display: flex;
    gap: 8px;
  }

  .logs-container {
    max-height: 200px;
    overflow-y: auto;
    padding: 12px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e8e8e8;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 12px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f5f5f5;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;

      &:hover {
        background: #a8a8a8;
      }
    }
  }

  .log-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    &.success {
      background: #f6ffed;
    }

    &.warning {
      background: #fff7e6;
    }

    &.error {
      background: #fff2f0;
    }

    &.processing {
      background: #f0f7ff;
    }

    .log-time {
      color: #8c8c8c;
      min-width: 60px;
    }

    .log-message {
      flex: 1;
      color: #303133;
    }

    .log-duration {
      color: #909399;
      font-style: italic;
    }

    :deep(.el-tag) {
      height: 20px;
      line-height: 20px;
      font-size: 11px;
      min-width: 50px;
      text-align: center;
    }
  }
}
</style>

