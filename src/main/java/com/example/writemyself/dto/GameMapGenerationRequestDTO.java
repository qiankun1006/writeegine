package com.example.writemyself.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.Map;

/**
 * 游戏地图生成请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameMapGenerationRequestDTO {

    /**
     * 草图像素数据 - 必填
     * 包含tilemap草图的基础数据
     */
    @NotBlank(message = "草图数据不能为空")
    @Size(min = 10, max = 100000, message = "草图数据长度需要在 10-100000 字符之间")
    private String sketchData;

    /**
     * 风格 - 必填
     * 可选值: fantasy, sci-fi, medieval, modern, cyberpunk, steampunk
     */
    @NotBlank(message = "风格不能为空")
    @Size(max = 50, message = "风格长度不能超过 50 字")
    private String style;

    /**
     * 尺寸 - 必填
     * 可选值: small, medium, large, custom
     */
    @NotBlank(message = "尺寸不能为空")
    @Size(max = 20, message = "尺寸长度不能超过 20 字")
    private String size;

    /**
     * 游戏类型 - 必填
     * 可选值: rpg, strategy, platform, sandbox, adventure, puzzle
     */
    @NotBlank(message = "游戏类型不能为空")
    @Size(max = 50, message = "游戏类型长度不能超过 50 字")
    private String gameType;

    /**
     * 微调模型 - 可选
     * 可选值: base, pro, custom
     */
    @Size(max = 50, message = "模型长度不能超过 50 字")
    private String model;

    /**
     * 参考图片URL - 可选
     */
    @Size(max = 500, message = "参考图片URL长度不能超过 500 字")
    private String referenceImage;

    /**
     * 额外参数 - 可选
     * 用于存储其他自定义参数
     */
    private Map<String, Object> additionalParams;

    /**
     * 宽度 - 可选，当尺寸为custom时使用
     */
    private Integer width;

    /**
     * 高度 - 可选，当尺寸为custom时使用
     */
    private Integer height;

    /**
     * 地图复杂度 - 可选
     * 可选值: simple, medium, complex
     */
    @Size(max = 20, message = "复杂度长度不能超过 20 字")
    private String complexity;

    /**
     * 地图主题 - 可选
     * 例如: forest, desert, mountain, city, dungeon
     */
    @Size(max = 50, message = "主题长度不能超过 50 字")
    private String theme;

    /**
     * 生成质量 - 可选
     * 可选值: draft, standard, high, ultra
     */
    @Size(max = 20, message = "质量长度不能超过 20 字")
    private String quality;
}

