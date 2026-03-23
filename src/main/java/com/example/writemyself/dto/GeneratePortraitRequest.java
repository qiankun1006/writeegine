package com.example.writemyself.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.*;
import java.math.BigDecimal;

/**
 * AI 人物立绘生成请求 DTO
 *
 * 前端 Vue Store 中的参数映射到后端的数据传输对象。
 * 包含所有用户在生成界面中配置的参数。
 *
 * @author AI Portrait Generator
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratePortraitRequest {

    // ============ 核心参数 ============

    /**
     * 正面提示词 - 必填
     *
     * 用户输入的用于描述生成角色的关键词和描述。
     * 例如：一个年轻的女性角色，穿着古装，五官精致，皮肤光滑
     *
     * 映射自：portraitStore.params.prompt
     */
    @NotBlank(message = "正面提示词不能为空")
    @Size(min = 1, max = 500, message = "正面提示词长度需要在 1-500 字之间")
    private String prompt;

    /**
     * 负面提示词 - 可选
     *
     * 用于告知 AI 模型要避免的元素和特征。
     * 默认值：低质量, 模糊, 多手指, 水印, 变形, 低分辨率
     *
     * 映射自：portraitStore.params.negativePrompt
     */
    @javax.validation.constraints.Size(max = 500, message = "负面提示词长度不能超过 500 字")
    private String negativePrompt;

    /**
     * 参考图片 Base64 编码 - 可选
     *
     * 用户上传的参考图片，以 Base64 格式编码传输。
     * 格式：data:image/png;base64,iVBORw0KGgo...
     *
     * 映射自：portraitStore.params.referenceImagePreview
     */
    @Pattern(regexp = "^(data:image/(png|jpeg|jpg|webp);base64,)?[A-Za-z0-9+/=]*$",
             message = "参考图片格式不正确，需要为 Base64 编码")
    private String referenceImageBase64;

    /**
     * 模型权重 - 必填
     *
     * 控制模型对输入参数的遵循程度。值越大越严格遵循提示词。
     *
     * 映射自：portraitStore.params.modelWeight
     */
    @NotNull(message = "模型权重不能为空")
    @DecimalMin(value = "0.0", message = "模型权重最小值为 0.0")
    @DecimalMax(value = "1.0", message = "模型权重最大值为 1.0")
    private BigDecimal modelWeight;

    /**
     * 生成宽度 - 必填
     *
     * 生成图片的宽度，单位为像素。
     * 支持的值：256, 512, 1024, 2048
     *
     * 映射自：portraitStore.params.width
     */
    @NotNull(message = "生成宽度不能为空")
    private Integer width;

    /**
     * 生成高度 - 必填
     *
     * 生成图片的高度，单位为像素。
     * 支持的值：256, 512, 1024, 2048
     *
     * 映射自：portraitStore.params.height
     */
    @NotNull(message = "生成高度不能为空")
    private Integer height;

    // ============ 模型选择 ============

    /**
     * 服务提供商 - 必填
     *
     * 选择使用哪个云服务商的文生图 API。
     * 支持的值：aliyun (阿里云), volcengine (火山引擎), meituan (千问-美团)
     *
     * 映射自：portraitStore.params.provider
     */
    @NotBlank(message = "服务提供商不能为空")
    @Pattern(regexp = "^(aliyun|volcengine|meituan)$",
             message = "服务提供商只支持 aliyun, volcengine 或 meituan")
    private String provider;

    /**
     * 模型版本 - 必填
     *
     * 使用的模型版本号。不同版本支持不同的功能和效果。
     * 例如：wanx-v1 (阿里云), flux (火山引擎), Qwen-Image-Meituan (千问-美团)
     *
     * 映射自：portraitStore.params.modelVersion
     */
    @NotBlank(message = "模型版本不能为空")
    @Size(max = 50, message = "模型版本长度不能超过 50 字")
    @Pattern(regexp = "^(wanx-v1|flux|Qwen-Image-Meituan|Qwen-Image-Edit-Meituan|doubao-.*)$",
             message = "模型版本支持: wanx-v1, flux, Qwen-Image-Meituan, Qwen-Image-Edit-Meituan, doubao-* ")
    private String modelVersion;

    // ============ 高级参数 ============

    /**
     * 参考图片强度 - 可选
     *
     * 当上传参考图片时，该参数控制参考图片对生成结果的影响程度。
     * 值的范围 0.0-1.0，值越大，生成结果越接近参考图片。
     * 默认值：0.6
     *
     * 映射自：portraitStore.params.imageStrength
     */
    @DecimalMin(value = "0.0", message = "参考图片强度最小值为 0.0")
    @DecimalMax(value = "1.0", message = "参考图片强度最大值为 1.0")
    @Builder.Default
    private BigDecimal imageStrength = new BigDecimal("0.6");

    /**
     * 生成数量 - 必填
     *
     * 一次生成多少张图片。每张图片都会消耗相应的配额。
     * 支持的值：1-4
     *
     * 映射自：portraitStore.params.generateCount
     */
    @NotNull(message = "生成数量不能为空")
    @Min(value = 1, message = "生成数量最少为 1")
    @Max(value = 4, message = "生成数量最多为 4")
    private java.lang.Integer generateCount;

    /**
     * 采样器名称 - 必填
     *
     * 选择采样算法，影响生成的质量和速度。
     * 支持的值：euler (快速), dpm++ (高质量), autocfg (自动)
     *
     * 映射自：portraitStore.params.sampler
     */
    @NotBlank(message = "采样器不能为空")
    @Pattern(regexp = "^(euler|dpm\\+\\+|autocfg)$",
             message = "采样器只支持 euler, dpm++, autocfg")
    private String sampler;

    /**
     * 迭代步数 - 必填
     *
     * 生成过程中的迭代次数。值越大，生成质量越高，但耗时越长。
     * 支持的范围：10-50
     * 默认值：30
     *
     * 映射自：portraitStore.params.steps
     */
    @NotNull(message = "迭代步数不能为空")
    @Min(value = 10, message = "迭代步数最少为 10")
    @Max(value = 50, message = "迭代步数最多为 50")
    private Integer steps;

    /**
     * 风格预设 - 可选
     *
     * 预设的艺术风格，影响生成结果的整体风格。
     * 例如：none (无), anime (动画), oil_painting (油画)
     *
     * 映射自：portraitStore.params.stylePreset
     */
    @Size(max = 50, message = "风格预设长度不能超过 50 字")
    private String stylePreset;

    /**
     * 随机种子值 - 可选
     *
     * 用于控制随机性。相同的种子值会生成相同的结果。
     * 值为 -1 时表示随机，其他正整数为固定种子。
     *
     * 映射自：portraitStore.params.seed
     */
    @Min(value = -1, message = "随机种子值最小为 -1")
    @Builder.Default
    private java.lang.Integer seed = -1;

    /**
     * 面部增强 - 必填
     *
     * 是否启用面部修复和增强功能，使生成的面部更加清晰细致。
     * 默认值：true
     *
     * 映射自：portraitStore.params.faceEnhance
     */
    @NotNull(message = "面部增强参数不能为空")
    @Builder.Default
    private Boolean faceEnhance = true;

    /**
     * 输出格式 - 必填
     *
     * 生成图片的输出格式。
     * 支持的值：png, jpg
     *
     * 映射自：portraitStore.params.outputFormat
     */
    @NotBlank(message = "输出格式不能为空")
    @Pattern(regexp = "^(png|jpg)$",
             message = "输出格式只支持 png 或 jpg")
    private String outputFormat;
}

