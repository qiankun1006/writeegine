# 数据库迁移快速入门指南

## 快速开始

### 1. 开发环境（H2内存数据库）

**默认配置，无需额外设置：**
```bash
# 启动应用
mvn spring-boot:run

# 或
java -jar target/writeengine.jar
```

### 2. 生产环境（阿里云RDS）

**步骤1：配置阿里云RDS连接信息**

编辑 `src/main/resources/application-prod.properties`：
```properties
# 替换以下配置
spring.datasource.url=jdbc:mysql://【你的RDS地址】:3306/writeengine?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
spring.datasource.username=【你的用户名】
spring.datasource.password=【你的密码】
```

**步骤2：运行生产环境**
```bash
# 使用Maven Profile
mvn spring-boot:run -Pprod

# 或使用系统属性
java -jar target/writeengine.jar --spring.profiles.active=prod

# 或使用环境变量
export SPRING_PROFILES_ACTIVE=prod
java -jar target/writeengine.jar
```

## 核心功能

### 1. 数据库健康检查
```bash
# 检查数据库连接状态
curl http://localhost:8080/api/database/health

# 获取数据库信息
curl http://localhost:8080/api/database/info
```

### 2. 数据库版本管理
应用启动时自动执行数据库迁移脚本：
- `V1__create_tables.sql` - 创建表结构
- `V2__init_data.sql` - 初始化测试数据

### 3. 多环境支持

| 环境 | 数据库 | 激活方式 |
|------|--------|----------|
| 开发环境 | H2内存数据库 | 默认（无需配置） |
| 生产环境 | 阿里云RDS MySQL | `-Pprod` 或 `--spring.profiles.active=prod` |

## 配置文件说明

### 主配置文件 (`application.properties`)
```properties
# 设置默认环境
spring.profiles.active=dev
```

### 开发环境 (`application-dev.properties`)
- 使用H2内存数据库
- 自动创建表结构
- 显示SQL日志
- 自动执行迁移脚本

### 生产环境 (`application-prod.properties`)
- 使用阿里云RDS MySQL
- 使用Druid连接池
- 关闭SQL日志
- 建议使用Flyway进行迁移

## 常见问题

### Q1: 如何测试数据库连接？
```bash
# 使用内置测试工具
curl -X POST http://localhost:8080/api/database/test-connection \
  -H "Content-Type: application/json" \
  -d '{
    "url": "jdbc:mysql://localhost:3306/test",
    "username": "test",
    "password": "test123"
  }'
```

### Q2: 如何查看数据库版本历史？
```bash
curl http://localhost:8080/api/database/version-history
```

### Q3: 生产环境数据库迁移失败怎么办？

**方案1：手动执行SQL**
```bash
mysql -h {rds-endpoint} -u {username} -p {database} < src/main/resources/db/migration/V1__create_tables.sql
```

**方案2：启用Flyway（推荐）**
1. 取消 `application-prod.properties` 中的Flyway配置注释
2. 重启应用

### Q4: 如何监控数据库性能？

访问Druid监控面板：
```
http://localhost:8080/druid/index.html
```

默认登录信息：
- 用户名：admin
- 密码：admin123

## 紧急恢复

### 数据库连接失败
1. 检查阿里云RDS白名单设置
2. 验证用户名和密码
3. 测试网络连通性：
   ```bash
   telnet {rds-endpoint} 3306
   ```

### 数据访问异常
1. 检查MyBatis日志：
   ```properties
   logging.level.com.example.writemyself.mapper=DEBUG
   ```
2. 验证实体类与数据库表结构匹配

## 下一步

1. **配置阿里云RDS**：按照阿里云控制台指引创建数据库实例
2. **设置生产环境**：更新 `application-prod.properties` 中的连接信息
3. **测试连接**：使用健康检查API验证连接
4. **部署应用**：使用生产环境配置打包和部署

## 获取帮助

- 查看详细文档：`DATABASE_MIGRATION_GUIDE.md`
- 检查应用日志：`logs/application.log`
- 访问监控面板：`http://localhost:8080/druid/index.html`

---

**提示：** 生产环境部署前，请确保已完成：
1. 阿里云RDS实例创建和配置
2. 数据库用户和权限设置
3. 网络白名单配置
4. 连接信息测试验证

