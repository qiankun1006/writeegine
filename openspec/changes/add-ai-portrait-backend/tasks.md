# AI 人物立绘生成器后端开发任务清单

## 第一阶段：基础设施和数据库

- [ ] 1.1 创建数据库迁移脚本 (Flyway/Liquibase)
  - [ ] 1.1.1 创建 ai_portrait_generation 表
  - [ ] 1.1.2 创建 ai_portrait_model_config 表
  - [ ] 1.1.3 创建 ai_portrait_task 表
  - [ ] 1.1.4 创建 ai_portrait_resource_library 表
  - [ ] 1.1.5 创建 ai_portrait_user_preset 表
  - [ ] 1.1.6 创建 ai_portrait_generation_queue 表
  - [ ] 1.1.7 为所有表添加必要的索引

- [ ] 1.2 更新 pom.xml 添加依赖
  - [ ] 1.2.1 添加 LangChain4J 核心依赖
  - [ ] 1.2.2 添加 OpenAI 模型支持
  - [ ] 1.2.3 添加 Stable Diffusion 支持 (Ollama)
  - [ ] 1.2.4 添加异步处理依赖 (webflux)
  - [ ] 1.2.5 添加文件处理依赖 (commons-io)

- [ ] 1.3 配置 application.properties
  - [ ] 1.3.1 添加 AI Portrait 服务配置
  - [ ] 1.3.2 添加 OpenAI API 配置
  - [ ] 1.3.3 添加 Stable Diffusion 配置
  - [ ] 1.3.4 添加线程池和异步配置
  - [ ] 1.3.5 添加文件存储配置

## 第二阶段：数据模型层

- [ ] 2.1 创建 Entity 类
  - [ ] 2.1.1 创建 AIPortraitGeneration 实体
  - [ ] 2.1.2 创建 AIPortraitTask 实体
  - [ ] 2.1.3 创建 AIPortraitModelConfig 实体
  - [ ] 2.1.4 创建 AIPortraitResourceLibrary 实体
  - [ ] 2.1.5 创建 AIPortraitUserPreset 实体
  - [ ] 2.1.6 为所有实体添加 JPA 注解和关系

- [ ] 2.2 创建 Repository 接口
  - [ ] 2.2.1 创建 AIPortraitGenerationRepository
  - [ ] 2.2.2 创建 AIPortraitTaskRepository
  - [ ] 2.2.3 创建 AIPortraitModelConfigRepository
  - [ ] 2.2.4 创建 AIPortraitResourceLibraryRepository
  - [ ] 2.2.5 为每个 Repository 添加查询方法

- [ ] 2.3 创建 DTO 类
  - [ ] 2.3.1 创建 GeneratePortraitRequest
  - [ ] 2.3.2 创建 GeneratePortraitResponse
  - [ ] 2.3.3 创建 GenerateProgressResponse
  - [ ] 2.3.4 创建 GenerationHistoryResponse
  - [ ] 2.3.5 创建 GenerationSaveRequest
  - [ ] 2.3.6 为所有 DTO 添加验证注解

## 第三阶段：业务逻辑层

- [ ] 3.1 实现核心服务类
  - [ ] 3.1.1 实现 AIPortraitService 类
  - [ ] 3.1.2 实现 createGenerationTask() 方法
  - [ ] 3.1.3 实现 getGenerationProgress() 方法
  - [ ] 3.1.4 实现 saveGenerationResult() 方法
  - [ ] 3.1.5 实现 getGenerationHistory() 方法
  - [ ] 3.1.6 实现 getAvailableModels() 方法
  - [ ] 3.1.7 添加参数验证逻辑

- [ ] 3.2 实现异步任务服务
  - [ ] 3.2.1 实现 AsyncTaskService 类
  - [ ] 3.2.2 实现 submitGenerationTask() 方法
  - [ ] 3.2.3 实现 processQueuedTasks() 方法
  - [ ] 3.2.4 实现 processTask() 方法
  - [ ] 3.2.5 实现 handleTaskFailure() 方法
  - [ ] 3.2.6 添加重试机制和错误处理

- [ ] 3.3 实现 LangChain4J 集成
  - [ ] 3.3.1 实现 LangChainService 类
  - [ ] 3.3.2 实现 generatePortrait() 方法
  - [ ] 3.3.3 实现 DALL-E 生成方法
  - [ ] 3.3.4 实现 Stable Diffusion 生成方法
  - [ ] 3.3.5 实现提示词构建和优化
  - [ ] 3.3.6 处理生成结果和图片下载

- [ ] 3.4 实现文件存储服务
  - [ ] 3.4.1 实现 FileStorageService 类
  - [ ] 3.4.2 实现 uploadImageFromBase64() 方法
  - [ ] 3.4.3 实现 saveGeneratedImage() 方法
  - [ ] 3.4.4 实现本地存储逻辑
  - [ ] 3.4.5 实现 OSS 存储逻辑 (可选)
  - [ ] 3.4.6 添加文件清理和过期处理

## 第四阶段：API 层

- [ ] 4.1 实现 Controller
  - [ ] 4.1.1 创建 AIPortraitController 类
  - [ ] 4.1.2 实现 POST /api/ai/portrait/generate 端点
  - [ ] 4.1.3 实现 GET /api/ai/portrait/progress/{taskId} 端点
  - [ ] 4.1.4 实现 GET /api/ai/portrait/result/{taskId} 端点
  - [ ] 4.1.5 实现 POST /api/ai/portrait/save 端点
  - [ ] 4.1.6 实现 GET /api/ai/portrait/history 端点
  - [ ] 4.1.7 实现 GET /api/ai/portrait/models 端点
  - [ ] 4.1.8 添加请求验证和错误处理

- [ ] 4.2 实现全局异常处理
  - [ ] 4.2.1 扩展 GlobalExceptionHandler
  - [ ] 4.2.2 添加参数验证异常处理
  - [ ] 4.2.3 添加业务异常处理
  - [ ] 4.2.4 添加 API 异常处理
  - [ ] 4.2.5 返回统一的错误响应格式

## 第五阶段：集成和配置

- [ ] 5.1 配置异步处理
  - [ ] 5.1.1 创建 AsyncConfig 类
  - [ ] 5.1.2 配置线程池 (ThreadPoolExecutor)
  - [ ] 5.1.3 配置 @Async 注解支持
  - [ ] 5.1.4 启动任务队列处理

- [ ] 5.2 配置 WebSocket (可选)
  - [ ] 5.2.1 创建 WebSocketConfig 类
  - [ ] 5.2.2 实现 AIPortraitWebSocketHandler
  - [ ] 5.2.3 配置 /ws/ai/portrait/progress 端点
  - [ ] 5.2.4 实现实时进度推送

- [ ] 5.3 配置安全和认证
  - [ ] 5.3.1 为 API 添加用户认证检查
  - [ ] 5.3.2 验证用户权限 (用户只能访问自己的数据)
  - [ ] 5.3.3 配置 CORS 规则
  - [ ] 5.3.4 添加 API 速率限制 (防止滥用)

## 第六阶段：测试

- [ ] 6.1 单元测试
  - [ ] 6.1.1 为 AIPortraitService 编写单元测试
  - [ ] 6.1.2 为 AsyncTaskService 编写单元测试
  - [ ] 6.1.3 为 FileStorageService 编写单元测试
  - [ ] 6.1.4 测试参数验证逻辑
  - [ ] 6.1.5 测试错误处理和重试

- [ ] 6.2 集成测试
  - [ ] 6.2.1 测试端到端的生成流程
  - [ ] 6.2.2 测试数据库操作
  - [ ] 6.2.3 测试 API 端点
  - [ ] 6.2.4 测试异步任务处理
  - [ ] 6.2.5 测试 LangChain4J 集成

- [ ] 6.3 性能测试
  - [ ] 6.3.1 测试单个任务的处理时间
  - [ ] 6.3.2 测试并发任务处理
  - [ ] 6.3.3 测试队列性能
  - [ ] 6.3.4 进行压力测试

- [ ] 6.4 生成 API 文档
  - [ ] 6.4.1 为所有端点添加 Swagger/SpringFox 注解
  - [ ] 6.4.2 生成 API 文档 HTML
  - [ ] 6.4.3 编写使用示例和常见问题

## 第七阶段：部署和监控

- [ ] 7.1 生产环境准备
  - [ ] 7.1.1 创建生产环境配置 (application-prod.properties)
  - [ ] 7.1.2 配置日志 (ELK 或其他)
  - [ ] 7.1.3 配置监控 (Prometheus/Grafana)
  - [ ] 7.1.4 配置告警规则

- [ ] 7.2 部署
  - [ ] 7.2.1 创建 Docker 镜像
  - [ ] 7.2.2 配置 Kubernetes (如使用)
  - [ ] 7.2.3 执行数据库迁移
  - [ ] 7.2.4 进行健康检查

- [ ] 7.3 文档
  - [ ] 7.3.1 编写 API 文档
  - [ ] 7.3.2 编写部署说明
  - [ ] 7.3.3 编写故障排查指南
  - [ ] 7.3.4 编写性能优化建议

## 第八阶段：后续功能

- [ ] 8.1 高级功能
  - [ ] 8.1.1 实现用户预设管理
  - [ ] 8.1.2 实现资源库分类和标签
  - [ ] 8.1.3 实现分享功能 (share_token)
  - [ ] 8.1.4 实现收藏和最喜欢功能

- [ ] 8.2 模型微调
  - [ ] 8.2.1 实现模型版本管理
  - [ ] 8.2.2 实现微调参数保存
  - [ ] 8.2.3 实现模型切换功能
  - [ ] 8.2.4 实现微调效果评估

- [ ] 8.3 优化和扩展
  - [ ] 8.3.1 实现图片缓存策略
  - [ ] 8.3.2 实现 CDN 集成
  - [ ] 8.3.3 实现批量处理 API
  - [ ] 8.3.4 实现 WebSocket 实时推送

---

## 开发提示

### 优先级
1. **第一阶段**: 基础设施必须优先完成，为后续开发奠定基础
2. **第二阶段**: 数据模型完成后，业务逻辑才能实现
3. **第三阶段**: 最核心的部分，决定系统功能
4. **第四阶段**: API 层提供用户界面

### 推荐开发顺序
1. 数据库设计和迁移脚本
2. Entity 和 Repository
3. DTO 和参数验证
4. 核心业务逻辑 (不涉及 AI 调用)
5. LangChain4J 集成 (单独测试)
6. Controller 和 API 端点
7. 测试和文档
8. 部署

### 测试策略
- 每完成一个模块就进行单元测试
- 在集成前确保各个组件独立工作
- 使用 Mock 对象测试 AI 模型调用
- 进行端到端集成测试

### 本地开发建议
```bash
# 1. 启动本地数据库
docker run -d -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=writeengine \
  mysql:8

# 2. (可选) 启动本地 Stable Diffusion
docker run -d -p 7860:7860 \
  --gpus all \
  ghcr.io/d3fuse/ollama-docker:latest

# 3. 运行 Spring Boot 应用
mvn spring-boot:run
```

### 调试技巧
- 使用 `@Transactional(readOnly=true)` 进行只读查询
- 为异步任务添加详细的日志记录
- 使用 Spring Data JPA 的 `findAll()` 进行分页查询以避免 OOM
- 定期清理 ai_portrait_generation 表的过期数据

