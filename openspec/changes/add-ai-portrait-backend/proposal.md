# 提案：AI 人物立绘生成器后端系统

## Why

前端已经完成了 Vue 3 应用的实现，提供了完整的 UI/UX 和参数输入能力。现在需要实现对应的后端功能，包括：

1. **AI 模型集成** - 通过 LangChain4J 接入 AI 图像生成模型（如 Stable Diffusion、DALL-E 等）
2. **异步处理机制** - 处理长时间运行的生成任务，支持进度实时反馈
3. **数据持久化** - 存储生成的图片、用户参数、生成历史等
4. **模型微调管理** - 支持微调模型的版本管理、参数保存
5. **用户资源库** - 管理用户的生成历史、收藏、分享

这些功能对于完整的 AI 立绘生成系统至关重要，直接影响用户体验和系统的可用性。

## What Changes

- 新增 AI 图像生成 API 端点（核心生成功能）
- 新增异步任务管理系统（进度查询、状态追踪）
- 新增数据库表结构（生成记录、模型配置、用户资源库）
- 新增 LangChain4J 集成模块（AI 模型调用）
- 新增 Spring Boot 后端工程结构（Service、Repository、Entity、DTO、Controller）
- 新增文件存储管理系统（生成图片存储、缓存策略）
- 新增 WebSocket 支持（实时进度推送）

## Impact

Affected specs:
- AI 图像生成核心功能 (ai-portrait-image-generation)
- 异步任务管理系统 (ai-portrait-async-task)
- 数据库设计 (ai-portrait-database)
- 文件存储管理 (ai-portrait-file-storage)
- 模型微调管理 (ai-portrait-model-tuning)
- WebSocket 实时通讯 (ai-portrait-realtime)

Affected code:
- `src/main/java/com/example/writemyself/controller/AIPortraitController.java` (新建)
- `src/main/java/com/example/writemyself/service/AIPortraitService.java` (新建)
- `src/main/java/com/example/writemyself/service/AsyncTaskService.java` (新建)
- `src/main/java/com/example/writemyself/model/` (新建 Entity 类)
- `src/main/java/com/example/writemyself/repository/` (新建 Repository 接口)
- `src/main/java/com/example/writemyself/dto/` (新建 DTO 类)
- `src/main/resources/db/` (新建数据库迁移文件)
- `pom.xml` (新增 LangChain4J 和相关依赖)
- `application.properties` (新增 AI 服务配置)

