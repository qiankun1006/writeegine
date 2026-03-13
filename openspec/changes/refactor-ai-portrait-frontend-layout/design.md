# 设计文档：AI 人物立绘生成器前端布局重构

## 上下文

### 背景
当前 AI 人物立绘生成器采用响应式多栏布局，支持多种屏幕尺寸。但用户反馈显示，复杂的布局逻辑和众多响应式断点反而增加了用户的认知负担，特别是在 PC 端的体验并不理想。

### 目标设备与场景
- **主要目标**：PC 端（1200px 及以上），这是 AI 立绘生成的主要使用场景
- **次要目标**：后续可扩展支持移动端（但本轮不涉及）

### 设计约束
1. 最小宽度：1200px
2. 左侧固定宽度：380px（根据参数模块宽度优化）
3. 技术栈：Vue 3 + Element Plus + TypeScript
4. 浏览器兼容：现代浏览器（Chrome/Safari/Firefox/Edge）

---

## 目标与非目标

### 🎯 目标
1. **简化布局**：从多栏响应式改为清晰的双栏布局，减少布局切换逻辑
2. **改进交互**：参数配置默认折叠，用户界面更清爽，参数调整时展开即可
3. **优化代码**：统一使用 Vue 3 `<script setup>` 和 Element Plus 组件，提高代码质量和可维护性
4. **提升 PC 体验**：充分利用宽屏空间，左右分栏无冲突，操作流畅
5. **易于扩展**：为后续功能（如历史记录、预设、AI 推荐）预留接口

### ❌ 非目标
1. **不重写所有组件**：尽量复用现有组件（如 CoreParamsPanel、AdvancedParamsPanel 等），只调整布局和样式
2. **不支持响应式移动端**：本轮仅针对 PC 端（≥1200px），移动端适配留给后续迭代
3. **不改变后端 API**：前端仅做页面布局调整，后端接口无需改动
4. **不涉及功能新增**：仅是布局优化和交互改进，核心功能保持不变

---

## 技术决策

### 1. 布局方案：Flexbox + Grid 混合

**决策**：使用 Flexbox 作为主要布局方式，必要时辅以 CSS Grid。

**理由**：
- Flexbox 天然支持弹性布局，左侧固定 380px，右侧自适应填充非常简洁
- 浏览器兼容性好，所有现代浏览器都支持
- 代码简洁易维护，相比 Grid 更直观

**代码示例（App.vue）**：
```scss
.layout-wrapper {
  display: flex;
  gap: 20px;
  padding: 20px;
  height: 100%;

  // 左侧控制区
  .control-panel {
    width: 380px;
    overflow-y: auto;
    flex-shrink: 0;  // 防止被压缩
    background: #f5f5f5;
    border-radius: 8px;
    padding: 16px;
  }

  // 右侧预览区
  .preview-panel {
    flex: 1;  // 占据剩余空间
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-radius: 8px;

    // 上方预览（90%）
    .preview-content {
      flex: 0.9;
      border: 2px dashed #dcdfe6;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    // 下方操作（10%）
    .preview-actions {
      flex: 0.1;
      display: flex;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid #f0f0f0;
    }
  }
}
```

---

### 2. 组件结构

**决策**：将左侧控制区分为三个独立模块，通过子组件组织。

```
App.vue
├── NavigationBar.vue
└── main-container
    ├── ControlPanel.vue（新增容器）
    │   ├── PromptModule.vue（提示词模块，由 CoreParamsPanel 提供）
    │   ├── ReferenceImageModule.vue（参考图片，新增或改造）
    │   └── ParameterCollapse.vue（参数折叠，由 AdvancedParamsPanel 改造）
    └── PreviewPanel.vue（预览面板，由 ResultsPanel 改造）
```

**理由**：
- 模块化设计便于独立开发和测试
- 每个模块职责单一，易于维护
- 复用现有组件减少重复开发

---

### 3. 状态管理

**决策**：使用 Vue 3 Composition API（ref/reactive）在组件内管理状态，不引入 Pinia 或 Vuex。

**理由**：
- 数据流简单，仅涉及参数输入和生成结果显示
- 组件间通信通过 props/emits 处理
- 避免过度设计，保持代码轻量

**状态结构示例**：
```typescript
// ControlPanel.vue 内部状态
const promptForm = reactive({
  positive: '',      // 正面提示词
  negative: '',      // 负面提示词
});

const referenceImage = ref<File | null>(null);
const isParametersExpanded = ref(false);

const parameters = reactive({
  model: 'SD 1.5',
  imageStrength: 0.5,
  sampler: 'Euler',
  steps: 20,
});

const generationResult = reactive({
  isLoading: false,
  image: null,
  generatedAt: null,
});
```

---

### 4. 参数配置折叠实现

**决策**：使用 Element Plus `ElCollapse` 组件实现参数配置的展开/收起。

**理由**：
- Element Plus 官方组件，风格统一，体验优化
- 自带动画效果和 accessibility 支持
- 代码简洁，无需手动实现

**代码示例**：
```vue
<template>
  <el-collapse
    v-model="expandedItems"
    accordion
  >
    <el-collapse-item
      title="⚙️ 高级参数"
      name="parameters"
    >
      <!-- 参数配置内容 -->
      <div class="parameter-group">
        <label>模型选择</label>
        <el-select v-model="parameters.model">
          <el-option label="SD 1.5" value="SD 1.5" />
          <el-option label="SDXL" value="SDXL" />
          <el-option label="Realistic" value="Realistic" />
        </el-select>
      </div>

      <div class="parameter-group">
        <label>图生图强度</label>
        <el-slider
          v-model="parameters.imageStrength"
          :min="0"
          :max="1"
          :step="0.01"
          show-input
        />
      </div>

      <div class="parameter-group">
        <label>采样器</label>
        <el-select v-model="parameters.sampler">
          <el-option label="Euler" value="Euler" />
          <el-option label="DPM++ 2M Karras" value="DPM++" />
          <el-option label="Auto" value="Auto" />
        </el-select>
      </div>

      <div class="parameter-group">
        <label>迭代步数</label>
        <el-input-number
          v-model="parameters.steps"
          :min="10"
          :max="50"
        />
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElCollapse, ElCollapseItem, ElSelect, ElOption, ElSlider, ElInputNumber } from 'element-plus'

const expandedItems = ref([''])  // 默认收起

const parameters = reactive({
  model: 'SD 1.5',
  imageStrength: 0.5,
  sampler: 'Euler',
  steps: 20,
})
</script>

<style scoped lang="scss">
.parameter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;

  label {
    font-weight: 500;
    color: #303133;
    font-size: 14px;
  }
}
</style>
```

---

### 5. 图片上传实现

**决策**：使用 Element Plus `ElUpload` 组件，支持拖拽和点击上传。

**理由**：
- 官方组件，样式美观、交互优化
- 内置文件验证和进度显示
- 开箱即用，减少自定义代码

**代码示例**：
```vue
<template>
  <div class="reference-image-module">
    <h3>📸 参考图片</h3>

    <el-upload
      v-if="!referenceImage"
      drag
      action="#"
      accept="image/png,image/jpeg,image/webp"
      :auto-upload="false"
      :on-change="handleImageChange"
    >
      <el-icon class="el-icon--upload">
        <CloudUpload />
      </el-icon>
      <div class="el-upload__text">
        拖拽图片或 <em>点击选择</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持 PNG、JPG、WEBP 格式，大小不超过 10MB
        </div>
      </template>
    </el-upload>

    <!-- 图片预览 -->
    <div v-else class="image-preview">
      <img :src="imagePreviewUrl" alt="reference" />
      <el-button
        type="danger"
        circle
        @click="handleImageDelete"
      >
        ❌
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { CloudUpload } from '@element-plus/icons-vue'

const referenceImage = ref<File | null>(null)
const imagePreviewUrl = ref('')

const handleImageChange = (file: any) => {
  const selectedFile = file.raw

  // 验证文件大小
  if (selectedFile.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不超过 10MB')
    return
  }

  // 创建预览 URL
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreviewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(selectedFile)

  referenceImage.value = selectedFile
}

const handleImageDelete = () => {
  referenceImage.value = null
  imagePreviewUrl.value = ''
  ElMessage.success('已删除图片')
}
</script>

<style scoped lang="scss">
.reference-image-module {
  h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  .image-preview {
    position: relative;
    width: 100%;
    border-radius: 8px;
    overflow: hidden;

    img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    button {
      position: absolute;
      top: 8px;
      right: 8px;
    }
  }
}

:deep(.el-upload-dragger) {
  border-color: #dcdfe6;
  background-color: #fafafa;

  &:hover {
    border-color: #409eff;
    background-color: #f5f7fa;
  }
}
</style>
```

---

### 6. 生成图片按钮加载状态

**决策**：使用 Vue 3 `ref` 管理加载状态，配合 Element Plus 按钮的 `loading` 属性。

**代码示例**：
```vue
<template>
  <div class="preview-actions">
    <el-button
      type="primary"
      :loading="isGenerating"
      :disabled="isGenerating"
      @click="handleGenerate"
    >
      {{ isGenerating ? '⏳ 生成中...' : '✨ 生成图片' }}
    </el-button>

    <el-button link type="primary">
      📜 历史记录
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const isGenerating = ref(false)
const generatedImage = ref<string | null>(null)

const handleGenerate = async () => {
  isGenerating.value = true

  try {
    // 模拟 3 秒生成过程
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 显示示例图片（实际应调用后端 API）
    generatedImage.value = '/path/to/example-image.jpg'
    ElMessage.success('图片生成成功！')
  } catch (error) {
    ElMessage.error('生成失败，请重试')
  } finally {
    isGenerating.value = false
  }
}
</script>

<style scoped lang="scss">
.preview-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #f0f0f0;

  :deep(.el-button) {
    border-radius: 8px;
  }
}
</style>
```

---

### 7. 样式系统与主题变量

**决策**：创建统一的 `theme.scss` 文件，定义颜色、间距、字体等全局变量。

**文件位置**：`src/main/resources/static/ai-portrait-generator/src/styles/theme.scss`

**内容示例**：
```scss
// ============ 颜色系统 ============
$primary-color: #409eff;           // Element Plus 蓝
$border-color: #dcdfe6;            // 输入框边框
$background-light: #f5f5f5;        // 浅灰背景
$background-white: #ffffff;        // 纯白背景
$text-primary: #303133;            // 主文字
$text-secondary: #909399;          // 次文字
$border-dashed: #bfbfbf;           // 虚线边框

// ============ 间距系统 ============
$spacing-xs: 8px;
$spacing-sm: 12px;
$spacing-md: 16px;
$spacing-lg: 20px;
$spacing-xl: 24px;

// ============ 圆角系统 ============
$border-radius: 8px;
$border-radius-lg: 12px;

// ============ 阴影 ============
$shadow-light: 0 2px 8px rgba(0, 0, 0, 0.08);
$shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.12);
$shadow-focus: 0 0 0 3px rgba(64, 158, 255, 0.2);

// ============ 动画 ============
$transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
$transition-fast: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
```

---

### 8. 动画与过渡效果

**决策**：使用 CSS 过渡而不是 JavaScript 动画，提高性能。

**代码示例**：
```scss
// 输入框聚焦效果
input, textarea {
  transition: border-color 0.3s, box-shadow 0.3s;
  border-color: $border-color;
  border-radius: $border-radius;

  &:focus {
    border-color: $primary-color;
    box-shadow: $shadow-focus;
  }
}

// 按钮 Hover 效果
button {
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: $shadow-medium;
  }
}

// 参数折叠动画
.el-collapse-item__header {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 风险与缓解

| 风险 | 影响 | 缓解方案 |
|------|------|---------|
| 现有逻辑复杂度高 | 改造过程中容易引入 bug | 逐个组件改造，编写单元测试，充分测试改造前后的差异 |
| Element Plus 版本兼容 | 某些组件可能存在版本问题 | 确认项目 Element Plus 版本，查阅文档确保 API 兼容 |
| 响应式设计遗弃 | 未来如需支持移动端需重新设计 | 本轮不涉及，后续作为新需求单独处理，UI 组件库模块化便于扩展 |
| 浏览器兼容性 | 旧浏览器不支持 Flexbox 或 CSS Grid | 目标浏览器为现代版本（Chrome 90+、Safari 14+），不考虑 IE 兼容 |

---

## 迁移计划

### 第一阶段：准备与验证
1. 确认 Element Plus 版本和可用组件
2. 准备样式系统文件（theme.scss）
3. 编写单元测试框架

### 第二阶段：组件层改造
1. 改造 App.vue，实现新的布局结构
2. 改造 CoreParamsPanel.vue（提示词模块）
3. 新增或改造 ReferenceImageUpload.vue（参考图片模块）
4. 改造 AdvancedParamsPanel.vue（参数折叠模块）
5. 改造 ResultsPanel.vue（预览面板）

### 第三阶段：样式与交互调整
1. 应用统一的主题变量
2. 调整组件间距和圆角
3. 添加 hover 效果和动画
4. 手动测试各个交互场景

### 第四阶段：集成测试与优化
1. 整合测试所有功能
2. 浏览器兼容性测试
3. 性能优化（如果需要）
4. 用户体验反馈收集

---

## 开放问题

1. **Element Plus 版本**：当前项目使用的 Element Plus 版本是多少？是否需要升级？
2. **国际化（i18n）**：组件中是否需要支持多语言？
3. **暗色主题**：未来是否需要支持暗色模式？
4. **移动端支持**：何时需要支持响应式移动端布局？
5. **后端 API 集成**：图片生成的后端接口是否已就绪？

