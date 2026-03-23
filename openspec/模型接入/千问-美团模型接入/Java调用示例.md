# 千问-美团模型 Java 调用示例

## 概述

本文档提供千问-美团模型的实际 Java 调用示例，包括文生图和图生图功能。

## 前置条件

1. 已获取千问-美团模型 API Key
2. 已在配置文件中填写 API Key
3. 项目已启动

## 配置

### 开发环境配置

编辑 `src/main/resources/application-dev.properties`:

```properties
# 千问-美团配置
meituan.qwen.api.key=your-api-key-here
meituan.qwen.api.url=https://aigc.sankuai.com/v1/openai/native/chat/completions
meituan.qwen.default.model=Qwen-Image-Meituan
```

### 生产环境配置

编辑 `src/main/resources/application-prod.properties`:

```properties
# 千问-美团配置
meituan.qwen.api.key=your-production-api-key
meituan.qwen.api.url=https://aigc.sankuai.com/v1/openai/native/chat/completions
meituan.qwen.default.model=Qwen-Image-Meituan
```

## Java 调用示例

### 1. 文生图 (Text to Image)

```java
import com.example.writemyself.service.MeituanQwenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QwenImageGenerationExample {

    @Autowired
    private MeituanQwenService meituanQwenService;

    public void generateImage() {
        try {
            // 生成图片参数
            String prompt = "2D日式动漫风格，骑士角色的躯干部件（含银色盔甲、红白色披风上半部分），无头部/四肢，纯白背景，透明通道，高细节还原盔甲纹理和金属质感，适配2D骨骼动画拆分，PNG格式，保持原有配色和画风";
            Integer width = 1024;
            Integer height = 1024;
            Integer count = 1;
            Long seed = 42L;

            // 调用千问-美团生成图片
            List<String> imageUrls = meituanQwenService.generateImage(
                prompt, width, height, count, seed
            );

            // 处理生成的图片URL
            System.out.println("生成完成！图片URL:");
            for (String imageUrl : imageUrls) {
                System.out.println("  - " + imageUrl);
            }

        } catch (Exception e) {
            System.err.println("生成失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
```

### 2. 图生图 (Image to Image)

```java
import com.example.writemyself.service.MeituanQwenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QwenImageEditExample {

    @Autowired
    private MeituanQwenService meituanQwenService;

    public void editImage() {
        try {
            // 图生图参数
            String prompt = "把墙的颜色改成紫色，背景加上闪光灯效果";
            String referenceImageUrl = "http://p1.meituan.net/bizhorus/17f35cc5a1ab81cecd5b5e443624088b416914.png";
            Double strength = 0.7; // 参考图片影响强度 (0-1)
            Integer width = 1024;
            Integer height = 1024;

            // 调用千问-美团进行图生图
            List<String> imageUrls = meituanQwenService.generateFromImage(
                prompt, referenceImageUrl, strength, width, height
            );

            // 处理生成的图片URL
            System.out.println("图生图完成！图片URL:");
            for (String imageUrl : imageUrls) {
                System.out.println("  - " + imageUrl);
            }

        } catch (Exception e) {
            System.err.println("图生图失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
```

### 3. 使用工厂模式动态选择模型

```java
import com.example.writemyself.service.AIModelServiceFactory;
import com.example.writemyself.service.ImageGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModelSelectionExample {

    @Autowired
    private AIModelServiceFactory modelServiceFactory;

    public void generateWithSpecificModel() {
        try {
            // 选择千问-美团模型
            String modelName = "Qwen-Image-Meituan";
            ImageGenerationService service = modelServiceFactory.getService(modelName);

            // 检查服务是否可用
            if (!service.isConfigured()) {
                System.err.println("千问-美团服务未配置，请检查API密钥");
                return;
            }

            // 生成图片
            String prompt = "一个年轻女性角色，长棕发，穿着蓝色和服，精致的脸部特征，大眼睛，微笑表情，动漫风格，高清，8K";
            List<String> imageUrls = service.generateImage(prompt, 1024, 1024, 1, null);

            System.out.println("使用模型 " + service.getModel() + " 生成完成！");
            for (String imageUrl : imageUrls) {
                System.out.println("  - " + imageUrl);
            }

        } catch (Exception e) {
            System.err.println("生成失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
```

### 4. 完整的生成流程示例

```java
import com.example.writemyself.service.MeituanQwenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Scanner;

@Service
public class CompleteQwenExample {

    @Autowired
    private MeituanQwenService meituanQwenService;

    public void interactiveGeneration() {
        Scanner scanner = new Scanner(System.in);

        System.out.println("=== 千问-美团模型交互生成示例 ===");

        // 检查服务配置
        if (!meituanQwenService.isConfigured()) {
            System.err.println("错误: 千问-美团服务未配置，请检查API密钥");
            return;
        }

        System.out.println("当前使用模型: " + meituanQwenService.getModel());

        while (true) {
            System.out.println("\n请选择功能:");
            System.out.println("1. 文生图");
            System.out.println("2. 图生图");
            System.out.println("3. 退出");
            System.out.print("请输入选择 (1-3): ");

            String choice = scanner.nextLine();

            switch (choice) {
                case "1":
                    textToImageGeneration(scanner);
                    break;
                case "2":
                    imageToImageGeneration(scanner);
                    break;
                case "3":
                    System.out.println("感谢使用，再见！");
                    return;
                default:
                    System.out.println("无效选择，请重新输入");
            }
        }
    }

    private void textToImageGeneration(Scanner scanner) {
        try {
            System.out.print("请输入提示词: ");
            String prompt = scanner.nextLine();

            System.out.print("请输入宽度 (默认1024): ");
            String widthStr = scanner.nextLine();
            Integer width = widthStr.isEmpty() ? 1024 : Integer.parseInt(widthStr);

            System.out.print("请输入高度 (默认1024): ");
            String heightStr = scanner.nextLine();
            Integer height = heightStr.isEmpty() ? 1024 : Integer.parseInt(heightStr);

            System.out.print("请输入生成数量 (默认1): ");
            String countStr = scanner.nextLine();
            Integer count = countStr.isEmpty() ? 1 : Integer.parseInt(countStr);

            // 生成图片
            List<String> imageUrls = meituanQwenService.generateImage(
                prompt, width, height, count, null
            );

            System.out.println("\n生成完成！图片URL:");
            for (String imageUrl : imageUrls) {
                System.out.println("  - " + imageUrl);
            }

        } catch (Exception e) {
            System.err.println("生成失败: " + e.getMessage());
        }
    }

    private void imageToImageGeneration(Scanner scanner) {
        try {
            System.out.print("请输入提示词: ");
            String prompt = scanner.nextLine();

            System.out.print("请输入参考图片URL: ");
            String referenceImageUrl = scanner.nextLine();

            System.out.print("请输入参考强度 (0-1, 默认0.7): ");
            String strengthStr = scanner.nextLine();
            Double strength = strengthStr.isEmpty() ? 0.7 : Double.parseDouble(strengthStr);

            // 图生图
            List<String> imageUrls = meituanQwenService.generateFromImage(
                prompt, referenceImageUrl, strength, 1024, 1024
            );

            System.out.println("\n图生图完成！图片URL:");
            for (String imageUrl : imageUrls) {
                System.out.println("  - " + imageUrl);
            }

        } catch (Exception e) {
            System.err.println("图生图失败: " + e.getMessage());
        }
    }
}
```

## 错误处理

### 常见错误码

| 错误码 | 含义 | 解决方案 |
|-------|------|----------|
| 400 | 请求参数错误 | 检查提示词、尺寸等参数 |
| 401 | API Key 无效 | 检查 API Key 是否正确配置 |
| 429 | 请求过于频繁 | 实施限流、等待后重试 |
| 500 | 服务内部错误 | 检查日志，联系美团支持 |
| 503 | 服务不可用 | 等待服务恢复 |

### 异常处理示例

```java
try {
    List<String> imageUrls = meituanQwenService.generateImage(prompt, width, height, count, seed);
    // 处理成功结果
} catch (RuntimeException e) {
    // 处理运行时异常
    System.err.println("生成失败: " + e.getMessage());

    // 记录详细日志
    log.error("千问-美团生成失败", e);

    // 重试逻辑
    if (shouldRetry(e)) {
        // 实现重试逻辑
        retryGeneration(prompt, width, height, count, seed);
    }
}

private boolean shouldRetry(Exception e) {
    // 根据异常类型决定是否重试
    String message = e.getMessage();
    return message.contains("429") || message.contains("503") || message.contains("timeout");
}
```

## 性能优化建议

### 1. 异步处理

```java
@Async
public void asyncGeneration(String prompt, Integer width, Integer height) {
    try {
        List<String> imageUrls = meituanQwenService.generateImage(prompt, width, height, 1, null);
        // 处理结果
    } catch (Exception e) {
        // 处理异常
    }
}
```

### 2. 缓存策略

```java
// 对相同提示词的生成结果进行缓存
@Cacheable(value = "qwenImages", key = "#prompt + '_' + #width + 'x' + #height")
public List<String> cachedGeneration(String prompt, Integer width, Integer height) {
    return meituanQwenService.generateImage(prompt, width, height, 1, null);
}
```

### 3. 批量处理

```java
public List<String> batchGeneration(List<String> prompts) {
    List<String> allImageUrls = new ArrayList<>();

    for (String prompt : prompts) {
        try {
            List<String> imageUrls = meituanQwenService.generateImage(prompt, 1024, 1024, 1, null);
            allImageUrls.addAll(imageUrls);

            // 添加延迟避免请求过于频繁
            Thread.sleep(1000);
        } catch (Exception e) {
            log.error("批量生成中单个任务失败: {}", prompt, e);
        }
    }

    return allImageUrls;
}
```

## 支持的模型

| 模型 | ID | 功能 | 推荐场景 |
|------|----|------|----------|
| **千问图像生成** | `Qwen-Image-Meituan` | 文生图 | 角色设计、场景生成 |
| **千问图像编辑** | `Qwen-Image-Edit-Meituan` | 图生图 | 图片修改、风格转换 |

## 常用参数

```json
{
  "prompt": "生成的描述（必需）",
  "model": "Qwen-Image-Meituan",
  "num_inference_steps": 50,
  "aspect_ratio": "1024:1024",
  "guidance_scale": 4.0,
  "seed": 42
}

