package com.example.writemyself.mapper;

import com.example.writemyself.model.AIPortraitTask;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * AI肖像任务数据访问Mapper接口
 * 使用MyBatis注解和XML混合模式
 */
@Mapper
@Repository
public interface AIPortraitTaskMapper {

    /**
     * 根据ID查询任务
     */
    @Select("SELECT * FROM ai_portrait_task WHERE id = #{id}")
    @ResultMap("aiPortraitTaskResultMap")
    AIPortraitTask selectById(@Param("id") Long id);

    /**
     * 根据任务ID查询任务
     */
    @Select("SELECT * FROM ai_portrait_task WHERE task_id = #{taskId}")
    @ResultMap("aiPortraitTaskResultMap")
    AIPortraitTask selectByTaskId(@Param("taskId") String taskId);

    /**
     * 根据生成记录ID查询任务
     */
    @Select("SELECT * FROM ai_portrait_task WHERE generation_id = #{generationId}")
    @ResultMap("aiPortraitTaskResultMap")
    AIPortraitTask selectByGenerationId(@Param("generationId") Long generationId);

    /**
     * 查询所有任务
     */
    @Select("SELECT * FROM ai_portrait_task ORDER BY created_at DESC")
    @ResultMap("aiPortraitTaskResultMap")
    List<AIPortraitTask> selectAll();

    /**
     * 根据状态查询任务
     */
    @Select("SELECT * FROM ai_portrait_task WHERE status = #{status} ORDER BY created_at ASC")
    @ResultMap("aiPortraitTaskResultMap")
    List<AIPortraitTask> selectByStatus(@Param("status") String status);

    /**
     * 根据状态和重试次数查询任务
     */
    @Select("SELECT * FROM ai_portrait_task WHERE status = #{status} AND retry_count < #{retryCount} ORDER BY created_at ASC")
    @ResultMap("aiPortraitTaskResultMap")
    List<AIPortraitTask> selectByStatusAndRetryCountLessThan(@Param("status") String status, @Param("retryCount") Integer retryCount);

    /**
     * 插入任务
     */
    @Insert("INSERT INTO ai_portrait_task (task_id, generation_id, status, progress, retry_count, max_retries, " +
            "last_error, started_at, completed_at, created_at, updated_at) " +
            "VALUES (#{taskId}, #{generationId}, #{status}, #{progress}, #{retryCount}, #{maxRetries}, " +
            "#{lastError}, #{startedAt}, #{completedAt}, #{createdAt}, #{updatedAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(AIPortraitTask task);

    /**
     * 更新任务
     */
    @Update("UPDATE ai_portrait_task SET " +
            "task_id = #{taskId}, " +
            "generation_id = #{generationId}, " +
            "status = #{status}, " +
            "progress = #{progress}, " +
            "retry_count = #{retryCount}, " +
            "max_retries = #{maxRetries}, " +
            "last_error = #{lastError}, " +
            "started_at = #{startedAt}, " +
            "completed_at = #{completedAt}, " +
            "updated_at = #{updatedAt} " +
            "WHERE id = #{id}")
    int update(AIPortraitTask task);

    /**
     * 删除任务
     */
    @Delete("DELETE FROM ai_portrait_task WHERE id = #{id}")
    int deleteById(@Param("id") Long id);

    /**
     * 统计任务数量
     */
    @Select("SELECT COUNT(*) FROM ai_portrait_task")
    long count();

    /**
     * 根据状态统计任务数量
     */
    @Select("SELECT COUNT(*) FROM ai_portrait_task WHERE status = #{status}")
    long countByStatus(@Param("status") String status);

    /**
     * 检查任务是否存在
     */
    @Select("SELECT COUNT(*) FROM ai_portrait_task WHERE id = #{id}")
    boolean existsById(@Param("id") Long id);

    /**
     * 检查任务ID是否存在
     */
    @Select("SELECT COUNT(*) FROM ai_portrait_task WHERE task_id = #{taskId}")
    boolean existsByTaskId(@Param("taskId") String taskId);

    /**
     * 分页查询任务
     * 使用XML映射实现复杂查询
     */
    List<AIPortraitTask> selectByPage(@Param("offset") int offset, @Param("limit") int limit);

    /**
     * 条件查询任务
     * 使用XML映射实现动态SQL
     */
    List<AIPortraitTask> selectByCondition(Map<String, Object> condition);

    /**
     * 批量插入任务
     * 使用XML映射实现批量操作
     */
    int batchInsert(List<AIPortraitTask> tasks);

    /**
     * 批量更新任务
     * 使用XML映射实现批量操作
     */
    int batchUpdate(List<AIPortraitTask> tasks);

    /**
     * 批量删除任务
     * 使用XML映射实现批量操作
     */
    int batchDelete(List<Long> ids);

    /**
     * 搜索任务（根据任务ID或错误信息）
     * 使用XML映射实现全文搜索
     */
    List<AIPortraitTask> search(@Param("keyword") String keyword);

    /**
     * 获取任务统计信息
     * 使用XML映射实现复杂统计
     */
    Map<String, Object> getStatistics();

    /**
     * 获取状态统计信息
     * 使用XML映射实现状态统计
     */
    Map<String, Object> getStatusStats();

    /**
     * 获取最近创建的任务
     * 使用XML映射实现排序查询
     */
    List<AIPortraitTask> getRecentTasks(@Param("limit") int limit);

    /**
     * 更新任务状态
     * 使用XML映射实现状态更新
     */
    int updateTaskStatus(@Param("taskId") String taskId, @Param("status") String status,
                         @Param("progress") Integer progress, @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * 更新任务完成状态
     * 使用XML映射实现完成状态更新
     */
    int updateTaskCompletion(@Param("taskId") String taskId, @Param("status") String status,
                             @Param("completedAt") LocalDateTime completedAt, @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * 更新任务开始时间
     * 使用XML映射实现开始时间更新
     */
    int updateTaskStart(@Param("taskId") String taskId, @Param("startedAt") LocalDateTime startedAt,
                        @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * 增加重试次数
     * 使用XML映射实现重试次数更新
     */
    int incrementRetryCount(@Param("taskId") String taskId);

    /**
     * 重置重试次数
     * 使用XML映射实现重试次数重置
     */
    int resetRetryCount(@Param("taskId") String taskId);

    /**
     * 批量更新任务状态
     * 使用XML映射实现批量状态更新
     */
    int batchUpdateStatus(@Param("taskIds") List<String> taskIds, @Param("status") String status);

    /**
     * 获取待处理任务（用于任务调度）
     * 使用XML映射实现任务调度查询
     */
    List<AIPortraitTask> getPendingTasks(@Param("limit") int limit);

    /**
     * 获取失败但可重试的任务
     * 使用XML映射实现可重试任务查询
     */
    List<AIPortraitTask> getRetryableTasks(@Param("limit") int limit);

    /**
     * 根据条件统计任务数量
     * 使用XML映射实现动态统计
     */
    long countByCondition(Map<String, Object> condition);
}

