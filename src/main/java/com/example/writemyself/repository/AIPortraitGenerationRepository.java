package com.example.writemyself.repository;

import com.example.writemyself.entity.AIPortraitGeneration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * AI 立绘生成记录 Repository
 */
@Repository
public interface AIPortraitGenerationRepository extends JpaRepository<AIPortraitGeneration, Long> {

    /**
     * 根据 taskId 查询生成记录
     */
    Optional<AIPortraitGeneration> findByTaskId(String taskId);

    /**
     * 根据用户 ID 查询所有生成记录
     */
    List<AIPortraitGeneration> findByUserId(Long userId);

    /**
     * 根据用户 ID 和状态查询
     */
    List<AIPortraitGeneration> findByUserIdAndStatus(Long userId, String status);

    /**
     * 查询指定用户最近的生成记录
     */
    @Query(value = "SELECT * FROM ai_portrait_generation WHERE user_id = :userId ORDER BY created_at DESC LIMIT :limit",
            nativeQuery = true)
    List<AIPortraitGeneration> findRecentByUserId(@Param("userId") Long userId, @Param("limit") int limit);

    /**
     * 查询指定时间范围内的生成记录
     */
    List<AIPortraitGeneration> findByCreatedAtBetween(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 查询失败的任务（用于重试）
     */
    List<AIPortraitGeneration> findByStatusAndUserIdOrderByCreatedAtDesc(String status, Long userId);
}

