package com.example.writemyself.service;

import com.volcengine.ark.runtime.model.images.generation.GenerateImagesRequest;
import com.volcengine.ark.runtime.model.images.generation.ImagesResponse;
import com.volcengine.ark.runtime.model.images.generation.ResponseFormat;
import com.volcengine.ark.runtime.service.ArkService;
import lombok.extern.slf4j.Slf4j;
import okhttp3.ConnectionPool;
import okhttp3.Dispatcher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PreDestroy;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 字节跳动火山引擎服务
 * 使用 doubao-seedream 系列模型进行图像生成
 */
@Service
@Slf4j
public class VolcengineService implements ImageGenerationService {

    @Value("${volcengine.ark.api.key:}")
    private String apiKey;

    @Value("${volcengine.model:doubao-seedream-5-0-260128}")
    private String defaultModel;

    private ArkService arkService;

    /**
     * 初始化火山引擎服务
     */
    public void initialize() {
        if (arkService == null && apiKey != null && !apiKey.isEmpty()) {
            ConnectionPool connectionPool = new ConnectionPool(5, 1, TimeUnit.SECONDS);
            Dispatcher dispatcher = new Dispatcher();

            arkService = ArkService.builder()
                    .dispatcher(dispatcher)
                    .connectionPool(connectionPool)
                    .apiKey(apiKey)
                    .build();

            log.info("✓ 火山引擎服务初始化完成");
        }
    }

    /**
     * 使用火山引擎生成图片
     * @param prompt 提示词
     * @param width 图片宽度
     * @param height 图片高度
     * @param count 生成数量
     * @param seed 种子值
     * @return 生成的图片URL列表
     */
    @Override
    public List<String> generateImage(String prompt, Integer width, Integer height,
                                     Integer count, Long seed) {
        try {
            log.info("使用火山引擎生成图片: 提示词={}, 尺寸={}x{}, 数量={}, 种子={}",
                    prompt, width, height, count, seed);

            // 确保服务已初始化
            initialize();

            if (arkService == null) {
                throw new IllegalStateException("火山引擎服务未正确配置，请检查API密钥");
            }

            // 构建尺寸字符串
            String size = mapSizeToVolcengineFormat(width, height);

            // 构建生成请求
            GenerateImagesRequest generateRequest = GenerateImagesRequest.builder()
                    .model(defaultModel)
                    .prompt(prompt)
                    .size(size)
                    .sequentialImageGeneration("disabled")
                    .responseFormat(ResponseFormat.Url)
                    .stream(false)
                    .watermark(true)
                    .build();

            // 调用API生成图片
            ImagesResponse imagesResponse = arkService.generateImages(generateRequest);

            // 解析响应结果
            List<String> imageUrls = new ArrayList<>();
            if (imagesResponse.getData() != null) {
                for (int i = 0; i < imagesResponse.getData().size(); i++) {
                    String imageUrl = imagesResponse.getData().get(i).getUrl();
                    if (imageUrl != null) {
                        imageUrls.add(imageUrl);
                    }
                }
            }

            log.info("✓ 火山引擎图片生成成功，共生成 {} 张", imageUrls.size());
            return imageUrls;

        } catch (Exception e) {
            log.error("火山引擎生成图片失败", e);

            // 包装为自定义异常
            if (e instanceof VolcengineException) {
                throw e;
            } else {
                throw new VolcengineException("火山引擎API调用失败: " + e.getMessage(), e,
                                            null, null, 0);
            }
        }
    }

    /**
     * 将尺寸映射为火山引擎支持的格式
     */
    private String mapSizeToVolcengineFormat(Integer width, Integer height) {
        if (width == null || height == null) {
            return "1024*1024";
        }

        // 火山引擎支持的尺寸格式: "1024*1024", "2K", "4K"等
        int totalPixels = width * height;

        if (totalPixels <= 1024 * 1024) {
            return width + "*" + height;
        } else if (totalPixels <= 2048 * 2048) {
            return "2K";
        } else {
            return "4K";
        }
    }

    /**
     * 带重试机制的生成方法
     * @param prompt 提示词
     * @param width 图片宽度
     * @param height 图片高度
     * @param count 生成数量
     * @param seed 种子值
     * @param maxRetries 最大重试次数
     * @return 生成的图片URL列表
     */
    public List<String> generateImageWithRetry(String prompt, Integer width, Integer height,
                                               Integer count, Long seed, int maxRetries) {
        int attempts = 0;
        VolcengineException lastException = null;

        while (attempts <= maxRetries) {
            try {
                return generateImage(prompt, width, height, count, seed);
            } catch (VolcengineException e) {
                attempts++;
                lastException = e;

                log.warn("第 {} 次生成失败: {} (错误码: {})", attempts, e.getMessage(), e.getErrorCode());

                // 检查是否应该重试
                if (!e.isRetryable() || attempts > maxRetries) {
                    break;
                }

                // 指数退避
                try {
                    long sleepTime = (long) Math.pow(2, attempts) * 1000;
                    log.info("等待 {}ms 后进行第 {} 次重试", sleepTime, attempts + 1);
                    Thread.sleep(sleepTime);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new VolcengineException("重试被中断", ie, null, null, 0);
                }
            }
        }

        // 所有重试都失败
        log.error("火山引擎生成失败，已达最大重试次数 {} 次", maxRetries);
        throw lastException != null ? lastException :
               new VolcengineException("生成失败，未知错误");
    }

    /**
     * 关闭服务
     */
    /**
     * 使用火山引擎进行图生图
     * @param prompt 正提示词
     * @param referenceImageUrl 参考图片 URL
     * @param strength 参考图片影响强度 (0-1)
     * @param width 输出图片宽度
     * @param height 输出图片高度
     * @return 生成的图片 URL 列表
     */
    @Override
    public List<String> generateFromImage(String prompt, String referenceImageUrl,
                                         Double strength, Integer width, Integer height) {
        try {
            log.info("使用火山引擎进行图生图: 提示词={}, 参考图={}, 强度={}, 尺寸={}x{}",
                    prompt, referenceImageUrl, strength, width, height);

            // 确保服务已初始化
            initialize();

            if (arkService == null) {
                throw new IllegalStateException("火山引擎服务未正确配置，请检查API密钥");
            }

            // 构建尺寸字符串
            String size = mapSizeToVolcengineFormat(width, height);

            // 构建生成请求（图生图模式）
            GenerateImagesRequest generateRequest = GenerateImagesRequest.builder()
                    .model(defaultModel)
                    .prompt(prompt)
                    .size(size)
                    .sequentialImageGeneration("disabled")
                    .responseFormat(ResponseFormat.Url)
                    .stream(false)
                    .watermark(true)
                    .build();

            // 调用API生成图片
            ImagesResponse imagesResponse = arkService.generateImages(generateRequest);

            // 解析响应结果
            List<String> imageUrls = new ArrayList<>();
            if (imagesResponse.getData() != null) {
                for (int i = 0; i < imagesResponse.getData().size(); i++) {
                    String imageUrl = imagesResponse.getData().get(i).getUrl();
                    if (imageUrl != null) {
                        imageUrls.add(imageUrl);
                    }
                }
            }

            log.info("✓ 火山引擎图生图成功");
            return imageUrls;

        } catch (Exception e) {
            log.error("火山引擎图生图失败", e);
            throw new VolcengineException("图生图失败: " + e.getMessage(), e, null, null, 0);
        }
    }

    /**
     * 检查 API 密钥是否已配置
     */
    @Override
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isEmpty() && !apiKey.equals("${volcengine.ark.api.key:}");
    }

    /**
     * 获取当前使用的模型
     */
    @Override
    public String getModel() {
        return defaultModel;
    }

    /**
     * 使用文本生成图片并返回 Base64
     */
    @Override
    public String generateImageBase64(String prompt, String negativePrompt, String referenceImageBase64,
                                      Integer width, Integer height, String style) {
        try {
            log.info("使用火山引擎生成图片(Base64): 提示词={}, 尺寸={}x{}, 风格={}",
                    prompt, width, height, style);

            // 确保服务已初始化
            initialize();

            if (arkService == null) {
                throw new IllegalStateException("火山引擎服务未正确配置，请检查API密钥");
            }

            // 构建尺寸字符串
            String size = mapSizeToVolcengineFormat(width, height);

            // 构建提示词（包含负面提示词和风格）
            StringBuilder fullPrompt = new StringBuilder(prompt);
            if (negativePrompt != null && !negativePrompt.isEmpty()) {
                fullPrompt.append("\nNegative: ").append(negativePrompt);
            }
            if (style != null && !style.isEmpty() && !"none".equals(style)) {
                fullPrompt.append("\nStyle: ").append(style);
            }

            // 构建生成请求
            GenerateImagesRequest generateRequest = GenerateImagesRequest.builder()
                    .model(defaultModel)
                    .prompt(fullPrompt.toString())
                    .size(size)
                    .sequentialImageGeneration("disabled")
                    .responseFormat(ResponseFormat.Base64)
                    .stream(false)
                    .watermark(true)
                    .build();

            // 调用API生成图片
            ImagesResponse imagesResponse = arkService.generateImages(generateRequest);

            // 解析响应结果并提取 Base64
            if (imagesResponse.getData() != null && !imagesResponse.getData().isEmpty()) {
                String base64 = imagesResponse.getData().get(0).getB64Json();
                log.info("✓ 火山引擎图片生成成功(Base64)");
                return base64;
            }

            log.warn("火山引擎返回数据为空");
            return "";

        } catch (Exception e) {
            log.error("火山引擎生成图片(Base64)失败", e);
            throw new VolcengineException("生成图片失败: " + e.getMessage(), e, null, null, 0);
        }
    }

    @PreDestroy
    public void shutdown() {
        if (arkService != null) {
            arkService.shutdownExecutor();
            log.info("火山引擎服务已关闭");
        }
    }
}

