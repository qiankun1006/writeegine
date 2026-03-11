# 设计文档：移除重复滚动条

## 问题分析

### 当前状态

App.vue 的布局结构（第 62-76 行）：
```vue
<div class="layout-wrapper">
  <!-- 核心参数面板 -->
  <aside class="core-params-panel">  <!-- overflow-y: auto (第 85 行) -->
    <CoreParamsPanel />               <!-- 可能有额外的 overflow -->
  </aside>

  <!-- 模型选择面板 -->
  <aside class="model-selection-panel">  <!-- overflow-y: auto (第 106 行) -->
    <ModelSelectionPanel />
  </aside>

  <!-- 高级参数面板 -->
  <aside class="advanced-params-panel">  <!-- overflow-y: auto (第 127 行) -->
    <AdvancedParamsPanel />
  </aside>

  <!-- 结果面板 -->
  <section class="results-panel">  <!-- overflow-y: auto (第 147 行) -->
    <ResultsPanel />
  </section>
</div>
```

### 双层滚动条原因

滚动条显示"两层"的常见原因：
1. **外层 overflow**：`aside` 元素有 `overflow-y: auto`
2. **内层 overflow**：组件本身有 `overflow-y: auto` 或 `overflow: auto`
3. **高度限制**：两层都限制了高度，导致两个独立的滚动条

## 解决方案

### 第 1 步：检查外层（App.vue）

外层样式（已有，且正确）：
```scss
.core-params-panel {
  width: 320px;
  background-color: $white;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  overflow-y: auto;        // ← 保留这个（第 85 行）
  box-shadow: $shadow-md;
  flex-shrink: 0;
  max-height: calc(100vh - 80px);  // ← 有高度限制
}

.advanced-params-panel {
  width: 320px;
  background-color: $white;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  overflow-y: auto;        // ← 保留这个（第 127 行）
  box-shadow: $shadow-md;
  flex-shrink: 0;
  max-height: calc(100vh - 80px);  // ← 有高度限制
}

.model-selection-panel {
  width: 320px;
  background-color: $white;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  overflow-y: auto;        // ← 保留这个（第 106 行）
  box-shadow: $shadow-md;
  flex-shrink: 0;
  max-height: calc(100vh - 80px);  // ← 有高度限制
}
```

### 第 2 步：检查内层（各个组件）

需要检查这些文件，移除任何可能的 overflow 设置：

**CoreParamsPanel.vue**
- 检查是否有 `overflow` 相关样式
- 确保 `.core-params-panel` 等容器类没有 `overflow-y: auto`
- 内容应该直接填充父容器

**AdvancedParamsPanel.vue**
- 检查是否有 `overflow` 相关样式
- 确保 `.advanced-params-panel` 等容器类没有 `overflow-y: auto`

**ModelSelectionPanel.vue**
- 检查是否有 `overflow` 相关样式

## 修改步骤

### 步骤 1：检查各组件是否定义了 overflow

```bash
grep -n "overflow" CoreParamsPanel.vue AdvancedParamsPanel.vue ModelSelectionPanel.vue
```

如果有 `overflow-y: auto` 或 `overflow: auto`，需要移除。

### 步骤 2：如果组件内有 overflow，移除它

例如，如果 CoreParamsPanel.vue 有：
```scss
.core-params-panel {
  overflow-y: auto;  // ← 删除这行
}
```

改为：
```scss
.core-params-panel {
  // overflow-y: auto 已移除
}
```

### 步骤 3：如果内部有嵌套容器有 overflow，也检查

例如，`.panel-content` 或类似的子容器，如果有 `overflow-y: auto` 也应该移除。

## 验证方案

修改后验证：
1. 打开浏览器开发者工具（F12）
2. 检查 `.core-params-panel` 等元素
3. 确认只有一个滚动条（来自外层 `aside` 元素）
4. 测试滚动功能是否正常工作

## 风险评估

**低风险修改**：
- 只是移除冗余的 CSS 属性
- 外层 `overflow-y: auto` 仍然保留，功能不变
- 滚动功能应该保持正常

**测试重点**：
- 各面板内容能否正常滚动
- 长内容是否被完整显示
- 不同屏幕尺寸的表现

## 相关文件

需要检查和修改：
1. `src/main/resources/static/ai-portrait-generator/src/App.vue` - 外层样式（可能无需修改）
2. `src/main/resources/static/ai-portrait-generator/src/components/CoreParamsPanel.vue` - 可能需要移除 overflow
3. `src/main/resources/static/ai-portrait-generator/src/components/AdvancedParamsPanel.vue` - 可能需要移除 overflow
4. `src/main/resources/static/ai-portrait-generator/src/components/ModelSelectionPanel.vue` - 可能需要移除 overflow

