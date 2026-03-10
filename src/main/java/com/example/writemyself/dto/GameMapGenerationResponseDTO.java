package com.example.writemyself.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 游戏地图生成响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameMapGenerationResponseDTO {

    /**
     * 是否成功
     */
    private Boolean success;

    /**
     * 任务ID
     */
    private String jobId;

    /**
     * 状态
     * 可选值: pending, processing, completed, failed
     */
    private String status;

    /**
     * 进度百分比 (0-100)
     */
    private Integer progress;

    /**
     * 消息
     */
    private String message;

    /**
     * 预计完成时间（秒）
     */
    private Integer estimatedTime;

    /**
     * 错误信息
     */
    private String error;

    /**
     * 生成结果
     */
    private GameMapResultDTO result;
}

/**
 * 游戏地图生成结果 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class GameMapResultDTO {

    /**
     * 地图ID
     */
    private String mapId;

    /**
     * 预览URL
     */
    private String previewUrl;

    /**
     * 下载URL
     */
    private String downloadUrl;

    /**
     * 生成时间戳
     */
    private Long generatedAt;

    /**
     * 风格
     */
    private String style;

    /**
     * 尺寸
     */
    private String size;

    /**
     * 游戏类型
     */
    private String gameType;

    /**
     * 模型
     */
    private String model;

    /**
     * 地图宽度
     */
    private Integer width;

    /**
     * 地图高度
     */
    private Integer height;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 文件格式
     */
    private String format;

    /**
     * 额外元数据
     */
    private Map<String, Object> metadata;
}

