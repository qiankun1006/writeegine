package com.example.writemyself.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * AI肖像任务模型
 */
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class AIPortraitTask implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 状态枚举
     */
    public enum Status {
        PENDING("PENDING", "待处理"),
        PROCESSING("PROCESSING", "处理中"),
        SUCCESS("SUCCESS", "成功"),
        FAILED("FAILED", "失败");

        private final String value;
        private final String description;

        Status(String value, String description) {
            this.value = value;
            this.description = description;
        }

        public String getValue() {
            return value;
        }

        public String getDescription() {
            return description;
        }

        /**
         * 根据字符串值获取 Status
         */
        public static Status fromValue(String value) {
            for (Status status : Status.values()) {
                if (status.value.equals(value)) {
                    return status;
                }
            }
            return PENDING;
        }
    }

    /**
     * 自增主键 ID
     */
    private Long id;

    /**
     * 任务ID（唯一）
     */
    private String taskId;

    /**
     * 生成记录ID
     */
    private Long generationId;

    /**
     * 任务状态
     */
    private String status;

    /**
     * 进度百分比
     */
    private Integer progress = 0;

    /**
     * 重试次数
     */
    private Integer retryCount = 0;

    /**
     * 最大重试次数
     */
    private Integer maxRetries = 3;

    /**
     * 最后一次错误信息
     */
    private String lastError;

    /**
     * 开始时间
     */
    private LocalDateTime startedAt;

    /**
     * 完成时间
     */
    private LocalDateTime completedAt;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 额外元数据
     */
    private Map<String, Object> metadata = new HashMap<>();
}

