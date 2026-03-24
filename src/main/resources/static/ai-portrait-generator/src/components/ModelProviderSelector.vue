<template>
  <div class="model-provider-selector">
    <!-- 折叠头部 -->
    <div class="provider-header" @click="isExpanded = !isExpanded">
      <div class="header-left">
        <el-icon class="expand-icon" :class="{ 'expand-icon--open': isExpanded }">
          <ArrowRight />
        </el-icon>
        <label class="section-label">AI模型选择</label>
        <span v-if="selectedProvider" class="selected-tag">{{ selectedProvider.name }}</span>
      </div>
      <el-button
        type="text"
        size="small"
        @click.stop="refreshProviders"
        :loading="isRefreshing"
      >
        <el-icon><Refresh /></el-icon>
      </el-button>
    </div>

    <!-- 展开的模型列表容器 -->
    <div v-if="isExpanded" class="provider-container">
      <!-- 模型列表 -->
      <div class="provider-list">
        <div
          v-for="provider in availableProviders"
          :key="provider.id"
          class="provider-item"
          :class="{ 'provider-item--selected': selectedProvider?.id === provider.id }"
          @click="selectProvider(provider)"
        >
          <!-- 模型图标 -->
          <div class="provider-icon">
            <el-icon :size="24" :color="provider.color">
              <component :is="provider.icon" />
            </el-icon>
          </div>

          <!-- 模型信息 -->
          <div class="provider-info">
            <h4 class="provider-name">{{ provider.name }}</h4>
            <p class="provider-description">{{ provider.description }}</p>

            <!-- 模型版本选择 -->
            <div class="model-version-selector">
              <el-select
                v-model="selectedModelVersions[provider.id]"
                placeholder="选择模型版本"
                size="small"
                @change="handleModelVersionChange(provider.id)"
                class="version-select"
              >
                <el-option
                  v-for="version in provider.versions"
                  :key="version.value"
                  :label="version.label"
                  :value="version.value"
                />
              </el-select>
            </div>
          </div>

          <!-- 选中状态指示器 -->
          <div class="provider-check" v-if="selectedProvider?.id === provider.id">
            <el-icon class="check-icon">
              <SuccessFilled />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- 模型状态提示 -->
      <div class="provider-status">
        <el-alert
          v-if="currentProviderStatus"
          :type="currentProviderStatus.type"
          :title="currentProviderStatus.title"
          :description="currentProviderStatus.description"
          :closable="false"
          size="small"
          show-icon
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref, computed} from 'vue'
import {usePortraitStore} from '@/stores/portraitStore'
import {ArrowRight, Refresh, SuccessFilled, Cloudy, Service, MagicStick} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'

interface ModelVersion {
  value: string
  label: string
  description?: string
}

interface AIProvider {
  id: string
  name: string
  description: string
  icon: any
  color: string
  versions: ModelVersion[]
  status: 'available' | 'unavailable' | 'limited'
}

interface ProviderStatus {
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  description: string
}

const store = usePortraitStore()

// 可用的AI模型提供商
const availableProviders = ref<AIProvider[]>([
  {
    id: 'meituan',
    name: '美团千问',
    description: '美团自研的千问图像生成模型，支持文生图和图生图',
    icon: Service,
    color: '#FF6B35',
    versions: [
      { value: 'Qwen-Image-Meituan', label: '千问图像生成', description: '文生图模型，适合角色设计、场景生成' },
      { value: 'Qwen-Image-Edit-Meituan', label: '千问图像编辑', description: '图生图模型，适合图片修改、风格转换' }
    ],
    status: 'available'
  },
  {
    id: 'aliyun',
    name: '阿里云通义',
    description: '阿里云通义万相图像生成模型，支持多种风格',
    icon: Cloudy,
    color: '#FF6A00',
    versions: [
      { value: 'wanx-v1', label: '万相V1', description: '基础文生图模型' },
      { value: 'wanx-v2', label: '万相V2', description: '增强版文生图模型' },
      { value: 'tongyi-image', label: '通义图像', description: '通用图像生成模型' }
    ],
    status: 'available'
  },
  {
    id: 'volcengine',
    name: '火山引擎豆包',
    description: '字节跳动火山引擎豆包图像生成模型',
    icon: MagicStick,
    color: '#00B2FF',
    versions: [
      { value: 'doubao-seedream-5-0-lite', label: '豆包5.0 Lite', description: '轻量版图像生成模型' },
      { value: 'doubao-seedream-5-0-260128', label: '豆包5.0 Pro', description: '专业版图像生成模型' },
      { value: 'doubao-seedream-4-0', label: '豆包4.0', description: '经典版图像生成模型' }
    ],
    status: 'available'
  }
])

// 选中的提供商
const selectedProvider = ref<AIProvider | null>(null)

// 各提供商选中的模型版本
const selectedModelVersions = reactive<Record<string, string>>({
  'meituan': 'Qwen-Image-Meituan',
  'aliyun': 'wanx-v1',
  'volcengine': 'doubao-seedream-5-0-lite'
})

// 展开/折叠状态
const isExpanded = ref(true)

// 刷新状态
const isRefreshing = ref(false)

// 计算当前提供商状态
const currentProviderStatus = computed<ProviderStatus | null>(() => {
  if (!selectedProvider.value) return null

  const provider = selectedProvider.value
  const modelVersion = selectedModelVersions[provider.id]

  switch (provider.id) {
    case 'meituan':
      return {
        type: 'success',
        title: '美团千问模型已就绪',
        description: `当前选择: ${modelVersion} - 支持文生图和图生图功能`
      }
    case 'aliyun':
      return {
        type: 'warning',
        title: '阿里云通义模型',
        description: `当前选择: ${modelVersion} - 需要配置API Key`
      }
    case 'volcengine':
      return {
        type: 'info',
        title: '火山引擎豆包模型',
        description: `当前选择: ${modelVersion} - 需要配置API Key`
      }
    default:
      return null
  }
})

// 选择提供商
const selectProvider = (provider: AIProvider) => {
  selectedProvider.value = provider
  store.params.provider = provider.id as 'aliyun' | 'volcengine' | 'meituan'
  store.params.modelVersion = selectedModelVersions[provider.id]
  store.saveParams()

  ElMessage.success(`已切换到${provider.name}`)
}

// 处理模型版本变化
const handleModelVersionChange = (providerId: string) => {
  if (selectedProvider.value?.id === providerId) {
    store.params.modelVersion = selectedModelVersions[providerId]
    store.saveParams()
    ElMessage.info(`模型版本已更新: ${selectedModelVersions[providerId]}`)
  }
}

// 刷新提供商列表
const refreshProviders = async () => {
  isRefreshing.value = true
  try {
    // 模拟API调用刷新提供商状态
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 这里可以添加实际的API调用来检查各提供商状态
    // 例如：检查API Key配置状态、服务可用性等

    ElMessage.success('模型提供商列表已更新')
  } finally {
    isRefreshing.value = false
  }
}

// 初始化：恢复已保存的提供商选择
onMounted(() => {
  // 从store中恢复提供商和模型版本
  const currentProvider = availableProviders.value.find(p => p.id === store.params.provider)
  if (currentProvider) {
    selectedProvider.value = currentProvider
    selectedModelVersions[currentProvider.id] = store.params.modelVersion
  } else {
    // 默认选择美团千问
    const meituanProvider = availableProviders.value.find(p => p.id === 'meituan')
    if (meituanProvider) {
      selectedProvider.value = meituanProvider
      store.params.provider = 'meituan'
      store.params.modelVersion = 'Qwen-Image-Meituan'
      store.saveParams()
    }
  }
})
</script>

<style scoped lang="scss">
.model-provider-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// ========== 提供商容器 ==========
.provider-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 0 0 6px 6px;
  border: 1px solid #f0f0f0;
  border-top: none;
  margin-top: -1px;
}

// ========== 提供商头部 ==========
.provider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #fafafa;
    border-color: #e0e0e0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  .expand-icon {
    flex-shrink: 0;
    transition: transform 0.3s ease;
    color: #909399;
    font-size: 16px;

    &--open {
      transform: rotate(90deg);
    }
  }

  .selected-tag {
    font-size: 11px;
    color: #2196f3;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.section-label {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
}

// ========== 提供商列表 ==========
.provider-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// ========== 单个提供商项 ==========
.provider-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: #f5f5f5;
    border-color: #e0e0e0;
  }

  &--selected {
    background: #e3f2fd;
    border-color: #2196f3;

    .provider-name {
      color: #2196f3;
      font-weight: 600;
    }
  }
}

// ========== 提供商图标 ==========
.provider-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

// ========== 提供商信息 ==========
.provider-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.provider-name {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.provider-description {
  font-size: 11px;
  color: #909399;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// ========== 模型版本选择器 ==========
.model-version-selector {
  margin-top: 4px;

  .version-select {
    width: 100%;

    :deep(.el-input__wrapper) {
      background: white;
    }
  }
}

// ========== 选中指示器 ==========
.provider-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .check-icon {
    color: #2196f3;
    font-size: 16px;
  }
}

// ========== 提供商状态提示 ==========
.provider-status {
  margin-top: 8px;

  :deep(.el-alert) {
    padding: 8px 12px;

    .el-alert__title {
      font-size: 12px;
    }

    .el-alert__description {
      font-size: 11px;
      margin-top: 2px;
    }
  }
}
</style>

