<template>
  <div class="export-panel">
    <div class="export-options">
      <div class="export-item">
        <el-button type="primary" @click="exportLibGDX" :loading="exporting">导出 LibGDX (.p)</el-button>
        <div class="export-desc">LibGDX 粒子效果文件</div>
      </div>

      <div class="export-item">
        <el-button type="primary" @click="exportPNG" :loading="exporting">导出 PNG</el-button>
        <div class="export-desc">高清图片截图</div>
        <el-select v-model="pngScale" size="small" class="scale-select">
          <el-option label="1x" value="1" />
          <el-option label="2x" value="2" />
          <el-option label="3x" value="3" />
        </el-select>
      </div>

      <div class="export-item">
        <el-button type="primary" @click="exportJSON" :loading="exporting">导出 JSON</el-button>
        <div class="export-desc">配置文件</div>
      </div>

      <div class="export-item">
        <el-button type="primary" @click="exportZIP" :loading="exporting">导出 ZIP 包</el-button>
        <div class="export-desc">完整资源包 (.p + PNG + JSON)</div>
      </div>
    </div>

    <div class="file-name">
      <label>文件名:</label>
      <el-input v-model="fileName" size="small" placeholder="particle_effect" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {inject, ref} from 'vue'
import {LibGDXExporter} from '../exporters/LibGDXExporter'
import {PNGExporter} from '../exporters/PNGExporter'
import {JSONExporter} from '../exporters/JSONExporter'
import {ZIPExporter} from '../exporters/ZIPExporter'
import {ElMessage} from 'element-plus'
import type {ParticleSystem} from '../core/ParticleSystem'

const pngScale = ref('2')
const fileName = ref('particle_effect')
const exporting = ref(false)

// 从提供者中获取粒子系统和 Canvas
const particleSystem = inject<ParticleSystem>('particleSystem')
const canvas = inject<HTMLCanvasElement>('canvas')

const exportLibGDX = () => {
  if (!particleSystem) {
    ElMessage.error('粒子系统未初始化')
    return
  }

  try {
    const config = particleSystem.getConfig()
    const fullFileName = `${fileName.value}.p`
    LibGDXExporter.download(config, fullFileName)
    ElMessage.success(`已导出 ${fullFileName}`)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请检查控制台')
  }
}

const exportPNG = async () => {
  if (!canvas) {
    ElMessage.error('Canvas 未初始化')
    return
  }

  exporting.value = true
  try {
    const scale = parseInt(pngScale.value)
    const fullFileName = `${fileName.value}.png`
    await PNGExporter.downloadEffectScreenshot(canvas, fullFileName, scale)
    ElMessage.success(`已导出 ${fullFileName}`)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请检查控制台')
  } finally {
    exporting.value = false
  }
}

const exportJSON = () => {
  if (!particleSystem) {
    ElMessage.error('粒子系统未初始化')
    return
  }

  try {
    const config = particleSystem.getConfig()
    const fullFileName = `${fileName.value}.json`
    JSONExporter.download(config, fullFileName, {
      created: new Date().toISOString(),
      name: fileName.value
    })
    ElMessage.success(`已导出 ${fullFileName}`)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请检查控制台')
  }
}

const exportZIP = async () => {
  if (!particleSystem || !canvas) {
    ElMessage.error('粒子系统或 Canvas 未初始化')
    return
  }

  exporting.value = true
  try {
    const config = particleSystem.getConfig()
    const fullFileName = `${fileName.value}.zip`
    await ZIPExporter.exportBundle(config, canvas, fullFileName)
    ElMessage.success(`已导出 ${fullFileName}`)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请检查控制台')
  } finally {
    exporting.value = false
  }
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

