<template>
  <div class="param-panel">
    <el-collapse v-model="activeGroups">
      <el-collapse-item title="基础参数" name="basic">
        <div class="param-group">
          <div class="param-item">
            <el-tooltip :content="getHint('emissionRate').description" placement="top">
              <label class="param-label">{{ getHint('emissionRate').label }}</label>
            </el-tooltip>
            <el-slider v-model="emissionRate" :min="0" :max="200" :step="1" />
            <el-input-number v-model="emissionRate" :min="0" :max="200" size="small" />
            <div class="param-hint">{{ getHint('emissionRate').unit }} | 推荐: {{ getHint('emissionRate').recommended }}</div>
          </div>

          <div class="param-item">
            <el-tooltip :content="getHint('angle').description" placement="top">
              <label class="param-label">{{ getHint('angle').label }}</label>
            </el-tooltip>
            <el-slider v-model="angle" :min="0" :max="360" :step="1" />
            <el-input-number v-model="angle" :min="0" :max="360" size="small" />
            <div class="param-hint">{{ getHint('angle').unit }} | 推荐: {{ getHint('angle').recommended }}</div>
          </div>

          <div class="param-item">
            <el-tooltip :content="getHint('angleVariance').description" placement="top">
              <label class="param-label">{{ getHint('angleVariance').label }}</label>
            </el-tooltip>
            <el-slider v-model="angleVariance" :min="0" :max="180" :step="1" />
            <el-input-number v-model="angleVariance" :min="0" :max="180" size="small" />
            <div class="param-hint">{{ getHint('angleVariance').unit }} | 推荐: {{ getHint('angleVariance').recommended }}</div>
          </div>

          <div class="param-item">
            <el-tooltip :content="getHint('speed').description" placement="top">
              <label class="param-label">{{ getHint('speed').label }}</label>
            </el-tooltip>
            <el-slider v-model="speed" :min="0" :max="500" :step="10" />
            <el-input-number v-model="speed" :min="0" :max="500" size="small" />
            <div class="param-hint">{{ getHint('speed').unit }} | 推荐: {{ getHint('speed').recommended }}</div>
          </div>
        </div>
      </el-collapse-item>

      <el-collapse-item title="物理参数" name="physics">
        <div class="param-group">
          <div class="param-item">
            <el-tooltip :content="getHint('gravityX').description" placement="top">
              <label class="param-label">{{ getHint('gravityX').label }}</label>
            </el-tooltip>
            <el-slider v-model="gravityX" :min="-200" :max="200" :step="10" />
            <el-input-number v-model="gravityX" :min="-200" :max="200" size="small" />
            <div class="param-hint">{{ getHint('gravityX').unit }} | 推荐: {{ getHint('gravityX').recommended }}</div>
          </div>

          <div class="param-item">
            <el-tooltip :content="getHint('gravityY').description" placement="top">
              <label class="param-label">{{ getHint('gravityY').label }}</label>
            </el-tooltip>
            <el-slider v-model="gravityY" :min="-200" :max="200" :step="10" />
            <el-input-number v-model="gravityY" :min="-200" :max="200" size="small" />
            <div class="param-hint">{{ getHint('gravityY').unit }} | 推荐: {{ getHint('gravityY').recommended }}</div>
          </div>

          <div class="param-item">
            <el-tooltip :content="getHint('lifespan').description" placement="top">
              <label class="param-label">{{ getHint('lifespan').label }}</label>
            </el-tooltip>
            <el-slider v-model="lifespan" :min="100" :max="5000" :step="100" />
            <el-input-number v-model="lifespan" :min="100" :max="5000" size="small" />
            <div class="param-hint">{{ getHint('lifespan').unit }} | 推荐: {{ getHint('lifespan').recommended }}</div>
          </div>
        </div>
      </el-collapse-item>

      <el-collapse-item title="外观参数" name="appearance">
        <div class="param-group">
          <div class="param-item">
            <el-tooltip content="粒子生成时的颜色" placement="top">
              <label class="param-label">起始颜色</label>
            </el-tooltip>
            <div class="color-picker-group">
              <el-color-picker v-model="startColor" size="small" />
              <span>{{ startColor }}</span>
            </div>
            <div class="param-hint">默认值: #ff6400</div>
          </div>

          <div class="param-item">
            <el-tooltip content="粒子消失时的颜色" placement="top">
              <label class="param-label">结束颜色</label>
            </el-tooltip>
            <div class="color-picker-group">
              <el-color-picker v-model="endColor" size="small" />
              <span>{{ endColor }}</span>
            </div>
            <div class="param-hint">默认值: #ffc800</div>
          </div>

          <div class="param-item">
            <el-tooltip :content="getHint('alphaStart').description" placement="top">
              <label class="param-label">{{ getHint('alphaStart').label }}</label>
            </el-tooltip>
            <el-slider v-model="alphaStart" :min="0" :max="1" :step="0.1" />
            <el-input-number v-model="alphaStart" :min="0" :max="1" :step="0.1" size="small" />
            <div class="param-hint">{{ getHint('alphaStart').unit }} | 推荐: {{ getHint('alphaStart').recommended }}</div>
          </div>

          <div class="param-item">
            <el-tooltip :content="getHint('alphaEnd').description" placement="top">
              <label class="param-label">{{ getHint('alphaEnd').label }}</label>
            </el-tooltip>
            <el-slider v-model="alphaEnd" :min="0" :max="1" :step="0.1" />
            <el-input-number v-model="alphaEnd" :min="0" :max="1" :step="0.1" size="small" />
            <div class="param-hint">{{ getHint('alphaEnd').unit }} | 推荐: {{ getHint('alphaEnd').recommended }}</div>
          </div>

          <div class="param-item">
            <el-tooltip :content="getHint('scaleStart').description" placement="top">
              <label class="param-label">{{ getHint('scaleStart').label }}</label>
            </el-tooltip>
            <el-slider v-model="scaleStart" :min="0.1" :max="3" :step="0.1" />
            <el-input-number v-model="scaleStart" :min="0.1" :max="3" :step="0.1" size="small" />
            <div class="param-hint">{{ getHint('scaleStart').unit }} | 推荐: {{ getHint('scaleStart').recommended }}</div>
          </div>

          <div class="param-item">
            <el-tooltip :content="getHint('scaleEnd').description" placement="top">
              <label class="param-label">{{ getHint('scaleEnd').label }}</label>
            </el-tooltip>
            <el-slider v-model="scaleEnd" :min="0.1" :max="3" :step="0.1" />
            <el-input-number v-model="scaleEnd" :min="0.1" :max="3" :step="0.1" size="small" />
            <div class="param-hint">{{ getHint('scaleEnd').unit }} | 推荐: {{ getHint('scaleEnd').recommended }}</div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import type {ParamHint} from '../utils/paramHints'
import {getParamHint} from '../utils/paramHints'

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

// 获取参数提示信息
const getHint = (key: string): ParamHint => {
  return getParamHint(key) || {
    label: key,
    description: '暂无说明',
    unit: '',
    recommended: ''
  }
}

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

.param-item label,
.param-label {
  font-size: 12px;
  color: #ccc;
  margin-bottom: 4px;
  cursor: help;
  border-bottom: 1px dotted #666;
  transition: color 0.2s, border-color 0.2s;
}

.param-item label:hover,
.param-label:hover {
  color: #fff;
  border-bottom-color: #999;
}

.param-hint {
  font-size: 10px;
  color: #888;
  margin-top: 4px;
  font-style: italic;
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

:deep(.el-tooltip__popper[x-placement^='top']) {
  background: #333;
  color: #fff;
  border-color: #555;
}

:deep(.el-tooltip__popper[x-placement^='top'][x-placement$='start']::after),
:deep(.el-tooltip__popper[x-placement^='top'][x-placement$='end']::after),
:deep(.el-tooltip__popper[x-placement='top']::after) {
  border-top-color: #333;
}

:deep(.el-tooltip__popper) {
  background: #333 !important;
  color: #fff !important;
  border-color: #555 !important;
  max-width: 300px;
  word-wrap: break-word;
  white-space: normal;
}

:deep(.el-tooltip__popper[x-placement*='left']::after),
:deep(.el-tooltip__popper[x-placement*='right']::after) {
  border-color: transparent #333 transparent transparent !important;
}
</style>

