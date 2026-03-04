package com.example.writemyself.repository;

import com.example.writemyself.entity.AIPortraitTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * AI 立绘异步任务 Repository
 */
@Repository
public interface AIPortraitTaskRepository extends JpaRepository<AIPortraitTask, Long> {

    /**
     * 根据 taskId 查询任务
     */
    Optional<AIPortraitTask> findByTaskId(String taskId);

    /**
     * 根据生成记录 ID 查询任务
     */
    Optional<AIPortraitTask> findByGenerationId(Long generationId);

    /**
     * 查询指定状态的任务
     */
    List<AIPortraitTask> findByStatus(String status);

    /**
     * 查询指定用户的任务
     */
    List<AIPortraitTask> findByUserId(Long userId);

    /**
     * 查询指定用户和状态的任务
     */
    List<AIPortraitTask> findByUserIdAndStatus(Long userId, String status);

    /**
     * 查询需要重试的任务（重试次数 < 最大重试次数）
     */
    List<AIPortraitTask> findByStatusAndRetryCountLessThan(String status, Integer maxRetries);
}

