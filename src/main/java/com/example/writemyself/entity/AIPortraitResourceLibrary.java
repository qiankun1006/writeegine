package com.example.writemyself.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * AI 立绘资源库表
 * 存储用户保存的生成结果
 */
@Entity
@Table(name = "ai_portrait_resource_library", indexes = {
        @Index(name = "idx_user_id", columnList = "userId"),
        @Index(name = "idx_generation_id", columnList = "generationId"),
        @Index(name = "idx_category", columnList = "category"),
        @Index(name = "idx_is_public", columnList = "isPublic"),
        @Index(name = "idx_created_at", columnList = "createdAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIPortraitResourceLibrary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private Long generationId;

    // 资源信息
    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String category;

    // 图片信息
    @Column(nullable = false, length = 255)
    private String imageUrl;

    @Column(length = 10)
    private String imageFormat;

    private Long imageSize;

    private Integer imageWidth;

    private Integer imageHeight;

    // 元数据
    @Column(columnDefinition = "TEXT")
    private String generationParams;

    @Column(length = 500)
    private String tags;

    // 统计
    @Column(nullable = false)
    @Builder.Default
    private Integer usageCount = 0;

    @Column(precision = 2, scale = 1)
    private BigDecimal rating;

    // 状态
    @Column(nullable = false)
    @Builder.Default
    private Boolean isPublic = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isArchived = false;

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

