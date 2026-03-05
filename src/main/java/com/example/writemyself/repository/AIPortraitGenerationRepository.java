package com.example.writemyself.repository;

import com.example.writemyself.entity.AIPortraitGeneration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * AI肖像生成记录仓库
 */
@Repository
public interface AIPortraitGenerationRepository extends JpaRepository<AIPortraitGeneration, Long> {

    /**
     * 根据任务ID查找生成记录
     */
    Optional<AIPortraitGeneration> findByTaskId(String taskId);

    /**
     * 根据用户ID查找生成记录
     */
    List<AIPortraitGeneration> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * 查找用户最近的生成记录（限制数量）
     */
    @Query("SELECT g FROM AIPortraitGeneration g WHERE g.userId = :userId ORDER BY g.createdAt DESC")
    List<AIPortraitGeneration> findRecentByUserId(@Param("userId") Long userId, org.springframework.data.domain.Pageable pageable);

    /**
     * 根据状态查找生成记录
     */
    List<AIPortraitGeneration> findByStatusOrderByCreatedAtAsc(String status);

    /**
     * 删除指定时间之前的生成记录
     */
    void deleteByCreatedAtBefore(java.time.LocalDateTime dateTime);
}

