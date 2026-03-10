# AI 人物立绘生成器后端系统 - 完整设计方案

## 文档概览

本目录包含 AI 人物立绘生成器后端系统的完整设计方案，包括：

- **proposal.md** - 提案文档，概述为什么和改变什么
- **design.md** - 详细的系统架构和代码实现设计
- **tasks.md** - 按阶段划分的具体开发任务清单
- **specs/** - 功能规格定义
  - **ai-portrait-image-generation/spec.md** - 核心图像生成功能规格

---

## 快速了解

### 系统架构

```
前端 (Vue 3)
    ↓
REST API 层 (Spring Boot Controller)
    ↓
业务逻辑层 (Service)
    ↓
LangChain4J 层 (模型集成)
    ↓
AI 模型 (OpenAI/Stable Diffusion)
    ↓
数据库 & 文件存储
```

### 核心能力

1. **AI 图像生成** - 接入 LangChain4J，支持多种 AI 模型
2. **异步任务处理** - 长时间运行任务队列，支持进度实时查询
3. **数据管理** - 6 个核心数据库表
4. **文件存储** - 支持本地和 OSS 存储
5. **用户资源库** - 管理生成历史、预设、分享

---

## 关键设计决策

### 1. 为什么异步处理？
- AI 生成耗时 30-120 秒
- HTTP 默认超时 60 秒，需要异步避免超时
- 支持多用户并发请求
- 前端可实时查询进度

### 2. 数据库表设计

| 表名 | 职责 |
|------|------|
| ai_portrait_generation | 存储生成参数和最终结果 |
| ai_portrait_task | 存储任务执行状态和重试信息 |
| ai_portrait_model_config | 模型配置和 API 密钥 |
| ai_portrait_resource_library | 用户的资源库 (收藏、分享) |
| ai_portrait_user_preset | 用户保存的参数预设 |
| ai_portrait_generation_queue | 任务队列管理 |

### 3. LangChain4J 集成策略

支持多种 AI 模型：
- **OpenAI** - DALL-E 3，高质量但调用成本高
- **Stable Diffusion** - 本地或云部署，可微调
- **其他模型** - 通过 Ollama 支持

### 4. 错误处理和重试

- 自动重试 3 次
- 网络错误和超时自动重试
- 业务错误 (如内容不当提示词) 不重试
- 详细的错误日志和追踪

---

## 实现路线图

### 第一步 (1-2 周): 基础设施
- [ ] 创建数据库和表
- [ ] 配置 Spring Boot 项目
- [ ] 创建 Entity、Repository、DTO

### 第二步 (1-2 周): 核心业务逻辑
- [ ] 实现 AIPortraitService
- [ ] 实现异步任务处理
- [ ] 集成 LangChain4J

### 第三步 (1 周): API 端点
- [ ] 实现 Controller
- [ ] 添加参数验证
- [ ] 生成 API 文档

### 第四步 (1 周): 测试和部署
- [ ] 编写单元和集成测试
- [ ] 性能测试
- [ ] Docker 打包和部署

---

## API 端点一览

### 生成请求
```
POST /api/ai/portrait/generate
Content-Type: application/json

{
  "prompt": "日系二次元少女，长发粉发，猫耳",
  "negativePrompt": "低质量，模糊，水印",
  "width": 1024,
  "height": 1024,
  "samplerName": "Euler",
  "inferenceSteps": 30,
  "seed": -1,
  ...
}

Response (200):
{
  "taskId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "QUEUED",
  "estimatedWaitTime": 120,
  "queuePosition": 5,
  "progressUrl": "/api/ai/portrait/progress/550e8400-...",
  "resultUrl": "/api/ai/portrait/result/550e8400-..."
}
```

### 查询进度
```
GET /api/ai/portrait/progress/550e8400-e29b-41d4-a716-446655440000

Response (200):
{
  "taskId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "PROCESSING",
  "progress": 45,
  "currentPhase": "生成",
  "estimatedSecondsRemaining": 30
}
```

### 获取结果
```
GET /api/ai/portrait/result/550e8400-e29b-41d4-a716-446655440000

Response (200, 当 status=COMPLETED):
{
  "taskId": "...",
  "status": "COMPLETED",
  "progress": 100,
  "imageUrls": [
    "/static/portraits/user123/image-0.png",
    "/static/portraits/user123/thumb-0.png"
  ],
  "generationTime": 45000
}
```

### 保存结果
```
POST /api/ai/portrait/save
Content-Type: application/json

{
  "taskId": "550e8400-...",
  "resourceName": "我的第一个立绘",
  "tags": "anime, girl, pink-hair"
}

Response (200): OK
```

### 生成历史
```
GET /api/ai/portrait/history?page=0&size=20

Response (200):
{
  "items": [
    {
      "id": 1,
      "taskId": "550e8400-...",
      "prompt": "日系二次元少女...",
      "generatedImageUrls": [...],
      "status": "SUCCESS",
      "generationTime": 45000,
      "generatedAt": "2026-03-04T10:00:00"
    }
  ],
  "total": 42,
  "page": 0,
  "size": 20
}
```

---

## 前后端接口约定

### 请求头
```
X-User-Id: 12345  // 用户 ID，从认证系统获取
Content-Type: application/json
```

### 响应格式
```json
{
  "code": 200,           // HTTP 状态码
  "message": "成功",     // 错误信息 (仅在错误时)
  "data": {...}          // 实际数据
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "提示词不能为空，长度 1-500 字符",
  "data": null
}
```

---

## 部署注意事项

### 本地开发
```bash
# 启动 MySQL
docker run -d -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=writeengine \
  mysql:8

# 启动 Stable Diffusion (可选)
docker run -d -p 7860:7860 \
  ghcr.io/d3fuse/ollama-docker:latest

# 运行应用
mvn spring-boot:run
```

### 生产环境
- 使用 RDS (Amazon RDS) 或其他托管数据库
- 使用 OSS (Alibaba OSS) 或 S3 存储图片
- 配置日志聚合 (ELK)
- 设置监控告警 (Prometheus + Grafana)
- 使用 Docker + Kubernetes 部署
- 配置反向代理和负载均衡

### 成本优化
- 使用本地 Stable Diffusion 而不是调用 API
- 定期清理过期生成记录
- 实现图片缓存策略
- 使用 CDN 加速图片分发

---

## 安全考虑

### 认证和授权
- 所有 API 端点都需要 X-User-Id 认证
- 用户只能访问自己的生成历史
- 管理员可访问所有用户的数据

### API 安全
- 实现速率限制 (防止滥用)
- 验证所有用户输入
- 使用 HTTPS 加密传输
- 存储 API 密钥时加密

### 数据安全
- 参考图片存储在私有目录
- 生成的图片默认为私有，分享时生成 token
- 定期备份数据库和文件

---

## 监控和维护

### 关键指标
- 生成任务成功率
- 平均生成时间
- 队列长度
- API 响应时间
- 错误率

### 告警规则
- 生成失败率 > 10%
- 平均生成时间 > 2 分钟
- 队列长度 > 50
- API 响应时间 > 500ms

### 日志监控
- 所有 API 请求
- 任务生命周期事件
- AI 模型调用日志
- 错误和异常堆栈

---

## 总结

这个后端设计方案提供了：

✅ **完整的架构设计** - 从数据库到 API
✅ **详细的代码框架** - 可直接实现
✅ **清晰的任务划分** - 便于团队协作
✅ **生产级质量** - 包括错误处理、监控、安全
✅ **可扩展性** - 支持多模型、多存储方案

开发团队可以按照任务清单逐步实现，预计总耗时 4-6 周。

---

**文档版本**: 1.0
**最后更新**: 2026-03-04
**状态**: 待审核

