# Java 8 + 国内大模型快速启动

## 一分钟快速了解

```
环境: Java 8 + Spring Boot 2.7 + MySQL 5.7+
大模型: 阿里云通义 (推荐) 或 百度文心
架构: 异步任务队列 + REST API
```

---

## 核心配置文件

### application.properties

```properties
# Server
server.port=8083
server.servlet.context-path=/

# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/writeengine
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# 核心配置
ai.portrait.default-provider=aliyun
ai.portrait.default-model=wanx-v1
ai.portrait.max-queue-size=100
ai.portrait.task-timeout=600

# 阿里云配置
aliyun.dashscope.api.key=${ALIYUN_API_KEY}
aliyun.portrait.model=wanx-v1

# 日志
logging.level.root=INFO
logging.level.com.example.writemyself=DEBUG
```

### pom.xml (关键部分)

```xml
<parent>
    <version>2.7.14</version>  <!-- ← Java 8 最高支持版本 -->
</parent>

<properties>
    <java.version>1.8</java.version>  <!-- ← 必须是 1.8 -->
</properties>

<dependency>
    <groupId>com.aliyun</groupId>
    <artifactId>alibabacloud-dashscope</artifactId>
    <version>1.0.0</version>  <!-- ← 国内模型 SDK -->
</dependency>
```

---

## 核心代码片段

### 1. 国内模型适配器

```java
@Slf4j
@Service
public class AliyunTongYiService {

    @Value("${aliyun.dashscope.api.key}")
    private String apiKey;

    public List<String> generateImage(String prompt, Integer width, Integer height,
                                     Integer count, Long seed) {
        try {
            ImageGenerationRequest request = new ImageGenerationRequest();
            request.setModel("wanx-v1");
            request.setPrompt(prompt);
            request.setN(count != null ? count : 1);
            request.setSize(width + "x" + height);

            ImageGenerationResponse response = ImageGenerationApi.call(request);

            List<String> imageUrls = new ArrayList<>();
            for (Map<String, Object> image : response.getResult().getImages()) {
                imageUrls.add((String) image.get("url"));
            }

            return imageUrls;
        } catch (Exception e) {
            log.error("生成失败", e);
            throw new RuntimeException("生成失败: " + e.getMessage());
        }
    }
}
```

### 2. 异步任务处理

```java
@Slf4j
@Service
public class AsyncTaskService {

    @Async("portraitTaskExecutor")  // ← Java 8 异步
    public void processTask(String taskId) {
        try {
            // 获取任务
            AIPortraitTask task = taskRepository.findByTaskId(taskId)
                .orElseThrow(() -> new RuntimeException("任务不存在"));

            // 更新为处理中
            task.setStatus(TaskStatus.PROCESSING);
            taskRepository.save(task);

            // 调用模型生成
            List<String> imageUrls = langChainService.generatePortrait(generation);

            // 保存结果
            generation.setStatus(GenerationStatus.SUCCESS);
            generation.setGeneratedImageUrls(imageUrls);
            generationRepository.save(generation);

        } catch (Exception e) {
            log.error("任务处理失败", e);
            // 重试逻辑...
        }
    }
}
```

### 3. REST API 端点

```java
@Slf4j
@RestController
@RequestMapping("/api/ai/portrait")
public class AIPortraitController {

    @PostMapping("/generate")
    public ResponseEntity<GeneratePortraitResponse> generate(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody GeneratePortraitRequest request) {

        GeneratePortraitResponse response = portraitService
            .createGenerationTask(userId, request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/progress/{taskId}")
    public ResponseEntity<GenerateProgressResponse> getProgress(
            @PathVariable String taskId) {

        GenerateProgressResponse response = portraitService
            .getGenerationProgress(taskId);

        return ResponseEntity.ok(response);
    }
}
```

---

## 开发流程

### Step 1: 创建 Entity 类 (5 个)

```java
// 1. AIPortraitGeneration - 生成记录
@Entity
@Table(name = "ai_portrait_generation")
@Data
public class AIPortraitGeneration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String taskId;
    private String prompt;
    // ... 其他字段
}

// 2. AIPortraitTask - 任务状态
// 3. AIPortraitModelConfig - 模型配置
// 4. AIPortraitResourceLibrary - 资源库
// 5. AIPortraitUserPreset - 用户预设
```

### Step 2: 创建 Repository 接口 (3 个)

```java
@Repository
public interface AIPortraitGenerationRepository
    extends JpaRepository<AIPortraitGeneration, Long> {
    Optional<AIPortraitGeneration> findByTaskId(String taskId);
    List<AIPortraitGeneration> findByUserId(Long userId);
}

// 类似创建 AIPortraitTaskRepository
// 和 AIPortraitModelConfigRepository
```

### Step 3: 创建 Service 类 (4 个)

```java
// 1. AIPortraitService - 核心业务
// 2. AsyncTaskService - 异步处理
// 3. AliyunTongYiService - 国内模型 (新增)
// 4. FileStorageService - 文件管理
```

### Step 4: 创建 Controller 类 (1 个)

```java
@RestController
@RequestMapping("/api/ai/portrait")
public class AIPortraitController {
    // 实现 6 个 API 端点
}
```

### Step 5: 测试

```bash
# 生成图片
curl -X POST http://localhost:8083/api/ai/portrait/generate \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -d '{"prompt":"二次元少女", "width":1024, "height":1024}'

# 查询进度
curl http://localhost:8083/api/ai/portrait/progress/550e8400-e29b-41d4-a716-446655440000
```

---

## API 端点总览

| 端点 | 请求方式 | 用途 |
|------|---------|------|
| `/api/ai/portrait/generate` | POST | 创建生成任务 |
| `/api/ai/portrait/progress/{taskId}` | GET | 查询生成进度 |
| `/api/ai/portrait/result/{taskId}` | GET | 获取结果 |
| `/api/ai/portrait/save` | POST | 保存到资源库 |
| `/api/ai/portrait/history` | GET | 查看生成历史 |
| `/api/ai/portrait/models` | GET | 获取可用模型 |

---

## 前端调用示例

```javascript
// Vue 3 + Axios

async function generatePortrait(params) {
  try {
    const response = await axios.post('/api/ai/portrait/generate', params, {
      headers: {
        'X-User-Id': userId,
        'Content-Type': 'application/json'
      }
    });

    const taskId = response.data.taskId;

    // 轮询查询进度
    let progress = 0;
    while (progress < 100) {
      const progressResp = await axios.get(
        `/api/ai/portrait/progress/${taskId}`,
        { headers: { 'X-User-Id': userId } }
      );

      progress = progressResp.data.progress;
      updateProgressBar(progress);

      if (progress === 100) {
        displayImages(progressResp.data.imageUrls);
        break;
      }

      // 等待 2 秒后重新查询
      await sleep(2000);
    }
  } catch (error) {
    showError('生成失败: ' + error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 数据库初始化

```sql
-- 创建数据库
CREATE DATABASE writeengine DEFAULT CHARACTER SET utf8mb4;

-- 创建生成记录表
CREATE TABLE ai_portrait_generation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    task_id VARCHAR(64) NOT NULL UNIQUE,
    prompt TEXT NOT NULL,
    provider VARCHAR(50) DEFAULT 'aliyun',
    status VARCHAR(20) DEFAULT 'PENDING',
    generated_image_urls TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_user_id (user_id),
    KEY idx_task_id (task_id),
    KEY idx_status (status)
);

-- 创建任务表
CREATE TABLE ai_portrait_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id VARCHAR(64) NOT NULL UNIQUE,
    generation_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    progress INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_task_id (task_id),
    KEY idx_status (status)
);

-- 创建模型配置表
CREATE TABLE ai_portrait_model_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    model_name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_provider (provider),
    KEY idx_is_active (is_active)
);
```

---

## 关键要点

✅ **使用 Spring Boot 2.7.x** - Java 8 最高支持版本
✅ **异步任务处理** - 避免 HTTP 超时
✅ **国内模型优先** - 阿里云通义最稳定
✅ **错误自动重试** - 3 次重试机制
✅ **完整的进度查询** - 前端实时显示生成进度

---

## 故障排除

| 问题 | 解决方案 |
|------|---------|
| Java 版本错误 | 检查 `java -version`，确保是 1.8 |
| Spring Boot 版本过高 | 改用 `spring-boot-starter-parent 2.7.14` |
| API Key 无效 | 确认 `ALIYUN_API_KEY` 环境变量已设置 |
| 数据库连接失败 | 检查 MySQL 是否启动，用户名密码是否正确 |
| 异步任务未执行 | 检查 `@EnableAsync` 是否添加到启动类 |

---

**现在可以开始开发了！** 🚀

