# 添加可拖动的布局分隔符

## Why

用户在使用 Tilemap 编辑器时，可能需要根据不同的工作流调整左侧图块选择面板和右侧编辑区域的宽度：
- 有时需要更多空间查看和选择图块
- 有时需要更大的画布区域进行编辑
- 提升用户界面的灵活性和可用性
- 提供更好的个性化体验

## What Changes

- 在图块选择面板和编辑区域之间添加一个可拖动的分隔符
- 用户可以通过拖动分隔符来调整两个面板的宽度
- 分隔符应该具有清晰的视觉指示（如悬停时高亮）
- 实现流畅的拖动交互，无抖动或卡顿
- 防止面板缩小到不可用的尺寸（设置最小宽度限制）

## Impact

**Affected specs:** `resizable-divider`

**Affected code:**
- `src/main/resources/templates/tilemap-editor.html` - 添加分隔符 DOM 元素
- `src/main/resources/static/css/tilemap-editor.css` - 分隔符样式设计
- `src/main/resources/static/js/tilemap-editor.js` - 添加拖动交互逻辑

