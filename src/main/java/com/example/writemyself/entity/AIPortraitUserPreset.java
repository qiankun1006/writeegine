package com.example.writemyself.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * AI 立绘用户预设表
 * 存储用户保存的参数预设
 */
@Entity
@Table(name = "ai_portrait_user_preset", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_is_favorite", columnList = "is_favorite"),
        @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIPortraitUserPreset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String presetName;

    // 参数配置
    @Column(nullable = false, columnDefinition = "TEXT")
    private String promptTemplate;

    @Column(columnDefinition = "TEXT")
    private String negativePrompt;

    @Column(length = 50)
    private String stylePreset;

    // 参数
    @Column(nullable = false)
    @Builder.Default
    private Integer width = 1024;

    @Column(nullable = false)
    @Builder.Default
    private Integer height = 1024;

    @Column(nullable = false)
    @Builder.Default
    private Integer inferenceSteps = 30;

    @Column(length = 50)
    private String samplerName;

    @Column(nullable = false)
    @Builder.Default
    private Long seed = -1L;

    // 模型配置
    @Column(length = 50, nullable = false)
    @Builder.Default
    private String preferredProvider = "aliyun";

    @Column(length = 100)
    private String preferredModel;

    // 状态
    @Column(nullable = false)
    @Builder.Default
    private Boolean isFavorite = false;

    @Column(nullable = false)
    @Builder.Default
    private Integer usageCount = 0;

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

