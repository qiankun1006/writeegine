package com.example.writemyself.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 增强骨骼素材生成 - 步骤明细实体
 *
 * 对应 skeleton_pipeline_step 表。
 * 每条记录对应流水线中某个任务的一个步骤（共8步）。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkeletonPipelineStep {

    /** 主键ID */
    private Long id;

    /** 关联的任务ID */
    private String taskId;

    /** 步骤序号 1-8 */
    private Integer stepNo;

    /** 步骤名称，如：生成T-pose骨骼线图 */
    private String stepName;

    /**
     * 步骤唯一键：
     * skeleton_line / controlnet / ip_adapter / flux_generate /
     * bg_remove / sam_segment / binding_data / save_result
     */
    private String stepKey;

    /**
     * 状态：PENDING / PROCESSING / SUCCESS / FAILED / SKIPPED
     */
    private String status;

    /** 步骤内进度 0-100 */
    private Integer progress;

    /** 步骤错误信息 */
    private String errorMessage;

    /** 该步骤输出的图片URL（步骤1/2/4/5适用） */
    private String outputImageUrl;

    /** 该步骤输出的结构化数据（步骤3/6/7/8适用，存为文本） */
    private String outputDataJson;

    /** 该步骤输出的文件URL（步骤7/8适用） */
    private String outputFileUrl;

    /** 步骤开始时间 */
    private LocalDateTime startedAt;

    /** 步骤完成时间 */
    private LocalDateTime completedAt;

    /** 步骤耗时（毫秒） */
    private Long durationMs;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 最后更新时间 */
    private LocalDateTime updatedAt;

    // ============ Token 计量字段（V4新增） ============

    /**
     * 本步骤输入 Token 数
     * 主要用于 Flux 生成（prompt token）和 see-through 分解（图片 token）步骤
     */
    private Integer inputTokens;

    /**
     * 本步骤输出 Token 数
     */
    private Integer outputTokens;

    /**
     * 本步骤实际使用的模型名称
     * 例如：flux.1-dev / qwen-vl-max / sam2_hiera_large / openpose_18
     */
    private String modelName;
}

