package com.example.writemyself.service;

/**
 * 火山引擎服务异常
 * 封装火山引擎API调用过程中的各种异常情况
 */
public class VolcengineException extends RuntimeException {
    private final String errorCode;
    private final String requestId;
    private final int httpStatus;

    /**
     * 构造函数
     * @param message 异常消息
     * @param errorCode 火山引擎错误码
     * @param requestId 请求ID，用于问题追踪
     * @param httpStatus HTTP状态码
     */
    public VolcengineException(String message, String errorCode, String requestId, int httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.requestId = requestId;
        this.httpStatus = httpStatus;
    }

    /**
     * 构造函数（带原因异常）
     * @param message 异常消息
     * @param cause 原因异常
     * @param errorCode 火山引擎错误码
     * @param requestId 请求ID
     * @param httpStatus HTTP状态码
     */
    public VolcengineException(String message, Throwable cause, String errorCode, String requestId, int httpStatus) {
        super(message, cause);
        this.errorCode = errorCode;
        this.requestId = requestId;
        this.httpStatus = httpStatus;
    }

    /**
     * 构造函数（简化版，用于配置错误等）
     * @param message 异常消息
     */
    public VolcengineException(String message) {
        super(message);
        this.errorCode = null;
        this.requestId = null;
        this.httpStatus = 0;
    }

    // Getters
    public String getErrorCode() {
        return errorCode;
    }

    public String getRequestId() {
        return requestId;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    /**
     * 判断是否为可重试的异常
     * @return true表示可以重试，false表示不应重试
     */
    public boolean isRetryable() {
        // HTTP 5xx 错误通常可以重试
        if (httpStatus >= 500 && httpStatus < 600) {
            return true;
        }

        // 网络超时等可以重试
        if (getCause() instanceof java.net.SocketTimeoutException ||
            getCause() instanceof java.net.ConnectException) {
            return true;
        }

        // 特定的错误码可以重试
        if (errorCode != null) {
            switch (errorCode) {
                case "InternalError":
                case "ServiceUnavailable":
                case "RequestExpired":
                case "Throttling":
                    return true;
                default:
                    return false;
            }
        }

        return false;
    }

    /**
     * 获取用户友好的错误消息
     * @return 简化的错误描述，适合展示给用户
     */
    public String getUserFriendlyMessage() {
        if (errorCode != null) {
            switch (errorCode) {
                case "InvalidParameter":
                    return "参数错误，请检查输入内容";
                case "InvalidApiKey":
                    return "API密钥无效，请联系管理员";
                case "InsufficientBalance":
                    return "账户余额不足，请联系管理员";
                case "ContentModeration":
                    return "提示词内容不当，请修改后重试";
                case "InternalError":
                    return "服务暂时不可用，请稍后重试";
                case "Throttling":
                    return "请求过于频繁，请稍后重试";
                default:
                    return "生成失败，请稍后重试";
            }
        }

        // 基于HTTP状态码的友好消息
        switch (httpStatus) {
            case 400:
                return "请求参数错误，请检查输入内容";
            case 401:
                return "认证失败，请联系管理员";
            case 403:
                return "权限不足，请联系管理员";
            case 429:
                return "请求过于频繁，请稍后重试";
            case 500:
            case 502:
            case 503:
            case 504:
                return "服务暂时不可用，请稍后重试";
            default:
                return "生成失败，请稍后重试";
        }
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("VolcengineException: ").append(getMessage());

        if (errorCode != null) {
            sb.append(" [Error Code: ").append(errorCode).append("]");
        }

        if (requestId != null) {
            sb.append(" [Request ID: ").append(requestId).append("]");
        }

        if (httpStatus > 0) {
            sb.append(" [HTTP Status: ").append(httpStatus).append("]");
        }

        return sb.toString();
    }
}

