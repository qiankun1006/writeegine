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

    <!-- 信息 -->
    <div class="card-info">
      <p class="info-time">{{ formatTime(result.generatedAt) }}</p>
      <p class="info-size">{{ result.params.width }}×{{ result.params.height }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, DocumentCopy, Share } from '@element-plus/icons-vue'
import type { GenerationResult } from '@/stores/portraitStore'

interface Props {
  result: GenerationResult
  index: number
}

defineProps<Props>()

const isCopied = ref(false)

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

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const props = defineProps<Props>()
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

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
</style>

