# 变更：增强 AI 立绘生成器前端页面布局

## 为什么

当前 AI 立绘生成器前端页面 (`/create-game/asset/character-portrait`) 存在以下用户体验问题：

1. **布局未充分利用浏览器宽度**：页面内容过于靠左，右侧出现大量空白区域，未能充分利用宽屏显示器的可用空间
2. **滚动功能缺失**：页面无法通过鼠标滚轮或触摸滑动进行垂直滚动，用户必须手动拉伸浏览器窗口才能看到被遮挡的内容
3. **响应式布局不完善**：在宽屏（≥1440px）设备上，未按照规格要求实现三栏布局（核心参数、高级参数、结果展示），而是将高级参数折叠在核心参数面板内
4. **内容可视区域受限**：由于 `overflow: hidden` 的设置，当参数面板内容过多时，用户无法查看全部内容

这些问题影响了用户的工作效率和操作体验，需要进行布局优化和滚动修复。

## 改变什么

- **重构响应式布局**：在宽屏（≥1440px）上实现真正的三栏布局，将高级参数面板作为独立中间栏显示，充分利用右侧空白区域
- **修复滚动功能**：移除不当的 `overflow: hidden` 设置，确保页面和内容区域支持自然滚动
- **优化布局容器**：调整主容器宽度和间距，使内容居中并充分利用可用空间
- **增强平板和手机端适配**：确保在中小屏幕设备上保持良好的可用性
- **保持现有功能完整**：不改变现有参数控件和业务逻辑，仅优化布局和滚动体验

## 影响范围

- **受影响的功能**：`ai-portrait-generator` 前端页面布局和滚动行为
- **受影响的代码**：
  - `/src/main/resources/static/ai-portrait-generator/src/App.vue` - 布局结构调整
  - `/src/main/resources/static/ai-portrait-generator/src/components/CoreParamsPanel.vue` - 移除高级参数折叠面板
  - `/src/main/resources/static/ai-portrait-generator/src/components/AdvancedParamsPanel.vue` - 改为独立面板
  - `/src/main/resources/static/ai-portrait-generator/src/styles/theme.scss` - 新增宽屏断点样式
  - `/src/main/resources/templates/asset-editors/character-portrait.html` - 移除限制滚动的样式
  - `/src/main/resources/static/ai-portrait-generator/src/styles/global.scss` - 可能调整全局滚动设置

