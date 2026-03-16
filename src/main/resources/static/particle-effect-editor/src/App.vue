<template>
  <div class="particle-editor">
    <!-- 左侧 Canvas -->
    <div class="canvas-container">
      <canvas ref="canvas" class="particle-canvas" width="800" height="600"></canvas>
      <div class="stats">
        粒子数: {{ totalParticles }} | FPS: {{ fps }}
      </div>
    </div>

    <!-- 分割线 -->
    <div class="divider" @mousedown="startResize" />

    <!-- 右侧控制面板 -->
    <div class="control-panel">
      <el-tabs>
        <el-tab-pane label="参数编辑">
          <ParamPanel />
        </el-tab-pane>
        <el-tab-pane label="预设">
          <PresetPanel />
        </el-tab-pane>
        <el-tab-pane label="导出">
          <ExportPanel />
        </el-tab-pane>
        <el-tab-pane label="纹理">
          <TextureUploader />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'
import {ParticleSystem} from './core/ParticleSystem'
import type {SystemConfig} from './types/particle'
import ParamPanel from './components/ParamPanel.vue'
import PresetPanel from './components/PresetPanel.vue'
import ExportPanel from './components/ExportPanel.vue'
import TextureUploader from './components/TextureUploader.vue'

const canvas = ref<HTMLCanvasElement>()
let particleSystem: ParticleSystem

const totalParticles = ref(0)
const fps = ref(0)

// 默认配置
const defaultConfig: SystemConfig = {
  gravity: { x: 0, y: 100 },
  windForce: { x: 0, y: 0 },
  maxParticles: 5000,
  fps: 60,
  backgroundColor: '#000000',
  renderMode: 'normal',
  emitters: [
    {
      position: { x: 400, y: 300 },
      emissionRate: 50,
      emissionBurst: 0,
      angle: 270,
      angleVariance: 30,
      speed: 100,
      speedVariance: 50,
      enabled: true,
      particleConfig: {
        lifespan: 2000,
        initialVelocity: { x: 0, y: -50 },
        acceleration: { x: 0, y: 0 },
        color: {
          startR: 255,
          startG: 100,
          startB: 0,
          endR: 255,
          endG: 200,
          endB: 0
        },
        alphaStart: 1,
        alphaEnd: 0,
        scale: { start: 1, end: 0.5 },
        rotation: { start: 0, end: 0, speed: 0 }
      }
    }
  ]
}

// 面板调整相关
let isResizing = false
let startX = 0
let startWidth = 0

const startResize = (e: MouseEvent) => {
  isResizing = true
  startX = e.clientX
  const panel = document.querySelector('.control-panel') as HTMLElement
  startWidth = panel.offsetWidth

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing) return

  const deltaX = e.clientX - startX
  const panel = document.querySelector('.control-panel') as HTMLElement
  const canvasContainer = document.querySelector('.canvas-container') as HTMLElement

  const newWidth = Math.max(300, Math.min(600, startWidth - deltaX))
  panel.style.width = `${newWidth}px`
  canvasContainer.style.flex = `1`
}

const stopResize = () => {
  isResizing = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// 更新统计信息
const updateStats = () => {
  if (particleSystem) {
    totalParticles.value = particleSystem.getTotalParticles()
    fps.value = particleSystem.getFPS()
  }
}

onMounted(() => {
  if (canvas.value) {
    particleSystem = new ParticleSystem(canvas.value, defaultConfig)
    particleSystem.start()

    // 定期更新统计信息
    setInterval(updateStats, 100)
  }
})

onUnmounted(() => {
  if (particleSystem) {
    particleSystem.pause()
  }
})
</script>

<style scoped lang="scss">
.particle-editor {
  display: flex;
  height: 100vh;
  background: #1a1a1a;
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.particle-canvas {
  border: 1px solid #333;
  background: #000;
}

.stats {
  position: absolute;
  top: 10px;
  left: 10px;
  color: #fff;
  font-family: monospace;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.7);
  padding: 5px 10px;
  border-radius: 3px;
}

.divider {
  width: 4px;
  cursor: col-resize;
  background: #333;
  transition: background 0.2s;

  &:hover {
    background: #666;
  }
}

.control-panel {
  width: 350px;
  background: #222;
  border-left: 1px solid #333;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>

