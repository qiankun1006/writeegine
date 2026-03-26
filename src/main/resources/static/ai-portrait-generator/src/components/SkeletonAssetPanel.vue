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

    <!-- 骨骼模板选择 -->
    <div class="param-section">
      <label class="section-label">
        骨骼模板
        <el-tooltip content="人体标准骨骼：符合真实人体比例；动画骨骼：适合动画制作的比例">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </label>
      <el-radio-group v-model="skeletonTemplate" size="default">
        <el-radio label="standard">人体标准骨骼</el-radio>
        <el-radio label="animation">动画骨骼</el-radio>
      </el-radio-group>
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
        <template v-if="referenceImagePreview">
          <img :src="referenceImagePreview" alt="参考图" class="preview-image" />
          <div class="image-overlay">
            <el-button size="small" @click.stop="removeReferenceImage">移除</el-button>
          </div>
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
import { ref, watch, computed } from 'vue'
import { Upload, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

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
  pose: string
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
const selectedPose = ref(props.modelValue.pose || 'standing')
const referenceImageBase64 = ref(props.modelValue.referenceImageBase64 || '')
const referenceImagePreview = ref(props.modelValue.referenceImagePreview || '')
const fileInput = ref<HTMLInputElement | null>(null)

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
  [selectedStyle, skeletonTemplate, selectedPose, referenceImageBase64],
  () => {
    emit('update:modelValue', {
      style: selectedStyle.value,
      template: skeletonTemplate.value,
      pose: selectedPose.value,
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

const handleFileSelect = (file: File) => {
  // 验证文件格式
  const validTypes = ['image/png', 'image/jpeg', 'image/webp']
  if (!validTypes.includes(file.type)) {
    ElMessage.error('文件格式错误，请上传 PNG、JPG 或 WEBP 格式图片')
    return
  }

  // 验证文件大小（10MB）
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('文件过大，请上传小于 10MB 的图片')
    return
  }

  // 读取文件为 Base64
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    referenceImagePreview.value = result
    referenceImageBase64.value = result
  }
  reader.readAsDataURL(file)
}

const removeReferenceImage = () => {
  referenceImageBase64.value = ''
  referenceImagePreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
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

// 暴露方法给父组件
defineExpose({
  getSkeletonParams,
})
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

