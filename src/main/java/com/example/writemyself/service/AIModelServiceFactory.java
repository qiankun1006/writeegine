package com.example.writemyself.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * AI模型服务工厂
 * 根据模型类型动态选择对应的服务
 */
@Component
@RequiredArgsConstructor
public class AIModelServiceFactory {

    private final AliyunTongYiService aliyunTongYiService;
    private final VolcengineService volcengineService;

    /**
     * 根据模型名称获取对应的服务
     */
    public ImageGenerationService getService(String modelName) {
        if (modelName == null) {
            return aliyunTongYiService; // 默认使用阿里云
        }

        // 火山引擎模型
        if (modelName.startsWith("doubao-")) {
            return volcengineService;
        }

        // 阿里云通义模型
        if (modelName.startsWith("wanx-") || modelName.startsWith("tongyi-")) {
            return aliyunTongYiService;
        }

        // 默认回退到阿里云
        return aliyunTongYiService;
    }
}

