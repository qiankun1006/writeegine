package com.example.writemyself.service;

import java.util.List;

/**
 * 图像生成服务接口
 * 统一不同AI模型服务的接口规范
 */
public interface ImageGenerationService {

    /**
     * 生成图片
     * @param prompt 提示词
     * @param width 图片宽度
     * @param height 图片高度
     * @param count 生成数量
     * @param seed 种子值
     * @return 生成的图片URL列表
     */
    List<String> generateImage(String prompt, Integer width, Integer height,
                              Integer count, Long seed);
}

