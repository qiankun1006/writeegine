# Spec: Game Engine Theme and Visual Design

## ADDED Requirements

### Requirement: 游戏引擎风格的深色科技感主题
系统SHALL采用专业的游戏引擎风格视觉设计，具有深色科技感，以提升产品的专业感和高端感。

#### Scenario: 页面背景和全局样式
- **WHEN** 用户访问 Tilemap 编辑器页面
- **THEN** 背景显示深色渐变（深灰蓝色）
- **AND** 背景固定，不随滚动而移动
- **AND** 整个页面具有游戏引擎编辑器的专业感

#### Scenario: 面板卡片的玻璃态效果
- **WHEN** 编辑页面显示
- **THEN** 图块选择面板和编辑区域面板具有半透明背景（玻璃态）
- **AND** 使用 `backdrop-filter: blur()` 创建高斯模糊效果
- **AND** 面板边框为青蓝色的细线条
- **AND** 面板有适当的阴影增强立体感

#### Scenario: 按钮的现代风格
- **WHEN** 用户查看工具栏按钮
- **THEN** 主按钮（导出）使用青蓝色渐变
- **AND** 危险按钮（清空）使用红色渐变
- **AND** 次要按钮（撤销、重做）使用浅色透明风格
- **AND** 所有按钮在悬停时有发光效果和上升动画

