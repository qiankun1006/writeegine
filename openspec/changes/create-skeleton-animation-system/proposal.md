## Why

基于 DragonBones 开源项目的优秀架构设计，我们需要创建一个完整的、可独立运行的 2D 骨骼动画系统，专门用于替代现有系统 `http://localhost:8083/create-game/asset/character-frame-sequence` 中的老骨骼动画功能。

该系统将包含骨骼操作、动画控制、约束系统、网格变形等核心功能，为游戏角色动画制作提供更加强大、灵活和高效的工具支持。新系统将与现有功能完全隔离，确保不影响其他老功能模块的正常运行。

参考现有的 DragonBones 源码分析（openspec/loongbones）和源码实现（src/main/resources/templates/不是本项目功能，只是用来参考和学习的开源代码，不要改动），我们将构建一个功能完整、性能优秀、易于扩展的骨骼动画引擎。

## What Changes

### 核心功能模块
- **骨骼操作系统** - 骨骼层级管理、变换计算、动画插值
- **动画控制系统** - 时间轴、状态机、曲线编辑器
- **约束系统** - IK反向动力学、路径约束、变换约束
- **网格变形系统** - 顶点权重、蒙皮动画、网格编辑
- **遮罩与效果系统** - Alpha遮罩、Stencil遮罩、混合模式
- **数据导入导出系统** - 多格式支持、数据解析、版本兼容

### 工程架构
- **模块化设计** - 清晰的层次分离和职责划分
- **跨平台适配** - 支持多种渲染引擎和平台
- **性能优化** - 对象池、脏检查、缓存机制
- **扩展性设计** - 插件架构、面向接口编程

### 开发工具链
- **TypeScript 构建系统** - 现代化的类型检查和编译
- **测试框架** - 单元测试、集成测试、性能测试
- **文档生成** - API文档、使用指南、示例代码

## Impact

Affected specs: [2D骨骼动画系统、动画编辑器、数据导入导出、性能优化]
Affected code: [src/main/java/com/example/writemyself/skeleton/, src/main/resources/static/js/skeleton/, src/main/java/com/example/writemyself/controller/SkeletonController.java]

### 隔离性要求
**重要：新骨骼动画系统必须与现有功能完全隔离**
1. **独立代码目录** - 所有新代码必须放在独立的 skeleton/ 目录下
2. **独立URL路径** - 新功能使用独立的URL路径，不影响现有路由
3. **独立资源文件** - JavaScript、CSS、图片等资源文件独立存放
4. **向后兼容** - 现有 character-frame-sequence 功能保持不变
5. **渐进式替换** - 新功能开发完成后，通过配置切换启用

### 新增模块
1. **核心动画引擎** - skeleton-core 模块
2. **Web编辑器** - skeleton-editor 前端组件
3. **数据格式支持** - skeleton-formats 导入导出
4. **示例和文档** - skeleton-examples 使用示例

### 现有系统集成
1. **与现有编辑器集成** - 扩展现有的动画编辑器
2. **与AI功能集成** - 支持AI生成的动画数据
3. **与游戏资产系统集成** - 作为游戏资产创建工具

