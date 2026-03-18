package com.example.writemyself.entity;

import com.example.writemyself.model.AIPortraitTask;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * AI肖像任务实体类 - 用于数据库持久化
 * 同时支持JPA和MyBatis
 */
@Entity
@Table(name = "ai_portrait_task", indexes = {
        @Index(name = "idx_ai_portrait_task_task_id", columnList = "task_id", unique = true),
        @Index(name = "idx_ai_portrait_task_generation_id", columnList = "generation_id"),
        @Index(name = "idx_ai_portrait_task_status", columnList = "status"),
        @Index(name = "idx_ai_portrait_task_created_at", columnList = "created_at")
})
public class AIPortraitTaskEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "task_id", length = 64, unique = true, nullable = false)
    private String taskId;

    @Column(name = "generation_id")
    private Long generationId;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "progress")
    private Integer progress = 0;

    @Column(name = "retry_count")
    private Integer retryCount = 0;

    @Column(name = "max_retries")
    private Integer maxRetries = 3;

    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata; // JSON格式的元数据

    // 无参构造函数
    public AIPortraitTaskEntity() {
    }

    // 从AIPortraitTask模型转换
    public AIPortraitTaskEntity(AIPortraitTask task) {
        this.id = task.getId();
        this.taskId = task.getTaskId();
        this.generationId = task.getGenerationId();
        this.status = task.getStatus();
        this.progress = task.getProgress();
        this.retryCount = task.getRetryCount();
        this.maxRetries = task.getMaxRetries();
        this.lastError = task.getLastError();
        this.startedAt = task.getStartedAt();
        this.completedAt = task.getCompletedAt();
        this.createdAt = task.getCreatedAt();
        this.updatedAt = task.getUpdatedAt();
        // 注意：metadata需要特殊处理，这里暂时留空
    }

    // 转换为AIPortraitTask模型
    public AIPortraitTask toAIPortraitTask() {
        AIPortraitTask task = new AIPortraitTask();
        task.setId(this.id);
        task.setTaskId(this.taskId);
        task.setGenerationId(this.generationId);
        task.setStatus(this.status);
        task.setProgress(this.progress);
        task.setRetryCount(this.retryCount);
        task.setMaxRetries(this.maxRetries);
        task.setLastError(this.lastError);
        task.setStartedAt(this.startedAt);
        task.setCompletedAt(this.completedAt);
        task.setCreatedAt(this.createdAt);
        task.setUpdatedAt(this.updatedAt);
        // 注意：metadata需要特殊处理，这里暂时留空
        return task;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public Long getGenerationId() {
        return generationId;
    }

    public void setGenerationId(Long generationId) {
        this.generationId = generationId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }

    public Integer getMaxRetries() {
        return maxRetries;
    }

    public void setMaxRetries(Integer maxRetries) {
        this.maxRetries = maxRetries;
    }

    public String getLastError() {
        return lastError;
    }

    public void setLastError(String lastError) {
        this.lastError = lastError;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    @Override
    public String toString() {
        return "AIPortraitTaskEntity{" +
                "id=" + id +
                ", taskId='" + taskId + '\'' +
                ", generationId=" + generationId +
                ", status='" + status + '\'' +
                ", progress=" + progress +
                ", retryCount=" + retryCount +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}

