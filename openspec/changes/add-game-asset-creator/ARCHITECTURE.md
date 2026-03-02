# 游戏素材创作系统架构设计

## 📐 系统概览

游戏素材创作系统是一个完整的游戏资源管理和编辑平台，提供 6 大类、50+ 种素材的创建和编辑功能。

```
┌─────────────────────────────────────────────────────────────┐
│           游戏素材创作系统 (Game Asset Creator)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            用户界面层 (Presentation Layer)           │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  create-game-asset.html                             │   │
│  │  ├─ 左侧导航菜单 (Sidebar Navigation)               │   │
│  │  ├─ 工具栏 (Toolbar)                                │   │
│  │  └─ 工作区 (Workspace)                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           JavaScript 应用层 (App Layer)             │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  │ AssetManager │  │ AssetEditor  │  │ CanvasUtils  │ │
│  │  │ - 创建       │  │ - 绘制       │  │ - 工具函数   │ │
│  │  │ - 删除       │  │ - 编辑       │  │ - 辅助绘图   │ │
│  │  │ - 保存       │  │ - 特效       │  │              │ │
│  │  │ - 导出       │  │              │  │              │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │
│  │                        ↓ (控制)                        │
│  │  ┌──────────────────────────────────────────────────┐ │
│  │  │         GameAssetCreatorApp (主应用)              │ │
│  │  │ - 事件监听                                         │ │
│  │  │ - 界面切换                                         │ │
│  │  │ - 编辑器协调                                       │ │
│  │  └──────────────────────────────────────────────────┘ │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         HTML5 Canvas API 渲染层 (Render)            │   │
│  │  - Canvas 2D Context                                │   │
│  │  - 图形绘制                                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓ (网络通信)
┌─────────────────────────────────────────────────────────────┐
│            Spring MVC 后端层 (Backend Layer)                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │     控制层 (HomeController / AssetController)       │   │
│  │  - 路由映射                                         │   │
│  │  - HTTP 请求处理                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          业务层 (AssetService)                      │   │
│  │  - 素材管理逻辑                                     │   │
│  │  - 数据验证                                         │   │
│  │  - 业务规则                                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        数据存储层 (数据库/内存缓存)                  │   │
│  │  - 素材数据持久化                                   │   │
│  │  - 文件存储                                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ 分层设计

### 1. 表现层 (Presentation Layer)

**文件**: `create-game-asset.html`

**职责**:
- 页面布局和结构
- UI 组件定义
- Canvas 画布容器

**主要结构**:
```html
├─ asset-header (页面头部)
├─ asset-container
│  ├─ asset-sidebar (左侧菜单)
│  │  ├─ sidebar-section × 6
│  │  │  ├─ 一、角色相关
│  │  │  ├─ 二、地图与场景
│  │  │  ├─ 三、UI 界面类
│  │  │  ├─ 四、特效与动画
│  │  │  ├─ 五、文字与图标
│  │  │  └─ 六、剧情与过场
│  │
│  └─ asset-workspace (工作区)
│     ├─ workspace-toolbar (工具栏)
│     │  ├─ 新建、导入、导出
│     │  └─ 预览、发布
│     │
│     └─ workspace-content (内容区)
│        ├─ welcome-panel (欢迎界面)
│        ├─ character-portrait-panel (角色立绘)
│        ├─ character-sd-panel (Q版模型)
│        ├─ character-animation-panel (战斗动画)
│        ├─ map-grid-panel (地图)
│        ├─ ui-main-menu-panel (UI)
│        ├─ effect-magic-panel (特效)
│        └─ asset-library-panel (素材库)
```

### 2. 应用层 (Application Layer)

**核心组件**:

#### 2.1 AssetManager.js
```javascript
class AssetManager {
    // 属性
    assets: Map<string, Asset>
    categories: Map<string, Array<Asset>>

    // 方法
    createAsset(category, name)
    deleteAsset(assetId)
    updateAssetData(assetId, data)
    exportAsset(assetId, format)
    importAsset(file, category)
    getStatistics()
}
```

**职责**:
- 素材生命周期管理
- 分类管理
- 导入导出功能

#### 2.2 AssetEditor.js
```javascript
class AssetEditor {
    // 属性
    currentCanvas: HTMLCanvasElement
    currentContext: CanvasRenderingContext2D

    // 方法 - 各编辑器
    editPortrait(assetId, type)      // 角色立绘
    editTerrain(assetId, terrain)    // 地形
    editUI(assetId, components)      // UI
    editEffect(assetId, effectType)  // 特效

    // 辅助方法
    initCanvas(canvasId, width, height)
    clearCanvas()
    drawGrid(spacing, color)
}
```

**职责**:
- Canvas 初始化和管理
- 各类素材的编辑功能
- 绘图逻辑实现

#### 2.3 CanvasUtils.js
```javascript
const CanvasUtils = {
    // 基础绘图
    drawRoundRect()          // 圆角矩形
    drawDashedLine()         // 虚线
    drawPolygon()            // 多边形

    // 高级效果
    drawGradientBg()         // 渐变背景
    drawCircleProgress()     // 圆形进度条
    drawRectProgress()       // 矩形进度条
    drawStrokeText()         // 描边文字

    // 工具函数
    getTextWidth()           // 获取文本宽度
    toGrayscale()            // 灰度处理
    randomColor()            // 随机颜色
}
```

**职责**:
- 提供常用绘图工具
- 简化复杂的 Canvas 操作
- 代码复用

#### 2.4 GameAssetCreatorApp.js
```javascript
class GameAssetCreatorApp {
    // 属性
    assetManager: AssetManager
    assetEditor: AssetEditor
    currentCategory: string

    // 方法
    init()                   // 初始化
    setupEventListeners()    // 事件设置
    switchPanel(category)    // 切换面板
    editCurrentAsset(category)

    // 用户操作
    newAsset()               // 新建
    importAsset()            // 导入
    exportAsset()            // 导出
    preview()                // 预览
    publish()                // 发布
}
```

**职责**:
- 应用主控制逻辑
- UI 事件处理
- 各组件协调

### 3. 后端层 (Backend Layer)

#### 3.1 HomeController
**路由**:
- `GET /create-game` - 主页面
- `GET /create-game/asset` - 素材创作页面

**职责**:
- 页面视图映射
- 模型数据准备

#### 3.2 AssetController
**路由**:
```
POST   /api/asset/create              创建素材
GET    /api/asset/list                获取列表
GET    /api/asset/{id}                获取详情
PUT    /api/asset/{id}                更新素材
DELETE /api/asset/{id}                删除素材
POST   /api/asset/upload              上传文件
GET    /api/asset/{id}/export/png     导出PNG
GET    /api/asset/{id}/export/json    导出JSON
GET    /api/asset/categories          获取分类
GET    /api/asset/statistics          获取统计
```

**职责**:
- HTTP 请求处理
- 参数验证
- 调用服务层

#### 3.3 AssetService
**接口**:
```java
Map<String, Object> createAsset(...)
Map<String, Object> getAsset(...)
Map<String, Object> updateAsset(...)
boolean deleteAsset(...)
List<Map<String, Object>> getAssetsByCategory(...)
Map<String, Object> getStatistics()
String exportAssetToJson(...)
```

**职责**:
- 业务逻辑实现
- 数据验证
- 调用数据层

## 📦 数据结构

### 素材对象 (Asset)
```javascript
{
    id: string,              // UUID
    name: string,            // 素材名称
    category: string,        // 分类标识
    createdAt: Date,         // 创建时间
    updatedAt: Date,         // 更新时间
    data: {                  // 分类特定数据
        // 根据类型变化
    },
    canvas: HTMLCanvasElement,  // Canvas 对象
    imageData: string        // Base64 编码的图像
}
```

### 分类树 (Category Tree)
```
root
├─ character (角色)
│  ├─ portrait (立绘)
│  ├─ sd (Q版)
│  ├─ animation (动画)
│  ├─ avatar (头像)
│  ├─ job (职业)
│  ├─ skill-icon (技能图标)
│  └─ status-icon (状态图标)
├─ map (地图)
│  ├─ grid (网格)
│  ├─ terrain (地形)
│  ├─ obstacle (障碍)
│  ├─ decoration (装饰)
│  ├─ background (背景)
│  └─ loading (载入图)
├─ ui (界面)
│  ├─ main-menu
│  ├─ level-select
│  ├─ dialog
│  ├─ battle-hud
│  ├─ inventory
│  └─ skill
├─ effect (特效)
│  ├─ movement
│  ├─ attack
│  ├─ magic
│  ├─ heal
│  ├─ critical
│  ├─ status
│  ├─ levelup
│  └─ trap
├─ font (文字/图标)
│  ├─ numbers
│  ├─ icon-button
│  ├─ icon-job
│  └─ icon-attribute
└─ story (剧情)
   ├─ portrait
   ├─ dialog-box
   ├─ transition
   └─ avatar
```

## 🔄 数据流

### 创建素材流程
```
用户点击菜单
    ↓
switchPanel(category)
    ↓
创建 Asset 对象
    ↓
assetManager.createAsset()
    ↓
editCurrentAsset(category)
    ↓
调用相应编辑器
    ↓
Canvas 绘制
    ↓
assetManager.saveAssetImage()
```

### 导出素材流程
```
用户点击导出
    ↓
选择格式 (PNG/JSON)
    ↓
exportAsset()
    ↓
assetManager.exportAsset(assetId, format)
    ↓
生成下载链接
    ↓
浏览器下载
```

### 导入素材流程
```
用户选择文件
    ↓
File Reader 读取
    ↓
assetManager.importAsset()
    ↓
创建新 Asset
    ↓
Canvas 加载图像
    ↓
显示在编辑器
```

## 💾 状态管理

### 前端状态
```javascript
// 全局状态
assetManager.assets           // Map<assetId, Asset>
assetManager.currentAsset     // 当前编辑的素材
assetManager.categories       // Map<category, Array<Asset>>

// UI 状态
app.currentCategory           // 当前选中的分类
app.assetEditor.currentCanvas // 当前编辑的 Canvas
```

### 生命周期
```
页面加载 → 初始化 → 用户交互 → 编辑 → 保存 → 导出/发布 → 卸载

初始化阶段:
1. 创建 AssetManager
2. 创建 AssetEditor
3. 创建 GameAssetCreatorApp
4. 注册事件监听
5. 显示欢迎界面

编辑阶段:
1. 用户选择分类
2. 创建新素材
3. 初始化 Canvas
4. 用户编辑
5. 自动保存

导出阶段:
1. 获取当前素材
2. 生成数据 (PNG/JSON)
3. 创建下载链接
4. 触发下载
```

## 🎯 扩展点

### 添加新的编辑器
1. 在 `AssetEditor` 中添加编辑方法
2. 在 HTML 中添加新的 panel
3. 在 `app.js` 中添加事件处理
4. 在菜单中添加入口

### 添加新的分类
1. 在 `AssetManager.initializeCategories()` 中添加
2. 在 HTML 菜单中添加
3. 实现对应的编辑器
4. 在 API 中添加相应支持

### 与数据库集成
1. 创建 Asset 实体模型
2. 创建 Repository 接口
3. 修改 Service 实现
4. 更新 Controller 调用

## 🔐 安全考虑

1. **输入验证**
   - 验证素材分类
   - 验证文件类型和大小
   - 防止注入攻击

2. **权限控制**
   - 用户只能访问自己的素材
   - 管理员可以管理全局素材库

3. **数据保护**
   - 上传文件扫描
   - 敏感数据加密
   - 访问日志记录

## 📊 性能优化

1. **前端优化**
   - Canvas 缓存
   - 图片懒加载
   - 虚拟滚动（大量素材）

2. **后端优化**
   - 缓存策略
   - 数据库索引
   - 文件系统缓存

3. **传输优化**
   - 图片压缩
   - 增量更新
   - CDN 加速

## 📈 可扩展性

### 水平扩展
- 分布式存储
- 消息队列处理
- 微服务架构

### 垂直扩展
- 数据库优化
- 缓存系统
- 搜索引擎

---

**版本**: 1.0.0
**作者**: WriteMyself Team
**最后更新**: 2026-03-02

