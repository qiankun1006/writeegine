<template>
  <div class="core-params-panel">
    <!-- 提示词输入 -->
    <div class="params-section">
      <label class="section-label">🎨 提示词输入</label>
      <div class="input-wrapper">
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
    </div>

    <!-- 负面提示词输入 -->
    <div class="params-section">
      <label class="section-label">🚫 负面提示词</label>
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

    <!-- 参考图片上传 -->
    <div class="params-section">
      <label class="section-label">🖼️ 参考图片</label>
      <ReferenceImageUpload @image-selected="handleImageSelected" />
    </div>

    <!-- 模型权重 -->
    <div class="params-section">
      <label class="section-label">⚖️ 模型权重</label>
      <div class="slider-wrapper">
        <el-slider
          v-model="store.params.modelWeight"
          :min="0"
          :max="1"
          :step="0.01"
          :marks="{ 0: '0', 0.5: '0.5', 1: '1' }"
          @change="handleParamChange"
        />
        <span class="value-display">{{ store.params.modelWeight.toFixed(2) }}</span>
      </div>
      <p class="param-hint">值越高越贴近参考图，建议 0.7-0.9</p>
    </div>

    <!-- 尺寸选择 -->
    <div class="params-section">
      <label class="section-label">📐 生成尺寸</label>
      <div class="size-presets">
        <el-button
          v-for="preset in sizePresets"
          :key="`${preset.width}x${preset.height}`"
          :type="isSizeSelected(preset.width, preset.height) ? 'primary' : 'default'"
          size="small"
          @click="selectSize(preset.width, preset.height)"
        >
          {{ preset.label }}
        </el-button>
      </div>

      <div class="custom-size">
        <el-input-number
          v-model="store.params.width"
          :min="256"
          :max="2048"
          label="宽"
          size="small"
          @change="validateSize"
          class="size-input"
        />
        <el-input-number
          v-model="store.params.height"
          :min="256"
          :max="2048"
          label="高"
          size="small"
          @change="validateSize"
          class="size-input"
        />
      </div>

      <div v-if="!store.isSizeValid" class="error-hint">
        <el-icon><Warning /></el-icon>
        <span>尺寸必须为 2 的幂次 (256, 512, 1024, 2048)</span>
      </div>
      <p class="param-hint">选择尺寸：{{ store.params.width }}×{{ store.params.height }}</p>
    </div>

    <!-- 高级参数折叠面板 -->
    <AdvancedParamsPanel />

    <!-- 生成按钮 -->
    <el-button
      type="primary"
      size="large"
      class="generate-button"
      :disabled="!store.isAllValid || store.isGenerating"
      :loading="store.isGenerating"
      @click="handleGenerate"
    >
      <span v-if="!store.isGenerating">✨ 开始生成</span>
      <span v-else>⏳ 生成中...</span>
    </el-button>

    <!-- 重置按钮 -->
    <el-button
      plain
      size="large"
      class="reset-button"
      @click="handleReset"
    >
      🔄 重置参数
    </el-button>

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
import {ref} from 'vue'
import {usePortraitStore} from '@/stores/portraitStore'
import {ElMessage} from 'element-plus'
import {Warning} from '@element-plus/icons-vue'
import ReferenceImageUpload from './ReferenceImageUpload.vue'
import AdvancedParamsPanel from './AdvancedParamsPanel.vue'

const store = usePortraitStore()

// 初始化：加载保存的参数
store.loadParams()

const sizePresets = ref([
  { label: '竖版\n512×768', width: 512, height: 768 },
  { label: '方形\n1024×1024', width: 1024, height: 1024 },
  { label: '高清\n2048×2048', width: 2048, height: 2048 },
])

const isSizeSelected = (width: number, height: number) => {
  return store.params.width === width && store.params.height === height
}

const selectSize = (width: number, height: number) => {
  store.params.width = width
  store.params.height = height
  handleParamChange()
}

const validateSize = () => {
  const validSizes = [256, 512, 1024, 2048]
  if (!validSizes.includes(store.params.width)) {
    store.params.width = 512
  }
  if (!validSizes.includes(store.params.height)) {
    store.params.height = 768
  }
  handleParamChange()
}

const handleImageSelected = (file: File | null) => {
  store.setReferenceImage(file)
  handleParamChange()
}

const handleParamChange = () => {
  store.saveParams()
}

const handleGenerate = () => {
  if (!store.isAllValid.value) {
    ElMessage.error('请检查参数是否有效')
    return
  }
  store.startGeneration()
  ElMessage.success('开始生成中...')

  // TODO: 调用后端 API
  console.log('生成参数:', store.params)
}

const handleReset = () => {
  store.resetParams()
  ElMessage.success('已重置所有参数')
}
</script>

<style scoped lang="scss">

.core-params-panel {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.params-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: $neutral-gray;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.error-hint {
  @include flex-center;
  gap: $spacing-sm;
  padding: $spacing-sm;
  background-color: rgba($error, 0.1);
  border: 1px solid $error;
  border-radius: $radius-md;
  color: $error;
  font-size: 12px;

  :deep(.el-icon) {
    font-size: 14px;
  }
}

.param-hint {
  font-size: 12px;
  color: $gray-500;
  margin: 0;
  padding: $spacing-xs;
}

.slider-wrapper {
  display: flex;
  gap: $spacing-md;
  align-items: center;
}

:deep(.el-slider) {
  flex: 1;
}

.value-display {
  font-weight: 600;
  color: $primary-purple;
  min-width: 40px;
  text-align: right;
}

.size-presets {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: $spacing-sm;
}

.custom-size {
  display: flex;
  gap: $spacing-sm;
}

.size-input {
  flex: 1;
}

.generate-button {
  @include gradient-button;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  margin-top: $spacing-md;
}

.reset-button {
  height: 40px;
}

.error-alert {
  margin-top: $spacing-md;
}
</style>

