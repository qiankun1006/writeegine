
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

---

## UI 参数控件的 Hover 提示最佳实践

### 设计原则
在为用户提供可调整参数的功能时，**所有参数都应该在 hover 时显示详细的中文说明**，让用户快速理解每个参数的功能、推荐值和调整效果。

### 实现方式

#### 1. 在生成参数控件时添加 title 属性 ✅
```javascript
function updateToolOptions(tool) {
  // 参数说明字典（必须包含所有可调参数）
  const paramHints = {
    radiusX: '椭圆的水平半径，单位像素',
    radiusY: '椭圆的垂直半径，单位像素',
    feather: '边缘羽化（模糊）的宽度，值越大边缘越柔和',
    opacity: '阴影的透明度，0=完全透明，1=完全不透明，推荐0.6-0.8',
    hardness: '阴影中心的硬度，0=完全羽化，1=硬边界，推荐0.3',
    color: '阴影的颜色，支持任意RGB色彩',
  };

  if (tool && tool.options) {
    Object.entries(tool.options).forEach(([key, value]) => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'tool-option';
      optionDiv.title = paramHints[key] || '';  // ← 容器也要有 title

      // 为标签和输入框都添加 title
      optionDiv.innerHTML = `
        <label title="${paramHints[key] || ''}">${key}:</label>
        <input ... title="${paramHints[key] || ''}" />
      `;

      optionsContainer.appendChild(optionDiv);
    });
  }
}
```

#### 2. 参数说明规范

| 参数类型 | 说明要素 | 示例 |
|---------|---------|------|
| 数值范围参数 | 单位、范围、推荐值 | "边缘模糊宽度，单位像素，推荐 20-50" |
| 百分比参数 | 最小值含义、最大值含义、推荐值 | "透明度：0=完全透明，1=完全不透明，推荐 0.6-0.8" |
| 颜色参数 | 用途说明、支持的格式 | "阴影颜色，支持任意 RGB 色彩" |
| 开关参数 | 打开/关闭时的效果 | "启用网格：打开时显示参考网格，关闭时隐藏" |

#### 3. CSS 样式优化
```css
.tool-option label {
  cursor: help;  /* 用户悬停时提示这是可交互的 */
}

.tool-option label:hover {
  text-decoration: underline;  /* 下划线提示有 hover 信息 */
}
```

#### 4. 参数范围的正确性检查清单
- [ ] 所有参数都有对应的 `paramHints` 说明
- [ ] 说明文字简洁明了（控制在 50 字以内）
- [ ] 说明中包含单位（像素、百分比、度数等）
- [ ] 为数值参数提供推荐范围
- [ ] 标签和输入框都有 `title` 属性

### 范例：ShadowCircleTool 阴影工具参数说明
```javascript
const paramHints = {
  radiusX: '椭圆的水平半径，单位像素',
  radiusY: '椭圆的垂直半径，单位像素',
  feather: '边缘羽化（模糊）的宽度，值越大边缘越柔和',
  opacity: '阴影的透明度，0=完全透明，1=完全不透明，推荐0.6-0.8',
  hardness: '阴影中心的硬度，0=完全羽化（只有边缘），1=硬边界（中心完全不透明），推荐0.3',
  color: '阴影的颜色，支持任意RGB色彩',
};
```

### 后续功能开发指南
**新增功能时的检查清单：**
1. 为所有可调参数创建对应的 `paramHints`
2. 在生成 HTML 时为标签和输入框都添加 `title` 属性
3. 参数说明要清晰易懂，包含单位和推荐值
4. 测试 hover 效果是否正常显示
