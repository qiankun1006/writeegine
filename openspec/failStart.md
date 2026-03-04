# 应用启动失败 - 端口 8083 已被占用

## 问题
```
Web server failed to start. Port 8083 was already in use.
```

## 解决方案

### 方式 1: 杀死占用端口的进程（推荐）

**查看占用端口的进程：**
```bash
lsof -i :8083
```

**杀死进程：**
```bash
# 获取 PID 后杀死
kill -9 <PID>

# 或一行命令完成
lsof -i :8083 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### 方式 2: 更改应用端口

```bash
java -jar target/writeMyself-0.0.1-SNAPSHOT.jar --server.port=8084
```

## 快速重启脚本

```bash
# 停止旧进程并启动新应用（端口 8083）
lsof -i :8083 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null; \
sleep 2 && cd /Users/qiankun96/Desktop/meituan/writeengine && \
java -jar target/writeMyself-0.0.1-SNAPSHOT.jar --server.port=8083 > /tmp/writeengine.log 2>&1 &
```

## 验证

```bash
# 验证应用是否启动成功
curl http://localhost:8083/

# 查看应用日志
tail -f /tmp/writeengine.log

---

# AI 肖像后端启动失败问题（2026-03-04）

## 问题背景
新增 `add-ai-portrait-backend` 提案后，Spring Boot 应用编译成功但启动失败。

## 错误列表与解决方案

### 1. JPA 实体索引列名映射问题

**错误现象：**
```
org.hibernate.AnnotationException: Unable to create index (user_id) on table ai_portrait_resource_library:
database column 'user_id' not found.
```

**原因分析：**
JPA 实体字段使用驼峰命名（如 `userId`），但在 `@Index` 注解中使用了数据库列名（下划线格式 `user_id`），导致 Hibernate 命名策略不一致。

**解决方案：**
将 `@Index` 注解中的 `columnList` 改为 Java 字段名（驼峰形式）：

```java
// 修改前
@Index(name = "idx_user_id", columnList = "user_id")

// 修改后
@Index(name = "idx_user_id", columnList = "userId")
```

**涉及文件：**
- `AIPortraitResourceLibrary.java`
- `AIPortraitModelConfig.java`
- `AIPortraitTask.java`
- `AIPortraitUserPreset.java`
- `AIPortraitGeneration.java`

**技术要点：**
- Spring Boot 使用 `SpringPhysicalNamingStrategy` 自动将驼峰字段名转换为下划线列名
- 实体索引定义应使用 Java 字段名而非数据库列名
- 避免在字段上使用显式的 `@Column(name="...")` 注解，让命名策略自动处理

### 2. 控制器映射冲突

**错误现象：**
```
Ambiguous mapping. Cannot map 'errorHandlingController' method
com.example.writemyself.controller.ErrorHandlingController#handleError(HttpServletRequest, Model)
```

**原因分析：**
自定义的 `ErrorHandlingController` 映射了 `/handle-error` 路径，与 Spring Boot 的 `BasicErrorController`（通过 `server.error.path=/handle-error` 配置）冲突。

**解决方案：**
注释掉 `ErrorHandlingController.java` 中的 `@Controller` 注解：
```java
//@Controller
public class ErrorHandlingController { ... }
```

**替代方案：**
1. 更改 `ErrorHandlingController` 的请求路径
2. 修改 `application.properties` 中的 `server.error.path` 配置
3. 禁用 Spring Boot 默认的错误处理机制

### 3. H2 数据库驱动加载失败

**错误现象：**
```
Cannot load driver class: org.h2.Driver
```

**原因分析：**
`pom.xml` 中 H2 依赖的 scope 为 `runtime`，导致编译时驱动类不可见。

**解决方案：**
修改 `pom.xml`，移除 H2 依赖的 scope（默认为 compile）：
```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <!-- 移除 scope="runtime" -->
</dependency>
```

## 验证结果

应用成功启动日志：
```
2026-03-04 21:15:24.225  INFO 64777 --- [           main] c.e.writemyself.WriteMyselfApplication   : Started WriteMyselfApplication in 9.601 seconds (JVM running for 10.048)
```

## 经验总结

1. **JPA 索引命名一致性**：始终使用 Java 字段名定义索引，让框架处理数据库列名转换
2. **控制器路径冲突检查**：自定义控制器避免与 Spring Boot 内置端点路径重叠
3. **数据库驱动类路径**：确保运行时依赖在 `mvn spring-boot:run` 时可用
4. **启动问题排查顺序**：
   - 检查编译错误 → 端口占用 → JPA 配置 → 控制器映射
   - 使用 `mvn spring-boot:run` 而非直接运行 jar 以获取完整日志

## 快速诊断命令

```bash
# 检查应用启动状态
mvn spring-boot:run -DskipTests 2>&1 | grep -E "Started|ERROR|FAILED|Exception"

# 查看详细错误
mvn spring-boot:run -DskipTests -e

# 清理并重新编译
mvn clean compile -DskipTests && mvn spring-boot:run -DskipTests

