# Debugging Experience: Tilemap Editor JavaScript Loading Issue

## Problem Statement
调试 Tilemap 编辑器时花费大量时间排查 JavaScript 方法无响应的问题。

## Root Cause Analysis

### 主要问题
Thymeleaf Layout Dialect 对 `layout:fragment` 内的 `<script>` 标签进行了过滤，导致脚本代码无法执行。

### 发现过程
1. 页面正常加载，HTML 元素都存在
2. 点击图块时没有任何响应
3. 浏览器控制台没有 JavaScript 错误
4. 推测：脚本可能没有被执行

### 验证方法
- 创建诊断面板，显示脚本执行状态
- 检查浏览器 Network 标签，确认 JS 文件是否被加载
- 在不同位置放置测试代码，观察哪些能执行，哪些不能

## 错误的做法 ❌

### 方案1：在 fragment 内写内联 script
```html
<div layout:fragment="content">
    <canvas id="tilemap-canvas"></canvas>
    <script>
        const editor = new TilemapEditor();  // ❌ 不会执行
    </script>
</div>
```
**结果：** 脚本被 Thymeleaf Layout Dialect 过滤剥离

### 方案2：在 fragment 后面写 script
```html
<div layout:fragment="content">
    <!-- 内容 -->
</div>

<script>
    // ⚠️ 处理不确定，不推荐
    const editor = new TilemapEditor();
</script>
```
**问题：** Layout Dialect 的处理方式不明确，可能有版本差异

## 验证可行的做法 ✅

### 最终方案：在 layout.html 末尾加载外部 JS
```html
<!-- layout.html -->
<body>
    <header><!-- ... --></header>
    <main>
        <div layout:fragment="content">
            <!-- 子页面内容 -->
        </div>
    </main>
    <footer><!-- ... --></footer>

    <!-- ✅ 在这里加载外部 JS 文件 -->
    <script src="/static/js/tilemap-editor.js"></script>
</body>
```

**优点：**
- 绝对不会被 Thymeleaf 过滤
- 所有使用该 layout 的页面都会自动加载
- 外部文件易于维护和缓存
- 生产环境友好

## 调试工具和技巧

### 诊断面板
创建临时的诊断面板查看脚本执行状态：
```javascript
function updateDiagnostic(text) {
    const panel = document.getElementById('diagnostic-content');
    if (panel) {
        panel.innerHTML += text + '<br>';
        panel.scrollTop = panel.scrollHeight;
    }
}
```

### 检查清单
- [ ] 检查浏览器控制台是否有 JS 错误
- [ ] 检查 Network 标签，JS 文件是否被加载（HTTP 200）
- [ ] 检查脚本是否在正确的位置（fragment 外部）
- [ ] 使用 `console.log` 确认代码是否被执行
- [ ] 不要假设代码"看起来没问题"就一定执行了

## 关键发现

### 1. Thymeleaf Layout Dialect 的处理流程
- Layout Dialect 会将 fragment 内容替换到 layout 模板中
- **在这个过程中，fragment 内的 `<script>` 标签会被过滤**
- Fragment 外的脚本处理方式不明确（版本依赖）

### 2. 外部 JS vs 内联脚本
| 方案 | 位置 | 结果 | 推荐度 |
|------|------|------|--------|
| 内联脚本 | fragment 内 | ❌ 被过滤 | ✗ 不推荐 |
| 内联脚本 | fragment 外 | ⚠️ 不确定 | ⚠️ 不推荐 |
| **外部 JS** | **layout.html** | **✅ 稳定** | **✅ 推荐** |

### 3. 调试时间浪费的原因
- 代码"看起来"正确，但因为被 Thymeleaf 过滤而无法执行
- 浏览器没有给出清晰的错误提示
- 需要系统化的调试方法才能发现真正原因

## 代码清理清单

调试完成后，务必进行以下清理：

- [ ] 删除诊断面板代码和 HTML
- [ ] 删除所有临时测试按钮
- [ ] 移除所有 `console.log` 调试语句
- [ ] 删除临时的诊断 JS 文件
- [ ] 删除旧的、不用的 JS 文件（如 `tile-map-editor.js`）
- [ ] 统一 JS 文件命名规范
- [ ] 不要将调试代码提交到主分支

## 后续改进建议

1. **在项目初期明确规范**
   - 明确 Thymeleaf Layout 的使用规范
   - 在 README 中文档化 JS 加载规则

2. **完善调试工具**
   - 添加开发环境诊断面板
   - 自动化检查脚本加载状态

3. **代码审查**
   - 检查 JS 加载方式是否符合规范
   - 确保没有遗留调试代码

