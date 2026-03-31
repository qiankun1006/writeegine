package com.example.writemyself.service;

import java.util.List;
import java.util.Map;

/**
 * 图像生成服务接口
 */
public interface ImageGenerationService {

    /**
     * 使用文本生成图片
     * @param prompt 提示词
     * @param width 图片宽度
     * @param height 图片高度
     * @param count 生成数量
     * @param seed 种子值
     * @return 生成的图片URL列表
     */
    List<String> generateImage(String prompt, Integer width, Integer height, Integer count, Long seed);

    /**
     * 使用参考图片生成图片（图生图）
     * @param prompt 提示词
     * @param referenceImageUrl 参考图片URL
     * @param strength 参考图片影响强度 (0-1)
     * @param width 输出图片宽度
     * @param height 输出图片高度
     * @return 生成的图片URL列表
     */
    List<String> generateFromImage(String prompt, String referenceImageUrl, Double strength, Integer width, Integer height);

    /**
     * 检查服务是否已配置
     */
    boolean isConfigured();

    /**
     * 获取当前使用的模型
     */
    String getModel();

    /**
     * 使用文本生成图片并返回 Base64
     * @param prompt 提示词
     * @param negativePrompt 负面提示词
     * @param referenceImageBase64 参考图片 Base64
     * @param width 图片宽度
     * @param height 图片高度
     * @param style 风格预设
     * @return 生成的图片 Base64 编码
     */
    String generateImageBase64(String prompt, String negativePrompt, String referenceImageBase64,
                               Integer width, Integer height, String style);

    /**
     * 使用 ControlNet 约束生成图片
     * @param prompt 提示词
     * @param negativePrompt 负面提示词
     * @param controlImageBase64 ControlNet 控制图片 Base64
     * @param controlNetParams ControlNet 参数（control_weight, control_mode 等）
     * @param width 图片宽度
     * @param height 图片高度
     * @param style 风格预设
     * @return 生成的图片 Base64 编码
     */
    String generateImageWithControlNet(String prompt, String negativePrompt, String controlImageBase64,
                                      Map<String, Object> controlNetParams, Integer width, Integer height, String style);

    /**
     * 使用 Flux.1-dev 模型生成高清图片
     * @param prompt 提示词
     * @param negativePrompt 负面提示词
     * @param referenceImageBase64 参考图片 Base64（可选）
     * @param fluxParams Flux 模型参数
     * @param width 图片宽度
     * @param height 图片高度
     * @param style 风格预设
     * @return 生成的图片 Base64 编码
     */
    String generateImageWithFlux(String prompt, String negativePrompt, String referenceImageBase64,
                                 Map<String, Object> fluxParams, Integer width, Integer height, String style);

    /**
     * 提取 IP-Adapter 特征
     * @param referenceImageBase64 参考图片 Base64
     * @return 特征标识或特征数据
     */
    String extractIPAdapterFeatures(String referenceImageBase64);
}

