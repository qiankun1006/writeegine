# 进度条组件技术设计文档

## 上下文
当前游戏素材创作系统（`/create-game/asset`）需要为耗时操作（如AI立绘生成、地图生成、粒子效果渲染）提供进度反馈。现有的系统缺乏统一的进度显示组件，用户无法直观了解操作进度和状态。

## 目标与非目标

### 目标
1. 提供6种游戏场景常用的进度条效果
2. 支持血条专属编辑功能，可直接在页面上调整和预览
3. 集成到现有Vue3项目中，保持技术栈一致性
4. 提供完整的API文档和使用示例
5. 支持响应式设计，适配不同设备

### 非目标
1. 不替换现有的Element Plus组件库
2. 不引入新的构建工具或框架
3. 不修改现有的后端API结构（除非必要）
4. 不支持IE浏览器（现代浏览器优先）

## 技术决策

### 1. 组件架构
**决策**: 使用 Vue3 Composition API + `<script setup>` 语法糖
**理由**:
- 与现有 `ai-portrait-generator` 项目技术栈保持一致
- Composition API 更适合复杂组件的逻辑组织
- `<script setup>` 语法更简洁，减少样板代码

**备选方案考虑**:
- Options API: 更传统，但代码组织不如 Composition API 清晰
- React: 需要引入新框架，增加学习成本

### 2. 样式实现
**决策**: 使用原生CSS3 + CSS变量实现多风格效果
**理由**:
- 无第三方UI库强依赖，保持组件轻量
- CSS变量便于主题定制和动态样式调整
- 原生CSS动画性能更好，兼容性更广

**备选方案考虑**:
- Tailwind CSS: 需要引入新依赖，增加构建体积
- SCSS/Less: 增加预处理步骤，但本项目已使用SCSS

### 3. 动画实现
**决策**: 使用 CSS Transition + CSS Animation 组合
**理由**:
- CSS动画性能优于JavaScript动画
- 支持硬件加速，流畅度更好
- 可通过CSS变量控制动画速度

### 4. 状态管理
**决策**: 使用组件内部状态 + Props 传递
**理由**:
- 进度条组件状态相对独立
- 通过Props与父组件通信足够
- 避免引入Pinia/Vuex等状态管理库的复杂度

## 详细设计

### 组件文件结构
```
src/components/ui/
├── ProgressBar.vue          # 主组件
├── ProgressBarEditor.vue    # 血条编辑面板（可选）
└── types/
    └── progress-bar.ts      # TypeScript类型定义
```

### ProgressBar.vue 组件设计

#### Props 定义
```typescript
interface ProgressBarProps {
  // 基础属性
  value: number;                    // 当前进度值 (0-100)
  max?: number;                     // 最大值 (默认100)
  type?: 'simple' | 'health' | 'energy' | 'loading' | 'pixel' | 'glass'; // 进度条类型
  status?: 'loading' | 'success' | 'error' | 'idle'; // 状态

  // 样式配置
  height?: string;                  // 高度 (默认 '20px')
  width?: string;                   // 宽度 (默认 '100%')
  borderRadius?: string;            // 圆角 (默认 '10px')
  animationDuration?: string;       // 动画时长 (默认 '0.3s')

  // 血条专属配置
  healthConfig?: {
    showValue?: boolean;            // 是否显示血量数值
    lowHealthWarning?: boolean;     // 是否启用低血量警示
    gradientStart?: string;         // 渐变起始色
    gradientEnd?: string;           // 渐变结束色
    borderSize?: number;            // 边框大小（像素款）
  };

  // 其他配置
  showTooltip?: boolean;            // 是否显示tooltip
  tooltipContent?: string;          // tooltip内容
}
```

#### 事件定义
```typescript
interface ProgressBarEmits {
  (e: 'update:value', value: number): void;  // 进度值变化
  (e: 'change', value: number): void;        // 进度变化
  (e: 'complete'): void;                     // 进度完成
  (e: 'error', error: Error): void;          // 进度错误
}
```

### 6种进度条效果实现细节

#### 1. 极简纯色款 (simple)
- 纯色背景 + 纯色填充
- 支持自定义背景色、填充色、圆角、边框
- 无纹理，最基础的进度条

#### 2. 游戏血条款 (health)
- 线性渐变：深红(#8B0000) → 鲜红(#FF0000)
- 血滴纹理：使用CSS伪元素创建血滴效果
- 受损闪烁动画：血量变化时闪烁
- 低血量警示：血量低于20%时抖动效果

#### 3. 能量条款 (energy)
- 径向渐变：蓝色(#1E90FF) → 紫色(#8A2BE2)
- 流光动画：使用CSS动画创建能量流动效果
- 充能脉冲：进度达到100%时脉冲效果

#### 4. 加载进度款 (loading)
- 条纹动效：使用CSS线性渐变创建条纹
- 进度数字：实时显示百分比
- 状态图标：加载完成显示✓，失败显示✗

#### 5. 复古像素款 (pixel)
- 8bit像素边框：使用box-shadow创建像素效果
- 阶梯式填充：进度以8px为阶梯增长
- 像素字体：使用等宽字体显示进度

#### 6. 玻璃拟态款 (glass)
- 毛玻璃背景：backdrop-filter: blur(10px)
- 半透明填充：rgba(255, 255, 255, 0.3)
- 模糊边框：border with blur effect

### 血条编辑功能实现

#### 编辑面板组件 (ProgressBarEditor.vue)
```vue
<template>
  <div class="progress-bar-editor">
    <div class="editor-preview">
      <ProgressBar v-bind="previewConfig" />
    </div>

    <div class="editor-controls">
      <!-- 拖拽滑块 -->
      <div class="control-group">
        <label>血量值: {{ previewConfig.value }}%</label>
        <input
          type="range"
          v-model="previewConfig.value"
          min="0"
          max="100"
          @input="updatePreview"
        />
      </div>

      <!-- 数值输入 -->
      <div class="control-group">
        <label>手动输入:</label>
        <input
          type="number"
          v-model.number="previewConfig.value"
          min="0"
          max="100"
          @input="updatePreview"
        />
      </div>

      <!-- 样式配置 -->
      <div class="control-group">
        <label>渐变起始色:</label>
        <input
          type="color"
          v-model="previewConfig.healthConfig.gradientStart"
          @input="updatePreview"
        />
      </div>

      <!-- 保存按钮 -->
      <button @click="saveConfig">保存配置</button>
    </div>
  </div>
</template>
```

### 集成到 create-game-asset-portal.html

#### 添加进度条功能块
```html
<!-- 在现有功能分组后添加 -->
<div class="function-group">
  <div class="group-title">UI组件工具</div>
  <div class="cards-grid">
    <a href="/create-game/asset/progress-bar-demo" class="function-card">
      <div class="card-icon">📊</div>
      <div class="card-title">进度条组件</div>
      <div class="card-desc">6种游戏进度条效果演示与编辑</div>
    </a>
  </div>
</div>
```

### 代码示例

#### 基础使用示例
```vue
<template>
  <div class="demo-container">
    <!-- 简单进度条 -->
    <ProgressBar
      :value="progress"
      type="simple"
      height="20px"
      @change="handleProgressChange"
    />

    <!-- 游戏血条 -->
    <ProgressBar
      :value="health"
      type="health"
      :health-config="{
        showValue: true,
        lowHealthWarning: true,
        gradientStart: '#8B0000',
        gradientEnd: '#FF0000'
      }"
      @complete="handleHealthFull"
    />

    <!-- 能量条 -->
    <ProgressBar
      :value="energy"
      type="energy"
      animation-duration="0.5s"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';

const progress = ref(50);
const health = ref(80);
const energy = ref(30);

const handleProgressChange = (value) => {
  console.log('进度变化:', value);
};

const handleHealthFull = () => {
  console.log('血量已满!');
};
</script>
```

#### 与后端API集成示例
```vue
<template>
  <div class="ai-portrait-generator">
    <!-- AI立绘生成进度 -->
    <ProgressBar
      :value="generationProgress"
      type="loading"
      :status="generationStatus"
      :tooltip-content="`生成进度: ${generationProgress}% - ${currentTask}`"
    />

    <button @click="generatePortrait" :disabled="isGenerating">
      {{ isGenerating ? '生成中...' : '生成立绘' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { generateAIPortrait } from '@/api/ai-portrait';

const generationProgress = ref(0);
const generationStatus = ref('idle');
const currentTask = ref('');
const isGenerating = computed(() => generationStatus.value === 'loading');

const generatePortrait = async () => {
  generationStatus.value = 'loading';
  generationProgress.value = 0;

  try {
    // 模拟进度更新
    const interval = setInterval(() => {
      generationProgress.value += 10;
      if (generationProgress.value >= 100) {
        clearInterval(interval);
        generationStatus.value = 'success';
      }
    }, 500);

    // 实际API调用
    await generateAIPortrait({
      onProgress: (progress, task) => {
        generationProgress.value = progress;
        currentTask.value = task;
      }
    });

  } catch (error) {
    generationStatus.value = 'error';
    console.error('生成失败:', error);
  }
};
</script>
```

## 风险与权衡

### 风险1: 浏览器兼容性
**风险**: CSS滤镜效果（如backdrop-filter）在旧浏览器中不支持
**缓解措施**:
- 提供降级方案（使用opacity替代）
- 明确支持的浏览器版本（Chrome 76+, Firefox 103+, Safari 15.4+）
- 使用@supports进行特性检测

### 风险2: 性能问题
**风险**: 复杂的CSS动画可能影响页面性能
**缓解措施**:
- 使用will-change属性优化动画性能
- 限制同时运行的动画数量
- 提供动画开关选项

### 风险3: 与现有样式冲突
**风险**: 组件样式可能被全局CSS覆盖
**缓解措施**:
- 使用CSS作用域（scoped styles）
- 提高选择器特异性
- 使用CSS自定义属性（CSS变量）进行样式配置

## 迁移计划
1. **阶段1**: 开发核心组件，在独立页面测试
2. **阶段2**: 集成到AI立绘生成器作为试点
3. **阶段3**: 推广到其他需要进度反馈的功能模块
4. **阶段4**: 替换现有简单的进度显示

## 开放问题
1. 是否需要支持垂直进度条？
2. 是否添加环形进度条变体？
3. 是否提供主题系统，支持自定义颜色方案？
4. 是否添加无障碍访问（ARIA）支持？

