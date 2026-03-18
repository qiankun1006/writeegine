package com.example.writemyself.entity;

import com.example.writemyself.model.AIPortraitModelConfig;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * AI肖像模型配置实体类 - 用于数据库持久化
 * 同时支持JPA和MyBatis
 */
@Entity
@Table(name = "ai_portrait_model_config", indexes = {
        @Index(name = "idx_ai_portrait_model_config_model_name", columnList = "model_name", unique = true),
        @Index(name = "idx_ai_portrait_model_config_provider", columnList = "provider"),
        @Index(name = "idx_ai_portrait_model_config_is_active", columnList = "is_active"),
        @Index(name = "idx_ai_portrait_model_config_created_at", columnList = "created_at")
})
public class AIPortraitModelConfigEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "model_name", length = 100, unique = true, nullable = false)
    private String modelName;

    @Column(name = "display_name", length = 100, nullable = false)
    private String displayName;

    @Column(name = "provider", length = 50, nullable = false)
    private String provider;

    @Column(name = "endpoint_url", length = 500)
    private String endpointUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "supported_styles", columnDefinition = "JSON")
    private String supportedStyles; // JSON数组格式

    @Column(name = "max_width")
    private Integer maxWidth = 2048;

    @Column(name = "max_height")
    private Integer maxHeight = 2048;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata; // JSON格式的元数据

    // 无参构造函数
    public AIPortraitModelConfigEntity() {
    }

    // 从AIPortraitModelConfig模型转换
    public AIPortraitModelConfigEntity(AIPortraitModelConfig config) {
        this.id = config.getId();
        this.modelName = config.getModelName();
        this.displayName = config.getDisplayName();
        this.provider = config.getProvider();
        this.endpointUrl = config.getEndpointUrl();
        this.isActive = config.getIsActive();
        this.description = config.getDescription();
        this.supportedStyles = config.getSupportedStyles();
        this.maxWidth = config.getMaxWidth();
        this.maxHeight = config.getMaxHeight();
        this.createdAt = config.getCreatedAt();
        this.updatedAt = config.getUpdatedAt();
        // 注意：metadata需要特殊处理，这里暂时留空
    }

    // 转换为AIPortraitModelConfig模型
    public AIPortraitModelConfig toAIPortraitModelConfig() {
        AIPortraitModelConfig config = new AIPortraitModelConfig();
        config.setId(this.id);
        config.setModelName(this.modelName);
        config.setDisplayName(this.displayName);
        config.setProvider(this.provider);
        config.setEndpointUrl(this.endpointUrl);
        config.setIsActive(this.isActive);
        config.setDescription(this.description);
        config.setSupportedStyles(this.supportedStyles);
        config.setMaxWidth(this.maxWidth);
        config.setMaxHeight(this.maxHeight);
        config.setCreatedAt(this.createdAt);
        config.setUpdatedAt(this.updatedAt);
        // 注意：metadata需要特殊处理，这里暂时留空
        return config;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getEndpointUrl() {
        return endpointUrl;
    }

    public void setEndpointUrl(String endpointUrl) {
        this.endpointUrl = endpointUrl;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSupportedStyles() {
        return supportedStyles;
    }

    public void setSupportedStyles(String supportedStyles) {
        this.supportedStyles = supportedStyles;
    }

    public Integer getMaxWidth() {
        return maxWidth;
    }

    public void setMaxWidth(Integer maxWidth) {
        this.maxWidth = maxWidth;
    }

    public Integer getMaxHeight() {
        return maxHeight;
    }

    public void setMaxHeight(Integer maxHeight) {
        this.maxHeight = maxHeight;
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
        return "AIPortraitModelConfigEntity{" +
                "id=" + id +
                ", modelName='" + modelName + '\'' +
                ", displayName='" + displayName + '\'' +
                ", provider='" + provider + '\'' +
                ", isActive=" + isActive +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}

