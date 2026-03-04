package com.example.writemyself.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * AI 立绘模型配置表
 * 存储各个 AI 模型的配置和统计信息
 */
@Entity
@Table(name = "ai_portrait_model_config", indexes = {
        @Index(name = "idx_model_name", columnList = "modelName"),
        @Index(name = "idx_provider", columnList = "provider"),
        @Index(name = "idx_is_active", columnList = "isActive"),
        @Index(name = "idx_is_default", columnList = "isDefault")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIPortraitModelConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 模型信息
    @Column(nullable = false, length = 100)
    private String modelName;

    @Column(nullable = false, length = 50)
    private String modelType;

    @Column(nullable = false, length = 50)
    private String provider;

    @Column(nullable = false, length = 255)
    private String apiEndpoint;

    @Column(nullable = false, length = 500)
    private String apiKey;

    // 模型参数
    @Column(length = 50)
    private String defaultSampler;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxSteps = 50;

    @Column(nullable = false)
    @Builder.Default
    private Integer minSteps = 10;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxImageSize = 2048;

    @Column(nullable = false)
    @Builder.Default
    private Integer minImageSize = 256;

    // 微调参数
    @Column(length = 50)
    private String baseModelVersion;

    @Column(length = 255)
    private String tuningDataset;

    private Integer tuningEpochs;

    @Column(precision = 10, scale = 6)
    private BigDecimal tuningLearningRate;

    // 使用统计
    @Column(nullable = false)
    @Builder.Default
    private Long totalRequests = 0L;

    @Column(nullable = false)
    @Builder.Default
    private Long totalSuccess = 0L;

    @Column(nullable = false)
    @Builder.Default
    private Long totalFailed = 0L;

    @Column(nullable = false)
    @Builder.Default
    private Long avgResponseTime = 0L;

    // 配置状态
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    // 时间戳
    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

