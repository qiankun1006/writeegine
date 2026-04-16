package com.example.writemyself.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

/**
 * 骨骼素材生成请求 DTO
 *
 * 用于生成可拆分肢体部件的骨骼素材。
 * 支持多种风格、骨骼模板和参考图控制。
 *
 * @author AI Portrait Generator
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkeletonGenerationRequest {

    // ============ 核心参数 ============

    /**
     * 流水线模式 - 可选（默认 FROM_SCRATCH）
     *
     * 决定走哪条骨骼生成路径：
     * - FROM_REFERENCE: 参考图转骨骼 —— 输入已有设计稿，先做图层分解（see-through），
     *                   再每层去背 + 骨骼绑定。不重新生成图片，保留原稿所有细节。
     *                   必须提供 referenceImageBase64。
     * - FROM_SCRATCH:   从零生成骨骼 —— 根据 prompt 用 Flux.1-dev 全新生成角色图，
     *                   再做图层分解 + 骨骼绑定。
     *
     * 默认为 FROM_SCRATCH，与原有行为兼容。
     */
    @Pattern(regexp = "^(FROM_REFERENCE|FROM_SCRATCH)$",
            message = "mode 只支持: FROM_REFERENCE, FROM_SCRATCH")
    private String mode = "FROM_SCRATCH";

    /**
     * 正面提示词
     *
     * FROM_SCRATCH 模式必填；FROM_REFERENCE 模式可选（用于图层分解时的语义引导）。
     * 例如：一个年轻的女性角色，穿着古装，五官精致，皮肤光滑
     */
    @Size(min = 1, max = 500, message = "正面提示词长度需要在 1-500 字之间")
    private String prompt;

    /**
     * 负面提示词 - 可选
     *
     * 用于告知 AI 模型要避免的元素和特征。
     * 默认值：低质量, 模糊, 多手指, 水印, 变形, 低分辨率, 畸形
     */
    @Size(max = 500, message = "负面提示词长度不能超过 500 字")
    private String negativePrompt;

    /**
     * 参考图片 Base64 编码 - 可选（兼容旧调用方）
     *
     * 用户上传的参考图片，用于保持人物一致性。
     * 格式：data:image/png;base64,iVBORw0KGgo...
     *
     * 推荐使用 referenceImageUrl 替代此字段：
     * 前端先调用 POST /api/upload/image 上传图片，拿到 URL 后填入 referenceImageUrl。
     * 两个字段均存在时，referenceImageUrl 优先。
     */
    @Pattern(regexp = "^(data:image/(png|jpeg|jpg|webp);base64,)?[A-Za-z0-9+/=]*$",
            message = "参考图片格式不正确，需要为 Base64 编码")
    private String referenceImageBase64;

    /**
     * 参考图片 HTTP URL - 可选（推荐方式）
     *
     * 前端先调用 POST /api/upload/image 上传图片，获取返回的 url 字段值后填入此处。
     * 例如：/uploads/2026/04/15/a3f1c2d4_reference.png
     *
     * 待接入正式对象存储桶后，此处填入桶 URL（如 https://xxx.oss.com/...）即可，
     * 无需修改 DTO 结构。
     *
     * 两个字段均存在时，referenceImageUrl 优先于 referenceImageBase64。
     */
    @Size(max = 1024, message = "参考图片 URL 长度不能超过 1024 字符")
    private String referenceImageUrl;

    // ============ 骨骼素材专用参数 ============

    /**
     * 生成风格 - 必填
     *
     * 选择生成骨骼素材的艺术风格。
     * 不同风格会使用不同的 LoRA 模型。
     * 支持的值：anime (日系二次元), realistic (写实人体),
     *           chibi (Q版卡通), cartoon (美式卡通), pixel (像素风)
     */
    @NotBlank(message = "生成风格不能为空")
    @Pattern(regexp = "^(anime|realistic|chibi|cartoon|pixel)$",
            message = "生成风格只支持: anime, realistic, chibi, cartoon, pixel")
    private String style;

    /**
     * 骨骼模板 - 必填
     *
     * 选择骨骼的结构模板。
     * 支持的值：standard (人体标准骨骼), animation (动画骨骼)
     * - standard: 符合真实人体比例
     * - animation: 适合动画制作的比例（手脚偏大）
     */
    @NotBlank(message = "骨骼模板不能为空")
    @Pattern(regexp = "^(standard|animation)$",
            message = "骨骼模板只支持: standard, animation")
    private String template;

    /**
     * OpenPose 关键点模板类型 - 可选（默认 openpose_18）
     *
     * 决定骨骼关键点的数量和精度：
     * - openpose_18: 18点标准模板，适合基础动画
     * - openpose_25: 25点扩展模板，包含足部细节，适合高级动画
     */
    @Pattern(regexp = "^(openpose_18|openpose_25)$",
            message = "OpenPose模板只支持: openpose_18, openpose_25")
    private String openPoseTemplate = "openpose_18";

    /**
     * 角色姿态 - 必填
     *
     * 选择生成角色的基本姿态。
     * 支持的值：standing (站立), walking (行走), running (奔跑),
     *           attacking (攻击), casting (施法), idle (待机)
     */
    @NotBlank(message = "角色姿态不能为空")
    @Pattern(regexp = "^(standing|walking|running|attacking|casting|idle)$",
            message = "角色姿态只支持: standing, walking, running, attacking, casting, idle")
    private String pose;

    // ============ 图像参数 ============

    /**
     * 生成宽度 - 必填
     *
     * 生成图片的宽度，单位为像素。
     * 推荐值：1024 (骨骼素材建议使用较大尺寸以保留细节)
     */
    @NotNull(message = "生成宽度不能为空")
    private Integer width;

    /**
     * 生成高度 - 必填
     *
     * 生成图片的高度，单位为像素。
     * 推荐值：1024 或 2048
     */
    @NotNull(message = "生成高度不能为空")
    private Integer height;
}

