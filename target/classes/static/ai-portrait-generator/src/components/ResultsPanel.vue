<template>
  <div class="results-panel">
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
</template>

<script setup lang="ts">
import {computed, watch} from 'vue'
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

const clearResults = () => {
  store.clearResults()
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.results-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

// 加载动画区域
.loading-container {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  @include flex-center;
  min-height: 300px;
}

.progress-section {
  width: 100%;
  max-width: 400px;
}

.progress-bar {
  position: relative;
  height: 8px;
  background-color: $gray-200;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: $spacing-md;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $primary-purple 0%, $secondary-blue 100%);
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
  background-color: rgba($secondary-blue, 0.8);
  border-radius: 50%;
  animation: float-up 2s ease-in infinite;

  @for $i from 1 through 15 {
    &:nth-child(#{$i}) {
      left: percentage(random(100) * 0.01);
      animation-delay: ($i * 0.1s);
      opacity: random(80) * 0.01 + 0.2;
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
  color: $primary-purple;
}

.progress-time {
  color: $gray-500;
}

.loading-hint {
  text-align: center;
  color: $gray-500;
  font-size: 14px;
}

// 结果列表区域
.results-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  height: 100%;
}

.results-header {
  @include flex-between;
  padding-bottom: $spacing-md;
  border-bottom: 1px solid $gray-200;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.result-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: $spacing-md;
  overflow-y: auto;
  flex: 1;

  @include responsive-tablet {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }

  @include responsive-mobile {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

// 空状态
.empty-state {
  @include flex-center;
  flex-direction: column;
  gap: $spacing-md;
  height: 100%;
  color: $gray-500;
}

.empty-icon {
  font-size: 64px;
  opacity: 0.5;
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: $neutral-gray;
}

.empty-hint {
  font-size: 13px;
  margin: 0;
  text-align: center;
  max-width: 300px;
}
</style>

