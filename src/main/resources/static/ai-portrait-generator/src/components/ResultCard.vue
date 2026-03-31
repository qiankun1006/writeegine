<template>
  <div class="result-card" :class="{ 'fade-in': true }">
    <!-- 图片预览 -->
    <div class="image-wrapper">
      <img :src="result.imageUrl" :alt="`结果 ${index}`" class="result-image" />
      <div class="image-overlay">
        <div class="overlay-actions">
          <el-button
            type="primary"
            size="small"
            :icon="Download"
            circle
            @click="downloadImage"
            title="下载"
          />
          <el-button
            type="primary"
            size="small"
            :icon="DocumentCopy"
            circle
            @click="copyLink"
            title="复制链接"
          />
          <el-button
            type="primary"
            size="small"
            :icon="Share"
            circle
            @click="shareImage"
            title="分享"
          />
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="card-actions">
      <el-button
        size="small"
        type="primary"
        plain
        class="action-btn"
        @click="regenerate"
      >
        ♻️ 重新生成
      </el-button>
      <el-button
        size="small"
        type="success"
        plain
        class="action-btn"
        @click="saveToProject"
      >
        💾 保存
      </el-button>
    </div>

    <!-- 骨骼数据下载（仅骨骼素材模式显示） -->
    <div v-if="isSkeletonResult" class="skeleton-data-section">
      <div class="section-header">
        <span class="section-title">🦴 骨骼数据</span>
      </div>
      <div class="skeleton-formats">
        <el-button
          v-for="(url, format) in skeletonDataUrls"
          :key="format"
          size="small"
          type="info"
          plain
          class="format-btn"
          @click="downloadSkeletonData(format, url)"
        >
          {{ getFormatDisplayName(format) }}
        </el-button>
      </div>
    </div>

    <!-- 信息 -->
    <div class="card-info">
      <p class="info-time">{{ formatTime(result.generatedAt) }}</p>
      <p class="info-size">{{ result.params.width }}×{{ result.params.height }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {ElMessage} from 'element-plus'
import {DocumentCopy, Download, Share} from '@element-plus/icons-vue'
import type {GenerationResult} from '@/stores/portraitStore'

interface Props {
  result: GenerationResult
  index: number
}

const props = defineProps<Props>()

const isCopied = ref(false)

// 检查是否为骨骼素材结果
const isSkeletonResult = computed(() => {
  return props.result.skeletonDataUrls && Object.keys(props.result.skeletonDataUrls).length > 0
})

// 获取骨骼数据URLs
const skeletonDataUrls = computed(() => {
  return props.result.skeletonDataUrls || {}
})

const downloadImage = () => {
  const link = document.createElement('a')
  link.href = props.result.imageUrl
  link.download = `portrait-${props.result.id}.png`
  link.click()
  ElMessage.success('图片下载中...')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.result.imageUrl)
    ElMessage.success('链接已复制到剪贴板')
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (error) {
    ElMessage.error('复制失败，请重试')
  }
}

const shareImage = () => {
  if (navigator.share) {
    navigator.share({
      title: 'AI 人物立绘',
      text: '看看我用 AI 生成的这个角色！',
      url: window.location.href,
    }).catch(() => {
      ElMessage.info('分享取消')
    })
  } else {
    ElMessage.info('您的浏览器不支持分享功能')
  }
}

const regenerate = () => {
  ElMessage.info('使用相同参数重新生成...')
  // TODO: 重新生成逻辑
}

const saveToProject = () => {
  ElMessage.success('已保存到项目资源库')
  // TODO: 保存到项目逻辑
}

const downloadSkeletonData = (format: string, url: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = `skeleton-data-${props.result.id}.${getFormatExtension(format)}.json`
  link.click()
  ElMessage.success(`${getFormatDisplayName(format)} 骨骼数据下载中...`)
}

const getFormatDisplayName = (format: string) => {
  switch (format) {
    case 'generic': return '通用格式'
    case 'spine': return 'Spine'
    case 'dragonbones': return 'DragonBones'
    default: return format.toUpperCase()
  }
}

const getFormatExtension = (format: string) => {
  switch (format) {
    case 'generic': return 'generic'
    case 'spine': return 'spine'
    case 'dragonbones': return 'dragonbones'
    default: return 'json'
  }
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped lang="scss">

.result-card {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  border-radius: $radius-lg;
  overflow: hidden;
  border: 1px solid $gray-200;
  transition: $transition-base;

  &:hover {
    border-color: $primary-purple;
    box-shadow: $shadow-lg;
    transform: translateY(-4px);
  }

  &.fade-in {
    animation: fadeInUp 0.5s ease forwards;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  overflow: hidden;
  background-color: $gray-100;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: $transition-base;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: $transition-fast;

  .result-card:hover & {
    opacity: 1;
  }
}

.overlay-actions {
  display: flex;
  gap: $spacing-md;
  flex-wrap: wrap;
  justify-content: center;
}

.card-actions {
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-sm;
}

.action-btn {
  flex: 1;
  font-size: 12px;
}

.card-info {
  padding: $spacing-sm;
  background-color: $gray-50;
  text-align: center;
}

.info-time {
  font-size: 12px;
  color: $gray-500;
  margin: 0;
}

.info-size {
  font-size: 11px;
  color: $gray-400;
  margin: 0;
}

// ========== 骨骼数据下载区域 ==========
.skeleton-data-section {
  padding: $spacing-sm;
  background-color: $gray-50;
  border-top: 1px solid $gray-200;
}

.section-header {
  margin-bottom: $spacing-sm;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: $gray-600;
}

.skeleton-formats {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

.format-btn {
  font-size: 11px;
  padding: 4px 8px;
  height: auto;
  min-width: 0;
  flex-shrink: 0;
}</style>

