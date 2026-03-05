package com.example.writemyself.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * AI肖像模型配置实体
 */
@Entity
@Table(name = "ai_portrait_model_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIPortraitModelConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_name", nullable = false, unique = true, length = 100)
    private String modelName;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "provider", nullable = false, length = 50)
    private String provider; // VOLCENGINE, ALIYUN

    @Column(name = "endpoint_url", length = 255)
    private String endpointUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "supported_styles", columnDefinition = "TEXT")
    private String supportedStyles; // JSON数组

    @Column(name = "max_width")
    private Integer maxWidth = 2048;

    @Column(name = "max_height")
    private Integer maxHeight = 2048;

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

