<template>
  <div class="advanced-params-panel">
    <!-- 使用 ElCollapse 实现折叠功能 -->
    <el-collapse v-model="activeNames" accordion>
      <el-collapse-item title="⚙️ 高级参数" name="advanced">
        <div class="panel-content">
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
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {ElCollapse, ElCollapseItem} from 'element-plus'
import {usePortraitStore} from '@/stores/portraitStore'

const store = usePortraitStore()

// 折叠面板初始状态（默认收起，传空数组）
const activeNames = ref<string[]>([])

const handleParamChange = () => {
  store.saveParams()
}

const randomSeed = () => {
  store.params.seed = Math.floor(Math.random() * 10000000)
  handleParamChange()
}
</script>

<style scoped lang="scss">
// ========== 高级参数面板 ==========
.advanced-params-panel {
  width: 100%;
  // ElCollapse 自带样式，无需额外包装
}

// ========== 面板内容 ==========
.panel-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

// ========== 参数组 ==========
.param-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

// ========== 参数标签 ==========
.param-label {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
}

// ========== 滑块包装 ==========
.slider-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

:deep(.el-slider) {
  flex: 1;
}

// ========== 数值显示 ==========
.value-display {
  font-weight: 600;
  color: #6c5ce7;
  min-width: 40px;
  text-align: right;
  font-size: 12px;
  flex-shrink: 0;
}

// ========== 种子值包装 ==========
.seed-wrapper {
  display: flex;
  gap: 6px;
}

:deep(.el-input-number) {
  flex: 1;
}

// ========== 参数提示 ==========
.param-hint {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

// ========== 表单控件 ==========
:deep(.el-select),
:deep(.el-input-number),
:deep(.el-switch) {
  width: 100%;
}

:deep(.el-radio-group) {
  width: 100%;
  display: flex;
  gap: 8px;
}
</style>

