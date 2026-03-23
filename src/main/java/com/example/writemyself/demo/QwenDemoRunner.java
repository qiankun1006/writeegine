package com.example.writemyself.demo;

import com.example.writemyself.service.AIModelServiceFactory;
import com.example.writemyself.service.ImageGenerationService;
import com.example.writemyself.service.MeituanQwenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 千问-美团模型演示运行器
 * 在应用程序启动后自动运行，展示千问-美团模型的功能
 */
@Component
public class QwenDemoRunner implements CommandLineRunner {

    @Autowired
    private MeituanQwenService meituanQwenService;

    @Autowired
    private AIModelServiceFactory modelServiceFactory;

    /**
     * 创建重复字符的字符串（兼容Java 8）
     * @param count 重复次数
     * @param character 要重复的字符
     * @return 重复后的字符串
     */
    private String createSeparator(int count, String character) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < count; i++) {
            sb.append(character);
        }
        return sb.toString();
    }

    @Override
    public void run(String... args) throws Exception {
        String separator = createSeparator(60, "=");
        System.out.println("\n" + separator);
        System.out.println("🚀 千问-美团模型演示开始");
        System.out.println(separator);

        // 1. 服务配置验证
        System.out.println("\n📋 1. 服务配置验证");
        System.out.println(createSeparator(40, "-"));
        boolean configured = meituanQwenService.isConfigured();
        System.out.println("✅ 服务配置状态: " + (configured ? "已配置" : "未配置"));
        System.out.println("✅ 当前模型: " + meituanQwenService.getModel());

        if (!configured) {
            System.out.println("⚠️  服务未配置，请检查API Key设置");
            return;
        }

        // 2. 模型工厂验证
        System.out.println("\n🏭 2. 模型工厂验证");
        System.out.println(createSeparator(40, "-"));
        ImageGenerationService service = modelServiceFactory.getService("Qwen-Image-Meituan");
        boolean isCorrectService = service instanceof MeituanQwenService;
        System.out.println("✅ 模型路由正确: " + isCorrectService);
        System.out.println("✅ 模型可用性: " + modelServiceFactory.isModelAvailable("Qwen-Image-Meituan"));

        // 3. 支持的模型列表
        System.out.println("\n📝 3. 支持的千问模型");
        System.out.println(createSeparator(40, "-"));
        String[] supportedModels = {
            "Qwen-Image-Meituan (文生图)",
            "Qwen-Image-Edit-Meituan (图生图)",
            "qwen-* (通配符匹配)"
        };

        for (String model : supportedModels) {
            ImageGenerationService modelService = modelServiceFactory.getService(model.split(" ")[0]);
            boolean available = modelService instanceof MeituanQwenService;
            System.out.println("✅ " + model + ": " + (available ? "支持" : "不支持"));
        }

        // 4. API调用演示
        System.out.println("\n🔧 4. API调用演示");
        System.out.println(createSeparator(40, "-"));

        try {
            System.out.println("正在调用千问-美团API...");
            String prompt = "一个简单的红色苹果，白色背景，高清图片";

            List<String> imageUrls = meituanQwenService.generateImage(
                prompt, 512, 512, 1, 42L
            );

            System.out.println("✅ API调用成功!");
            System.out.println("📝 提示词: " + prompt);
            System.out.println("📊 返回结果数量: " + imageUrls.size());

            if (!imageUrls.isEmpty()) {
                System.out.println("🖼️  生成的图片URL:");
                for (int i = 0; i < imageUrls.size(); i++) {
                    System.out.println("   " + (i + 1) + ". " + imageUrls.get(i));
                }
            } else {
                System.out.println("⚠️  API返回空结果，可能需要检查API响应格式");
            }

        } catch (Exception e) {
            System.out.println("⚠️  API调用失败: " + e.getMessage());
            System.out.println("可能的原因:");
            System.out.println("  - 网络连接问题");
            System.out.println("  - API响应格式与预期不符");
            System.out.println("  - API限制或配额问题");
            System.out.println("  - 需要根据实际API响应调整代码");
        }

        // 5. 图生图演示
        System.out.println("\n🎨 5. 图生图功能演示");
        System.out.println(createSeparator(40, "-"));

        try {
            System.out.println("正在测试图生图功能...");
            String editPrompt = "把苹果变成金色";
            String referenceUrl = "https://example.com/apple.jpg";

            List<String> editedImages = meituanQwenService.generateFromImage(
                editPrompt, referenceUrl, 0.7, 512, 512
            );

            System.out.println("✅ 图生图API调用成功!");
            System.out.println("📝 编辑提示词: " + editPrompt);
            System.out.println("🖼️  参考图片: " + referenceUrl);
            System.out.println("📊 返回结果数量: " + editedImages.size());

        } catch (Exception e) {
            System.out.println("⚠️  图生图API调用失败: " + e.getMessage());
            System.out.println("可能的原因: 参考图片URL无效或API限制");
        }

        // 6. 总结
        System.out.println("\n" + separator);
        System.out.println("🎉 千问-美团模型演示完成");
        System.out.println(separator);

        System.out.println("\n📚 使用示例:");
        System.out.println("\n// 基础使用");
        System.out.println("@Autowired");
        System.out.println("private MeituanQwenService qwenService;");
        System.out.println("");
        System.out.println("List<String> imageUrls = qwenService.generateImage(");
        System.out.println("    \"一个年轻女性角色，长棕发，穿着蓝色和服\",");
        System.out.println("    1024, 1024, 1, null);");

        System.out.println("\n// 工厂模式");
        System.out.println("@Autowired");
        System.out.println("private AIModelServiceFactory factory;");
        System.out.println("");
        System.out.println("ImageGenerationService service = factory.getService(\"Qwen-Image-Meituan\");");

        System.out.println("\n" + separator);
    }
}

