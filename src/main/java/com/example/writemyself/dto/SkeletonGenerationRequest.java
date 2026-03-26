package com.example.writemyself.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.*;

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
     * 正面提示词 - 必填
     *
     * 用户输入的用于描述生成角色的关键词和描述。
     * 例如：一个年轻的女性角色，穿着古装，五官精致，皮肤光滑
     */
    @NotBlank(message = "正面提示词不能为空")
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
     * 参考图片 Base64 编码 - 可选
     *
     * 用户上传的参考图片，用于保持人物一致性。
     * 格式：data:image/png;base64,iVBORw0KGgo...
     */
    @Pattern(regexp = "^(data:image/(png|jpeg|jpg|webp);base64,)?[A-Za-z0-9+/=]*$",
            message = "参考图片格式不正确，需要为 Base64 编码")
    private String referenceImageBase64;

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

