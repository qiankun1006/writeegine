<template>
  <!-- 核心参数面板：包含风格选择、提示词、参考图片等参数配置 -->
  <div class="core-params-panel">

    <!-- 素材类型选择模块：用户可以选择不同的素材创作类型 -->
    <div class="asset-type-module">
      <!-- 素材类型选择组件 -->
      <AssetTypeSelector />
    </div>

    <!-- 风格模型选择模块：用户可以选择不同的AI生成风格（日系、油画、3D等） -->
    <div class="style-module">
      <!-- 风格模型选择组件 -->
      <StyleModelSelector />
    </div>

    <!-- AI模型提供商选择模块：用户可以选择不同的AI模型提供商 -->
    <div class="provider-module">
      <!-- AI模型提供商选择组件 -->
      <ModelProviderSelector />
    </div>

    <!-- 提示词模块：包含正面和负面提示词输入框 -->
    <div class="prompt-module">
      <!-- 模块标题：📝 提示词 -->
      <h3 class="module-title">📝 提示词</h3>

      <!-- 正面提示词输入区域：用户输入想要的效果描述 -->
      <div class="params-section">
        <!-- 标签：说明这是正面提示词 -->
        <label class="section-label">正面提示词</label>
        <!-- 文本输入框：绑定到Pinia存储中的prompt字段 -->
        <!-- 双向绑定Pinia存储的prompt字段，用户输入的内容自动同步 -->
        <!-- 使用文本域类型（多行文本框），显示4行高度 -->
        <!-- 最多输入500个字符，显示字数统计（如 10/500） -->
        <!-- 显示清除按钮（X按钮），失焦时保存参数 -->
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
        <!-- 验证错误提示：当提示词长度不符合1-500字符要求时显示 -->
        <div v-if="!store.isPromptValid" class="error-hint">
          <!-- 警告图标 -->
          <el-icon><Warning /></el-icon>
          <!-- 错误提示文本 -->
          <span>提示词长度需为 1-500 字符</span>
        </div>
      </div>

      <!-- 负面提示词输入区域：用户输入要避免的效果 -->
      <div class="params-section">
        <!-- 标签：说明这是负面提示词（告诉AI不要生成什么） -->
        <label class="section-label">负面提示词</label>
        <!-- 文本输入框：绑定到Pinia存储中的negativePrompt字段 -->
        <!-- 双向绑定Pinia存储的negativePrompt字段，使用文本域类型 -->
        <!-- 显示3行高度，最多输入500个字符 -->
        <!-- 显示字数统计，显示清除按钮，失焦时保存参数 -->
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

    <!-- 生成尺寸模块：选择图片生成尺寸 -->
    <div class="size-module">
      <!-- 尺寸选择组件 -->
      <SizeSelector />
    </div>

    <!-- 参考图片模块：允许用户上传参考图片来指导生成 -->
    <div class="reference-module" v-if="!isSkeletonMode">
      <!-- 模块标题：🖼️ 参考图片 -->
      <h3 class="module-title">🖼️ 参考图片</h3>
      <!-- 参考图片上传组件，监听@image-selected事件 -->
      <ReferenceImageUpload @image-selected="handleImageSelected" />
    </div>

    <!-- 骨骼素材生成参数面板：当选中骨骼素材类型时显示 -->
    <div class="skeleton-module" v-if="isSkeletonMode">
      <!-- 模块标题：🦴 骨骼素材参数 -->
      <h3 class="module-title">🦴 骨骼素材参数</h3>
      <!-- 骨骼素材参数面板组件 -->
      <SkeletonAssetPanel v-model="skeletonParams" />
    </div>

    <!-- 生成进度显示：当正在生成时显示 -->
    <div class="progress-module" v-if="store.isGenerating">
      <GenerationProgress />
    </div>

    <!-- 骨骼素材结果展示：当有骨骼素材结果时显示 -->
    <div class="results-module" v-if="isSkeletonMode && store.skeletonResults.length > 0">
      <h3 class="module-title">🎨 生成结果</h3>
      <div class="results-container">
        <SkeletonResultPanel
          v-for="result in store.skeletonResults"
          :key="result.id"
          :result="{
            fullImageUrl: result.fullImageUrl,
            parts: result.parts
          }"
        />
      </div>
    </div>

    <!-- 错误提示框：当图片生成过程中出现错误时显示 -->
    <!-- v-if 只在存在生成错误时才显示 -->
    <!-- type="error" 显示为错误样式（红色背景） -->
    <!-- 动态显示错误信息内容，提供关闭按钮 -->
    <!-- 关闭时清空错误信息，应用样式类名 -->
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
// ========== 引入依赖 ==========
// 导入 Pinia 状态管理的肖像生成器存储
import {usePortraitStore} from '@/stores/portraitStore'
// 从 Element Plus 导入警告图标
import {Warning} from '@element-plus/icons-vue'
// 导入参考图片上传组件
import ReferenceImageUpload from './ReferenceImageUpload.vue'
// 导入素材类型选择组件
import AssetTypeSelector from './AssetTypeSelector.vue'
// 导入风格模型选择组件
import StyleModelSelector from './StyleModelSelector.vue'
// 导入AI模型提供商选择组件
import ModelProviderSelector from './ModelProviderSelector.vue'
// 导入尺寸选择组件
import SizeSelector from './SizeSelector.vue'
// 导入骨骼参数类型
import type {SkeletonParams} from './SkeletonAssetPanel.vue'
// 导入骨骼素材参数面板组件
import SkeletonAssetPanel from './SkeletonAssetPanel.vue'
// 导入进度显示组件
import GenerationProgress from './GenerationProgress.vue'
// 导入结果展示组件
import SkeletonResultPanel from './SkeletonResultPanel.vue'
// 导入计算属性
import {computed, ref, watch} from 'vue'

// ========== 初始化存储 ==========
// 创建肖像生成器的 Pinia 存储实例，用来管理全局的参数状态
const store = usePortraitStore()

// ========== 页面初始化 ==========
// 加载用户之前保存的参数配置（从 localStorage 中恢复）
store.loadParams()

// ========== 骨骼素材相关 ==========
// 计算属性：检查是否为骨骼素材模式
const isSkeletonMode = computed(() => store.currentAssetType === 'character-skeleton')

// 骨骼素材参数（用于 v-model 绑定）
const skeletonParams = ref<SkeletonParams>({
  style: 'anime',
  template: 'animation',
  openPoseTemplate: 'openpose_18',
  pose: 'standing',
  referenceImageUrl: '',
  referenceImageBase64: '',
})

// 监听骨骼参数变化，同步到 store（包含 openPoseTemplate）
watch(skeletonParams, (val) => {
  store.updateSkeletonParams(val)
}, { deep: true })

// ========== 事件处理函数 ==========
/**
 * 处理参考图片选择事件
 * @param file - 用户选择的图片文件，如果为null表示删除了图片
 */
const handleImageSelected = (file: File | null) => {
  // 将选中的图片设置到 Pinia 存储中
  store.setReferenceImage(file)
  // 同时触发参数变更处理，保存所有参数
  handleParamChange()
}

/**
 * 处理参数变更事件
 * 当用户修改任何参数后，自动保存到本地存储（localStorage）
 */
const handleParamChange = () => {
  // 调用 Pinia 存储的 saveParams 方法，将当前参数保存到 localStorage
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

// ========== 素材类型选择模块 ==========
.asset-type-module {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// ========== 风格模型选择模块 ==========
.style-module {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// ========== AI模型提供商选择模块 ==========
.provider-module {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// ========== 提示词模块 ==========
.prompt-module {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// ========== 尺寸模块 ==========
.size-module {
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

// ========== 骨骼素材模块 ==========
.skeleton-module {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

// ========== 进度模块 ==========
.progress-module {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f0f8ff;
  border-radius: 8px;
  border: 1px solid #d6e4ff;
}

// ========== 结果模块 ==========
.results-module {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #f6ffed;
  border-radius: 8px;
  border: 1px solid #b7eb8f;
}

.results-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

