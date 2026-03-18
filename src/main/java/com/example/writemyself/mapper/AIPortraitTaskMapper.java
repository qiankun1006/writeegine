package com.example.writemyself.mapper;

import com.example.writemyself.entity.AIPortraitTask;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * AI肖像任务数据访问Mapper接口
 */
@Mapper
@Repository
public interface AIPortraitTaskMapper {

    /**
     * 根据ID查询任务
     */
    @Select("SELECT * FROM ai_portrait_task WHERE id = #{id}")
    @Results(id = "aiPortraitTaskResultMap", value = {
            @Result(property = "id", column = "id"),
            @Result(property = "taskId", column = "task_id"),
            @Result(property = "generationId", column = "generation_id"),
            @Result(property = "status", column = "status"),
            @Result(property = "progress", column = "progress"),
            @Result(property = "retryCount", column = "retry_count"),
            @Result(property = "maxRetries", column = "max_retries"),
            @Result(property = "lastError", column = "last_error"),
            @Result(property = "startedAt", column = "started_at"),
            @Result(property = "completedAt", column = "completed_at"),
            @Result(property = "createdAt", column = "created_at"),
            @Result(property = "updatedAt", column = "updated_at")
    })
    AIPortraitTask selectById(@Param("id") Long id);

    /**
     * 根据任务ID查询任务
     */
    @Select("SELECT * FROM ai_portrait_task WHERE task_id = #{taskId}")
    @ResultMap("aiPortraitTaskResultMap")
    AIPortraitTask selectByTaskId(@Param("taskId") String taskId);

    /**
     * 根据生成ID查询任务
     */
    @Select("SELECT * FROM ai_portrait_task WHERE generation_id = #{generationId}")
    @ResultMap("aiPortraitTaskResultMap")
    List<AIPortraitTask> selectByGenerationId(@Param("generationId") Long generationId);

    /**
     * 根据状态查询任务
     */
    @Select("SELECT * FROM ai_portrait_task WHERE status = #{status} ORDER BY created_at ASC")
    @ResultMap("aiPortraitTaskResultMap")
    List<AIPortraitTask> selectByStatus(@Param("status") String status);

    /**
     * 查询所有任务
     */
    @Select("SELECT * FROM ai_portrait_task ORDER BY created_at DESC")
    @ResultMap("aiPortraitTaskResultMap")
    List<AIPortraitTask> selectAll();

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
     * 根据任务ID删除任务
     */
    @Delete("DELETE FROM ai_portrait_task WHERE task_id = #{taskId}")
    int deleteByTaskId(@Param("taskId") String taskId);

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
     * 更新任务状态
     */
    @Update("UPDATE ai_portrait_task SET status = #{status}, updated_at = #{updatedAt} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") String status, @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * 更新任务进度
     */
    @Update("UPDATE ai_portrait_task SET progress = #{progress}, updated_at = #{updatedAt} WHERE id = #{id}")
    int updateProgress(@Param("id") Long id, @Param("progress") Integer progress, @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * 更新任务错误信息
     */
    @Update("UPDATE ai_portrait_task SET last_error = #{lastError}, retry_count = retry_count + 1, updated_at = #{updatedAt} WHERE id = #{id}")
    int updateError(@Param("id") Long id, @Param("lastError") String lastError, @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * 重置任务重试次数
     */
    @Update("UPDATE ai_portrait_task SET retry_count = 0, updated_at = #{updatedAt} WHERE id = #{id}")
    int resetRetryCount(@Param("id") Long id, @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * 标记任务为开始处理
     */
    @Update("UPDATE ai_portrait_task SET status = 'PROCESSING', started_at = #{startedAt}, updated_at = #{updatedAt} WHERE id = #{id}")
    int markAsProcessing(@Param("id") Long id, @Param("startedAt") LocalDateTime startedAt, @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * 标记任务为完成
     */
    @Update("UPDATE ai_portrait_task SET status = 'SUCCESS', progress = 100, completed_at = #{completedAt}, updated_at = #{updatedAt} WHERE id = #{id}")
    int markAsSuccess(@Param("id") Long id, @Param("completedAt") LocalDateTime completedAt, @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * 标记任务为失败
     */
    @Update("UPDATE ai_portrait_task SET status = 'FAILED', completed_at = #{completedAt}, updated_at = #{updatedAt} WHERE id = #{id}")
    int markAsFailed(@Param("id") Long id, @Param("completedAt") LocalDateTime completedAt, @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * 获取待处理的任务
     */
    @Select("SELECT * FROM ai_portrait_task WHERE status = 'PENDING' AND retry_count < max_retries ORDER BY created_at ASC LIMIT #{limit}")
    @ResultMap("aiPortraitTaskResultMap")
    List<AIPortraitTask> selectPendingTasks(@Param("limit") int limit);

    /**
     * 获取失败的任务（可重试）
     */
    @Select("SELECT * FROM ai_portrait_task WHERE status = 'FAILED' AND retry_count < max_retries ORDER BY updated_at ASC LIMIT #{limit}")
    @ResultMap("aiPortraitTaskResultMap")
    List<AIPortraitTask> selectFailedTasks(@Param("limit") int limit);

    /**
     * 获取超时的任务（处理时间超过指定分钟）
     */
    @Select("SELECT * FROM ai_portrait_task WHERE status = 'PROCESSING' AND started_at < #{timeoutTime} ORDER BY started_at ASC")
    @ResultMap("aiPortraitTaskResultMap")
    List<AIPortraitTask> selectTimeoutTasks(@Param("timeoutTime") LocalDateTime timeoutTime);

    /**
     * 清理旧的任务记录（保留最近N天的记录）
     */
    @Delete("DELETE FROM ai_portrait_task WHERE created_at < #{cutoffTime}")
    int cleanupOldTasks(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * 条件查询任务
     */
    List<AIPortraitTask> selectByCondition(Map<String, Object> params);

    /**
     * 分页查询任务
     */
    List<AIPortraitTask> selectByPage(@Param("limit") int limit, @Param("offset") int offset);

    /**
     * 批量插入任务
     */
    int batchInsert(List<AIPortraitTask> tasks);

    /**
     * 批量更新任务
     */
    int batchUpdate(List<AIPortraitTask> tasks);

    /**
     * 批量删除任务
     */
    int batchDelete(List<Long> ids);

    /**
     * 批量更新任务状态
     */
    int batchUpdateStatus(@Param("ids") List<Long> ids, @Param("status") String status, @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * 获取任务统计信息
     */
    List<Map<String, Object>> getStatistics();

    /**
     * 获取任务状态分布
     */
    List<Map<String, Object>> getStatusDistribution();

    /**
     * 获取任务处理时间统计
     */
    List<Map<String, Object>> getProcessingTimeStats();

    /**
     * 获取最近活跃的任务
     */
    List<AIPortraitTask> getRecentActiveTasks(@Param("limit") int limit);

    /**
     * 获取需要重试的任务
     */
    List<AIPortraitTask> getTasksNeedRetry(@Param("limit") int limit);

    /**
     * 批量更新任务进度
     */
    int batchUpdateProgress(@Param("ids") List<Long> ids, @Param("increment") int increment, @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * 根据条件统计任务数量
     */
    long countByCondition(Map<String, Object> params);

    /**
     * 获取任务错误统计
     */
    List<Map<String, Object>> getErrorStatistics();

    /**
     * 获取任务性能指标
     */
    List<Map<String, Object>> getPerformanceMetrics();
}

