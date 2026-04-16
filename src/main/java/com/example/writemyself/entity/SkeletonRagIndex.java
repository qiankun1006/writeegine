package com.example.writemyself.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 骨骼生成 RAG 索引实体
 *
 * 对应 skeleton_rag_index 表。
 * 存储高质量历史生成任务的可复用中间产物，供相似请求跳过耗时步骤。
 *
 * 索引写入时机：用户评分 >= 4 时，由 {@code saveFeedback} 方法触发写入。
 * 命中策略：style + pose + template 精确过滤 → prompt 文本相似度排序 → 阈值过滤。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkeletonRagIndex {

    /** 主键 ID */
    private Long id;

    /** 来源任务ID（必须是 SUCCESS 且 userRating >= 4 的任务） */
    private String sourceTaskId;

    // ============ 检索维度 ============

    /** 生成风格：anime/realistic/chibi/cartoon/pixel */
    private String style;

    /** 角色姿态：standing/walking/running/attacking/casting/idle */
    private String pose;

    /** 骨骼模板类型：standard/animation */
    private String templateType;

    /** OpenPose 模板：openpose_18/openpose_25 */
    private String openposeTmpl;

    /**
     * 提示词摘要（截断为 500 字，用于文本相似度计算）
     * FROM_SCRATCH 模式下为用户 prompt；FROM_REFERENCE 模式下为空或短描述
     */
    private String promptSummary;

    // ============ 可复用中间产物 URL ============

    /**
     * 关键点 JSON 文件 URL（供跳过步骤4/OpenPose识别复用）
     */
    private String keypointsJsonUrl;

    /**
     * 骨骼绑定 JSON URL（供跳过步骤5/骨骼绑定复用）
     */
    private String bindingDataUrl;

    /**
     * see-through 分解结果摘要 JSON URL（可选，供跳过步骤1/图层分解参考）
     */
    private String layerDecompUrl;

    // ============ 质量与统计 ============

    /** 来源任务的用户评分（仅收录 >= 4 分） */
    private Integer userRating;

    /** 被复用次数（热度排序依据） */
    private Integer hitCount;

    /** 最后一次被命中的时间 */
    private LocalDateTime lastHitAt;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 最后更新时间 */
    private LocalDateTime updatedAt;
}

