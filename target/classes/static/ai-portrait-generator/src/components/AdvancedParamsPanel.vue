<template>
  <div class="advanced-params-panel">
    <div class="collapse-header" @click="toggleCollapse">
      <span class="header-title">🔧 高级参数</span>
      <el-icon class="toggle-icon" :class="{ open: isOpen }">
        <ArrowDown />
      </el-icon>
    </div>

    <el-collapse-transition>
      <div v-show="isOpen" class="collapse-content">
        <!-- 图生图强度 -->
        <div class="param-group">
          <label class="param-label">图生图强度</label>
          <div class="slider-wrapper">
            <el-slider
              v-model="store.params.imageStrength"
              :min="0"
              :max="1"
              :step="0.01"
              @change="handleParamChange"
            />
            <span class="value-display">{{ store.params.imageStrength.toFixed(2) }}</span>
          </div>
          <p class="param-hint">值越高越贴近参考图，建议 0.5-0.8</p>
        </div>

        <!-- 生成数量 -->
        <div class="param-group">
          <label class="param-label">生成数量</label>
          <el-input-number
            v-model="store.params.generateCount"
            :min="1"
            :max="5"
            @change="handleParamChange"
          />
          <p class="param-hint">一次生成多张图片供选择</p>
        </div>

        <!-- 采样器选择 -->
        <div class="param-group">
          <label class="param-label">采样器</label>
          <el-select
            v-model="store.params.sampler"
            placeholder="选择采样器"
            @change="handleParamChange"
          >
            <el-option label="Euler（快速）" value="euler" />
            <el-option label="DPM++ 2M Karras（效果优）" value="dpm++" />
            <el-option label="AutoCFG（智能）" value="autocfg" />
          </el-select>
          <p class="param-hint">不同采样器生成效果不同，耗时也不同</p>
        </div>

        <!-- 迭代步数 -->
        <div class="param-group">
          <label class="param-label">迭代步数</label>
          <div class="slider-wrapper">
            <el-slider
              v-model="store.params.steps"
              :min="10"
              :max="50"
              :step="1"
              :marks="{ 10: '10', 30: '30', 50: '50' }"
              @change="handleParamChange"
            />
            <span class="value-display">{{ store.params.steps }}</span>
          </div>
          <p class="param-hint">值越高生成质量越好，耗时越长</p>
        </div>

        <!-- 风格预设 -->
        <div class="param-group">
          <label class="param-label">风格预设</label>
          <el-select
            v-model="store.params.stylePreset"
            placeholder="选择风格预设"
            @change="handleParamChange"
          >
            <el-option label="无预设" value="none" />
            <el-option label="日系二次元" value="anime" />
            <el-option label="国风写实" value="chinese-realistic" />
            <el-option label="赛博朋克" value="cyberpunk" />
            <el-option label="Q版卡通" value="cartoon" />
          </el-select>
          <p class="param-hint">选择风格可快速生成特定风格的人物</p>
        </div>

        <!-- 种子值 -->
        <div class="param-group">
          <label class="param-label">种子值</label>
          <div class="seed-wrapper">
            <el-input-number
              v-model="store.params.seed"
              :min="-1"
              :max="9999999"
              @change="handleParamChange"
            />
            <el-button
              type="primary"
              size="small"
              @click="randomSeed"
            >
              🎲 随机
            </el-button>
          </div>
          <p class="param-hint">-1 表示随机，固定种子可复现相同的生成结果</p>
        </div>

        <!-- 面部修复 -->
        <div class="param-group">
          <label class="param-label">面部修复</label>
          <el-switch
            v-model="store.params.faceEnhance"
            @change="handleParamChange"
          />
          <p class="param-hint">启用后会对生成的人物面部进行增强处理</p>
        </div>

        <!-- 输出格式 -->
        <div class="param-group">
          <label class="param-label">输出格式</label>
          <el-radio-group
            v-model="store.params.outputFormat"
            @change="handleParamChange"
          >
            <el-radio label="png">PNG（透明背景）</el-radio>
            <el-radio label="jpg">JPG（高清）</el-radio>
          </el-radio-group>
          <p class="param-hint">PNG 支持透明背景，JPG 文件体积更小</p>
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {usePortraitStore} from '@/stores/portraitStore'
import {ArrowDown} from '@element-plus/icons-vue'

const store = usePortraitStore()
const isOpen = ref(false)

const toggleCollapse = () => {
  isOpen.value = !isOpen.value
  store.showAdvanced = isOpen.value
}

const handleParamChange = () => {
  store.saveParams()
}

const randomSeed = () => {
  store.params.seed = Math.floor(Math.random() * 10000000)
  handleParamChange()
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.advanced-params-panel {
  margin-top: $spacing-lg;
  border-top: 1px solid $gray-200;
}

.collapse-header {
  @include flex-between;
  padding: $spacing-md 0;
  cursor: pointer;
  user-select: none;
  transition: $transition-fast;

  &:hover {
    color: $primary-purple;
  }
}

.header-title {
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toggle-icon {
  font-size: 16px;
  transition: transform 0.3s ease;

  &.open {
    transform: rotate(180deg);
  }
}

.collapse-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.param-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.param-label {
  font-size: 13px;
  font-weight: 500;
  color: $neutral-gray;
}

.slider-wrapper {
  display: flex;
  gap: $spacing-md;
  align-items: center;
}

:deep(.el-slider) {
  flex: 1;
}

.value-display {
  font-weight: 600;
  color: $primary-purple;
  min-width: 40px;
  text-align: right;
  font-size: 13px;
}

.seed-wrapper {
  display: flex;
  gap: $spacing-sm;
}

:deep(.el-input-number) {
  flex: 1;
}

.param-hint {
  font-size: 12px;
  color: $gray-500;
  margin: 0;
}

:deep(.el-select),
:deep(.el-input-number),
:deep(.el-switch) {
  width: 100%;
}

:deep(.el-radio-group) {
  width: 100%;
  display: flex;
  gap: $spacing-md;
}
</style>

