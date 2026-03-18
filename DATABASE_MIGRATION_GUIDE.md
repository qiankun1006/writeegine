# 数据库迁移和MyBatis接入指南

## 概述

本文档详细介绍了如何将项目从H2内存数据库迁移到阿里云RDS MySQL数据库，并使用MyBatis作为数据访问层框架。迁移完成后，项目将支持多环境配置（开发/生产）和完整的数据库管理功能。

## 目录

1. [环境要求](#环境要求)
2. [配置说明](#配置说明)
3. [MyBatis使用指南](#mybatis使用指南)
4. [数据库迁移流程](#数据库迁移流程)
5. [多环境部署](#多环境部署)
6. [故障排查](#故障排查)
7. [API参考](#api参考)

## 环境要求

### 开发环境
- Java 8+
- Spring Boot 2.7.14
- Maven 3.6+
- H2 Database (开发环境)
- MySQL 5.7+ (生产环境)

### 生产环境
- 阿里云RDS MySQL 5.7/8.0
- JDK 8+
- 应用服务器（Tomcat/Jetty/Undertow）

## 配置说明

### 1. 配置文件结构

项目采用多环境配置，配置文件位于 `src/main/resources/`：

```
application.properties          # 主配置文件，设置默认环境
application-dev.properties      # 开发环境配置（H2内存数据库）
application-prod.properties     # 生产环境配置（阿里云RDS）
```

### 2. 开发环境配置（H2）

开发环境使用H2内存数据库，配置在 `application-dev.properties`：

```properties
# H2内存数据库配置
spring.datasource.url=jdbc:h2:mem:writeengine;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA配置
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# MyBatis配置
mybatis.mapper-locations=classpath:mapper/*.xml
mybatis.type-aliases-package=com.example.writemyself.entity
mybatis.configuration.map-underscore-to-camel-case=true

# 数据库迁移配置
spring.sql.init.mode=always
spring.sql.init.schema-locations=classpath:db/migration/V1__create_tables.sql
spring.sql.init.data-locations=classpath:db/migration/V2__init_data.sql
spring.sql.init.continue-on-error=true
```

### 3. 生产环境配置（阿里云RDS）

生产环境使用阿里云RDS MySQL，配置在 `application-prod.properties`：

```properties
# 阿里云RDS MySQL Database Configuration
spring.datasource.url=jdbc:mysql://{阿里云RDS地址}:3306/writeengine?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
spring.datasource.username=【待写入】
spring.datasource.password=【待写入】
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Druid连接池配置
spring.datasource.type=com.alibaba.druid.pool.DruidDataSource
spring.datasource.druid.initial-size=5
spring.datasource.druid.min-idle=5
spring.datasource.druid.max-active=20
spring.datasource.druid.max-wait=60000
spring.datasource.druid.time-between-eviction-runs-millis=60000
spring.datasource.druid.min-evictable-idle-time-millis=300000
spring.datasource.druid.validation-query=SELECT 1
spring.datasource.druid.test-while-idle=true
spring.datasource.druid.test-on-borrow=false
spring.datasource.druid.test-on-return=false
spring.datasource.druid.pool-prepared-statements=true
spring.datasource.druid.max-pool-prepared-statement-per-connection-size=20
spring.datasource.druid.filters=stat,wall,log4j
spring.datasource.druid.connection-properties=druid.stat.mergeSql=true;druid.stat.slowSqlMillis=5000

# JPA配置
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

# MyBatis配置
mybatis.mapper-locations=classpath:mapper/*.xml
mybatis.type-aliases-package=com.example.writemyself.entity
mybatis.configuration.map-underscore-to-camel-case=true

# 数据库迁移配置（生产环境建议使用Flyway或Liquibase）
# spring.flyway.enabled=true
# spring.flyway.locations=classpath:db/migration
# spring.flyway.baseline-on-migrate=true
```

### 4. Maven配置

`pom.xml` 中添加了以下依赖和配置：

```xml
<!-- MyBatis 依赖 -->
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.3.1</version>
</dependency>

<!-- Druid 连接池 -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid-spring-boot-starter</artifactId>
    <version>1.2.20</version>
</dependency>

<!-- MySQL Connector -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>

<!-- Maven Profiles -->
<profiles>
    <profile>
        <id>dev</id>
        <properties>
            <spring.profiles.active>dev</spring.profiles.active>
        </properties>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
    </profile>
    <profile>
        <id>prod</id>
        <properties>
            <spring.profiles.active>prod</spring.profiles.active>
        </properties>
    </profile>
</profiles>
```

## MyBatis使用指南

### 1. 实体类（Entity）

实体类使用JPA注解定义表结构，同时支持MyBatis映射：

```java
@Entity
@Table(name = "game")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameEntity {
    @Id
    @Column(name = "id", nullable = false, length = 100)
    private String id;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "type", length = 50)
    private String type;

    // ... 其他字段
}
```

### 2. Mapper接口

Mapper接口定义数据访问方法：

```java
@Mapper
@Repository
public interface GameMapper {

    @Select("SELECT * FROM game WHERE id = #{id}")
    @Results(id = "gameResultMap", value = {
        @Result(property = "id", column = "id"),
        @Result(property = "name", column = "name"),
        @Result(property = "type", column = "type"),
        // ... 其他映射
    })
    GameEntity selectById(@Param("id") String id);

    @Insert("INSERT INTO game (id, name, type, created_at, updated_at) " +
            "VALUES (#{id}, #{name}, #{type}, #{createdAt}, #{updatedAt})")
    @Options(useGeneratedKeys = false)
    int insert(GameEntity game);

    // ... 其他方法
}
```

### 3. XML映射文件

复杂SQL语句在XML文件中定义：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.writemyself.mapper.GameMapper">

    <resultMap id="gameResultMap" type="com.example.writemyself.entity.GameEntity">
        <id property="id" column="id"/>
        <result property="name" column="name"/>
        <result property="type" column="type"/>
        <!-- ... 其他映射 -->
    </resultMap>

    <select id="selectByCondition" parameterType="map" resultMap="gameResultMap">
        SELECT * FROM game
        <where>
            <if test="name != null and name != ''">
                AND name LIKE CONCAT('%', #{name}, '%')
            </if>
            <if test="type != null and type != ''">
                AND type = #{type}
            </if>
            <if test="userId != null and userId != ''">
                AND user_id = #{userId}
            </if>
        </where>
        ORDER BY created_at DESC
        <if test="limit != null">
            LIMIT #{limit}
        </if>
        <if test="offset != null">
            OFFSET #{offset}
        </if>
    </select>

</mapper>
```

### 4. Repository实现

Repository层使用Mapper进行数据访问：

```java
@Repository
@Transactional
public class GameRepositoryImpl implements GameRepository {

    @Autowired
    private GameMapper gameMapper;

    @Override
    public void save(Game game) {
        GameEntity gameEntity = convertToEntity(game);

        if (game.getId() == null) {
            // 插入新记录
            gameMapper.insert(gameEntity);
        } else {
            // 更新现有记录
            gameMapper.update(gameEntity);
        }
    }

    @Override
    public Game findById(String id) {
        GameEntity gameEntity = gameMapper.selectById(id);
        if (gameEntity == null) {
            return null;
        }
        return convertToModel(gameEntity);
    }

    // ... 其他方法
}
```

## 数据库迁移流程

### 1. 数据库表结构

迁移脚本位于 `src/main/resources/db/migration/`：

- `V1__create_tables.sql` - 创建核心表结构
- `V2__init_data.sql` - 初始化测试数据

### 2. 自动迁移机制

项目使用 `DatabaseVersionManager` 管理数据库版本：

```java
@Component
public class DatabaseVersionManager {

    @PostConstruct
    public void init() {
        // 1. 检查数据库连接
        // 2. 检查版本表是否存在
        // 3. 获取当前数据库版本
        // 4. 执行需要的升级脚本
        // 5. 验证数据库结构
    }
}
```

### 3. 手动执行迁移

开发环境自动执行迁移脚本，生产环境建议：

1. **使用Flyway**（推荐）：
   ```properties
   spring.flyway.enabled=true
   spring.flyway.locations=classpath:db/migration
   ```

2. **手动执行SQL**：
   ```bash
   mysql -h {rds-endpoint} -u {username} -p {database} < src/main/resources/db/migration/V1__create_tables.sql
   ```

## 多环境部署

### 1. 环境切换

**Maven命令：**
```bash
# 开发环境（默认）
mvn spring-boot:run

# 生产环境
mvn spring-boot:run -Pprod

# 打包
mvn clean package -Pprod
```

**系统属性：**
```bash
java -jar writeengine.jar --spring.profiles.active=prod
```

**环境变量：**
```bash
export SPRING_PROFILES_ACTIVE=prod
java -jar writeengine.jar
```

### 2. 环境特定配置

| 配置项 | 开发环境 | 生产环境 |
|--------|----------|----------|
| 数据库 | H2内存数据库 | 阿里云RDS MySQL |
| 连接池 | HikariCP | Druid |
| SQL日志 | 开启 | 关闭 |
| DDL策略 | update | validate |
| 迁移方式 | spring.sql.init | Flyway/Liquibase |

## 故障排查

### 1. 数据库连接问题

**症状：** 应用启动失败，连接超时或认证失败

**排查步骤：**
1. 检查阿里云RDS白名单设置
2. 验证用户名和密码
3. 测试网络连通性：
   ```bash
   telnet {rds-endpoint} 3306
   ```
4. 检查连接池配置
5. 查看应用日志中的详细错误信息

**常见错误：**
```java
// 连接超时
com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure

// 认证失败
java.sql.SQLException: Access denied for user

// 数据库不存在
java.sql.SQLSyntaxErrorException: Unknown database 'writeengine'
```

### 2. MyBatis映射问题

**症状：** 查询返回null或字段映射错误

**排查步骤：**
1. 检查实体类字段名与数据库列名是否匹配
2. 验证XML映射文件中的resultMap配置
3. 检查MyBatis日志输出：
   ```properties
   logging.level.com.example.writemyself.mapper=DEBUG
   ```
4. 验证SQL语句是否正确

### 3. 事务管理问题

**症状：** 数据不一致，事务未回滚

**排查步骤：**
1. 检查方法是否添加了 `@Transactional` 注解
2. 验证事务传播行为设置
3. 检查异常类型是否触发回滚
4. 查看事务日志：
   ```properties
   logging.level.org.springframework.transaction=DEBUG
   logging.level.org.springframework.jdbc=DEBUG
   ```

### 4. 性能问题

**症状：** 数据库操作缓慢，连接池耗尽

**排查步骤：**
1. 检查慢查询日志
2. 优化SQL语句，添加索引
3. 调整连接池参数
4. 监控Druid统计信息：
   ```
   http://localhost:8080/druid/index.html
   ```

## API参考

### 1. 数据库健康检查

**端点：** `GET /api/database/health`

**响应：**
```json
{
  "status": "UP",
  "database": "MySQL",
  "version": "8.0.33",
  "connectionTime": 45,
  "message": "Database connection successful"
}
```

### 2. 数据库信息

**端点：** `GET /api/database/info`

**响应：**
```json
{
  "databaseProductName": "MySQL",
  "databaseProductVersion": "8.0.33",
  "driverName": "MySQL Connector/J",
  "driverVersion": "8.0.33",
  "url": "jdbc:mysql://rds-mysql.writeengine.aliyuncs.com:3306/writeengine",
  "userName": "writeengine_user",
  "tableCount": 15,
  "currentVersion": 2,
  "targetVersion": 2,
  "lastChecked": "2024-01-15T10:30:00"
}
```

### 3. 数据库版本历史

**端点：** `GET /api/database/version-history`

**响应：**
```json
[
  {
    "version": 2,
    "description": "数据初始化 - 插入测试数据和基础配置",
    "scriptName": "V2__init_data.sql",
    "executedAt": "2024-01-15T10:25:00",
    "executionTimeMs": 1200,
    "status": "SUCCESS",
    "errorMessage": null
  },
  {
    "version": 1,
    "description": "初始版本 - 创建核心表结构",
    "scriptName": "V1__create_tables.sql",
    "executedAt": "2024-01-15T10:20:00",
    "executionTimeMs": 850,
    "status": "SUCCESS",
    "errorMessage": null
  }
]
```

### 4. 数据库连接测试

**端点：** `POST /api/database/test-connection`

**请求体：**
```json
{
  "url": "jdbc:mysql://localhost:3306/test",
  "username": "test",
  "password": "test123",
  "driverClassName": "com.mysql.cj.jdbc.Driver"
}
```

**响应：**
```json
{
  "success": true,
  "message": "Connection test successful",
  "connectionTime": 56,
  "databaseInfo": {
    "productName": "MySQL",
    "productVersion": "8.0.33"
  }
}
```

## 附录

### A. 阿里云RDS配置步骤

1. **创建RDS实例：**
   - 登录阿里云控制台
   - 进入RDS服务
   - 创建MySQL实例（建议5.7或8.0版本）
   - 选择规格和存储

2. **配置白名单：**
   - 添加应用服务器的IP地址到白名单
   - 或添加 `0.0.0.0/0`（仅测试环境）

3. **创建数据库和用户：**
   ```sql
   CREATE DATABASE writeengine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'writeengine_user'@'%' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON writeengine.* TO 'writeengine_user'@'%';
   FLUSH PRIVILEGES;
   ```

4. **获取连接信息：**
   - 内网地址/外网地址
   - 端口号（默认3306）
   - 数据库名称
   - 用户名和密码

### B. 常用命令

**Maven命令：**
```bash
# 运行开发环境
mvn spring-boot:run

# 运行生产环境
mvn spring-boot:run -Pprod

# 运行测试
mvn test

# 打包应用
mvn clean package -Pprod
```

**数据库命令：**
```bash
# 连接阿里云RDS
mysql -h {rds-endpoint} -u {username} -p {database}

# 导出数据库结构
mysqldump -h {rds-endpoint} -u {username} -p --no-data {database} > schema.sql

# 导入数据
mysql -h {rds-endpoint} -u {username} -p {database} < data.sql
```

### C. 监控和运维

1. **Druid监控：**
   - 访问 `http://localhost:8080/druid/index.html`
   - 查看连接池状态
   - 监控SQL执行情况

2. **Spring Boot Actuator：**
   - 健康检查：`/actuator/health`
   - 应用信息：`/actuator/info`
   - 指标监控：`/actuator/metrics`

3. **日志配置：**
   ```properties
   # 数据库日志
   logging.level.com.example.writemyself.mapper=DEBUG
   logging.level.org.springframework.jdbc=DEBUG

   # 事务日志
   logging.level.org.springframework.transaction=DEBUG

   # 连接池日志
   logging.level.com.alibaba.druid=INFO
   ```

### D. 联系方式

如有问题，请联系：

- **项目负责人：** [待填写]
- **数据库管理员：** [待填写]
- **技术支持：** [待填写]

---

**文档版本：** 1.0
**最后更新：** 2024年1月15日
**适用版本：** Spring Boot 2.7.14, MyBatis 2.3.1, MySQL 8.0.33

