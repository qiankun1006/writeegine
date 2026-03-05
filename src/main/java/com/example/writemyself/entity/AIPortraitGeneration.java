package com.example.writemyself.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * AI肖像生成记录实体
 */
@Entity
@Table(name = "ai_portrait_generation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIPortraitGeneration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "task_id", nullable = false, unique = true, length = 64)
    private String taskId;

    @Column(name = "prompt", columnDefinition = "TEXT", nullable = false)
    private String prompt;

    @Column(name = "negative_prompt", columnDefinition = "TEXT")
    private String negativePrompt;

    @Column(name = "reference_image_url", length = 512)
    private String referenceImageUrl;

    @Column(name = "width", nullable = false)
    private Integer width;

    @Column(name = "height", nullable = false)
    private Integer height;

    @Column(name = "model_name", length = 100, nullable = false)
    private String modelName;

    @Column(name = "model_version", length = 50)
    private String modelVersion;

    @Column(name = "style_preset", length = 50)
    private String stylePreset;

    @Column(name = "inference_steps")
    private Integer inferenceSteps;

    @Column(name = "sampler_name", length = 50)
    private String samplerName;

    @Column(name = "seed")
    private Long seed;

    @Column(name = "count")
    private Integer count = 1;

    @Column(name = "generation_count")
    private Integer generationCount = 1;

    @Column(name = "generated_image_urls", columnDefinition = "TEXT")
    private String generatedImageUrls;

    @Column(name = "status", length = 20, nullable = false)
    private String status; // PENDING, PROCESSING, SUCCESS, FAILED

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "generation_time")
    private Integer generationTime; // 生成耗时（秒）

    @Column(name = "queue_wait_time")
    private Integer queueWaitTime; // 排队等待时间（秒）

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

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

