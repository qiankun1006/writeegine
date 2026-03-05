package com.example.writemyself.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 生成进度响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateProgressResponse {

    /**
     * 任务 ID
     */
    private String taskId;

    /**
     * 当前状态：PENDING, PROCESSING, SUCCESS, FAILED
     */
    private String status;

    /**
     * 进度百分比 (0-100)
     */
    private Integer progress;

    /**
     * 状态描述信息
     */
    private String message;

    /**
     * 生成耗时（秒）
     */
    private Integer generationTime;

    /**
     * 排队等待时间（秒）
     */
    private Integer queueWaitTime;

    /**
     * 是否已完成
     */
    private Boolean completed;

    /**
     * 是否失败
     */
    private Boolean failed;

    /**
     * 生成的图片URL列表（仅在成功时返回）
     */
    private List<String> imageUrls;

    /**
     * 错误信息（仅在失败时返回）
     */
    private String errorMessage;
}

