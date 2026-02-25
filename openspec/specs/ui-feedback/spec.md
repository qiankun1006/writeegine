# ui-feedback Specification

## Purpose
TBD - created by archiving change optimize-editor-ux-design. Update Purpose after archive.
## Requirements
### Requirement: 友好的对话框交互反馈
系统SHALL为所有重要操作（如清空画布、切换网格大小）提供美观、友好的自定义对话框，而不是简单的 `confirm()` 对话框。

#### Scenario: 切换网格大小对话框
- **WHEN** 用户点击网格大小下拉菜单并选择与当前不同的网格大小
- **THEN** 系统显示自定义对话框，而不是 `confirm()`
- **AND** 对话框显示当前网格大小和要改变到的新大小
- **AND** 对话框提示"改变后当前画布将被清空"
- **AND** 对话框提供"取消"和"确认更改"两个按钮
- **AND** 对话框具有游戏引擎风格的外观

#### Scenario: 清空画布对话框
- **WHEN** 用户点击"清空画布"按钮
- **THEN** 系统显示自定义对话框，而不是 `confirm()`
- **AND** 对话框显示警告图标
- **AND** 对话框标题为"清空画布"
- **AND** 对话框提示操作无法撤销，但可以使用"撤销"功能恢复
- **AND** 对话框提供"取消"和"清空画布"两个按钮
- **AND** "清空画布"按钮使用红色（危险）风格

#### Scenario: 对话框样式和行为
- **WHEN** 自定义对话框显示
- **THEN** 对话框具有半透明黑色背景
- **AND** 对话框使用深色游戏引擎风格卡片设计
- **AND** 对话框包含标题、消息和详细描述
- **AND** 对话框支持按 Esc 键关闭
- **AND** 对话框支持 Tab 键在按钮间导航

