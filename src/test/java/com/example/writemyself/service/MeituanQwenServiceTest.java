package com.example.writemyself.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class MeituanQwenServiceTest {

    @Autowired
    private MeituanQwenService meituanQwenService;

    @Autowired
    private AIModelServiceFactory modelServiceFactory;

    @Test
    public void testServiceConfiguration() {
        // 测试服务是否正确注入
        assertNotNull(meituanQwenService);

        // 测试服务配置状态（应该返回false，因为API Key未配置）
        assertFalse(meituanQwenService.isConfigured());

        // 测试获取当前模型
        String model = meituanQwenService.getModel();
        assertEquals("Qwen-Image-Meituan", model);

        System.out.println("✓ 千问-美团服务配置测试通过");
        System.out.println("当前模型: " + model);
        System.out.println("服务配置状态: " + meituanQwenService.isConfigured());
    }

    @Test
    public void testModelFactory() {
        // 测试工厂是否正确识别千问-美团模型
        ImageGenerationService service1 = modelServiceFactory.getService("Qwen-Image-Meituan");
        assertTrue(service1 instanceof MeituanQwenService);

        ImageGenerationService service2 = modelServiceFactory.getService("Qwen-Image-Edit-Meituan");
        assertTrue(service2 instanceof MeituanQwenService);

        ImageGenerationService service3 = modelServiceFactory.getService("qwen-something");
        assertTrue(service3 instanceof MeituanQwenService);

        System.out.println("✓ 模型工厂测试通过");
        System.out.println("千问-美团模型正确集成到工厂中");
    }

    @Test
    public void testModelAvailability() {
        // 测试模型可用性检查
        boolean isAvailable = modelServiceFactory.isModelAvailable("Qwen-Image-Meituan");
        assertFalse(isAvailable, "千问-美团模型应该不可用（API Key未配置）");

        System.out.println("✓ 模型可用性测试通过");
        System.out.println("模型可用性: " + isAvailable + " (预期为false，因为API Key未配置)");
    }
}

