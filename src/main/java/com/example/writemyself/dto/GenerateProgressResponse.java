package com.example.writemyself.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 生成进度查询响应 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerateProgressResponse {

    /**
     * 任务 ID
     */
    private String taskId;

    /**
     * 当前状态
     */
    private String status;

    /**
     * 进度百分比 (0-100)
     */
    private Integer progress;

    /**
     * 状态描述
     */
    private String statusDescription;

    /**
     * 生成的图片 URLs（仅当完成时显示）
     */
    private List<String> imageUrls;

    /**
     * 错误信息（仅当失败时显示）
     */
    private String errorMessage;

    /**
     * 生成耗时（毫秒）
     */
    private Long generationTime;

    /**
     * 队列等待时间（毫秒）
     */
    private Long queueWaitTime;

    /**
     * 是否完成
     */
    private Boolean completed;

    /**
     * 是否失败
     */
    private Boolean failed;
}

