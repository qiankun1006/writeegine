# game-management Specification

## Purpose
TBD - created by archiving change redesign-homepage-with-game-menu. Update Purpose after archive.
## Requirements
### Requirement: 我的游戏列表展示
系统SHALL允许用户查看自己创建的所有游戏，包括游戏的基本信息和操作选项。

#### Scenario: 用户访问"我的游戏"页面
- **WHEN** 已登录用户访问 `/my-games`
- **THEN** 页面标题为"我的游戏"
- **AND** 显示用户的游戏项，每个包含：游戏名称、描述、创建日期、状态、操作按钮
- **AND** 游戏项按创建时间倒序排列

#### Scenario: 用户没有创建游戏
- **WHEN** 用户还没有创建任何游戏并访问 `/my-games`
- **THEN** 显示空状态提示和"现在就开始"链接
- **AND** 链接指向 `/create-game`

### Requirement: 创作游戏流程
系统SHALL允许用户通过创作页面创建新游戏，包括输入基本信息和使用编辑器编辑地图。

#### Scenario: 用户创建新游戏
- **WHEN** 用户访问 `/create-game`
- **THEN** 显示游戏信息表单（名称、描述等）
- **AND** 显示Tilemap编辑器用于编辑游戏地图
- **AND** 提供保存和发布按钮

### Requirement: 游戏广场浏览
系统SHALL允许用户浏览社区分享的游戏。

#### Scenario: 用户浏览游戏广场
- **WHEN** 用户访问 `/game-plaza`
- **THEN** 显示已发布的游戏网格
- **AND** 每个游戏卡片包含：缩略图、标题、作者、点赞数
- **AND** 提供搜索和筛选功能

