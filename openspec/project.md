# Project Context

## Purpose
[Describe your project's purpose and goals]

## Tech Stack
- [List your primary technologies]
- [e.g., TypeScript, React, Node.js]

## Project Conventions

### Code Style
[Describe your code style preferences, formatting rules, and naming conventions]

### Architecture Patterns
[Document your architectural decisions and patterns]

### Testing Strategy
[Explain your testing approach and requirements]

### Git Workflow
[Describe your branching strategy and commit conventions]

## Domain Context
[Add domain-specific knowledge that AI assistants need to understand]

## Important Constraints
[List any technical, business, or regulatory constraints]

## External Dependencies
[Document key external services, APIs, or systems]

## Lessons Learned: Thymeleaf Layout Dialect & Script Loading

### Problem
调试 Tilemap 编辑器时花费大量时间排查 JavaScript 方法无响应的问题。

### Root Cause Analysis
**主要问题：Thymeleaf Layout Dialect 对 `<script>` 标签的处理**

当使用 `layout:decorate` 和 `layout:fragment` 时：
- `layout:fragment` 内部的 `<script>` 标签会被 **Thymeleaf Layout Dialect 过滤剥离**
- 只有在 fragment 之外的 script 才会被正确加载和执行
- 即使 script 代码看起来正确，也会因为被过滤而无法执行

### 错误的做法 ❌
```html
<!-- 在 layout:fragment 内部写 script - 会被过滤！ -->
<div layout:fragment="content">
    <canvas id="tilemap-canvas"></canvas>
    <script>
        // 这个脚本不会被执行
        const editor = new TilemapEditor();
    </script>
</div>
```

### 正确的做法 ✅
**方案1：在全局 layout.html 的 body 末尾加载外部 JS**
```html
<!-- layout.html -->
<body>
    <!-- ... -->
    <script src="/static/js/tilemap-editor.js"></script>
</body>
```

**方案2：在 fragment 之外的 script 标签中定义代码**
```html
<div layout:fragment="content">
    <!-- fragment 内容 -->
</div>

<!-- 这个位置的 script 会被执行 -->
<script>
    document.addEventListener('DOMContentLoaded', () => {
        window.editor = new TilemapEditor();
    });
</script>
```

### Key Findings

1. **Thymeleaf 版本差异**
   - 不同版本的 Thymeleaf Layout Dialect 处理方式可能不同
   - 应该在项目 `pom.xml` 中明确指定版本

2. **调试诊断面板的作用**
   - 创建临时的诊断面板有助于排查脚本加载问题
   - 但不应该在最终代码中保留（生产环境清理掉）

3. **外部 JS 文件 vs 内联脚本**
   - 优先使用外部 JS 文件：更易维护、更易调试、避免 Thymeleaf 过滤问题
   - 内联脚本容易被模板引擎过滤，不推荐在 fragment 内使用

### Best Practices for This Project

1. **JS 脚本加载规范**
   - ✅ 使用外部 JS 文件，在 `layout.html` 的 `<body>` 末尾全局加载
   - ✅ 避免在 `layout:fragment` 内部写 `<script>` 标签
   - ✅ 如果必须用内联脚本，放在 fragment 之外

2. **调试过程**
   - 检查浏览器控制台是否有 JS 错误
   - 检查 Network 标签确认 JS 文件是否被正确加载
   - 使用诊断面板或 console 日志进行逐步排查
   - 不要假设代码"看起来没问题"就一定执行了

3. **代码清理**
   - 调试完成后务必移除所有诊断代码和 console.log
   - 临时的诊断 UI（如诊断面板）应该删除
   - 不要将调试代码提交到主分支

4. **文件组织**
   - JS 文件命名应该清晰：`tilemap-editor.js` 而不是 `tile-map-editor.js`
   - 移除所有旧的或冗余文件
   - 保持 `static/js/` 目录整洁

### Related Configuration
- Spring Boot + Thymeleaf 版本在 `pom.xml` 中配置
- 全局 JS 脚本加载在 `src/main/resources/templates/layout.html` 中配置
