package com.example.writemyself.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Date;

/**
 * 错误处理控制器
 * 处理自定义的/handle-error请求，提供用户友好的错误页面
 */
@Controller
public class ErrorHandlingController {

    /**
     * 处理错误请求
     *
     * @param request HTTP请求对象
     * @param model Spring Model对象，用于向模板传递数据
     * @return 返回error视图名称
     */
    @RequestMapping("/handle-error")
    public String handleError(HttpServletRequest request, Model model) {
        // 获取HTTP状态码
        Integer statusCode = (Integer) request.getAttribute("javax.servlet.error.status_code");

        // 获取异常信息
        Throwable throwable = (Throwable) request.getAttribute("javax.servlet.error.exception");
        String errorMessage = (String) request.getAttribute("javax.servlet.error.message");

        // 获取请求的路径
        String requestPath = (String) request.getAttribute("javax.servlet.error.request_uri");

        // 向模型添加属性
        model.addAttribute("status", statusCode != null ? statusCode : 500);
        model.addAttribute("error", getErrorTitle(statusCode));
        model.addAttribute("message", errorMessage != null ? errorMessage : "请求处理过程中出现了一个错误");
        model.addAttribute("timestamp", new Date());

        return "error";
    }

    /**
     * 根据HTTP状态码获取对应的错误标题
     *
     * @param statusCode HTTP状态码
     * @return 错误标题文本
     */
    private String getErrorTitle(Integer statusCode) {
        if (statusCode == null) {
            return "服务器错误";
        }

        switch (statusCode) {
            case 400:
                return "请求错误";
            case 401:
                return "未授权";
            case 403:
                return "禁止访问";
            case 404:
                return "页面不存在";
            case 500:
                return "服务器内部错误";
            case 502:
                return "网关错误";
            case 503:
                return "服务不可用";
            default:
                return "发生错误";
        }
    }
}

