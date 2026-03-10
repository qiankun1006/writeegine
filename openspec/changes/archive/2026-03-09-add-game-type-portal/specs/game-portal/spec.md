## ADDED Requirements

### Requirement: 游戏类型选择门户
系统 SHALL 在 `/create-game/unity` 显示一个游戏类型选择界面，允许用户选择要开发的游戏类型，而不是直接进入 3D 编辑器。

#### Scenario: 访问游戏创建入口
- **WHEN** 用户访问 `/create-game/unity`
- **THEN** 页面显示游戏类型选择门户，包含 4 个卡片选项

#### Scenario: 卡片信息完整
- **WHEN** 门户页面加载完成
- **THEN** 显示以下卡片：
  - "2D 策略战棋" - 描述: 网格制游戏，支持寻路和战斗预览
  - "2D 恶魔城" - 描述: 横版冒险游戏，支持碰撞体和平台跳跃
  - "2D 角色扮演" - 描述: RPG 游戏，支持 NPC 和对话系统
  - "3D 射击" - 描述: 第一/第三人称射击，支持光照和网络同步

#### Scenario: 选择游戏类型
- **WHEN** 用户点击一个游戏类型卡片
- **THEN** 系统导航到对应的编辑器页面：
  - 2D 策略战棋 → `/create-game/unity/2d-strategy`
  - 2D 恶魔城 → `/create-game/unity/2d-metroidvania`
  - 2D 角色扮演 → `/create-game/unity/2d-rpg`
  - 3D 射击 → `/create-game/unity/3d-shooter`

### Requirement: 游戏新建流程
系统 SHALL 支持从门户创建新游戏，并自动初始化对应类型的编辑器。

#### Scenario: 创建新游戏
- **WHEN** 用户在门户选择游戏类型并点击 "新建游戏"
- **THEN** 系统：
  - 调用 `/api/game/create?type={gameType}` 创建游戏
  - 生成唯一的 gameId
  - 重定向到编辑器页面并传递 gameId
  - 编辑器自动加载该游戏数据

#### Scenario: 加载已存在的游戏
- **WHEN** 用户在门户选择游戏类型并点击已存在的游戏
- **THEN** 系统跳转到对应类型的编辑器，加载该游戏数据

### Requirement: 门户 UI/UX 设计
系统 SHALL 提供现代化的游戏类型选择界面，具有清晰的视觉分层和交互反馈。

#### Scenario: 响应式设计
- **WHEN** 在不同屏幕尺寸（手机、平板、桌面）访问门户
- **THEN** 卡片布局自适应调整，保持可用性

#### Scenario: 卡片悬停效果
- **WHEN** 用户鼠标悬停在卡片上
- **THEN** 卡片显示视觉反馈（阴影、缩放或颜色变化）并显示 "选择" 按钮

#### Scenario: 加载进度反馈
- **WHEN** 用户选择卡片后，页面正在加载编辑器
- **THEN** 显示加载进度条或转圈动画，并提示 "正在加载编辑器..."

