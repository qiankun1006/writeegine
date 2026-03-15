<template>
  <div class="core-params-panel">
    <!-- 风格模型选择模块 -->
    <div class="style-module">
      <StyleModelSelector />
    </div>

    <!-- 提示词模块 -->
    <div class="prompt-module">
      <h3 class="module-title">📝 提示词</h3>

      <!-- 正面提示词 -->
      <div class="params-section">
        <label class="section-label">正面提示词</label>
        <el-input
          v-model="store.params.prompt"
          type="textarea"
          rows="4"
          placeholder="例如：日系二次元少女，长发粉发，猫耳，穿洛丽塔裙，纯色背景，光影柔和"
          maxlength="500"
          show-word-limit
          clearable
          @blur="handleParamChange"
          class="prompt-input"
        />
        <div v-if="!store.isPromptValid" class="error-hint">
          <el-icon><Warning /></el-icon>
          <span>提示词长度需为 1-500 字符</span>
        </div>
      </div>

      <!-- 负面提示词 -->
      <div class="params-section">
        <label class="section-label">负面提示词</label>
        <el-input
          v-model="store.params.negativePrompt"
          type="textarea"
          rows="3"
          placeholder="例如：模糊，多手指，水印，变形，低分辨率"
          maxlength="500"
          show-word-limit
          clearable
          @blur="handleParamChange"
        />
      </div>
    </div>

    <!-- 参考图片模块 -->
    <div class="reference-module">
      <h3 class="module-title">🖼️ 参考图片</h3>
      <ReferenceImageUpload @image-selected="handleImageSelected" />
    </div>

    <!-- 错误提示 -->
    <el-alert
      v-if="store.generationError"
      type="error"
      :title="store.generationError"
      closable
      @close="store.generationError = null"
      class="error-alert"
    />
  </div>
</template>

<script setup lang="ts">
import {usePortraitStore} from '@/stores/portraitStore'
import {Warning} from '@element-plus/icons-vue'
import ReferenceImageUpload from './ReferenceImageUpload.vue'
import StyleModelSelector from './StyleModelSelector.vue'

const store = usePortraitStore()

// 初始化：加载保存的参数
store.loadParams()

// 处理参考图片选择
const handleImageSelected = (file: File | null) => {
  store.setReferenceImage(file)
  handleParamChange()
}

// 参数变更时保存到本地
const handleParamChange = () => {
  store.saveParams()
}
</script>

<style scoped lang="scss">

.core-params-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

// ========== 风格模型选择模块 ==========
.style-module {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

// ========== 提示词模块 ==========
.prompt-module {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// ========== 参考图片模块 ==========
.reference-module {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// ========== 模块标题 ==========
.module-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  padding: 0;
}

// ========== 参数小节 ==========
.params-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.section-label {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
  text-transform: none;
  letter-spacing: normal;
}

// ========== 错误提示 ==========
.error-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background-color: rgba(245, 34, 45, 0.1);
  border: 1px solid #f5222d;
  border-radius: 4px;
  color: #f5222d;
  font-size: 12px;

  :deep(.el-icon) {
    font-size: 14px;
    flex-shrink: 0;
  }
}

// ========== 错误提示框 ==========
.error-alert {
  margin-top: 8px;
}
</style>

