package com.example.writemyself.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 骨骼素材生成响应 DTO
 *
 * 包含骨骼素材生成任务的完整结果，
 * 包括完整人体图和各分离的肢体部件。
 *
 * @author AI Portrait Generator
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkeletonGenerationResponse {

    /**
     * 任务 ID
     *
     * 用于查询生成结果的唯一标识。
     * 格式：skeleton_时间戳
     */
    private String taskId;

    /**
     * 生成状态
     *
     * 支持的值：
     * - PENDING: 任务已提交，等待处理
     * - PROCESSING: 正在生成中
     * - SUCCESS: 生成成功
     * - FAILED: 生成失败
     */
    private String status;

    /**
     * 生成进度
     *
     * 0-100 的整数，表示当前生成进度。
     * 仅在 PROCESSING 状态下有意义。
     */
    private Integer progress;

    /**
     * 进度描述
     *
     * 当前阶段的文字描述。
     * 例如："正在生成全身图...", "分割肢体中..."
     */
    private String progressMessage;

    /**
     * 完整人体图 URL
     *
     * 生成的整体图像，包含所有部件的完整图。
     */
    private String fullImageUrl;

    /**
     * 分离的肢体部件
     *
     * 包含各肢体部位的 Base64 或 URL。
     * 键值：head (头部), torso (躯干),
     *       leftArm (左臂), rightArm (右臂),
     *       leftLeg (左腿), rightLeg (右腿)
     */
    private Map<String, String> parts;

    /**
     * 骨骼绑定数据 URL（通用格式）
     *
     * 包含骨骼结构、层级关系、动画参数等信息的 JSON 文件。
     * 可用于游戏引擎或动画工具导入。
     */
    private String skeletonDataUrl;

    /**
     * 多种格式的骨骼数据 URL
     *
     * 包含不同动画工具格式的骨骼数据文件：
     * - generic: 通用 JSON 格式
     * - spine: Spine 动画工具格式
     * - dragonbones: DragonBones 动画工具格式
     */
    private Map<String, String> skeletonDataUrls;

    /**
     * 错误信息
     *
     * 仅在 FAILED 状态下存在，描述失败原因。
     */
    private String errorMessage;

    /**
     * 生成时间
     *
     * ISO 8601 格式的时间戳。
     */
    private String generatedAt;
}

