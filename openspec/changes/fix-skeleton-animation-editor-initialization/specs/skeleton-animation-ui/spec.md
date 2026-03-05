# Skeleton Animation UI - 修复初始化问题

## MODIFIED Requirements

### Requirement: 动画帧序列编辑器页面初始化
编辑器页面 SHALL 通过标准的脚本加载和初始化流程来启动骨骼动画编辑器，而不是在 Thymeleaf Fragment 内部加载脚本。

#### Scenario: 正确的页面加载流程
- **WHEN** 用户访问 `/create-game/asset/character-frame-sequence` 页面
- **THEN** layout.html 中已加载的所有骨骼动画脚本被正确执行
- **THEN** DOM 构建完成后，initFrameSequenceEditor() 函数被调用
- **THEN** SkeletonAnimationEditor 被正确实例化，并初始化所有 UI 面板
- **THEN** 编辑器显示在页面中，包含骨骼层级面板、时间轴、属性面板等

#### Scenario: 错误处理和诊断
- **WHEN** 脚本加载失败或初始化过程中出现错误
- **THEN** 浏览器控制台应显示清晰的错误日志
- **THEN** 页面优雅地显示错误信息（如果提供了 UI 元素）

## ADDED Requirements

### Requirement: 骨骼动画编辑器页面脚本管理
系统 SHALL 提供清晰的脚本加载和初始化机制，确保所有必要的骨骼动画系统脚本都被正确加载和执行。

#### Scenario: 脚本加载完整性
- **WHEN** 访问骨骼动画编辑器页面
- **THEN** 所有必要的脚本按正确顺序加载（核心 → UI → 工具 → 初始化）
- **THEN** 没有脚本因为 Thymeleaf Fragment 过滤而被丢弃

#### Scenario: 初始化失败提示
- **WHEN** SkeletonAnimationEditor 类未找到或容器不存在
- **THEN** 浏览器控制台应显示具体的错误信息
- **THEN** 便于开发者快速诊断问题

## REMOVED Requirements

### Requirement: Fragment 内部脚本加载
在 `layout:fragment="content"` 内部加载 `<script>` 标签是不可靠的做法，会被 Thymeleaf 过滤掉。

**Reason**: Thymeleaf Layout Dialect 的设计决策是过滤 Fragment 内的脚本标签，以防止脚本重复加载。这导致页面脚本无法执行。

**Migration**: 所有脚本应该在主 Layout（`layout.html`）的 `<body>` 末尾加载，这样所有子页面都会自动加载这些脚本。

