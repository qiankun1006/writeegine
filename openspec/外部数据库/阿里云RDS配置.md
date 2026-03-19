# 阿里云 RDS MySQL 配置指南

## 概述

本文档指导如何连接阿里云 PolarDB/RDS MySQL 数据库，用于生产环境或远程开发。

---

## 连接信息

### 实例基本信息

- **实例 ID**: pc-bp115a6i7ilqwtn5h
- **实例类型**: PolarDB MySQL
- **数据库**: qiankun_96_01
- **端口**: 3306

### 可用的连接地址

#### 内网地址（推荐用于 VPC 内访问）

```
地址: dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com
端口: 3306
协议: MySQL
```

#### 公网地址（需要 VPC 配置）

```
地址: dphzpl-rpt15xs8cywgchyy-pub.proxy.dms.aliyuncs.com
端口: 3306
协议: MySQL (已弃用，可能无法解析)
```

#### 主域名（推荐备选）

```
地址: mysql.polardb.rds.aliyuncs.com
端口: 3306
协议: MySQL
```

---

## 常见连接问题

### 问题1：DNS 解析失败

**错误信息**:
```
nodename nor servername provided, or not known
```

**原因**: 公网地址 (`-pub`) 在某些网络环境中无法解析

**解决方案**:

1. **使用内网地址**（如果在 VPC 内）
   ```
   Host: dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com
   ```

2. **使用主域名**（如果无法使用内网）
   ```
   Host: mysql.polardb.rds.aliyuncs.com
   ```

### 问题2：连接被拒绝

**错误信息**:
```
Access denied for user
```

**排查步骤**:

1. 验证用户名和密码正确
2. 检查账户是否有访问权限
3. 验证数据库名称是否正确

### 问题3：网络连接超时

**错误信息**:
```
Can't connect to MySQL server
Connection refused
```

**排查步骤**:

1. 检查网络连接：
   ```bash
   nc -zv dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com 3306
   ```

2. 检查防火墙规则和安全组配置

3. 确认 RDS 实例是否启动

---

## Spring Boot 配置

### 生产环境配置

编辑 `src/main/resources/application-prod.properties`：

```properties
# ============================================
# 生产环境数据库配置（阿里云 RDS）
# ============================================

# 应用名称
spring.application.name=writeMyself

# ============================================
# 数据源配置
# ============================================

# 阿里云 RDS 内网地址
spring.datasource.url=jdbc:mysql://dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com:3306/qiankun_96_01
spring.datasource.username=panquanhaha
spring.datasource.password=${DB_PASSWORD}
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
logging.level.org.springframework.boot.jdbc.DataSourceBuilder=DEBUG

# ============================================
# 服务器配置
# ============================================

server.port=8083
```

### 环境变量配置

为了安全性，使用环境变量管理密码：

```bash
# 设置环境变量
export DB_PASSWORD="your_actual_password"

# 启动应用
java -jar target/writeengine.jar --spring.profiles.active=prod
```

---

## IDE 连接配置

### JetBrains IDE（IntelliJ IDEA）

1. **打开数据库连接窗口**
   - View → Tool Windows → Database

2. **新建连接**
   - 点击 "+" → Data Source → MySQL

3. **填写连接信息**

| 字段 | 值 |
|------|-----|
| Name | aliyun |
| Host | dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com |
| Port | 3306 |
| Database | qiankun_96_01 |
| User | panquanhaha |
| Password | (你的密码) |

4. **测试连接**
   - 点击 "Test Connection"

### DBeaver

1. **新建连接**
   - Database → New Database Connection → MySQL

2. **填写连接参数**

| 字段 | 值 |
|------|-----|
| Server Host | dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com |
| Port | 3306 |
| Database | qiankun_96_01 |
| Username | panquanhaha |
| Password | (你的密码) |

3. **测试连接**

### MySQL CLI

```bash
# 使用内网地址连接
mysql -h dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com \
       -P 3306 \
       -u panquanhaha \
       -p qiankun_96_01

# 输入密码后回车
```

---

## 诊断命令

### 网络连接测试

```bash
# 测试内网地址
nc -zv dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com 3306

# DNS 查询
nslookup dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com

# 使用 dig
dig dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com
```

### MySQL 连接测试

```bash
# 直接连接测试
mysql -h dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com \
       -u panquanhaha -p -e "SELECT VERSION();"
```

---

## 安全建议

1. **密码管理**
   - 不要在代码或配置文件中硬编码密码
   - 使用环境变量或密钥管理服务

2. **访问控制**
   - 配置安全组规则
   - 只允许必要的 IP 地址访问
   - 使用 VPC 内网连接而非公网

3. **监控和告警**
   - 启用阿里云数据库监控
   - 设置连接数、性能等告警

4. **备份策略**
   - 使用阿里云自动备份
   - 定期下载备份到本地

5. **SSL/TLS 连接**
   - 启用加密连接（可选）
   - 在连接 URL 中添加 SSL 参数

---

## 数据库维护

### 备份

```bash
# 备份整个数据库到本地
mysqldump -h dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com \
          -u panquanhaha -p \
          qiankun_96_01 > write_engine_backup.sql
```

### 恢复

```bash
# 从备份恢复
mysql -h dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com \
      -u panquanhaha -p \
      qiankun_96_01 < write_engine_backup.sql
```

### 监控

通过阿里云控制台检查：

1. **性能指标**
   - 连接数
   - 查询速度
   - 慢查询日志

2. **空间使用**
   - 数据库大小
   - 剩余容量

3. **事件日志**
   - 实例操作历史
   - 故障记录

---

## 常见操作

### 查看数据库版本

```sql
SELECT VERSION();
```

### 查看字符集

```sql
SHOW VARIABLES LIKE 'character_set%';
```

### 查看所有表

```sql
USE qiankun_96_01;
SHOW TABLES;
```

### 查看表大小

```sql
SELECT
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = 'qiankun_96_01'
ORDER BY (data_length + index_length) DESC;
```

---

## 成本优化

1. **选择合适的规格**
   - 根据实际需求选择 CPU、内存、存储
   - 避免过度配置

2. **使用预留实例**
   - 长期使用可享受折扣

3. **定期清理**
   - 删除过期数据
   - 优化索引

4. **备份策略**
   - 调整备份保留时间
   - 选择成本低的备份存储

---

## 相关资源

- **阿里云 PolarDB 文档**: https://help.aliyun.com/product/26588.html
- **MySQL 官方文档**: https://dev.mysql.com/doc/
- **Spring Boot 数据库配置**: https://spring.io/guides/gs/accessing-data-mysql/

---

## 支持和帮助

- **阿里云官方支持**: https://www.aliyun.com/support/
- **工单提交**: 通过阿里云控制台提交工单
- **社区论坛**: https://bbs.aliyun.com/

---

**最后更新**: 2026-03-19
**维护人**: WriteEngine 项目组

