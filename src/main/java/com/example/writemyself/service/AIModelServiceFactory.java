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
    private final MeituanQwenService meituanQwenService;

    /**
     * 根据模型名称获取对应的服务
     */
    public ImageGenerationService getService(String modelName) {
        if (modelName == null) {
            return volcengineService; // 默认使用火山引擎
        }

        // 火山引擎模型
        if (modelName.startsWith("doubao-")) {
            return volcengineService;
        }

        // 阿里云通义模型
        if (modelName.startsWith("wanx-") || modelName.startsWith("tongyi-")) {
            return aliyunTongYiService;
        }

        // 美团千问模型
        if (modelName.startsWith("Qwen-Image-") || modelName.startsWith("qwen-")) {
            return meituanQwenService;
        }

        // 默认回退到火山引擎
        return volcengineService;
    }

    /**
     * 获取默认服务（火山引擎）
     */
    public ImageGenerationService getDefaultService() {
        return volcengineService;
    }

    /**
     * 检查指定模型是否可用
     */
    public boolean isModelAvailable(String modelName) {
        ImageGenerationService service = getService(modelName);
        return service.isConfigured();
    }
}

