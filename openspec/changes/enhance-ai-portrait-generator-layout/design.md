# 技术设计：AI 立绘生成器布局优化

## 上下文

当前 AI 立绘生成器前端页面采用 Vue 3 + Element Plus 技术栈，但存在以下技术问题：

1. **布局结构不符合规格要求**：规格要求宽屏（≥1440px）采用三栏布局，但当前实现是两栏布局（核心参数+结果展示），高级参数被折叠在核心参数面板内部
2. **滚动功能被限制**：HTML 模板中设置了 `overflow: hidden`，阻止了页面的自然滚动
3. **空间利用率低**：右侧大量空白区域未被利用，影响用户体验

## 目标与非目标

### 目标
- 实现宽屏（≥1440px）的三栏响应式布局
- 修复页面滚动功能，支持自然滚动
- 充分利用浏览器宽度，减少空白区域
- 保持与现有规格的一致性
- 确保向后兼容，不破坏现有功能

### 非目标
- 不修改参数控件的业务逻辑
- 不添加新功能或参数
- 不改变移动端和平板端的现有布局逻辑（仅优化）

## 设计决策

### 决策 1：采用三栏布局而非两栏布局
**问题**：当前两栏布局在宽屏上右侧有大量空白
**解决方案**：将高级参数面板从核心参数面板中提取出来，作为独立的中间栏
**理由**：
- 符合规格要求（spec.md 第 362-368 行要求三栏布局）
- 充分利用宽屏空间，减少空白区域
- 提升参数的可发现性和操作效率
- 保持与现有响应式设计的延续性

**实现方案**：
```vue
<!-- App.vue 新布局结构 -->
<div class="layout-wrapper">
  <!-- 左侧：核心参数面板 -->
  <aside class="core-params-panel">
    <CoreParamsPanel />
  </aside>

  <!-- 中间：高级参数面板（独立） -->
  <aside class="advanced-params-panel">
    <AdvancedParamsPanel />
  </aside>

  <!-- 右侧：结果展示面板 -->
  <section class="results-panel">
    <ResultsPanel />
  </section>
</div>
```

### 决策 2：移除 HTML 模板中的滚动限制
**问题**：`character-portrait.html` 中设置 `overflow: hidden` 导致无法滚动
**解决方案**：移除第 11-16 行的 `overflow: hidden` 设置，改为允许自然滚动
**理由**：
- 恢复浏览器的自然滚动行为
- 允许用户查看被遮挡的内容
- 符合 Web 标准和无障碍设计要求

**实现方案**：
```html
<!-- 修改前 -->
<style>
  html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;  <!-- 问题所在 -->
    height: 100%;
  }
</style>

<!-- 修改后 -->
<style>
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
  }
</style>
```

### 决策 3：面板内容区域支持独立滚动
**问题**：当参数内容过多时，需要支持面板内部滚动
**解决方案**：为每个面板设置 `overflow-y: auto` 和适当的高度约束
**理由**：
- 保持页面整体结构稳定
- 允许用户在面板内查看大量内容
- 避免整个页面滚动导致的定位问题

**实现方案**：
```scss
.core-params-panel,
.advanced-params-panel {
  overflow-y: auto;
  max-height: calc(100vh - 80px); // 减去导航栏高度
}

.results-panel {
  overflow-y: auto;
  flex: 1;
}
```

### 决策 4：响应式布局断点调整
**问题**：需要支持三栏、两栏、单栏的平滑过渡
**解决方案**：基于现有断点系统，增加宽屏（≥1440px）的三栏布局
**理由**：
- 保持与现有响应式系统的一致性
- 渐进增强，不影响小屏幕设备
- 易于维护和扩展

**实现方案**：
```scss
// 宽屏（≥1440px）：三栏布局
@include responsive-wide {
  .layout-wrapper {
    display: grid;
    grid-template-columns: 320px 320px 1fr;
    gap: $spacing-lg;
  }
}

// 桌面端（1024-1439px）：两栏布局（核心参数+结果）
@include responsive-desktop {
  .layout-wrapper {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: $spacing-lg;

    .advanced-params-panel {
      display: none; // 高级参数折叠在核心参数中
    }
  }
}

// 平板端（768-1023px）：两栏堆叠
@include responsive-tablet {
  .layout-wrapper {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }
}

// 手机端（<768px）：单栏堆叠
@include responsive-mobile {
  .layout-wrapper {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }
}
```

### 决策 5：高级参数面板改造方案
**问题**：高级参数面板当前是折叠组件，需要改为固定展开的独立面板
**解决方案**：移除折叠标题，保留参数控件，调整样式
**理由**：
- 简化用户操作，无需点击展开
- 提升高级参数的可见性和使用率
- 保持控件功能和状态管理不变

**实现方案**：
```vue
<!-- 修改前：折叠面板 -->
<div class="advanced-params-panel">
  <div class="collapse-header" @click="toggleCollapse">
    <span class="header-title">🔧 高级参数</span>
    <el-icon class="toggle-icon">
      <ArrowDown />
    </el-icon>
  </div>
  <el-collapse-transition>
    <div v-show="isOpen" class="collapse-content">
      <!-- 参数控件 -->
    </div>
  </el-collapse-transition>
</div>

<!-- 修改后：固定面板 -->
<div class="advanced-params-panel">
  <div class="panel-header">
    <span class="header-title">🔧 高级参数</span>
  </div>
  <div class="panel-content">
    <!-- 相同的参数控件 -->
  </div>
</div>
```

## 风险与权衡

### 风险 1：布局变更可能导致样式冲突
**缓解措施**：
- 在独立分支中进行修改
- 充分测试不同屏幕尺寸
- 使用浏览器的开发者工具进行兼容性检查

### 风险 2：滚动功能修复可能影响现有交互
**缓解措施**：
- 确保面板内部滚动不影响全局滚动
- 测试键盘导航和触摸交互
- 验证无障碍访问功能

### 风险 3：宽屏三栏布局可能在小屏幕上显示不佳
**缓解措施**：
- 使用响应式设计，确保小屏幕回退到合适的布局
- 在不同设备上进行真机测试
- 提供 CSS 媒体查询的优雅降级

## 迁移计划

### 阶段 1：准备（1 小时）
- 备份现有代码
- 创建特性分支
- 设置测试环境

### 阶段 2：实施（3-4 小时）
- 修改 HTML 模板（修复滚动）
- 重构 App.vue 布局
- 调整核心参数面板
- 改造高级参数面板
- 更新样式文件

### 阶段 3：测试（2 小时）
- 功能测试：验证所有参数控件正常工作
- 响应式测试：测试不同屏幕尺寸的布局
- 滚动测试：验证滚动功能正常
- 兼容性测试：检查不同浏览器的表现

### 阶段 4：部署（1 小时）
- 合并到主分支
- 构建前端资源
- 部署到测试环境
- 最终验证

## 开放问题

1. **高级参数的可见性**：将高级参数作为独立面板显示后，是否需要在中小屏幕上提供访问方式？
   - **建议**：在平板和手机端，将高级参数保留在核心参数面板内作为折叠组件，保持现有行为

2. **面板高度管理**：当三个面板内容高度不一致时，如何确保视觉平衡？
   - **建议**：使用 CSS Grid 的自动高度分配，或为每个面板设置 `max-height` 和内部滚动

3. **与后端 API 的集成**：布局变更是否会影响现有的 API 调用？
   - **评估**：布局变更不涉及业务逻辑，API 调用应不受影响，但需要验证

