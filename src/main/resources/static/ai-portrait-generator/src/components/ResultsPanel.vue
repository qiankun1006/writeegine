<template>
  <div class="results-panel">
    <!-- 上方预览区（占 90%） -->
    <div class="preview-area">
      <!-- 生成中的加载动画 -->
      <div v-if="store.isGenerating" class="loading-container">
        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: store.generationProgress + '%' }"></div>
            <div class="particles">
              <div v-for="i in 15" :key="i" class="particle"></div>
            </div>
          </div>
          <div class="progress-info">
            <span class="progress-text">生成中...{{ store.generationProgress }}%</span>
            <span class="progress-time">预计还需 {{ estimatedTime }} 秒</span>
          </div>
        </div>
        <div class="loading-hint">🎨 AI 正在为您创作绝美人物立绘，请稍候...</div>
      </div>

      <!-- 结果展示区 -->
      <div v-else-if="store.results.length > 0" class="results-list">
        <div class="results-header">
          <h3>📸 生成结果 ({{ store.results.length }})</h3>
          <el-button
            type="danger"
            text
            size="small"
            @click="clearResults"
          >
            清除全部
          </el-button>
        </div>

        <div class="result-cards">
          <ResultCard
            v-for="(result, index) in store.results"
            :key="result.id"
            :result="result"
            :index="index"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">🎨</div>
        <p class="empty-title">还未生成任何图片</p>
        <p class="empty-hint">调整左侧参数后，点击「开始生成」按钮开始创作</p>
      </div>
    </div>

    <!-- 下方操作区（占 10%） -->
    <div class="action-area">
      <el-button
        type="primary"
        :loading="store.isGenerating"
        :disabled="!store.isAllValid || store.isGenerating"
        size="large"
        @click="handleGenerate"
      >
        <template v-if="store.isGenerating">
          {{ store.generationProgress }}% - 生成中...
        </template>
        <template v-else>
          🚀 开始生成
        </template>
      </el-button>

      <el-button
        :disabled="store.isGenerating"
        size="large"
        @click="handleReset"
      >
        🔄 重置参数
      </el-button>

      <el-alert
        v-if="store.generationError"
        :title="store.generationError"
        type="error"
        :closable="true"
        class="error-alert"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, watch} from 'vue'
import {ElMessage} from 'element-plus'
import {usePortraitStore} from '@/stores/portraitStore'
import ResultCard from './ResultCard.vue'

const store = usePortraitStore()

const estimatedTime = computed(() => {
  const remaining = 100 - store.generationProgress
  // 基于进度估算剩余时间（秒）
  if (remaining > 70) return Math.ceil(remaining / 10)
  if (remaining > 30) return Math.ceil(remaining / 8)
  return Math.ceil(remaining / 5)
})

// 模拟生成进度（示例）
watch(() => store.isGenerating, (isGenerating) => {
  if (isGenerating) {
    simulateProgress()
  }
})

const simulateProgress = () => {
  let progress = 0
  const interval = setInterval(() => {
    progress += Math.random() * 15
    if (progress > 95) {
      progress = 95
      clearInterval(interval)
    }
    store.updateProgress(progress)
  }, 500)
}

// 处理开始生成
const handleGenerate = () => {
  if (!store.isAllValid) {
    ElMessage.error('请检查参数是否有效')
    return
  }
  store.startGeneration()
  ElMessage.success('开始生成中...')

  // TODO: 调用后端 API
  console.log('生成参数:', store.params)
}

// 处理重置参数
const handleReset = () => {
  store.resetParams()
  store.clearResults()
  ElMessage.success('已重置所有参数')
}

const clearResults = () => {
  store.clearResults()
}
</script>

<style scoped lang="scss">

// ========== 结果面板容器 ==========
.results-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  background-color: #ffffff;
  overflow: hidden;
}

// ========== 上方预览区（占 90%） ==========
.preview-area {
  flex: 9;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  padding: 16px;
  min-height: 0;
  border-bottom: 1px solid #f0f0f0;
}

// ========== 下方操作区（占 10%） ==========
.action-area {
  flex: 1;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  background-color: #fafafa;
  border-top: 1px solid #f0f0f0;
  min-height: 0;
  overflow-y: auto;

  :deep(.el-button) {
    flex-shrink: 0;
    height: 40px;
    padding: 0 24px;
    font-size: 14px;
    font-weight: 500;
  }

  .error-alert {
    flex: 1;
    margin: 0;
    min-width: 0;
  }
}

// ========== 加载动画区域 ==========
.loading-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  height: 100%;
}

// ========== 进度条区域 ==========
.progress-section {
  width: 100%;
  max-width: 400px;
}

.progress-bar {
  position: relative;
  height: 8px;
  background-color: #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6c5ce7 0%, #0984e3 100%);
  transition: width 0.3s ease;
  position: relative;
  overflow: visible;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  bottom: 0;
  width: 2px;
  height: 2px;
  background-color: rgba(9, 132, 227, 0.8);
  border-radius: 50%;
  animation: float-up 2s ease-in infinite;

  @for $i from 1 through 15 {
    &:nth-child(#{$i}) {
      left: #{random(100)}%;
      animation-delay: #{$i * 0.1}s;
      opacity: #{random(80) * 0.01 + 0.2};
    }
  }
}

@keyframes float-up {
  0% {
    bottom: 0;
    opacity: 0.8;
  }

  100% {
    bottom: 100%;
    opacity: 0;
  }
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.progress-text {
  font-weight: 600;
  color: #6c5ce7;
}

.progress-time {
  color: #909399;
}

// ========== 加载提示 ==========
.loading-hint {
  text-align: center;
  color: #909399;
  font-size: 14px;
  margin-top: 8px;
}

// ========== 结果列表区域 ==========
.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  overflow: hidden;
}

// ========== 结果头部 ==========
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

// ========== 结果卡片网格 ==========
.result-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  min-height: 0;

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 3px;

    &:hover {
      background: #b3b3b3;
    }
  }
}

// ========== 空状态 ==========
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  opacity: 0.5;
  line-height: 1;
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: #606266;
}

.empty-hint {
  font-size: 13px;
  margin: 0;
  text-align: center;
  max-width: 300px;
  color: #909399;
}
</style>

