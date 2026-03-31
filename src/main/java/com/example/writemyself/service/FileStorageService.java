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
     * 保存 JSON 数据到文件
     * @param filename 文件名
     * @param jsonData JSON 数据字符串
     * @return 保存的文件路径
     */
    public String saveJsonData(String filename, String jsonData) {
        try {
            // 生成保存路径
            String datePath = LocalDateTime.now().format(dateFormatter);
            String savePath = storagePath + File.separator + datePath;

            // 创建目录
            Files.createDirectories(Paths.get(savePath));

            // 保存文件
            String filePath = savePath + File.separator + filename;
            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                fos.write(jsonData.getBytes());
            }

            log.info("✓ JSON 数据已保存: {}", filePath);
            return filePath;

        } catch (IOException e) {
            log.error("保存 JSON 数据失败", e);
            throw new RuntimeException("保存 JSON 数据失败: " + e.getMessage(), e);
        }
    }
}

