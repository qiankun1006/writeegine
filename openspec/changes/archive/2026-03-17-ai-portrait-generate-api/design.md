# 技术设计文档：AI 人物立绘生成 API

## 1. 系统概述

### 1.1 架构图

```
┌─────────────────────────────────────────────────────────┐
│ 前端 (Vue 3 + TypeScript)                              │
│ - App.vue: 主应用                                      │
│ - ResultsPanel.vue: 结果和操作面板                     │
│ - portraitStore.ts: 状态管理 (Pinia)                  │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌─────────┴─────────┐
        │ HTTP 请求/响应    │
        ↓                   ↓
    POST /api/ai/portrait/generate
    GET  /api/ai/portrait/progress/{taskId}
    GET  /api/ai/portrait/result/{taskId}
        ↓                   ↑
┌─────────────────────────────────────────────────────────┐
│ 后端 (Spring Boot)                                     │
│ - AIPortraitController: REST 端点                      │
│ - AIPortraitService: 业务逻辑                          │
│ - 数据库: 任务存储                                     │
│ - 队列: 任务队列 (Redis/MQ)                            │
│ - 第三方 API: 阿里云/火山引擎文生图服务              │
└─────────────────────────────────────────────────────────┘
```

### 1.2 数据流

```
前端用户 → 输入参数 → 点击生成 → 发送 POST /generate
           ↓
       参数验证
           ↓
       创建生成任务 (taskId)
           ↓
       返回 202 Accepted + taskId
           ↓
前端轮询 GET /progress/{taskId}
           ↓
       返回进度信息
           ↓
     (完成后) GET /result/{taskId}
           ↓
       返回生成结果图片 URL
           ↓
前端显示结果
```

## 2. 前后端数据协议

### 2.1 POST /api/ai/portrait/generate - 生成请求

#### 请求头
```
POST /api/ai/portrait/generate HTTP/1.1
Content-Type: application/json
X-User-Id: <userId>
```

#### 请求体格式

```json
{
  "// 核心参数": {},
  "prompt": "一个年轻的女性角色，穿着古装，五官精致，皮肤光滑",
  "negativePrompt": "低质量, 模糊, 多手指, 水印, 变形, 低分辨率",
  "referenceImageBase64": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "modelWeight": 0.8,
  "width": 768,
  "height": 512,

  "// 模型选择": {},
  "provider": "aliyun",
  "modelVersion": "wanx-v1",

  "// 高级参数": {},
  "imageStrength": 0.6,
  "generateCount": 1,
  "sampler": "euler",
  "steps": 30,
  "stylePreset": "none",
  "seed": -1,
  "faceEnhance": true,
  "outputFormat": "png"
}
```

#### 字段说明

| 字段 | 类型 | 必须 | 说明 | 范围 |
|-----|------|------|------|------|
| prompt | String | Y | 正面提示词 | 1-500 字 |
| negativePrompt | String | N | 负面提示词 | 0-500 字 |
| referenceImageBase64 | String | N | 参考图片 Base64 | null 或有效 Base64 |
| modelWeight | Number | Y | 模型权重 | 0.0-1.0 |
| width | Integer | Y | 生成宽度 | 256/512/1024/2048 |
| height | Integer | Y | 生成高度 | 256/512/1024/2048 |
| provider | String | Y | 服务提供商 | "aliyun"/"volcengine" |
| modelVersion | String | Y | 模型版本 | "wanx-v1" 等 |
| imageStrength | Number | N | 参考图片强度 | 0.0-1.0 |
| generateCount | Integer | Y | 生成数量 | 1-4 |
| sampler | String | Y | 采样器 | "euler"/"dpm++"/"autocfg" |
| steps | Integer | Y | 迭代步数 | 10-50 |
| stylePreset | String | N | 风格预设 | "none" 等 |
| seed | Integer | N | 随机种子 | -1 ~ 2147483647 |
| faceEnhance | Boolean | Y | 面部修复 | true/false |
| outputFormat | String | Y | 输出格式 | "png"/"jpg" |

#### 响应 (202 Accepted)

```json
{
  "taskId": "task_20260312_abc123def456",
  "status": "PENDING",
  "message": "生成任务已创建，正在处理中",
  "createdAt": "2026-03-12T10:30:00Z",
  "estimatedTime": 30
}
```

### 2.2 GET /api/ai/portrait/progress/{taskId} - 查询进度

#### 请求
```
GET /api/ai/portrait/progress/task_20260312_abc123def456 HTTP/1.1
X-User-Id: <userId>
```

#### 响应 (200 OK 或 202 Accepted)

```json
{
  "taskId": "task_20260312_abc123def456",
  "status": "PROCESSING",
  "progress": 45,
  "completed": false,
  "message": "正在生成中...",
  "startTime": "2026-03-12T10:30:00Z",
  "elapsedTime": 15
}
```

**状态值**：
- `PENDING` - 待处理
- `PROCESSING` - 生成中
- `COMPLETED` - 已完成
- `FAILED` - 失败
- `CANCELLED` - 已取消

### 2.3 GET /api/ai/portrait/result/{taskId} - 获取结果

#### 请求
```
GET /api/ai/portrait/result/task_20260312_abc123def456 HTTP/1.1
X-User-Id: <userId>
```

#### 响应 (200 OK)

```json
{
  "taskId": "task_20260312_abc123def456",
  "status": "COMPLETED",
  "completed": true,
  "resultImages": [
    {
      "url": "https://cdn.example.com/results/abc123_1.png",
      "format": "png",
      "size": "768x512"
    }
  ],
  "completedAt": "2026-03-12T10:31:00Z",
  "totalTime": 60
}
```

## 3. 后端实现设计

### 3.1 DTO 定义

#### GeneratePortraitRequest.java

```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Validated
public class GeneratePortraitRequest {
    // 核心参数
    @NotBlank(message = "正面提示词不能为空")
    @Length(min = 1, max = 500, message = "正面提示词长度需要在1-500之间")
    private String prompt;

    @Length(max = 500, message = "负面提示词长度需要在0-500之间")
    private String negativePrompt;

    @Pattern(regexp = "^(data:image/(png|jpeg|jpg|webp);base64,)?[A-Za-z0-9+/=]*$",
             message = "参考图片格式不正确")
    private String referenceImageBase64;

    @NotNull(message = "模型权重不能为空")
    @DecimalMin(value = "0.0", message = "模型权重最小值为0.0")
    @DecimalMax(value = "1.0", message = "模型权重最大值为1.0")
    private BigDecimal modelWeight;

    @NotNull(message = "生成宽度不能为空")
    @In(values = {256, 512, 1024, 2048}, message = "生成宽度只支持 256/512/1024/2048")
    private Integer width;

    @NotNull(message = "生成高度不能为空")
    @In(values = {256, 512, 1024, 2048}, message = "生成高度只支持 256/512/1024/2048")
    private Integer height;

    // 模型选择
    @NotBlank(message = "服务商不能为空")
    @Pattern(regexp = "^(aliyun|volcengine)$", message = "服务商只支持 aliyun/volcengine")
    private String provider;

    @NotBlank(message = "模型版本不能为空")
    private String modelVersion;

    // 高级参数
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "1.0")
    private BigDecimal imageStrength = new BigDecimal("0.6");

    @NotNull(message = "生成数量不能为空")
    @Min(value = 1, message = "生成数量最小为1")
    @Max(value = 4, message = "生成数量最大为4")
    private Integer generateCount = 1;

    @Pattern(regexp = "^(euler|dpm\\+\\+|autocfg)$", message = "采样器类型不正确")
    private String sampler = "euler";

    @NotNull(message = "迭代步数不能为空")
    @Min(value = 10, message = "迭代步数最小为10")
    @Max(value = 50, message = "迭代步数最大为50")
    private Integer steps = 30;

    private String stylePreset;

    @Min(value = -1, message = "随机种子最小为-1")
    private Integer seed = -1;

    private Boolean faceEnhance = true;

    @Pattern(regexp = "^(png|jpg)$", message = "输出格式只支持 png/jpg")
    private String outputFormat = "png";
}
```

#### GeneratePortraitResponse.java

```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GeneratePortraitResponse {
    private String taskId;
    private String status;              // PENDING/PROCESSING/COMPLETED/FAILED
    private Integer progress;
    private Boolean completed;
    private String message;
    private LocalDateTime createdAt;
    private Integer estimatedTime;      // 预计剩余时间（秒）
    private List<GeneratedImage> resultImages;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GeneratedImage {
        private String url;
        private String format;
        private String size;
    }
}
```

### 3.2 Controller 实现

```java
@PostMapping("/generate")
public ResponseEntity<GeneratePortraitResponse> generate(
        @RequestHeader("X-User-Id") Long userId,
        @Valid @RequestBody GeneratePortraitRequest request) {
    try {
        log.info("收到生成请求: userId={}, prompt={}", userId, request.getPrompt());

        // 参数验证
        if (!isValidRequest(request)) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(GeneratePortraitResponse.builder()
                    .status("FAILED")
                    .message("参数验证失败")
                    .build());
        }

        // 创建生成任务
        GeneratePortraitResponse response = aiPortraitService.createGenerationTask(userId, request);

        // 返回 202 Accepted 和任务 ID
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);

    } catch (Exception e) {
        log.error("生成请求处理失败", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
```

### 3.3 Service 实现逻辑

```java
public GeneratePortraitResponse createGenerationTask(Long userId, GeneratePortraitRequest request) {
    // 1. 创建任务记录
    String taskId = generateTaskId();
    AIPortraitGeneration task = AIPortraitGeneration.builder()
        .taskId(taskId)
        .userId(userId)
        .prompt(request.getPrompt())
        .negativePrompt(request.getNegativePrompt())
        .referenceImage(request.getReferenceImageBase64())
        .modelWeight(request.getModelWeight())
        .width(request.getWidth())
        .height(request.getHeight())
        .provider(request.getProvider())
        .modelVersion(request.getModelVersion())
        .imageStrength(request.getImageStrength())
        .generateCount(request.getGenerateCount())
        .sampler(request.getSampler())
        .steps(request.getSteps())
        .stylePreset(request.getStylePreset())
        .seed(request.getSeed())
        .faceEnhance(request.getFaceEnhance())
        .outputFormat(request.getOutputFormat())
        .status("PENDING")
        .createdAt(LocalDateTime.now())
        .build();

    // 2. 保存任务到数据库
    aiPortraitGenerationRepository.save(task);

    // 3. 将任务放入队列
    taskQueue.push(task);

    // 4. 返回响应
    return GeneratePortraitResponse.builder()
        .taskId(taskId)
        .status("PENDING")
        .message("生成任务已创建，正在处理中")
        .createdAt(task.getCreatedAt())
        .estimatedTime(30)
        .build();
}
```

## 4. 前端集成方案

### 4.1 Vue 中的 API 调用

```typescript
// 前端在 ResultsPanel.vue 中调用
const handleGenerate = async () => {
  if (!store.isAllValid) {
    ElMessage.error('请检查参数是否有效')
    return
  }

  try {
    // 准备请求数据
    const requestData = {
      prompt: store.params.prompt,
      negativePrompt: store.params.negativePrompt,
      referenceImageBase64: store.params.referenceImagePreview,
      modelWeight: store.params.modelWeight,
      width: store.params.width,
      height: store.params.height,
      provider: store.params.provider,
      modelVersion: store.params.modelVersion,
      imageStrength: store.params.imageStrength,
      generateCount: store.params.generateCount,
      sampler: store.params.sampler,
      steps: store.params.steps,
      stylePreset: store.params.stylePreset,
      seed: store.params.seed,
      faceEnhance: store.params.faceEnhance,
      outputFormat: store.params.outputFormat,
    }

    // 调用后端 API
    const response = await fetch('/api/ai/portrait/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      body: JSON.stringify(requestData),
    })

    if (response.status === 202) {
      const data = await response.json()
      const taskId = data.taskId

      // 启动轮询获取进度
      pollProgress(taskId)
    }
  } catch (error) {
    store.failGeneration(error.message)
  }
}

// 轮询获取进度
const pollProgress = async (taskId: string) => {
  store.startGeneration()

  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`/api/ai/portrait/progress/${taskId}`, {
        headers: {
          'X-User-Id': userId,
        },
      })

      const data = await response.json()
      store.updateProgress(data.progress)

      if (data.completed) {
        clearInterval(pollInterval)

        // 获取最终结果
        const resultResponse = await fetch(`/api/ai/portrait/result/${taskId}`, {
          headers: {
            'X-User-Id': userId,
          },
        })

        const resultData = await resultResponse.json()

        // 显示结果
        store.completeGeneration({
          id: taskId,
          imageUrl: resultData.resultImages[0].url,
          generatedAt: new Date().toISOString(),
          params: store.params,
        })
      }
    } catch (error) {
      clearInterval(pollInterval)
      store.failGeneration('获取进度失败')
    }
  }, 1000)
}
```

## 5. 错误处理

### 5.1 参数验证错误

- 400 Bad Request：参数不符合要求
- 响应体包含详细的验证错误信息

### 5.2 业务逻辑错误

- 422 Unprocessable Entity：业务逻辑校验失败
- 如：配额超出、模型不可用等

### 5.3 系统错误

- 500 Internal Server Error：系统内部错误
- 503 Service Unavailable：服务暂时不可用

## 6. 安全考虑

1. **用户认证**：通过 X-User-Id 头验证用户身份
2. **参数验证**：服务端严格验证所有输入参数
3. **访问控制**：确保用户只能访问自己的任务
4. **速率限制**：限制每个用户的生成频率
5. **文件上传安全**：验证上传的参考图片格式和大小

