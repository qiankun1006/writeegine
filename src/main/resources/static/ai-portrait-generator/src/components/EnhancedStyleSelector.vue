<template>
  <div class="enhanced-style-selector">
    <!-- 风格选择器 -->
    <div class="style-selector-section">
      <label class="section-label">
        风格选择
        <el-tooltip content="选择生成骨骼素材的艺术风格，不同风格会加载不同的 LoRA 模型">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </label>

      <el-radio-group
        v-model="selectedStyle"
        class="style-radio-group"
        size="default"
        @change="onStyleChange"
      >
        <el-radio-button
          v-for="style in styles"
          :key="style.id"
          :label="style.id"
          :class="{ 'has-preview': style.previewUrl }"
        >
          <div class="style-option">
            <span class="style-icon">{{ style.icon }}</span>
            <span class="style-name">{{ style.name }}</span>
            <span v-if="style.lora" class="lora-badge">LoRA</span>
          </div>
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- LoRA 预览和配置 -->
    <div v-if="selectedStyleConfig.lora" class="lora-config-section">
      <label class="section-label">
        LoRA 配置
        <el-tooltip :content="selectedStyleConfig.loraTooltip">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </label>

      <div class="lora-preview-card" v-if="selectedStyleConfig.previewUrl">
        <img :src="selectedStyleConfig.previewUrl" :alt="selectedStyleConfig.name" class="lora-preview-image" />
        <div class="lora-preview-info">
          <div class="lora-name">{{ selectedStyleConfig.lora }}</div>
          <div class="lora-description">{{ selectedStyleConfig.description }}</div>
        </div>
      </div>

      <!-- LoRA 权重调整 -->
      <div class="lora-slider-section">
        <div class="slider-label">
          <span>LoRA 强度</span>
          <span class="slider-value">{{ loraWeight.toFixed(2) }}</span>
        </div>
        <el-slider
          v-model="loraWeight"
          :min="0"
          :max="1.5"
          :step="0.05"
          :show-tooltip="true"
          :marks="loraWeightMarks"
          @input="onLoraWeightChange"
        />
        <div class="slider-hint">
          <span class="low">低 (风格不明显)</span>
          <span class="default">推荐: 0.8</span>
          <span class="high">高 (可能过拟合)</span>
        </div>
      </div>

      <!-- LoRA 触发词 -->
      <div class="trigger-words-section">
        <label class="section-sub-label">LoRA 触发词</label>
        <el-input
          v-model="loraTriggerWords"
          type="textarea"
          :rows="2"
          placeholder="LoRA 触发词..."
          @input="onTriggerWordsChange"
        />
        <div class="trigger-words-hint">
          建议使用 LoRA 推荐的触发词以获得最佳效果
        </div>
      </div>
    </div>

    <!-- 风格预览 -->
    <div v-if="stylePreviews.length > 0" class="style-previews-section">
      <label class="section-label">风格预览</label>
      <div class="style-previews">
        <div
          v-for="preview in stylePreviews"
          :key="preview.id"
          class="style-preview-item"
          :class="{ 'active': preview.id === selectedStyle }"
          @click="selectStyle(preview.id)"
        >
          <img :src="preview.imageUrl" :alt="preview.name" class="preview-image" />
          <div class="preview-overlay">
            <div class="preview-name">{{ preview.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 结构 LoRA 配置 -->
    <div v-if="selectedStyle === 'realistic' || selectedStyle === 'anime'" class="structure-lora-section">
      <label class="section-label">
        人体结构 LoRA
        <el-tooltip content="启用人体结构 LoRA 可改善角色比例和骨架结构">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </label>

      <el-switch
        v-model="enableStructureLora"
        active-text="启用"
        inactive-text="禁用"
        @change="onStructureLoraChange"
      />

      <div v-if="enableStructureLora" class="structure-lora-info">
        <el-alert
          type="info"
          :closable="false"
          show-icon
          title="人体结构 LoRA 已启用"
          description="将使用 human_structure_v2 LoRA 改善人体结构和比例"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {QuestionFilled} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'
import {usePortraitStore} from '@/stores/portraitStore'

interface StyleConfig {
  id: string
  name: string
  icon: string
  description: string
  lora?: string
  loraWeight?: number
  triggerWords?: string
  previewUrl?: string
  loraTooltip?: string
  color?: string
}

interface StylePreview {
  id: string
  name: string
  imageUrl: string
  description: string
}

const store = usePortraitStore()

// 风格配置数据
const styles = ref<StyleConfig[]>([
  {
    id: 'anime',
    name: '日系二次元',
    icon: '🎨',
    description: '日本动漫风格，清晰线条，鲜明色彩',
    lora: 'anime_style_v3',
    loraWeight: 0.8,
    triggerWords: 'anime style, masterpiece, best quality, ultra detailed, 1girl',
    previewUrl: '/api/ai/lora/preview/anime_style_v3',
    loraTooltip: 'anime_style_v3 LoRA：优化二次元角色线条和色彩表现',
    color: '#ff6b9d'
  },
  {
    id: 'realistic',
    name: '写实人体',
    icon: '👤',
    description: '真实人体结构，自然光影，皮肤质感',
    lora: 'realistic_human_v2',
    loraWeight: 0.7,
    triggerWords: 'photorealistic, hyperdetailed, professional photo, masterpiece',
    previewUrl: '/api/ai/lora/preview/realistic_human_v2',
    loraTooltip: 'realistic_human_v2 LoRA：提升人体真实感和皮肤纹理细节',
    color: '#4dabf7'
  },
  {
    id: 'chibi',
    name: 'Q版卡通',
    icon: '👶',
    description: '可爱Q版风格，大头小身体，简单线条',
    lora: 'chibi_style_v1',
    loraWeight: 0.9,
    triggerWords: 'chibi, cute, small body, big head, anime',
    previewUrl: '/api/ai/lora/preview/chibi_style_v1',
    loraTooltip: 'chibi_style_v1 LoRA：专门为Q版风格优化，可爱比例',
    color: '#ff922b'
  },
  {
    id: 'cartoon',
    name: '美式卡通',
    icon: '📺',
    description: '西方卡通风格，夸张表情，生动动作',
    lora: 'cartoon_style_v2',
    loraWeight: 0.75,
    triggerWords: 'cartoon, western animation, disney style, clean lines',
    previewUrl: '/api/ai/lora/preview/cartoon_style_v2',
    loraTooltip: 'cartoon_style_v2 LoRA：美式卡通风格线条和色彩',
    color: '#51cf66'
  },
  {
    id: 'pixel',
    name: '像素风',
    icon: '🕹️',
    description: '复古像素艺术风格，怀旧游戏感',
    lora: 'pixel_art_v1',
    loraWeight: 0.85,
    triggerWords: 'pixel art, retro game, 8-bit, 16-bit, nostalgic',
    previewUrl: '/api/ai/lora/preview/pixel_art_v1',
    loraTooltip: 'pixel_art_v1 LoRA：像素艺术风格优化，边缘清晰',
    color: '#ae3ec9'
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    icon: '🤖',
    description: '未来科技风格，霓虹灯，机械元素',
    lora: 'cyberpunk_style',
    loraWeight: 0.8,
    triggerWords: 'cyberpunk, neon, futuristic, cybernetics, sci-fi',
    previewUrl: '/api/ai/lora/preview/cyberpunk_style',
    loraTooltip: 'cyberpunk_style LoRA：赛博朋克风格霓虹和机械细节',
    color: '#9775fa'
  },
  {
    id: 'fantasy',
    name: '奇幻风格',
    icon: '🧙',
    description: '奇幻角色风格，魔法特效，华丽装饰',
    lora: 'fantasy_art_v1',
    loraWeight: 0.75,
    triggerWords: 'fantasy, magic, epic, high fantasy, mystical',
    previewUrl: '/api/ai/lora/preview/fantasy_art_v1',
    loraTooltip: 'fantasy_art_v1 LoRA：奇幻风格优化，魔法特效更华丽',
    color: '#ff922b'
  }
])

// 当前选中的风格
const selectedStyle = ref('anime')

// LoRA 相关配置
const loraWeight = ref(0.8)
const loraTriggerWords = ref('')
const enableStructureLora = ref(true)

// 风格预览图
const stylePreviews = ref<StylePreview[]>([])

// 计算选中的风格配置
const selectedStyleConfig = computed(() => {
  return styles.value.find(style => style.id === selectedStyle.value) || styles.value[0]
})

// LoRA 权重刻度
const loraWeightMarks = computed(() => ({
  0: '0',
  0.3: '0.3',
  0.6: '0.6',
  0.8: '推荐',
  1.0: '1.0',
  1.2: '1.2',
  1.5: '1.5'
}))

// 初始化
onMounted(() => {
  loadStylePreviews()
})

// 加载风格预览图
const loadStylePreviews = async () => {
  try {
    // 这里应该调用API获取风格预览图
    // 暂时使用模拟数据
    stylePreviews.value = [
      {
        id: 'anime',
        name: '日系二次元',
        imageUrl: '/api/ai/style/preview/anime',
        description: '日系动漫风格示例'
      },
      {
        id: 'realistic',
        name: '写实人体',
        imageUrl: '/api/ai/style/preview/realistic',
        description: '写实人体示例'
      },
      {
        id: 'chibi',
        name: 'Q版卡通',
        imageUrl: '/api/ai/style/preview/chibi',
        description: 'Q版卡通示例'
      },
      {
        id: 'cartoon',
        name: '美式卡通',
        imageUrl: '/api/ai/style/preview/cartoon',
        description: '美式卡通示例'
      }
    ]
  } catch (error) {
    console.error('加载风格预览失败:', error)
    ElMessage.error('加载风格预览失败')
  }
}

// 风格切换处理
const onStyleChange = (styleId: string) => {
  const style = styles.value.find(s => s.id === styleId)
  if (style) {
    selectedStyle.value = styleId

    // 更新 LoRA 权重
    if (style.loraWeight !== undefined) {
      loraWeight.value = style.loraWeight
    }

    // 更新触发词
    if (style.triggerWords) {
      loraTriggerWords.value = style.triggerWords
    }

    // 通知store更新
    store.params.stylePreset = styleId
    store.saveParams()

    ElMessage.success(`已切换到 ${style.name} 风格`)
  }
}

// LoRA 权重变化处理
const onLoraWeightChange = (weight: number) => {
  // 更新 store 中的权重配置
  store.params.modelWeight = weight
  store.saveParams()
}

// LoRA 触发词变化处理
const onTriggerWordsChange = (words: string) => {
  // 将触发词添加到提示词中
  if (store.params.prompt && words) {
    const currentPrompt = store.params.prompt
    // 移除旧的触发词（如果有）
    const promptWithoutTrigger = currentPrompt.replace(/\nTrigger words:.*/, '')
    store.params.prompt = `${promptWithoutTrigger}\nTrigger words: ${words}`
  }
}

// 结构 LoRA 切换处理
const onStructureLoraChange = (enabled: boolean) => {
  if (enabled) {
    ElMessage.success('已启用人体结构 LoRA')
    // 添加结构 LoRA 到提示词
    store.params.prompt = `${store.params.prompt}\nStructure Lora: human_structure_v2 (weight: 0.6)`
  } else {
    ElMessage.info('已禁用人体结构 LoRA')
    // 移除结构 LoRA 提示词
    store.params.prompt = store.params.prompt.replace('\nStructure Lora: human_structure_v2 (weight: 0.6)', '')
  }
}

// 选择风格（预览图点击）
const selectStyle = (styleId: string) => {
  onStyleChange(styleId)
}

// 获取当前风格配置
const getCurrentStyleConfig = () => {
  return {
    styleId: selectedStyle.value,
    loraName: selectedStyleConfig.value.lora,
    loraWeight: loraWeight.value,
    triggerWords: loraTriggerWords.value,
    enableStructureLora: enableStructureLora.value
  }
}

// 暴露给父组件的方法
defineExpose({
  getCurrentStyleConfig,
  selectStyle
})
</script>

<style scoped lang="scss">
.enhanced-style-selector {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;

  .help-icon {
    font-size: 14px;
    color: #909399;
    cursor: help;

    &:hover {
      color: #409eff;
    }
  }
}

.section-sub-label {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
  display: block;
}

.style-radio-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  :deep(.el-radio-button) {
    .el-radio-button__inner {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #dcdfe6;
      background: #f5f7fa;
      transition: all 0.3s ease;

      &:hover {
        background: #e6f7ff;
        border-color: #409eff;
      }
    }

    &.is-active {
      .el-radio-button__inner {
        background: #409eff;
        border-color: #409eff;
        color: white;
      }
    }
  }
}

.style-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  .style-icon {
    font-size: 20px;
  }

  .style-name {
    font-size: 13px;
    font-weight: 500;
  }

  .lora-badge {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 10px;
    background: #722ed1;
    color: white;
    margin-top: 4px;
  }
}

.lora-config-section {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lora-preview-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e8e8e8;

  .lora-preview-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 6px;
    border: 2px solid #409eff;
  }

  .lora-preview-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .lora-name {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }

    .lora-description {
      font-size: 12px;
      color: #606266;
      line-height: 1.4;
    }
  }
}

.lora-slider-section {
  .slider-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .slider-value {
      font-size: 14px;
      font-weight: 600;
      color: #409eff;
    }
  }

  .slider-hint {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    font-size: 12px;
    color: #909399;

    .low {
      color: #67c23a;
    }

    .default {
      color: #409eff;
      font-weight: 500;
    }

    .high {
      color: #f56c6c;
    }
  }
}

.trigger-words-section {
  .trigger-words-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 6px;
    font-style: italic;
  }
}

.structure-lora-section {
  padding: 16px;
  background: #fff7e6;
  border-radius: 8px;
  border: 1px solid #ffd591;

  :deep(.el-switch) {
    .el-switch__label {
      font-size: 12px;
    }
  }

  .structure-lora-info {
    margin-top: 12px;
  }
}

.style-previews-section {
  .style-previews {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .style-preview-item {
    position: relative;
    cursor: pointer;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
    border: 2px solid transparent;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.active {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }

    .preview-image {
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 6px;
    }

    .preview-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 8px;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
      color: white;
      font-size: 11px;
      text-align: center;
      border-radius: 0 0 6px 6px;

      .preview-name {
        font-weight: 500;
        font-size: 12px;
      }
    }
  }
}
</style>

