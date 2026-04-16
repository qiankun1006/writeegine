<template>
  <div class="skeleton-asset-panel">
    <!-- 风格选择 -->
    <div class="param-section">
      <label class="section-label">
        风格选择
        <el-tooltip content="选择生成骨骼素材的艺术风格，不同风格会使用不同的 LoRA 模型">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </label>
      <el-select v-model="selectedStyle" placeholder="请选择风格" size="default">
        <el-option label="日系二次元" value="anime" />
        <el-option label="写实人体" value="realistic" />
        <el-option label="Q版卡通" value="chibi" />
        <el-option label="美式卡通" value="cartoon" />
        <el-option label="像素风" value="pixel" />
      </el-select>
    </div>

    <!-- OpenPose骨骼模板选择 -->
    <div class="param-section">
      <label class="section-label">
        OpenPose骨骼模板
        <el-tooltip content="选择骨骼关键点模板：18点适合基础动画，25点适合高级动画（包含足部细节）">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </label>
      <el-radio-group v-model="openPoseTemplate" size="default" @change="onTemplateChange">
        <el-radio-button label="openpose_18">OpenPose 18点</el-radio-button>
        <el-radio-button label="openpose_25">OpenPose 25点</el-radio-button>
      </el-radio-group>

      <!-- 骨骼预览 -->
      <div class="skeleton-preview" v-if="skeletonPreviewUrl">
        <img :src="skeletonPreviewUrl" alt="骨骼预览" class="preview-image" />
        <div class="preview-label">T-Pose骨骼预览</div>
      </div>

      <div class="template-info" v-if="selectedTemplateInfo">
        <div class="info-item">
          <span class="info-label">描述：</span>
          <span class="info-value">{{ selectedTemplateInfo.description }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">适用场景：</span>
          <span class="info-value">{{ selectedTemplateInfo.useCases?.join('、') }}</span>
        </div>
      </div>
    </div>

    <!-- 姿态选择 -->
    <div class="param-section">
      <label class="section-label">
        角色姿态
        <el-tooltip content="选择生成角色的基本姿态">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </label>
      <el-select v-model="selectedPose" placeholder="请选择姿态" size="default">
        <el-option label="站立" value="standing" />
        <el-option label="行走" value="walking" />
        <el-option label="奔跑" value="running" />
        <el-option label="攻击" value="attacking" />
        <el-option label="施法" value="casting" />
        <el-option label="待机" value="idle" />
      </el-select>
    </div>

    <!-- 生成模式选择 -->
    <div class="param-section">
      <label class="section-label">
        生成模式
        <el-tooltip content="选择骨骼素材生成模式：基础模式使用简单算法，增强模式使用完整8步AI流水线">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </label>
      <el-radio-group v-model="generationMode" size="default" @change="onModeChange">
        <el-radio-button label="basic">基础模式</el-radio-button>
        <el-radio-button label="enhanced">增强模式</el-radio-button>
      </el-radio-group>

      <div class="mode-description" v-if="generationMode === 'enhanced'">
        <el-alert
          type="info"
          :closable="false"
          show-icon
          title="增强模式使用完整8步AI流水线"
          description="OpenPose → ControlNet → IP-Adapter → Flux.1-dev → 背景去除 → SAM 2 → 骨骼绑定"
        />
      </div>
    </div>

    <!-- 参考图上传 -->
    <div class="param-section">
      <label class="section-label">
        参考图
        <span class="label-hint">（保持人物一致性）</span>
      </label>
      <div
        class="reference-upload"
        :class="{ 'has-image': referenceImagePreview }"
        @click="triggerFileInput"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          style="display: none"
          @change="onFileSelect"
        />
        <template v-if="isUploading">
          <el-icon class="upload-icon is-loading"><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M512 64a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V96a32 32 0 0 1 32-32zm0 640a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V736a32 32 0 0 1 32-32zm448-192a32 32 0 0 1-32 32H736a32 32 0 0 1 0-64h192a32 32 0 0 1 32 32zm-640 0a32 32 0 0 1-32 32H96a32 32 0 0 1 0-64h192a32 32 0 0 1 32 32z"/></svg></el-icon>
          <p class="upload-text">正在上传...</p>
        </template>
        <template v-else-if="referenceImagePreview">
          <img :src="referenceImagePreview" alt="参考图" class="preview-image" />
          <div class="image-overlay">
            <el-button size="small" @click.stop="removeReferenceImage">移除</el-button>
          </div>
          <div v-if="referenceImageUrl" class="upload-url-hint">✓ 已上传到服务器</div>
        </template>
        <template v-else>
          <el-icon class="upload-icon"><Upload /></el-icon>
          <p class="upload-text">拖拽图片或点击上传</p>
          <p class="upload-hint">支持 PNG、JPG、WEBP，最大 10MB</p>
        </template>
      </div>
    </div>

    <!-- 输出部件预览 -->
    <div class="param-section">
      <label class="section-label">
        输出部件
        <el-tooltip content="生成的骨骼素材将被自动分割为以下部件">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </label>
      <div class="parts-preview">
        <div v-for="part in outputParts" :key="part.id" class="part-item">
          <span class="part-emoji">{{ part.icon }}</span>
          <span class="part-name">{{ part.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import {QuestionFilled, Upload} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'
import {usePortraitStore} from '@/stores/portraitStore'

const store = usePortraitStore()

// Props
interface Props {
  modelValue?: SkeletonParams
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    style: 'anime',
    template: 'animation',
    pose: 'standing',
    referenceImageBase64: '',
  }),
})

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: SkeletonParams): void
}>()

// 类型定义
export interface SkeletonParams {
  style: 'anime' | 'realistic' | 'chibi' | 'cartoon' | 'pixel'
  template: 'standard' | 'animation'
  openPoseTemplate: 'openpose_18' | 'openpose_25'
  pose: string
  /** 图片上传后的 HTTP URL（推荐，优先于 referenceImageBase64） */
  referenceImageUrl: string
  /** @deprecated 兼容旧版，新代码请使用 referenceImageUrl */
  referenceImageBase64: string
  referenceImagePreview?: string
}

// 本地状态
const selectedStyle = ref<'anime' | 'realistic' | 'chibi' | 'cartoon' | 'pixel'>(
  (props.modelValue.style as any) || 'anime'
)
const skeletonTemplate = ref<'standard' | 'animation'>(
  (props.modelValue.template as any) || 'animation'
)
const openPoseTemplate = ref<'openpose_18' | 'openpose_25'>(
  (props.modelValue.openPoseTemplate as any) || 'openpose_18'
)
const selectedPose = ref(props.modelValue.pose || 'standing')
const referenceImageBase64 = ref(props.modelValue.referenceImageBase64 || '')
const referenceImageUrl = ref(props.modelValue.referenceImageUrl || '')
const referenceImagePreview = ref(props.modelValue.referenceImagePreview || '')
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

  // OpenPose模板相关状态
  const skeletonPreviewUrl = ref('')
  const selectedTemplateInfo = ref(null)
  const isLoadingPreview = ref(false)

  // 生成模式状态
  const generationMode = ref<'basic' | 'enhanced'>('basic')

// 输出部件列表
const outputParts = [
  { id: 'head', name: '头部', icon: '👤' },
  { id: 'torso', name: '躯干', icon: '🧍' },
  { id: 'leftArm', name: '左臂', icon: '💪' },
  { id: 'rightArm', name: '右臂', icon: '💪' },
  { id: 'leftLeg', name: '左腿', icon: '🦵' },
  { id: 'rightLeg', name: '右腿', icon: '🦵' },
]

// 监听本地状态变化，通知父组件
watch(
  [selectedStyle, skeletonTemplate, openPoseTemplate, selectedPose, referenceImageBase64, referenceImageUrl],
  () => {
    emit('update:modelValue', {
      style: selectedStyle.value,
      template: skeletonTemplate.value,
      openPoseTemplate: openPoseTemplate.value,
      pose: selectedPose.value,
      referenceImageUrl: referenceImageUrl.value,
      referenceImageBase64: referenceImageBase64.value,
      referenceImagePreview: referenceImagePreview.value,
    })
  }
)

// 文件上传相关方法
const triggerFileInput = () => {
  fileInput.value?.click()
}

const onDragOver = () => {
  // 拖拽悬停效果可以在 CSS 中处理
}

const onDragLeave = () => {
  // 拖拽离开效果
}

const onDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files[0]
  if (file) {
    handleFileSelect(file)
  }
}

const onFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    handleFileSelect(file)
  }
}

const handleFileSelect = async (file: File) => {
  // 验证文件格式
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  if (!validTypes.includes(file.type)) {
    ElMessage.error('文件格式错误，请上传 PNG、JPG 或 WEBP 格式图片')
    return
  }

  // 验证文件大小（10MB）
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('文件过大，请上传小于 10MB 的图片')
    return
  }

  // 先用 FileReader 生成本地预览（不等待上传，即时显示）
  const reader = new FileReader()
  reader.onload = (e) => {
    referenceImagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // 上传图片到服务器，获取 HTTP URL
  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || `上传失败 (${response.status})`)
    }

    const data = await response.json()
    referenceImageUrl.value = data.url
    // 清空旧的 Base64（URL 优先，节省内存）
    referenceImageBase64.value = ''

    ElMessage.success('参考图上传成功')
    console.log('📤 参考图已上传，URL:', data.url)

  } catch (error) {
    console.error('上传参考图失败:', error)
    ElMessage.error('上传参考图失败: ' + (error instanceof Error ? error.message : '未知错误'))
    // 上传失败时退回 Base64 兜底（不清空预览）
    const fallbackReader = new FileReader()
    fallbackReader.onload = (e) => {
      referenceImageBase64.value = e.target?.result as string
    }
    fallbackReader.readAsDataURL(file)
  } finally {
    isUploading.value = false
  }
}

const removeReferenceImage = () => {
  referenceImageBase64.value = ''
  referenceImageUrl.value = ''
  referenceImagePreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

  // OpenPose模板相关方法
  const onTemplateChange = async () => {
    await loadTemplatePreview()
    await loadTemplateInfo()
  }

  // 生成模式切换
  const onModeChange = () => {
    if (generationMode.value === 'enhanced') {
      ElMessage.info('已切换到增强模式，将使用完整8步AI流水线生成骨骼素材')
      store.setGenerationMode('enhanced')
    } else {
      ElMessage.info('已切换到基础模式，将使用简化算法生成骨骼素材')
      store.setGenerationMode('basic')
    }
  }

// 加载骨骼预览
const loadTemplatePreview = async () => {
  if (!openPoseTemplate.value) return

  isLoadingPreview.value = true
  try {
    const response = await fetch(`/api/ai/skeleton/template/preview?type=${openPoseTemplate.value}`)
    const data = await response.json()

    if (data.success) {
      skeletonPreviewUrl.value = data.previewUrl
    } else {
      console.error('加载骨骼预览失败:', data.error)
      ElMessage.error('加载骨骼预览失败: ' + data.error)
    }
  } catch (error) {
    console.error('加载骨骼预览失败:', error)
    ElMessage.error('加载骨骼预览失败，请稍后重试')
  } finally {
    isLoadingPreview.value = false
  }
}

// 加载模板信息
const loadTemplateInfo = async () => {
  if (!openPoseTemplate.value) return

  try {
    const response = await fetch(`/api/ai/skeleton/template/info?type=${openPoseTemplate.value}`)
    const data = await response.json()

    if (data.success) {
      selectedTemplateInfo.value = data.templateInfo
    } else {
      console.error('加载模板信息失败:', data.error)
    }
  } catch (error) {
    console.error('加载模板信息失败:', error)
  }
}

// 导出获取参数的方法
const getSkeletonParams = (): SkeletonParams => ({
  style: selectedStyle.value,
  template: skeletonTemplate.value,
  pose: selectedPose.value,
  referenceImageBase64: referenceImageBase64.value,
  referenceImagePreview: referenceImagePreview.value,
})

// 初始化加载
const initializeComponent = async () => {
  await loadTemplatePreview()
  await loadTemplateInfo()
}

// 暴露方法给父组件
defineExpose({
  getSkeletonParams,
})

// 组件挂载时初始化
initializeComponent()
</script>

<style scoped lang="scss">
.skeleton-asset-panel {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.param-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;

  .label-hint {
    font-weight: 400;
    color: #909399;
    font-size: 12px;
  }

  .help-icon {
    font-size: 14px;
    color: #909399;
    cursor: help;

    &:hover {
      color: #409eff;
    }
  }
}

// 参考图上传区域
.reference-upload {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #409eff;
    background: #f0f7ff;
  }

  &.has-image {
    padding: 12px;
    border-style: solid;
    border-color: #c0e0ff;
    background: #f5f9ff;
  }

  .upload-icon {
    font-size: 32px;
    color: #909399;
    margin-bottom: 8px;
  }

  .upload-text {
    margin: 0;
    font-size: 13px;
    color: #606266;
  }

  .upload-hint {
    margin: 4px 0 0;
    font-size: 11px;
    color: #909399;
  }

  .preview-image {
    max-width: 100%;
    max-height: 120px;
    object-fit: contain;
    border-radius: 4px;
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &.has-image:hover .image-overlay {
    opacity: 1;
  }

  .upload-url-hint {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    color: #52c41a;
    white-space: nowrap;
    background: rgba(255, 255, 255, 0.85);
    padding: 1px 6px;
    border-radius: 3px;
  }
}

// 骨骼预览
.skeleton-preview {
  margin-top: 12px;
  text-align: center;

  .preview-image {
    max-width: 100%;
    height: 120px;
    object-fit: contain;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    background: #fafafa;
  }

  .preview-label {
    margin-top: 6px;
    font-size: 11px;
    color: #909399;
    font-weight: 500;
  }
}

// 模板信息
template-info {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;

  .info-item {
    display: flex;
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      font-size: 12px;
      font-weight: 500;
      color: #606266;
      min-width: 60px;
    }

    .info-value {
      font-size: 12px;
      color: #303133;
      flex: 1;
    }
  }
}

// 输出部件预览
.parts-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.part-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: #f5f5f5;
  border-radius: 6px;
  border: 1px solid #e8e8e8;

  .part-emoji {
    font-size: 20px;
  }

  .part-name {
    font-size: 11px;
    color: #606266;
  }
}

// 响应式调整
:deep(.el-select) {
  width: 100%;
}

:deep(.el-radio-group) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>

