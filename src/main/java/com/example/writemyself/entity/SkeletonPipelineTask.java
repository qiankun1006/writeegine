package com.example.writemyself.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 增强骨骼素材生成 - 主任务实体
 *
 * 对应 skeleton_pipeline_task 表。
 * 记录每次增强骨骼生成任务的整体状态和最终结果。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkeletonPipelineTask {

    /** 主键ID */
    private Long id;

    /** 任务唯一标识，如 enhanced_skeleton_1710000000000 */
    private String taskId;

    /** 用户ID */
    private String userId;

    /** 生成风格：anime/realistic/chibi/cartoon/pixel */
    private String style;

    /** 骨骼模板类型 */
    private String templateType;

    /** 姿态 */
    private String pose;

    /** 提示词 */
    private String prompt;

    /** 负面提示词 */
    private String negativePrompt;

    /** 目标宽度 */
    private Integer width;

    /** 目标高度 */
    private Integer height;

    /** 参考图URL（若有） */
    private String refImageUrl;

    /**
     * 整体状态：PENDING/PROCESSING/SUCCESS/FAILED
     */
    private String status;

    /** 整体进度 0-100 */
    private Integer progress;

    /** 整体错误信息 */
    private String errorMessage;

    /** 最终完整透明图URL */
    private String fullImageUrl;

    /** 骨骼绑定JSON（通用格式）URL */
    private String skeletonJsonUrl;

    /** 骨骼绑定JSON（Spine格式）URL */
    private String skeletonSpineUrl;

    /** 骨骼绑定JSON（DragonBones格式）URL */
    private String skeletonDragonbonesUrl;

    /** 各部件URL的JSON映射（存为文本） */
    private String partsJson;

    /** 开始处理时间 */
    private LocalDateTime startedAt;

    /** 完成时间 */
    private LocalDateTime completedAt;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 最后更新时间 */
    private LocalDateTime updatedAt;

    // ============ 训练数据飞轮字段（V4新增） ============

    /**
     * 用户评分 1-5，NULL=未评价
     * 评分 >= 4 的任务会被纳入训练集和 RAG 索引
     */
    private Integer userRating;

    /**
     * 用户文字反馈（可选）
     * 低分 + 有反馈的任务进入负样本池，用于 DPO 微调
     */
    private String userFeedback;

    /**
     * 是否已纳入训练集（0=否，1=是）
     * 由定期批处理脚本根据评分自动设置
     */
    private Integer isTrainingSample;

    /**
     * 生成随机种子（用于相同参数复现生成结果）
     */
    private Long generationSeed;

    /**
     * 全流水线总耗时（毫秒）
     * 从 PROCESSING 开始到 SUCCESS/FAILED 结束的时间
     */
    private Long totalDurationMs;

    /**
     * 各步骤实际使用的模型版本快照（JSON 格式）
     * 例如：{"flux":"flux.1-dev","sam2":"sam2_hiera_large","openpose":"openpose_18"}
     */
    private String modelVersions;
}

