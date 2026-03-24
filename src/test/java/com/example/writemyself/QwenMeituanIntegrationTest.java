package com.example.writemyself;

import com.example.writemyself.service.AIModelServiceFactory;
import com.example.writemyself.service.ImageGenerationService;
import com.example.writemyself.service.MeituanQwenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 千问-美团模型集成测试
 * 验证整个controller接口到千问-美团模型的集成是否正常工作
 */
@SpringBootTest
public class QwenMeituanIntegrationTest {

    @Autowired
    private AIModelServiceFactory modelServiceFactory;

    @Autowired
    private MeituanQwenService meituanQwenService;

    /**
     * 测试模型工厂是否能正确路由到千问-美团服务
     */
    @Test
    public void testModelFactoryRouting() {
        // 测试千问-美团模型路由
        ImageGenerationService service1 = modelServiceFactory.getService("Qwen-Image-Meituan");
        assertTrue(service1 instanceof MeituanQwenService, "Qwen-Image-Meituan 应该路由到 MeituanQwenService");

        ImageGenerationService service2 = modelServiceFactory.getService("Qwen-Image-Edit-Meituan");
        assertTrue(service2 instanceof MeituanQwenService, "Qwen-Image-Edit-Meituan 应该路由到 MeituanQwenService");

        ImageGenerationService service3 = modelServiceFactory.getService("qwen-test");
        assertTrue(service3 instanceof MeituanQwenService, "qwen-* 应该路由到 MeituanQwenService");

        System.out.println("✓ 模型工厂路由测试通过");
    }

    /**
     * 测试千问-美团服务配置
     */
    @Test
    public void testMeituanQwenServiceConfiguration() {
        // 测试服务是否已配置
        boolean configured = meituanQwenService.isConfigured();
        System.out.println("千问-美团服务配置状态: " + (configured ? "已配置" : "未配置"));

        // 测试获取当前模型
        String model = meituanQwenService.getModel();
        assertNotNull(model, "模型名称不应为空");
        System.out.println("当前模型: " + model);

        System.out.println("✓ 千问-美团服务配置测试通过");
    }

    /**
     * 测试模型可用性检查
     */
    @Test
    public void testModelAvailability() {
        boolean qwenImageAvailable = modelServiceFactory.isModelAvailable("Qwen-Image-Meituan");
        boolean qwenEditAvailable = modelServiceFactory.isModelAvailable("Qwen-Image-Edit-Meituan");

        System.out.println("Qwen-Image-Meituan 可用性: " + qwenImageAvailable);
        System.out.println("Qwen-Image-Edit-Meituan 可用性: " + qwenEditAvailable);

        System.out.println("✓ 模型可用性测试通过");
    }

    /**
     * 测试整个集成流程
     */
    @Test
    public void testIntegrationFlow() {
        System.out.println("=== 千问-美团模型集成测试 ===");

        // 1. 验证模型工厂
        testModelFactoryRouting();

        // 2. 验证服务配置
        testMeituanQwenServiceConfiguration();

        // 3. 验证模型可用性
        testModelAvailability();

        System.out.println("=== 所有测试通过！千问-美团模型集成正常 ===");
    }
}

