<template>
  <div class="export-panel">
    <div class="export-options">
      <div class="export-item">
        <el-button type="primary" @click="exportLibGDX">导出 LibGDX (.p)</el-button>
        <div class="export-desc">LibGDX 粒子效果文件</div>
      </div>

      <div class="export-item">
        <el-button type="primary" @click="exportPNG">导出 PNG</el-button>
        <div class="export-desc">高清图片截图</div>
        <el-select v-model="pngScale" size="small" class="scale-select">
          <el-option label="1x" value="1" />
          <el-option label="2x" value="2" />
          <el-option label="3x" value="3" />
        </el-select>
      </div>

      <div class="export-item">
        <el-button type="primary" @click="exportJSON">导出 JSON</el-button>
        <div class="export-desc">配置文件</div>
      </div>

      <div class="export-item">
        <el-button type="primary" @click="exportZIP">导出 ZIP 包</el-button>
        <div class="export-desc">完整资源包 (.p + .atlas + PNG)</div>
      </div>
    </div>

    <div class="file-name">
      <label>文件名:</label>
      <el-input v-model="fileName" size="small" placeholder="particle_effect" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const pngScale = ref('2')
const fileName = ref('particle_effect')

const exportLibGDX = () => {
  console.log('导出 LibGDX 格式')
  // 实现 LibGDX 导出逻辑
}

const exportPNG = () => {
  console.log('导出 PNG 格式，缩放:', pngScale.value)
  // 实现 PNG 导出逻辑
}

const exportJSON = () => {
  console.log('导出 JSON 格式')
  // 实现 JSON 导出逻辑
}

const exportZIP = () => {
  console.log('导出 ZIP 包')
  // 实现 ZIP 导出逻辑
}
</script>

<style scoped lang="scss">
.export-panel {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.export-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.export-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.scale-select {
  width: 80px;
  margin-top: 8px;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #444;
}

.file-name label {
  color: #ccc;
  font-size: 12px;
  min-width: 50px;
}

:deep(.el-button) {
  width: 100%;
}
</style>

