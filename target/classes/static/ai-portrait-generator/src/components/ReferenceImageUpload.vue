<template>
  <div class="reference-image-upload">
    <!-- 上传区域 -->
    <div
      v-if="!previewUrl"
      class="upload-area"
      :class="{ 'drag-over': isDragging }"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @click="selectFile"
    >
      <div class="upload-content">
        <el-icon class="upload-icon"><Upload /></el-icon>
        <p class="upload-text">拖拽或点击上传参考图片</p>
        <p class="upload-hint">支持 PNG、JPG、WEBP 格式，大小 ≤10MB</p>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        @change="handleFileSelect"
      />
    </div>

    <!-- 预览区域 -->
    <div v-else class="preview-area">
      <div class="preview-wrapper">
        <img :src="previewUrl" :alt="fileName" class="preview-image" />
        <div class="preview-overlay">
          <el-button
            type="danger"
            size="small"
            :icon="Delete"
            circle
            @click="handleDelete"
          />
        </div>
      </div>
      <div class="file-info">
        <p class="file-name">{{ fileName }}</p>
        <p class="file-size">{{ formatFileSize(fileSize) }}</p>
      </div>
    </div>

    <!-- 错误提示 -->
    <el-alert
      v-if="errorMessage"
      type="error"
      :title="errorMessage"
      closable
      @close="errorMessage = ''"
      class="error-alert"
    />
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {Delete, Upload} from '@element-plus/icons-vue'
import {compressImage} from '@/utils/imageCompressor'

const emit = defineEmits<{
  'image-selected': [file: File | null]
}>()

const fileInput = ref<HTMLInputElement>()
const previewUrl = ref('')
const fileName = ref('')
const fileSize = ref(0)
const isDragging = ref(false)
const errorMessage = ref('')

const selectFile = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    await processFile(files[0])
  }
}

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    await processFile(files[0])
  }
}

const processFile = async (file: File) => {
  errorMessage.value = ''

  // 验证文件格式
  const validTypes = ['image/png', 'image/jpeg', 'image/webp']
  if (!validTypes.includes(file.type)) {
    errorMessage.value = '文件格式错误，请上传 PNG、JPG 或 WEBP 格式的图片'
    emit('image-selected', null)
    return
  }

  // 验证文件大小
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    errorMessage.value = '文件过大，请上传大小不超过 10MB 的图片'
    emit('image-selected', null)
    return
  }

  try {
    // 压缩图片
    const compressedFile = await compressImage(file, 1024 * 1024) // 最大 1MB

    // 生成预览
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(compressedFile)

    fileName.value = file.name
    fileSize.value = compressedFile.size
    emit('image-selected', compressedFile)
  } catch (error) {
    errorMessage.value = '图片处理失败，请重试'
    console.error('图片压缩失败:', error)
    emit('image-selected', null)
  }
}

const handleDelete = () => {
  previewUrl.value = ''
  fileName.value = ''
  fileSize.value = 0
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('image-selected', null)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.reference-image-upload {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.upload-area {
  @include flex-center;
  flex-direction: column;
  gap: $spacing-md;
  min-height: 120px;
  padding: $spacing-lg;
  border: 2px dashed $gray-300;
  border-radius: $radius-lg;
  background-color: $gray-100;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    border-color: $primary-purple;
    background-color: rgba($primary-purple, 0.05);
  }

  &.drag-over {
    border-color: $secondary-blue;
    background-color: rgba($secondary-blue, 0.1);
  }
}

.upload-content {
  @include flex-center;
  flex-direction: column;
  gap: $spacing-sm;
  text-align: center;
}

.upload-icon {
  font-size: 32px;
  color: $primary-purple;
}

.upload-text {
  font-weight: 500;
  color: $neutral-gray;
  margin: 0;
}

.upload-hint {
  font-size: 12px;
  color: $gray-500;
  margin: 0;
}

.preview-area {
  @include flex-center;
  gap: $spacing-md;
}

.preview-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: $radius-lg;
  overflow: hidden;
  border: 1px solid $gray-300;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  @include flex-center;
  opacity: 0;
  transition: $transition-fast;

  .preview-wrapper:hover & {
    opacity: 1;
  }
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: $neutral-gray;
  @include text-truncate;
  margin: 0;
}

.file-size {
  font-size: 12px;
  color: $gray-500;
  margin: 0;
}

.error-alert {
  margin-top: 0;
}
</style>

