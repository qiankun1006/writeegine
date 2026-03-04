package com.example.writemyself.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 生成立绘响应 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeneratePortraitResponse {

    /**
     * 任务 ID
     */
    private String taskId;

    /**
     * 生成 ID
     */
    private Long generationId;

    /**
     * 当前状态
     */
    private String status;

    /**
     * 进度百分比
     */
    private Integer progress;

    /**
     * 提示信息
     */
    private String message;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 预计完成时间（仅在处理中时显示）
     */
    private LocalDateTime estimatedCompletionTime;
}

