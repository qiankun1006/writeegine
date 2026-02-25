# canvas-optimization Specification

## Purpose
TBD - created by archiving change optimize-editor-ux-design. Update Purpose after archive.
## Requirements
### Requirement: 当前选中模块不遮挡画布
系统SHALL重新定位当前选中（预览）模块，确保不会遮挡 Canvas 的任何部分，为用户提供更大的编辑空间。

#### Scenario: 模块重定位到编辑面板顶部
- **WHEN** 用户打开 Tilemap 编辑器
- **THEN** 当前选中模块显示在编辑面板的顶部（在工具栏之前或之后）
- **AND** 模块宽度为 100%，填充整个编辑面板宽度
- **AND** 模块不再使用绝对定位
- **AND** Canvas 区域有更多空间用于绘制

#### Scenario: 当前选中模块与工具栏关系
- **WHEN** 编辑面板加载完成
- **THEN** 当前选中模块在编辑面板的顶部区域
- **AND** 工具栏在当前选中模块下方
- **AND** Canvas 容器占据最大的可用空间

### Requirement: 画布区域扩展
系统SHALL扩展 Canvas 容器的垂直和水平空间，以提供更好的编辑体验。

#### Scenario: Canvas 容器高度扩展
- **WHEN** 编辑面板显示
- **THEN** Canvas 容器使用 `flex: 1` 扩展，填充所有可用空间
- **AND** Canvas 尺寸根据内容自适应

