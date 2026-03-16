<template>
  <div class="param-panel">
    <el-collapse v-model="activeGroups">
      <el-collapse-item title="基础参数" name="basic">
        <div class="param-group">
          <div class="param-item">
            <label>发射率 (粒子/秒)</label>
            <el-slider v-model="emissionRate" :min="0" :max="200" :step="1" />
            <el-input-number v-model="emissionRate" :min="0" :max="200" size="small" />
          </div>

          <div class="param-item">
            <label>发射角度 (度)</label>
            <el-slider v-model="angle" :min="0" :max="360" :step="1" />
            <el-input-number v-model="angle" :min="0" :max="360" size="small" />
          </div>

          <div class="param-item">
            <label>角度变化 (±度)</label>
            <el-slider v-model="angleVariance" :min="0" :max="180" :step="1" />
            <el-input-number v-model="angleVariance" :min="0" :max="180" size="small" />
          </div>

          <div class="param-item">
            <label>发射速度 (像素/秒)</label>
            <el-slider v-model="speed" :min="0" :max="500" :step="10" />
            <el-input-number v-model="speed" :min="0" :max="500" size="small" />
          </div>
        </div>
      </el-collapse-item>

      <el-collapse-item title="物理参数" name="physics">
        <div class="param-group">
          <div class="param-item">
            <label>重力 X</label>
            <el-slider v-model="gravityX" :min="-200" :max="200" :step="10" />
            <el-input-number v-model="gravityX" :min="-200" :max="200" size="small" />
          </div>

          <div class="param-item">
            <label>重力 Y</label>
            <el-slider v-model="gravityY" :min="-200" :max="200" :step="10" />
            <el-input-number v-model="gravityY" :min="-200" :max="200" size="small" />
          </div>

          <div class="param-item">
            <label>粒子寿命 (毫秒)</label>
            <el-slider v-model="lifespan" :min="100" :max="5000" :step="100" />
            <el-input-number v-model="lifespan" :min="100" :max="5000" size="small" />
          </div>
        </div>
      </el-collapse-item>

      <el-collapse-item title="外观参数" name="appearance">
        <div class="param-group">
          <div class="param-item">
            <label>起始颜色</label>
            <div class="color-picker-group">
              <el-color-picker v-model="startColor" size="small" />
              <span>{{ startColor }}</span>
            </div>
          </div>

          <div class="param-item">
            <label>结束颜色</label>
            <div class="color-picker-group">
              <el-color-picker v-model="endColor" size="small" />
              <span>{{ endColor }}</span>
            </div>
          </div>

          <div class="param-item">
            <label>起始透明度</label>
            <el-slider v-model="alphaStart" :min="0" :max="1" :step="0.1" />
            <el-input-number v-model="alphaStart" :min="0" :max="1" :step="0.1" size="small" />
          </div>

          <div class="param-item">
            <label>结束透明度</label>
            <el-slider v-model="alphaEnd" :min="0" :max="1" :step="0.1" />
            <el-input-number v-model="alphaEnd" :min="0" :max="1" :step="0.1" size="small" />
          </div>

          <div class="param-item">
            <label>起始缩放</label>
            <el-slider v-model="scaleStart" :min="0.1" :max="3" :step="0.1" />
            <el-input-number v-model="scaleStart" :min="0.1" :max="3" :step="0.1" size="small" />
          </div>

          <div class="param-item">
            <label>结束缩放</label>
            <el-slider v-model="scaleEnd" :min="0.1" :max="3" :step="0.1" />
            <el-input-number v-model="scaleEnd" :min="0.1" :max="3" :step="0.1" size="small" />
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'

// 参数状态
const emissionRate = ref(50)
const angle = ref(270)
const angleVariance = ref(30)
const speed = ref(100)
const gravityX = ref(0)
const gravityY = ref(100)
const lifespan = ref(2000)
const startColor = ref('#ff6400')
const endColor = ref('#ffc800')
const alphaStart = ref(1)
const alphaEnd = ref(0)
const scaleStart = ref(1)
const scaleEnd = ref(0.5)

// 折叠面板状态
const activeGroups = ref(['basic', 'physics', 'appearance'])

// 这里可以添加参数变化时的回调逻辑
watch([emissionRate, angle, angleVariance, speed], () => {
  // 更新粒子系统参数
  console.log('参数更新:', {
    emissionRate: emissionRate.value,
    angle: angle.value,
    angleVariance: angleVariance.value,
    speed: speed.value
  })
})
</script>

<style scoped lang="scss">
.param-panel {
  padding: 16px;
  color: #fff;
}

.param-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-item label {
  font-size: 12px;
  color: #ccc;
  margin-bottom: 4px;
}

.color-picker-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker-group span {
  font-size: 10px;
  color: #999;
  font-family: monospace;
}

:deep(.el-collapse) {
  border: none;
  background: transparent;
}

:deep(.el-collapse-item__header) {
  background: #333;
  color: #fff;
  border: none;
  font-weight: bold;
}

:deep(.el-collapse-item__wrap) {
  background: #2a2a2a;
  border: none;
}

:deep(.el-collapse-item__content) {
  color: #fff;
  padding: 16px 0;
}

:deep(.el-slider__runway) {
  background: #444;
}

:deep(.el-slider__bar) {
  background: #409eff;
}

:deep(.el-input-number--small) {
  width: 80px;
}

:deep(.el-color-picker--small) {
  height: 24px;
  width: 24px;
}
</style>

