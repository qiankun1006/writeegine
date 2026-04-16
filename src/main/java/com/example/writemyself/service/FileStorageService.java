package com.example.writemyself.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

/**
 * 文件存储服务
 * 处理生成的图片的本地存储
 */
@Service
@Slf4j
public class FileStorageService {

    @Value("${file.storage.path:/Users/qiankun96/Desktop/meituan/writeengine/uploads/ai-portraits}")
    private String storagePath;

    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    /**
     * 从 Base64 字符串保存图片
     * @param base64Content Base64 编码的图片内容
     * @param filename 文件名
     * @return 保存的文件路径
     */
    public String saveImageFromBase64(String base64Content, String filename) {
        try {
            // 解码 Base64
            byte[] imageBytes = Base64.getDecoder().decode(base64Content);

            // 生成保存路径
            String datePath = LocalDateTime.now().format(dateFormatter);
            String savePath = storagePath + File.separator + datePath;

            // 创建目录
            Files.createDirectories(Paths.get(savePath));

            // 保存文件
            String filePath = savePath + File.separator + filename;
            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                fos.write(imageBytes);
            }

            log.info("✓ 图片已保存: {}", filePath);
            return filePath;

        } catch (IOException e) {
            log.error("保存图片失败", e);
            throw new RuntimeException("保存图片失败: " + e.getMessage(), e);
        }
    }

    /**
     * 从 Base64 字符串保存图片，返回 HTTP 可访问的相对 URL
     *
     * 与 saveImageFromBase64 功能相同，但返回值是 HTTP 路径（/uploads/...）
     * 而非磁盘绝对路径，前端可直接用于 <img src="..."> 展示。
     *
     * 待接入真实对象存储桶时，只需将此方法替换为上传到桶并返回桶 URL 即可，
     * 调用方无需修改。
     *
     * @param base64Content Base64 编码的图片内容（可带 data:image/...;base64, 前缀）
     * @param filename 文件名
     * @return HTTP 可访问的相对路径，例如 /uploads/2026/04/15/abc_full.png
     */
    public String saveImageAndGetUrl(String base64Content, String filename) {
        try {
            // 去掉 data:image/xxx;base64, 前缀（如有）
            String pureBase64 = base64Content;
            if (base64Content != null && base64Content.contains(",")) {
                pureBase64 = base64Content.substring(base64Content.indexOf(',') + 1);
            }

            byte[] imageBytes = Base64.getDecoder().decode(pureBase64);

            String datePath = LocalDateTime.now().format(dateFormatter);
            String savePath = storagePath + File.separator + datePath;
            Files.createDirectories(Paths.get(savePath));

            String filePath = savePath + File.separator + filename;
            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                fos.write(imageBytes);
            }

            // 返回 HTTP 可访问的相对 URL（与 WebMvcConfig /uploads/** 映射对应）
            String httpUrl = "/uploads/" + datePath.replace(File.separator, "/") + "/" + filename;
            log.info("✓ 图片已保存并可通过 HTTP 访问: {} -> {}", filePath, httpUrl);
            return httpUrl;

        } catch (IOException e) {
            log.error("保存图片失败（saveImageAndGetUrl）: filename={}", filename, e);
            throw new RuntimeException("保存图片失败: " + e.getMessage(), e);
        }
    }

    /**
     * 保存生成的图片
     * @param imageUrl 图片 URL
     * @param filename 文件名
     * @return 本地文件路径
     */
    public String saveGeneratedImage(String imageUrl, String filename) {
        try {
            log.info("保存生成的图片: {} -> {}", imageUrl, filename);

            // TODO: 实现从 URL 下载图片并保存的逻辑

            // 生成保存路径
            String datePath = LocalDateTime.now().format(dateFormatter);
            String savePath = storagePath + File.separator + datePath;

            // 创建目录
            Files.createDirectories(Paths.get(savePath));

            String filePath = savePath + File.separator + filename;

            log.info("✓ 生成的图片已保存: {}", filePath);
            return filePath;

        } catch (IOException e) {
            log.error("保存生成的图片失败", e);
            throw new RuntimeException("保存生成的图片失败: " + e.getMessage(), e);
        }
    }

    /**
     * 删除图片文件
     * @param filePath 文件路径
     */
    public void deleteImage(String filePath) {
        try {
            Files.deleteIfExists(Paths.get(filePath));
            log.info("✓ 图片已删除: {}", filePath);
        } catch (IOException e) {
            log.error("删除图片失败: {}", filePath, e);
        }
    }

    /**
     * 获取存储路径
     */
    public String getStoragePath() {
        return storagePath;
    }

    /**
     * 检查文件是否存在
     */
    public boolean fileExists(String filePath) {
        return Files.exists(Paths.get(filePath));
    }

    /**
     * 保存 JSON 数据到文件，返回 HTTP 可访问的相对 URL
     *
     * 调用惯例：saveJsonData(jsonContent, filename)，即
     * 第一个参数为 JSON 内容，第二个为文件名。
     *
     * @param jsonData JSON 数据字符串（第一个参数）
     * @param filename 文件名（第二个参数）
     * @return HTTP 可访问的相对 URL，如 /uploads/2026/04/15/xxx.json
     */
    public String saveJsonData(String jsonData, String filename) {
        try {
            String datePath = LocalDateTime.now().format(dateFormatter);
            String savePath = storagePath + File.separator + datePath;
            Files.createDirectories(Paths.get(savePath));
            String filePath = savePath + File.separator + filename;
            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                fos.write(jsonData.getBytes("UTF-8"));
            }
            String httpUrl = "/uploads/" + datePath.replace(File.separator, "/") + "/" + filename;
            log.info("✓ JSON 数据已保存: {} -> {}", filePath, httpUrl);
            return httpUrl;
        } catch (IOException e) {
            log.error("保存 JSON 数据失败", e);
            throw new RuntimeException("保存 JSON 数据失败: " + e.getMessage(), e);
        }
    }

    /**
     * 将 HTTP URL 转换为本地磁盘绝对路径（本地模拟桶场景使用）
     *
     * URL 格式：http://localhost:PORT/uploads/YYYY/MM/DD/filename
     * 或相对路径：/uploads/YYYY/MM/DD/filename
     *
     * @param url HTTP URL 或 /uploads/ 相对路径
     * @return 本地磁盘绝对路径，或 null（无法转换时）
     */
    public String urlToLocalPath(String url) {
        if (url == null || url.trim().isEmpty()) return null;
        try {
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("/uploads/(.+)");
            java.util.regex.Matcher matcher = pattern.matcher(url);
            if (matcher.find()) {
                String relativePath = matcher.group(1);
                String localRelative = relativePath.replace("/", File.separator);
                return storagePath + File.separator + localRelative;
            }
            log.debug("URL 不含 /uploads/ 路径，无法转换: {}", url);
            return null;
        } catch (Exception e) {
            log.warn("URL 转本地路径失败: url={}, err={}", url, e.getMessage());
            return null;
        }
    }

}

