package com.example.writemyself.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 火山引擎服务健康检查指示器
 * 提供简单的健康状态检查
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class VolcengineHealthIndicator {

    private final VolcengineService volcengineService;

    /**
     * 检查火山引擎服务健康状态
     * @return true表示服务正常，false表示服务异常
     */
    public boolean checkHealth() {
        try {
            // 检查服务是否已初始化
            volcengineService.initialize();

            // 检查API密钥是否配置
            java.lang.reflect.Field apiKeyField = volcengineService.getClass().getDeclaredField("apiKey");
            apiKeyField.setAccessible(true);
            String apiKey = (String) apiKeyField.get(volcengineService);

            if (apiKey == null || apiKey.isEmpty() || "${volcengine.ark.api.key:}".equals(apiKey)) {
                log.warn("火山引擎API密钥未配置");
                return false;
            }

            log.info("✓ 火山引擎服务健康检查通过");
            return true;

        } catch (Exception e) {
            log.error("火山引擎服务健康检查失败", e);
            return false;
        }
    }

    /**
     * 获取服务状态描述
     */
    public String getStatusDescription() {
        try {
            java.lang.reflect.Field modelField = volcengineService.getClass().getDeclaredField("defaultModel");
            modelField.setAccessible(true);
            String model = (String) modelField.get(volcengineService);
            return "火山引擎服务已就绪，当前模型: " + model;
        } catch (Exception e) {
            return "火山引擎服务状态未知";
        }
    }
}

