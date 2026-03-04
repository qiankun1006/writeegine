# API 集成指南

## 概述

本文档描述 AI 人物立绘生成器前端与后端 API 的集成方式。

## 后端 API 规范

### 1. 生成图像

**端点:** `POST /api/ai/portrait/generate`

**功能:** 初始化一个 AI 立绘生成任务

#### 请求格式

```json
{
  "prompt": "日系二次元少女，长发粉发，猫耳，穿洛丽塔裙，纯色背景，光影柔和",
  "negativePrompt": "低质量, 模糊, 多手指, 水印, 变形, 低分辨率",
  "referenceImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
  "modelWeight": 0.8,
  "width": 512,
  "height": 768,
  "imageStrength": 0.6,
  "generateCount": 1,
  "sampler": "euler",
  "steps": 30,
  "stylePreset": "anime",
  "seed": -1,
  "faceEnhance": true,
  "outputFormat": "png"
}
```

#### 请求字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| prompt | string | 是 | 主提示词，1-500 字符 |
| negativePrompt | string | 否 | 负面提示词，0-500 字符 |
| referenceImage | string | 否 | Base64 编码的参考图片 |
| modelWeight | number | 是 | 模型权重，0-1 |
| width | number | 是 | 生成宽度，256/512/1024/2048 |
| height | number | 是 | 生成高度，256/512/1024/2048 |
| imageStrength | number | 否 | 图生图强度，0-1，默认 0.6 |
| generateCount | number | 否 | 生成数量，1-5，默认 1 |
| sampler | string | 否 | 采样器，euler/dpm++/autocfg，默认 euler |
| steps | number | 否 | 迭代步数，10-50，默认 30 |
| stylePreset | string | 否 | 风格预设，anime/chinese-realistic/cyberpunk/cartoon/none |
| seed | number | 否 | 种子值，-1 为随机，默认 -1 |
| faceEnhance | boolean | 否 | 是否启用面部修复，默认 true |
| outputFormat | string | 否 | 输出格式，png/jpg，默认 png |

#### 响应格式 (200 OK)

```json
{
  "code": 0,
  "message": "请求已接受",
  "data": {
    "taskId": "task_abc123def456",
    "estimatedTime": 120
  }
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 状态码，0 表示成功 |
| message | string | 响应消息 |
| data | object | 响应数据 |
| data.taskId | string | 任务 ID，用于查询进度 |
| data.estimatedTime | number | 预估耗时（秒） |

#### 错误响应

```json
{
  "code": 400,
  "message": "参数验证失败",
  "data": {
    "errors": [
      {
        "field": "prompt",
        "message": "提示词不能为空"
      }
    ]
  }
}
```

---

### 2. 查询进度

**端点:** `GET /api/ai/portrait/progress/{taskId}`

**功能:** 查询生成任务的进度

#### URL 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| taskId | string | 任务 ID |

#### 响应格式 - 处理中 (200 OK)

```json
{
  "code": 0,
  "message": "处理中",
  "data": {
    "status": "processing",
    "progress": 45,
    "message": "生成中...",
    "results": null
  }
}
```

#### 响应格式 - 已完成 (200 OK)

```json
{
  "code": 0,
  "message": "生成完成",
  "data": {
    "status": "completed",
    "progress": 100,
    "results": [
      {
        "id": "result_1",
        "url": "https://example.com/images/result_1.png",
        "generatedAt": "2024-03-04T10:30:00Z"
      },
      {
        "id": "result_2",
        "url": "https://example.com/images/result_2.png",
        "generatedAt": "2024-03-04T10:30:05Z"
      }
    ]
  }
}
```

#### 响应格式 - 错误 (200 OK)

```json
{
  "code": 0,
  "message": "生成失败",
  "data": {
    "status": "error",
    "progress": 0,
    "error": "提示词内容不当，请修改后重试"
  }
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| status | string | 状态：pending/processing/completed/error |
| progress | number | 进度百分比，0-100 |
| message | string | 状态消息 |
| results | array | 生成结果数组（仅在 completed 时出现） |
| results[].id | string | 结果 ID |
| results[].url | string | 图片 URL |
| results[].generatedAt | string | 生成时间（ISO 8601 格式） |
| error | string | 错误信息（仅在 error 时出现） |

---

### 3. 保存结果

**端点:** `POST /api/ai/portrait/save`

**功能:** 将生成结果保存到项目资源库

#### 请求格式

```json
{
  "generationId": "task_abc123def456",
  "resultId": "result_1",
  "name": "我的角色",
  "description": "可爱的少女角色",
  "tags": ["character", "female", "anime"]
}
```

#### 响应格式 (200 OK)

```json
{
  "code": 0,
  "message": "保存成功",
  "data": {
    "assetId": "asset_xyz789",
    "name": "我的角色",
    "path": "/project/assets/characters/my_character.png"
  }
}
```

---

### 4. 获取历史

**端点:** `GET /api/ai/portrait/history?limit=20`

**功能:** 获取用户的生成历史

#### 查询参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| limit | number | 20 | 返回的记录数，最大 100 |
| offset | number | 0 | 分页偏移量 |

#### 响应格式 (200 OK)

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "total": 42,
    "records": [
      {
        "generationId": "task_abc123",
        "prompt": "日系少女...",
        "width": 512,
        "height": 768,
        "generatedAt": "2024-03-04T10:30:00Z",
        "results": [
          {
            "id": "result_1",
            "url": "https://example.com/images/result_1.png",
            "generatedAt": "2024-03-04T10:30:00Z"
          }
        ]
      }
    ]
  }
}
```

---

### 5. 删除结果

**端点:** `DELETE /api/ai/portrait/results/{resultId}`

**功能:** 删除生成的图片

#### 响应格式 (200 OK)

```json
{
  "code": 0,
  "message": "删除成功"
}
```

---

## 前端集成

### 使用 API 工具

前端已提供 `src/utils/api.ts` 工具类来简化 API 调用。

#### 示例 1: 生成图像

```typescript
import { generatePortrait, pollGenerationProgress } from '@/utils/api'
import { usePortraitStore } from '@/stores/portraitStore'

const store = usePortraitStore()

// 发起生成请求
const taskId = await generatePortrait(store.params)

// 轮询进度
pollGenerationProgress(
  taskId,
  (progress) => {
    store.updateProgress(progress.progress)
    console.log(`进度: ${progress.progress}%`)
  }
)
  .then((result) => {
    if (result.results) {
      result.results.forEach((r) => {
        store.completeGeneration({
          id: r.id,
          imageUrl: r.url,
          generatedAt: r.generatedAt,
          params: store.params,
        })
      })
    }
  })
  .catch((error) => {
    store.failGeneration(error.message)
  })
```

#### 示例 2: 保存结果

```typescript
import { saveResultToProject } from '@/utils/api'

await saveResultToProject({
  generationId: 'task_abc123',
  resultId: 'result_1',
  name: '我的角色',
  description: '可爱的少女',
  tags: ['character', 'female'],
})
```

#### 示例 3: 下载图片

```typescript
import { downloadImage } from '@/utils/api'

downloadImage('https://example.com/image.png', 'character.png')
```

---

## 错误处理

### 常见错误

| HTTP 状态 | 错误码 | 说明 | 处理方式 |
|----------|--------|------|---------|
| 400 | - | 参数验证失败 | 显示验证错误提示 |
| 401 | - | 未授权 | 跳转到登录页 |
| 403 | - | 禁止访问 | 显示权限错误 |
| 404 | - | 任务不存在 | 显示"任务已过期" |
| 500 | - | 服务器错误 | 显示"服务异常，请稍后重试" |
| 503 | - | 服务不可用 | 显示"服务维护中" |

### 超时处理

生成任务的默认超时时间为 5 分钟。如果超过此时间仍未完成，前端会显示超时错误。

可以在 `src/utils/api.ts` 中修改 `pollGenerationProgress` 的参数：

```typescript
await pollGenerationProgress(
  taskId,
  onProgress,
  300,  // maxAttempts - 最多轮询 300 次
  1000  // intervalMs - 每次间隔 1000ms
)
```

---

## 安全性考虑

### CSRF 保护

如果后端启用了 CSRF 保护，需要在请求中包含 CSRF token。

```typescript
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')

if (csrfToken) {
  apiBase.defaults.headers.common['X-CSRF-Token'] = csrfToken
}
```

### 文件上传安全

前端已做的防护：
- ✓ 文件类型检查（仅允许 PNG、JPG、WEBP）
- ✓ 文件大小检查（≤10MB）
- ✓ 前端图片压缩（≤1MB）

后端应该进行的防护：
- [ ] 重新验证文件类型和大小
- [ ] 扫描恶意内容
- [ ] 生成安全的文件名
- [ ] 限制存储空间

### 数据隐私

- 参数只在用户同意时发送到后端
- 生成结果应该加密存储
- 历史记录应该仅对用户本人可见
- 实现数据过期机制（如 30 天后自动删除）

---

## 性能优化

### 缓存策略

```typescript
// 实现 API 响应缓存
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 分钟

async function getCachedHistory() {
  const cached = cache.get('history')
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  const data = await getGenerationHistory()
  cache.set('history', { data, timestamp: Date.now() })
  return data
}
```

### 请求去重

```typescript
// 防止重复的生成请求
let pendingTask: Promise<string> | null = null

async function generateWithDedup(params: PortraitParams) {
  if (pendingTask) {
    return pendingTask
  }

  pendingTask = generatePortrait(params)
  try {
    return await pendingTask
  } finally {
    pendingTask = null
  }
}
```

### 网络监控

```typescript
// 监控网络状态
window.addEventListener('online', () => {
  console.log('网络恢复')
  // 重新尝试失败的请求
})

window.addEventListener('offline', () => {
  console.log('网络断开')
  // 显示离线提示
})
```

---

## 调试

### 启用 API 调试

在 `src/utils/api.ts` 中设置：

```typescript
// 启用详细日志
const DEBUG = true

if (DEBUG) {
  apiBase.interceptors.request.use(config => {
    console.group('API Request')
    console.log('URL:', config.url)
    console.log('Method:', config.method)
    console.log('Data:', config.data)
    console.groupEnd()
    return config
  })
}
```

### 使用浏览器开发者工具

1. 打开 Network 标签
2. 查看所有 `/api/**` 请求
3. 检查请求头和响应体
4. 使用 Console 调试 JavaScript 代码

---

## 常见问题

**Q: 如何处理长时间的生成任务？**
A: 使用轮询方式定期查询进度。对于超长任务，可以实现 WebSocket 连接替代 HTTP 轮询。

**Q: 如何支持批量生成？**
A: 前端已支持 `generateCount` 参数。一个请求可以生成 1-5 张图片。

**Q: 是否支持取消任务？**
A: 目前不支持，但可以在后端添加 `POST /api/ai/portrait/cancel/{taskId}` 端点。

**Q: 生成结果如何存储？**
A: 后端应该将图片存储到对象存储服务（如 OSS、S3）并返回 URL。

---

## 版本历史

### v1.0.0 (2024-03-04)
- 初始版本
- 基础 API 规范
- 前端集成示例

---

## 联系方式

如有问题或建议，请联系开发团队。

