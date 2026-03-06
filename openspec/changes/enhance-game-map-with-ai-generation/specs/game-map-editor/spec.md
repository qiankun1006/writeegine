## ADDED Requirements
### Requirement: AI游戏地图生成功能
系统SHALL提供AI驱动的游戏地图生成功能，允许用户在tilemap草图基础上，通过设置AI参数生成高质量的专业游戏地图。

#### Scenario: 访问增强的游戏地图页面
- **WHEN** 用户访问 "/create-game/asset/map-grid" 路径
- **THEN** 页面标题显示为"游戏地图"
- **AND** 页面包含左侧的tilemap编辑器和右侧的AI参数面板

#### Scenario: AI参数输入面板
- **WHEN** 页面加载完成
- **THEN** 右侧面板显示以下参数输入项：
  - 风格选择（如：奇幻、科幻、中世纪、现代等）
  - 尺寸选择（如：小、中、大、自定义）
  - 游戏类型（如：RPG、战棋、平台跳跃、沙盒等）
  - 微调模型选择（如：基础模型、专业模型、定制模型）
  - 参考图片上传区域
  - 生成按钮

#### Scenario: 地图生成流程
- **WHEN** 用户在tilemap编辑器中绘制草图
- **AND** 设置AI参数
- **AND** 点击"生成"按钮
- **THEN** 系统将tilemap草图转换为像素轮廓
- **AND** 结合AI参数生成高质量游戏地图
- **AND** 显示生成结果预览

#### Scenario: 生成结果处理
- **WHEN** AI地图生成完成
- **THEN** 显示生成的地图预览
- **AND** 提供下载选项（PNG格式）
- **AND** 提供重新生成选项

## MODIFIED Requirements
### Requirement: Tilemap编辑器页面
系统SHALL提供Tilemap编辑器Web页面，允许用户在网格画布上放置和编辑图块，支持图块选择、网格编辑和基本编辑操作，并集成AI地图生成功能。

#### Scenario: 访问编辑器页面
- **WHEN** 用户访问 "/create-game/asset/map-grid" 路径
- **THEN** 加载游戏地图编辑器页面，显示左侧的tilemap编辑器和右侧的AI参数面板

#### Scenario: 页面布局
- **WHEN** 编辑器页面加载完成
- **THEN** 页面采用左右分栏布局：
  - 左侧：图块选择面板、编辑画布区域、工具栏按钮、当前选择状态显示
  - 右侧：AI参数输入面板，包括风格、尺寸、游戏类型、微调模型、参考图片等参数

#### Scenario: 图块选择器
- **WHEN** 页面加载
- **THEN** 左侧面板显示所有可用的图块图片和名称，用户可以点击选择当前编辑图块

### Requirement: 编辑器用户体验
系统SHALL提供直观的用户界面和交互反馈，确保编辑体验流畅，并支持AI地图生成工作流。

#### Scenario: 集成工作流
- **WHEN** 用户完成tilemap草图绘制
- **THEN** 右侧AI参数面板提供"生成"按钮，点击后基于草图生成专业地图

#### Scenario: 状态信息显示
- **WHEN** 编辑过程中
- **THEN** 实时显示已放置图块数量和网格尺寸信息
- **AND** AI生成状态显示（如：生成中、生成完成）

