# editor-integration Specification

## Purpose
TBD - created by archiving change redesign-homepage-with-game-menu. Update Purpose after archive.
## Requirements
### Requirement: 编辑器组件化
系统SHALL将Tilemap编辑器改造为可复用的组件，支持在创作页面中嵌入。

#### Scenario: 编辑器在创作页面中加载
- **WHEN** 用户访问 `/create-game`（新建游戏）
- **THEN** Tilemap编辑器正常显示在编辑区域
- **AND** 编辑器功能完整（图块选择、画布编辑、导出等）
- **AND** 编辑器与上方的游戏信息表单并列显示
- **AND** 两个模块之间有明确的视觉分隔

#### Scenario: 编辑器在编辑页面中加载
- **WHEN** 用户访问 `/create-game/{gameId}`（编辑现有游戏）
- **THEN** 编辑器加载已保存的地图数据
- **AND** 编辑器功能完整且可用
- **AND** 用户可以继续编辑地图

### Requirement: 编辑器数据绑定
系统SHALL使编辑器与游戏表单协同工作，将编辑的地图数据与游戏信息一起保存。

#### Scenario: 编辑器数据捕获
- **WHEN** 用户在编辑器中编辑了地图并点击"保存游戏"或"发布到广场"
- **THEN** JavaScript从编辑器中捕获当前地图数据
- **AND** 地图数据与表单数据（名称、描述）一起被收集
- **AND** 数据被发送到后端保存

### Requirement: 编辑器状态管理
系统SHALL管理编辑器的状态，确保在页面切换或刷新时能恢复编辑进度。

#### Scenario: 编辑器状态恢复
- **WHEN** 用户编辑到一半，不小心刷新页面
- **THEN** 页面重新加载后，编辑器恢复之前的编辑状态
- **AND** 用户可以选择继续编辑或放弃更改

