# 字节跳动火山引擎SDK集成设计文档

## 1. 架构设计

### 1.1 整体架构
在现有AI立绘生成架构基础上，新增火山引擎服务层，保持与阿里云通义服务相同的接口规范，实现多模型无缝切换。

```
┌─────────────────┐    ┌─────────────────┐
│   AI Portrait   │    │   AI Portrait   │
│     Service     │    │    Controller   │
└────────┬────────┘    └────────┬────────┘
         │                      │
         ▼                      │
┌─────────────────┐            │
│  Model Strategy │◄───────────┘
│    Factory      │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌────────┐ ┌────────┐
│ Aliyun │ │Volcengine
│TongYi  │ │ Service│
│Service │ │        │
└────────┘ └────────┘
```

### 1.2 核心组件

#### VolcengineService
- 实现火山引擎SDK集成
- 遵循Java 8兼容性要求
- 支持异步调用和错误处理

#### Model Strategy Factory
- 根据配置动态选择AI模型服务
- 支持运行时模型切换
- 统一接口规范

## 2. 详细实现

### 2.1 Maven依赖配置

```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.volcengine</groupId>
    <artifactId>volcengine-java-sdk-ark-runtime</artifactId>
    <version>1.0.13</version>
</dependency>
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>okhttp</artifactId>
    <version>4.9.3</version>
</dependency>
```

### 2.2 VolcengineService实现

```java
package com.example.writemyself.service;

import com.volcengine.ark.runtime.service.ArkService;
import com.volcengine.ark.runtime.model.images.generation.*;
import lombok.extern.slf4j.Slf4j;
import okhttp3.ConnectionPool;
import okhttp3.Dispatcher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PreDestroy;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 字节跳动火山引擎服务
 * 使用 doubao-seedream 系列模型进行图像生成
 */
@Service
@Slf4j
public class VolcengineService {

    @Value("${volcengine.ark.api.key:}")
    private String apiKey;

    @Value("${volcengine.model:doubao-seedream-5-0-260128}")
    private String defaultModel;

    private ArkService arkService;

    /**
     * 初始化火山引擎服务
     */
    public void initialize() {
        if (arkService == null && apiKey != null && !apiKey.isEmpty()) {
            ConnectionPool connectionPool = new ConnectionPool(5, 1, TimeUnit.SECONDS);
            Dispatcher dispatcher = new Dispatcher();

            arkService = ArkService.builder()
                    .dispatcher(dispatcher)
                    .connectionPool(connectionPool)
                    .apiKey(apiKey)
                    .build();

            log.info("✓ 火山引擎服务初始化完成");
        }
    }

    /**
     * 使用火山引擎生成图片
     * @param prompt 提示词
     * @param width 图片宽度
     * @param height 图片高度
     * @param count 生成数量
     * @param seed 种子值
     * @return 生成的图片URL列表
     */
    public List<String> generateImage(String prompt, Integer width, Integer height,
                                     Integer count, Long seed) {
        try {
            log.info("使用火山引擎生成图片: 提示词={}, 尺寸={}x{}, 数量={}, 种子={}",
                    prompt, width, height, count, seed);

            // 确保服务已初始化
            initialize();

            if (arkService == null) {
                throw new IllegalStateException("火山引擎服务未正确配置，请检查API密钥");
            }

            // 构建尺寸字符串
            String size = mapSizeToVolcengineFormat(width, height);

            // 构建生成请求
            GenerateImagesRequest generateRequest = GenerateImagesRequest.builder()
                    .model(defaultModel)
                    .prompt(prompt)
                    .size(size)
                    .sequentialImageGeneration("disabled")
                    .responseFormat(ResponseFormat.Url)
                    .stream(false)
                    .watermark(true)
                    .build();

            // 调用API生成图片
            ImagesResponse imagesResponse = arkService.generateImages(generateRequest);

            // 解析响应结果
            List<String> imageUrls = new ArrayList<>();
            if (imagesResponse.getData() != null) {
                for (int i = 0; i < imagesResponse.getData().size(); i++) {
                    String imageUrl = imagesResponse.getData().get(i).getUrl();
                    if (imageUrl != null) {
                        imageUrls.add(imageUrl);
                    }
                }
            }

            log.info("✓ 火山引擎图片生成成功，共生成 {} 张", imageUrls.size());
            return imageUrls;

        } catch (Exception e) {
            log.error("火山引擎生成图片失败", e);
            throw new RuntimeException("生成图片失败: " + e.getMessage(), e);
        }
    }

    /**
     * 将尺寸映射为火山引擎支持的格式
     */
    private String mapSizeToVolcengineFormat(Integer width, Integer height) {
        if (width == null || height == null) {
            return "1024*1024";
        }

        // 火山引擎支持的尺寸格式: "1024*1024", "2K", "4K"等
        int totalPixels = width * height;

        if (totalPixels <= 1024 * 1024) {
            return width + "*" + height;
        } else if (totalPixels <= 2048 * 2048) {
            return "2K";
        } else {
            return "4K";
        }
    }

    /**
     * 关闭服务
     */
    @PreDestroy
    public void shutdown() {
        if (arkService != null) {
            arkService.shutdownExecutor();
            log.info("火山引擎服务已关闭");
        }
    }
}
```

### 2.3 模型策略工厂

```java
package com.example.writemyself.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * AI模型服务工厂
 * 根据模型类型动态选择对应的服务
 */
@Component
@RequiredArgsConstructor
public class AIModelServiceFactory {

    private final AliyunTongYiService aliyunTongYiService;
    private final VolcengineService volcengineService;

    /**
     * 根据模型名称获取对应的服务
     */
    public ImageGenerationService getService(String modelName) {
        if (modelName == null) {
            return aliyunTongYiService; // 默认使用阿里云
        }

        // 火山引擎模型
        if (modelName.startsWith("doubao-")) {
            return volcengineService;
        }

        // 阿里云通义模型
        if (modelName.startsWith("wanx-") || modelName.startsWith("tongyi-")) {
            return aliyunTongYiService;
        }

        // 默认回退到阿里云
        return aliyunTongYiService;
    }
}

/**
 * 图像生成服务接口
 * 统一不同AI模型服务的接口规范
 */
public interface ImageGenerationService {
    List<String> generateImage(String prompt, Integer width, Integer height,
                              Integer count, Long seed);
}
```

### 2.4 AIPortraitService集成

```java
package com.example.writemyself.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 更新后的AI立绘服务
 * 支持多模型动态选择
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AIPortraitService {

    private final AIPortraitGenerationRepository generationRepository;
    private final AIPortraitTaskRepository taskRepository;
    private final AIPortraitModelConfigRepository modelConfigRepository;
    private final FileStorageService fileStorageService;
    private final AIModelServiceFactory modelServiceFactory;

    /**
     * 生成立绘 - 支持指定模型
     */
    public List<String> generatePortrait(AIPortraitGeneration generation) {
        log.info("生成立绘，模型: {}, 提示词: {}",
                generation.getModelName(), generation.getPrompt());

        // 获取对应的AI模型服务
        ImageGenerationService aiService = modelServiceFactory
                .getService(generation.getModelName());

        // 构建完整提示词
        String fullPrompt = buildPrompt(generation);

        // 调用对应服务生成图片
        return aiService.generateImage(
                fullPrompt,
                generation.getWidth(),
                generation.getHeight(),
                generation.getGenerationCount(),
                generation.getSeed()
        );
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

        return sb.toString();
    }

    /**
     * 映射风格预设
     */
    private String mapStylePreset(String stylePreset) {
        switch (stylePreset) {
            case "anime":
                return "anime style, cartoon";
            case "realistic":
                return "photorealistic, realistic";
            case "fantasy":
                return "fantasy style, magical";
            default:
                return "digital art";
        }
    }
}
```

### 2.5 配置更新

```properties
# application.properties

# 火山引擎配置
volcengine.ark.api.key=${VOLCENGINE_API_KEY:}
volcengine.model=doubao-seedream-5-0-260128

# 阿里云配置 (保持不变)
aliyun.dashscope.api.key=${ALIYUN_API_KEY:}
aliyun.portrait.model=wanx-v1
```

### 2.6 数据库模型配置更新

```sql
-- 添加火山引擎模型配置
INSERT INTO ai_portrait_model_config
(model_name, provider, endpoint, api_key, is_active, description, created_at)
VALUES
('doubao-seedream-5-0-260128', 'volcengine', 'https://ark.cn-beijing.volces.com', '', true, '字节跳动火山引擎 Seedream 5.0 模型', NOW()),
('doubao-seedream-4-0-260128', 'volcengine', 'https://ark.cn-beijing.volces.com', '', true, '字节跳动火山引擎 Seedream 4.0 模型', NOW());
```

## 3. Java 8兼容性处理

### 3.1 兼容性检查清单
- ✅ 使用显式类型声明，避免var关键字
- ✅ 使用传统的List创建方式，避免List.of()
- ✅ 使用String.trim()，避免String.strip()
- ✅ 使用java.util.Base64进行编码
- ✅ 使用传统的Stream收集方式

### 3.2 兼容性代码示例

```java
// ✅ Java 8兼容的写法
List<String> imageUrls = new ArrayList<>();
for (int i = 0; i < response.getData().size(); i++) {
    String url = response.getData().get(i).getUrl();
    if (url != null) {
        imageUrls.add(url);
    }
}

// ❌ 避免Java 11+的写法
// List<String> imageUrls = response.getData().stream()
//     .map(ImageData::getUrl)
//     .filter(Objects::nonNull)
//     .collect(Collectors.toList());
```

## 4. 错误处理和重试机制

### 4.1 异常处理

```java
/**
 * 火山引擎服务异常处理
 */
public class VolcengineException extends RuntimeException {
    private final String errorCode;
    private final String requestId;

    public VolcengineException(String message, String errorCode, String requestId) {
        super(message);
        this.errorCode = errorCode;
        this.requestId = requestId;
    }

    // Getters
    public String getErrorCode() { return errorCode; }
    public String getRequestId() { return requestId; }
}
```

### 4.2 重试机制

```java
/**
 * 带重试机制的生成方法
 */
public List<String> generateImageWithRetry(String prompt, Integer width, Integer height,
                                          Integer count, Long seed, int maxRetries) {
    int attempts = 0;
    while (attempts < maxRetries) {
        try {
            return generateImage(prompt, width, height, count, seed);
        } catch (Exception e) {
            attempts++;
            log.warn("第 {} 次生成失败: {}", attempts, e.getMessage());

            if (attempts >= maxRetries) {
                throw e;
            }

            // 指数退避
            try {
                Thread.sleep((long) Math.pow(2, attempts) * 1000);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("重试被中断", ie);
            }
        }
    }

    throw new IllegalStateException("不应该到达这里");
}
```

## 5. 测试策略

### 5.1 单元测试

```java
@SpringBootTest
@AutoConfigureTestDatabase
class VolcengineServiceTest {

    @Autowired
    private VolcengineService volcengineService;

    @Test
    void shouldInitializeServiceWithValidApiKey() {
        // 给定有效的API密钥
        ReflectionTestUtils.setField(volcengineService, "apiKey", "valid-key");

        // 当初始化服务
        volcengineService.initialize();

        // 那么服务应该成功初始化
        // 注意：这里需要mock网络调用，实际测试中应该使用MockWebServer
    }

    @Test
    void shouldThrowExceptionWhenApiKeyIsMissing() {
        // 给定空的API密钥
        ReflectionTestUtils.setField(volcengineService, "apiKey", "");

        // 当调用生成方法
        // 那么应该抛出异常
        assertThrows(IllegalStateException.class, () -> {
            volcengineService.generateImage("test prompt", 512, 512, 1, null);
        });
    }
}
```

### 5.2 集成测试

```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
    "volcengine.ark.api.key=test-key",
    "aliyun.dashscope.api.key=test-key"
})
class AIPortraitControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void shouldGeneratePortraitWithVolcengineModel() {
        // 构建请求
        GeneratePortraitRequest request = new GeneratePortraitRequest();
        request.setPrompt("test prompt");
        request.setModelName("doubao-seedream-5-0-260128");
        request.setWidth(512);
        request.setHeight(512);

        // 发送请求
        ResponseEntity<GeneratePortraitResponse> response = restTemplate
            .postForEntity("/api/ai/portrait/generate", request,
                         GeneratePortraitResponse.class);

        // 验证响应
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getTaskId()).isNotEmpty();
    }
}
```

## 6. 部署和运维

### 6.1 环境变量配置

```bash
# .env.production
VOLCENGINE_API_KEY=your_volcengine_api_key_here
ALIYUN_API_KEY=your_aliyun_api_key_here
```

### 6.2 健康检查

```java
@Component
public class VolcengineHealthIndicator implements HealthIndicator {

    @Autowired
    private VolcengineService volcengineService;

    @Override
    public Health health() {
        try {
            volcengineService.initialize();
            return Health.up()
                .withDetail("service", "volcengine")
                .withDetail("status", "connected")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("service", "volcengine")
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

## 7. 性能优化

### 7.1 连接池优化

```java
// 优化连接池配置
ConnectionPool connectionPool = new ConnectionPool(
    20,  // 最大空闲连接数
    5,   // 保持活跃时间（分钟）
    TimeUnit.MINUTES
);

Dispatcher dispatcher = new Dispatcher();
dispatcher.setMaxRequests(64);
dispatcher.setMaxRequestsPerHost(16);
```

### 7.2 缓存策略

```java
@Service
public class CachedVolcengineService {

    @Autowired
    private VolcengineService volcengineService;

    private final Cache<String, List<String>> resultCache = CacheBuilder.newBuilder()
        .maximumSize(1000)
        .expireAfterWrite(1, TimeUnit.HOURS)
        .build();

    public List<String> generateImageWithCache(String prompt, Integer width,
                                              Integer height, Integer count, Long seed) {
        String cacheKey = generateCacheKey(prompt, width, height, count, seed);

        try {
            return resultCache.get(cacheKey, () ->
                volcengineService.generateImage(prompt, width, height, count, seed)
            );
        } catch (ExecutionException e) {
            throw new RuntimeException("缓存获取失败", e);
        }
    }

    private String generateCacheKey(String prompt, Integer width, Integer height,
                                   Integer count, Long seed) {
        return String.format("%s_%d_%d_%d_%d", prompt, width, height, count,
                           seed != null ? seed : -1);
    }
}

