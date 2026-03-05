package com.example.writemyself.service;

import java.util.List;

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
}

