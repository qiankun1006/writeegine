# 变更：AI 人物立绘生成工具前端页面开发

## 为什么

当前的角色立绘编辑页面 (`/create-game/asset/character-portrait`) 是一个基础的手绘编辑工具，满足用户手动绘制需求。但游戏创作者需要一个更强大的 AI 驱动的人物立绘生成工具，可以通过文本提示和高级参数快速生成高质量的二次元人物角色，大大加快游戏素材创作效率。

## 改变什么

- 使用现代前端技术栈（Vue 3 + Vite + TypeScript）重构角色立绘编辑页面
- 集成 Element Plus UI 组件库，实现高级定制主题和专业界面
- 实现完整的 AI 立绘生成工具，包括核心参数区和可折叠的高级参数区
- 提供丰富的交互体验：拖拽上传、实时预览、加载动画、进度反馈
- 支持多种生成参数：提示词、负面提示词、参考图、模型权重、尺寸、采样器、风格预设等
- 优化页面响应式设计，支持 PC、平板、手机等多设备
- 实现科技感 + 极简美学的设计风格，主色调为深紫 (#6C5CE7) + 浅蓝 (#00C4FF)

## 影响范围

- **受影响的功能**：`ai-portrait-generator` 新增功能
- **受影响的代码**：
  - `/src/main/resources/templates/asset-editors/character-portrait.html` - 完全重构
  - `/src/main/java/com/example/writemyself/controller/HomeController.java` - 确保路由正确（可能不需改动）
  - `/src/main/resources/static/js/` - 可能需要添加新的 Vue 3 组件和工具函数
  - `/src/main/resources/static/css/` - 新增 SCSS 样式文件，支持主题定制

## 关键决策

1. **使用 Vue 3 而非原生 JavaScript**：提供更好的组件化、状态管理和代码可维护性
2. **集成 Element Plus**：统一 UI 风格，加快开发速度
3. **参数区分化**：核心参数居中显示，高级参数折叠，降低认知负载
4. **渐进式增强**：从基础参数开始，高级参数可选，满足不同用户需求

