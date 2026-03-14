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
import {computed, ref, watch} from 'vue'
import {ElMessage} from 'element-plus'
import {usePortraitStore} from '@/stores/portraitStore'
import ResultCard from './ResultCard.vue'

const store = usePortraitStore()

// 当前生成任务 ID（用于轮询查询进度）
const currentTaskId = ref<string | null>(null)

// 轮询计时器 ID
let pollInterval: ReturnType<typeof setInterval> | null = null

/**
 * 计算剩余估计时间（秒）
 * 基于当前进度和预计总耗时来估算剩余秒数
 */
const estimatedTime = computed(() => {
  const remaining = 100 - store.generationProgress
  // 基于剩余进度估算剩余秒数
  if (remaining > 70) return Math.ceil(remaining / 10)
  if (remaining > 30) return Math.ceil(remaining / 8)
  return Math.ceil(remaining / 5)
})

/**
 * 当生成状态改变时
 * 如果开始生成，启动轮询；如果结束生成，停止轮询
 */
watch(() => store.isGenerating, (isGenerating) => {
  if (isGenerating) {
    // 刚开始生成，不需要立即轮询，等待后端返回 taskId
  } else {
    // 生成已结束或被取消，停止轮询
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }
})

/**
 * 轮询查询生成进度
 * 前端每 1 秒查询一次后端的进度接口
 * 根据返回的进度更新 UI
 * 当任务完成时，获取生成结果
 */
const pollGenerationProgress = async () => {
  if (!currentTaskId.value) {
    return
  }

  try {
    // 获取用户 ID（从 localStorage 或其他地方）
    const userId = localStorage.getItem('userId') || '1'

    // 调用后端进度查询接口
    const response = await fetch(`/api/ai/portrait/progress/${currentTaskId.value}`, {
      method: 'GET',
      headers: {
        'X-User-Id': userId,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`查询进度失败: ${response.status}`)
    }

    const data = await response.json()
    console.log('📊 进度更新:', data)

    // 更新本地 store 中的进度
    if (data.progress !== undefined) {
      store.updateProgress(data.progress)
    }

    // 根据任务状态处理
    if (data.status === 'PROCESSING') {
      // 任务仍在处理中，继续轮询
      // 不需要做任何操作，下一个间隔会再次查询
    } else if (data.status === 'SUCCESS') {
      // 任务完成成功
      console.log('✓ 生成成功，获取结果:', data)

      // 更新进度为 100%
      store.updateProgress(100)

      // 停止轮询
      if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
      }

      // 添加生成结果到 store
      if (data.imageUrls && Array.isArray(data.imageUrls)) {
        data.imageUrls.forEach((url: string, index: number) => {
          store.addResult({
            id: `result_${currentTaskId.value}_${index}`,
            url: url,
            timestamp: new Date().getTime(),
            taskId: currentTaskId.value || ''
          })
        })
      }

      // 结束生成
      store.endGeneration()
      ElMessage.success('🎉 生成完成！')
      currentTaskId.value = null

    } else if (data.status === 'FAILED') {
      // 任务失败
      console.error('❌ 生成失败:', data)

      // 停止轮询
      if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
      }

      // 设置错误信息
      store.setGenerationError(data.errorMessage || '生成失败，请重试')
      store.endGeneration()
      ElMessage.error(data.errorMessage || '生成失败')
      currentTaskId.value = null
    }

  } catch (error) {
    console.error('❌ 轮询进度时出错:', error)
    // 错误处理：可以重试或提示用户
  }
}

/**
 * 处理开始生成
 *
 * 流程：
 * 1. 验证所有参数是否有效
 * 2. 调用后端生成 API
 * 3. 获取 taskId
 * 4. 启动轮询查询进度
 */
const handleGenerate = async () => {
  // 步骤1：参数验证
  if (!store.isAllValid) {
    ElMessage.error('请检查参数是否有效')
    return
  }

  try {
    // 标记开始生成
    store.startGeneration()
    ElMessage.loading('正在提交生成任务...')

    // 获取用户 ID
    const userId = localStorage.getItem('userId') || '1'

    // 步骤2：构建请求参数
    // 前端 store 参数映射到后端 DTO
    const generateRequest = {
      prompt: store.params.prompt,                           // 正面提示词
      negativePrompt: store.params.negativePrompt,           // 负面提示词
      referenceImageBase64: store.params.referenceImagePreview || null,  // 参考图片（Base64）
      modelWeight: store.params.modelWeight,                 // 模型权重
      width: store.params.width,                             // 宽度
      height: store.params.height,                           // 高度
      provider: store.params.provider,                       // 服务提供商
      modelVersion: store.params.modelVersion,               // 模型版本
      imageStrength: store.params.imageStrength || 0.6,      // 参考图片强度
      generateCount: store.params.generateCount,             // 生成数量
      sampler: store.params.sampler,                         // 采样器
      steps: store.params.steps,                             // 迭代步数
      stylePreset: store.params.stylePreset,                 // 风格预设
      seed: store.params.seed,                               // 随机种子
      faceEnhance: store.params.faceEnhance,                 // 面部增强
      outputFormat: store.params.outputFormat                // 输出格式
    }

    console.log('📤 发送生成请求:', generateRequest)

    // 步骤3：调用后端生成 API
    const response = await fetch('/api/ai/portrait/generate', {
      method: 'POST',
      headers: {
        'X-User-Id': userId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(generateRequest)
    })

    // 处理响应
    if (!response.ok) {
      throw new Error(`生成请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('📥 后端返回响应:', data)

    // 步骤4：获取 taskId 并启动轮询
    if (data.taskId) {
      currentTaskId.value = data.taskId
      console.log('🔄 开始轮询进度，taskId:', currentTaskId.value)

      // 清空之前的轮询
      if (pollInterval) {
        clearInterval(pollInterval)
      }

      // 立即查询一次进度
      await pollGenerationProgress()

      // 每秒轮询一次进度
      pollInterval = setInterval(() => {
        pollGenerationProgress()
      }, 1000)

      ElMessage.success('生成任务已提交，正在处理中...')

    } else {
      throw new Error('后端未返回 taskId')
    }

  } catch (error) {
    console.error('❌ 生成请求失败:', error)
    const errorMsg = error instanceof Error ? error.message : '生成失败，请检查参数'
    store.setGenerationError(errorMsg)
    store.endGeneration()
    ElMessage.error(errorMsg)
  }
}

/**
 * 处理重置参数
 * 重置所有参数到默认值，清空生成结果
 */
const handleReset = () => {
  store.resetParams()
  store.clearResults()

  // 停止轮询
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }

  currentTaskId.value = null
  ElMessage.success('已重置所有参数')
}

/**
 * 清除生成结果
 */
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

