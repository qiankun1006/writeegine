<template>
  <div class="size-selector">
    <!-- 模块标题：📐 生成尺寸 -->
    <h3 class="module-title">📐 生成尺寸</h3>

    <div class="size-options">
      <!-- 预设尺寸选项 -->
      <div class="preset-sizes">
        <el-radio-group v-model="selectedSize" @change="handleSizeChange">
          <el-radio label="512x768" class="size-option">
            <div class="size-content">
              <span class="size-icon">📱</span>
              <div class="size-info">
                <p class="size-name">手机壁纸</p>
                <p class="size-dimensions">512×768</p>
              </div>
            </div>
          </el-radio>

          <el-radio label="768x512" class="size-option">
            <div class="size-content">
              <span class="size-icon">💻</span>
              <div class="size-info">
                <p class="size-name">电脑壁纸</p>
                <p class="size-dimensions">768×512</p>
              </div>
            </div>
          </el-radio>

          <el-radio label="1024x1024" class="size-option">
            <div class="size-content">
              <span class="size-icon">🖼️</span>
              <div class="size-info">
                <p class="size-name">方形头像</p>
                <p class="size-dimensions">1024×1024</p>
              </div>
            </div>
          </el-radio>

          <el-radio label="2048x2048" class="size-option">
            <div class="size-content">
              <span class="size-icon">🎨</span>
              <div class="size-info">
                <p class="size-name">高清画作</p>
                <p class="size-dimensions">2048×2048</p>
              </div>
            </div>
          </el-radio>
        </el-radio-group>
      </div>

      <!-- 自定义尺寸 -->
      <div class="custom-size">
        <div class="custom-header">
          <span class="custom-label">自定义尺寸</span>
          <el-switch
            v-model="useCustomSize"
            size="small"
            @change="handleCustomToggle"
          />
        </div>

        <div v-if="useCustomSize" class="custom-inputs">
          <div class="dimension-input">
            <label>宽度</label>
            <el-select
              v-model="customWidth"
              placeholder="选择宽度"
              @change="handleCustomSizeChange"
            >
              <el-option v-for="size in validSizes" :key="size" :label="size" :value="size" />
            </el-select>
          </div>

          <div class="dimension-input">
            <label>高度</label>
            <el-select
              v-model="customHeight"
              placeholder="选择高度"
              @change="handleCustomSizeChange"
            >
              <el-option v-for="size in validSizes" :key="size" :label="size" :value="size" />
            </el-select>
          </div>

          <div class="size-hint">
            <el-icon><InfoFilled /></el-icon>
            <span>建议使用2的幂次方尺寸以获得最佳效果</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 尺寸验证提示 -->
    <div v-if="!store.isSizeValid" class="error-hint">
      <el-icon><Warning /></el-icon>
      <span>请选择有效的尺寸（256、512、1024、2048）</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {usePortraitStore} from '@/stores/portraitStore'
import {InfoFilled, Warning} from '@element-plus/icons-vue'

const store = usePortraitStore()

// 有效尺寸列表
const validSizes = [256, 512, 1024, 2048]

// 预设尺寸映射
const sizePresets = {
  '512x768': { width: 512, height: 768 },
  '768x512': { width: 768, height: 512 },
  '1024x1024': { width: 1024, height: 1024 },
  '2048x2048': { width: 2048, height: 2048 }
}

// 当前选中的预设尺寸
const selectedSize = ref<string>('')

// 是否使用自定义尺寸
const useCustomSize = ref(false)

// 自定义尺寸
const customWidth = ref<number>(512)
const customHeight = ref<number>(768)

// 根据当前store尺寸计算选中的预设
const currentSizeKey = computed(() => {
  const { width, height } = store.params
  for (const [key, size] of Object.entries(sizePresets)) {
    if (size.width === width && size.height === height) {
      return key
    }
  }
  return ''
})

// 监听store尺寸变化
watch(() => [store.params.width, store.params.height], () => {
  if (!useCustomSize.value) {
    selectedSize.value = currentSizeKey.value
  }
})

// 处理预设尺寸选择
const handleSizeChange = (sizeKey: string) => {
  if (sizeKey && sizePresets[sizeKey as keyof typeof sizePresets]) {
    const size = sizePresets[sizeKey as keyof typeof sizePresets]
    store.params.width = size.width
    store.params.height = size.height
    store.saveParams()
    useCustomSize.value = false
  }
}

// 处理自定义尺寸切换
const handleCustomToggle = (useCustom: boolean) => {
  if (useCustom) {
    // 切换到自定义模式
    customWidth.value = store.params.width
    customHeight.value = store.params.height
    selectedSize.value = ''
  } else {
    // 切换回预设模式
    handleSizeChange(currentSizeKey.value || '512x768')
  }
}

// 处理自定义尺寸变化
const handleCustomSizeChange = () => {
  if (useCustomSize.value && customWidth.value && customHeight.value) {
    store.params.width = customWidth.value
    store.params.height = customHeight.value
    store.saveParams()
  }
}

// 初始化
onMounted(() => {
  // 检查当前尺寸是否在预设中
  const sizeKey = currentSizeKey.value
  if (sizeKey) {
    selectedSize.value = sizeKey
    useCustomSize.value = false
  } else {
    // 如果不在预设中，使用自定义模式
    useCustomSize.value = true
    customWidth.value = store.params.width
    customHeight.value = store.params.height
  }
})
</script>

<style scoped lang="scss">
.size-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.module-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  padding: 0;
}

.size-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 预设尺寸样式
.preset-sizes {
  :deep(.el-radio-group) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    width: 100%;
  }
}

.size-option {
  width: 100%;
  margin: 0;

  :deep(.el-radio__input) {
    display: none;
  }

  :deep(.el-radio__label) {
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    transition: all 0.3s ease;
    cursor: pointer;
    width: 100%;
    display: block;

    &:hover {
      border-color: #c0c0c0;
      background: #fafafa;
    }
  }

  :deep(.el-radio.is-checked .el-radio__label) {
    border-color: #6c5ce7;
    background: #f0f2ff;
    box-shadow: 0 2px 8px rgba(108, 92, 231, 0.1);
  }
}

.size-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.size-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.size-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.size-name {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.size-dimensions {
  font-size: 11px;
  color: #909399;
  margin: 0;
}

// 自定义尺寸样式
.custom-size {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-label {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
}

.custom-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dimension-input {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    color: #606266;
    font-weight: 500;
  }

  :deep(.el-select) {
    width: 100%;
  }
}

.size-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: #e8f4ff;
  border-radius: 4px;
  border: 1px solid #b3d9ff;

  :deep(.el-icon) {
    color: #1890ff;
    font-size: 14px;
    flex-shrink: 0;
  }

  span {
    font-size: 11px;
    color: #1890ff;
    line-height: 1.4;
  }
}

// 错误提示
.error-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background-color: rgba(245, 34, 45, 0.1);
  border: 1px solid #f5222d;
  border-radius: 4px;
  color: #f5222d;
  font-size: 12px;

  :deep(.el-icon) {
    font-size: 14px;
    flex-shrink: 0;
  }
}
</style>

