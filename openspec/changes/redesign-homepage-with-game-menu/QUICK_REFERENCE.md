# 快速参考指南：游戏创作平台门户

## 🚀 快速开始

### 查看页面
```
首页：        http://localhost:8080/
创作游戏：    http://localhost:8080/create-game
我的游戏：    http://localhost:8080/my-games
游戏广场：    http://localhost:8080/game-plaza
```

### 新增路由
| URL | 文件 | 功能 |
|-----|------|------|
| `/` | `index.html` | 游戏创作平台首页门户 |
| `/create-game` | `create-game.html` | 创建/编辑游戏 |
| `/my-games` | `my-games.html` | 我的游戏列表 |
| `/game-plaza` | `game-plaza.html` | 游戏发现广场 |

---

## 📁 文件结构速查

### 新增页面 (4个)
```
src/main/resources/templates/
├── index.html                    ← 首页
├── create-game.html              ← 创作页面（嵌入编辑器）
├── my-games.html                 ← 游戏列表
└── game-plaza.html               ← 游戏广场
```

### 新增样式 (6个)
```
src/main/resources/static/css/
├── theme.css                     ← 全局主题（重要）
├── homepage.css                  ← 首页
├── game-creation.css             ← 创作页面
├── game-management.css           ← 游戏列表
└── game-plaza.css                ← 游戏广场
```

### 新增脚本 (4个)
```
src/main/resources/static/js/
├── homepage.js                   ← 首页交互
├── game-creation.js              ← 创作页面交互
├── game-management.js            ← 游戏列表交互
└── game-plaza.js                 ← 游戏广场交互
```

---

## 🎨 主题 CSS 变量

### 在你的 CSS 中使用
```css
/* 背景颜色 */
var(--bg-primary)                /* 深色背景 #0f1419 */
var(--bg-secondary)              /* 次要背景 #1a1f2e */

/* 主色调 */
var(--color-primary)             /* 亮蓝色 #00d4ff */
var(--color-primary-dark)        /* 深蓝色 #0099cc */

/* 文字颜色 */
var(--text-primary)              /* 主文字 #e8e9ea */
var(--text-secondary)            /* 次要文字 #a0a1a2 */

/* 其他 */
var(--border-primary)            /* 边框颜色 */
var(--shadow-md)                 /* 中等阴影 */
var(--radius-md)                 /* 中等圆角 */
```

### 完整变量列表
参考 `src/main/resources/static/css/theme.css` 第 1-60 行

---

## 🔗 编辑器集成

### 在页面中嵌入编辑器
```html
<div th:replace="~{tilemap-editor :: content}"></div>
```

### 所需的后端数据
```java
model.addAttribute("tileImages", List<String>);  // 图块图片列表
model.addAttribute("tileNames", List<String>);   // 图块名称列表
```

### 示例 (HomeController.java)
```java
@GetMapping("/create-game")
public String createGame(Model model) {
    List<String> tileImages = new ArrayList<>(Arrays.asList(
        "brown.png", "green.png", "green2.png", ...
    ));
    List<String> tileNames = new ArrayList<>(Arrays.asList(
        "棕色地块", "绿色地块", "绿色地块2", ...
    ));
    model.addAttribute("tileImages", tileImages);
    model.addAttribute("tileNames", tileNames);
    return "create-game";
}
```

---

## 🎯 响应式设计

### 断点
```css
/* 默认：桌面 */
@media (max-width: 768px) {
    /* 平板 & 手机 */
}
```

### 常见调整
- 菜单 → 单列
- 网格 → 响应列数
- 按钮 → 全宽

---

## ⚙️ JavaScript 交互

### 首页 (homepage.js)
```javascript
// 卡片点击导航
class HomePage { }
```

### 创作页面 (game-creation.js)
```javascript
// 保存/发布/取消按钮
class GameCreation { }
```

### 游戏列表 (game-management.js)
```javascript
// 删除确认
class GameManagement { }
```

### 游戏广场 (game-plaza.js)
```javascript
// 搜索 & 筛选
class GamePlaza { }
```

---

## 🔧 常见修改

### 修改首页标题
`index.html` 第 51 行
```html
<h2>欢迎来到游戏创作平台</h2>
```

### 修改菜单卡片
`index.html` 第 80-107 行
```html
<div class="menu-card">
    <div class="card-icon">🎮</div>
    <h3>创作游戏</h3>
    <p>描述</p>
    <a href="/create-game" class="card-button btn-primary">按钮</a>
</div>
```

### 修改主色调
`theme.css` 第 10-11 行
```css
--color-primary: #00d4ff;        /* 改这个 */
--color-primary-dark: #0099cc;   /* 改这个 */
```

### 修改响应式断点
`*.css` 中搜索 `@media (max-width: 768px)`

---

## 🐛 调试技巧

### 检查路由是否正确
```
浏览器打开 -> F12 -> Network -> 检查路由响应
```

### 检查样式是否加载
```
浏览器打开 -> F12 -> Elements -> 检查 CSS 变量
```

### 检查 JavaScript 错误
```
浏览器打开 -> F12 -> Console -> 查看错误日志
```

---

## 📋 后续任务检查表

- [ ] 集成数据库（Game 实体 + Repository + Service）
- [ ] 实现用户认证（Authentication）
- [ ] 连接保存/发布 API
- [ ] 实现游戏搜索后端
- [ ] 添加用户头像
- [ ] 实现游戏统计
- [ ] 添加通知系统
- [ ] 优化编辑器性能

---

## 📞 需要帮助？

### 常见问题

**Q: 编辑器不显示？**
A: 检查 `tileImages` 和 `tileNames` 是否正确传递

**Q: 样式不对？**
A: 检查 `theme.css` 是否在 `layout.html` 中引入

**Q: 路由 404？**
A: 检查 `HomeController` 中的路由定义

**Q: JavaScript 不工作？**
A: 检查浏览器 console 是否有错误

---

## 📚 相关文档

- 完整设计：`design.md`
- 项目提案：`proposal.md`
- 任务清单：`tasks.md`（已完成）
- 验收报告：`ACCEPTANCE_REPORT.md`
- 实施总结：`IMPLEMENTATION_SUMMARY.md`

---

**最后更新：2026年2月15日**

