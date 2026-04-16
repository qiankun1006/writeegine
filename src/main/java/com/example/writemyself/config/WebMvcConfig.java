package com.example.writemyself.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Spring MVC 静态资源配置
 *
 * 将本地 uploads 目录映射为 HTTP 可访问的静态资源，
 * 模拟对象存储桶（OSS/S3）的行为。
 *
 * 访问路径：GET /uploads/{date}/{filename}
 * 实际存储：${file.storage.path}/{date}/{filename}
 *
 * 待接入真实对象存储桶时，只需：
 * 1. 修改 FileStorageService.saveImageAndGetUrl() 改为上传到桶
 * 2. 删除本 WebMvcConfig 的 uploads 映射（桶自带 HTTP 访问）
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.storage.path:/tmp/writeengine/uploads}")
    private String storagePath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 将本地 uploads 目录映射为 /uploads/** HTTP 路径
        // 例如：/uploads/2026/04/15/abc123_full.png
        //   → file:{storagePath}/2026/04/15/abc123_full.png
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + storagePath + "/");
    }
}

