## 上下文
当前项目使用Spring Boot 2.7.14 + Java 8技术栈，数据库层目前使用H2内存数据库和JPA。需要迁移到阿里云RDS MySQL数据库，并使用MyBatis作为数据访问层框架。项目已有一些JPA实体类（如AIPortraitTask等），需要保持向后兼容。

## 目标 / 非目标
### 目标
- 集成阿里云RDS MySQL数据库作为生产环境数据库
- 使用MyBatis替换部分JPA实现，提供更灵活的SQL控制
- 支持多环境配置（开发使用H2，生产使用阿里云RDS）
- 保持现有JPA实体的兼容性
- 提供数据库连接池管理和监控

### 非目标
- 完全移除JPA支持（保持混合使用）
- 支持其他云厂商数据库（仅阿里云RDS）
- 实现复杂的数据库分片和读写分离

## 技术决策
### 决策1：使用MyBatis + JPA混合模式
**选择原因**：
- 现有代码已使用JPA，完全迁移成本高
- MyBatis提供更灵活的SQL控制，适合复杂查询
- 可以逐步迁移，降低风险

**替代方案考虑**：
- 纯MyBatis：需要重写所有数据访问层
- 纯JPA：SQL控制灵活性不足

### 决策2：使用Druid连接池
**选择原因**：
- 阿里云推荐的数据库连接池
- 提供丰富的监控和统计功能
- 与Spring Boot集成良好

**代码示例**：
```java
@Configuration
public class DruidConfig {

    @Bean
    @ConfigurationProperties("spring.datasource.druid")
    public DataSource dataSource() {
        return DruidDataSourceBuilder.create().build();
    }

    @Bean
    public ServletRegistrationBean<StatViewServlet> druidServlet() {
        ServletRegistrationBean<StatViewServlet> servletRegistrationBean =
            new ServletRegistrationBean<>(new StatViewServlet(), "/druid/*");
        servletRegistrationBean.addInitParameter("loginUsername", "admin");
        servletRegistrationBean.addInitParameter("loginPassword", "admin");
        return servletRegistrationBean;
    }
}
```

### 决策3：多环境配置策略
**选择原因**：
- 开发环境继续使用H2，快速启动
- 生产环境使用阿里云RDS，稳定可靠
- 通过Spring Profiles轻松切换

**配置示例**：
```properties
# application-dev.properties
spring.datasource.url=jdbc:h2:mem:writeengine
spring.datasource.driver-class-name=org.h2.Driver

# application-prod.properties
spring.datasource.url=jdbc:mysql://{阿里云RDS地址}:3306/writeengine
spring.datasource.username=【待写入】
spring.datasource.password=【待写入】
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

### 决策4：MyBatis配置方式
**选择原因**：
- 使用注解+XML混合模式
- 简单查询使用注解，复杂查询使用XML
- 便于SQL优化和调试

**代码示例**：
```java
@Mapper
public interface GameMapper {

    @Select("SELECT * FROM game WHERE id = #{id}")
    Game selectById(@Param("id") String id);

    @Insert("INSERT INTO game (id, name, type, created_at) VALUES (#{id}, #{name}, #{type}, #{createdAt})")
    int insert(Game game);

    // 复杂查询使用XML映射
    List<Game> selectByComplexCondition(GameQuery query);
}
```

```xml
<!-- GameMapper.xml -->
<mapper namespace="com.example.writemyself.mapper.GameMapper">
    <select id="selectByComplexCondition" resultType="Game">
        SELECT * FROM game
        <where>
            <if test="name != null and name != ''">
                AND name LIKE CONCAT('%', #{name}, '%')
            </if>
            <if test="type != null and type != ''">
                AND type = #{type}
            </if>
            <if test="startDate != null">
                AND created_at >= #{startDate}
            </if>
        </where>
        ORDER BY created_at DESC
    </select>
</mapper>
```

## 数据库表设计
### Game表（新增）
```sql
CREATE TABLE game (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    description TEXT,
    config JSON,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    user_id VARCHAR(64),
    INDEX idx_user_id (user_id),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 现有JPA实体表保持
- ai_portrait_task (已存在)
- ai_portrait_generation (已存在)
- ai_portrait_user_preset (已存在)
- ai_portrait_model_config (已存在)
- ai_portrait_resource_library (已存在)

## 风险与权衡
### 风险1：MyBatis与JPA混合使用的复杂性
**缓解措施**：
- 明确边界：新功能使用MyBatis，旧功能保持JPA
- 统一事务管理：使用Spring的@Transactional注解
- 避免循环依赖：MyBatis Mapper不直接依赖JPA Repository

### 风险2：数据库迁移数据丢失
**缓解措施**：
- 提供数据导出/导入工具
- 分阶段迁移：先迁移结构，再迁移数据
- 保留H2作为开发环境，生产环境使用阿里云RDS

### 风险3：阿里云RDS连接性能
**缓解措施**：
- 配置合理的连接池参数
- 实现连接超时和重试机制
- 监控数据库连接状态

## 迁移计划
### 阶段1：基础设施准备（1-2天）
- 添加依赖和配置
- 创建基础配置类
- 设置多环境配置

### 阶段2：数据访问层重构（2-3天）
- 创建MyBatis Mapper接口
- 实现Game相关数据访问
- 测试基本CRUD操作

### 阶段3：集成测试和优化（1-2天）
- 测试多环境切换
- 优化数据库连接配置
- 验证事务管理

### 阶段4：部署和监控（1天）
- 配置生产环境参数
- 设置数据库监控
- 创建运维文档

## 回滚计划
如果遇到严重问题：
1. 立即切换回H2内存数据库
2. 使用备份数据恢复
3. 分析问题原因，修复后重新部署

## 开放问题
1. 是否需要支持数据库读写分离？
2. 是否需要在阿里云控制台配置白名单？
3. 数据库备份策略如何制定？

