# 🚀 AI 立绘生成器后端 - 快速启动指南

> **Java 8 + Spring Boot 2.7 + 阿里云通义**
>
> 你正在这里，因为你已经准备好开发**国内大模型**驱动的 AI 立绘生成系统后端。
>
> 预计时间: 📅 3-5 天（从零到 API 可用）

---

## 🎯 目标

在你的 Java 8 环境中，开发一个**完整的后端系统**，使前端能够：
1. ✅ 提交立绘生成请求
2. ✅ 查询生成进度
3. ✅ 获取生成结果
4. ✅ 保存到个人资源库
5. ✅ 查看历史生成记录

---

## 📚 文档导航

按这个顺序阅读文档：

| 文档 | 目的 | 阅读时间 |
|------|------|---------|
| **START_HERE.md** (本文件) | 快速了解整体方案 | 10 分钟 |
| **JAVA8_DOMESTIC_ADAPTATION.md** | 理解 Java 8 限制 + 国内模型集成 | 30 分钟 |
| **QUICK_START_JAVA8.md** | 核心代码片段参考 | 20 分钟 |
| **DOMESTIC_AI_MODELS_COMPARISON.md** | 选择合适的模型 | 15 分钟 |
| **design.md** | 完整架构设计 | 1 小时 |
| **DEVELOPMENT_CHECKLIST.md** | 逐步开发指南 | 全程参考 |

---

## ⚡ 5 分钟快速了解

### 系统架构

```
┌─────────────────────────────────────────┐
│  前端 (Vue 3)                            │
│  - 输入提示词/参考图/参数               │
│  - 实时进度查询                         │
│  - 展示生成结果                         │
└──────────────┬──────────────────────────┘
               │ REST API
┌──────────────▼──────────────────────────┐
│  后端 Spring Boot 2.7 (Java 8)           │
├──────────────────────────────────────────┤
│  HTTP 层:                                │
│  - POST /api/ai/portrait/generate       │
│  - GET /api/ai/portrait/progress/{id}   │
│  - GET /api/ai/portrait/result/{id}     │
│  - ... (6 个 API 端点)                   │
├──────────────────────────────────────────┤
│  业务层:                                 │
│  - AIPortraitService (核心业务)         │
│  - AsyncTaskService (异步处理)          │
│  - AliyunTongYiService (国内模型)       │
│  - FileStorageService (文件管理)        │
├──────────────────────────────────────────┤
│  数据层:                                 │
│  - 6 个 Entity 类                        │
│  - 3 个 Repository 接口                 │
│  - JPA/Hibernate 自动 SQL 生成          │
├──────────────────────────────────────────┤
│  外部服务:                               │
│  - 阿里云通义 API (图像生成)            │
│  - （可选）百度文心 API (备选)          │
└──────────────┬──────────────────────────┘
               │ JDBC
┌──────────────▼──────────────────────────┐
│  MySQL 5.7+ (6 张表)                     │
│  - ai_portrait_generation               │
│  - ai_portrait_task                     │
│  - ai_portrait_model_config             │
│  - ai_portrait_resource_library         │
│  - ai_portrait_user_preset              │
│  - ai_portrait_generation_queue         │
└──────────────────────────────────────────┘
```

### 关键数据流

```
前端提交请求
    ↓
Controller 接收验证
    ↓
AIPortraitService 创建任务
    ↓
AsyncTaskService 异步处理
    ↓
AliyunTongYiService 调用模型
    ↓
模型生成图片 (30-60 秒)
    ↓
FileStorageService 保存结果
    ↓
数据库更新任务状态
    ↓
前端轮询查询进度
    ↓
进度 = 100% 时显示结果
```

---

## ⚙️ 第一步：环境准备（15 分钟）

### 1.1 检查 Java 版本

```bash
java -version
# 输出应该包含: "1.8"

# 如果不是 1.8，请下载
# https://www.oracle.com/java/technologies/javase/javase8-archive-downloads.html
```

### 1.2 安装依赖

```bash
# macOS
brew install maven
brew install mysql

# Ubuntu/Debian
sudo apt-get install maven default-jdk-headless mysql-server

# Windows (使用 Chocolatey)
choco install maven mysql
```

### 1.3 启动 MySQL

```bash
# macOS
brew services start mysql

# Ubuntu/Linux
sudo systemctl start mysql

# 验证
mysql -u root -e "SELECT 1;"
# 应该能连接
```

### 1.4 获取 API Key

**阿里云通义** (推荐):
1. 登录 https://dashscope.aliyun.com
2. 点击"API Keys"
3. 创建新 Key
4. 复制 Key 值

设置环境变量:
```bash
export ALIYUN_API_KEY="sk-xxxxxxxxxxxxxxxx"
```

---

## 🔧 第二步：项目配置（10 分钟）

### 2.1 更新 pom.xml

使用 **JAVA8_DOMESTIC_ADAPTATION.md** 中的 `pom.xml` 部分。

关键点:
- Spring Boot 版本: `2.7.14` (必须)
- Java 版本: `1.8` (必须)
- 添加阿里云 SDK

### 2.2 更新 application.properties

```properties
# Server
server.port=8083

# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/writeengine
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# 国内模型
aliyun.dashscope.api.key=${ALIYUN_API_KEY}
ai.portrait.default-provider=aliyun
ai.portrait.max-queue-size=100

# 日志
logging.level.root=INFO
logging.level.com.example.writemyself=DEBUG
```

---

## 🗄️ 第三步：数据库初始化（5 分钟）

### 3.1 创建数据库

```bash
mysql -u root -p << 'EOF'
CREATE DATABASE IF NOT EXISTS writeengine
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF
```

### 3.2 初始化表结构

```bash
# 方法 1: 使用提供的 SQL 文件
mysql -u root -p writeengine < init.sql

# 方法 2: 手动执行 (见 init.sql)
# ... SQL 语句 ...
```

### 3.3 验证

```bash
mysql -u root -p -e "USE writeengine; SHOW TABLES LIKE 'ai_portrait_%';"
# 应该看到 6 张表
```

---

## 💻 第四步：开发代码（最长的部分）

### 4.1 创建目录结构

```bash
mkdir -p src/main/java/com/example/writemyself/{service/ai,entity,repository,dto,controller,config}
```

### 4.2 按顺序编写代码

使用 **DEVELOPMENT_CHECKLIST.md** 作为指南，按顺序完成：

1. **Entity 类** (5个)
   - AIPortraitGeneration
   - AIPortraitTask
   - AIPortraitModelConfig
   - AIPortraitResourceLibrary
   - AIPortraitUserPreset

2. **Repository 接口** (3个)
   - AIPortraitGenerationRepository
   - AIPortraitTaskRepository
   - AIPortraitModelConfigRepository

3. **Service 类** (4个)
   - AIPortraitService (核心)
   - AsyncTaskService (异步)
   - AliyunTongYiService (重要！国内模型)
   - FileStorageService (文件)

4. **DTO 类** (请求/响应)
   - GeneratePortraitRequest
   - GeneratePortraitResponse
   - GenerateProgressResponse
   - ...

5. **Controller 类** (1个)
   - AIPortraitController (6 个 API 端点)

6. **Config 类**
   - AsyncConfig (线程池配置)

### 4.3 参考代码

所有代码片段都在 **QUICK_START_JAVA8.md** 中。

**AliyunTongYiService** 是最关键的，一定要仔细实现：

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
            request.setN(count);
            request.setSize(width + "x" + height);

            ImageGenerationResponse response = ImageGenerationApi.call(request);

            // ... 处理响应 ...
            return imageUrls;
        } catch (Exception e) {
            // ... 错误处理 ...
        }
    }
}
```

---

## ✅ 第五步：测试（30 分钟）

### 5.1 编译

```bash
mvn clean compile
# 没有错误就继续
```

### 5.2 运行

```bash
mvn spring-boot:run
# 应该看到: "Started Application in X seconds"
```

### 5.3 测试 API

```bash
# 1. 获取可用模型
curl http://localhost:8083/api/ai/portrait/models
# 返回: [{"modelName":"wanx-v1", ...}]

# 2. 提交生成请求
TASK_ID=$(curl -s -X POST http://localhost:8083/api/ai/portrait/generate \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -d '{"prompt":"日系二次元少女","width":1024,"height":1024}' \
  | jq -r '.taskId')
echo "任务 ID: $TASK_ID"

# 3. 查询进度 (每 2 秒查询一次)
for i in {1..30}; do
  curl http://localhost:8083/api/ai/portrait/progress/$TASK_ID | jq '.progress'
  sleep 2
done

# 4. 获取结果
curl http://localhost:8083/api/ai/portrait/result/$TASK_ID | jq '.imageUrls'
```

---

## 🎨 第六步：与前端集成（30 分钟）

前端已经准备好了，只需要你的后端 API。

### 6.1 前端生成请求

```javascript
// src/api/portrait.ts
async function generatePortrait(params) {
  const response = await axios.post('/api/ai/portrait/generate', params, {
    headers: { 'X-User-Id': userId }
  });
  return response.data.taskId;
}
```

### 6.2 进度查询

前端会这样查询：
```javascript
const progressResp = await axios.get(
  `/api/ai/portrait/progress/${taskId}`,
  { headers: { 'X-User-Id': userId } }
);
// progress: 0-100
// status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
// imageUrls: string[]
```

---

## 📋 检查清单

使用这个清单来追踪你的进度：

- [ ] Java 1.8 已验证
- [ ] MySQL 已启动
- [ ] 环境变量已设置 (`ALIYUN_API_KEY`)
- [ ] pom.xml 已更新
- [ ] application.properties 已配置
- [ ] 数据库已初始化 (6 张表)
- [ ] Entity 类已编写 (5个)
- [ ] Repository 接口已编写 (3个)
- [ ] Service 类已编写 (4个)
- [ ] DTO 类已编写
- [ ] Controller 类已编写 (6 个端点)
- [ ] Config 类已编写 (线程池)
- [ ] 项目成功编译 (`mvn clean compile`)
- [ ] 应用成功启动 (`mvn spring-boot:run`)
- [ ] API 端点能响应 (6 个都测试过)
- [ ] 前端能调用后端 API

---

## 🆘 常见问题

### Q: "Cannot find symbol: class ImageGenerationApi"
**A**: 检查 pom.xml 是否有阿里云 SDK:
```xml
<dependency>
    <groupId>com.aliyun</groupId>
    <artifactId>alibabacloud-dashscope</artifactId>
    <version>1.0.0</version>
</dependency>
```
然后运行 `mvn clean install`

### Q: "java.lang.UnsupportedClassVersionError"
**A**: 你的 JDK 版本不对。必须是 1.8:
```bash
java -version  # 应该显示 "1.8"
```

### Q: Spring Boot 启动失败
**A**: 检查:
1. MySQL 是否启动: `mysql -u root -p`
2. pom.xml 版本是否正确: Spring Boot 2.7.14, Java 1.8
3. application.properties 配置是否正确

### Q: "API call failed: Unauthorized"
**A**: API Key 错误或未设置。检查:
```bash
echo $ALIYUN_API_KEY  # 应该有值
```

### Q: 异步任务没有执行
**A**: 检查:
1. `@EnableAsync` 是否添加到启动类
2. ThreadPoolTaskExecutor Bean 是否已注册
3. 方法是否有 `@Async("portraitTaskExecutor")`

---

## 📞 技术支持

### 文档
- 设计文档: `design.md`
- 代码参考: `QUICK_START_JAVA8.md`
- 模型对比: `DOMESTIC_AI_MODELS_COMPARISON.md`
- 开发清单: `DEVELOPMENT_CHECKLIST.md`

### 官方资源
- 阿里云通义: https://dashscope.aliyun.com
- Spring Boot: https://spring.io/projects/spring-boot
- Java 8 文档: https://docs.oracle.com/javase/8/

### 常用命令

```bash
# 清理
mvn clean

# 编译
mvn compile

# 测试
mvn test

# 打包
mvn package

# 运行
mvn spring-boot:run

# 调试 (在 IDE 中 Debug As → Java Application)
mvn -Dspring-boot.run.fork=false spring-boot:run
```

---

## 🏁 最后一步：部署

当本地测试通过后：

```bash
# 1. 构建 JAR
mvn clean package -DskipTests

# 2. 运行 JAR
java -jar target/writeengine-*.jar

# 3. 访问 API
curl http://localhost:8083/api/ai/portrait/models
```

---

## 🎉 完成！

当你能看到：

1. ✅ 所有 6 个 API 端点正常响应
2. ✅ 前端能发送请求
3. ✅ 后端能调用国内模型 API
4. ✅ 进度能实时更新
5. ✅ 结果能正确显示

**你就成功了！** 🚀

---

## 📚 下一步

开发完成后，可以考虑：

1. **功能扩展**
   - 支持多个国内模型 (百度、腾讯)
   - 添加缓存层 (Redis)
   - 用户认证系统

2. **性能优化**
   - 图片压缩和缓存
   - 数据库查询优化
   - CDN 加速

3. **运维**
   - Docker 容器化
   - Kubernetes 部署
   - 性能监控和告警

---

**祝你开发愉快！** 🎊

需要帮助？查看 `DEVELOPMENT_CHECKLIST.md` 的详细步骤。

