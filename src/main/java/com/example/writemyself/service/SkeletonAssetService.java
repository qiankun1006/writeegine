package com.example.writemyself.service;

import com.example.writemyself.dto.SkeletonGenerationRequest;
import com.example.writemyself.dto.SkeletonGenerationResponse;
import com.example.writemyself.model.SAMSegmentationResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 骨骼素材生成服务
 *
 * 负责生成可拆分肢体部件的骨骼素材。
 * 主要流程：
 * 1. 生成全身图（调用 AI 模型）
 * 2. 使用 SAM 模型自动分割肢体
 * 3. 返回分离的肢体部件供动画使用
 *
 * @author AI Portrait Generator
 * @version 1.0
 */
@Service
@Slf4j
public class SkeletonAssetService {

    private final ImageGenerationService imageService;
    private final FileStorageService fileStorageService;
    private final SAMService samService;

    public SkeletonAssetService(
            @Qualifier("aliyunTongYiService") ImageGenerationService imageService,
            FileStorageService fileStorageService,
            SAMService samService) {
        this.imageService = imageService;
        this.fileStorageService = fileStorageService;
        this.samService = samService;
    }

    /**
     * 任务结果缓存
     * key: taskId
     * value: 任务响应对象
     */
    private final Map<String, SkeletonGenerationResponse> taskResults = new ConcurrentHashMap<>();

    /**
     * 提交骨骼素材生成任务
     *
     * @param request 生成请求参数
     * @param userId 用户 ID
     * @return 任务 ID
     */
    public String submitGenerationTask(SkeletonGenerationRequest request, String userId) {
        String taskId = "skeleton_" + System.currentTimeMillis();

        log.info("骨骼素材生成请求: userId={}, taskId={}, style={}, template={}, pose={}",
                userId, taskId, request.getStyle(), request.getTemplate(), request.getPose());

        // 初始化任务状态
        SkeletonGenerationResponse response = SkeletonGenerationResponse.builder()
                .taskId(taskId)
                .status("PENDING")
                .progress(0)
                .progressMessage("任务已提交，等待处理...")
                .build();
        taskResults.put(taskId, response);

        // 异步执行生成任务
        processSkeletonGeneration(taskId, request, userId);

        return taskId;
    }

    /**
     * 异步执行骨骼素材生成
     *
     * @param taskId 任务 ID
     * @param request 生成请求
     * @param userId 用户 ID
     */
    @Async("portraitTaskExecutor")
    public void processSkeletonGeneration(String taskId, SkeletonGenerationRequest request, String userId) {
        try {
            // ========== 阶段1: 生成全身图 (0-70%) ==========
            updateProgress(taskId, 10, "正在生成全身图...");

            // 构建全身图提示词
            String fullPrompt = buildFullPrompt(request);
            String negativePrompt = request.getNegativePrompt() != null
                    ? request.getNegativePrompt()
                    : "低质量, 模糊, 多手指, 水印, 变形, 低分辨率, 畸形, 残缺";

            // 调用 AI 模型生成全身图
            String fullImageBase64 = imageService.generateImageBase64(
                    fullPrompt,
                    negativePrompt,
                    request.getReferenceImageBase64(),
                    request.getWidth(),
                    request.getHeight(),
                    request.getStyle()
            );

            updateProgress(taskId, 70, "全身图生成完成");

            // ========== 阶段2: 分割肢体 (70-95%) ==========
            updateProgress(taskId, 75, "正在分割肢体...");

            // 使用 SAM 模型分割肢体
            Map<String, String> parts = segmentLimbs(fullImageBase64, request.getTemplate());

            updateProgress(taskId, 95, "分割完成");

            // ========== 阶段3: 保存并返回结果 ==========
            updateProgress(taskId, 98, "正在保存结果...");

            // 保存完整图和部件图
            String fullImageUrl = fileStorageService.saveImageFromBase64(
                    fullImageBase64,
                    taskId + "_full.png"
            );

            Map<String, String> partUrls = new HashMap<>();
            for (Map.Entry<String, String> entry : parts.entrySet()) {
                String partName = entry.getKey();
                String partBase64 = entry.getValue();
                String partUrl = fileStorageService.saveImageFromBase64(
                        partBase64,
                        taskId + "_" + partName + ".png"
                );
                partUrls.put(partName, partUrl);
            }

            // 更新最终结果
            SkeletonGenerationResponse finalResponse = SkeletonGenerationResponse.builder()
                    .taskId(taskId)
                    .status("SUCCESS")
                    .progress(100)
                    .progressMessage("生成完成")
                    .fullImageUrl(fullImageUrl)
                    .parts(partUrls)
                    .generatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .build();
            taskResults.put(taskId, finalResponse);

            log.info("骨骼素材生成完成: taskId={}, parts={}", taskId, partUrls.keySet());

        } catch (Exception e) {
            log.error("骨骼素材生成失败: taskId={}", taskId, e);
            saveError(taskId, e.getMessage());
        }
    }

    /**
     * 获取生成结果
     *
     * @param taskId 任务 ID
     * @return 生成结果
     */
    public SkeletonGenerationResponse getResult(String taskId) {
        SkeletonGenerationResponse result = taskResults.get(taskId);
        if (result == null) {
            return SkeletonGenerationResponse.builder()
                    .taskId(taskId)
                    .status("NOT_FOUND")
                    .errorMessage("任务不存在或已过期")
                    .build();
        }
        return result;
    }

    /**
     * 更新任务进度
     *
     * @param taskId 任务 ID
     * @param progress 进度 (0-100)
     * @param message 进度描述
     */
    private void updateProgress(String taskId, int progress, String message) {
        SkeletonGenerationResponse response = taskResults.get(taskId);
        if (response != null) {
            response.setProgress(progress);
            response.setProgressMessage(message);
            response.setStatus("PROCESSING");
        }
        log.debug("任务进度更新: taskId={}, progress={}, message={}", taskId, progress, message);
    }

    /**
     * 保存错误信息
     *
     * @param taskId 任务 ID
     * @param errorMessage 错误信息
     */
    private void saveError(String taskId, String errorMessage) {
        SkeletonGenerationResponse response = taskResults.get(taskId);
        if (response != null) {
            response.setStatus("FAILED");
            response.setProgress(0);
            response.setErrorMessage(errorMessage);
        }
    }

    /**
     * 构建全身图提示词
     *
     * @param request 生成请求
     * @return 完整的提示词
     */
    private String buildFullPrompt(SkeletonGenerationRequest request) {
        StringBuilder prompt = new StringBuilder(request.getPrompt());

        // 添加风格关键词
        switch (request.getStyle()) {
            case "anime":
                prompt.append(", anime style, detailed illustration");
                break;
            case "realistic":
                prompt.append(", realistic style, detailed anatomy");
                break;
            case "chibi":
                prompt.append(", chibi style, cute, kawaii");
                break;
            case "cartoon":
                prompt.append(", cartoon style, vibrant colors");
                break;
            case "pixel":
                prompt.append(", pixel art style, 8-bit");
                break;
        }

        // 添加骨骼模板关键词
        if ("animation".equals(request.getTemplate())) {
            prompt.append(", full body, standing pose");
        } else {
            prompt.append(", standard human proportions");
        }

        // 添加姿态关键词
        switch (request.getPose()) {
            case "standing":
                prompt.append(", standing straight");
                break;
            case "walking":
                prompt.append(", walking pose");
                break;
            case "running":
                prompt.append(", running pose");
                break;
            case "attacking":
                prompt.append(", action pose, combat stance");
                break;
            case "casting":
                prompt.append(", casting spell pose");
                break;
            case "idle":
                prompt.append(", idle pose, relaxed");
                break;
        }

        prompt.append(", separated limbs ready for animation");

        return prompt.toString();
    }

    /**
     * 使用 SAM 模型分割肢体
     *
     * @param fullImageBase64 完整图 Base64
     * @param template 骨骼模板
     * @return 分割后的部件 Base64 列表
     */
    private Map<String, String> segmentLimbs(String fullImageBase64, String template) {
        try {
            log.info("开始 SAM 分割: template={}", template);

            // 步骤1: 调用 SAM 进行初步分割
            SAMSegmentationResult samResult = samService.segmentImage(fullImageBase64, null);

            if (!samResult.isSuccess()) {
                log.warn("SAM 分割失败，使用基础分割: {}", samResult.getErrorMessage());
                return fallbackSegmentation(fullImageBase64, template);
            }

            // 步骤2: 根据人体关键点识别肢体区域
            Map<String, BoundingBox> limbBoxes = detectLimbBoundingBoxes(template);

            // 步骤3: 对每个肢体区域进行精确分割
            Map<String, String> parts = new HashMap<>();

            for (Map.Entry<String, BoundingBox> entry : limbBoxes.entrySet()) {
                String partName = entry.getKey();
                BoundingBox box = entry.getValue();

                // 使用 bounding box 中心点作为提示进行精确分割
                SAMService.Point promptPoint = new SAMService.Point(box.getCenterX(), box.getCenterY());

                SAMSegmentationResult partResult = samService.segmentImage(
                    fullImageBase64, Arrays.asList(promptPoint)
                );

                if (partResult.isSuccess()) {
                    // 步骤4: 从原图中裁剪出部件
                    String partBase64 = cropPartFromImage(
                        fullImageBase64, partResult.getBestMask(), box
                    );

                    // 步骤5: 添加透明背景
                    String transparentPart = addAlphaChannel(partBase64);

                    parts.put(partName, transparentPart);
                } else {
                    log.warn("部件 {} 分割失败，使用基础分割", partName);
                    parts.put(partName, fullImageBase64); // 失败时使用完整图作为占位
                }
            }

            log.info("SAM 分割完成: parts={}", parts.keySet());
            return parts;

        } catch (Exception e) {
            log.error("肢体分割失败", e);
            return fallbackSegmentation(fullImageBase64, template);
        }
    }

    /**
     * 检测肢体边界框
     */
    private Map<String, BoundingBox> detectLimbBoundingBoxes(String template) {
        Map<String, BoundingBox> boxes = new HashMap<>();

        // 基于人体比例预设的边界框（可根据模板调整）
        if ("animation".equals(template)) {
            // 动画骨骼比例
            boxes.put("head", new BoundingBox(0.4, 0.1, 0.6, 0.3));
            boxes.put("torso", new BoundingBox(0.3, 0.3, 0.7, 0.6));
            boxes.put("leftArm", new BoundingBox(0.1, 0.35, 0.35, 0.7));
            boxes.put("rightArm", new BoundingBox(0.65, 0.35, 0.9, 0.7));
            boxes.put("leftLeg", new BoundingBox(0.35, 0.6, 0.5, 0.95));
            boxes.put("rightLeg", new BoundingBox(0.5, 0.6, 0.65, 0.95));
        } else {
            // 标准人体比例
            boxes.put("head", new BoundingBox(0.4, 0.1, 0.6, 0.25));
            boxes.put("torso", new BoundingBox(0.3, 0.25, 0.7, 0.55));
            boxes.put("leftArm", new BoundingBox(0.1, 0.3, 0.35, 0.7));
            boxes.put("rightArm", new BoundingBox(0.65, 0.3, 0.9, 0.7));
            boxes.put("leftLeg", new BoundingBox(0.35, 0.55, 0.5, 0.95));
            boxes.put("rightLeg", new BoundingBox(0.5, 0.55, 0.65, 0.95));
        }

        return boxes;
    }

    /**
     * 从原图中裁剪部件
     */
    private String cropPartFromImage(String fullImageBase64, SAMSegmentationResult.Mask mask, BoundingBox box) {
        try {
            // 解码原图
            byte[] imageBytes = Base64.getDecoder().decode(fullImageBase64);
            BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(imageBytes));

            if (originalImage == null) {
                log.warn("无法解码原图，返回原图");
                return fullImageBase64;
            }

            // 获取边界框坐标（转换为实际像素坐标）
            int x = (int) (box.x1 * originalImage.getWidth());
            int y = (int) (box.y1 * originalImage.getHeight());
            int width = (int) ((box.x2 - box.x1) * originalImage.getWidth());
            int height = (int) ((box.y2 - box.y1) * originalImage.getHeight());

            // 确保坐标在图像范围内
            x = Math.max(0, Math.min(x, originalImage.getWidth() - 1));
            y = Math.max(0, Math.min(y, originalImage.getHeight() - 1));
            width = Math.min(width, originalImage.getWidth() - x);
            height = Math.min(height, originalImage.getHeight() - y);

            // 创建裁剪区域
            BufferedImage croppedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g2d = croppedImage.createGraphics();
            g2d.setComposite(AlphaComposite.Src);
            g2d.drawImage(originalImage, 0, 0, width, height, x, y, x + width, y + height, null);
            g2d.dispose();

            // 如果有掩码数据，应用掩码
            if (mask != null && mask.getMaskData() != null && !"default_segmentation".equals(mask.getMaskData())) {
                croppedImage = applyMask(croppedImage, mask);
            }

            // 转换回 Base64
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(croppedImage, "PNG", baos);
            return Base64.getEncoder().encodeToString(baos.toByteArray());

        } catch (Exception e) {
            log.error("部件裁剪失败", e);
            return fullImageBase64; // 失败时返回原图
        }
    }

    /**
     * 应用掩码到图像
     */
    private BufferedImage applyMask(BufferedImage image, SAMSegmentationResult.Mask mask) {
        try {
            // 简化的掩码应用：创建一个圆形掩码作为示例
            // 实际应用中需要解析真实的掩码数据
            BufferedImage maskedImage = new BufferedImage(
                image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_ARGB
            );

            Graphics2D g2d = maskedImage.createGraphics();
            g2d.setComposite(AlphaComposite.Src);
            g2d.drawImage(image, 0, 0, null);

            // 创建圆形掩码效果（示例实现）
            int centerX = image.getWidth() / 2;
            int centerY = image.getHeight() / 2;
            int radius = Math.min(image.getWidth(), image.getHeight()) / 3;

            g2d.setComposite(AlphaComposite.Clear);
            for (int y = 0; y < image.getHeight(); y++) {
                for (int x = 0; x < image.getWidth(); x++) {
                    double distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                    if (distance > radius) {
                        maskedImage.setRGB(x, y, 0x00000000); // 设置为透明
                    }
                }
            }

            g2d.dispose();
            return maskedImage;

        } catch (Exception e) {
            log.error("应用掩码失败", e);
            return image; // 失败时返回原图
        }
    }

    /**
     * 为部件添加透明背景
     */
    private String addAlphaChannel(String imageBase64) {
        try {
            // 解码 Base64
            byte[] imageBytes = Base64.getDecoder().decode(imageBase64);
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));

            if (image == null) {
                log.warn("无法解码图像，返回原图");
                return imageBase64;
            }

            // 创建带 Alpha 通道的图像
            BufferedImage transparentImage = new BufferedImage(
                image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_ARGB
            );

            Graphics2D g2d = transparentImage.createGraphics();
            g2d.setComposite(AlphaComposite.Src);
            g2d.drawImage(image, 0, 0, null);
            g2d.dispose();

            // 应用背景移除（简单实现：移除白色背景）
            transparentImage = removeBackground(transparentImage);

            // 应用边缘抗锯齿
            transparentImage = applyAntiAliasing(transparentImage);

            // 转换回 Base64
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(transparentImage, "PNG", baos);
            return Base64.getEncoder().encodeToString(baos.toByteArray());

        } catch (Exception e) {
            log.error("透明底处理失败", e);
            return imageBase64; // 失败时返回原图
        }
    }

    /**
     * 移除背景（简单实现）
     */
    private BufferedImage removeBackground(BufferedImage image) {
        int width = image.getWidth();
        int height = image.getHeight();

        // 简单的白色背景移除
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int pixel = image.getRGB(x, y);
                int alpha = (pixel >> 24) & 0xff;
                int red = (pixel >> 16) & 0xff;
                int green = (pixel >> 8) & 0xff;
                int blue = pixel & 0xff;

                // 如果像素接近白色且不是透明，则设置为透明
                if (alpha > 0 && red > 240 && green > 240 && blue > 240) {
                    image.setRGB(x, y, 0x00000000); // 完全透明
                }
            }
        }

        return image;
    }

    /**
     * 应用抗锯齿处理
     */
    private BufferedImage applyAntiAliasing(BufferedImage image) {
        // 简单的边缘平滑处理
        BufferedImage smoothed = new BufferedImage(
            image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_ARGB
        );

        Graphics2D g2d = smoothed.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.drawImage(image, 0, 0, null);
        g2d.dispose();

        return smoothed;
    }

    /**
     * 边界框类
     */
    private static class BoundingBox {
        private final double x1, y1, x2, y2;

        public BoundingBox(double x1, double y1, double x2, double y2) {
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
        }

        public int getCenterX() {
            return (int) ((x1 + x2) / 2 * 1000); // 假设图像宽度为1000
        }

        public int getCenterY() {
            return (int) ((y1 + y2) / 2 * 1000); // 假设图像高度为1000
        }
    }

    /**
     * 基础分割（SAM 失败时的回退方案）
     */
    private Map<String, String> fallbackSegmentation(String fullImageBase64, String template) {
        log.info("使用基础分割作为回退方案");
        Map<String, String> parts = new HashMap<>();
        parts.put("head", fullImageBase64);
        parts.put("torso", fullImageBase64);
        parts.put("leftArm", fullImageBase64);
        parts.put("rightArm", fullImageBase64);
        parts.put("leftLeg", fullImageBase64);
        parts.put("rightLeg", fullImageBase64);
        return parts;
    }

    /**
     * 清理过期任务结果
     *
     * 建议定时调用，清理超过 24 小时的任务结果
     */
    public void cleanExpiredTasks() {
        // TODO: 实现过期任务清理逻辑
        log.info("清理过期任务调用占位");
    }
}

