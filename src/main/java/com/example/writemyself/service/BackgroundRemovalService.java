package com.example.writemyself.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Base64;

/**
 * 背景去除服务
 *
 * 提供多种背景去除算法支持：
 * - RMBG-2.0：最新的背景去除模型
 * - BiRefNet：双分支参考网络
 * - 传统算法：基于颜色和边缘检测
 */
@Service
@Slf4j
public class BackgroundRemovalService {

    /**
     * 使用RMBG-2.0模型移除背景
     *
     * @param imageBase64 输入图像Base64
     * @return 透明背景图像Base64
     */
    public String removeBackgroundWithRMBG2(String imageBase64) {
        try {
            log.debug("使用RMBG-2.0移除背景");

            // 解码Base64图像
            byte[] imageBytes = Base64.getDecoder().decode(imageBase64);
            BufferedImage inputImage = ImageIO.read(new ByteArrayInputStream(imageBytes));

            // 调用RMBG-2.0模型进行背景去除
            // 这里应该集成实际的RMBG-2.0模型调用
            BufferedImage resultImage = processWithRMBG2(inputImage);

            // 转换为Base64返回
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(resultImage, "PNG", baos);
            return Base64.getEncoder().encodeToString(baos.toByteArray());

        } catch (Exception e) {
            log.error("RMBG-2.0背景去除失败", e);
            // 失败时回退到传统方法
            return removeBackgroundTraditional(imageBase64);
        }
    }

    /**
     * 使用BiRefNet模型移除背景
     *
     * @param imageBase64 输入图像Base64
     * @return 透明背景图像Base64
     */
    public String removeBackgroundWithBiRefNet(String imageBase64) {
        try {
            log.debug("使用BiRefNet移除背景");

            // 解码Base64图像
            byte[] imageBytes = Base64.getDecoder().decode(imageBase64);
            BufferedImage inputImage = ImageIO.read(new ByteArrayInputStream(imageBytes));

            // 调用BiRefNet模型进行背景去除
            BufferedImage resultImage = processWithBiRefNet(inputImage);

            // 转换为Base64返回
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(resultImage, "PNG", baos);
            return Base64.getEncoder().encodeToString(baos.toByteArray());

        } catch (Exception e) {
            log.error("BiRefNet背景去除失败", e);
            // 失败时回退到传统方法
            return removeBackgroundTraditional(imageBase64);
        }
    }

    /**
     * 传统背景去除算法（回退方案）
     *
     * @param imageBase64 输入图像Base64
     * @return 透明背景图像Base64
     */
    public String removeBackgroundTraditional(String imageBase64) {
        try {
            log.debug("使用传统算法移除背景");

            // 解码Base64图像
            byte[] imageBytes = Base64.getDecoder().decode(imageBase64);
            BufferedImage inputImage = ImageIO.read(new ByteArrayInputStream(imageBytes));

            // 应用传统背景去除算法
            BufferedImage resultImage = applyTraditionalBackgroundRemoval(inputImage);

            // 转换为Base64返回
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(resultImage, "PNG", baos);
            return Base64.getEncoder().encodeToString(baos.toByteArray());

        } catch (Exception e) {
            log.error("传统背景去除失败", e);
            throw new RuntimeException("背景去除失败: " + e.getMessage());
        }
    }

    /**
     * 智能背景去除（自动选择最佳算法）
     *
     * @param imageBase64 输入图像Base64
     * @param algorithm 指定算法（可选）
     * @return 透明背景图像Base64
     */
    public String removeBackgroundSmart(String imageBase64, String algorithm) {
        try {
            log.debug("智能背景去除: algorithm={}", algorithm);

            if ("RMBG-2.0".equalsIgnoreCase(algorithm)) {
                return removeBackgroundWithRMBG2(imageBase64);
            } else if ("BiRefNet".equalsIgnoreCase(algorithm)) {
                return removeBackgroundWithBiRefNet(imageBase64);
            } else {
                // 自动选择算法
                return autoSelectBestAlgorithm(imageBase64);
            }

        } catch (Exception e) {
            log.error("智能背景去除失败", e);
            return removeBackgroundTraditional(imageBase64);
        }
    }

    // ============ 私有方法 ============

    private BufferedImage processWithRMBG2(BufferedImage inputImage) {
        // RMBG-2.0模型处理逻辑
        // 这里应该集成实际的RMBG-2.0模型调用

        log.debug("RMBG-2.0处理图像: {}x{}", inputImage.getWidth(), inputImage.getHeight());

        // 创建输出图像（带Alpha通道）
        BufferedImage outputImage = new BufferedImage(
                inputImage.getWidth(),
                inputImage.getHeight(),
                BufferedImage.TYPE_INT_ARGB
        );

        // 模拟RMBG-2.0处理结果
        // 实际实现应该调用RMBG-2.0模型API
        Graphics2D g2d = outputImage.createGraphics();
        g2d.drawImage(inputImage, 0, 0, null);
        g2d.dispose();

        // 应用模拟的背景去除效果
        return applyRMBG2Effect(outputImage);
    }

    private BufferedImage processWithBiRefNet(BufferedImage inputImage) {
        // BiRefNet模型处理逻辑
        // 这里应该集成实际的BiRefNet模型调用

        log.debug("BiRefNet处理图像: {}x{}", inputImage.getWidth(), inputImage.getHeight());

        // 创建输出图像（带Alpha通道）
        BufferedImage outputImage = new BufferedImage(
                inputImage.getWidth(),
                inputImage.getHeight(),
                BufferedImage.TYPE_INT_ARGB
        );

        // 模拟BiRefNet处理结果
        Graphics2D g2d = outputImage.createGraphics();
        g2d.drawImage(inputImage, 0, 0, null);
        g2d.dispose();

        // 应用模拟的背景去除效果
        return applyBiRefNetEffect(outputImage);
    }

    private BufferedImage applyTraditionalBackgroundRemoval(BufferedImage inputImage) {
        int width = inputImage.getWidth();
        int height = inputImage.getHeight();

        // 创建输出图像（带Alpha通道）
        BufferedImage outputImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);

        // 分析图像边缘像素来确定背景颜色
        Color backgroundColor = detectBackgroundColor(inputImage);

        // 应用背景去除
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int pixel = inputImage.getRGB(x, y);
                Color pixelColor = new Color(pixel);

                // 如果像素接近背景色，则设置为透明
                if (isBackgroundColor(pixelColor, backgroundColor)) {
                    outputImage.setRGB(x, y, 0x00000000); // 完全透明
                } else {
                    // 保留前景像素
                    outputImage.setRGB(x, y, pixel);
                }
            }
        }

        // 应用边缘平滑
        return applyEdgeSmoothing(outputImage);
    }

    private BufferedImage applyRMBG2Effect(BufferedImage image) {
        // 模拟RMBG-2.0的高级背景去除效果
        // 实际实现应该使用真实的模型推理结果

        int width = image.getWidth();
        int height = image.getHeight();
        BufferedImage result = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);

        // 模拟精确的人物分割
        int centerX = width / 2;
        int centerY = height / 2;
        int personRadius = Math.min(width, height) / 3;

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int pixel = image.getRGB(x, y);

                // 计算到中心的距离
                double distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

                if (distance <= personRadius) {
                    // 在人物区域内，保留像素
                    result.setRGB(x, y, pixel);
                } else {
                    // 在背景区域内，设置为透明
                    result.setRGB(x, y, 0x00000000);
                }
            }
        }

        return result;
    }

    private BufferedImage applyBiRefNetEffect(BufferedImage image) {
        // 模拟BiRefNet的双分支背景去除效果
        // 实际实现应该使用真实的模型推理结果

        int width = image.getWidth();
        int height = image.getHeight();
        BufferedImage result = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);

        // 模拟更精确的边缘检测
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int pixel = image.getRGB(x, y);
                Color color = new Color(pixel);

                // 基于颜色和位置判断是否为前景
                if (isForegroundPixel(color, x, y, width, height)) {
                    result.setRGB(x, y, pixel);
                } else {
                    result.setRGB(x, y, 0x00000000);
                }
            }
        }

        return result;
    }

    private Color detectBackgroundColor(BufferedImage image) {
        // 分析图像四个角的像素来确定背景色
        int width = image.getWidth();
        int height = image.getHeight();

        // 采样四个角的像素
        Color[] cornerColors = {
            new Color(image.getRGB(0, 0)),
            new Color(image.getRGB(width - 1, 0)),
            new Color(image.getRGB(0, height - 1)),
            new Color(image.getRGB(width - 1, height - 1))
        };

        // 返回最常见的颜色作为背景色
        return cornerColors[0]; // 简化实现
    }

    private boolean isBackgroundColor(Color pixelColor, Color backgroundColor) {
        // 计算颜色差异
        int diff = Math.abs(pixelColor.getRed() - backgroundColor.getRed()) +
                   Math.abs(pixelColor.getGreen() - backgroundColor.getGreen()) +
                   Math.abs(pixelColor.getBlue() - backgroundColor.getBlue());

        // 如果颜色差异小于阈值，则认为是背景色
        return diff < 100; // 阈值可以根据需要调整
    }

    private boolean isForegroundPixel(Color color, int x, int y, int width, int height) {
        // 基于颜色和位置判断是否为前景像素

        // 检查是否在图像中心区域（可能是人物）
        int centerX = width / 2;
        int centerY = height / 2;
        int radius = Math.min(width, height) / 4;

        double distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

        // 如果在中心区域，更可能是前景
        if (distance <= radius) {
            return true;
        }

        // 检查颜色特征（例如，肤色、服装色等）
        return isLikelyForegroundColor(color);
    }

    private boolean isLikelyForegroundColor(Color color) {
        // 简单的颜色判断逻辑
        // 实际实现应该使用更复杂的颜色分析

        // 避免纯白、纯黑等可能是背景的颜色
        if (color.getRed() > 240 && color.getGreen() > 240 && color.getBlue() > 240) {
            return false; // 接近白色，可能是背景
        }

        if (color.getRed() < 15 && color.getGreen() < 15 && color.getBlue() < 15) {
            return false; // 接近黑色，可能是背景
        }

        return true;
    }

    private BufferedImage applyEdgeSmoothing(BufferedImage image) {
        // 应用边缘平滑处理，减少锯齿
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

    private String autoSelectBestAlgorithm(String imageBase64) {
        try {
            // 分析图像特征来选择最佳算法
            byte[] imageBytes = Base64.getDecoder().decode(imageBase64);
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));

            // 基于图像特征选择算法
            if (hasComplexBackground(image)) {
                return removeBackgroundWithRMBG2(imageBase64); // RMBG-2.0处理复杂背景更好
            } else if (hasSimpleBackground(image)) {
                return removeBackgroundTraditional(imageBase64); // 简单背景用传统方法更快
            } else {
                return removeBackgroundWithBiRefNet(imageBase64); // 中等复杂度用BiRefNet
            }

        } catch (Exception e) {
            log.error("自动选择算法失败", e);
            return removeBackgroundTraditional(imageBase64);
        }
    }

    private boolean hasComplexBackground(BufferedImage image) {
        // 分析图像背景复杂度
        // 简化实现：检查边缘像素的颜色变化
        return false; // 暂时返回false，使用默认算法
    }

    private boolean hasSimpleBackground(BufferedImage image) {
        // 分析图像背景是否简单
        // 简化实现：检查背景是否接近纯色
        return true; // 暂时返回true，使用传统算法
    }
}

