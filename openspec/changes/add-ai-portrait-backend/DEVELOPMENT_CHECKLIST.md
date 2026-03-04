# AI 立绘生成器后端开发检查清单

> 本清单帮助你逐步完成后端开发。按顺序勾选每一项。

---

## 📋 第一阶段：环境准备

### 环境检查
- [ ] JDK 1.8 已安装 (`java -version` 显示 1.8)
- [ ] Maven 3.6+ 已安装 (`mvn -v` 显示版本)
- [ ] MySQL 5.7+ 已启动 (`mysql --version`)
- [ ] 项目代码已克隆到本地

### 依赖配置
- [ ] 已阅读 `JAVA8_DOMESTIC_ADAPTATION.md`
- [ ] 已阅读 `DOMESTIC_AI_MODELS_COMPARISON.md`
- [ ] 已理解 Java 8 的限制条件
- [ ] 已选定主用模型 (推荐: 阿里云通义)
- [ ] 已获取 API Key
  - [ ] 阿里云通义 API Key
  - [ ] （可选）百度文心 API Key

### 环境变量设置
- [ ] `ALIYUN_API_KEY` 已设置并验证
- [ ] `ALIYUN_AK_ID` 已设置 (可选)
- [ ] `ALIYUN_AK_SECRET` 已设置 (可选)
- [ ] 已执行 `source ~/.zshrc` 使环境变量生效

---

## 🗄️ 第二阶段：数据库初始化

### 数据库创建
- [ ] MySQL 连接正常 (`mysql -u root -p`)
- [ ] 执行了初始化脚本: `mysql -u root -p < init.sql`
- [ ] 验证 6 张表已创建:
  - [ ] `ai_portrait_generation` (生成记录表)
  - [ ] `ai_portrait_task` (异步任务表)
  - [ ] `ai_portrait_model_config` (模型配置表)
  - [ ] `ai_portrait_resource_library` (资源库表)
  - [ ] `ai_portrait_user_preset` (用户预设表)
  - [ ] `ai_portrait_generation_queue` (队列表)

### 表结构验证
- [ ] 所有主键已设置
- [ ] 所有索引已创建
- [ ] 所有外键关系已建立
- [ ] 初始数据已插入（模型配置、示例预设）

```sql
-- 快速验证命令
USE writeengine;
SHOW TABLES LIKE 'ai_portrait_%';
SELECT COUNT(*) FROM ai_portrait_model_config;
SELECT * FROM ai_portrait_user_preset LIMIT 1;
```

---

## 💻 第三阶段：后端代码开发

### 目录结构创建
- [ ] 创建 `src/main/java/com/example/writemyself/service/ai/` 目录
- [ ] 创建 `src/main/java/com/example/writemyself/entity/` 目录
- [ ] 创建 `src/main/java/com/example/writemyself/repository/` 目录
- [ ] 创建 `src/main/java/com/example/writemyself/dto/` 目录
- [ ] 创建 `src/main/java/com/example/writemyself/controller/` 目录
- [ ] 创建 `src/main/java/com/example/writemyself/config/` 目录

### Entity 类开发（5个）
- [ ] **AIPortraitGeneration** - 生成记录
  - [ ] 所有字段已映射
  - [ ] JPA 注解正确配置
  - [ ] Lombok @Data 已添加
  - [ ] 表名和列名映射正确

- [ ] **AIPortraitTask** - 任务状态
  - [ ] 字段完整
  - [ ] 外键关系正确
  - [ ] 时间戳字段配置

- [ ] **AIPortraitModelConfig** - 模型配置
  - [ ] 所有参数字段已添加
  - [ ] 索引字段已标记

- [ ] **AIPortraitResourceLibrary** - 资源库
  - [ ] 图片相关字段完整
  - [ ] 元数据字段已添加

- [ ] **AIPortraitUserPreset** - 用户预设
  - [ ] 模板字段已添加
  - [ ] 默认参数已设置

### Repository 接口开发（3个）
- [ ] **AIPortraitGenerationRepository**
  - [ ] 继承 `JpaRepository<AIPortraitGeneration, Long>`
  - [ ] 方法: `findByTaskId(String taskId)`
  - [ ] 方法: `findByUserId(Long userId)`
  - [ ] 方法: `findByStatus(String status)`

- [ ] **AIPortraitTaskRepository**
  - [ ] 继承 `JpaRepository<AIPortraitTask, Long>`
  - [ ] 方法: `findByTaskId(String taskId)`
  - [ ] 方法: `findByGenerationId(Long generationId)`

- [ ] **AIPortraitModelConfigRepository**
  - [ ] 继承 `JpaRepository<AIPortraitModelConfig, Long>`
  - [ ] 方法: `findByProviderAndIsActive(String provider, Boolean isActive)`
  - [ ] 方法: `findByIsDefault(Boolean isDefault)`

### Service 类开发（4个）

#### 1️⃣ AIPortraitService (核心业务)
- [ ] 类已创建: `src/main/java/.../service/AIPortraitService.java`
- [ ] 依赖注入已配置
  - [ ] `AIPortraitGenerationRepository`
  - [ ] `AIPortraitModelConfigRepository`
  - [ ] `AsyncTaskService`
  - [ ] `AliyunTongYiService`
  - [ ] `FileStorageService`

- [ ] 方法已实现:
  - [ ] `createGenerationTask()` - 创建生成任务
  - [ ] `getGenerationProgress()` - 查询进度
  - [ ] `getGenerationResult()` - 获取结果
  - [ ] `saveToLibrary()` - 保存到资源库
  - [ ] `getUserHistory()` - 查看历史记录
  - [ ] `getAvailableModels()` - 获取可用模型

#### 2️⃣ AsyncTaskService (异步处理)
- [ ] 类已创建: `src/main/java/.../service/AsyncTaskService.java`
- [ ] 添加了 `@EnableAsync` 到启动类
- [ ] ThreadPoolTaskExecutor 已配置
  - [ ] Core Pool Size: 5
  - [ ] Max Pool Size: 10
  - [ ] Queue Capacity: 100
  - [ ] Thread Name Prefix: "ai-portrait-"

- [ ] 方法已实现:
  - [ ] `@Async("portraitTaskExecutor") processTask()` - 异步处理
  - [ ] `retryTask()` - 重试机制 (3次)
  - [ ] 错误处理和日志记录

#### 3️⃣ AliyunTongYiService (国内模型)
- [ ] 类已创建: `src/main/java/.../service/ai/AliyunTongYiService.java`
- [ ] 依赖配置
  - [ ] `@Value("${aliyun.dashscope.api.key}")` 配置
  - [ ] `ImageGenerationApi` 已导入

- [ ] 方法已实现:
  - [ ] `generateImage()` - 文本转图像
  - [ ] `generateFromImage()` - 图像转图像
  - [ ] 提示词构建逻辑
  - [ ] 错误处理

#### 4️⃣ FileStorageService (文件管理)
- [ ] 类已创建: `src/main/java/.../service/FileStorageService.java`
- [ ] 方法已实现:
  - [ ] `saveImage()` - 保存图片
  - [ ] `deleteImage()` - 删除图片
  - [ ] `getImageUrl()` - 获取 URL
  - [ ] 本地/OSS 存储支持

### DTO 类开发（请求/响应）
- [ ] **GeneratePortraitRequest**
  - [ ] 字段: `prompt`, `width`, `height`, `count`, ...
  - [ ] 字段验证注解: `@NotBlank`, `@Min`, `@Max`

- [ ] **GeneratePortraitResponse**
  - [ ] 字段: `taskId`, `status`, `message`

- [ ] **GenerateProgressResponse**
  - [ ] 字段: `taskId`, `progress`, `status`, `imageUrls`

- [ ] **GenerationHistoryResponse**
  - [ ] 字段完整，支持分页

### Controller 类开发（1个）
- [ ] 类已创建: `src/main/java/.../controller/AIPortraitController.java`
- [ ] 基础配置
  - [ ] `@RestController` 注解
  - [ ] `@RequestMapping("/api/ai/portrait")`
  - [ ] 依赖注入配置

- [ ] 6 个 REST 端点已实现:
  - [ ] `POST /generate` - 创建生成任务
    - [ ] 请求头检查 `X-User-Id`
    - [ ] 参数验证
    - [ ] 返回 `taskId`

  - [ ] `GET /progress/{taskId}` - 查询进度
    - [ ] 返回进度百分比
    - [ ] 返回当前状态

  - [ ] `GET /result/{taskId}` - 获取结果
    - [ ] 任务完成时返回图片 URL
    - [ ] 任务未完成时返回 202 Accepted

  - [ ] `POST /save` - 保存到资源库
    - [ ] 参数: `taskId`, `name`, `category`

  - [ ] `GET /history` - 查看历史
    - [ ] 分页支持
    - [ ] 排序支持

  - [ ] `GET /models` - 获取可用模型
    - [ ] 返回所有启用的模型

### 配置类开发
- [ ] AsyncConfig 类已创建
  - [ ] `@Configuration` 注解
  - [ ] `@EnableAsync` 注解
  - [ ] ThreadPoolTaskExecutor Bean 定义

---

## ⚙️ 第四阶段：配置管理

### application.properties 配置
- [ ] Server 配置
  ```properties
  server.port=8083
  ```

- [ ] 数据库配置
  ```properties
  spring.datasource.url=jdbc:mysql://localhost:3306/writeengine
  spring.datasource.username=root
  spring.datasource.password=root
  spring.jpa.hibernate.ddl-auto=update
  ```

- [ ] 国内模型配置
  ```properties
  aliyun.dashscope.api.key=${ALIYUN_API_KEY}
  aliyun.portrait.model=wanx-v1
  ai.portrait.default-provider=aliyun
  ```

- [ ] 日志配置
  ```properties
  logging.level.com.example.writemyself=DEBUG
  ```

### POM.xml 依赖
- [ ] Spring Boot 2.7.14 版本确认
- [ ] MySQL connector 已添加
- [ ] Lombok 已添加
- [ ] 阿里云 SDK 已添加
- [ ] 所有依赖版本与 Java 8 兼容

---

## 🧪 第五阶段：测试

### 单元测试
- [ ] 创建 `src/test/java/.../service/AIPortraitServiceTest.java`
- [ ] 创建 `src/test/java/.../controller/AIPortraitControllerTest.java`
- [ ] Repository 层测试已编写
- [ ] Service 层测试已编写
- [ ] 所有单元测试通过: `mvn test`

### 集成测试
- [ ] 端到端测试已编写
- [ ] 异步任务流程测试
- [ ] 错误处理测试
- [ ] 数据库事务测试

### 手工测试
- [ ] 启动应用: `mvn spring-boot:run`
- [ ] 测试 API 端点:
  ```bash
  # 1. 获取可用模型
  curl http://localhost:8083/api/ai/portrait/models

  # 2. 提交生成请求
  curl -X POST http://localhost:8083/api/ai/portrait/generate \
    -H "Content-Type: application/json" \
    -H "X-User-Id: 1" \
    -d '{"prompt":"日系二次元少女", "width":1024, "height":1024}'

  # 3. 查询进度
  curl http://localhost:8083/api/ai/portrait/progress/{taskId}

  # 4. 获取结果
  curl http://localhost:8083/api/ai/portrait/result/{taskId}
  ```

- [ ] 前端集成测试
  - [ ] 前端能正确调用 API
  - [ ] 进度条实时更新
  - [ ] 图片正确显示

### 性能测试
- [ ] 压力测试 (10 并发)
- [ ] 长时间运行测试 (1小时)
- [ ] 内存泄漏测试
- [ ] 数据库连接池测试

---

## 📦 第六阶段：打包部署

### 打包准备
- [ ] 所有测试通过
- [ ] 代码审查完成
- [ ] 日志检查 (移除调试日志)
- [ ] 敏感信息检查 (API Key 不硬编码)

### 构建
- [ ] 执行: `mvn clean package -DskipTests`
- [ ] JAR 文件生成成功: `target/writeengine-*.jar`
- [ ] 大小合理 (< 500MB)

### 本地验证
- [ ] 启动 JAR: `java -jar target/writeengine-*.jar`
- [ ] 应用成功启动
- [ ] 日志无错误
- [ ] API 端点可访问

### 部署准备
- [ ] 生成 Dockerfile (可选)
- [ ] 配置生产环境变量
- [ ] 备份数据库
- [ ] 准备回滚方案

---

## 🚀 第七阶段：优化和维护

### 代码优化
- [ ] 代码审查完成
- [ ] 性能优化已应用
- [ ] 日志级别调整 (生产环境用 INFO)
- [ ] 缓存机制已实现 (可选)

### 监控和告警
- [ ] 日志聚集已配置
- [ ] 性能指标已监控
- [ ] 异常告警已设置
- [ ] 定时任务监控 (清理过期任务)

### 文档
- [ ] API 文档已生成 (Swagger/Knife4j)
- [ ] 运维手册已编写
- [ ] 故障排查指南已完成
- [ ] 更新日志 (CHANGELOG) 已记录

---

## 📝 附录：常用命令

### 数据库相关
```bash
# 初始化数据库
mysql -u root -p < init.sql

# 查看表结构
mysql -u root -p -e "DESC writeengine.ai_portrait_generation;"

# 查看数据
mysql -u root -p -e "SELECT * FROM writeengine.ai_portrait_generation LIMIT 5;"

# 清空数据（仅测试）
mysql -u root -p -e "DELETE FROM writeengine.ai_portrait_generation;"
```

### Maven 相关
```bash
# 清空构建
mvn clean

# 下载依赖
mvn dependency:resolve

# 编译
mvn compile

# 运行测试
mvn test

# 打包
mvn package

# 查看依赖树
mvn dependency:tree
```

### 应用启动
```bash
# 开发模式
mvn spring-boot:run

# 生产打包
mvn clean package -DskipTests

# 运行 JAR
java -jar target/writeengine-*.jar

# 指定 JVM 参数
java -Xmx512m -Xms256m -jar target/writeengine-*.jar
```

### API 测试
```bash
# 生成请求
curl -X POST http://localhost:8083/api/ai/portrait/generate \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -d '{"prompt":"test", "width":1024, "height":1024}'

# 查询进度
curl "http://localhost:8083/api/ai/portrait/progress/550e8400-e29b-41d4-a716-446655440000"

# 查看历史
curl "http://localhost:8083/api/ai/portrait/history?page=0&size=20"
```

---

## ✅ 完成标志

当以下条件都满足时，后端开发完成：

- [x] 所有 6 个数据库表已创建并有初始数据
- [x] 5 个 Entity 类已实现
- [x] 3 个 Repository 接口已实现
- [x] 4 个 Service 类已实现（包括 AliyunTongYiService）
- [x] 6 个 REST API 端点已实现
- [x] 单元测试通过率 ≥ 80%
- [x] 集成测试通过
- [x] 压力测试通过 (10 并发无异常)
- [x] 所有文档已完成
- [x] 代码已提交到 Git

**现在就开始吧！** 🎉

