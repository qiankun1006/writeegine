package com.example.writemyself.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Flux 图像生成请求模型
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FluxImageRequest {

    // 基本参数
    private String prompt;
    private String negativePrompt;
    private Integer width;
    private Integer height;

    @Builder.Default
    private Integer numInferenceSteps = 30;

    @Builder.Default
    private Double guidanceScale = 7.5;

    private Long seed;

    // 模型参数
    private String model;

    @Builder.Default
    private String scheduler = "DPM++ 2M Karras";

    @Builder.Default
    private String outputFormat = "png";

    // 高级参数
    @Builder.Default
    private Integer maxSequenceLength = 512;

    @Builder.Default
    private Integer clipSkip = 2;

    private Double eta;

    @Builder.Default
    private Integer numImages = 1;

    // 控制网络
    private Map<String, Object> controlNetConfig;

    // IP-Adapter 特征
    private String ipAdapterFeatures;

    // LoRA 配置
    private List<Map<String, Object>> loraList;

    // 参考图配置
    private Map<String, Object> referenceConfig;

    // 采样参数
    private String samplerName;

    @Builder.Default
    private Double strength = 0.75;

    @Builder.Default
    private Integer batchSize = 1;

    // 图像参数
    @Builder.Default
    private Double cfgScale = 7.5;

    @Builder.Default
    private Boolean restoreFaces = false;

    @Builder.Default
    private Boolean enableHr = false;

    @Builder.Default
    private Double denoisingStrength = 0.5;

    // 其他配置
    private Map<String, Object> additionalConfig;
}

