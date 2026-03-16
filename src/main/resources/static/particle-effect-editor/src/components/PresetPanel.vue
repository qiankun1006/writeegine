<template>
  <div class="preset-panel">
    <div class="preset-grid">
      <div
        v-for="preset in presets"
        :key="preset.name"
        class="preset-item"
        @click="loadPreset(preset)"
      >
        <div class="preset-preview">
          <div class="preset-icon" :style="{ backgroundColor: preset.color }"></div>
        </div>
        <div class="preset-name">{{ preset.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'

interface Preset {
  name: string
  color: string
  config: any
}

const presets = ref<Preset[]>([
  {
    name: '火焰',
    color: '#ff6400',
    config: { /* 火焰配置 */ }
  },
  {
    name: '雪花',
    color: '#ffffff',
    config: { /* 雪花配置 */ }
  },
  {
    name: '雨水',
    color: '#4a90e2',
    config: { /* 雨水配置 */ }
  },
  {
    name: '爆炸',
    color: '#ff3300',
    config: { /* 爆炸配置 */ }
  }
])

const loadPreset = (preset: Preset) => {
  console.log('加载预设:', preset.name)
  // 这里实现预设加载逻辑
}
</script>

<style scoped lang="scss">
.preset-panel {
  padding: 16px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.preset-item {
  background: #333;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;

  &:hover {
    background: #444;
    transform: translateY(-2px);
  }
}

.preset-preview {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.preset-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  opacity: 0.8;
}

.preset-name {
  color: #fff;
  font-size: 12px;
  font-weight: 500;
}
</style>

