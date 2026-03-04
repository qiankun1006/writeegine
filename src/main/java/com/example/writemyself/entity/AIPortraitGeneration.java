package com.example.writemyself.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * AI 立绘生成记录表
 * 存储所有的生成请求和结果
 */
@Entity
@Table(name = "ai_portrait_generation", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_task_id", columnList = "task_id"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_created_at", columnList = "created_at"),
        @Index(name = "idx_provider", columnList = "provider")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIPortraitGeneration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 基础信息
    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, unique = true, length = 64)
    private String taskId;

    // 输入参数
    @Column(nullable = false, columnDefinition = "TEXT")
    private String prompt;

    @Column(columnDefinition = "TEXT")
    private String negativePrompt;

    @Column(length = 255)
    private String referenceImageUrl;

    @Column(precision = 3, scale = 2)
    private BigDecimal modelWeight;

    // 模型选择
    @Column(length = 50, nullable = false)
    @Builder.Default
    private String provider = "aliyun";

    @Column(length = 100)
    @Builder.Default
    private String modelVersion = "v1";

    // 尺寸信息
    @Column(nullable = false)
    private Integer width;

    @Column(nullable = false)
    private Integer height;

    // 高级参数
    @Column(precision = 3, scale = 2)
    private BigDecimal imageStrength;

    @Column(nullable = false)
    @Builder.Default
    private Integer generationCount = 1;

    @Column(length = 50)
    private String samplerName;

    @Column(nullable = false)
    @Builder.Default
    private Integer inferenceSteps = 30;

    @Column(length = 50)
    private String stylePreset;

    @Column(nullable = false)
    @Builder.Default
    private Long seed = -1L;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enableFaceFix = true;

    @Column(length = 10)
    @Builder.Default
    private String outputFormat = "PNG";

    // 输出结果
    @Column(length = 20, nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String generatedImageUrls;

    @Column(length = 500)
    private String errorMessage;

    // 性能指标
    private Long generationTime;

    private Long queueWaitTime;

    // 时间戳
    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    private LocalDateTime completedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

