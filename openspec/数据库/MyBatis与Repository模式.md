# MyBatis 与 Repository 模式

## 架构设计

本项目采用 MyBatis + Repository 模式进行数据访问层设计，将业务逻辑与数据持久化完全分离。

### 架构层次

```
┌─────────────────────────────────────┐
│     Service 层（业务逻辑）          │
│   (e.g., GameService,               │
│    AIPortraitService)                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Repository 接口                    │
│   (e.g., GameRepository,             │
│    AIPortraitGenerationRepository)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Repository 实现                     │
│  (e.g., GameRepositoryImpl,          │
│   AIPortraitGenerationRepositoryImpl) │
│  - Model ↔ Entity 转换              │
│  - Mapper 调用                       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    MyBatis Mapper 接口               │
│   (e.g., GameMapper,                │
│    AIPortraitGenerationMapper)      │
│   - SQL 映射注解                     │
│   - 结果映射定义                     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   MyBatis XML 文件                   │
│  (e.g., GameMapper.xml,             │
│   AIPortraitGenerationMapper.xml)   │
│   - 动态 SQL                         │
│   - 批量操作                         │
│   - 复杂查询                         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      数据库（MySQL）                 │
└─────────────────────────────────────┘
```

---

## Model vs Entity

### Model（业务模型）

**定义**: 代表业务领域中的概念，包含业务逻辑和行为。

**特点**:
- 使用 Lombok 注解简化代码
- 包含业务相关的方法和常数
- 对 Service 层和 Controller 层暴露
- 不与数据库表直接对应

**示例** - `AIPortraitGeneration.java`:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIPortraitGeneration implements Serializable {
    private static final long serialVersionUID = 1L;

    // 状态枚举
    public enum Status {
        PENDING("PENDING", "待处理"),
        PROCESSING("PROCESSING", "生成中"),
        SUCCESS("SUCCESS", "已完成"),
        FAILED("FAILED", "失败");

        // ... 枚举实现
    }

    // 业务字段
    private Long id;
    private Long userId;
    private String taskId;
    private String prompt;
    // ... 更多字段

    // 业务方法
    public boolean isProcessing() {
        return Status.PROCESSING.getValue().equals(status);
    }

    public boolean isCompleted() {
        return Status.SUCCESS.getValue().equals(status) ||
               Status.FAILED.getValue().equals(status);
    }
}
```

### Entity（数据库实体）

**定义**: 代表数据库表结构，用于 MyBatis 映射。

**特点**:
- 使用 JPA 注解定义表和列
- 包含表结构映射信息
- 只在 Repository 层内部使用
- 与数据库表一一对应

**示例** - `AIPortraitGenerationEntity.java`:

```java
@Entity
@Table(name = "ai_portrait_generation", indexes = {
        @Index(name = "idx_ai_portrait_generation_user_id", columnList = "user_id"),
        @Index(name = "idx_ai_portrait_generation_status", columnList = "status"),
})
public class AIPortraitGenerationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "task_id", length = 64, unique = true)
    private String taskId;

    // ... 更多字段

    // 转换为 Model
    public AIPortraitGeneration toAIPortraitGeneration() {
        return AIPortraitGeneration.builder()
                .id(this.id)
                .userId(this.userId)
                .taskId(this.taskId)
                // ... 字段映射
                .build();
    }
}
```

### 转换流程

```
Service 层
   ↓ (Model)
Repository 接口
   ↓ (Model)
Repository 实现
   ↓ (Model → Entity 转换)
MyBatis Mapper
   ↓ (Entity)
MyBatis XML / 注解
   ↓ (SQL)
数据库
```

---

## Repository 模式

### Repository 接口

定义数据访问操作的契约。

```java
public interface AIPortraitGenerationRepository {
    /**
     * 保存或更新生成记录
     */
    void save(AIPortraitGeneration generation);

    /**
     * 根据 ID 查询生成记录
     */
    AIPortraitGeneration findById(Long id);

    /**
     * 根据任务ID查找生成记录
     */
    AIPortraitGeneration findByTaskId(String taskId);

    /**
     * 获取所有生成记录
     */
    List<AIPortraitGeneration> findAll();

    /**
     * 删除生成记录
     */
    void delete(Long id);

    // ... 更多方法
}
```

### Repository 实现

执行实际的数据访问操作，进行 Model-Entity 转换。

```java
@Repository
@Transactional
public class AIPortraitGenerationRepositoryImpl implements AIPortraitGenerationRepository {

    @Autowired
    private AIPortraitGenerationMapper generationMapper;

    @Override
    public void save(AIPortraitGeneration generation) {
        AIPortraitGenerationEntity entity = convertToEntity(generation);

        if (generation.getId() == null) {
            // 新增
            generationMapper.insert(entity);
            // 更新 ID
            generation.setId(entity.getId());
        } else {
            // 更新
            generationMapper.update(entity);
        }
    }

    @Override
    public AIPortraitGeneration findById(Long id) {
        AIPortraitGenerationEntity entity = generationMapper.selectById(id);
        if (entity == null) {
            return null;
        }
        return convertToModel(entity);
    }

    /**
     * 将 Model 转换为 Entity
     */
    private AIPortraitGenerationEntity convertToEntity(AIPortraitGeneration generation) {
        return new AIPortraitGenerationEntity(generation);
    }

    /**
     * 将 Entity 转换为 Model
     */
    private AIPortraitGeneration convertToModel(AIPortraitGenerationEntity entity) {
        return entity.toAIPortraitGeneration();
    }

    /**
     * 批量转换
     */
    private List<AIPortraitGeneration> convertToModelList(List<AIPortraitGenerationEntity> entities) {
        List<AIPortraitGeneration> models = new ArrayList<>();
        for (AIPortraitGenerationEntity entity : entities) {
            models.add(convertToModel(entity));
        }
        return models;
    }
}
```

---

## MyBatis Mapper 接口

### 注解模式

简单查询使用注解定义 SQL：

```java
@Mapper
@Repository
public interface AIPortraitGenerationMapper {

    /**
     * 根据ID查询生成记录
     */
    @Select("SELECT * FROM ai_portrait_generation WHERE id = #{id}")
    @Results(id = "generationResultMap", value = {
            @Result(property = "id", column = "id"),
            @Result(property = "userId", column = "user_id"),
            @Result(property = "taskId", column = "task_id"),
            // ... 更多字段映射
    })
    AIPortraitGenerationEntity selectById(@Param("id") Long id);

    /**
     * 插入生成记录
     */
    @Insert("INSERT INTO ai_portrait_generation (user_id, task_id, ...) " +
            "VALUES (#{userId}, #{taskId}, ...)")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(AIPortraitGenerationEntity generation);

    /**
     * 更新生成记录
     */
    @Update("UPDATE ai_portrait_generation SET user_id = #{userId}, ... WHERE id = #{id}")
    int update(AIPortraitGenerationEntity generation);

    /**
     * 删除生成记录
     */
    @Delete("DELETE FROM ai_portrait_generation WHERE id = #{id}")
    int deleteById(@Param("id") Long id);
}
```

### XML 模式

复杂查询使用 XML 定义 SQL：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.writemyself.mapper.AIPortraitGenerationMapper">

    <!-- 基础结果映射 -->
    <resultMap id="generationResultMap" type="com.example.writemyself.entity.AIPortraitGenerationEntity">
        <id property="id" column="id"/>
        <result property="userId" column="user_id"/>
        <result property="taskId" column="task_id"/>
        <!-- ... 更多字段映射 -->
    </resultMap>

    <!-- 分页查询 -->
    <select id="selectByPage" resultMap="generationResultMap">
        SELECT * FROM ai_portrait_generation
        ORDER BY created_at DESC
        LIMIT #{limit} OFFSET #{offset}
    </select>

    <!-- 动态 SQL 条件查询 -->
    <select id="selectByCondition" parameterType="map" resultMap="generationResultMap">
        SELECT * FROM ai_portrait_generation
        <where>
            <if test="userId != null">
                AND user_id = #{userId}
            </if>
            <if test="status != null and status != ''">
                AND status = #{status}
            </if>
            <if test="keyword != null and keyword != ''">
                AND prompt LIKE CONCAT('%', #{keyword}, '%')
            </if>
        </where>
        ORDER BY created_at DESC
    </select>

    <!-- 批量插入 -->
    <insert id="batchInsert" parameterType="list">
        INSERT INTO ai_portrait_generation (user_id, task_id, ...)
        VALUES
        <foreach collection="list" item="item" separator=",">
            (#{item.userId}, #{item.taskId}, ...)
        </foreach>
    </insert>

    <!-- 批量删除 -->
    <delete id="batchDelete" parameterType="list">
        DELETE FROM ai_portrait_generation WHERE id IN
        <foreach collection="list" item="id" open="(" separator="," close=")">
            #{id}
        </foreach>
    </delete>
</mapper>
```

---

## Service 层集成

### Service 接口

```java
public interface AIPortraitService {
    /**
     * 创建生成任务
     */
    AIPortraitGeneration createGeneration(AIPortraitGenerationRequest request);

    /**
     * 获取生成记录
     */
    AIPortraitGeneration getGeneration(Long id);

    /**
     * 更新生成状态
     */
    void updateGenerationStatus(Long id, String status);

    /**
     * 查询用户的生成记录
     */
    List<AIPortraitGeneration> getUserGenerations(Long userId, int limit);
}
```

### Service 实现

```java
@Service
@Transactional
public class AIPortraitServiceImpl implements AIPortraitService {

    @Autowired
    private AIPortraitGenerationRepository generationRepository;

    @Autowired
    private AIPortraitTaskRepository taskRepository;

    @Autowired
    private AIPortraitModelConfigRepository modelConfigRepository;

    @Override
    public AIPortraitGeneration createGeneration(AIPortraitGenerationRequest request) {
        // 创建生成记录模型
        AIPortraitGeneration generation = AIPortraitGeneration.builder()
                .userId(request.getUserId())
                .taskId(generateTaskId())
                .prompt(request.getPrompt())
                .negativePrompt(request.getNegativePrompt())
                .modelName(request.getModelName())
                .status(AIPortraitGeneration.Status.PENDING.getValue())
                .build();

        // 保存生成记录
        generationRepository.save(generation);

        // 创建任务
        AIPortraitTask task = new AIPortraitTask(generation.getTaskId(), generation.getId());
        taskRepository.save(task);

        return generation;
    }

    @Override
    public AIPortraitGeneration getGeneration(Long id) {
        return generationRepository.findById(id);
    }

    @Override
    public void updateGenerationStatus(Long id, String status) {
        AIPortraitGeneration generation = generationRepository.findById(id);
        if (generation != null) {
            generation.setStatus(status);
            generation.setUpdatedAt(LocalDateTime.now());
            generationRepository.save(generation);
        }
    }

    @Override
    public List<AIPortraitGeneration> getUserGenerations(Long userId, int limit) {
        return generationRepository.findRecentByUserId(userId, limit);
    }

    private String generateTaskId() {
        return "task_" + System.currentTimeMillis() + "_" +
               UUID.randomUUID().toString().substring(0, 8);
    }
}
```

---

## 事务管理

### @Transactional 注解使用

```java
// Repository 实现类级别
@Repository
@Transactional
public class AIPortraitGenerationRepositoryImpl implements AIPortraitGenerationRepository {
    // 所有方法都在事务中执行
}

// 方法级别
@Transactional(readOnly = true)
public AIPortraitGeneration findById(Long id) {
    // 只读事务
    return generationRepository.findById(id);
}

@Transactional(propagation = Propagation.REQUIRES_NEW)
public void saveGeneration(AIPortraitGeneration generation) {
    // 开启新事务
    generationRepository.save(generation);
}
```

### 事务隔离级别

```properties
# application.properties
spring.jpa.properties.hibernate.transaction.isolation=2

# 隔离级别说明:
# 0 = Connection.TRANSACTION_NONE
# 1 = Connection.TRANSACTION_READ_UNCOMMITTED
# 2 = Connection.TRANSACTION_READ_COMMITTED （MySQL 默认）
# 4 = Connection.TRANSACTION_REPEATABLE_READ
# 8 = Connection.TRANSACTION_SERIALIZABLE
```

---

## 性能优化

### 1. 批量操作

```java
// 批量保存
public void batchSave(List<AIPortraitGeneration> generations) {
    List<AIPortraitGenerationEntity> entities = convertToEntityList(generations);
    generationMapper.batchInsert(entities);
}

// 批量更新
public void batchUpdate(List<AIPortraitGeneration> generations) {
    List<AIPortraitGenerationEntity> entities = convertToEntityList(generations);
    generationMapper.batchUpdate(entities);
}

// 批量删除
public void batchDelete(List<Long> ids) {
    generationMapper.batchDelete(ids);
}
```

### 2. 查询优化

```java
// 使用 Map 参数传递多个条件
public List<AIPortraitGeneration> findByCondition(long userId, String status, int limit) {
    Map<String, Object> condition = new HashMap<>();
    condition.put("userId", userId);
    condition.put("status", status);
    condition.put("limit", limit);

    List<AIPortraitGenerationEntity> entities = generationMapper.selectByCondition(condition);
    return convertToModelList(entities);
}
```

### 3. 缓存集成

```java
@Service
@Transactional
public class AIPortraitServiceImpl implements AIPortraitService {

    @Cached(cacheNames = "generations", key = "#id")
    public AIPortraitGeneration getGeneration(Long id) {
        return generationRepository.findById(id);
    }

    @CacheEvict(cacheNames = "generations", key = "#generation.id")
    public void updateGeneration(AIPortraitGeneration generation) {
        generationRepository.save(generation);
    }
}
```

---

## 常见错误处理

### 1. 空指针异常

```java
// ❌ 错误
AIPortraitGeneration generation = generationRepository.findById(id);
generation.setStatus("SUCCESS"); // 可能 NPE

// ✅ 正确
AIPortraitGeneration generation = generationRepository.findById(id);
if (generation != null) {
    generation.setStatus("SUCCESS");
    generationRepository.save(generation);
}
```

### 2. Model-Entity 转换错误

```java
// ❌ 错误
AIPortraitGenerationEntity entity = (AIPortraitGenerationEntity) model; // 类型转换错误

// ✅ 正确
AIPortraitGenerationEntity entity = new AIPortraitGenerationEntity(model);
// 或使用 convert 方法
AIPortraitGenerationEntity entity = convertToEntity(model);
```

### 3. 事务边界问题

```java
// ❌ 错误：事务外调用
@Transactional
public void save(AIPortraitGeneration generation) {
    generationRepository.save(generation);
    // 外部代码可能访问 lazy 属性导致错误
}

// ✅ 正确：确保所有操作在事务内
@Transactional
public void save(AIPortraitGeneration generation) {
    generationRepository.save(generation);
    // 在事务内完成所有数据库操作
}
```

---

## 最佳实践

### 1. 清晰的方法命名

```java
// ✅ 好
findById(Long id)
findByTaskId(String taskId)
findByUserIdOrderByCreatedAtDesc(Long userId)

// ❌ 不好
get(Long id)
search(String taskId)
query(Long userId)
```

### 2. 一致的错误处理

```java
@Repository
@Transactional
public class AIPortraitGenerationRepositoryImpl implements AIPortraitGenerationRepository {

    @Override
    public AIPortraitGeneration findById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid id: " + id);
        }
        AIPortraitGenerationEntity entity = generationMapper.selectById(id);
        return entity == null ? null : convertToModel(entity);
    }
}
```

### 3. 注释规范

```java
/**
 * 查询用户最近的生成记录
 *
 * @param userId 用户ID
 * @param limit 限制数量
 * @return 生成记录列表，按创建时间降序
 * @throws IllegalArgumentException 如果 userId 或 limit 无效
 */
public List<AIPortraitGeneration> findRecentByUserId(Long userId, int limit) {
    // 实现
}
```

### 4. 单一职责

```java
// ✅ 好：Repository 只负责数据访问
@Repository
public class AIPortraitGenerationRepositoryImpl {
    public void save(AIPortraitGeneration generation) { ... }
}

// ✅ 好：Service 负责业务逻辑
@Service
public class AIPortraitServiceImpl {
    public AIPortraitGeneration createWithValidation(AIPortraitGenerationRequest request) {
        validateRequest(request);
        return generationRepository.save(request.toModel());
    }
}
```

---

## 扩展阅读

- MyBatis 官方文档: https://mybatis.org/mybatis-3/
- Spring Data 最佳实践: https://spring.io/guides
- Repository 模式详解: https://martinfowler.com/eaaCatalog/repository.html

