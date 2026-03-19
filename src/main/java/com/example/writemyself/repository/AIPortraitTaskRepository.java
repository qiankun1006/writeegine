package com.example.writemyself.repository;

import com.example.writemyself.model.AIPortraitTask;

import java.util.Optional;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;
import java.util.Optional;
import java.util.Map;

/**
 * AI肖像任务仓储接口
 * 支持内存存储和数据库存储
 */
public interface AIPortraitTaskRepository {
    /**
     * 保存或更新任务
     */
    void save(AIPortraitTask task);

    /**
     * 根据 ID 查询任务
     */
    Optional<AIPortraitTask> findById(Long id);

    /**
     * 根据任务ID查找任务
     */
    Optional<AIPortraitTask> findByTaskId(String taskId);

    /**
     * 根据生成记录ID查找任务
     */
    Optional<AIPortraitTask> findByGenerationId(Long generationId);

    /**
     * 获取所有任务
     */
    List<AIPortraitTask> findAll();

    /**
     * 根据状态查找任务
     */
    List<AIPortraitTask> findByStatus(String status);

    /**
     * 根据状态查找任务（按创建时间升序）
     */
    List<AIPortraitTask> findByStatusOrderByCreatedAtAsc(String status);

    /**
     * 根据状态和重试次数查找任务
     */
    List<AIPortraitTask> findByStatusAndRetryCountLessThan(String status, Integer retryCount);

    /**
     * 删除任务
     */
    void delete(Long id);

    /**
     * 删除所有任务（仅用于测试）
     */
    void deleteAll();

    /**
     * 获取任务数量
     */
    long count();

    /**
     * 根据状态获取任务数量
     */
    long countByStatus(String status);

    /**
     * 检查任务是否存在
     */
    boolean existsById(Long id);

    /**
     * 检查任务ID是否存在
     */
    boolean existsByTaskId(String taskId);

    /**
     * 分页查询任务
     */
    List<AIPortraitTask> findByPage(int page, int size);

    /**
     * 条件查询任务
     */
    List<AIPortraitTask> findByCondition(Map<String, Object> condition);

    /**
     * 搜索任务
     */
    List<AIPortraitTask> search(String keyword);

    /**
     * 获取最近创建的任务
     */
    List<AIPortraitTask> getRecentTasks(int limit);

    /**
     * 批量保存任务
     */
    void batchSave(List<AIPortraitTask> tasks);

    /**
     * 批量更新任务
     */
    void batchUpdate(List<AIPortraitTask> tasks);

    /**
     * 批量删除任务
     */
    void batchDelete(List<Long> ids);

    /**
     * 获取任务统计信息
     */
    Map<String, Object> getStatistics();

    /**
     * 获取状态统计信息
     */
    Map<String, Object> getStatusStats();

    /**
     * 更新任务状态
     */
    void updateTaskStatus(String taskId, String status, Integer progress, LocalDateTime updatedAt);

    /**
     * 更新任务完成状态
     */
    void updateTaskCompletion(String taskId, String status, LocalDateTime completedAt, LocalDateTime updatedAt);

    /**
     * 更新任务开始时间
     */
    void updateTaskStart(String taskId, LocalDateTime startedAt, LocalDateTime updatedAt);

    /**
     * 增加重试次数
     */
    void incrementRetryCount(String taskId);

    /**
     * 重置重试次数
     */
    void resetRetryCount(String taskId);

    /**
     * 批量更新任务状态
     */
    void batchUpdateStatus(List<String> taskIds, String status);

    /**
     * 获取待处理任务（用于任务调度）
     */
    List<AIPortraitTask> getPendingTasks(int limit);

    /**
     * 获取失败但可重试的任务
     */
    List<AIPortraitTask> getRetryableTasks(int limit);
}

