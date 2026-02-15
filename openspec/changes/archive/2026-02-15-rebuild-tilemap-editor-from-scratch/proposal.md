# Change: 从头重建Tilemap编辑器功能

## Why
现有的Tilemap编辑器实现存在问题，当前图块预览等功能无法正常工作。需要从头重新设计和实现，确保核心功能完全可用。

## What Changes
- 删除现有的有问题的Tilemap实现
- 重新设计编辑器架构和交互流程
- 完全重写HTML模板、CSS样式和JavaScript逻辑
- 实现完整的图块选择、放置、编辑功能
- 支持鼠标滑行放置多个图块
- 支持自定义画布大小
- 确保所有功能可靠稳定

## Impact
- Affected specs: tilemap-editor
- Affected code: src/main/resources/templates/tilemap-editor.html, src/main/resources/static/css/tilemap-editor.css, src/main/resources/static/js/tilemap-editor.js, src/main/java/com/example/writemyself/controller/TilemapEditorController.java

