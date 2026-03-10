## ADDED Requirements

### Requirement: Unity编辑器集成

系统SHALL集成Unity编辑器作为第三个创作工具，与图片编辑器和地图编辑器并列。

#### Scenario: Unity编辑器入口显示
- **WHEN** 用户访问游戏创建页面
- **THEN** 显示"Unity编辑"选项卡片，包含图标、标题和描述，与图片编辑、地图编辑卡片并列

#### Scenario: 进入Unity编辑器
- **WHEN** 用户点击"Unity编辑"卡片
- **THEN** 跳转到 `/create-game/unity` 页面，加载Unity编辑器界面

#### Scenario: 编辑器间导航
- **WHEN** 用户在Unity编辑器中
- **THEN** 导航栏显示"切换到图片编辑"和"切换到地图编辑"链接，点击可跳转到对应编辑器

#### Scenario: 项目数据统一管理
- **WHEN** 用户在多个编辑器间切换
- **THEN** 游戏项目信息（名称、描述、缩略图）在不同编辑器间同步

#### Scenario: 统一导出流程
- **WHEN** 用户导出包含Unity内容的游戏项目
- **THEN** 打包所有编辑器生成的内容（图片、地图、3D场景），生成完整游戏包

#### Scenario: 界面风格一致性
- **WHEN** 用户在不同编辑器间切换
- **THEN** Unity编辑器采用与其他编辑器相同的配色方案、字体、图标风格和布局模式

#### Scenario: 统一快捷键
- **WHEN** 用户在Unity编辑器中
- **THEN** 通用快捷键保持一致（Ctrl+S保存、Ctrl+Z撤销、Ctrl+Shift+Z重做）

#### Scenario: 用户账户集成
- **WHEN** 用户在Unity编辑器中创建或编辑项目
- **THEN** 项目保存到用户账户，支持权限管理和协作功能

#### Scenario: 性能监控集成
- **WHEN** Unity编辑器运行中
- **THEN** 监控内存使用、CPU占用、渲染性能等指标，与其他编辑器使用相同的监控系统

