package com.example.writemyself.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * AI肖像模型配置模型
 */
public class AIPortraitModelConfig implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 提供商枚举
     */
    public enum Provider {
        VOLCENGINE("VOLCENGINE", "火山引擎"),
        ALIYUN("ALIYUN", "阿里云");

        private final String value;
        private final String description;

        Provider(String value, String description) {
            this.value = value;
            this.description = description;
        }

        public String getValue() {
            return value;
        }

        public String getDescription() {
            return description;
        }

        /**
         * 根据字符串值获取 Provider
         */
        public static Provider fromValue(String value) {
            for (Provider provider : Provider.values()) {
                if (provider.value.equals(value)) {
                    return provider;
                }
            }
            return VOLCENGINE;
        }
    }

    /**
     * 自增主键 ID
     */
    private Long id;

    /**
     * 模型名称（唯一）
     */
    private String modelName;

    /**
     * 显示名称
     */
    private String displayName;

    /**
     * 服务提供商
     */
    private String provider;

    /**
     * 端点 URL
     */
    private String endpointUrl;

    /**
     * 是否活跃
     */
    private Boolean isActive = true;

    /**
     * 描述
     */
    private String description;

    /**
     * 支持的风格（JSON数组）
     */
    private String supportedStyles;

    /**
     * 最大宽度
     */
    private Integer maxWidth = 2048;

    /**
     * 最大高度
     */
    private Integer maxHeight = 2048;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 额外元数据
     */
    private Map<String, Object> metadata;

    /**
     * 构造函数
     */
    public AIPortraitModelConfig() {
        this.metadata = new HashMap<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public AIPortraitModelConfig(String modelName, String displayName, String provider) {
        this();
        this.modelName = modelName;
        this.displayName = displayName;
        this.provider = provider;
    }

    // ===== Getters and Setters =====

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

    public Map<String, Object> getMetadata() {
        if (metadata == null) {
            metadata = new HashMap<>();
        }
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    @Override
    public String toString() {
        return "AIPortraitModelConfig{" +
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

