# 错误处理系统设计

## 概述
为应用添加自定义的全局错误处理机制，替代Spring Boot的默认Whitelabel Error Page。系统包括配置、错误页面、控制器和全局异常处理器。

## 配置调整

### application.properties
```properties
# 错误处理配置
server.error.whitelabel.enabled=false  # 禁用Whitelabel错误页面
server.error.path=/error               # 错误处理路径
server.error.include-message=always    # 始终包含错误消息
server.error.include-binding-errors=always # 包含绑定错误
server.error.include-stacktrace=on_param   # 仅在请求参数时显示堆栈跟踪
server.error.include-exception=false      # 不显示异常类型
```

## 错误页面设计

### error.html模板
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
      layout:decorate="~{layout}">
<head>
    <title>错误页面</title>
    <style>
        .error-container {
            max-width: 600px;
            margin: 50px auto;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 8px;
            text-align: center;
        }
        .error-code {
            font-size: 72px;
            font-weight: bold;
            color: #e74c3c;
            margin: 20px 0;
        }
        .error-message {
            font-size: 24px;
            color: #2c3e50;
            margin: 20px 0;
        }
        .error-description {
            font-size: 16px;
            color: #7f8c8d;
            margin: 20px 0;
        }
        .error-timestamp {
            font-size: 12px;
            color: #95a5a6;
            margin-top: 20px;
        }
        .action-buttons {
            margin-top: 30px;
        }
        .btn-home {
            display: inline-block;
            padding: 10px 20px;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 0 10px;
        }
        .btn-home:hover {
            background: #2980b9;
        }
    </style>
</head>
<body>
    <div layout:fragment="content">
        <div class="error-container">
            <div class="error-code" th:text="${status}">500</div>
            <div class="error-message" th:text="${error}">出错了</div>
            <div class="error-description" th:text="${message}">
                请求处理过程中出现了一个错误
            </div>

            <div class="action-buttons">
                <a href="/" class="btn-home">返回首页</a>
            </div>

            <div class="error-timestamp">
                <p th:if="${timestamp}">
                    时间: <span th:text="${#temporals.format(timestamp, 'yyyy-MM-dd HH:mm:ss')}"></span>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
```

## 错误处理控制器

### ErrorController.java
```java
package com.example.writemyself.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request, Model model) {
        // 获取HTTP状态码
        Integer statusCode = (Integer) request.getAttribute("javax.servlet.error.status_code");

        // 获取异常信息
        Throwable throwable = (Throwable) request.getAttribute("javax.servlet.error.exception");
        String errorMessage = (String) request.getAttribute("javax.servlet.error.message");

        // 向模型添加属性
        model.addAttribute("status", statusCode != null ? statusCode : 500);
        model.addAttribute("error", getErrorTitle(statusCode));
        model.addAttribute("message", errorMessage != null ? errorMessage : "请求处理过程中出现了一个错误");
        model.addAttribute("timestamp", new java.util.Date());

        return "error";
    }

    /**
     * 根据状态码获取错误标题
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

    public String getErrorPath() {
        return "/error";
    }
}
```

## 全局异常处理器

### GlobalExceptionHandler.java
```java
package com.example.writemyself.controller;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;

@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理所有未被捕获的异常
     */
    @ExceptionHandler(Exception.class)
    public ModelAndView handleException(Exception ex) {
        ModelAndView mav = new ModelAndView("error");

        mav.addObject("status", 500);
        mav.addObject("error", "服务器错误");
        mav.addObject("message", ex.getMessage() != null ? ex.getMessage() : "应用处理请求时发生错误");
        mav.addObject("timestamp", new java.util.Date());

        return mav;
    }

    /**
     * 处理空指针异常
     */
    @ExceptionHandler(NullPointerException.class)
    public ModelAndView handleNullPointerException(NullPointerException ex) {
        ModelAndView mav = new ModelAndView("error");

        mav.addObject("status", 500);
        mav.addObject("error", "服务器错误");
        mav.addObject("message", "处理请求时发生了一个内部错误");
        mav.addObject("timestamp", new java.util.Date());

        return mav;
    }
}
```

## 实现要点

1. **配置禁用Whitelabel页面**
   - 设置`server.error.whitelabel.enabled=false`
   - 配置错误消息和堆栈跟踪显示选项

2. **创建自定义错误页面**
   - 使用Thymeleaf模板继承现有布局
   - 显示HTTP状态码、错误消息、时间戳
   - 提供友好的用户交互(返回首页按钮)

3. **实现错误控制器**
   - 实现Spring Boot的ErrorController接口
   - 处理/error请求并返回错误页面
   - 根据状态码返回对应的错误标题

4. **添加全局异常处理**
   - 使用@ControllerAdvice处理应用级异常
   - 捕获通用异常和特定异常类型
   - 返回一致的错误响应

## 错误类型覆盖

系统将处理以下错误情况：
- **404错误**: 用户请求的页面不存在
- **500错误**: 服务器内部错误
- **NullPointerException**: 空指针异常
- **通用异常**: 所有未处理的异常

