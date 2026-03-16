<template>
  <div class="texture-uploader">
    <div class="upload-area" @drop.prevent="handleDrop" @dragover.prevent>
      <div class="upload-icon">
        <el-icon><Upload /></el-icon>
      </div>
      <div class="upload-text">
        拖拽图片文件到此处或
        <el-button type="primary" size="small" @click="triggerFileInput">点击上传</el-button>
      </div>
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        style="display: none"
        @change="handleFileSelect"
      />
    </div>

    <div class="texture-list" v-if="textures.length > 0">
      <h4>已上传纹理</h4>
      <div class="texture-grid">
        <div
          v-for="texture in textures"
          :key="texture.id"
          class="texture-item"
        >
          <img :src="texture.url" :alt="texture.name" class="texture-preview" />
          <div class="texture-info">
            <div class="texture-name">{{ texture.name }}</div>
            <div class="texture-size">{{ texture.width }}x{{ texture.height }}</div>
          </div>
          <el-button
            type="danger"
            size="small"
            @click="removeTexture(texture.id)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {Upload} from '@element-plus/icons-vue'

interface Texture {
  id: string
  name: string
  url: string
  width: number
  height: number
  file: File
}

const fileInput = ref<HTMLInputElement>()
const textures = ref<Texture[]>([])

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    Array.from(files).forEach(processFile)
  }
}

const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files) {
    Array.from(files).forEach(processFile)
  }
}

const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    console.warn('不支持的文件类型:', file.type)
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const texture: Texture = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: e.target?.result as string,
        width: img.width,
        height: img.height,
        file
      }
      textures.value.push(texture)
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removeTexture = (id: string) => {
  textures.value = textures.value.filter(t => t.id !== id)
}
</script>

<style scoped lang="scss">
.texture-uploader {
  padding: 16px;
}

.upload-area {
  border: 2px dashed #666;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #409eff;
    background: rgba(64, 158, 255, 0.05);
  }
}

.upload-icon {
  font-size: 32px;
  color: #666;
  margin-bottom: 16px;
}

.upload-text {
  color: #ccc;
  font-size: 14px;
  line-height: 1.5;
}

.texture-list {
  margin-top: 24px;
}

.texture-list h4 {
  color: #fff;
  margin-bottom: 16px;
  font-size: 16px;
}

.texture-grid {
  display: grid;
  gap: 12px;
}

.texture-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #333;
  border-radius: 8px;
}

.texture-preview {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #555;
}

.texture-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.texture-name {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.texture-size {
  color: #999;
  font-size: 12px;
}
</style>

