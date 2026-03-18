package com.example.writemyself.entity;

import com.example.writemyself.model.AIPortraitGeneration;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * AI肖像生成记录实体类 - 用于数据库持久化
 * 同时支持JPA和MyBatis
 */
@Entity
@Table(name = "ai_portrait_generation", indexes = {
        @Index(name = "idx_ai_portrait_generation_user_id", columnList = "user_id"),
        @Index(name = "idx_ai_portrait_generation_task_id", columnList = "task_id"),
        @Index(name = "idx_ai_portrait_generation_status", columnList = "status"),
        @Index(name = "idx_ai_portrait_generation_created_at", columnList = "created_at")
})
public class AIPortraitGenerationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "task_id", length = 64, unique = true)
    private String taskId;

    @Column(name = "prompt", columnDefinition = "TEXT")
    private String prompt;

    @Column(name = "negative_prompt", columnDefinition = "TEXT")
    private String negativePrompt;

    @Column(name = "reference_image_url", length = 500)
    private String referenceImageUrl;

    @Column(name = "image_strength", precision = 5, scale = 2)
    private BigDecimal imageStrength;

    @Column(name = "width")
    private Integer width;

    @Column(name = "height")
    private Integer height;

    @Column(name = "provider", length = 50)
    private String provider;

    @Column(name = "model_name", length = 100)
    private String modelName;

    @Column(name = "model_version", length = 50)
    private String modelVersion;

    @Column(name = "model_weight", precision = 5, scale = 2)
    private BigDecimal modelWeight;

    @Column(name = "style_preset", length = 100)
    private String stylePreset;

    @Column(name = "inference_steps")
    private Integer inferenceSteps;

    @Column(name = "sampler_name", length = 50)
    private String samplerName;

    @Column(name = "seed")
    private Long seed;

    @Column(name = "generation_count")
    private Integer generationCount = 1;

    @Column(name = "face_enhance")
    private Boolean faceEnhance = true;

    @Column(name = "output_format", length = 20)
    private String outputFormat;

    @Column(name = "generated_image_urls", columnDefinition = "TEXT")
    private String generatedImageUrls;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "generation_time")
    private Integer generationTime;

    @Column(name = "queue_wait_time")
    private Integer queueWaitTime;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata; // JSON格式的元数据

    // 无参构造函数
    public AIPortraitGenerationEntity() {
    }

    // 从AIPortraitGeneration模型转换
    public AIPortraitGenerationEntity(AIPortraitGeneration generation) {
        this.id = generation.getId();
        this.userId = generation.getUserId();
        this.taskId = generation.getTaskId();
        this.prompt = generation.getPrompt();
        this.negativePrompt = generation.getNegativePrompt();
        this.referenceImageUrl = generation.getReferenceImageUrl();
        this.imageStrength = generation.getImageStrength();
        this.width = generation.getWidth();
        this.height = generation.getHeight();
        this.provider = generation.getProvider();
        this.modelName = generation.getModelName();
        this.modelVersion = generation.getModelVersion();
        this.modelWeight = generation.getModelWeight();
        this.stylePreset = generation.getStylePreset();
        this.inferenceSteps = generation.getInferenceSteps();
        this.samplerName = generation.getSamplerName();
        this.seed = generation.getSeed();
        this.generationCount = generation.getGenerationCount();
        this.faceEnhance = generation.getFaceEnhance();
        this.outputFormat = generation.getOutputFormat();
        this.generatedImageUrls = generation.getGeneratedImageUrls();
        this.status = generation.getStatus();
        this.errorMessage = generation.getErrorMessage();
        this.generationTime = generation.getGenerationTime();
        this.queueWaitTime = generation.getQueueWaitTime();
        this.createdAt = generation.getCreatedAt();
        this.updatedAt = generation.getUpdatedAt();
        this.completedAt = generation.getCompletedAt();
        // 注意：metadata需要特殊处理，这里暂时留空
    }

    // 转换为AIPortraitGeneration模型
    public AIPortraitGeneration toAIPortraitGeneration() {
        AIPortraitGeneration generation = AIPortraitGeneration.builder()
                .id(this.id)
                .userId(this.userId)
                .taskId(this.taskId)
                .prompt(this.prompt)
                .negativePrompt(this.negativePrompt)
                .referenceImageUrl(this.referenceImageUrl)
                .imageStrength(this.imageStrength)
                .width(this.width)
                .height(this.height)
                .provider(this.provider)
                .modelName(this.modelName)
                .modelVersion(this.modelVersion)
                .modelWeight(this.modelWeight)
                .stylePreset(this.stylePreset)
                .inferenceSteps(this.inferenceSteps)
                .samplerName(this.samplerName)
                .seed(this.seed)
                .generationCount(this.generationCount)
                .faceEnhance(this.faceEnhance)
                .outputFormat(this.outputFormat)
                .generatedImageUrls(this.generatedImageUrls)
                .status(this.status)
                .errorMessage(this.errorMessage)
                .generationTime(this.generationTime)
                .queueWaitTime(this.queueWaitTime)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .completedAt(this.completedAt)
                .build();
        // 注意：metadata需要特殊处理，这里暂时留空
        return generation;
    }

    // Getters and Setters
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

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    @Override
    public String toString() {
        return "AIPortraitGenerationEntity{" +
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

