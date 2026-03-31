<template>
  <div class="generation-progress">
    <div class="progress-header">
      <h4>生成进度</h4>
      <span class="progress-text">{{ progress }}%</span>
    </div>

    <el-progress
      :percentage="progress"
      :status="progressStatus"
      :stroke-width="8"
    />

    <div class="stage-info">
      <p class="current-stage">{{ currentStage }}</p>
      <div class="stage-steps">
        <div
          v-for="(step, index) in stages"
          :key="index"
          class="stage-step"
          :class="{ 'stage-step--completed': progress >= step.progress }"
        >
          <div class="step-indicator">
            <el-icon v-if="progress >= step.progress"><Check /></el-icon>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-label">{{ step.label }}</span>
        </div>
      </div>
    </div>

    <el-button
      v-if="canCancel"
      type="danger"
      size="small"
      @click="cancelGeneration"
    >
      取消生成
    </el-button>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {usePortraitStore} from '@/stores/portraitStore'
import {Check} from '@element-plus/icons-vue'

const store = usePortraitStore()

// 基础模式阶段
const basicStages = [
  { label: '生成全身图', progress: 10 },
  { label: '全身图完成', progress: 70 },
  { label: '分割肢体', progress: 75 },
  { label: '透明底处理', progress: 95 },
  { label: '完成', progress: 100 }
]

// 增强模式阶段（8步AI流水线）
const enhancedStages = [
  { label: 'T-pose骨骼线图', progress: 5 },
  { label: 'ControlNet约束', progress: 10 },
  { label: 'IP-Adapter特征', progress: 15 },
  { label: 'Flux.1-dev生成', progress: 60 },
  { label: '背景去除', progress: 70 },
  { label: 'SAM 2分割', progress: 85 },
  { label: '骨骼绑定', progress: 95 },
  { label: '完成', progress: 100 }
]

const stages = computed(() => {
  return store.currentGenerationMode === 'enhanced' ? enhancedStages : basicStages
})

const progressStatus = computed(() => {
  if (store.generationError) return 'exception'
  if (store.generationProgress === 100) return 'success'
  return 'active'
})

const canCancel = computed(() => {
  return store.isGenerating && store.generationProgress < 100
})

const cancelGeneration = () => {
  // 实现取消生成逻辑
}
</script>

<style scoped lang="scss">
.generation-progress {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .progress-text {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
  }
}

.stage-info {
  .current-stage {
    margin: 8px 0;
    font-size: 14px;
    color: #606266;
    text-align: center;
  }

  .stage-steps {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
  }

  .stage-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1;
    position: relative;

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 12px;
      right: -50%;
      width: 100%;
      height: 2px;
      background: #e8e8e8;
      z-index: 1;
    }

    .step-indicator {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #e8e8e8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: #909399;
      z-index: 2;
    }

    .step-label {
      font-size: 12px;
      color: #909399;
      text-align: center;
    }

    &.stage-step--completed {
      .step-indicator {
        background: #67c23a;
        color: white;
      }

      .step-label {
        color: #67c23a;
        font-weight: 500;
      }

      &:not(:last-child)::after {
        background: #67c23a;
      }
    }
  }
}
</style>

