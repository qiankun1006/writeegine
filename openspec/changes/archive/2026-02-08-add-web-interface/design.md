## Context
当前项目是一个基于Spring Boot 4.0.1的Java后端应用，仅提供REST API能力，缺少用户界面。用户希望添加网页功能，实现前后端不分离的Web应用，以便通过浏览器直接访问系统。

## Goals / Non-Goals
### Goals
- 添加服务器端渲染的Web界面，支持HTML页面
- 使用Thymeleaf作为模板引擎，实现动态内容渲染
- 提供基础的CSS和JavaScript静态资源支持
- 创建示例首页展示Web界面功能
- 保持简单易维护的代码结构

### Non-Goals
- 不实现复杂的前端框架（如React、Vue）
- 不提供前后端分离的架构
- 不实现用户认证和授权（可在后续变更中添加）
- 不进行大规模的前端性能优化

## Decisions
### Decision: 使用Thymeleaf作为模板引擎
**What**: 选择Thymeleaf而非其他模板引擎（如FreeMarker、JSP）
**Why**: Thymeleaf是Spring Boot官方推荐的模板引擎，与Spring MVC集成良好，支持自然模板（纯HTML），易于学习和调试。对于前后端不分离的应用，Thymeleaf提供良好的服务器端渲染能力。

### Decision: 保持简单的目录结构
**What**: 按照Spring Boot约定组织模板和静态资源
**Why**: 遵循Spring Boot的默认配置可以减少配置复杂度，提高可维护性。
- 模板文件放置于 `src/main/resources/templates/`
- 静态资源放置于 `src/main/resources/static/`
- CSS、JS、图片分别存放在 `static/css/`、`static/js/`、`static/images/`

### Decision: 创建基础布局模板
**What**: 使用Thymeleaf的布局方言（Layout Dialect）或简单的片段包含
**Why**: 提供一致的页面布局，减少重复代码。由于项目简单，暂不引入额外的布局依赖，使用Thymeleaf内置的片段功能。

### Decision: 不引入Node.js构建工具
**What**: 直接使用原生CSS和JavaScript，不引入Webpack、Vite等构建工具
**Why**: 项目规模小，前端复杂度低，避免增加构建复杂性。未来如果需要，可以单独引入。

## 详细代码设计

### 1. 依赖配置（pom.xml）
```xml
<!-- 添加Thymeleaf依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

### 2. 应用配置（application.properties）
```properties
# Thymeleaf配置
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html
spring.thymeleaf.mode=HTML
spring.thymeleaf.encoding=UTF-8
spring.thymeleaf.servlet.content-type=text/html
spring.thymeleaf.cache=false  # 开发环境关闭缓存

# 静态资源映射
spring.mvc.static-path-pattern=/static/**
spring.web.resources.static-locations=classpath:/static/
```

### 3. 控制器设计（HomeController.java）
```java
package com.example.writemyself.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("title", "WriteMyself - 首页");
        model.addAttribute("message", "欢迎使用WriteMyself系统");
        return "index";
    }

    @GetMapping("/about")
    public String about(Model model) {
        model.addAttribute("title", "关于我们");
        return "about";
    }
}
```

### 4. 基础布局模板（templates/layout.html）
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title th:text="${title}">WriteMyself</title>
    <link rel="stylesheet" th:href="@{/static/css/style.css}">
    <link rel="icon" th:href="@{/static/images/favicon.ico}" type="image/x-icon">
</head>
<body>
    <header>
        <nav>
            <a th:href="@{/}">首页</a>
            <a th:href="@{/about}">关于</a>
        </nav>
    </header>

    <main>
        <div th:replace="${content} ?: ~{::content}">
            <!-- 默认内容区域，被子模板覆盖 -->
            <section layout:fragment="content">
                <p>默认内容</p>
            </section>
        </div>
    </main>

    <footer>
        <p>&copy; 2025 WriteMyself. All rights reserved.</p>
    </footer>

    <script th:src="@{/static/js/main.js}"></script>
</body>
</html>
```

### 5. 首页模板（templates/index.html）
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
      layout:decorate="~{layout}">
<head>
    <title layout:title-pattern="$CONTENT_TITLE - $LAYOUT_TITLE">首页</title>
</head>
<body>
    <div layout:fragment="content">
        <h1 th:text="${message}">欢迎消息</h1>
        <p>这是一个使用Spring Boot和Thymeleaf构建的前后端不分离Web应用示例。</p>

        <section>
            <h2>功能特性</h2>
            <ul>
                <li>服务器端渲染HTML</li>
                <li>响应式设计</li>
                <li>静态资源支持</li>
                <li>易于扩展</li>
            </ul>
        </section>

        <section>
            <h2>快速开始</h2>
            <p>编辑 <code>src/main/resources/templates/</code> 中的HTML文件来修改页面内容。</p>
        </section>
    </div>
</body>
</html>
```

### 6. 静态资源示例
**CSS文件 (static/css/style.css):**
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    background: #f8f9fa;
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
}

nav a {
    margin-right: 1rem;
    text-decoration: none;
    color: #007bff;
}

nav a:hover {
    text-decoration: underline;
}

main {
    padding: 2rem 0;
}

footer {
    margin-top: 2rem;
    padding: 1rem;
    border-top: 1px solid #dee2e6;
    text-align: center;
    color: #6c757d;
}
```

**JavaScript文件 (static/js/main.js):**
```javascript
// 简单的交互示例
document.addEventListener('DOMContentLoaded', function() {
    console.log('WriteMyself Web界面已加载');

    // 示例：为所有段落添加点击事件
    const paragraphs = document.querySelectorAll('p');
    paragraphs.forEach(p => {
        p.addEventListener('click', function() {
            this.style.color = this.style.color === 'blue' ? '' : 'blue';
        });
    });
});
```

## Risks / Trade-offs
- **风险**: Thymeleaf学习曲线可能影响开发速度
  - **缓解**: 提供详细的代码示例和文档
- **风险**: 前后端不分离可能导致前端代码与Java代码耦合
  - **缓解**: 保持模板简洁，逻辑尽量放在控制器中
- **权衡**: 不使用现代前端框架可能限制复杂交互实现
  - **接受**: 项目初期不需要复杂前端交互，未来可逐步演进

## Open Questions
1. 是否需要支持多语言国际化？
2. 是否需要添加错误页面模板（404, 500等）？
3. 是否需要在模板中添加用户会话支持？

