<template>
  <div class="style-model-selector">
    <!-- 折叠头部 -->
    <div class="model-header" @click="isExpanded = !isExpanded">
      <div class="header-left">
        <el-icon class="expand-icon" :class="{ 'expand-icon--open': isExpanded }">
          <ArrowRight />
        </el-icon>
        <label class="section-label">风格模型选择</label>
        <span v-if="selectedModel" class="selected-tag">{{ selectedModel.name }}</span>
      </div>
      <el-button
        type="text"
        size="small"
        @click.stop="refreshModels"
        :loading="isRefreshing"
      >
        <el-icon><Refresh /></el-icon>
      </el-button>
    </div>

    <!-- 展开的模型列表容器 -->
    <div v-if="isExpanded" class="model-container">
      <!-- 模型列表 -->
      <div class="model-list">
        <div
          v-for="model in styleModels"
          :key="model.id"
          class="model-item"
          :class="{ 'model-item--selected': selectedModel?.id === model.id }"
          @click="selectModel(model)"
        >
          <!-- 模型缩略图/预览 -->
          <div class="model-preview">
            <img
              v-if="model.imageUrl"
              :src="model.imageUrl"
              :alt="model.name"
              class="preview-image"
            />
            <div v-else class="preview-placeholder">
              <el-icon><Picture /></el-icon>
            </div>
          </div>

          <!-- 模型信息 -->
          <div class="model-info">
            <h4 class="model-name">{{ model.name }}</h4>
            <p class="model-description">{{ model.description }}</p>

            <!-- 风格标签 -->
            <div v-if="model.tags?.length" class="model-tags">
              <el-tag
                v-for="tag in model.tags"
                :key="tag"
                size="small"
                type="info"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>

          <!-- 选中状态指示器 -->
          <div class="model-check" v-if="selectedModel?.id === model.id">
            <el-icon class="check-icon">
              <SuccessFilled />
            </el-icon>
          </div>

          <!-- 强度滑块 -->
          <div class="model-weight">
            <el-slider
              v-model="modelWeights[model.id]"
              :min="0"
              :max="1"
              :step="0.05"
              :format-tooltip="(val) => `强度: ${(val * 100).toFixed(0)}%`"
              @change="updateModelWeight(model.id)"
              class="weight-slider"
            />
          </div>
        </div>
      </div>

      <!-- 添加风格模型按钮 -->
      <div class="add-model-section">
        <el-button
          type="dashed"
          class="add-model-btn"
          @click="showAddModelDialog = true"
          :icon="Plus"
        >
          + 添加风格模型
        </el-button>
      </div>
    </div>

    <!-- 添加模型对话框 -->
    <el-dialog
      v-model="showAddModelDialog"
      title="添加自定义风格模型"
      width="500px"
      @close="resetAddModelForm"
    >
      <el-form :model="newModelForm" label-width="100px">
        <el-form-item label="模型名称">
          <el-input
            v-model="newModelForm.name"
            placeholder="例如：赛博朋克"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="风格描述">
          <el-input
            v-model="newModelForm.description"
            type="textarea"
            rows="3"
            placeholder="描述这个风格模型的特点"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="预览图片">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            @change="handleModelImageUpload"
          >
            <el-icon class="el-icon--upload"><Upload /></el-icon>
            <div class="el-upload__text">
              拖拽或<em>点击上传</em>预览图片
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModelDialog = false">取消</el-button>
        <el-button type="primary" @click="addCustomModel">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {usePortraitStore} from '@/stores/portraitStore'
import {ArrowRight, Picture, Plus, Refresh, SuccessFilled, Upload,} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'

interface StyleModel {
  id: string
  name: string
  description: string
  imageUrl?: string
  tags?: string[]
}

const store = usePortraitStore()

// 风格模型列表
const styleModels = ref<StyleModel[]>([
  {
    id: 'anime-v1',
    name: '日系二次元',
    description: '清新的日系动画风格，适合角色设计',
    tags: ['二次元', '日系', '动画'],
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23e91e63" width="200" height="200"/%3E%3C/svg%3E',
  },
  {
    id: 'oil-painting',
    name: '油画风格',
    description: '经典的油画艺术风格，富有质感',
    tags: ['油画', '艺术', '质感'],
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%239c27b0" width="200" height="200"/%3E%3C/svg%3E',
  },
  {
    id: '3d-render',
    name: '3D渲染',
    description: '高保真3D渲染风格，逼真细致',
    tags: ['3D', '渲染', '逼真'],
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%232196f3" width="200" height="200"/%3E%3C/svg%3E',
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    description: '未来科幻风格，强烈的色彩对比',
    tags: ['科幻', '未来', '霓虹'],
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23ff6f00" width="200" height="200"/%3E%3C/svg%3E',
  },
  {
    id: 'fantasy',
    name: '奇幻风格',
    description: '魔幻冒险风格，神秘充满想象力',
    tags: ['魔幻', '奇幻', '神秘'],
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%238e24aa" width="200" height="200"/%3E%3C/svg%3E',
  },
])

// 选中的模型
const selectedModel = ref<StyleModel | null>(styleModels.value[0])

// 展开/折叠状态（默认不展开，用户点击标题时展开）
const isExpanded = ref(false)

// 各模型的强度权重
const modelWeights = reactive<Record<string, number>>({
  'anime-v1': 0.8,
  'oil-painting': 0.6,
  '3d-render': 0.7,
  'cyberpunk': 0.75,
  'fantasy': 0.65,
})

// 刷新状态
const isRefreshing = ref(false)

// 添加模型对话框
const showAddModelDialog = ref(false)
const newModelForm = reactive({
  name: '',
  description: '',
  imageUrl: '',
})

// 选择模型
const selectModel = (model: StyleModel) => {
  selectedModel.value = model
  store.params.stylePreset = model.id
  store.saveParams()
}

// 更新模型强度
const updateModelWeight = (modelId: string) => {
  if (selectedModel.value?.id === modelId) {
    store.params.modelWeight = modelWeights[modelId]
    store.saveParams()
  }
}

// 刷新模型列表
const refreshModels = async () => {
  isRefreshing.value = true
  try {
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000))
    ElMessage.success('模型列表已更新')
  } finally {
    isRefreshing.value = false
  }
}

// 处理上传模型图片
const handleModelImageUpload = (file: any) => {
  if (file.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newModelForm.imageUrl = e.target?.result as string
    }
    reader.readAsDataURL(file.raw)
  }
}

// 添加自定义模型
const addCustomModel = () => {
  if (!newModelForm.name.trim()) {
    ElMessage.error('请输入模型名称')
    return
  }

  const newModel: StyleModel = {
    id: `custom-${Date.now()}`,
    name: newModelForm.name,
    description: newModelForm.description,
    imageUrl: newModelForm.imageUrl || undefined,
    tags: ['自定义'],
  }

  styleModels.value.push(newModel)
  modelWeights[newModel.id] = 0.75
  selectModel(newModel)

  showAddModelDialog.value = false
  ElMessage.success('风格模型已添加')
}

// 重置添加模型表单
const resetAddModelForm = () => {
  newModelForm.name = ''
  newModelForm.description = ''
  newModelForm.imageUrl = ''
}

// 初始化：恢复已保存的模型选择
onMounted(() => {
  const saved = localStorage.getItem('selectedStyleModel')
  if (saved) {
    const found = styleModels.value.find((m) => m.id === saved)
    if (found) {
      selectedModel.value = found
    }
  }

  const savedWeights = localStorage.getItem('modelWeights')
  if (savedWeights) {
    try {
      Object.assign(modelWeights, JSON.parse(savedWeights))
    } catch (error) {
      console.error('无法加载模型权重:', error)
    }
  }
})
</script>

<style scoped lang="scss">
.style-model-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// ========== 模型容器 ==========
.model-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: white;
  border-radius: 0 0 6px 6px;
  border: 1px solid #f0f0f0;
  border-top: none;
  margin-top: -1px;
}

// ========== 模型头部 ==========
.model-header {
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

// ========== 模型列表 ==========
.model-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #bfbfbf;
    border-radius: 3px;

    &:hover {
      background: #8d8d8d;
    }
  }
}

// ========== 单个模型项 ==========
.model-item {
  display: flex;
  gap: 8px;
  padding: 10px;
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

    .model-name {
      color: #2196f3;
      font-weight: 600;
    }
  }
}

// ========== 模型预览 ==========
.model-preview {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  background: white;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  color: #999;

  :deep(.el-icon) {
    font-size: 24px;
  }
}

// ========== 模型信息 ==========
.model-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.model-name {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-description {
  font-size: 11px;
  color: #909399;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// ========== 模型标签 ==========
.model-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 2px;

  :deep(.el-tag) {
    font-size: 10px;
    padding: 2px 6px;
    line-height: 1.2;
  }
}

// ========== 选中指示器 ==========
.model-check {
  position: absolute;
  top: 6px;
  right: 6px;
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

// ========== 模型强度滑块 ==========
.model-weight {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 80px;

  :deep(.el-slider) {
    width: 100%;

    .el-slider__track {
      background-color: #2196f3;
    }

    .el-slider__button {
      border-color: #2196f3;

      &:hover {
        box-shadow: 0 0 5px rgba(33, 150, 243, 0.5);
      }
    }
  }
}

// ========== 添加模型按钮 ==========
.add-model-section {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.add-model-btn {
  width: 100%;
}

// ========== 对话框样式 ==========
:deep(.el-dialog) {
  .el-form {
    margin-top: 16px;
  }

  .el-upload--picture-card,
  .el-upload--drag {
    border-color: #dcdfe6;
  }
}
</style>

