package com.example.writemyself.repository;

import com.example.writemyself.entity.AIPortraitTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * AI肖像任务仓库
 */
@Repository
public interface AIPortraitTaskRepository extends JpaRepository<AIPortraitTask, Long> {

    /**
     * 根据任务ID查找任务
     */
    Optional<AIPortraitTask> findByTaskId(String taskId);

    /**
     * 根据生成记录ID查找任务
     */
    Optional<AIPortraitTask> findByGenerationId(Long generationId);

    /**
     * 根据状态查找任务
     */
    List<AIPortraitTask> findByStatusOrderByCreatedAtAsc(String status);

    /**
     * 根据状态查找任务（简单查询）
     */
    List<AIPortraitTask> findByStatus(String status);

    /**
     * 根据状态和重试次数查找任务
     */
    List<AIPortraitTask> findByStatusAndRetryCountLessThan(String status, Integer retryCount);

    /**
     * 更新任务状态
     */
    @Modifying
    @Query("UPDATE AIPortraitTask t SET t.status = :status, t.progress = :progress, t.updatedAt = :updatedAt WHERE t.taskId = :taskId")
    void updateTaskStatus(@Param("taskId") String taskId,
                         @Param("status") String status,
                         @Param("progress") Integer progress,
                         @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * 更新任务完成状态
     */
    @Modifying
    @Query("UPDATE AIPortraitTask t SET t.status = :status, t.progress = 100, t.completedAt = :completedAt, t.updatedAt = :updatedAt WHERE t.taskId = :taskId")
    void updateTaskCompletion(@Param("taskId") String taskId,
                             @Param("status") String status,
                             @Param("completedAt") LocalDateTime completedAt,
                             @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * 更新任务开始时间
     */
    @Modifying
    @Query("UPDATE AIPortraitTask t SET t.status = 'PROCESSING', t.startedAt = :startedAt, t.updatedAt = :updatedAt WHERE t.taskId = :taskId")
    void updateTaskStart(@Param("taskId") String taskId,
                        @Param("startedAt") LocalDateTime startedAt,
                        @Param("updatedAt") LocalDateTime updatedAt);
}

