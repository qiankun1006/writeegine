# 设计文档：AI肖像生成后端系统

## 上下文

### 当前状态
- 前端AI肖像生成页面已经完成，使用Vue 3 + Vite + TypeScript构建
- 前端页面需要以下API接口：
  - POST /api/ai/portrait/generate - 生成图像
  - GET /api/ai/portrait/progress/{taskId} - 查询进度
  - POST /api/ai/portrait/save - 保存结果
  - GET /api/ai/portrait/history - 获取历史
  - GET /api/ai/portrait/models - 获取模型列表
- 已有基础的火山引擎服务框架，但需要完善
- 项目使用Java 8 + Spring Boot 2.7.14

### 需求驱动
- 游戏创作者需要快速生成高质量二次元人物立绘
- 需要支持文本到图像生成的完整流程
- 需要异步处理机制，因为AI生成需要较长时间
- 需要支持多种AI模型提供商（火山引擎、阿里云等）
- 需要完整的用户历史记录和结果管理

### 技术约束
- Java 8兼容性要求
- Spring Boot 2.7.14框架
- MySQL数据库
- 国内大模型API（火山引擎优先）
- 需要支持异步处理和任务队列

## 目标 / 非目标

### 目标
- ✅ 构建完整的AI肖像生成后端API
- ✅ 集成火山引擎大模型API
- ✅ 实现异步任务处理和进度查询
- ✅ 提供用户历史记录管理
- ✅ 支持多种AI模型提供商
- ✅ 确保Java 8兼容性

### 非目标
- ❌ 实现复杂的用户认证系统（使用简单的用户ID）
- ❌ 实现图片存储服务（使用URL引用）
- ❌ 实现复杂的权限控制
- ❌ 支持国际大模型API（如OpenAI）

## 技术方案

### 1. 系统架构

```
客户端 → Spring Boot Controller → Service → AI模型服务 → 数据库
                                   ↓
                            异步任务队列
                                   ↓
                          进度状态管理
```

### 2. 数据库设计

#### AIPortraitGeneration（生成记录表）
```sql
CREATE TABLE ai_portrait_generation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    task_id VARCHAR(64) NOT NULL UNIQUE,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    reference_image_url VARCHAR(512),
    width INT NOT NULL,
    height INT NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    style_preset VARCHAR(50),
    inference_steps INT,
    sampler_name VARCHAR(50),
    seed BIGINT,
    generated_image_urls TEXT,
    status VARCHAR(20) NOT NULL, -- PENDING, PROCESSING, SUCCESS, FAILED
    error_message TEXT,
    generation_time INT, -- 生成耗时（秒）
    queue_wait_time INT, -- 排队等待时间（秒）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_task_id (task_id),
    INDEX idx_created_at (created_at)
);
```

#### AIPortraitTask（任务表）
```sql
CREATE TABLE ai_portrait_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id VARCHAR(64) NOT NULL UNIQUE,
    generation_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL, -- PENDING, PROCESSING, SUCCESS, FAILED
    progress INT DEFAULT 0, -- 进度百分比
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_task_id (task_id),
    INDEX idx_generation_id (generation_id)
);
```

#### AIPortraitModelConfig（模型配置表）
```sql
CREATE TABLE ai_portrait_model_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    model_name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- VOLCENGINE, ALIYUN
    endpoint_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    supported_styles TEXT, -- JSON数组
    max_width INT DEFAULT 2048,
    max_height INT DEFAULT 2048,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. API设计

#### 生成接口
```java
@PostMapping("/generate")
public ResponseEntity<GeneratePortraitResponse> generate(
    @RequestHeader("X-User-Id") Long userId,
    @Valid @RequestBody GeneratePortraitRequest request)
```

**请求示例：**
```json
{
  "prompt": "日系二次元少女，长发粉发，猫耳，穿洛丽塔裙",
  "negativePrompt": "低质量，模糊，多手指",
  "width": 512,
  "height": 768,
  "stylePreset": "anime",
  "inferenceSteps": 30,
  "samplerName": "euler",
  "seed": -1,
  "count": 1
}
```

**响应示例：**
```json
{
  "taskId": "task_abc123def456",
  "generationId": 123,
  "status": "PENDING",
  "message": "任务已提交",
  "estimatedCompletionTime": "2024-03-04T11:30:00Z"
}
```

#### 进度查询接口
```java
@GetMapping("/progress/{taskId}")
public ResponseEntity<GenerateProgressResponse> getProgress(
    @RequestHeader("X-User-Id") Long userId,
    @PathVariable String taskId)
```

**响应示例：**
```json
{
  "taskId": "task_abc123def456",
  "status": "PROCESSING",
  "progress": 45,
  "message": "正在生成中...",
  "generationTime": 30,
  "queueWaitTime": 15
}
```

### 4. 异步处理架构

```java
@Service
@RequiredArgsConstructor
public class AIPortraitService {

    private final TaskExecutor taskExecutor;
    private final VolcengineService volcengineService;
    private final AIPortraitGenerationRepository generationRepository;
    private final AIPortraitTaskRepository taskRepository;

    public GeneratePortraitResponse createGenerationTask(Long userId, GeneratePortraitRequest request) {
        // 1. 保存生成记录
        AIPortraitGeneration generation = saveGenerationRecord(userId, request);

        // 2. 创建任务记录
        AIPortraitTask task = createTask(generation);

        // 3. 异步执行生成任务
        taskExecutor.execute(() -> processGenerationTask(generation, task));

        // 4. 返回响应
        return buildResponse(generation, task);
    }

    private void processGenerationTask(AIPortraitGeneration generation, AIPortraitTask task) {
        try {
            // 更新任务状态为处理中
            updateTaskStatus(task, "PROCESSING", 10);

            // 调用火山引擎API
            List<String> imageUrls = volcengineService.generateImage(
                generation.getPrompt(),
                generation.getWidth(),
                generation.getHeight(),
                generation.getCount(),
                generation.getSeed()
            );

            // 更新生成结果
            generation.setGeneratedImageUrls(String.join(",", imageUrls));
            generation.setStatus("SUCCESS");
            generationRepository.save(generation);

            // 更新任务状态为完成
            updateTaskStatus(task, "SUCCESS", 100);

        } catch (Exception e) {
            // 处理失败情况
            generation.setStatus("FAILED");
            generation.setErrorMessage(e.getMessage());
            generationRepository.save(generation);

            updateTaskStatus(task, "FAILED", 0);
        }
    }
}
```

### 5. 火山引擎集成

```java
@Service
@Slf4j
public class VolcengineService implements ImageGenerationService {

    @Value("${volcengine.ark.api.key:}")
    private String apiKey;

    @Value("${volcengine.model:doubao-seedream-5-0-260128}")
    private String defaultModel;

    private ArkService arkService;

    public void initialize() {
        if (arkService == null && apiKey != null && !apiKey.isEmpty()) {
            arkService = ArkService.builder()
                .apiKey(apiKey)
                .build();
        }
    }

    @Override
    public List<String> generateImage(String prompt, Integer width, Integer height,
                                    Integer count, Long seed) {
        try {
            initialize();

            GenerateImagesRequest request = GenerateImagesRequest.builder()
                .model(defaultModel)
                .prompt(prompt)
                .size(width + "*" + height)
                .build();

            ImagesResponse response = arkService.generateImages(request);

            return response.getData().stream()
                .map(ImageData::getUrl)
                .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("火山引擎生成失败", e);
            throw new VolcengineException("生成失败: " + e.getMessage());
        }
    }
}
```

### 6. 配置管理

```properties
# application.properties

# 火山引擎配置
volcengine.ark.api.key=your-api-key-here
volcengine.model=doubao-seedream-5-0-260128
volcengine.timeout=30000

# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/writeengine?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# 任务执行器配置
app.task.executor.core-pool-size=5
app.task.executor.max-pool-size=10
app.task.executor.queue-capacity=100
```

### 7. 异常处理

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(VolcengineException.class)
    public ResponseEntity<ErrorResponse> handleVolcengineException(VolcengineException e) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
            .body(new ErrorResponse(e.getErrorCode(), e.getUserFriendlyMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining("; "));

        return ResponseEntity.badRequest()
            .body(new ErrorResponse("VALIDATION_ERROR", message));
    }
}
```

## 决策

### 1. 使用同步API + 异步处理
**决策**：API接口同步返回任务ID，实际生成过程异步执行
**理由**：
- 前端可以快速获得响应，显示任务已提交
- 避免HTTP连接超时问题
- 支持进度查询和状态管理

### 2. 使用火山引擎作为主要AI提供商
**决策**：优先集成火山引擎，后续支持阿里云等其他提供商
**理由**：
- 火山引擎在国内有较好的访问速度和稳定性
- 支持中文提示词，适合二次元图像生成
- 已有基础的集成框架

### 3. 使用简单的用户ID认证
**决策**：使用X-User-Id请求头进行用户识别
**理由**：
- 简化实现，快速上线
- 与现有前端架构兼容
- 后续可以扩展为完整的认证系统

### 4. 使用URL存储生成结果
**决策**：存储图片URL而不是本地文件
**理由**：
- 减少服务器存储压力
- 利用AI提供商的CDN加速
- 简化部署和维护

## 风险 / 权衡

### 风险1：火山引擎API不稳定
**缓解**：
- 实现重试机制
- 添加熔断器模式
- 支持多提供商fallback

### 风险2：生成时间过长
**缓解**：
- 优化提示词预处理
- 实现任务优先级队列
- 添加预估时间算法

### 风险3：Java 8兼容性限制
**缓解**：
- 严格代码审查
- 使用兼容性检查工具
- 充分测试

## 迁移计划

### 阶段1：基础功能实现
1. 实现数据库模型和DAO层
2. 实现基本的API接口
3. 集成火山引擎API
4. 实现异步处理

### 阶段2：功能完善
1. 添加进度查询功能
2. 实现历史记录管理
3. 添加参数验证和异常处理
4. 完善配置管理

### 阶段3：测试和优化
1. 编写单元测试和集成测试
2. 性能优化和压力测试
3. 用户体验优化
4. 监控和日志完善

## 开放问题

1. **图片存储策略**：长期存储在火山引擎还是迁移到自有存储？
2. **成本控制**：如何监控和控制API调用成本？
3. **用户配额**：是否需要限制用户的生成次数？
4. **内容审核**：是否需要添加内容审核机制？

