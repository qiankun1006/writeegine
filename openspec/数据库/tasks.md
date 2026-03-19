# 本地数据库安装、连接与建库建表

## 概述

本文档指导你如何在本地开发环境安装 MySQL 数据库，并建立 WriteEngine 项目所需的数据库和表结构。

---

## 前置条件

- macOS 或 Linux 系统
- Homebrew（macOS）或相应的包管理器
- MySQL 8.0+
- Java 11+

---

## 第1步：安装 MySQL

### 方式一：使用 Homebrew（推荐）

```bash
# 1. 安装 MySQL
brew install mysql

# 2. 启动 MySQL 服务
brew services start mysql

# 3. 验证安装
mysql --version
```

### 方式二：使用 Docker（无需本地安装）

```bash
# 拉取 MySQL 8.0 镜像
docker pull mysql:8.0

# 启动容器
docker run --name mysql \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=write_engine \
  -p 3306:3306 \
  -d mysql:8.0

# 验证容器
docker ps | grep mysql
```

### 方式三：下载 DMG 安装包

访问 [MySQL 官方下载页面](https://dev.mysql.com/downloads/mysql/) 下载 macOS 版本

---

## [ ] 第2步：连接到 MySQL

### 首次连接（无密码）

```bash
# 使用 root 用户登录
mysql -u root

# 或者指定主机
mysql -h localhost -u root
```

### 设置 root 密码

```bash
# 登录到 MySQL
mysql -u root

# 在 MySQL 命令行执行
ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';
FLUSH PRIVILEGES;
EXIT;
```

### 使用密码登录

```bash
mysql -u root -p
# 输入密码：123456
```

---

## 第3步：创建数据库和用户

### 创建数据库

```sql
-- 登录 MySQL 后执行以下命令

-- 创建数据库
CREATE DATABASE IF NOT EXISTS write_engine
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 验证创建
SHOW DATABASES;
```

### 创建开发用户（可选）

```sql
-- 创建用户
CREATE USER 'write_user'@'localhost' IDENTIFIED BY '123456';

-- 授予权限
GRANT ALL PRIVILEGES ON write_engine.* TO 'write_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 验证
SELECT user, host FROM mysql.user;
```

### 完整初始化脚本

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS write_engine
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 选择数据库
USE write_engine;

-- 创建用户
CREATE USER IF NOT EXISTS 'write_user'@'localhost' IDENTIFIED BY '123456';

-- 授予权限
GRANT ALL PRIVILEGES ON write_engine.* TO 'write_user'@'localhost';
GRANT ALL PRIVILEGES ON write_engine.* TO 'root'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 验证
SHOW GRANTS FOR 'write_user'@'localhost';
```

---

## 第4步：导入表结构

### 方式一：使用 SQL 脚本文件导入

```bash
# 找到迁移脚本
cd /Users/qiankun96/Desktop/历史项目/writeengine

# 导入表结构
mysql -u root -p write_engine < src/main/resources/db/migration/V1__create_tables.sql

# 或者使用 write_user 账户
mysql -u write_user -p write_engine < src/main/resources/db/migration/V1__create_tables.sql
```

### 方式二：手动导入（在 MySQL 中执行）

```bash
# 1. 登录 MySQL
mysql -u root -p write_engine

# 2. 使用 source 命令导入
mysql> source /Users/qiankun96/Desktop/历史项目/writeengine/src/main/resources/db/migration/V1__create_tables.sql;

# 3. 验证
mysql> SHOW TABLES;
```

### 方式三：从 IDE 导入

如果使用 JetBrains IDE（IntelliJ IDEA）：

1. 打开 SQL 脚本文件 `src/main/resources/db/migration/V1__create_tables.sql`
2. 右键选择 "Execute" 或 "Run SQL Script"
3. 选择本地数据库连接

---

## 第5步：验证数据库和表结构

### 查看数据库

```sql
-- 查看所有数据库
SHOW DATABASES;

-- 选择数据库
USE write_engine;

-- 查看字符集
SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
FROM INFORMATION_SCHEMA.SCHEMATA
WHERE SCHEMA_NAME = 'write_engine';
```

### 查看表

```sql
-- 查看所有表
SHOW TABLES;

-- 查看表的详细信息
DESCRIBE game;
DESCRIBE ai_portrait_task;
DESCRIBE ai_portrait_generation;
DESCRIBE ai_portrait_model_config;
DESCRIBE user;
DESCRIBE system_config;
DESCRIBE operation_log;
DESCRIBE file_storage;
```

### 查看表的创建语句

```sql
-- 查看表创建语句
SHOW CREATE TABLE game\G

-- 查看索引
SHOW INDEX FROM game;
```

### 完整验证脚本

```sql
USE write_engine;

-- 1. 查看所有表
SHOW TABLES;

-- 2. 查看表数量
SELECT COUNT(*) as table_count
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'write_engine';

-- 3. 查看字符集
SELECT DEFAULT_CHARACTER_SET_NAME FROM INFORMATION_SCHEMA.SCHEMATA
WHERE SCHEMA_NAME = 'write_engine';

-- 4. 验证关键表存在
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'write_engine'
AND TABLE_NAME IN ('game', 'ai_portrait_task', 'ai_portrait_generation', 'ai_portrait_model_config');
```

---

## 第6步：配置 Spring Boot 连接

### 编辑配置文件

创建或编辑 `src/main/resources/application-dev.properties`：

```properties
# ============================================
# 开发环境数据库配置（本地）
# ============================================

# 应用名称
spring.application.name=writeMyself

# ============================================
# 数据源配置
# ============================================

# 本地 MySQL 连接
spring.datasource.url=jdbc:mysql://localhost:3306/write_engine
spring.datasource.username=root
spring.datasource.password=123456
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# ============================================
# 连接池配置（HikariCP）
# ============================================

spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000

# ============================================
# Flyway 迁移配置
# ============================================

spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true

# ============================================
# MyBatis 配置
# ============================================

mybatis.mapper-locations=classpath:mapper/*.xml
mybatis.type-aliases-package=com.example.writemyself.entity
mybatis.configuration.map-underscore-to-camel-case=true

# ============================================
# JPA 配置
# ============================================

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# ============================================
# 日志配置
# ============================================

logging.level.com.example.writemyself.mapper=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.springframework.boot.jdbc.DataSourceBuilder=DEBUG

# ============================================
# 服务器配置
# ============================================

server.port=8083
server.error.whitelabel.enabled=false
server.error.include-message=always
server.error.include-binding-errors=always
server.error.include-stacktrace=on_param
```

### 使用开发配置启动

```bash
# 方式一：使用 Maven 启动
mvn spring-boot:run -Pdev

# 方式二：使用 jar 启动
java -jar target/writeengine.jar --spring.profiles.active=dev

# 方式三：IDE 运行（设置 VM options）
-Dspring.profiles.active=dev
```

---

## 第7步：验证 Spring Boot 连接

### 通过日志验证

启动应用后，查看控制台日志：

```
HikariPool - 1 - Starting...
HikariPool - 1 - Start completed.
Flyway - Database: MySQL 8.0.x
Flyway - Successfully validated 1 migration
```

### 创建测试 Controller

```java
@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/db")
    public Map<String, Object> checkDatabase() {
        Map<String, Object> result = new HashMap<>();
        try (Connection conn = dataSource.getConnection()) {
            result.put("status", "connected");
            result.put("database", conn.getCatalog());
            result.put("url", conn.getMetaData().getURL());
        } catch (SQLException e) {
            result.put("status", "failed");
            result.put("error", e.getMessage());
        }
        return result;
    }
}
```

访问 `http://localhost:8083/api/health/db` 验证连接。

---

## 常见问题排查

### 问题1：连接被拒绝

```
ERROR: Access denied for user 'root'@'localhost' (using password: YES)
```

**解决方案**:
```bash
# 1. 验证 MySQL 是否运行
brew services list

# 2. 重启 MySQL
brew services restart mysql

# 3. 检查密码
mysql -u root -p

# 4. 重置 root 密码
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
```

### 问题2：数据库不存在

```
ERROR: Unknown database 'write_engine'
```

**解决方案**:
```sql
-- 检查数据库是否存在
SHOW DATABASES;

-- 如果不存在，创建
CREATE DATABASE write_engine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 问题3：表不存在

```
ERROR: Table 'write_engine.game' doesn't exist
```

**解决方案**:
```bash
# 重新导入迁移脚本
mysql -u root -p write_engine < src/main/resources/db/migration/V1__create_tables.sql

# 或查看是否导入成功
mysql -u root -p write_engine -e "SHOW TABLES;"
```

### 问题4：字符集问题

```
ERROR: Incorrect string value: '\xE4\xB8\xAD\xE6\x96\x87' for column
```

**解决方案**:
```sql
-- 修改表字符集
ALTER TABLE game CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 或重新创建数据库
DROP DATABASE write_engine;
CREATE DATABASE write_engine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 问题5：端口被占用

```
ERROR: Can't connect to MySQL server on 'localhost' (61)
```

**解决方案**:
```bash
# 查看端口占用
lsof -i :3306

# 杀死进程
kill -9 <PID>

# 或改用其他端口
# 在 application-dev.properties 中修改
spring.datasource.url=jdbc:mysql://localhost:3307/write_engine
```

---

## 数据库维护命令

### 备份数据库

```bash
# 备份整个数据库
mysqldump -u root -p write_engine > write_engine_backup.sql

# 备份特定表
mysqldump -u root -p write_engine game ai_portrait_task > tables_backup.sql
```

### 恢复数据库

```bash
# 恢复整个数据库
mysql -u root -p write_engine < write_engine_backup.sql

# 恢复到新数据库
mysql -u root -p new_database < write_engine_backup.sql
```

### 查看 MySQL 状态

```bash
# 查看服务状态
brew services list

# 查看进程
ps aux | grep mysql

# 查看日志
tail -f /usr/local/var/log/mysql/error.log
```

### 启动/停止/重启

```bash
# 启动
brew services start mysql

# 停止
brew services stop mysql

# 重启
brew services restart mysql

# 卸载
brew uninstall mysql
```

---

## 快速检查清单

部署前请检查以下项目：

- [ ] MySQL 已安装并运行：`brew services list`
- [ ] 可以连接到 MySQL：`mysql -u root -p`
- [ ] 数据库 `write_engine` 已创建：`SHOW DATABASES;`
- [ ] 所有表已导入：`USE write_engine; SHOW TABLES;`
- [ ] 字符集正确：`utf8mb4_unicode_ci`
- [ ] `application-dev.properties` 已配置
- [ ] Spring Boot 可以成功启动
- [ ] 访问 `/api/health/db` 返回 `connected`

---

## 后续步骤

1. **初始化数据**：参考 [初始化数据与常用查询](./初始化数据与常用查询.md) 的初始化部分
2. **常用查询**：参考 [初始化数据与常用查询](./初始化数据与常用查询.md) 学习常用查询
3. **性能优化**：参考 [表结构设计](./表结构设计.md) 的索引设计
4. **API 开发**：参考 [MyBatis与Repository模式](./MyBatis与Repository模式.md) 进行数据访问开发

---

## 相关资源

- **MySQL 官方文档**: https://dev.mysql.com/doc/
- **MyBatis 文档**: https://mybatis.org/mybatis-3/
- **Spring Boot 数据库配置**: https://spring.io/guides/gs/accessing-data-mysql/
- **Flyway 迁移**: https://flywaydb.org/documentation/

---

**最后更新**: 2026-03-19
**维护人**: WriteEngine 项目组

