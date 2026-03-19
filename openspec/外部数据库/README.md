# 外部数据库集成文档

本目录包含与外部云数据库（如阿里云 RDS）集成相关的文档和配置指南。

## 📁 文档结构

### 1. 📋 [阿里云 RDS 配置](./阿里云RDS配置.md)

**内容**:
- 阿里云 PolarDB/RDS MySQL 连接信息
- 内网/公网/主域名地址说明
- 常见连接问题诊断
- IDE（IntelliJ、DBeaver）连接配置
- Spring Boot 生产环境配置
- 网络诊断命令
- 数据库备份和恢复
- 安全建议

**适用场景**:
- 生产环境部署
- 远程开发连接
- 云数据库集成

**所有者**: 运维团队、架构师

---

## 🔗 快速连接指南

### 内网连接（推荐）

```properties
# Spring Boot 配置
spring.datasource.url=jdbc:mysql://dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com:3306/qiankun_96_01
spring.datasource.username=panquanhaha
spring.datasource.password=${DB_PASSWORD}
```

### IDE 连接

```
Host:     dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com
Port:     3306
Database: qiankun_96_01
User:     panquanhaha
Password: (from secure source)
```

---

## ⚠️ 常见问题

### Q: DNS 解析失败怎么办？

**A**: 使用内网地址而非公网地址：
```
dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com  ✓ (内网)
dphzpl-rpt15xs8cywgchyy-pub.proxy.dms.aliyuncs.com  ✗ (公网 - 可能失败)
```

### Q: 如何诊断连接问题？

**A**: 运行以下命令：
```bash
# 测试网络连接
nc -zv dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com 3306

# 测试 MySQL 连接
mysql -h dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com \
       -u panquanhaha -p qiankun_96_01
```

### Q: 如何安全地管理密码？

**A**: 使用环境变量：
```bash
export DB_PASSWORD="your_password"
java -jar app.jar --spring.profiles.active=prod
```

---

## 🔐 安全性检查清单

- [ ] 使用环境变量管理密码，不在代码中硬编码
- [ ] 配置阿里云安全组规则
- [ ] 启用 VPC 内网连接
- [ ] 定期更新数据库密码
- [ ] 启用 SSL/TLS 加密连接
- [ ] 配置监控和告警
- [ ] 定期备份数据库
- [ ] 限制访问 IP 范围

---

## 📊 架构说明

```
┌─────────────────────────────────────────┐
│        Your Application (Spring Boot)   │
│     (running on VPC instance)            │
└──────────────┬──────────────────────────┘
               │
               │ 内网连接 (推荐)
               │
┌──────────────▼──────────────────────────┐
│      阿里云 PolarDB MySQL RDS           │
│  dphzpl-rpt15xs8cywgchyy.proxy...      │
│  Database: qiankun_96_01                │
└─────────────────────────────────────────┘
```

---

## 🚀 部署流程

### 步骤 1: 准备环境

```bash
# 设置环境变量
export DB_USERNAME=panquanhaha
export DB_PASSWORD="your_secure_password"
export DB_HOST=dphzpl-rpt15xs8cywgchyy.proxy.dms.aliyuncs.com
```

### 步骤 2: 验证连接

```bash
# 测试连接
mysql -h $DB_HOST -u $DB_USERNAME -p -e "SELECT 1;"
```

### 步骤 3: 启动应用

```bash
# 使用生产配置启动
java -jar target/writeengine.jar --spring.profiles.active=prod
```

### 步骤 4: 监控应用

```bash
# 检查日志
tail -f logs/application.log

# 检查数据库连接
mysql -h $DB_HOST -u $DB_USERNAME -p \
       -e "SHOW PROCESSLIST;"
```

---

## 📈 性能优化建议

1. **连接池优化**
   ```properties
   spring.datasource.hikari.maximum-pool-size=20
   spring.datasource.hikari.minimum-idle=5
   ```

2. **查询优化**
   - 添加适当的索引
   - 优化复杂查询
   - 使用批量操作

3. **缓存策略**
   - 使用 Redis 缓存热数据
   - 减少数据库查询

4. **监控指标**
   - 连接数
   - 查询时间
   - 慢查询日志

---

## 🛠️ 维护任务

### 日常维护

- [ ] 监控数据库性能指标
- [ ] 检查慢查询日志
- [ ] 验证备份完整性

### 定期维护（月度）

- [ ] 优化表结构和索引
- [ ] 清理过期数据
- [ ] 更新数据库密码

### 长期维护（季度）

- [ ] 评估容量需求
- [ ] 检查成本优化机会
- [ ] 规划升级计划

---

## 📞 获取帮助

| 问题类型 | 联系方式 | 响应时间 |
|---------|---------|--------|
| 紧急故障 | 阿里云工单 - 优先级 P1 | 30 分钟 |
| 性能问题 | 工单 - P2 | 2 小时 |
| 功能咨询 | 工单 - P3 | 4 小时 |
| 最佳实践 | 技术论坛 | 24 小时 |

---

## 📚 相关文档

### 本项目文档

- [本地数据库配置](../数据库/tasks.md) - 本地开发环境
- [表结构设计](../数据库/表结构设计.md) - 数据库架构
- [常用查询](../数据库/初始化数据与常用查询.md) - SQL 示例

### 外部资源

- [阿里云 PolarDB 官方文档](https://help.aliyun.com/product/26588.html)
- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [Spring Boot 数据库集成](https://spring.io/guides/gs/accessing-data-mysql/)

---

## 版本历史

| 版本 | 日期 | 变更 | 作者 |
|------|------|------|------|
| 1.0 | 2026-03-19 | 初始版本 | WriteEngine 项目组 |

---

**最后更新**: 2026-03-19
**维护人**: WriteEngine 项目组
**状态**: ✅ 稳定版本

