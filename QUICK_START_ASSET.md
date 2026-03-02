# 🎨 游戏素材创作系统 - 快速参考

## 🚀 快速开始

### 1️⃣ 访问页面
```
http://localhost:8083/create-game/asset
```

### 2️⃣ 基本操作流程
```
选择素材类型 → 创建素材 → 编辑内容 → 导出保存
```

---

## 📂 文件结构

### 前端文件
```
src/main/resources/
├── static/
│   ├── css/
│   │   └── game-asset-creator.css
│   └── js/game-asset-creator/
│       ├── AssetManager.js
│       ├── AssetEditor.js
│       ├── CanvasUtils.js
│       └── app.js
└── templates/
    └── create-game-asset.html
```

### 后端文件
```
src/main/java/com/example/writemyself/
├── controller/
│   ├── HomeController.java (新增路由)
│   └── AssetController.java
└── service/
    └── AssetService.java
```

---

## 🎯 主要功能模块

### 1. 素材管理 (AssetManager.js)

```javascript
// 创建素材
const asset = assetManager.createAsset('character-portrait', '主角');

// 删除素材
assetManager.deleteAsset(assetId);

// 导出素材
assetManager.exportAsset(assetId, 'png');

// 导入素材
assetManager.importAsset(file, 'character-portrait');
```

### 2. 编辑器 (AssetEditor.js)

```javascript
// 编辑角色立绘
assetEditor.editPortrait(assetId, 'full');

// 编辑地形
assetEditor.editTerrain(assetId, 'grass');

// 编辑UI
assetEditor.editUI(assetId, []);

// 编辑特效
assetEditor.editEffect(assetId, 'fire');
```

### 3. 工具函数 (CanvasUtils.js)

```javascript
// 绘制圆角矩形
CanvasUtils.drawRoundRect(ctx, x, y, width, height);

// 绘制网格
CanvasUtils.drawGrid(ctx, width, height, spacing);

// 绘制进度条
CanvasUtils.drawCircleProgress(ctx, x, y, radius, progress);
```

---

## 📋 素材分类

### 角色相关 (Character)
- 🎭 portrait - 立绘
- 🤏 sd - Q版/SD
- ⚔️ animation - 战斗动画
- 👤 avatar - 头像
- 💼 job - 职业
- ✨ skill-icon - 技能图标
- 🌡️ status-icon - 状态图标

### 地图与场景 (Map)
- 🗺️ grid - 网格地图
- 🧱 terrain - 地形块
- 🪵 obstacle - 障碍物
- 🌸 decoration - 装饰
- 🎪 background - 背景
- ⏳ loading - 载入图

### UI界面 (UI)
- 🏠 main-menu - 主菜单
- 📋 level-select - 关卡选择
- 💬 dialog - 对话框
- 🎯 battle-hud - 战斗HUD
- 🎒 inventory - 物品装备
- ✊ skill - 技能菜单

### 特效与动画 (Effect)
- ➡️ movement - 移动轨迹
- ⚡ attack - 攻击
- 🔥 magic - 魔法
- 💚 heal - 治愈
- 💥 critical - 暴击
- ✔️ status - 命中/闪避
- ⭐ levelup - 升级
- 🪤 trap - 陷阱

### 文字与图标 (Font)
- 🔢 numbers - 数字字体
- 🔘 icon-button - 按钮图标
- 💼 icon-job - 职业图标
- ⚔️ icon-attribute - 属性图标

### 剧情与过场 (Story)
- 🎬 portrait - 剧情立绘
- 💬 dialog-box - 对话框
- 🌅 transition - 过场背景
- 👥 avatar - 剧情头像

---

## 🔌 API 端点

### 创建素材
```
POST /api/asset/create
参数: category, name, data
响应: {success, asset}
```

### 获取列表
```
GET /api/asset/list?category=character-portrait
响应: {success, assets}
```

### 获取详情
```
GET /api/asset/{assetId}
响应: {success, asset}
```

### 更新素材
```
PUT /api/asset/{assetId}
请求体: asset 数据
响应: {success, asset}
```

### 删除素材
```
DELETE /api/asset/{assetId}
响应: {success, message}
```

### 上传文件
```
POST /api/asset/upload
参数: file, category
响应: {success, assetId, path}
```

### 获取分类
```
GET /api/asset/categories
响应: {success, categories}
```

### 统计信息
```
GET /api/asset/statistics
响应: {success, statistics}
```

---

## 💡 使用技巧

### 快速创建素材
1. 点击左侧菜单项
2. 自动创建该分类的素材
3. 开始编辑

### 导出素材
1. 选择要导出的素材
2. 点击工具栏"导出"按钮
3. 选择格式（PNG/JSON）
4. 自动下载

### 导入素材
1. 点击工具栏"导入"按钮
2. 选择要导入的文件
3. 选择素材分类
4. 完成导入

### 预览素材
1. 选择素材
2. 点击工具栏"预览"按钮
3. 在新窗口查看

---

## 🐛 常见问题

### Q: 为什么导出后文件为空？
A: 确保已完成编辑并正确保存。Canvas 内容默认自动保存。

### Q: 能否导入 PSD 文件？
A: 当前版本不支持，建议先转换为 PNG。

### Q: 素材数据会保存到哪里？
A: 当前版本数据存储在浏览器内存中，刷新后丢失。建议及时导出。

### Q: 如何批量导出素材？
A: 目前需要逐个导出，批量导出功能在后续版本添加。

---

## 📚 深入学习

### 1. 理解数据流
```
用户交互 → 事件处理 → AssetManager 更新
→ AssetEditor 绘制 → Canvas 渲染
```

### 2. 理解模块关系
```
GameAssetCreatorApp (主应用)
├─ AssetManager (素材管理)
├─ AssetEditor (编辑器)
└─ CanvasUtils (工具库)
```

### 3. 理解后端 API
```
请求 → HomeController/AssetController
→ AssetService → 数据存储/处理
→ 响应
```

---

## 🔧 开发提示

### 添加新的编辑器

1. **HTML 中添加面板**
```html
<div class="content-panel" id="new-type-panel">
    <h3>编辑器标题</h3>
    <canvas id="new-canvas"></canvas>
</div>
```

2. **AssetEditor 中添加方法**
```javascript
editNewType(assetId, params) {
    const canvas = this.initCanvas('new-canvas');
    // 编辑逻辑
    this.assetManager.saveAssetImage(assetId, canvas);
}
```

3. **app.js 中添加事件**
```javascript
case 'new-category':
    this.assetEditor.editNewType(assetId);
    break;
```

### 添加新的工具函数

```javascript
// 在 CanvasUtils 中添加
drawNewShape(ctx, x, y, size) {
    // 实现绘图逻辑
}

// 使用
CanvasUtils.drawNewShape(ctx, 100, 100, 50);
```

---

## 🚀 性能优化建议

1. **大型地图编辑**：使用分块编辑，避免一次性加载全部
2. **图片导入**：先压缩再导入，减少内存占用
3. **频繁操作**：使用缓存，减少重复计算

---

## 📞 获取帮助

- 查看完整指南: `GAME_ASSET_CREATOR_GUIDE.md`
- 查看架构文档: `openspec/changes/add-game-asset-creator/ARCHITECTURE.md`
- 查看实现计划: `openspec/changes/add-game-asset-creator/IMPLEMENTATION_PLAN.md`

---

**版本**: 1.0.0
**更新**: 2026-03-02

