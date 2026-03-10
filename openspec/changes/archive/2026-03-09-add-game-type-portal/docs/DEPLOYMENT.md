# 游戏类型门户和编辑器 - 部署说明

## 概述

本文档描述了游戏类型门户和编辑器系统的部署流程、环境配置和回滚计划。

---

## 目录

1. [环境要求](#环境要求)
2. [数据库迁移](#数据库迁移)
3. [环境变量配置](#环境变量配置)
4. [部署步骤](#部署步骤)
5. [灰度发布](#灰度发布)
6. [回滚计划](#回滚计划)
7. [监控和日志](#监控和日志)

---

## 环境要求

### 生产环境

#### 服务器要求
- **CPU**: 4 核心以上
- **内存**: 8GB 以上
- **存储**: 50GB 以上 SSD
- **操作系统**: Linux (Ubuntu 20.04+ 或 CentOS 7+)

#### 软件要求
- **Java**: OpenJDK 11 或 Oracle JDK 11+
- **数据库**: MySQL 8.0+
- **Web 服务器**: Nginx 1.18+ 或 Apache 2.4+
- **构建工具**: Maven 3.6+

---

### 测试环境

#### 服务器要求
- **CPU**: 2 核心以上
- **内存**: 4GB 以上
- **存储**: 20GB 以上

#### 软件要求
- **Java**: OpenJDK 11
- **数据库**: MySQL 8.0
- **Web 服务器**: Nginx 1.18

---

## 数据库迁移

### 迁移步骤

#### 1. 备份现有数据库

```bash
# 备份数据库
mysqldump -u root -p writeengine_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 验证备份文件
ls -lh backup_*.sql
```

---

#### 2. 执行迁移脚本

**创建 game 表**

```sql
-- 创建 game 表
CREATE TABLE IF NOT EXISTS `game` (
  `id` VARCHAR(64) PRIMARY KEY COMMENT '游戏 ID',
  `name` VARCHAR(255) NOT NULL COMMENT '游戏名称',
  `type` VARCHAR(32) NOT NULL COMMENT '游戏类型',
  `description` TEXT COMMENT '游戏描述',
  `thumbnail_url` VARCHAR(512) COMMENT '缩略图 URL',
  `metadata` JSON COMMENT '游戏元数据',
  `created_at` BIGINT NOT NULL COMMENT '创建时间',
  `updated_at` BIGINT NOT NULL COMMENT '更新时间',
  `user_id` VARCHAR(64) COMMENT '用户 ID',
  INDEX `idx_type` (`type`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='游戏表';
```

---

**创建 scene 表**

```sql
-- 创建 scene 表（如果不存在）
CREATE TABLE IF NOT EXISTS `scene` (
  `id` VARCHAR(64) PRIMARY KEY COMMENT '场景 ID',
  `game_id` VARCHAR(64) NOT NULL COMMENT '游戏 ID',
  `name` VARCHAR(255) NOT NULL COMMENT '场景名称',
  `data` JSON NOT NULL COMMENT '场景数据',
  `created_at` BIGINT NOT NULL COMMENT '创建时间',
  `updated_at` BIGINT NOT NULL COMMENT '更新时间',
  `user_id` VARCHAR(64) COMMENT '用户 ID',
  FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON DELETE CASCADE,
  INDEX `idx_game_id` (`game_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='场景表';
```

---

**为现有场景数据添加 game_id**

```sql
-- 如果现有场景没有 game_id，需要先添加 game_id 列
ALTER TABLE `scene`
ADD COLUMN `game_id` VARCHAR(64) DEFAULT NULL COMMENT '游戏 ID' AFTER `id`;

-- 为现有场景创建默认游戏记录
INSERT INTO `game` (`id`, `name`, `type`, `description`, `metadata`, `created_at`, `updated_at`, `user_id`)
SELECT
  CONCAT('legacy_game_', scene.id),
  CONCAT('Legacy Game - ', scene.id),
  '3d-legacy',
  '从旧版本迁移的游戏',
  JSON_OBJECT('migrated', true, 'originalSceneId', scene.id),
  scene.created_at,
  scene.updated_at,
  scene.user_id
FROM `scene`
WHERE `scene`.`game_id` IS NULL;

-- 更新现有场景的 game_id
UPDATE `scene` s
INNER JOIN `game` g ON g.metadata->>'$.originalSceneId' = s.id
SET s.game_id = g.id
WHERE s.game_id IS NULL;

-- 为 game_id 列添加非空约束
ALTER TABLE `scene`
MODIFY COLUMN `game_id` VARCHAR(64) NOT NULL COMMENT '游戏 ID';
```

---

#### 3. 验证迁移

```sql
-- 验证 game 表
SELECT COUNT(*) as total_games, `type`, COUNT(*) as count
FROM `game`
GROUP BY `type`;

-- 验证 scene 表的关联
SELECT COUNT(*) as scenes_without_game
FROM `scene` s
LEFT JOIN `game` g ON s.game_id = g.id
WHERE g.id IS NULL;
```

---

## 环境变量配置

### application.properties

```properties
# 应用配置
spring.application.name=writeengine
server.port=8080
server.servlet.context-path=/

# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/writeengine_db?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA 配置
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# 文件上传配置
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB

# 日志配置
logging.level.root=INFO
logging.level.com.example.writemyself=DEBUG
logging.file.path=/var/log/writeengine
logging.file.max-size=10MB
logging.file.max-history=30

# Redis 配置（可选，用于缓存）
spring.redis.host=${REDIS_HOST:localhost}
spring.redis.port=${REDIS_PORT:6379}
spring.redis.password=${REDIS_PASSWORD:}
spring.redis.database=0

# 游戏编辑器配置
game.editor.types=2d-strategy,2d-metroidvania,2d-rpg,3d-shooter
game.editor.max-games-per-user=100
game.editor.auto-save-interval=300000
```

---

### application-prod.properties

```properties
# 生产环境特定配置
spring.profiles.active=prod

# 数据库连接池配置
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000

# 启用压缩
server.compression.enabled=true
server.compression.mime-types=application/json,application/xml,text/html,text/xml,text/plain
server.compression.min-response-size=1024

# 静态资源缓存
spring.web.resources.cache.period=3600
spring.web.resources.chain.cache=true
spring.web.resources.chain.strategy.content.enabled=true
spring.web.resources.chain.strategy.content.paths=/**

# 灰度开关
game.feature.game-portal.enabled=true
game.feature.game-portal.percentage=50
```

---

### 环境变量文件 (.env)

```bash
# 数据库配置
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 应用配置
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

# 灰度配置
GAME_PORTAL_ENABLED=true
GAME_PORTAL_PERCENTAGE=50
```

---

## 部署步骤

### 1. 准备部署包

```bash
# 克隆代码
git clone https://github.com/example/writeengine.git
cd writeengine

# 切换到发布分支
git checkout release/add-game-type-portal

# 构建项目
mvn clean package -DskipTests

# 生成的 JAR 文件位置
ls -lh target/writeengine-*.jar
```

---

### 2. 上传部署包

```bash
# 使用 SCP 上传
scp target/writeengine-1.0.0.jar user@server:/opt/writeengine/

# 或使用 rsync
rsync -avz target/writeengine-1.0.0.jar user@server:/opt/writeengine/
```

---

### 3. 停止旧服务

```bash
# 查找运行中的进程
ps aux | grep writeengine

# 停止服务（使用 systemd）
sudo systemctl stop writeengine

# 或手动停止
pkill -f writeengine

# 确认服务已停止
ps aux | grep writeengine
```

---

### 4. 备份当前版本

```bash
# 创建备份目录
sudo mkdir -p /opt/writeengine/backup

# 备份当前 JAR
sudo cp /opt/writeengine/writeengine.jar /opt/writeengine/backup/writeengine_$(date +%Y%m%d_%H%M%S).jar

# 备份配置文件
sudo cp /opt/writeengine/application.properties /opt/writeengine/backup/application.properties_$(date +%Y%m%d_%H%M%S)
```

---

### 5. 部署新版本

```bash
# 移动新版本
sudo mv writeengine-1.0.0.jar /opt/writeengine/writeengine.jar

# 确保文件权限正确
sudo chmod 644 /opt/writeengine/writeengine.jar
sudo chown writeengine:writeengine /opt/writeengine/writeengine.jar
```

---

### 6. 启动服务

```bash
# 使用 systemd 启动
sudo systemctl start writeengine

# 查看服务状态
sudo systemctl status writeengine

# 查看日志
sudo journalctl -u writeengine -f
```

---

### 7. 验证部署

```bash
# 检查服务是否正常运行
curl http://localhost:8080/health

# 检查门户页面
curl -I http://localhost:8080/create-game/unity

# 检查 API
curl http://localhost:8080/api/game/list

# 检查日志
tail -f /var/log/writeengine/writeengine.log
```

---

## 灰度发布

### 灰度开关配置

#### 后端灰度开关

```java
// src/main/java/com/example/writemyself/config/GamePortalFeature.java
@Configuration
@ConfigurationProperties(prefix = "game.feature.game-portal")
public class GamePortalFeature {
    private boolean enabled = false;
    private int percentage = 0;

    // 检查用户是否在灰度范围内
    public boolean isUserInGrayRelease(String userId) {
        if (!enabled || percentage == 0) {
            return false;
        }
        if (percentage == 100) {
            return true;
        }

        // 基于用户 ID 的哈希值进行灰度分配
        int hash = Math.abs(userId.hashCode());
        return (hash % 100) < percentage;
    }

    // Getters and Setters
}
```

---

#### 前端灰度控制

```javascript
// js/gray-release.js
class GrayRelease {
  constructor() {
    this.enabled = false;
    this.percentage = 0;
  }

  async loadConfig() {
    try {
      const response = await fetch('/api/config/gray-release');
      const config = await response.json();

      this.enabled = config.gamePortal.enabled;
      this.percentage = config.gamePortal.percentage;

      return config;
    } catch (error) {
      console.error('Failed to load gray release config:', error);
      return { gamePortal: { enabled: false, percentage: 0 } };
    }
  }

  isInGrayRelease() {
    if (!this.enabled || this.percentage === 0) {
      return false;
    }
    if (this.percentage === 100) {
      return true;
    }

    const userId = this.getUserId();
    const hash = this.hashCode(userId);
    return (Math.abs(hash) % 100) < this.percentage;
  }

  getUserId() {
    // 从 cookie 或 localStorage 获取用户 ID
    return localStorage.getItem('userId') || this.generateUserId();
  }

  generateUserId() {
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
    return userId;
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }
}

// 使用示例
const grayRelease = new GrayRelease();
await grayRelease.loadConfig();

if (grayRelease.isInGrayRelease()) {
  // 显示新功能
  showGamePortal();
} else {
  // 使用旧版本
  showOldInterface();
}
```

---

### 灰度发布策略

#### 阶段 1: 5% 灰度（1-2 天）

```properties
# application-prod.properties
game.feature.game-portal.enabled=true
game.feature.game-portal.percentage=5
```

**监控指标**:
- 错误率 < 1%
- 平均响应时间 < 500ms
- CPU 使用率 < 70%
- 内存使用率 < 80%

**验证内容**:
- 门户页面正常加载
- 游戏创建功能正常
- 编辑器功能正常
- 数据保存正常

---

#### 阶段 2: 25% 灰度（2-3 天）

```properties
# application-prod.properties
game.feature.game-portal.enabled=true
game.feature.game-portal.percentage=25
```

**监控指标**:
- 错误率 < 0.5%
- 平均响应时间 < 400ms
- 用户满意度 > 90%

---

#### 阶段 3: 50% 灰度（3-5 天）

```properties
# application-prod.properties
game.feature.game-portal.enabled=true
game.feature.game-portal.percentage=50
```

**监控指标**:
- 错误率 < 0.3%
- 平均响应时间 < 300ms
- 功能使用率稳步增长

---

#### 阶段 4: 100% 全量发布

```properties
# application-prod.properties
game.feature.game-portal.enabled=true
game.feature.game-portal.percentage=100
```

**监控指标**:
- 错误率 < 0.1%
- 平均响应时间 < 200ms
- 无严重 Bug

---

## 回滚计划

### 回滚条件

满足以下任一条件时触发回滚：
- 错误率 > 5%
- 平均响应时间 > 2s
- 数据库查询超时 > 10%
- 严重 Bug 影响核心功能
- 用户投诉量激增

---

### 回滚步骤

#### 1. 紧急回滚（服务级别）

```bash
# 立即停止服务
sudo systemctl stop writeengine

# 恢复备份的 JAR
sudo cp /opt/writeengine/backup/writeengine_YYYYMMDD_HHMMSS.jar /opt/writeengine/writeengine.jar

# 恢复配置文件
sudo cp /opt/writeengine/backup/application.properties_YYYYMMDD_HHMMSS /opt/writeengine/application.properties

# 重启服务
sudo systemctl start writeengine

# 验证服务
sudo systemctl status writeengine
curl http://localhost:8080/health
```

---

#### 2. 灰度回滚（功能级别）

```bash
# 修改配置文件，降低灰度比例
sudo vi /opt/writeengine/application-prod.properties

# 降低灰度比例到之前稳定的状态
game.feature.game-portal.enabled=true
game.feature.game-portal.percentage=5

# 重启服务使配置生效
sudo systemctl restart writeengine
```

---

#### 3. 数据库回滚（如有必要）

```bash
# 恢复数据库备份
mysql -u root -p writeengine_db < backup_YYYYMMDD_HHMMSS.sql

# 或回滚特定的迁移脚本
mysql -u root -p writeengine_db < rollback_migration.sql
```

---

### 回滚验证

```bash
# 检查服务状态
sudo systemctl status writeengine

# 检查日志
sudo journalctl -u writeengine -n 100

# 检查关键功能
curl http://localhost:8080/health
curl http://localhost:8080/api/game/list

# 检查数据库
mysql -u root -p -e "SELECT COUNT(*) FROM game; USE writeengine_db;"

# 检查错误日志
tail -f /var/log/writeengine/error.log
```

---

## 监控和日志

### 日志配置

#### 日志级别

```properties
# 开发环境
logging.level.root=DEBUG
logging.level.com.example.writemyself=DEBUG

# 生产环境
logging.level.root=INFO
logging.level.com.example.writemyself=WARN

# 特定功能的调试
logging.level.com.example.writemyself.service.GameService=DEBUG
logging.level.com.example.writemyself.controller.GameController=DEBUG
```

---

#### 日志格式

```properties
# JSON 格式日志（适合 ELK）
logging.format=json

# 或使用文本格式
logging.pattern=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

---

### 监控指标

#### 应用性能指标

1. **响应时间**
   - P50 响应时间
   - P95 响应时间
   - P99 响应时间

2. **吞吐量**
   - 每秒请求数（RPS）
   - 每秒游戏创建数
   - 每秒场景保存数

3. **错误率**
   - HTTP 4xx 错误率
   - HTTP 5xx 错误率
   - 业务逻辑错误率

4. **资源使用**
   - CPU 使用率
   - 内存使用率
   - 磁盘 I/O
   - 网络流量

---

#### 业务指标

1. **用户指标**
   - 日活用户数（DAU）
   - 月活用户数（MAU）
   - 新用户注册数

2. **游戏指标**
   - 游戏创建数量
   - 游戏保存次数
   - 游戏类型分布

3. **编辑器指标**
   - 编辑器平均使用时长
   - 功能使用频率
   - 用户满意度评分

---

### 监控工具

#### Prometheus + Grafana

**Prometheus 配置**

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'writeengine'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/actuator/prometheus'
```

**Grafana 仪表板**

创建包含以下面板的仪表板：
- JVM 内存使用
- GC 时间
- HTTP 请求率
- 响应时间分布
- 错误率
- 数据库连接池

---

#### ELK Stack（Elasticsearch + Logstash + Kibana）

**Logstash 配置**

```conf
input {
  file {
    path => "/var/log/writeengine/*.log"
    start_position => "beginning"
  }
}

filter {
  grok {
    match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
  }
}

output {
  elasticsearch {
    hosts => ["http://localhost:9200"]
    index => "writeengine-%{+YYYY.MM.dd}"
  }
}
```

---

#### 应用健康检查

```bash
# 添加健康检查端点
curl http://localhost:8080/health

# 响应示例
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "disk": { "status": "UP" },
    "redis": { "status": "UP" }
  },
  "uptime": 3600000
}
```

---

### 告警配置

#### 告警规则示例

```yaml
# Prometheus 告警规则
groups:
  - name: writeengine_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} for the last 5 minutes"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "P95 response time is {{ $value }}s"

      - alert: HighCPUUsage
        expr: cpu_usage_percent > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is {{ $value }}%"
```

---

## 技术支持

### 联系方式

- **运维团队**: ops@example.com
- **开发团队**: dev@example.com
- **紧急热线**: +86-xxx-xxxx-xxxx

### 常见问题

**Q: 部署失败怎么办？**

A: 按照以下步骤排查：
1. 检查日志文件 `/var/log/writeengine/error.log`
2. 验证数据库连接
3. 检查端口占用
4. 确认 Java 版本

**Q: 数据库迁移失败？**

A: 立即执行回滚：
1. 恢复数据库备份
2. 停止服务
3. 联系 DBA

**Q: 性能下降严重？**

A: 立即降低灰度比例或执行回滚：
1. 修改灰度配置
2. 重启服务
3. 监控性能指标

---

**版本**: 1.0.0
**最后更新**: 2026-02-27
**维护人员**: 运维团队

