package com.example.writemyself.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * AI肖像任务实体
 */
@Entity
@Table(name = "ai_portrait_task")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIPortraitTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id", nullable = false, unique = true, length = 64)
    private String taskId;

    @Column(name = "generation_id", nullable = false)
    private Long generationId;

    @Column(name = "status", length = 20, nullable = false)
    private String status; // PENDING, PROCESSING, SUCCESS, FAILED

    @Column(name = "progress")
    private Integer progress = 0; // 进度百分比

    @Column(name = "retry_count")
    private Integer retryCount = 0; // 重试次数

    @Column(name = "max_retries")
    private Integer maxRetries = 3; // 最大重试次数

    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError; // 最后一次错误信息

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

