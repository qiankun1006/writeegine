package com.example.writemyself.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * AI 人物立绘生成响应 DTO
 *
 * 后端返回给前端的生成结果响应对象。
 * 用于表示生成任务的状态、进度和结果。
 *
 * 响应分为两类：
 * 1. 初始响应（202 Accepted）：返回 taskId 和初始状态
 * 2. 最终响应（200 OK）：返回生成结果
 *
 * @author AI Portrait Generator
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GeneratePortraitResponse {

    /**
     * 生成任务 ID - 必返回
     *
     * 唯一标识一次生成任务，用于后续的进度查询和结果获取。
     * 格式：task_yyyyMMdd_randomString
     * 例如：task_20260312_abc123def456
     */
    private String taskId;

    /**
     * 数据库中的生成记录 ID - 可选
     *
     * 用于内部数据库关联。
     */
    private Long generationId;

    /**
     * 任务状态 - 必返回
     *
     * 表示任务当前所处的阶段。
     * 可能的值：
     * - PENDING (待处理)：任务已创建，等待处理
     * - PROCESSING (生成中)：任务正在生成中
     * - COMPLETED (已完成)：任务成功完成
     * - FAILED (失败)：任务处理失败
     * - CANCELLED (已取消)：任务被用户取消
     */
    private String status;

    /**
     * 生成进度百分比 - 可选
     *
     * 任务的完成进度，取值范围 0-100。
     * 仅在 PROCESSING 状态时有意义。
     */
    private Integer progress;

    /**
     * 任务是否已完成 - 必返回
     *
     * 用于前端快速判断任务是否完成，无需解析 status。
     * true：任务已完成（COMPLETED 或 FAILED）
     * false：任务未完成（PENDING 或 PROCESSING）
     */
    @Builder.Default
    private Boolean completed = false;

    /**
     * 提示信息 - 必返回
     *
     * 用于向用户展示任务的详细状态信息。
     * 例如：
     * - "生成任务已创建，正在处理中"
     * - "正在生成中，已完成 45%"
     * - "生成成功"
     * - "生成失败：服务暂时不可用"
     */
    private String message;

    /**
     * 预计剩余时间（秒）- 可选
     *
     * 在生成中时显示的预计剩余时间，单位为秒。
     * 用于向用户展示还需要等待的时间。
     */
    private java.lang.Integer estimatedTime;

    /**
     * 任务创建时间 - 必返回
     *
     * 任务被创建的时间，格式为 ISO 8601。
     * 例如：2026-03-12T10:30:00
     */
    private LocalDateTime createdAt;

    /**
     * 任务开始时间 - 可选
     *
     * 任务开始处理的时间。如果还未开始处理，则为 null。
     */
    private LocalDateTime startedAt;

    /**
     * 任务完成时间 - 可选
     *
     * 任务完成（成功或失败）的时间。如果还未完成，则为 null。
     */
    private LocalDateTime completedAt;

    /**
     * 生成结果图片列表 - 可选
     *
     * 当任务完成时返回的生成图片信息列表。
     * 仅在任务成功完成时包含。
     */
    private List<GeneratedImage> resultImages;

    /**
     * 生成图片信息嵌套类
     *
     * 表示一张生成的图片及其相关信息。
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeneratedImage {

        /**
         * 图片 URL
         *
         * 可访问的图片地址，用于在前端展示或下载。
         * 例如：https://cdn.example.com/results/task_20260312_abc123_1.png
         */
        private String url;

        /**
         * 图片格式
         *
         * 图片的文件格式，值为 png 或 jpg。
         */
        private String format;

        /**
         * 图片尺寸
         *
         * 图片的分辨率，格式为 WIDTHxHEIGHT。
         * 例如：768x512
         */
        private String size;

        /**
         * 生成该图片时的随机种子值 - 可选
         *
         * 用于复现该生成结果。
         */
        private Integer seed;
    }
}

