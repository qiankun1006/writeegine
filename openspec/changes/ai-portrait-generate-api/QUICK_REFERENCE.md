# 🚀 AI 人物立绘生成 API 快速参考

## 核心 API

### 1️⃣ 生成请求（POST）
```bash
curl -X POST http://localhost:8080/api/ai/portrait/generate \
  -H "X-User-Id: 123" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "一个年轻的女性角色，穿着古装",
    "negativePrompt": "低质量, 模糊",
    "width": 1024,
    "height": 1024,
    "provider": "aliyun",
    "modelVersion": "wanx-v1",
    "generateCount": 2,
    "steps": 30,
    "sampler": "euler",
    "faceEnhance": true,
    "outputFormat": "png"
  }'
```

**响应** (202 Accepted):
```json
{
  "taskId": "task_1710379200123_a1b2c3d4",
  "status": "PENDING",
  "message": "生成任务已创建，正在处理中",
  "estimatedTime": 120
}
```

### 2️⃣ 查询进度（GET）
```bash
curl -X GET http://localhost:8080/api/ai/portrait/progress/task_1710379200123_a1b2c3d4 \
  -H "X-User-Id: 123"
```

**响应** (处理中):
```json
{
  "taskId": "task_xxx",
  "status": "PROCESSING",
  "progress": 45,
  "message": "正在生成中..."
}
```

**响应** (完成):
```json
{
  "taskId": "task_xxx",
  "status": "SUCCESS",
  "progress": 100,
  "imageUrls": ["https://cdn.example.com/result1.png", "https://cdn.example.com/result2.png"]
}
```

---

## 前端参数映射表

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| `prompt` | `prompt` | String | 正面提示词 |
| `negativePrompt` | `negativePrompt` | String | 负面提示词 |
| `referenceImagePreview` | `referenceImageBase64` | String | 参考图片（Base64） |
| `modelWeight` | `modelWeight` | BigDecimal | 模型权重（0.0-1.0） |
| `width` | `width` | Integer | 生成宽度 |
| `height` | `height` | Integer | 生成高度 |
| `provider` | `provider` | String | 服务商（aliyun/volcengine） |
| `modelVersion` | `modelVersion` | String | 模型版本 |
| `imageStrength` | `imageStrength` | BigDecimal | 参考图片强度 |
| `generateCount` | `generateCount` | Integer | 生成数量（1-4） |
| `sampler` | `sampler` | String | 采样器 |
| `steps` | `steps` | Integer | 迭代步数（10-50） |
| `stylePreset` | `stylePreset` | String | 风格预设 |
| `seed` | `seed` | Integer | 随机种子 |
| `faceEnhance` | `faceEnhance` | Boolean | 面部增强 |
| `outputFormat` | `outputFormat` | String | 输出格式（png/jpg） |

---

## 后端核心实现

### 📁 文件位置
```
src/main/java/com/example/writemyself/
├── dto/
│   ├── GeneratePortraitRequest.java      ✅ 生成请求 DTO
│   ├── GeneratePortraitResponse.java     ✅ 生成响应 DTO
│   └── GenerateProgressResponse.java     ✅ 进度响应 DTO
├── controller/
│   └── AIPortraitController.java         ✅ REST API 入口
├── service/
│   └── AIPortraitService.java            ✅ 业务逻辑
├── entity/
│   ├── AIPortraitGeneration.java         ✅ 数据库记录
│   └── AIPortraitTask.java               追踪任务进度
└── repository/
    ├── AIPortraitGenerationRepository.java
    └── AIPortraitTaskRepository.java
```

### 📝 关键方法

#### AIPortraitService

| 方法 | 说明 |
|------|------|
| `createGenerationTask()` | 创建生成任务，返回 taskId |
| `processGenerationTaskAsync()` | 异步处理生成（后台线程） |
| `getGenerationProgress()` | 查询任务进度和结果 |
| `getAvailableModels()` | 获取可用模型列表 |
| `getGenerationHistory()` | 获取用户生成历史 |
| `saveGenerationResult()` | 保存结果到资源库 |

---

## 前端核心实现

### 📁 文件位置
```
src/main/resources/static/ai-portrait-generator/src/
├── components/
│   └── ResultsPanel.vue                  ✅ 生成控制和结果展示
├── stores/
│   └── portraitStore.ts                  状态管理
└── App.vue                               应用入口
```

### 📝 关键流程

#### ResultsPanel.vue

```typescript
// 1. 用户点击"开始生成"
handleGenerate() {
  // ├─ 参数验证
  // ├─ 构建 Request DTO
  // ├─ POST /api/ai/portrait/generate
  // └─ 获取 taskId
}

// 2. 启动轮询
pollGenerationProgress() {
  // ├─ GET /api/ai/portrait/progress/{taskId}
  // ├─ 更新进度条
  // ├─ 处理 PROCESSING / SUCCESS / FAILED
  // └─ 显示结果或错误
}

// 3. 用户点击"重置参数"
handleReset() {
  // ├─ 停止轮询
  // ├─ 清空 taskId
  // └─ 重置参数到默认值
}
```

---

## 常见状态码

| 状态码 | 含义 | 处理方式 |
|--------|------|---------|
| 202 | Accepted（请求已接受） | 启动轮询查询进度 |
| 200 | OK（成功） | 处理返回的结果或进度 |
| 400 | Bad Request（参数错误） | 提示用户检查参数 |
| 500 | Internal Server Error（服务器错误） | 提示用户稍后重试 |

---

## 任务状态流转

```
┌─────────────┐
│  PENDING    │ 任务已创建，等待处理
└────┬────────┘
     │
     ↓
┌─────────────┐
│ PROCESSING  │ 正在生成中（progress: 0-100）
└────┬────────┘
     │
     ├──→ ┌─────────────┐
     │    │  SUCCESS    │ 生成成功，返回图片 URL
     │    └─────────────┘
     │
     └──→ ┌─────────────┐
          │   FAILED    │ 生成失败，返回错误信息
          └─────────────┘
```

---

## 日志查看

### 后端日志示例

```
📝 创建生成任务: userId=123, provider=aliyun, modelVersion=wanx-v1, generateCount=2, dimensions=1024x1024, prompt.length=50
✓ 生成记录已保存: generationId=12345
✓ 任务记录已保存: taskId=task_xxx
🚀 异步任务已提交: taskId=task_xxx
🚀 开始异步处理生成任务: taskId=task_xxx, generationId=12345
✓ 任务开始处理，更新状态为 PROCESSING
✓ AI 模型服务已初始化: wanx-v1
📊 进度更新: 10%
✍️ 使用文生图模式，生成数量: 2
✓ AI 生成完成，生成 2 张图片
📊 进度更新: 90%
✓ 生成结果已保存到数据库
✓ 生成任务完成: taskId=task_xxx, 生成 2 张图片，耗时 125 秒
```

### 前端日志示例

```
📤 发送生成请求: {prompt: "...", provider: "aliyun", ...}
📥 后端返回响应: {taskId: "task_xxx", status: "PENDING", ...}
🔄 开始轮询进度，taskId: task_xxx
📊 进度更新: {status: "PROCESSING", progress: 10}
📊 进度更新: {status: "PROCESSING", progress: 45}
📊 进度更新: {status: "PROCESSING", progress: 90}
✓ 生成成功，获取结果: {imageUrls: ["url1", "url2"]}
🎉 生成完成！
```

---

## 故障排查

### 问题1：生成任务卡在 PROCESSING
**可能原因**：AI 模型服务未响应或网络延迟
**解决方案**：
- 检查后端 AI 模型服务是否正常运行
- 查看服务器日志中是否有超时错误
- 尝试延长轮询超时时间

### 问题2：前端无法获取结果
**可能原因**：taskId 错误或任务已过期
**解决方案**：
- 确认 taskId 是否正确
- 检查任务是否已超过保存期限
- 重新提交生成请求

### 问题3：参数验证失败
**可能原因**：参数格式错误或超出范围
**解决方案**：
- 检查参数值是否符合约束（长度、范围等）
- 参考前文的参数映射表
- 查看后端返回的具体错误信息

---

## 性能优化建议

### 后端
- [ ] 实现任务队列限流（防止瞬时并发过高）
- [ ] 添加结果缓存（相同参数的生成结果）
- [ ] 实现批量查询（支持查询多个任务的进度）

### 前端
- [ ] 实现指数退避轮询（逐步增加轮询间隔）
- [ ] 添加超时控制（防止无限轮询）
- [ ] 实现 WebSocket 实时推送（替代轮询）

---

**版本**: 1.0
**更新日期**: 2026-03-13
**状态**: ✅ 完成生成并已测试验证

