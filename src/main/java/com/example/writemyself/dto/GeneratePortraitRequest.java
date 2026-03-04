package com.example.writemyself.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.*;
import java.math.BigDecimal;

/**
 * 生成立绘请求 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeneratePortraitRequest {

    /**
     * 正提示词 - 必填
     */
    @NotBlank(message = "提示词不能为空")
    @Size(min = 1, max = 5000, message = "提示词长度需要在 1-5000 字之间")
    private String prompt;

    /**
     * 负提示词 - 可选
     */
    @Size(max = 5000, message = "负提示词长度不能超过 5000 字")
    private String negativePrompt;

    /**
     * 参考图片 URL - 可选
     */
    @Size(max = 255, message = "参考图片 URL 长度不能超过 255 字")
    private String referenceImageUrl;

    /**
     * 宽度 - 默认 1024
     */
    @Min(value = 256, message = "宽度最小值为 256 像素")
    @Max(value = 2048, message = "宽度最大值为 2048 像素")
    @Builder.Default
    private Integer width = 1024;

    /**
     * 高度 - 默认 1024
     */
    @Min(value = 256, message = "高度最小值为 256 像素")
    @Max(value = 2048, message = "高度最大值为 2048 像素")
    @Builder.Default
    private Integer height = 1024;

    /**
     * 生成数量 - 默认 1，最多 4
     */
    @Min(value = 1, message = "生成数量最少为 1")
    @Max(value = 4, message = "生成数量最多为 4")
    @Builder.Default
    private Integer count = 1;

    /**
     * 风格预设 - 可选
     */
    @Size(max = 50, message = "风格预设长度不能超过 50 字")
    private String stylePreset;

    /**
     * 推理步数 - 默认 30
     */
    @Min(value = 10, message = "推理步数最少为 10")
    @Max(value = 100, message = "推理步数最多为 100")
    @Builder.Default
    private Integer inferenceSteps = 30;

    /**
     * 采样器 - 可选
     */
    @Size(max = 50, message = "采样器长度不能超过 50 字")
    private String samplerName;

    /**
     * 种子值 - 可选，-1 表示随机
     */
    @Min(value = -1, message = "种子值最小为 -1")
    @Builder.Default
    private Long seed = -1L;

    /**
     * 图生图强度 - 可选，范围 0-1
     */
    @DecimalMin(value = "0.0", message = "图生图强度最小值为 0")
    @DecimalMax(value = "1.0", message = "图生图强度最大值为 1")
    private BigDecimal imageStrength;

    /**
     * 模型权重 - 可选，范围 0-1
     */
    @DecimalMin(value = "0.0", message = "模型权重最小值为 0")
    @DecimalMax(value = "1.0", message = "模型权重最大值为 1")
    private BigDecimal modelWeight;

    /**
     * 是否启用面部修复 - 默认 true
     */
    @Builder.Default
    private Boolean enableFaceFix = true;

    /**
     * 输出格式 - 默认 PNG
     */
    @Size(max = 10, message = "输出格式长度不能超过 10 字")
    @Builder.Default
    private String outputFormat = "PNG";

    /**
     * 模型提供商 - 默认 aliyun
     */
    @Size(max = 50, message = "模型提供商长度不能超过 50 字")
    @Builder.Default
    private String provider = "aliyun";

    /**
     * 模型版本 - 可选
     */
    @Size(max = 100, message = "模型版本长度不能超过 100 字")
    private String modelVersion;
}

