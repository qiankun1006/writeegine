
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
