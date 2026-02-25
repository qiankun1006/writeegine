# 设计文档：游戏创作平台门户

## 1. 架构设计

### 1.1 页面结构
```
WriteMyself 游戏创作平台
├── 顶部导航栏
│   ├── Logo + 品牌名
│   └── 用户菜单 (登录/个人中心)
│
├── 主体内容区
│   ├── 标题区
│   │   ├── 欢迎文字
│   │   └── 平台简介
│   │
│   ├── 功能菜单卡片（3列网格）
│   │   ├── 创作游戏卡片
│   │   │   ├── 图标
│   │   │   ├── 标题
│   │   │   ├── 描述
│   │   │   └── CTA按钮
│   │   ├── 我的游戏卡片
│   │   └── 游戏广场卡片
│   │
│   └── 页脚
│       └── 版权信息
```

### 1.2 路由设计
```
/                          → 首页门户 (index.html)
/create-game               → 创作游戏页面 (create-game.html)
  └── /tilemap-editor     → 嵌入在 create-game 中的编辑器
/my-games                  → 我的游戏列表 (my-games.html)
/game-plaza                → 游戏广场 (game-plaza.html)
```

## 2. 前端设计

### 2.1 首页 (index.html) 设计

使用深色科技感主题（与Tilemap编辑器统一）：

```html
<!DOCTYPE html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
      layout:decorate="~{layout}">
<head>
    <title>WriteMyself - 游戏创作平台</title>
    <link rel="stylesheet" th:href="@{/static/css/homepage.css}">
</head>
<body>
    <div layout:fragment="content">
        <!-- 顶部导航 -->
        <nav class="homepage-nav">
            <div class="nav-container">
                <div class="nav-brand">
                    <h1>✨ WriteMyself</h1>
                    <p>游戏创作平台</p>
                </div>
                <div class="nav-links">
                    <a href="/" class="nav-link active">首页</a>
                    <a href="/my-games" class="nav-link">我的游戏</a>
                    <a href="/game-plaza" class="nav-link">游戏广场</a>
                </div>
            </div>
        </nav>

        <!-- 主体内容 -->
        <div class="homepage-hero">
            <h2>欢迎来到游戏创作平台</h2>
            <p>使用直观的Tilemap编辑器创作属于你的游戏</p>
        </div>

        <!-- 功能菜单卡片 -->
        <div class="menu-grid">
            <!-- 创作游戏卡片 -->
            <div class="menu-card">
                <div class="card-icon">🎮</div>
                <h3>创作游戏</h3>
                <p>使用强大的Tilemap编辑器，快速创建和编辑游戏地图</p>
                <a href="/create-game" class="card-button btn-primary">
                    开始创作 →
                </a>
            </div>

            <!-- 我的游戏卡片 -->
            <div class="menu-card">
                <div class="card-icon">📚</div>
                <h3>我的游戏</h3>
                <p>查看和管理你创建的所有游戏项目</p>
                <a href="/my-games" class="card-button btn-secondary">
                    查看游戏 →
                </a>
            </div>

            <!-- 游戏广场卡片 -->
            <div class="menu-card">
                <div class="card-icon">🌟</div>
                <h3>游戏广场</h3>
                <p>发现和体验社区创意工作者的游戏作品</p>
                <a href="/game-plaza" class="card-button btn-secondary">
                    浏览广场 →
                </a>
            </div>
        </div>

        <!-- 页脚 -->
        <footer class="homepage-footer">
            <p>© 2026 WriteMyself. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
```

### 2.2 CSS 样式 (homepage.css)

```css
/* 颜色变量 - 与编辑器主题统一 */
:root {
    --bg-primary: #0f1419;
    --bg-secondary: #1a1f2e;
    --color-primary: #00d4ff;
    --color-primary-dark: #0099cc;
    --text-primary: #e8e9ea;
    --text-secondary: #a0a1a2;
}

/* 顶部导航 */
.homepage-nav {
    background: rgba(26, 31, 46, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 212, 255, 0.1);
    padding: 20px 0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-brand h1 {
    margin: 0;
    font-size: 24px;
    color: var(--color-primary);
    font-weight: 600;
}

.nav-brand p {
    margin: 0;
    font-size: 12px;
    color: var(--text-secondary);
}

.nav-links {
    display: flex;
    gap: 30px;
}

.nav-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 14px;
    transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
    color: var(--color-primary);
}

/* 英雄区 */
.homepage-hero {
    text-align: center;
    padding: 80px 30px;
    background: linear-gradient(135deg,
        rgba(0, 212, 255, 0.05) 0%,
        rgba(0, 212, 255, 0.02) 100%);
}

.homepage-hero h2 {
    font-size: 48px;
    color: var(--color-primary);
    margin: 0 0 20px 0;
    font-weight: 700;
}

.homepage-hero p {
    font-size: 18px;
    color: var(--text-secondary);
    margin: 0;
}

/* 菜单网格 */
.menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 30px;
    max-width: 1400px;
    margin: 60px auto;
    padding: 0 30px;
}

/* 菜单卡片 */
.menu-card {
    background: rgba(26, 31, 46, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 212, 255, 0.1);
    border-radius: 12px;
    padding: 40px 30px;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
}

.menu-card:hover {
    background: rgba(26, 31, 46, 0.8);
    border-color: rgba(0, 212, 255, 0.3);
    transform: translateY(-5px);
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.1);
}

.card-icon {
    font-size: 48px;
    margin-bottom: 20px;
    display: block;
}

.menu-card h3 {
    font-size: 24px;
    color: var(--color-primary);
    margin: 0 0 15px 0;
    font-weight: 600;
}

.menu-card p {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0 0 25px 0;
    line-height: 1.6;
}

/* 按钮 */
.card-button {
    display: inline-block;
    padding: 12px 30px;
    border-radius: 6px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
}

.btn-primary {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);
}

.btn-primary:hover {
    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
    transform: translateY(-2px);
}

.btn-secondary {
    background: rgba(0, 212, 255, 0.1);
    color: var(--color-primary);
    border: 1px solid rgba(0, 212, 255, 0.3);
}

.btn-secondary:hover {
    background: rgba(0, 212, 255, 0.2);
    border-color: rgba(0, 212, 255, 0.6);
}

/* 页脚 */
.homepage-footer {
    text-align: center;
    padding: 40px 30px;
    border-top: 1px solid rgba(0, 212, 255, 0.1);
    color: var(--text-secondary);
    font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .homepage-hero h2 {
        font-size: 36px;
    }

    .homepage-hero p {
        font-size: 16px;
    }

    .menu-grid {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 0 20px;
    }

    .menu-card {
        padding: 30px 20px;
    }

    .nav-container {
        flex-direction: column;
        gap: 20px;
        padding: 0 20px;
    }

    .nav-links {
        gap: 15px;
    }
}
```

### 2.3 JavaScript 增强 (homepage.js - 可选)

```javascript
/**
 * 首页交互增强
 */
class HomePage {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.trackPageView();
    }

    bindEvents() {
        // 菜单卡片点击事件
        const cards = document.querySelectorAll('.menu-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-button')) {
                    const link = card.querySelector('.card-button');
                    if (link) {
                        window.location.href = link.href;
                    }
                }
            });
        });
    }

    trackPageView() {
        console.log('用户访问了首页');
        // 后续可以添加统计代码
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
});
```

## 3. 后端设计

### 3.1 创作游戏页面 (create-game.html)

```html
<!DOCTYPE html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
      layout:decorate="~{layout}">
<head>
    <title>创作游戏</title>
    <link rel="stylesheet" th:href="@{/static/css/game-creation.css}">
</head>
<body>
    <div layout:fragment="content">
        <div class="game-creation-wrapper">
            <!-- 页面头部 -->
            <div class="creation-header">
                <h1>创作游戏</h1>
                <a href="/" class="back-button">← 返回首页</a>
            </div>

            <!-- 游戏信息表单 -->
            <div class="game-info-panel">
                <div class="info-group">
                    <label>游戏名称</label>
                    <input type="text" id="game-name" placeholder="输入游戏名称">
                </div>
                <div class="info-group">
                    <label>游戏描述</label>
                    <textarea id="game-description" placeholder="输入游戏描述"></textarea>
                </div>
            </div>

            <!-- Tilemap编辑器容器 -->
            <div class="editor-container">
                <!-- 这里将嵌入 Tilemap 编辑器 -->
                <div th:replace="~{tilemap-editor :: content}"></div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
                <button class="btn btn-save">保存游戏</button>
                <button class="btn btn-publish">发布到广场</button>
                <button class="btn btn-cancel">取消</button>
            </div>
        </div>
    </div>
</body>
</html>
```

### 3.2 我的游戏页面 (my-games.html)

```html
<!DOCTYPE html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
      layout:decorate="~{layout}">
<head>
    <title>我的游戏</title>
    <link rel="stylesheet" th:href="@{/static/css/game-management.css}">
</head>
<body>
    <div layout:fragment="content">
        <div class="my-games-wrapper">
            <h1>我的游戏</h1>

            <!-- 游戏列表 -->
            <div class="games-list">
                <!-- 游戏项将由后端动态渲染 -->
                <div class="game-item" th:each="game : ${games}">
                    <div class="game-thumbnail">
                        <img th:src="${game.thumbnail}" alt="游戏预览">
                    </div>
                    <div class="game-details">
                        <h3 th:text="${game.name}">游戏名称</h3>
                        <p th:text="${game.description}">游戏描述</p>
                        <div class="game-stats">
                            <span>创建于: <span th:text="${#temporals.format(game.createdAt, 'yyyy-MM-dd')}"></span></span>
                            <span>状态: <span th:text="${game.status}"></span></span>
                        </div>
                    </div>
                    <div class="game-actions">
                        <a th:href="@{/create-game/{id}(id=${game.id})}" class="btn-edit">编辑</a>
                        <a th:href="@{/game-plaza/play/{id}(id=${game.id})}" class="btn-play">游玩</a>
                        <button class="btn-delete">删除</button>
                    </div>
                </div>
            </div>

            <!-- 空状态提示 -->
            <div class="empty-state" th:if="${#lists.isEmpty(games)}">
                <p>还没有创建游戏，<a href="/create-game">现在就开始</a></p>
            </div>
        </div>
    </div>
</body>
</html>
```

### 3.3 游戏广场页面 (game-plaza.html)

```html
<!DOCTYPE html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
      layout:decorate="~{layout}">
<head>
    <title>游戏广场</title>
    <link rel="stylesheet" th:href="@{/static/css/game-plaza.css}">
</head>
<body>
    <div layout:fragment="content">
        <div class="plaza-wrapper">
            <h1>游戏广场</h1>

            <!-- 筛选和搜索 -->
            <div class="plaza-controls">
                <input type="text" id="search-input" placeholder="搜索游戏...">
                <div class="filter-tags">
                    <button class="tag" data-filter="all">全部</button>
                    <button class="tag" data-filter="newest">最新</button>
                    <button class="tag" data-filter="popular">最热</button>
                </div>
            </div>

            <!-- 游戏网格 -->
            <div class="games-grid">
                <div class="game-card" th:each="game : ${sharedGames}">
                    <img th:src="${game.thumbnail}" alt="游戏预览" class="card-image">
                    <div class="card-content">
                        <h3 th:text="${game.name}">游戏名称</h3>
                        <p th:text="${game.author}">作者</p>
                        <div class="card-stats">
                            <span>❤️ <span th:text="${game.likes}">0</span></span>
                            <span>👁️ <span th:text="${game.views}">0</span></span>
                        </div>
                    </div>
                    <a th:href="@{/game-plaza/play/{id}(id=${game.id})}" class="card-play">
                        开始游玩
                    </a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
```

### 3.4 后端控制器更新 (HomeController.java)

```java
package com.example.writemyself.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    /**
     * 首页 - 游戏创作平台门户
     */
    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("title", "WriteMyself - 游戏创作平台");
        return "index";
    }

    /**
     * 创作游戏页面
     * 在此页面中嵌入 Tilemap 编辑器
     */
    @GetMapping("/create-game")
    public String createGame(Model model) {
        model.addAttribute("title", "创作游戏");
        return "create-game";
    }

    /**
     * 我的游戏列表
     */
    @GetMapping("/my-games")
    public String myGames(Model model) {
        model.addAttribute("title", "我的游戏");
        // TODO: 从数据库加载用户的游戏列表
        // model.addAttribute("games", gameService.getUserGames());
        return "my-games";
    }

    /**
     * 游戏广场
     */
    @GetMapping("/game-plaza")
    public String gamePlaza(Model model) {
        model.addAttribute("title", "游戏广场");
        // TODO: 从数据库加载已发布的游戏
        // model.addAttribute("sharedGames", gameService.getPublishedGames());
        return "game-plaza";
    }

    /**
     * 关于我们（保留）
     */
    @GetMapping("/about")
    public String about(Model model) {
        model.addAttribute("title", "关于我们");
        return "about";
    }
}
```

## 4. 整体流程

### 4.1 用户使用流程
```
首页门户
├─ 点击"创作游戏" ──> 进入创作游戏页面 ──> 使用 Tilemap 编辑器编辑地图
│  │
│  ├─ 保存游戏 ──> 存储到数据库
│  │
│  └─ 发布到广场 ──> 游戏出现在广场中
│
├─ 点击"我的游戏" ──> 查看用户创建的所有游戏 ──> 可以编辑或删除
│
└─ 点击"游戏广场" ──> 浏览社区游戏 ──> 游玩或点赞
```

## 5. 集成点

### 5.1 Tilemap 编辑器集成
- Tilemap 编辑器不再是独立页面，而是作为创作游戏页面的一个组件
- 需要保留现有的 `/tilemap-editor` 路由以向后兼容
- 新增 `/create-game` 路由作为主要入口
- 在 `create-game.html` 中通过 Thymeleaf 的 `th:replace` 或 `th:insert` 嵌入编辑器组件

### 5.2 主题统一
- 首页使用与 Tilemap 编辑器相同的深色科技感主题
- 所有页面共享同一套颜色变量和样式系统
- 按钮、卡片等组件风格保持一致

