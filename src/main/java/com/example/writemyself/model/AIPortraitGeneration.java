package com.example.writemyself.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * AI肖像生成记录模型
 * 保存用户提交的生成参数和生成结果
 */
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class AIPortraitGeneration implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 状态枚举
     */
    public enum Status {
        PENDING("PENDING", "待处理"),
        PROCESSING("PROCESSING", "生成中"),
        SUCCESS("SUCCESS", "已完成"),
        FAILED("FAILED", "失败");

        private final String value;
        private final String description;

        Status(String value, String description) {
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
         * 根据字符串值获取 Status
         */
        public static Status fromValue(String value) {
            for (Status status : Status.values()) {
                if (status.value.equals(value)) {
                    return status;
                }
            }
            return PENDING;
        }
    }

    /**
     * 自增主键 ID
     */
    private Long id;

    /**
     * 用户 ID
     */
    private Long userId;

    /**
     * 全局唯一的任务 ID
     */
    private String taskId;

    /**
     * 正面提示词
     */
    private String prompt;

    /**
     * 负面提示词
     */
    private String negativePrompt;

    /**
     * 参考图片（Base64 编码）
     */
    private String referenceImageUrl;

    /**
     * 参考图片强度
     */
    private BigDecimal imageStrength;

    /**
     * 生成图片的宽度（像素）
     */
    private Integer width;

    /**
     * 生成图片的高度（像素）
     */
    private Integer height;

    /**
     * 服务提供商
     */
    private String provider;

    /**
     * 模型名称
     */
    private String modelName;

    /**
     * 模型版本
     */
    private String modelVersion;

    /**
     * 模型权重
     */
    private BigDecimal modelWeight;

    /**
     * 风格预设
     */
    private String stylePreset;

    /**
     * 推理步数 / 迭代次数
     */
    private Integer inferenceSteps;

    /**
     * 采样器名称
     */
    private String samplerName;

    /**
     * 随机种子值
     */
    private Long seed;

    /**
     * 生成数量
     */
    private Integer generationCount = 1;

    /**
     * 面部增强
     */
    private Boolean faceEnhance = true;

    /**
     * 输出格式
     */
    private String outputFormat;

    /**
     * 生成的图片 URL 列表
     */
    private String generatedImageUrls;

    /**
     * 任务状态
     */
    private String status;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 实际生成耗时（秒）
     */
    private Integer generationTime;

    /**
     * 排队等待时间（秒）
     */
    private Integer queueWaitTime;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 完成时间
     */
    private LocalDateTime completedAt;

    /**
     * 额外元数据
     */
    private Map<String, Object> metadata = new HashMap<>();

    // ===== Getters and Setters =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getNegativePrompt() {
        return negativePrompt;
    }

    public void setNegativePrompt(String negativePrompt) {
        this.negativePrompt = negativePrompt;
    }

    public String getReferenceImageUrl() {
        return referenceImageUrl;
    }

    public void setReferenceImageUrl(String referenceImageUrl) {
        this.referenceImageUrl = referenceImageUrl;
    }

    public BigDecimal getImageStrength() {
        return imageStrength;
    }

    public void setImageStrength(BigDecimal imageStrength) {
        this.imageStrength = imageStrength;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public BigDecimal getModelWeight() {
        return modelWeight;
    }

    public void setModelWeight(BigDecimal modelWeight) {
        this.modelWeight = modelWeight;
    }

    public String getStylePreset() {
        return stylePreset;
    }

    public void setStylePreset(String stylePreset) {
        this.stylePreset = stylePreset;
    }

    public Integer getInferenceSteps() {
        return inferenceSteps;
    }

    public void setInferenceSteps(Integer inferenceSteps) {
        this.inferenceSteps = inferenceSteps;
    }

    public String getSamplerName() {
        return samplerName;
    }

    public void setSamplerName(String samplerName) {
        this.samplerName = samplerName;
    }

    public Long getSeed() {
        return seed;
    }

    public void setSeed(Long seed) {
        this.seed = seed;
    }

    public Integer getGenerationCount() {
        return generationCount;
    }

    public void setGenerationCount(Integer generationCount) {
        this.generationCount = generationCount;
    }

    public Boolean getFaceEnhance() {
        return faceEnhance;
    }

    public void setFaceEnhance(Boolean faceEnhance) {
        this.faceEnhance = faceEnhance;
    }

    public String getOutputFormat() {
        return outputFormat;
    }

    public void setOutputFormat(String outputFormat) {
        this.outputFormat = outputFormat;
    }

    public String getGeneratedImageUrls() {
        return generatedImageUrls;
    }

    public void setGeneratedImageUrls(String generatedImageUrls) {
        this.generatedImageUrls = generatedImageUrls;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Integer getGenerationTime() {
        return generationTime;
    }

    public void setGenerationTime(Integer generationTime) {
        this.generationTime = generationTime;
    }

    public Integer getQueueWaitTime() {
        return queueWaitTime;
    }

    public void setQueueWaitTime(Integer queueWaitTime) {
        this.queueWaitTime = queueWaitTime;
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

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
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
        return "AIPortraitGeneration{" +
                "id=" + id +
                ", userId=" + userId +
                ", taskId='" + taskId + '\'' +
                ", status='" + status + '\'' +
                ", modelName='" + modelName + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}

