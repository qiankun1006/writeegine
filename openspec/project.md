
## Thymeleaf Layout Dialect: Script Loading Rule

### 已验证的事实
- `layout:fragment` 内部的 `<script>` 标签会被 Thymeleaf Layout Dialect 过滤剥离，代码不会执行
- 在 `layout.html` 的 `<body>` 末尾加载外部 JS 文件是稳定可靠的方案

### 推荐做法 ✅
```html
<!-- layout.html -->
<script src="/static/js/tilemap-editor.js"></script>
```

所有使用该 layout 的页面都会自动加载脚本。

### 禁止做法 ❌
```html
<!-- ❌ 不要在 fragment 内写 script，会被过滤 -->
<div layout:fragment="content">
    <script>
        // 不会执行
    </script>
</div>
```

---

## Spring Boot 静态资源路径配置

### 配置说明
在 `application.properties` 中配置的静态资源路径模式：

```properties
# 静态资源必须通过 /static/** 路径访问
spring.mvc.static-path-pattern=/static/**
spring.web.resources.static-locations=classpath:/static/
```

### 已验证的事实
- 静态资源（CSS、JS、图片等）必须使用 `/static/**` 前缀才能访问
- 直接使用 `/css/**` 或 `/js/**` 路径会导致 500 错误
- 其他 HTML 文件使用 `/static/` 前缀（如 `create-game-unity.html`）是正确的

### 推荐做法 ✅
```html
<!-- Thymeleaf 模板中引用静态资源 -->
<link rel="stylesheet" th:href="@{/static/css/game-portal.css}">
<script th:src="@{/static/js/game-portal.js}"></script>
```

### 常见错误 ❌
```html
<!-- ❌ 错误：缺少 /static 前缀 -->
<link rel="stylesheet" th:href="@{/css/game-portal.css}">
<script th:src="@{/js/game-portal.js}"></script>
```

### 错误现象
- 浏览器控制台显示：`GET http://localhost:8083/css/game-portal.css 500 (Internal Server Error)`
- 页面样式和脚本无法加载，导致页面显示异常或功能失效

### 解决方案
确保所有静态资源引用都使用正确的 `/static/` 前缀，与 `application.properties` 中的配置保持一致。
