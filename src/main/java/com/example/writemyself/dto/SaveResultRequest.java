package com.example.writemyself.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.List;

/**
 * 保存结果请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveResultRequest {

    /**
     * 任务 ID
     */
    @NotBlank(message = "任务ID不能为空")
    private String taskId;

    /**
     * 结果 ID（如果有多个结果）
     */
    private String resultId;

    /**
     * 资源名称
     */
    @NotBlank(message = "资源名称不能为空")
    @Size(min = 1, max = 100, message = "资源名称长度需要在 1-100 字之间")
    private String name;

    /**
     * 资源描述
     */
    @Size(max = 500, message = "资源描述长度不能超过 500 字")
    private String description;

    /**
     * 标签列表
     */
    private List<String> tags;
}

