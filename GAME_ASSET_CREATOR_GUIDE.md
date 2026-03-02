# 🎨 游戏素材创作系统 - 完整指南

## 📋 概述

游戏素材创作系统是一个完整的游戏资源管理和编辑平台，集成在 WriteMyself 游戏创作平台中。它允许开发者创建和管理游戏所需的各种素材，包括角色、地图、UI、特效等。

## 🎯 系统功能

### 一、角色相关 (Character)
- 🎭 **角色立绘** - 创建头像、全身、半身立绘
- 🤏 **Q版/SD战棋模型** - 地图上走动的小人
- ⚔️ **战斗动画** - 待机、移动、攻击、技能、被击、倒地
- 👤 **角色头像** - 小头像、大头像、对话框头像
- 💼 **职业转职** - 不同职业模型和立绘
- ✨ **技能图标** - 各种技能的图标
- 🌡️ **状态图标** - 中毒、麻痹、加血、暴击、护盾等

### 二、地图与场景 (Map)
- 🗺️ **战棋网格地图** - 草地、山地、森林、城墙、沙漠、雪地、废墟等
- 🧱 **地形块素材** - 可拼接瓦片地图
- 🪵 **障碍物、可破坏物件** - 箱子、木桶、柱子、树木
- 🌸 **地图装饰** - 花草、石头、旗帜、建筑部件
- 🎪 **战场背景** - 战斗时的远景
- ⏳ **关卡载入图** - 关卡加载时的图片

### 三、UI界面类 (UI)

#### 1. 主界面
- 🏠 **主菜单 UI** - 开始、继续、设置、退出
- 📋 **关卡选择界面** - 难度、进度显示
- 💬 **剧情对话界面** - 角色对话和互动

#### 2. 战斗内基础 UI
- 🎯 **移动范围提示圈** - 显示可移动的范围
- 🎯 **攻击范围提示圈** - 显示可攻击的范围
- 🎯 **技能范围提示** - 圆形、直线、十字、菱形范围
- 👆 **移动光标、选中光标** - UI反馈
- ❤️ **敌我单位血条、怒气条、状态条** - 数值显示
- 💢 **伤害数字、暴击数字、恢复数字飘字** - 浮动文字

#### 3. 人物属性面板
- 📊 **人物属性框** - HP、MP、攻击、防御、魔防、速度、幸运、移动力
- 💼 **职业面板** - 职业信息
- 📈 **成长率面板** - 角色成长数据
- 🚨 **状态异常面板** - 当前异常状态

#### 4. 物品与装备
- 🎒 **物品菜单 UI** - 物品列表显示
- 🎒 **装备界面 UI** - 装备管理
- 💊 **道具图标** - 药、钥匙、材料
- ⚔️ **武器图标** - 剑、枪、斧、弓、杖、书
- 👕 **防具图标** - 头、身、手、脚、饰品
- ✨ **武器特效光效** - 武器特效

#### 5. 技能与魔法
- ✊ **技能菜单** - 技能列表
- 📖 **魔法列表 UI** - 魔法表现
- ✔️ **技能释放确认框** - 确认前显示
- 📝 **技能描述框** - 技能详情

#### 6. 战斗结算
- 🏆 **胜利/失败界面** - 战斗结果
- 🎁 **经验获得界面** - 经验获得和升级
- ⭐ **升级界面** - 角色升级信息
- 📦 **掉落物品界面** - 物品掉落显示

### 四、特效与动画 (Effect)
- ➡️ **移动轨迹特效** - 角色移动时的轨迹
- ⚡ **攻击剑气/光效** - 攻击时的特效
- 🔥 **魔法特效** - 火、冰、雷、光、暗
- 💚 **治愈/恢复特效** - 恢复类技能
- 💥 **暴击闪光** - 暴击时的闪光
- ✔️ **命中/闪避特效** - 命中和闪避效果
- ⭐ **升级光效** - 升级时的光效
- 🪤 **地形陷阱特效** - 毒、火、落石

### 五、文字与图标 (Font & Icon)
- 🔢 **数字字体** - HP、伤害、金币、等级
- 🔘 **按钮图标** - 确认、取消、菜单、背包、技能、结束回合
- 💼 **职业图标** - 各职业的图标
- ⚔️ **属性克制图标** - 属性相克显示
- 🌍 **地形效果图标** - 地形效果标识
- 🎯 **任务图标** - 任务相关图标

### 六、剧情与过场 (Story)
- 🎬 **剧情立绘** - 剧情时的人物立绘
- 💬 **对话框 UI** - 对话框样式
- 🌅 **过场背景图** - 场景切换背景
- 👥 **剧情小头像** - 对话头像

## 🏗️ 系统架构

### 前端架构

```
src/main/resources/
├── static/
│   ├── css/
│   │   └── game-asset-creator.css          # 样式文件
│   └── js/
│       └── game-asset-creator/
│           ├── AssetManager.js             # 素材管理器
│           ├── AssetEditor.js              # 编辑器核心
│           ├── CanvasUtils.js              # Canvas工具库
│           └── app.js                      # 主应用程序
└── templates/
    └── create-game-asset.html              # 主页面
```

### 后端架构

```
src/main/java/com/example/writemyself/
├── controller/
│   ├── HomeController.java                 # 视图路由 (/create-game/asset)
│   └── AssetController.java                # API 控制器 (/api/asset/*)
```

## 🚀 快速开始

### 访问入口

1. **从首页进入**
   - 访问 `http://localhost:8083/create-game`
   - 点击"🎨 游戏素材创作"卡片

2. **直接访问**
   - `http://localhost:8083/create-game/asset`

### 基本操作

1. **选择素材类型**
   - 在左侧菜单中点击要创建的素材类型
   - 系统会自动创建该类型的新素材

2. **编辑素材**
   - 在中央工作区使用对应的编辑器
   - 每种素材类型有专门的编辑工具

3. **保存素材**
   - 点击工具栏中的"💾 保存"按钮（自动保存）
   - 素材会自动保存到内存

4. **导出素材**
   - 点击工具栏中的"📤 导出"按钮
   - 选择导出格式（PNG/JSON）
   - 素材会下载到本地

## 📚 JavaScript 模块说明

### AssetManager.js
管理素材的生命周期：
- `createAsset(category, name)` - 创建新素材
- `deleteAsset(assetId)` - 删除素材
- `getAssetsByCategory(category)` - 获取分类下的素材
- `exportAsset(assetId, format)` - 导出素材
- `importAsset(file, category)` - 导入素材

### AssetEditor.js
提供各种编辑功能：
- `editPortrait(assetId, type)` - 编辑角色立绘
- `editTerrain(assetId, terrain)` - 编辑地形
- `editUI(assetId, components)` - 编辑UI
- `editEffect(assetId, effectType)` - 编辑特效

### CanvasUtils.js
Canvas绘图工具库：
- `drawRoundRect()` - 圆角矩形
- `drawGrid()` - 网格背景
- `drawCircleProgress()` - 圆形进度条
- `drawStrokeText()` - 描边文字
- 等多个工具函数

### app.js
主应用程序：
- UI事件监听
- 菜单切换
- 编辑器集成
- 工具栏操作

## 🔌 API 端点

### 素材管理

| 方法 | 端点 | 功能 |
|-----|------|------|
| POST | `/api/asset/create` | 创建素材 |
| GET | `/api/asset/list` | 获取素材列表 |
| GET | `/api/asset/{id}` | 获取素材详情 |
| PUT | `/api/asset/{id}` | 更新素材 |
| DELETE | `/api/asset/{id}` | 删除素材 |
| POST | `/api/asset/upload` | 上传素材文件 |
| GET | `/api/asset/{id}/export/png` | 导出PNG |
| GET | `/api/asset/{id}/export/json` | 导出JSON |
| GET | `/api/asset/categories` | 获取分类列表 |
| GET | `/api/asset/statistics` | 获取统计信息 |

## 📝 数据结构

### 素材对象
```javascript
{
    id: string,              // 素材唯一标识
    name: string,            // 素材名称
    category: string,        // 素材分类
    createdAt: Date,         // 创建时间
    updatedAt: Date,         // 更新时间
    data: object,            // 素材特定数据
    canvas: Canvas,          // Canvas对象
    imageData: string        // Base64图像数据
}
```

### 配置对象示例 (立绘编辑)
```javascript
{
    type: "full",           // full/half/head
    bgColor: "#ffffff",     // 背景颜色
    scale: 1.0              // 缩放比例
}
```

## 🎨 编辑器详细说明

### 1. 角色立绘编辑器
- **输入参数**: 立绘类型 (全身/半身/头像)
- **功能**: 绘制角色轮廓，自定义背景颜色
- **输出**: PNG图片

### 2. Q版/SD编辑器
- **输入参数**: 模型大小、颜色主题
- **功能**: 创建可爱的Q版角色
- **输出**: PNG图片

### 3. 战斗动画编辑器
- **输入参数**: 动画类型 (待机/移动/攻击等)
- **功能**: 帧序列编辑、播放预览
- **输出**: 动画序列

### 4. 地图编辑器
- **输入参数**: 地形类型 (草地/山地等)
- **功能**: 网格地图设计、地形涂装
- **输出**: 地图数据

### 5. UI编辑器
- **输入参数**: UI组件类型
- **功能**: 组件摆放、样式设置
- **输出**: UI布局数据

### 6. 特效编辑器
- **输入参数**: 特效类型 (火/冰/闪电等)
- **功能**: 特效预览、强度调整
- **输出**: 特效配置

## 🔄 工作流程

```
选择素材类型
    ↓
创建新素材 (自动)
    ↓
切换到对应编辑器
    ↓
编辑素材 (Canvas绘制)
    ↓
自动保存到内存
    ↓
导出 (PNG/JSON)
```

## 🛠️ 扩展开发指南

### 添加新的素材分类

1. **修改 `create-game-asset.html`**
   - 在左侧菜单添加新分类
   - 为新分类添加菜单项

2. **修改 `AssetManager.js`**
   - 在 `initializeCategories()` 中添加新分类

3. **修改 `AssetEditor.js`**
   - 为新分类添加编辑方法

4. **修改 `app.js`**
   - 在 `editCurrentAsset()` 中添加编辑逻辑

### 添加新的编辑工具

1. **创建新的工具方法**
   ```javascript
   editNewType(assetId, params) {
       const asset = this.assetManager.getAsset(assetId);
       const canvas = this.initCanvas('canvas-id');
       // 编辑逻辑
       this.assetManager.saveAssetImage(assetId, canvas);
   }
   ```

2. **集成到应用中**
   ```javascript
   case 'new-category':
       this.assetEditor.editNewType(assetId, params);
       break;
   ```

## 📦 依赖关系

### 前端依赖
- HTML5 Canvas API
- Modern Browser (ES6+)

### 后端依赖
- Spring Framework
- Spring Web MVC
- Thymeleaf Template Engine

## ⚠️ 注意事项

1. **浏览器兼容性**
   - 需要支持 HTML5 Canvas
   - 建议使用 Chrome/Firefox/Safari 最新版本

2. **文件大小**
   - 导入的图片建议不超过 10MB
   - Canvas 导出的图片保存在内存中

3. **性能考虑**
   - 大型地图编辑可能耗时较长
   - 建议定期保存和导出

4. **数据持久化**
   - 目前数据保存在内存中
   - 刷新页面后数据会丢失
   - 需要及时导出素材

## 🚀 未来规划

- [ ] 与服务器集成，实现数据库持久化
- [ ] 支持云端同步
- [ ] 实时协作编辑
- [ ] 更丰富的编辑工具
- [ ] 素材库搜索和分享
- [ ] 动画预览改进
- [ ] 性能优化
- [ ] 移动端适配

## 📞 支持

如有问题或建议，请联系开发团队。

---

**版本**: 1.0.0
**最后更新**: 2026-03-02

