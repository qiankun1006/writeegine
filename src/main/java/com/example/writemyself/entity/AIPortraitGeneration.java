package com.example.writemyself.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * AI 人物立绘生成记录实体
 *
 * 保存用户提交的生成参数和生成结果。
 * 一条记录对应一次"开始生成"请求的完整生命周期。
 *
 * @author AI Portrait Generator
 * @version 1.0
 */
@Entity
@Table(name = "ai_portrait_generation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIPortraitGeneration {

    // ============ 主键和追踪字段 ============

    /**
     * 自增主键 ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户 ID
     * 用于隔离不同用户的生成记录
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * 全局唯一的任务 ID
     * 格式：task_timestamp_uuid
     * 用于前后端交互和进度查询
     */
    @Column(name = "task_id", nullable = false, unique = true, length = 64)
    private String taskId;

    // ============ 核心参数：提示词 ============

    /**
     * 正面提示词
     * 用户输入的用于描述生成角色的关键词和描述
     */
    @Column(name = "prompt", columnDefinition = "TEXT", nullable = false)
    private String prompt;

    /**
     * 负面提示词
     * 用于告知 AI 模型要避免的元素和特征
     */
    @Column(name = "negative_prompt", columnDefinition = "TEXT")
    private String negativePrompt;

    // ============ 参考图片 ============

    /**
     * 参考图片（Base64 编码）
     * 用户上传的参考图片，以 Base64 格式存储
     * 用于图生图模式的参考
     */
    @Column(name = "reference_image_url", columnDefinition = "LONGTEXT")
    private String referenceImageUrl;

    /**
     * 参考图片强度
     * 控制参考图片对生成结果的影响程度（0.0-1.0）
     */
    @Column(name = "image_strength", precision = 3, scale = 2)
    private BigDecimal imageStrength;

    // ============ 生成尺寸 ============

    /**
     * 生成图片的宽度（像素）
     */
    @Column(name = "width", nullable = false)
    private Integer width;

    /**
     * 生成图片的高度（像素）
     */
    @Column(name = "height", nullable = false)
    private Integer height;

    // ============ 模型和服务商 ============

    /**
     * 服务提供商
     * 值：aliyun (阿里云)，volcengine (火山引擎)
     */
    @Column(name = "provider", length = 50)
    private String provider;

    /**
     * 模型名称
     * 使用的模型版本号，由模型版本决定
     * 例如：wanx-v1, flux, doubao-seedream-5-0-260128
     */
    @Column(name = "model_name", length = 100, nullable = false)
    private String modelName;

    /**
     * 模型版本（冗余字段）
     */
    @Column(name = "model_version", length = 50)
    private String modelVersion;

    /**
     * 模型权重
     * 控制模型对输入参数的遵循程度（0.0-1.0）
     */
    @Column(name = "model_weight", precision = 3, scale = 2)
    private BigDecimal modelWeight;

    // ============ 高级参数 ============

    /**
     * 风格预设
     * 预设的艺术风格，例如：none, anime, oil_painting
     */
    @Column(name = "style_preset", length = 50)
    private String stylePreset;

    /**
     * 推理步数 / 迭代次数
     * 生成过程中的迭代次数（10-50）
     * 值越大，生成质量越高，但耗时越长
     */
    @Column(name = "inference_steps")
    private Integer inferenceSteps;

    /**
     * 采样器名称
     * 采样算法，例如：euler, dpm++, autocfg
     */
    @Column(name = "sampler_name", length = 50)
    private String samplerName;

    /**
     * 随机种子值
     * -1 表示随机，其他正整数为固定种子
     * 相同的种子值会生成相同的结果
     */
    @Column(name = "seed")
    private Long seed;

    // ============ 生成配置 ============

    /**
     * 生成数量（已弃用，推荐使用 generationCount）
     */
    @Column(name = "count")
    private Integer count = 1;

    /**
     * 生成数量
     * 一次请求生成多少张图片（1-4）
     */
    @Column(name = "generation_count")
    private Integer generationCount = 1;

    /**
     * 面部增强
     * 是否启用面部修复和增强功能
     */
    @Column(name = "face_enhance")
    private Boolean faceEnhance = true;

    /**
     * 输出格式
     * 生成图片的文件格式：png, jpg
     */
    @Column(name = "output_format", length = 10)
    private String outputFormat;

    // ============ 生成结果 ============

    /**
     * 生成的图片 URL 列表
     * 多张图片用逗号分隔
     * 例如：url1,url2,url3
     */
    @Column(name = "generated_image_urls", columnDefinition = "LONGTEXT")
    private String generatedImageUrls;

    /**
     * 任务状态
     * 可能的值：
     * - PENDING (待处理)：任务已创建，等待处理
     * - PROCESSING (生成中)：任务正在生成中
     * - SUCCESS (已完成)：任务成功完成
     * - FAILED (失败)：任务处理失败
     */
    @Column(name = "status", length = 20, nullable = false)
    private String status;

    /**
     * 错误信息
     * 当任务失败时存储的错误详情
     */
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    // ============ 统计信息 ============

    /**
     * 实际生成耗时
     * 单位：秒
     * 从开始处理到完成生成的实际耗时
     */
    @Column(name = "generation_time")
    private java.lang.Integer generationTime;

    /**
     * 排队等待时间
     * 单位：秒
     * 从提交请求到开始处理的等待时间
     */
    @Column(name = "queue_wait_time")
    private java.lang.Integer queueWaitTime;

    // ============ 时间戳 ============

    /**
     * 创建时间
     * 记录创建的时间戳
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     * 记录最后更新的时间戳
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 完成时间
     * 任务完成（成功或失败）的时间戳
     */
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    /**
     * JPA 生命周期回调：创建前
     * 自动设置创建时间和更新时间
     */
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    /**
     * JPA 生命周期回调：更新前
     * 自动更新 updatedAt 字段
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

