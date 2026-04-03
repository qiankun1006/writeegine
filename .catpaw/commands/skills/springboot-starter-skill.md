---
name: springboot-starter
description: "启动 WriteMyself Spring Boot 应用。用于快速启动项目应用服务，默认监听 8083 端口。包含项目构建、应用启动和启动状态验证等功能。"
---

# Spring Boot 应用启动工具

这个 Skill 用于启动 WriteMyself Spring Boot 应用，包括自动编译、打包和启动，并等待应用完全启动。

## 快速开始

### 启动应用（推荐方式）

启动应用并智能检测启动状态（等待 30 秒后开始检测）：

```bash
cd /Users/qiankun96/Desktop/历史项目/writeengine && mvn clean package -DskipTests -q && java -jar target/*.jar --server.port=8083 &
sleep 30
for i in {1..8}; do echo "检查第 $i 次..."; curl -s http://localhost:8083/ > /dev/null 2>&1 && echo "✅ 应用已启动！" && break; sleep 15; done
```

**说明：**
- 启动应用后先等待 30 秒
- 30 秒后开始第 1 次检测
- 之后每 15 秒检查一次是否成功
- 最多检查 8 次（共 2 分钟），通常 45-120 秒内会启动成功
- 启动成功后立即显示成功消息并停止检查

## 工作流

### 步骤 1：编译打包项目

将 Maven 项目编译并打包成可执行的 JAR 文件：

```bash
cd /Users/qiankun96/Desktop/历史项目/writeengine
mvn clean package -DskipTests -q
```

**参数说明：**
- `clean`: 清理之前的编译结果
- `package`: 打包项目
- `-DskipTests`: 跳过测试，加快构建速度
- `-q`: 静默模式，减少控制台输出

### 步骤 2：启动 Spring Boot 应用

编译完成后，启动应用：

```bash
java -jar target/*.jar --server.port=8083
```

**参数说明：**
- `target/*.jar`: 自动匹配编译生成的 JAR 文件
- `--server.port=8083`: 设置应用监听端口为 8083

## 一键启动命令

### 标准一键启动（推荐）

结合编译、启动和智能检测，一条命令完成所有操作：

```bash
cd /Users/qiankun96/Desktop/历史项目/writeengine && mvn clean package -DskipTests -q && java -jar target/*.jar --server.port=8083 &
sleep 30
for i in {1..8}; do echo "检查第 $i 次..."; curl -s http://localhost:8083/ > /dev/null 2>&1 && echo "✅ 应用已启动！访问 http://localhost:8083/" && break; sleep 15; done
```

### 简化版（仅启动，不检测）

如果只想启动应用，不需要检测状态：

```bash
cd /Users/qiankun96/Desktop/历史项目/writeengine && mvn clean package -DskipTests -q && java -jar target/*.jar --server.port=8083
```

**预计耗时：**
- 第一次构建：3-5 分钟（下载依赖）
- 之后构建：1-2 分钟
- 智能检测：通常 30-60 秒内完成

## 后台启动并智能检测

后台启动应用，然后自动检测启动状态：

```bash
cd /Users/qiankun96/Desktop/历史项目/writeengine && mvn clean package -DskipTests -q && java -jar target/*.jar --server.port=8083 &
sleep 30
for i in {1..8}; do echo "检查第 $i 次..."; curl -s http://localhost:8083/ > /dev/null 2>&1 && echo "✅ 应用已启动！" && break; sleep 15; done
```

**检测流程：**
- ⏳ 等待 30 秒后开始检测
- 🔍 第 1 次检查（30 秒后）
- 🔍 第 2 次检查（45 秒后）
- 🔍 第 3 次检查（60 秒后）
- ✅ 通常在第 1-2 次就会成功

## 验证应用是否启动成功

### 方法 1：curl 测试

```bash
curl -s http://localhost:8083/ | head -10
```

如果看到 HTML 响应，说明应用已启动。

### 方法 2：检查端口

```bash
lsof -i :8083
```

如果显示 java 进程监听 8083 端口，应用已启动。

### 方法 3：使用浏览器测试

访问 `http://localhost:8083/` 查看首页。

## 停止应用

### 方式 1：使用 Ctrl+C（前台运行）

如果应用在前台运行，直接按 `Ctrl+C` 停止。

### 方式 2：查找并杀死进程（后台运行）

```bash
# 找到 Java 进程
ps aux | grep java

# 杀死指定进程（替换 PID 为实际进程 ID）
kill -9 PID
```

### 方式 3：使用 lsof 查找并杀死

```bash
# 查找监听 8083 端口的进程
lsof -i :8083

# 杀死该进程
kill -9 <PID>
```

## 常见问题

### Q: 构建失败，提示"Maven command not found"

**A:** 确保已安装 Maven，运行 `mvn --version` 检查。如果未安装，需要先安装 Maven。

### Q: 应用启动失败，显示"Address already in use"

**A:** 8083 端口已被占用，要么：
1. 改用其他端口：`--server.port=8084`
2. 杀死占用端口的进程：`kill -9 $(lsof -t -i:8083)`

### Q: 页面无法加载，显示"Connection refused"

**A:** 应用还在启动中，请等待 1-2 分钟后重试。查看日志确认启动是否成功。

### Q: 修改了代码后，需要重新启动

**A:** 需要重新运行完整的编译和启动命令：

```bash
cd /Users/qiankun96/Desktop/历史项目/writeengine && mvn clean package -DskipTests -q && java -jar target/*.jar --server.port=8083
```

## 应用信息

- **项目名称**: WriteMyself - 游戏创作平台
- **类型**: Spring Boot Web 应用
- **默认端口**: 8083
- **主类**: com.example.writemyself.WriteMyselfApplication
- **项目路径**: /Users/qiankun96/Desktop/历史项目/writeengine

## 项目结构

```
writeengine/
├── src/
│   ├── main/
│   │   ├── java/com/example/writemyself/
│   │   └── resources/
│   └── test/
├── target/              # 编译输出目录
├── pom.xml             # Maven 配置文件
└── logs/               # 应用日志目录
```

## 完整工作流示例

1. **启动应用并自动检测**（等待 30 秒后开始检测，通常 45-120 秒完成）：
   ```bash
   cd /Users/qiankun96/Desktop/历史项目/writeengine && mvn clean package -DskipTests -q && java -jar target/*.jar --server.port=8083 &
   sleep 30
   for i in {1..8}; do echo "检查第 $i 次..."; curl -s http://localhost:8083/ > /dev/null 2>&1 && echo "✅ 应用已启动！" && break; sleep 15; done
   ```

2. **等待智能检测完成**（看到 "✅ 应用已启动！" 表示成功，通常在 30-60 秒内就会成功）

3. **在浏览器中访问**：
   ```
   http://localhost:8083/
   ```

4. **进行开发和测试**

5. **修改代码后，重新运行启动命令**

## 常用开发命令组合

### 推荐方案：编译 → 启动 → 智能检测

```bash
# 一条命令完成所有操作
cd /Users/qiankun96/Desktop/历史项目/writeengine && mvn clean package -DskipTests -q && java -jar target/*.jar --server.port=8083 &
sleep 30
for i in {1..8}; do echo "检查第 $i 次..."; curl -s http://localhost:8083/ > /dev/null 2>&1 && echo "✅ 应用已启动，访问 http://localhost:8083/" && break; sleep 15; done
```

### 后台启动并保存 PID 和日志

```bash
cd /Users/qiankun96/Desktop/历史项目/writeengine && \
mvn clean package -DskipTests -q && \
java -jar target/*.jar --server.port=8083 > /tmp/springboot.log 2>&1 &
PID=$!
echo $PID > /tmp/springboot.pid
echo "后台启动成功，PID: $PID，日志：/tmp/springboot.log"
sleep 30
for i in {1..8}; do echo "检查第 $i 次..."; curl -s http://localhost:8083/ > /dev/null 2>&1 && echo "✅ 应用已启动！" && break; sleep 15; done
```

### 快速重启（已编译过的情况）

如果已经编译过，直接启动而不需要重新编译：

```bash
cd /Users/qiankun96/Desktop/历史项目/writeengine && java -jar target/*.jar --server.port=8083 &
sleep 30
for i in {1..8}; do echo "检查第 $i 次..."; curl -s http://localhost:8083/ > /dev/null 2>&1 && echo "✅ 应用已启动！" && break; sleep 15; done
```

## 提示

- 首次启动会下载 Maven 依赖，可能需要较长时间，请耐心等待
- 如果网络较慢，可以考虑使用本地 Maven 镜像
- 开发时可以使用 IDE 的 Run 按钮直接启动，更快更方便
- 生产环境部署时，建议使用 Docker 或其他容器化方案

