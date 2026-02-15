# 当前选中模块移至画布右上角

## Why

当前"当前选中"模块作为编辑器左右之间的一列显示，占用了宝贵的水平空间。将其移至画布的右上角可以：
- 充分利用画布边界空间
- 提升 UI 布局紧凑度
- 保留当前图块预览的重要信息，但不浪费额外的列空间
- 改善用户体验，让主编辑区域更加宽敞

## What Changes

- 将 `current-tile-display` 组件从主容器的三列布局中移除
- 使用绝对定位将其放在画布容器的右上角
- 调整样式使其作为浮动面板显示，具有良好的视觉层级
- 保持其原有的选中图块预览和名称显示功能不变

## Impact

**Affected specs:** `current-selection-display`

**Affected code:**
- `src/main/resources/templates/tilemap-editor.html` - HTML 结构调整
- `src/main/resources/static/css/tilemap-editor.css` - 样式重新设计
- `src/main/resources/static/js/tilemap-editor.js` - 无需改动（功能逻辑不变）

