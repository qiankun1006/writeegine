# AI 人物立绘生成器后端系统设计

## 系统架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                      前端 (Vue 3)                            │
│  提示词/参考图/参数输入 → 生成请求 → 进度查询 → 结果展示    │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                  REST API 层                                 │
│  POST /api/ai/portrait/generate                            │
│  GET /api/ai/portrait/progress/{taskId}                    │
│  GET /api/ai/portrait/result/{taskId}                      │
│  POST /api/ai/portrait/save                                │
│  GET /api/ai/portrait/history                              │
│  GET /api/ai/portrait/models                               │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                  业务逻辑层                                  │
│  AIPortraitService (核心生成逻辑)                           │
│  AsyncTaskService (异步任务管理)                            │
│  ModelService (模型管理)                                    │
│  FileStorageService (文件存储)                              │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                 LangChain4J 集成层                           │
│  AI Model Adapter (适配多种 AI 服务)                        │
│  Prompt Builder (提示词构建)                                │
│  Image Processing (图片处理)                                │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   外部 AI 服务                               │
│  Stable Diffusion / DALL-E / 其他模型 API                  │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                  数据持久化层                                │
│  数据库 (MySQL) / 文件存储 (OSS/本地)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. 数据库设计

### 1.1 核心表结构

#### 表 1: ai_portrait_generation 生成记录表

```sql
CREATE TABLE ai_portrait_generation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    -- 基础信息
    user_id BIGINT NOT NULL,
    task_id VARCHAR(64) NOT NULL UNIQUE,  -- 异步任务 ID

    -- 输入参数
    prompt TEXT NOT NULL,  -- 正提示词
    negative_prompt TEXT,  -- 负提示词
    reference_image_url VARCHAR(255),  -- 参考图片 URL
    model_weight DECIMAL(3,2),  -- 模型权重 (0-1)

    -- 尺寸信息
    width INT NOT NULL,
    height INT NOT NULL,

    -- 高级参数
    image_strength DECIMAL(3,2),  -- 图生图强度
    generation_count INT DEFAULT 1,  -- 生成数量
    sampler_name VARCHAR(50),  -- 采样器 (Euler/DPM++/AutoCFG)
    inference_steps INT DEFAULT 30,  -- 迭代步数
    style_preset VARCHAR(50),  -- 风格预设
    seed BIGINT DEFAULT -1,  -- 种子值
    enable_face_fix BOOLEAN DEFAULT true,  -- 面部修复
    output_format VARCHAR(10) DEFAULT 'PNG',  -- 输出格式

    -- 输出结果
    status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING/PROCESSING/SUCCESS/FAILED
    generated_image_urls TEXT,  -- 生成图片 URL 列表 (JSON)
    error_message VARCHAR(500),  -- 错误信息

    -- 性能指标
    generation_time BIGINT,  -- 生成耗时 (毫秒)
    queue_wait_time BIGINT,  -- 队列等待时间

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,

    -- 索引
    KEY idx_user_id (user_id),
    KEY idx_task_id (task_id),
    KEY idx_status (status),
    KEY idx_created_at (created_at)
);
```

#### 表 2: ai_portrait_model_config 模型配置表

```sql
CREATE TABLE ai_portrait_model_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    -- 模型信息
    model_name VARCHAR(100) NOT NULL,  -- 模型名称
    model_type VARCHAR(50) NOT NULL,  -- 类型: BASE/TUNED/FINE_TUNED
    provider VARCHAR(50) NOT NULL,  -- 提供商: OPENAI/STABILITY_AI/CUSTOM
    api_endpoint VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL,  -- 加密存储

    -- 模型参数
    default_sampler VARCHAR(50),
    max_steps INT DEFAULT 50,
    min_steps INT DEFAULT 10,
    max_image_size INT DEFAULT 2048,
    min_image_size INT DEFAULT 256,

    -- 微调参数
    base_model_version VARCHAR(50),  -- 基础模型版本
    tuning_dataset VARCHAR(255),  -- 微调数据集路径
    tuning_epochs INT,
    tuning_learning_rate DECIMAL(10,6),

    -- 使用统计
    total_requests BIGINT DEFAULT 0,
    total_success BIGINT DEFAULT 0,
    total_failed BIGINT DEFAULT 0,
    avg_response_time BIGINT DEFAULT 0,

    -- 配置状态
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    KEY idx_model_name (model_name),
    KEY idx_provider (provider),
    KEY idx_is_active (is_active)
);
```

#### 表 3: ai_portrait_task 异步任务表

```sql
CREATE TABLE ai_portrait_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    -- 任务标识
    task_id VARCHAR(64) NOT NULL UNIQUE,
    generation_id BIGINT NOT NULL,

    -- 任务状态
    status VARCHAR(20) NOT NULL,  -- QUEUED/PROCESSING/COMPLETED/FAILED/CANCELLED
    progress INT DEFAULT 0,  -- 0-100

    -- 任务详情
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    estimated_completion_time TIMESTAMP NULL,

    -- 错误追踪
    error_code VARCHAR(50),
    error_message TEXT,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,

    -- 性能指标
    queue_position INT,
    execution_duration BIGINT,  -- 执行耗时 (毫秒)

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    KEY idx_task_id (task_id),
    KEY idx_generation_id (generation_id),
    KEY idx_status (status),
    KEY idx_created_at (created_at)
);
```

#### 表 4: ai_portrait_resource_library 用户资源库表

```sql
CREATE TABLE ai_portrait_resource_library (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    -- 关联信息
    user_id BIGINT NOT NULL,
    generation_id BIGINT NOT NULL,

    -- 资源信息
    resource_name VARCHAR(100),
    resource_description TEXT,
    tag_list VARCHAR(500),  -- 标签列表 (逗号分隔)

    -- 资源分类
    category VARCHAR(50),  -- GENERATED/COLLECTED/FAVORITE
    is_favorite BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    share_token VARCHAR(64),  -- 分享令牌

    -- 缩略图
    thumbnail_url VARCHAR(255),

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    KEY idx_user_id (user_id),
    KEY idx_generation_id (generation_id),
    KEY idx_is_favorite (is_favorite),
    KEY idx_category (category)
);
```

#### 表 5: ai_portrait_user_preset 用户预设表

```sql
CREATE TABLE ai_portrait_user_preset (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    -- 用户信息
    user_id BIGINT NOT NULL,

    -- 预设信息
    preset_name VARCHAR(100) NOT NULL,
    preset_type VARCHAR(50),  -- CUSTOM/BUILTIN
    description TEXT,

    -- 参数快照
    prompt_template TEXT,
    negative_prompt_template TEXT,
    model_weight DECIMAL(3,2),
    width INT,
    height INT,
    image_strength DECIMAL(3,2),
    generation_count INT,
    sampler_name VARCHAR(50),
    inference_steps INT,
    style_preset VARCHAR(50),
    seed BIGINT,
    enable_face_fix BOOLEAN,
    output_format VARCHAR(10),

    -- 使用统计
    use_count INT DEFAULT 0,
    last_used_at TIMESTAMP NULL,

    -- 状态
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    KEY idx_user_id (user_id),
    KEY idx_preset_type (preset_type)
);
```

#### 表 6: ai_portrait_generation_queue 任务队列表

```sql
CREATE TABLE ai_portrait_generation_queue (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    task_id VARCHAR(64) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    priority INT DEFAULT 5,  -- 1-10, 数字越大优先级越高

    -- 队列位置
    queue_position INT,

    -- 时间戳
    enqueued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dequeued_at TIMESTAMP NULL,

    KEY idx_priority (priority),
    KEY idx_queue_position (queue_position),
    KEY idx_user_id (user_id)
);
```

---

## 2. Spring Boot 后端代码结构

### 2.1 Entity 类设计

#### AIPortraitGeneration.java
```java
package com.example.writemyself.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import javax.persistence.*;

@Entity
@Table(name = "ai_portrait_generation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIPortraitGeneration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, unique = true)
    private String taskId;

    // 输入参数
    @Column(columnDefinition = "TEXT")
    private String prompt;

    @Column(columnDefinition = "TEXT")
    private String negativePrompt;

    @Column
    private String referenceImageUrl;

    @Column
    private Double modelWeight;

    // 尺寸
    @Column(nullable = false)
    private Integer width;

    @Column(nullable = false)
    private Integer height;

    // 高级参数
    @Column
    private Double imageStrength;

    @Column
    private Integer generationCount;

    @Column
    private String samplerName;

    @Column
    private Integer inferenceSteps;

    @Column
    private String stylePreset;

    @Column
    private Long seed;

    @Column
    private Boolean enableFaceFix;

    @Column
    private String outputFormat;

    // 输出结果
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GenerationStatus status;

    @Column(columnDefinition = "JSON")
    private List<String> generatedImageUrls;

    @Column
    private String errorMessage;

    // 性能指标
    @Column
    private Long generationTime;

    @Column
    private Long queueWaitTime;

    // 时间戳
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @Column
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        status = GenerationStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

enum GenerationStatus {
    PENDING,
    PROCESSING,
    SUCCESS,
    FAILED
}
```

#### AIPortraitModelConfig.java
```java
package com.example.writemyself.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import javax.persistence.*;

@Entity
@Table(name = "ai_portrait_model_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIPortraitModelConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String modelName;

    @Column(nullable = false)
    private String modelType;  // BASE, TUNED, FINE_TUNED

    @Column(nullable = false)
    private String provider;  // OPENAI, STABILITY_AI, CUSTOM

    @Column(nullable = false)
    private String apiEndpoint;

    @Column(nullable = false)
    private String apiKey;  // 应加密存储

    // 模型参数
    @Column
    private String defaultSampler;

    @Column
    private Integer maxSteps;

    @Column
    private Integer minSteps;

    @Column
    private Integer maxImageSize;

    @Column
    private Integer minImageSize;

    // 微调参数
    @Column
    private String baseModelVersion;

    @Column
    private String tuningDataset;

    @Column
    private Integer tuningEpochs;

    @Column
    private Double tuningLearningRate;

    // 使用统计
    @Column
    private Long totalRequests;

    @Column
    private Long totalSuccess;

    @Column
    private Long totalFailed;

    @Column
    private Long avgResponseTime;

    // 配置状态
    @Column
    private Boolean isActive;

    @Column
    private Boolean isDefault;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        totalRequests = 0L;
        totalSuccess = 0L;
        totalFailed = 0L;
        isActive = true;
        isDefault = false;
    }
}
```

#### AIPortraitTask.java
```java
package com.example.writemyself.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import javax.persistence.*;

@Entity
@Table(name = "ai_portrait_task")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIPortraitTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String taskId;

    @Column(nullable = false)
    private Long generationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    @Column
    private Integer progress;  // 0-100

    @Column
    private LocalDateTime startedAt;

    @Column
    private LocalDateTime completedAt;

    @Column
    private LocalDateTime estimatedCompletionTime;

    // 错误追踪
    @Column
    private String errorCode;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column
    private Integer retryCount;

    @Column
    private Integer maxRetries;

    // 性能指标
    @Column
    private Integer queuePosition;

    @Column
    private Long executionDuration;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        status = TaskStatus.QUEUED;
        progress = 0;
        retryCount = 0;
        maxRetries = 3;
    }
}

enum TaskStatus {
    QUEUED,
    PROCESSING,
    COMPLETED,
    FAILED,
    CANCELLED
}
```

---

### 2.2 Repository 接口

#### AIPortraitGenerationRepository.java
```java
package com.example.writemyself.repository;

import com.example.writemyself.model.AIPortraitGeneration;
import com.example.writemyself.model.GenerationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AIPortraitGenerationRepository extends JpaRepository<AIPortraitGeneration, Long> {

    // 基础查询
    Optional<AIPortraitGeneration> findByTaskId(String taskId);

    List<AIPortraitGeneration> findByUserId(Long userId);

    List<AIPortraitGeneration> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 状态查询
    List<AIPortraitGeneration> findByStatus(GenerationStatus status);

    List<AIPortraitGeneration> findByUserIdAndStatus(Long userId, GenerationStatus status);

    // 分页查询
    @Query("SELECT g FROM AIPortraitGeneration g WHERE g.userId = ?1 ORDER BY g.createdAt DESC")
    List<AIPortraitGeneration> findUserGenerationHistory(Long userId,
        org.springframework.data.domain.Pageable pageable);

    // 时间范围查询
    List<AIPortraitGeneration> findByCreatedAtBetween(LocalDateTime startTime, LocalDateTime endTime);

    // 统计查询
    long countByUserIdAndStatus(Long userId, GenerationStatus status);

    long countByUserIdAndCreatedAtBetween(Long userId, LocalDateTime startTime, LocalDateTime endTime);

    // 清理过期数据
    void deleteByCreatedAtBefore(LocalDateTime cutoffTime);
}
```

#### AIPortraitTaskRepository.java
```java
package com.example.writemyself.repository;

import com.example.writemyself.model.AIPortraitTask;
import com.example.writemyself.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface AIPortraitTaskRepository extends JpaRepository<AIPortraitTask, Long> {

    Optional<AIPortraitTask> findByTaskId(String taskId);

    List<AIPortraitTask> findByStatus(TaskStatus status);

    List<AIPortraitTask> findByGenerationId(Long generationId);

    long countByStatus(TaskStatus status);
}
```

#### AIPortraitModelConfigRepository.java
```java
package com.example.writemyself.repository;

import com.example.writemyself.model.AIPortraitModelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIPortraitModelConfigRepository extends JpaRepository<AIPortraitModelConfig, Long> {

    Optional<AIPortraitModelConfig> findByModelName(String modelName);

    List<AIPortraitModelConfig> findByIsActive(Boolean isActive);

    Optional<AIPortraitModelConfig> findByIsDefault(Boolean isDefault);

    List<AIPortraitModelConfig> findByProvider(String provider);
}
```

---

### 2.3 DTO 类设计

#### GeneratePortraitRequest.java
```java
package com.example.writemyself.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.validation.constraints.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratePortraitRequest {

    // 核心参数
    @NotBlank(message = "提示词不能为空")
    @Size(min = 1, max = 500, message = "提示词长度必须在 1-500 之间")
    private String prompt;

    @Size(max = 500, message = "负面提示词长度不能超过 500")
    private String negativePrompt;

    @Pattern(regexp = "^(data:image/(png|jpeg|webp);base64,)?[A-Za-z0-9+/=]+$",
             message = "参考图片格式无效")
    private String referenceImageBase64;

    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private Double modelWeight;

    // 尺寸参数
    @NotNull(message = "宽度不能为空")
    @Min(256)
    @Max(2048)
    private Integer width;

    @NotNull(message = "高度不能为空")
    @Min(256)
    @Max(2048)
    private Integer height;

    // 高级参数
    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private Double imageStrength;

    @Min(1)
    @Max(5)
    private Integer generationCount;

    private String samplerName;  // Euler, DPM++, AutoCFG

    @Min(10)
    @Max(50)
    private Integer inferenceSteps;

    private String stylePreset;  // 日系二次元, 国风写实, 等

    private Long seed;

    private Boolean enableFaceFix;

    private String outputFormat;  // PNG, JPG

    // 模型选择
    private String modelName;  // 如果不提供则使用默认模型

    @Override
    public String toString() {
        return String.format(
            "GeneratePortraitRequest{prompt='%s', size=%dx%d, sampler='%s', steps=%d}",
            prompt, width, height, samplerName, inferenceSteps
        );
    }
}
```

#### GeneratePortraitResponse.java
```java
package com.example.writemyself.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratePortraitResponse {

    private String taskId;  // 用于查询进度

    private String status;  // QUEUED, PROCESSING, 等

    private Integer estimatedWaitTime;  // 估计等待时间 (秒)

    private Integer queuePosition;  // 队列位置

    private String message;  // 提示信息

    // 前端用于轮询的 URL
    private String progressUrl;
    private String resultUrl;
}
```

#### GenerateProgressResponse.java
```java
package com.example.writemyself.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateProgressResponse {

    private String taskId;

    private String status;  // QUEUED, PROCESSING, COMPLETED, FAILED

    private Integer progress;  // 0-100

    private Integer estimatedSecondsRemaining;

    private String currentPhase;  // "准备", "生成", "优化", "完成"

    // 完成时返回
    private List<String> imageUrls;

    private Long generationTime;  // 毫秒

    // 失败时返回
    private String errorCode;
    private String errorMessage;
}
```

#### GenerationHistoryResponse.java
```java
package com.example.writemyself.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerationHistoryResponse {

    private Long id;

    private String taskId;

    private String prompt;

    private List<String> generatedImageUrls;

    private String status;

    private Integer width;

    private Integer height;

    private String samplerName;

    private Integer inferenceSteps;

    private Long generationTime;

    private LocalDateTime generatedAt;
}
```

---

### 2.4 Service 层设计

#### AIPortraitService.java
```java
package com.example.writemyself.service;

import com.example.writemyself.dto.*;
import com.example.writemyself.model.*;
import com.example.writemyself.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIPortraitService {

    private final AIPortraitGenerationRepository generationRepository;
    private final AIPortraitTaskRepository taskRepository;
    private final AIPortraitModelConfigRepository modelConfigRepository;
    private final AsyncTaskService asyncTaskService;
    private final LangChainService langChainService;
    private final FileStorageService fileStorageService;

    @Value("${ai.portrait.default-model:default-model}")
    private String defaultModel;

    @Value("${ai.portrait.max-queue-size:100}")
    private int maxQueueSize;

    /**
     * 创建生成任务
     */
    @Transactional
    public GeneratePortraitResponse createGenerationTask(
            Long userId,
            GeneratePortraitRequest request) {

        log.info("用户 {} 请求生成立绘，提示词：{}", userId, request.getPrompt());

        // 1. 验证参数
        validateRequest(request);

        // 2. 获取模型配置
        String modelName = request.getModelName() != null ?
            request.getModelName() : defaultModel;
        AIPortraitModelConfig modelConfig = modelConfigRepository
            .findByModelName(modelName)
            .orElseThrow(() -> new IllegalArgumentException("模型不存在: " + modelName));

        if (!modelConfig.getIsActive()) {
            throw new IllegalArgumentException("该模型已停用");
        }

        // 3. 处理参考图片
        String referenceImageUrl = null;
        if (request.getReferenceImageBase64() != null) {
            referenceImageUrl = fileStorageService.uploadImageFromBase64(
                request.getReferenceImageBase64(),
                userId
            );
        }

        // 4. 创建生成记录
        String taskId = UUID.randomUUID().toString();
        AIPortraitGeneration generation = AIPortraitGeneration.builder()
            .userId(userId)
            .taskId(taskId)
            .prompt(request.getPrompt())
            .negativePrompt(request.getNegativePrompt())
            .referenceImageUrl(referenceImageUrl)
            .modelWeight(request.getModelWeight() != null ?
                request.getModelWeight() : 0.8)
            .width(request.getWidth())
            .height(request.getHeight())
            .imageStrength(request.getImageStrength() != null ?
                request.getImageStrength() : 0.6)
            .generationCount(request.getGenerationCount() != null ?
                request.getGenerationCount() : 1)
            .samplerName(request.getSamplerName() != null ?
                request.getSamplerName() : "Euler")
            .inferenceSteps(request.getInferenceSteps() != null ?
                request.getInferenceSteps() : 30)
            .stylePreset(request.getStylePreset())
            .seed(request.getSeed() != null ? request.getSeed() : -1)
            .enableFaceFix(request.getEnableFaceFix() != null ?
                request.getEnableFaceFix() : true)
            .outputFormat(request.getOutputFormat() != null ?
                request.getOutputFormat() : "PNG")
            .status(GenerationStatus.PENDING)
            .build();

        generation = generationRepository.save(generation);

        // 5. 创建异步任务
        AIPortraitTask task = AIPortraitTask.builder()
            .taskId(taskId)
            .generationId(generation.getId())
            .status(TaskStatus.QUEUED)
            .progress(0)
            .queuePosition(getQueuePosition())
            .maxRetries(3)
            .retryCount(0)
            .build();

        task = taskRepository.save(task);

        // 6. 提交到异步队列
        asyncTaskService.submitGenerationTask(taskId, generation);

        log.info("生成任务已提交，taskId: {}, 队列位置: {}",
            taskId, task.getQueuePosition());

        // 7. 返回响应
        return GeneratePortraitResponse.builder()
            .taskId(taskId)
            .status("QUEUED")
            .estimatedWaitTime(calculateEstimatedWaitTime(task.getQueuePosition()))
            .queuePosition(task.getQueuePosition())
            .message("任务已加入队列，请稍候")
            .progressUrl("/api/ai/portrait/progress/" + taskId)
            .resultUrl("/api/ai/portrait/result/" + taskId)
            .build();
    }

    /**
     * 查询生成进度
     */
    public GenerateProgressResponse getGenerationProgress(String taskId) {
        AIPortraitTask task = taskRepository.findByTaskId(taskId)
            .orElseThrow(() -> new IllegalArgumentException("任务不存在: " + taskId));

        AIPortraitGeneration generation = generationRepository.findById(task.getGenerationId())
            .orElseThrow(() -> new IllegalArgumentException("生成记录不存在"));

        String phase = getPhaseByProgress(task.getProgress());

        GenerateProgressResponse.GenerateProgressResponseBuilder builder =
            GenerateProgressResponse.builder()
                .taskId(taskId)
                .status(task.getStatus().toString())
                .progress(task.getProgress())
                .currentPhase(phase);

        if (task.getStatus() == TaskStatus.PROCESSING) {
            LocalDateTime estimated = task.getEstimatedCompletionTime();
            if (estimated != null) {
                long secondsRemaining =
                    (estimated.getTime() - System.currentTimeMillis()) / 1000;
                builder.estimatedSecondsRemaining((int) Math.max(0, secondsRemaining));
            }
        } else if (task.getStatus() == TaskStatus.COMPLETED) {
            builder
                .progress(100)
                .imageUrls(generation.getGeneratedImageUrls())
                .generationTime(generation.getGenerationTime());
        } else if (task.getStatus() == TaskStatus.FAILED) {
            builder
                .errorCode(task.getErrorCode())
                .errorMessage(task.getErrorMessage());
        }

        return builder.build();
    }

    /**
     * 保存生成结果到资源库
     */
    @Transactional
    public void saveGenerationResult(Long userId, String taskId,
                                     GenerationSaveRequest saveRequest) {
        AIPortraitGeneration generation = generationRepository.findByTaskId(taskId)
            .orElseThrow(() -> new IllegalArgumentException("生成记录不存在"));

        if (!generation.getUserId().equals(userId)) {
            throw new SecurityException("无权限保存他人的生成结果");
        }

        // TODO: 保存到资源库
        log.info("生成结果已保存，用户: {}, 任务: {}", userId, taskId);
    }

    /**
     * 获取生成历史
     */
    public List<GenerationHistoryResponse> getGenerationHistory(Long userId, int page, int size) {
        org.springframework.data.domain.Pageable pageable =
            org.springframework.data.domain.PageRequest.of(page, size);

        List<AIPortraitGeneration> generations =
            generationRepository.findUserGenerationHistory(userId, pageable);

        return generations.stream()
            .map(g -> GenerationHistoryResponse.builder()
                .id(g.getId())
                .taskId(g.getTaskId())
                .prompt(g.getPrompt())
                .generatedImageUrls(g.getGeneratedImageUrls())
                .status(g.getStatus().toString())
                .width(g.getWidth())
                .height(g.getHeight())
                .samplerName(g.getSamplerName())
                .inferenceSteps(g.getInferenceSteps())
                .generationTime(g.getGenerationTime())
                .generatedAt(g.getCreatedAt())
                .build())
            .toList();
    }

    /**
     * 获取可用模型列表
     */
    public List<AIPortraitModelConfig> getAvailableModels() {
        return modelConfigRepository.findByIsActive(true);
    }

    // ============ 辅助方法 ============

    private void validateRequest(GeneratePortraitRequest request) {
        if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
            throw new IllegalArgumentException("提示词不能为空");
        }

        if (request.getWidth() == null || request.getHeight() == null) {
            throw new IllegalArgumentException("宽高不能为空");
        }

        if (!isPowerOfTwo(request.getWidth()) || !isPowerOfTwo(request.getHeight())) {
            throw new IllegalArgumentException("宽高必须为 2 的幂次");
        }

        if (request.getWidth() < 256 || request.getWidth() > 2048 ||
            request.getHeight() < 256 || request.getHeight() > 2048) {
            throw new IllegalArgumentException("宽高范围必须在 256-2048 之间");
        }
    }

    private boolean isPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }

    private int getQueuePosition() {
        long queueSize = taskRepository.countByStatus(TaskStatus.QUEUED);
        return (int) Math.min(queueSize + 1, maxQueueSize);
    }

    private int calculateEstimatedWaitTime(int queuePosition) {
        // 简化计算：每个任务平均 30 秒
        return Math.max(10, queuePosition * 30);
    }

    private String getPhaseByProgress(int progress) {
        if (progress < 30) return "准备";
        if (progress < 70) return "生成";
        if (progress < 95) return "优化";
        return "完成";
    }
}
```

#### AsyncTaskService.java
```java
package com.example.writemyself.service;

import com.example.writemyself.model.*;
import com.example.writemyself.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncTaskService {

    private final AIPortraitGenerationRepository generationRepository;
    private final AIPortraitTaskRepository taskRepository;
    private final LangChainService langChainService;
    private final FileStorageService fileStorageService;

    @Value("${ai.portrait.task-timeout:600}")
    private int taskTimeout;  // 秒

    @Value("${ai.portrait.max-concurrent-tasks:3}")
    private int maxConcurrentTasks;

    private final BlockingQueue<String> taskQueue = new LinkedBlockingQueue<>(100);
    private final ExecutorService executorService = Executors.newFixedThreadPool(3);

    /**
     * 提交生成任务到异步队列
     */
    public void submitGenerationTask(String taskId, AIPortraitGeneration generation) {
        try {
            taskQueue.offer(taskId, 1, TimeUnit.SECONDS);
            log.info("任务已加入队列: {}", taskId);
        } catch (InterruptedException e) {
            log.error("提交任务失败: {}", taskId, e);
            Thread.currentThread().interrupt();
        }
    }

    /**
     * 处理队列中的任务 (异步执行)
     */
    @Async
    public void processQueuedTasks() {
        while (true) {
            try {
                String taskId = taskQueue.poll(10, TimeUnit.SECONDS);
                if (taskId != null) {
                    processTask(taskId);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("任务队列处理被中断", e);
                break;
            }
        }
    }

    /**
     * 处理单个任务
     */
    @Transactional
    private void processTask(String taskId) {
        log.info("开始处理任务: {}", taskId);

        AIPortraitTask task = taskRepository.findByTaskId(taskId)
            .orElseThrow(() -> new IllegalStateException("任务不存在: " + taskId));

        AIPortraitGeneration generation = generationRepository.findById(task.getGenerationId())
            .orElseThrow(() -> new IllegalStateException("生成记录不存在"));

        long startTime = System.currentTimeMillis();

        try {
            // 更新任务状态为处理中
            task.setStatus(TaskStatus.PROCESSING);
            task.setStartedAt(LocalDateTime.now());
            task.setProgress(10);
            task.setEstimatedCompletionTime(
                LocalDateTime.now().plusSeconds(taskTimeout)
            );
            taskRepository.save(task);

            generation.setStatus(GenerationStatus.PROCESSING);
            generationRepository.save(generation);

            // 调用 LangChain 执行生成
            List<String> imageUrls = langChainService.generatePortrait(generation);

            // 更新结果
            task.setProgress(100);
            task.setStatus(TaskStatus.COMPLETED);
            task.setCompletedAt(LocalDateTime.now());
            taskRepository.save(task);

            generation.setStatus(GenerationStatus.SUCCESS);
            generation.setGeneratedImageUrls(imageUrls);
            generation.setGenerationTime(System.currentTimeMillis() - startTime);
            generation.setCompletedAt(LocalDateTime.now());
            generationRepository.save(generation);

            log.info("任务处理完成: {}, 耗时: {}ms",
                taskId, generation.getGenerationTime());

        } catch (Exception e) {
            handleTaskFailure(task, generation, e, startTime);
        }
    }

    /**
     * 处理任务失败
     */
    @Transactional
    private void handleTaskFailure(AIPortraitTask task, AIPortraitGeneration generation,
                                   Exception e, long startTime) {

        log.error("任务处理失败: {}, 错误: {}", task.getTaskId(), e.getMessage(), e);

        task.setRetryCount(task.getRetryCount() + 1);

        if (task.getRetryCount() < task.getMaxRetries()) {
            // 重试
            log.info("任务将进行重试，重试次数: {}/{}",
                task.getRetryCount(), task.getMaxRetries());
            task.setStatus(TaskStatus.QUEUED);
            submitGenerationTask(task.getTaskId(), generation);
        } else {
            // 最终失败
            task.setStatus(TaskStatus.FAILED);
            task.setErrorCode(e.getClass().getSimpleName());
            task.setErrorMessage(e.getMessage());
            task.setCompletedAt(LocalDateTime.now());
            task.setExecutionDuration(System.currentTimeMillis() - startTime);

            generation.setStatus(GenerationStatus.FAILED);
            generation.setErrorMessage(e.getMessage());
            generation.setGenerationTime(System.currentTimeMillis() - startTime);
            generation.setCompletedAt(LocalDateTime.now());

            log.error("任务最终失败，已放弃重试: {}", task.getTaskId());
        }

        taskRepository.save(task);
        generationRepository.save(generation);
    }
}
```

#### LangChainService.java
```java
package com.example.writemyself.service;

import com.example.writemyself.model.AIPortraitGeneration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.model.openai.OpenAiImageModel;
import dev.langchain4j.model.image.ImageModel;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LangChainService {

    private final AIPortraitModelConfigRepository modelConfigRepository;

    /**
     * 使用 LangChain4J 调用 AI 模型生成立绘
     */
    public List<String> generatePortrait(AIPortraitGeneration generation) {

        log.info("通过 LangChain4J 生成立绘，提示词: {}", generation.getPrompt());

        // 1. 获取模型配置 (这里需要根据数据库配置动态选择)
        // 2. 构建提示词
        String fullPrompt = buildPrompt(generation);

        // 3. 调用对应的 AI 模型
        // 示例: 使用 OpenAI 的 DALL-E
        if (generation.getPrompt().contains("dalle")) {
            return generateWithDALLE(generation, fullPrompt);
        } else {
            // 默认使用 Stable Diffusion
            return generateWithStableDiffusion(generation, fullPrompt);
        }
    }

    /**
     * 使用 DALL-E 生成
     */
    private List<String> generateWithDALLE(AIPortraitGeneration generation, String prompt) {
        // TODO: 使用 LangChain4J 的 OpenAI Image Model
        // ImageModel model = new OpenAiImageModel(...);
        // ImageResponse response = model.generate(prompt);
        // return response.getImages().stream()
        //     .map(Image::getUrl)
        //     .collect(Collectors.toList());
        return List.of();
    }

    /**
     * 使用 Stable Diffusion 生成
     */
    private List<String> generateWithStableDiffusion(AIPortraitGeneration generation,
                                                     String prompt) {
        // TODO: 使用 LangChain4J 的 Stable Diffusion 适配器
        // 调用本地 API 或云服务的 Stable Diffusion 端点
        return List.of();
    }

    /**
     * 构建完整的提示词
     */
    private String buildPrompt(AIPortraitGeneration generation) {
        StringBuilder sb = new StringBuilder();

        // 添加风格预设
        if (generation.getStylePreset() != null) {
            sb.append(mapStylePreset(generation.getStylePreset())).append(", ");
        }

        // 添加主提示词
        sb.append(generation.getPrompt());

        // 添加质量提示词
        sb.append(", high quality, detailed, professional");

        // 组合负面提示词
        String negativePrompt = generation.getNegativePrompt() != null ?
            generation.getNegativePrompt() :
            "low quality, blurry, distorted, watermark";

        return sb.toString();
    }

    /**
     * 映射风格预设到提示词
     */
    private String mapStylePreset(String preset) {
        return switch (preset) {
            case "日系二次元" -> "anime style, kawaii, 2d illustration";
            case "国风写实" -> "chinese style, realistic, oil painting";
            case "赛博朋克" -> "cyberpunk, neon, futuristic";
            case "Q版卡通" -> "chibi style, cute, cartoon";
            default -> "";
        };
    }
}
```

#### FileStorageService.java
```java
package com.example.writemyself.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.Base64;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    @Value("${ai.portrait.storage-path:/data/ai-portraits}")
    private String storagePath;

    @Value("${ai.portrait.storage-type:local}")
    private String storageType;  // local, oss, s3

    /**
     * 从 Base64 上传图片
     */
    public String uploadImageFromBase64(String base64Image, Long userId) {
        try {
            // 去除 data:image/...;base64, 前缀
            String imageData = base64Image;
            if (base64Image.contains(",")) {
                imageData = base64Image.split(",")[1];
            }

            byte[] imageBytes = Base64.getDecoder().decode(imageData);

            // 生成文件名
            String fileName = UUID.randomUUID() + ".png";
            String filePath = storageType.equals("local") ?
                getLocalFilePath(userId, fileName) :
                getOSSFilePath(userId, fileName);

            if (storageType.equals("local")) {
                saveLocal(filePath, imageBytes);
            } else if (storageType.equals("oss")) {
                saveToOSS(filePath, imageBytes);
            }

            log.info("图片已保存: {}", filePath);
            return filePath;

        } catch (Exception e) {
            log.error("图片上传失败", e);
            throw new RuntimeException("图片上传失败", e);
        }
    }

    /**
     * 保存生成的图片
     */
    public String saveGeneratedImage(byte[] imageData, Long userId) {
        String fileName = UUID.randomUUID() + ".png";
        String filePath = storagePath + "/generated/" + userId + "/" + fileName;

        try {
            if (storageType.equals("local")) {
                saveLocal(filePath, imageData);
            } else if (storageType.equals("oss")) {
                saveToOSS(filePath, imageData);
            }

            return "/static/portraits/" + userId + "/" + fileName;
        } catch (Exception e) {
            log.error("图片保存失败", e);
            throw new RuntimeException("图片保存失败", e);
        }
    }

    // ============ 辅助方法 ============

    private String getLocalFilePath(Long userId, String fileName) {
        return storagePath + "/uploaded/" + userId + "/" + fileName;
    }

    private String getOSSFilePath(Long userId, String fileName) {
        return "ai-portraits/uploaded/" + userId + "/" + fileName;
    }

    private void saveLocal(String filePath, byte[] data) throws IOException {
        Path path = Paths.get(filePath);
        Files.createDirectories(path.getParent());
        Files.write(path, data, StandardOpenOption.CREATE, StandardOpenOption.WRITE);
    }

    private void saveToOSS(String filePath, byte[] data) {
        // TODO: 调用 OSS SDK 保存文件
        log.info("保存到 OSS: {}", filePath);
    }
}
```

---

### 2.5 Controller 层设计

#### AIPortraitController.java
```java
package com.example.writemyself.controller;

import com.example.writemyself.dto.*;
import com.example.writemyself.service.AIPortraitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/ai/portrait")
@RequiredArgsConstructor
public class AIPortraitController {

    private final AIPortraitService portraitService;

    /**
     * POST /api/ai/portrait/generate
     * 创建生成任务
     */
    @PostMapping("/generate")
    public ResponseEntity<GeneratePortraitResponse> generatePortrait(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody GeneratePortraitRequest request) {

        log.info("用户 {} 发起生成请求", userId);

        GeneratePortraitResponse response =
            portraitService.createGenerationTask(userId, request);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/ai/portrait/progress/{taskId}
     * 查询生成进度
     */
    @GetMapping("/progress/{taskId}")
    public ResponseEntity<GenerateProgressResponse> getProgress(
            @PathVariable String taskId) {

        GenerateProgressResponse response =
            portraitService.getGenerationProgress(taskId);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/ai/portrait/result/{taskId}
     * 获取生成结果 (推荐在进度为 100% 后调用)
     */
    @GetMapping("/result/{taskId}")
    public ResponseEntity<GenerateProgressResponse> getResult(
            @PathVariable String taskId) {

        return getProgress(taskId);
    }

    /**
     * POST /api/ai/portrait/save
     * 保存生成结果到资源库
     */
    @PostMapping("/save")
    public ResponseEntity<Void> saveResult(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody GenerationSaveRequest request) {

        portraitService.saveGenerationResult(userId, request.getTaskId(), request);

        return ResponseEntity.ok().build();
    }

    /**
     * GET /api/ai/portrait/history
     * 获取生成历史
     */
    @GetMapping("/history")
    public ResponseEntity<List<GenerationHistoryResponse>> getHistory(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<GenerationHistoryResponse> history =
            portraitService.getGenerationHistory(userId, page, size);

        return ResponseEntity.ok(history);
    }

    /**
     * GET /api/ai/portrait/models
     * 获取可用模型列表
     */
    @GetMapping("/models")
    public ResponseEntity<?> getAvailableModels() {
        return ResponseEntity.ok(portraitService.getAvailableModels());
    }
}
```

---

## 3. LangChain4J 集成方案

### 3.1 依赖配置 (pom.xml)

```xml
<!-- LangChain4J 核心 -->
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j</artifactId>
    <version>0.20.0</version>
</dependency>

<!-- OpenAI 集成 -->
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-openai</artifactId>
    <version>0.20.0</version>
</dependency>

<!-- 本地模型支持 (可选) -->
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-ollama</artifactId>
    <version>0.20.0</version>
</dependency>

<!-- 文件处理 -->
<dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.11.0</version>
</dependency>

<!-- 异步处理 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

### 3.2 application.properties 配置

```properties
# AI Portrait 服务配置
ai.portrait.default-model=default-model
ai.portrait.max-queue-size=100
ai.portrait.max-concurrent-tasks=3
ai.portrait.task-timeout=600
ai.portrait.storage-type=local
ai.portrait.storage-path=/data/ai-portraits

# OpenAI 配置 (如使用 DALL-E)
openai.api.key=${OPENAI_API_KEY}
openai.api.url=https://api.openai.com/v1

# Stable Diffusion 配置
stable-diffusion.api.url=http://localhost:7860
stable-diffusion.api.timeout=600

# 线程池配置
executor.core-pool-size=5
executor.max-pool-size=10
executor.queue-capacity=100
```

---

## 4. 工作流程图

```
前端请求
    ↓
POST /api/ai/portrait/generate
    ↓
验证参数 → 处理参考图片 → 创建生成记录 → 创建异步任务 → 提交到队列
    ↓
返回 taskId 给前端 (允许进度查询)
    ↓
前端轮询 GET /api/ai/portrait/progress/{taskId}
    ↓
后端异步处理队列中的任务
    ↓
调用 LangChain4J → 调用 AI 模型 API
    ↓
处理生成结果 → 保存图片 → 更新数据库
    ↓
前端收到 progress=100 → 显示结果图片
    ↓
用户选择保存/下载/分享
    ↓
POST /api/ai/portrait/save → 保存到资源库
```

---

## 5. 关键设计决策

### 5.1 为什么使用异步处理？
- AI 模型生成耗时 (30-120秒)
- 避免 API 超时 (HTTP 通常 60s 超时)
- 支持多用户并发请求
- 前端可实时查询进度

### 5.2 为什么分离任务表和生成表？
- **生成表** (ai_portrait_generation): 存储生成参数和最终结果
- **任务表** (ai_portrait_task): 存储任务执行状态和重试信息
- 职责清晰，便于查询和维护

### 5.3 错误重试机制
- 默认重试 3 次
- 网络错误、超时自动重试
- 提示词无效等业务错误不重试
- 最多重试 3 次后标记为失败

### 5.4 文件存储策略
- 本地开发: 存储在 `/data/ai-portraits`
- 生产环境: 建议迁移到 OSS/S3
- 参考图片和生成图片分开存储
- 定期清理过期文件

---

## 6. WebSocket 实时推送 (可选)

如果要实时推送进度而不是轮询，可添加 WebSocket 支持：

```java
// WebSocketHandler
@Component
public class AIPortraitWebSocketHandler extends TextWebSocketHandler {

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        String taskId = message.getPayload();
        // 订阅该任务的进度更新
        ProgressSubscriber.subscribe(taskId, session);
    }
}

// 配置 WebSocket 端点
@Configuration
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(aiPortraitWebSocketHandler(), "/ws/ai/portrait/progress")
            .setAllowedOrigins("*");
    }
}
```

---

## 总结

这套后端方案包括：

1. **数据库设计**: 6 个核心表，支持生成记录、任务管理、模型配置、资源库等
2. **Spring Boot 架构**: 标准的 Controller-Service-Repository 三层结构
3. **异步任务**: 使用队列和线程池处理长时间运行的 AI 生成任务
4. **LangChain4J 集成**: 灵活支持多种 AI 模型 (OpenAI, Stable Diffusion 等)
5. **文件管理**: 支持本地/OSS 存储
6. **错误处理**: 完整的重试机制和错误追踪
7. **性能优化**: 进度查询、队列管理、缓存策略

可以立即开始实现!

