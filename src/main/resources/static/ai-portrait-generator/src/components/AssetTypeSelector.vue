<template>
  <div class="asset-type-selector">
    <!-- 素材类型选择按钮 -->
    <div class="type-header" @click="showModal = true">
      <div class="header-left">
        <!-- 类型图标 -->
        <el-icon class="type-icon">
          <DocumentCopy />
        </el-icon>
        <!-- 标签文字 -->
        <label class="section-label">素材类型选择</label>
        <!-- 选中的类型名称 -->
        <span v-if="selectedType" class="selected-type">{{ selectedType.name }}</span>
      </div>
      <!-- 打开对话框提示 -->
      <el-icon class="open-icon">
        <ArrowRight />
      </el-icon>
    </div>

    <!-- 素材类型选择模态对话框 -->
    <el-dialog
      v-model="showModal"
      title="选择素材类型"
      width="900px"
      @close="handleModalClose"
    >
      <!-- 分组展示的素材类型 -->
      <div class="asset-types-container">
        <!-- 角色相关 -->
        <div class="asset-group">
          <h3 class="group-title">一、角色相关</h3>
          <div class="type-options">
            <div
              v-for="type in assetGroups.character"
              :key="type.id"
              class="type-option"
              :class="{ 'type-option--selected': selectedType?.id === type.id }"
              @click="selectType(type)"
            >
              <!-- 单选框 -->
              <div class="radio-wrapper">
                <input
                  type="radio"
                  :id="`type-${type.id}`"
                  name="asset-type"
                  :checked="selectedType?.id === type.id"
                  @change="selectType(type)"
                />
                <label :for="`type-${type.id}`" class="radio-label"></label>
              </div>
              <!-- 类型图标和文字 -->
              <div class="type-content">
                <span class="type-emoji">{{ type.icon }}</span>
                <div class="type-info">
                  <p class="type-name">{{ type.name }}</p>
                  <p class="type-desc">{{ type.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 地图与场景 -->
        <div class="asset-group">
          <h3 class="group-title">二、地图与场景绘制</h3>
          <div class="type-options">
            <div
              v-for="type in assetGroups.map"
              :key="type.id"
              class="type-option"
              :class="{ 'type-option--selected': selectedType?.id === type.id }"
              @click="selectType(type)"
            >
              <div class="radio-wrapper">
                <input
                  type="radio"
                  :id="`type-${type.id}`"
                  name="asset-type"
                  :checked="selectedType?.id === type.id"
                  @change="selectType(type)"
                />
                <label :for="`type-${type.id}`" class="radio-label"></label>
              </div>
              <div class="type-content">
                <span class="type-emoji">{{ type.icon }}</span>
                <div class="type-info">
                  <p class="type-name">{{ type.name }}</p>
                  <p class="type-desc">{{ type.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- UI 界面类 -->
        <div class="asset-group">
          <h3 class="group-title">三、UI 界面类</h3>
          <div class="type-options">
            <div
              v-for="type in assetGroups.ui"
              :key="type.id"
              class="type-option"
              :class="{ 'type-option--selected': selectedType?.id === type.id }"
              @click="selectType(type)"
            >
              <div class="radio-wrapper">
                <input
                  type="radio"
                  :id="`type-${type.id}`"
                  name="asset-type"
                  :checked="selectedType?.id === type.id"
                  @change="selectType(type)"
                />
                <label :for="`type-${type.id}`" class="radio-label"></label>
              </div>
              <div class="type-content">
                <span class="type-emoji">{{ type.icon }}</span>
                <div class="type-info">
                  <p class="type-name">{{ type.name }}</p>
                  <p class="type-desc">{{ type.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 特效与动画 -->
        <div class="asset-group">
          <h3 class="group-title">四、特效与动画</h3>
          <div class="type-options">
            <div
              v-for="type in assetGroups.effect"
              :key="type.id"
              class="type-option"
              :class="{ 'type-option--selected': selectedType?.id === type.id }"
              @click="selectType(type)"
            >
              <div class="radio-wrapper">
                <input
                  type="radio"
                  :id="`type-${type.id}`"
                  name="asset-type"
                  :checked="selectedType?.id === type.id"
                  @change="selectType(type)"
                />
                <label :for="`type-${type.id}`" class="radio-label"></label>
              </div>
              <div class="type-content">
                <span class="type-emoji">{{ type.icon }}</span>
                <div class="type-info">
                  <p class="type-name">{{ type.name }}</p>
                  <p class="type-desc">{{ type.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 文字与图标 -->
        <div class="asset-group">
          <h3 class="group-title">五、文字与图标</h3>
          <div class="type-options">
            <div
              v-for="type in assetGroups.icon"
              :key="type.id"
              class="type-option"
              :class="{ 'type-option--selected': selectedType?.id === type.id }"
              @click="selectType(type)"
            >
              <div class="radio-wrapper">
                <input
                  type="radio"
                  :id="`type-${type.id}`"
                  name="asset-type"
                  :checked="selectedType?.id === type.id"
                  @change="selectType(type)"
                />
                <label :for="`type-${type.id}`" class="radio-label"></label>
              </div>
              <div class="type-content">
                <span class="type-emoji">{{ type.icon }}</span>
                <div class="type-info">
                  <p class="type-name">{{ type.name }}</p>
                  <p class="type-desc">{{ type.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 剧情与过场 -->
        <div class="asset-group">
          <h3 class="group-title">六、剧情与过场</h3>
          <div class="type-options">
            <div
              v-for="type in assetGroups.story"
              :key="type.id"
              class="type-option"
              :class="{ 'type-option--selected': selectedType?.id === type.id }"
              @click="selectType(type)"
            >
              <div class="radio-wrapper">
                <input
                  type="radio"
                  :id="`type-${type.id}`"
                  name="asset-type"
                  :checked="selectedType?.id === type.id"
                  @change="selectType(type)"
                />
                <label :for="`type-${type.id}`" class="radio-label"></label>
              </div>
              <div class="type-content">
                <span class="type-emoji">{{ type.icon }}</span>
                <div class="type-info">
                  <p class="type-name">{{ type.name }}</p>
                  <p class="type-desc">{{ type.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {usePortraitStore} from '@/stores/portraitStore'
import {ArrowRight, DocumentCopy} from '@element-plus/icons-vue'

interface AssetType {
  id: string
  name: string
  description: string
  icon: string
}

// 定义 emit 事件
const emit = defineEmits<{
  (e: 'asset-type-changed', typeId: string | null): void
}>()

const store = usePortraitStore()

// 显示模态对话框的控制变量
const showModal = ref(false)


// 最终选中的类型（确认后更新）
const selectedType = ref<AssetType | null>(null)

// 素材类型分组
const assetGroups = reactive({
  character: [
    { id: 'character-portrait', name: '角色立绘', description: '创建全身/半身立绘', icon: '🎭' },
    { id: 'character-sd', name: 'Q版/SD战棋', description: 'Q版模型设计', icon: '🤏' },
    { id: 'character-animation', name: '战斗动画', description: '制作战斗动画', icon: '⚔️' },
    { id: 'character-frame-sequence', name: '动画帧序列', description: '骨骼动画编辑', icon: '🎬' },
    { id: 'character-skeleton', name: '骨骼素材生成', description: '生成可拆分肢体部件', icon: '🦴' },
    { id: 'character-avatar', name: '角色头像', description: '头像制作', icon: '👤' },
    { id: 'character-job', name: '职业转职', description: '转职形态设计', icon: '💼' },
    { id: 'character-skill-icon', name: '技能图标', description: '技能图标设计', icon: '✨' },
    { id: 'character-status-icon', name: '状态图标', description: '状态图标设计', icon: '🌡️' },
  ],
  map: [
    { id: 'map-grid', name: '战棋网格地图', description: '网格地图编辑', icon: '🗺️' },
    { id: 'map-terrain', name: '地形块素材', description: '地形元素设计', icon: '🧱' },
    { id: 'map-obstacle', name: '障碍物', description: '障碍物设计', icon: '🪵' },
    { id: 'map-decoration', name: '地图装饰', description: '装饰元素', icon: '🌸' },
    { id: 'map-background', name: '战场背景', description: '战斗场景背景', icon: '🎪' },
    { id: 'map-loading', name: '关卡载入图', description: '加载界面图片', icon: '⏳' },
  ],
  ui: [
    { id: 'ui-main-menu', name: '主菜单 UI', description: '主菜单设计', icon: '🏠' },
    { id: 'ui-level-select', name: '关卡选择', description: '关卡选择界面', icon: '📋' },
    { id: 'ui-dialog', name: '剧情对话', description: '对话框设计', icon: '💬' },
    { id: 'ui-battle-range', name: '范围提示', description: '范围提示UI', icon: '🎯' },
    { id: 'ui-battle-hud', name: '战斗HUD', description: '战斗信息显示', icon: '❤️' },
    { id: 'ui-character-panel', name: '人物属性', description: '属性面板设计', icon: '📊' },
    { id: 'ui-inventory', name: '物品装备', description: '物品栏设计', icon: '🎒' },
    { id: 'ui-skill', name: '技能魔法', description: '技能菜单设计', icon: '✊' },
    { id: 'ui-battle-result', name: '战斗结算', description: '结算界面设计', icon: '🏆' },
  ],
  effect: [
    { id: 'effect-movement', name: '移动轨迹', description: '移动特效', icon: '➡️' },
    { id: 'effect-attack', name: '攻击特效', description: '攻击动画特效', icon: '⚡' },
    { id: 'effect-magic', name: '魔法特效', description: '魔法动画特效', icon: '🔥' },
    { id: 'effect-heal', name: '治愈特效', description: '治愈动画特效', icon: '💚' },
    { id: 'effect-critical', name: '暴击特效', description: '暴击动画特效', icon: '💥' },
    { id: 'effect-status', name: '命中/闪避', description: '命中闪避特效', icon: '✔️' },
    { id: 'effect-levelup', name: '升级特效', description: '升级动画特效', icon: '⭐' },
    { id: 'effect-trap', name: '地形陷阱', description: '陷阱特效', icon: '🪤' },
  ],
  icon: [
    { id: 'font-numbers', name: '数字字体', description: '数字字体设计', icon: '🔢' },
    { id: 'icon-button', name: '按钮图标', description: '按钮图标设计', icon: '🔘' },
    { id: 'icon-job', name: '职业图标', description: '职业图标设计', icon: '💼' },
    { id: 'icon-attribute', name: '属性图标', description: '属性图标设计', icon: '⚔️' },
    { id: 'icon-quest', name: '任务图标', description: '任务图标设计', icon: '🎯' },
  ],
  story: [
    { id: 'story-portrait', name: '剧情立绘', description: '故事立绘', icon: '🎬' },
    { id: 'story-dialog-box', name: '对话框', description: '对话框设计', icon: '💬' },
    { id: 'story-transition', name: '过场背景', description: '过场背景图', icon: '🌅' },
    { id: 'story-avatar', name: '剧情头像', description: '故事头像', icon: '👥' },
  ],
})

/**
 * 选择素材类型
 * @param type - 被选中的素材类型
 */
const selectType = (type: AssetType) => {
  // 更新选中的类型
  selectedType.value = type
  // 通知父组件选中的类型
  emit('asset-type-changed', type.id)
  // 更新 store 中的当前素材类型
  store.setCurrentAssetType(type.id)
  // 自动关闭对话框
  showModal.value = false
}

/**
 * 恢复之前选中的状态
 */
const restorePreviousSelection = () => {
  const savedTypeId = store.currentAssetType
  if (savedTypeId) {
    // 在所有分组中查找对应的AssetType
    const allTypes = [
      ...assetGroups.character,
      ...assetGroups.map,
      ...assetGroups.ui,
      ...assetGroups.effect,
      ...assetGroups.icon,
      ...assetGroups.story
    ]
    const foundType = allTypes.find(type => type.id === savedTypeId)
    if (foundType) {
      selectedType.value = foundType
      // 通知父组件
      emit('asset-type-changed', foundType.id)
    }
  }
}

/**
 * 处理对话框关闭
 * 关闭对话框时的处理
 */
const handleModalClose = () => {
  // 对话框关闭时的清理工作（目前不需要特殊处理）
}

// 组件挂载时恢复之前选中的状态
onMounted(() => {
  restorePreviousSelection()
})
</script>

<style scoped lang="scss">
.asset-type-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// ========== 类型头部 ==========
.type-header {
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
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .type-icon {
    flex-shrink: 0;
    font-size: 18px;
    color: #2196f3;
  }

  .open-icon {
    flex-shrink: 0;
    font-size: 16px;
    color: #909399;
    transition: transform 0.2s ease;
  }

  &:hover .open-icon {
    transform: translateX(2px);
  }
}

.section-label {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
}

.selected-type {
  font-size: 11px;
  color: #2196f3;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// ========== 素材类型容器 ==========
.asset-types-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 8px;
}

// 自定义滚动条
.asset-types-container::-webkit-scrollbar {
  width: 6px;
}

.asset-types-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.asset-types-container::-webkit-scrollbar-thumb {
  background: #bfbfbf;
  border-radius: 3px;

  &:hover {
    background: #8d8d8d;
  }
}

// 优化点击区域
.type-option {
  cursor: pointer;

  // 确保整行都是可点击的
  * {
    pointer-events: none;
  }

  // 单选框除外
  .radio-wrapper {
    pointer-events: auto;
  }
}

// ========== 资产分组 ==========
.asset-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #2196f3;
}

// ========== 类型选项容器 ==========
.type-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// ========== 单个类型选项 ==========
.type-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
    border-color: #e0e0e0;
  }

  &--selected {
    background: #e3f2fd;
    border-color: #2196f3;

    .type-name {
      color: #2196f3;
      font-weight: 600;
    }
  }
}

// ========== 单选框 ==========
.radio-wrapper {
  flex-shrink: 0;
  position: relative;
  width: 20px;
  height: 20px;

  input[type='radio'] {
    appearance: none;
    width: 100%;
    height: 100%;
    margin: 0;
    cursor: pointer;
    border: 2px solid #d9d9d9;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
      border-color: #2196f3;
    }

    &:checked {
      border-color: #2196f3;
      background: #2196f3;
    }
  }

  .radio-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    pointer-events: none;
  }

  input[type='radio']:checked ~ .radio-label {
    display: block;
  }
}

// ========== 类型内容 ==========
.type-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.type-emoji {
  flex-shrink: 0;
  font-size: 20px;
}

.type-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.type-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.type-desc {
  font-size: 11px;
  color: #909399;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// ========== 对话框样式 ==========
:deep(.el-dialog) {
  .el-dialog__body {
    padding: 20px;
  }
}
</style>

