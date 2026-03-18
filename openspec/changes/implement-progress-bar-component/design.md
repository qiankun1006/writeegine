## 上下文

游戏素材创作系统需要为游戏开发者提供丰富的UI组件。进度条是游戏UI中的核心组件，用于显示血量、能量、加载进度等关键信息。当前系统缺少一个功能完整、样式多样的进度条组件。

### 约束条件
- 基于现有项目的前端架构：Vue3 + Composition API
- 兼容现有的Element Plus UI库
- 支持Vite构建工具
- 需要集成到现有的Thymeleaf模板系统中
- 保持与现有游戏素材创作系统的一致性

## 目标与非目标

### 目标
1. 实现一个功能完整的Vue3进度条组件，支持6种游戏常用效果
2. 提供直观的参数配置界面和实时预览
3. 支持响应式设计，适配PC和平板设备
4. 提供完整的API文档和使用示例
5. 集成到游戏素材创作工作流中

### 非目标
1. 不支持IE浏览器（现代浏览器兼容）
2. 不实现3D或WebGL效果（保持2D CSS实现）
3. 不提供服务器端渲染支持
4. 不实现复杂的游戏引擎集成（仅提供组件）

## 技术决策

### 1. 组件架构设计

```javascript
// ProgressBar.vue 组件结构
<template>
  <div class="progress-bar" :class="[typeClass, statusClass]" @mouseenter="showTooltip" @mouseleave="hideTooltip">
    <!-- 背景层 -->
    <div class="progress-background" :style="backgroundStyle"></div>

    <!-- 填充层 -->
    <div class="progress-fill" :style="fillStyle">
      <!-- 根据类型显示不同内容 -->
      <template v-if="type === 'health'">
        <div class="blood-drops"></div>
        <span v-if="showValue" class="hp-value">{{ currentValue }} HP</span>
      </template>
      <template v-else-if="type === 'loading'">
        <div class="stripes-animation"></div>
        <span class="percentage">{{ percentage }}%</span>
      </template>
      <!-- 其他类型... -->
    </div>

    <!-- 边框层 -->
    <div class="progress-border" :style="borderStyle"></div>

    <!-- 状态图标 -->
    <div v-if="statusIcon" class="status-icon">
      <component :is="statusIcon" />
    </div>

    <!-- Tooltip -->
    <div v-if="showTooltipContent" class="progress-tooltip">
      {{ tooltipContent }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

// Props定义
const props = defineProps({
  type: { type: String, default: 'simple' }, // simple, health, energy, loading, pixel, glass
  value: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  // ... 其他props
})

// 计算属性
const percentage = computed(() => (props.value / props.max) * 100)
const typeClass = computed(() => `progress-bar--${props.type}`)
// ... 其他计算属性
</script>
```

### 2. 6种效果实现方案

#### 2.1 极简纯色款
- 使用纯CSS实现背景和填充
- 支持自定义颜色、圆角、边框
- 通过CSS transition实现平滑动画

#### 2.2 游戏血条款
- 使用linear-gradient实现红渐变
- 通过伪元素和background-image添加血滴纹理
- 使用CSS animation实现受损闪烁
- 低血量时添加CSS transform抖动效果

#### 2.3 能量条款
- 使用radial-gradient实现能量球效果
- 通过CSS animation实现流光动画
- 充能完成时使用keyframes实现脉冲效果

#### 2.4 加载进度款
- 使用linear-gradient和animation实现条纹动效
- 实时显示百分比数字
- 根据状态显示不同图标（✓/✗）

#### 2.5 复古像素款
- 使用border-image实现像素边框
- 通过clip-path实现阶梯式填充
- 使用像素字体显示数值

#### 2.6 玻璃拟态款
- 使用backdrop-filter实现毛玻璃效果
- 半透明填充和模糊边框
- 添加内阴影增强立体感

### 3. 状态管理设计

```javascript
// 使用Composition API管理状态
import { ref, computed, watch } from 'vue'

export function useProgressBar(props) {
  const currentValue = ref(props.value)
  const status = ref('idle') // idle, loading, success, error
  const animationSpeed = ref(0.3) // 0.2-1s

  // 监听value变化，添加动画
  watch(() => props.value, (newVal, oldVal) => {
    if (props.animate) {
      animateValue(oldVal, newVal)
    } else {
      currentValue.value = newVal
    }
  })

  // 动画函数
  const animateValue = (from, to) => {
    // 使用requestAnimationFrame实现平滑动画
  }

  return {
    currentValue,
    status,
    animationSpeed,
    // ... 其他状态和方法
  }
}
```

### 4. 响应式设计

```css
/* 基础样式 */
.progress-bar {
  position: relative;
  width: 100%;
  height: 24px;
  overflow: hidden;
  border-radius: 4px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .progress-bar {
    height: 20px;
  }

  .progress-bar--pixel {
    /* 平板端调整像素大小 */
    border-width: 2px;
  }
}

/* 游戏编辑器中的特殊样式 */
.game-editor .progress-bar {
  height: 20px;
  margin: 4px 0;
}
```

### 5. 集成方案

#### 5.1 目录结构
```
src/main/resources/static/ui-components/
├── index.js              # 组件导出
├── ProgressBar.vue       # 主组件
├── ProgressBarDemo.vue   # 演示组件
├── styles/
│   ├── base.css         # 基础样式
│   ├── types/           # 各类型样式
│   │   ├── simple.css
│   │   ├── health.css
│   │   ├── energy.css
│   │   ├── loading.css
│   │   ├── pixel.css
│   │   └── glass.css
│   └── animations.css   # 动画样式
└── utils/
    ├── color.js         # 颜色工具
    └── animation.js     # 动画工具
```

#### 5.2 页面集成（保持现有页面不变）

**重要原则：不修改现有的`create-game-asset.html`页面结构**

```html
<!-- 方案1：创建全新的独立页面（推荐） -->
<!-- progress-bar-demo.html 独立的演示页面 -->
<div layout:fragment="content">
  <div class="progress-bar-demo-wrapper">
    <h1>🎮 游戏进度条组件演示</h1>
    <p>这是一个独立的演示页面，不会影响现有的游戏素材创作页面。</p>

    <div id="progress-bar-demo-app">
      <progress-bar-demo />
    </div>

    <!-- 返回链接 -->
    <div class="back-link">
      <a href="/create-game/asset">← 返回游戏素材创作页面</a>
    </div>
  </div>
</div>

<!-- 方案2：在现有页面中添加外部链接（不修改现有菜单逻辑） -->
<!-- 可以在create-game-asset.html的某个位置添加一个外部链接，但不修改菜单系统 -->
<div class="external-tools-section" style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
  <h4>🛠️ 外部工具</h4>
  <ul>
    <li><a href="/create-game/asset/progress-bar-demo" target="_blank">📊 进度条组件演示（新窗口打开）</a></li>
  </ul>
</div>
```

#### 5.3 构建配置
```javascript
// vite.config.js 添加别名
export default defineConfig({
  resolve: {
    alias: {
      '@ui-components': '/src/main/resources/static/ui-components'
    }
  }
})
```

## 风险与权衡

### 风险
1. **性能风险**：复杂的CSS动画可能影响性能
   - 缓解：使用GPU加速属性，限制同时运行的动画数量

2. **浏览器兼容性**：某些CSS特性（如backdrop-filter）兼容性有限
   - 缓解：提供降级方案，使用feature detection

3. **集成复杂度**：需要与现有系统无缝集成
   - 缓解：保持API简洁，提供详细文档

### 权衡
1. **CSS vs Canvas**：选择CSS实现而非Canvas
   - 理由：CSS更轻量，易于维护，支持响应式

2. **独立组件 vs 集成到Element Plus**
   - 理由：保持独立性，避免强依赖，便于复用

3. **功能完整性 vs 开发时间**
   - 权衡：优先实现核心6种效果，后续可扩展

## 迁移计划

### 阶段1：组件开发（1-2天）
- 实现ProgressBar.vue核心组件
- 完成6种效果的基础实现

### 阶段2：演示页面（1天）
- 创建演示页面和参数配置面板
- 添加使用示例

### 阶段3：集成测试（1天）
- 集成到素材创作系统
- 测试所有功能
- 修复问题

### 阶段4：文档和发布（0.5天）
- 编写API文档和使用说明
- 发布到生产环境

## 开放问题

1. 是否需要支持自定义CSS类名注入？
2. 是否提供TypeScript类型定义？
3. 如何管理不同效果之间的样式冲突？
4. 是否提供主题系统支持？

