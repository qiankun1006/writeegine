<template>
  <div class="model-selection-panel">
    <div class="panel-header">
      <h3>🤖 AI 模型选择</h3>
      <p class="panel-description">选择不同的 AI 模型来生成图像，不同模型有不同的风格特点</p>
    </div>

    <div class="panel-content">
      <!-- 提供商选择 -->
      <div class="param-group">
        <label class="param-label">模型提供商</label>
        <el-radio-group
          v-model="store.params.provider"
          @change="handleProviderChange"
          class="provider-group"
        >
          <el-radio-button value="aliyun">
            <div class="provider-option">
              <img src="@/assets/aliyun-logo.png" alt="阿里云" class="provider-logo" />
              <span>阿里云通义</span>
            </div>
          </el-radio-button>
          <el-radio-button value="volcengine">
            <div class="provider-option">
              <img src="@/assets/volcengine-logo.png" alt="火山引擎" class="provider-logo" />
              <span>火山引擎</span>
            </div>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 模型版本选择 -->
      <div class="param-group">
        <label class="param-label">模型版本</label>
        <el-select
          v-model="store.params.modelVersion"
          placeholder="选择模型版本"
          @change="handleParamChange"
          class="model-select"
        >
          <el-option-group v-if="store.params.provider === 'aliyun'" label="阿里云通义">
            <el-option
              label="通义万相 v1 (wanx-v1)"
              value="wanx-v1"
            >
              <div class="model-option">
                <div class="model-name">通义万相 v1</div>
                <div class="model-desc">高质量图像生成，适合多种风格</div>
              </div>
            </el-option>
            <el-option
              label="通义万相 图生图 (wanx-sketch-to-image)"
              value="wanx-sketch-to-image"
            >
              <div class="model-option">
                <div class="model-name">通义万相 图生图</div>
                <div class="model-desc">基于参考图生成，保持构图</div>
              </div>
            </el-option>
          </el-option-group>

          <el-option-group v-if="store.params.provider === 'volcengine'" label="火山引擎">
            <el-option
              label="豆包 Seedream 5.0 (doubao-seedream-5-0-260128)"
              value="doubao-seedream-5-0-260128"
            >
              <div class="model-option">
                <div class="model-name">豆包 Seedream 5.0</div>
                <div class="model-desc">最新模型，生成质量优秀，细节丰富</div>
              </div>
            </el-option>
            <el-option
              label="豆包 Seedream 4.0 (doubao-seedream-4-0-260128)"
              value="doubao-seedream-4-0-260128"
            >
              <div class="model-option">
                <div class="model-name">豆包 Seedream 4.0</div>
                <div class="model-desc">稳定版本，生成速度快，性价比高</div>
              </div>
            </el-option>
          </el-option-group>
        </el-select>
      </div>

      <!-- 模型信息展示 -->
      <div class="model-info" v-if="selectedModelInfo">
        <div class="info-header">
          <el-icon><InfoFilled /></el-icon>
          <span>模型信息</span>
        </div>
        <div class="info-content">
          <div class="info-item">
            <span class="info-label">提供商:</span>
            <span class="info-value">{{ selectedModelInfo.provider }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">版本:</span>
            <span class="info-value">{{ selectedModelInfo.version }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">特点:</span>
            <span class="info-value">{{ selectedModelInfo.features }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">推荐用途:</span>
            <span class="info-value">{{ selectedModelInfo.recommendedUse }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {usePortraitStore} from '@/stores/portraitStore'
import {InfoFilled} from '@element-plus/icons-vue'

const store = usePortraitStore()

// 模型信息映射
const modelInfoMap = {
  'wanx-v1': {
    provider: '阿里云',
    version: 'wanx-v1',
    features: '高质量图像生成，风格多样',
    recommendedUse: '通用图像生成，二次元、写实风格'
  },
  'wanx-sketch-to-image': {
    provider: '阿里云',
    version: 'wanx-sketch-to-image',
    features: '基于参考图生成，保持构图',
    recommendedUse: '图生图，参考图转换'
  },
  'doubao-seedream-5-0-260128': {
    provider: '字节跳动火山引擎',
    version: 'doubao-seedream-5.0',
    features: '最新模型，细节丰富，质量优秀',
    recommendedUse: '高质量图像生成，复杂场景'
  },
  'doubao-seedream-4-0-260128': {
    provider: '字节跳动火山引擎',
    version: 'doubao-seedream-4.0',
    features: '稳定版本，生成速度快',
    recommendedUse: '快速生成，日常使用'
  }
}

const selectedModelInfo = computed(() => {
  return modelInfoMap[store.params.modelVersion as keyof typeof modelInfoMap]
})

const handleProviderChange = (value: string) => {
  // 当切换提供商时，自动选择该提供商的默认模型
  if (value === 'aliyun') {
    store.params.modelVersion = 'wanx-v1'
  } else if (value === 'volcengine') {
    store.params.modelVersion = 'doubao-seedream-5-0-260128'
  }
  handleParamChange()
}

const handleParamChange = () => {
  store.saveParams()
}
</script>

<style scoped>
.model-selection-panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.panel-header h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.panel-description {
  margin: 0 0 20px 0;
  color: #909399;
  font-size: 14px;
  line-height: 1.5;
}

.param-group {
  margin-bottom: 20px;
}

.param-label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
  font-weight: 500;
  font-size: 14px;
}

.provider-group {
  display: flex;
  gap: 12px;
}

.provider-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.provider-logo {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.model-select {
  width: 100%;
}

.model-option {
  padding: 8px 0;
}

.model-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.model-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.model-info {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #409eff;
  font-weight: 500;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  gap: 12px;
}

.info-label {
  color: #606266;
  font-weight: 500;
  min-width: 80px;
}

.info-value {
  color: #303133;
  flex: 1;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .provider-group {
    flex-direction: column;
  }

  .info-item {
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    min-width: auto;
  }
}
</style>

