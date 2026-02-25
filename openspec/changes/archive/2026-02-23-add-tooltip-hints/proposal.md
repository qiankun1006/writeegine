# 提案：为图片编辑器添加工具提示功能

## Why

当前图片编辑器已经实现了丰富的Photoshop功能，包括多种选择工具、绘制工具、变换工具和滤镜系统。然而，用户在使用这些功能时，仅能看到图标的简单表示（如emoji或简单图标），缺乏对每个工具功能的详细说明。

添加工具提示功能将：
- 帮助新用户快速了解每个工具的作用
- 提高用户体验，减少学习成本
- 显示工具的快捷键信息，提高专业用户效率
- 提供一致的用户界面反馈机制

## What Changes

### 1. 工具提示系统
- 为所有工具栏按钮添加悬停提示
- 显示工具名称、功能描述和快捷键信息
- 支持延迟显示和淡入淡出动画效果
- 确保提示信息不会遮挡重要界面元素

### 2. 菜单项提示
- 为菜单栏按钮添加下拉菜单提示
- 为菜单项添加功能描述
- 显示菜单项的快捷键组合

### 3. 面板控件提示
- 为图层面板按钮添加提示
- 为历史记录面板按钮添加提示
- 为状态栏控件添加提示

### 4. 响应式设计
- 确保工具提示在不同屏幕尺寸下正常显示
- 在移动设备上提供触摸友好的提示方式
- 支持无障碍访问（ARIA标签）

## Impact

**Affected specs:**
- [Image Editor UI] - 图片编辑器用户界面规范
- [User Experience] - 用户体验规范

**Affected code:**
- `src/main/resources/templates/create-game-image.html` - 图片编辑页面模板
- `src/main/resources/static/js/image-editor/ImageEditor.js` - 编辑器主逻辑
- `src/main/resources/static/css/image-editor.css` - 编辑器样式
- `src/main/resources/static/js/image-editor/tools/` - 工具实现目录
- `src/main/resources/static/js/image-editor/filters/` - 滤镜实现目录

**预期时间：**
- 设计阶段：1-2天
- 实现阶段：2-3天
- 测试阶段：1-2天
- **总计**：约1周

**用户体验提升：**
- 降低新用户学习曲线
- 提高工具使用效率
- 提供一致的用户界面反馈
- 增强专业用户的生产力

