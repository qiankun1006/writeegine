# Tasks: 游戏类型选择门户实现清单

## 1. 后端基础设施（第 1-2 天）

- [ ] 1.1 创建 Game 数据模型类 (src/main/java/com/example/writemyself/model/Game.java)
  - 字段: id, name, type, description, thumbnailUrl, metadata, createdAt, updatedAt
  - 支持 4 种类型: 2d-strategy, 2d-metroidvania, 2d-rpg, 3d-shooter
  - 包含 enum GameType

- [ ] 1.2 创建 GameRepository (存储层)
  - 实现 CRUD 操作
  - 支持按 type 查询
  - 支持按 userId 查询

- [ ] 1.3 扩展 UnityService
  - 添加 createGame(name, type, description) 方法
  - 添加 getGamesByType(type) 方法
  - 添加 updateGameMetadata(gameId, metadata) 方法
  - 添加 getGameList() 方法

- [ ] 1.4 创建 GameController
  - 路由: POST /api/game/create (创建游戏)
  - 路由: GET /api/game/list (获取用户游戏列表)
  - 路由: GET /api/game/{gameId} (获取游戏详情)
  - 路由: POST /api/game/{gameId}/save (保存游戏)
  - 路由: GET /api/game/{gameId}/scenes (获取游戏场景列表)
  - 返回类型: GameDTO (数据传输对象)

- [ ] 1.5 创建 UnityController 路由映射
  - GET /create-game/unity → 门户页面
  - GET /create-game/unity/2d-strategy → 2D 策略编辑器
  - GET /create-game/unity/2d-metroidvania → 2D 恶魔城编辑器
  - GET /create-game/unity/2d-rpg → 2D RPG 编辑器
  - GET /create-game/unity/3d-shooter → 3D 射击编辑器

- [ ] 1.6 创建数据库迁移脚本
  - 添加 game 表：id, name, type, description, thumbnail_url, metadata, created_at, updated_at
  - 为现有场景数据添加 game_id 外键
  - 迁移现有数据为 "3d-legacy" 类型

## 2. 游戏类型选择门户 UI（第 2-3 天）

- [x] 2.1 创建 create-game-unity.html (门户页面)
  - 基于模板继承 layout.html
  - 响应式网格布局（4 列卡片）
  - 移动端自适应为 2 列或 1 列

- [x] 2.2 设计卡片 UI 组件
  - 卡片布局: 图标/缩略图 + 标题 + 描述 + 按钮
  - 4 个卡片: 2D 策略、2D 恶魔城、2D RPG、3D 射击
  - 每个卡片包含:
    - 游戏类型名称
    - 描述文本
    - "新建游戏" 按钮
    - "打开游戏" 下拉菜单（如果已有该类型游戏）

- [x] 2.3 实现交互逻辑
  - 加载用户的所有游戏并分类
  - "新建游戏" 按钮点击 → 创建新游戏 → 跳转编辑器
  - "打开游戏" 下拉菜单 → 选择游戏 → 跳转编辑器加载游戏
  - 加载动画显示

- [x] 2.4 创建门户页面样式 (css/game-portal.css)
  - 卡片容器样式
  - 响应式布局 (媒体查询)
  - 悬停效果 (shadow, scale)
  - 按钮样式
  - 加载动画

- [x] 2.5 实现门户 JavaScript 逻辑 (js/game-portal.js)
  - 获取游戏列表 API 调用
  - 卡片事件监听 (click, hover)
  - 创建新游戏流程
  - 打开已有游戏流程
  - 路由跳转
  - 错误处理和提示

- [x] 2.6 测试门户功能
  - 门户页面加载成功
  - 卡片显示和交互正常
  - 创建新游戏流程可用
  - 打开已有游戏流程可用
  - 移动端响应式布局正常

## 3. 2D 编辑器基础（第 3-5 天）

- [x] 3.1 创建 BaseEditor2D 基类 (js/editors/BaseEditor2D.js)
  - Canvas 2D 画布管理
  - 事件处理系统 (鼠标、键盘)
  - 选择和高亮系统
  - 缩放和平移控制
  - 历史记录 (Undo/Redo)
  - 保存和加载数据

- [x] 3.2 创建 2D 策略编辑器 (create-game-2d-strategy.html)
  - 基于 BaseEditor2D
  - HTML 结构: 层级面板 + 2D 画布 + Inspector
  - 工具栏: 新建、选择、移动、旋转、缩放
  - 网格系统工具
  - 寻路编辑工具

- [x] 3.3 实现 2D 策略编辑器功能
  - GridSystem 类 (网格大小、显示、对齐)
  - PathfindingEditor 类 (寻路可视化、障碍标记)
  - 对象创建、选择、编辑
  - 属性检查器更新

- [x] 3.4 创建 2D 恶魔城编辑器 (create-game-2d-metroidvania.html)
  - 基于 BaseEditor2D
  - HTML 结构
  - 工具栏和基础功能

- [x] 3.5 实现 2D 恶魔城编辑器功能
  - CollisionBodyEditor 类 (碰撞体编辑)
  - PhysicsPreview 类 (物理预览)
  - 平台和刚体编辑

- [x] 3.6 创建 2D RPG 编辑器 (create-game-2d-rpg.html)
  - 基于 BaseEditor2D
  - HTML 结构

- [x] 3.7 实现 2D RPG 编辑器功能
  - NPCEditor 类 (NPC 创建、编辑)
  - DialogueEditor 类 (对话系统)
  - QuestSystem 类 (任务系统)

- [x] 3.8 创建 2D 编辑器通用工具库 (js/editors/2d-utils.js)
  - Canvas 2D 绘制工具
  - 对象变换工具
  - 网格计算工具
  - 物体选择工具

- [x] 3.9 测试 2D 编辑器
  - 2D 画布渲染正常
  - 对象创建、选择、编辑功能正常
  - 属性检查器更新正确
  - 保存和加载数据成功

## 4. 3D 编辑器优化（第 5-6 天）

- [x] 4.1 分析现有 3D 编辑器代码
  - 识别 2D 特定功能
  - 识别必需的 3D 功能

- [x] 4.2 创建 3D 射击编辑器模板 (create-game-3d-shooter.html)
  - 从现有 create-game-unity.html 复制
  - 移除 2D 特定工具的引入
  - 添加射击游戏特定工具的占位符

- [x] 4.3 优化 3D 编辑器启动代码
  - 修改 app.js 检测编辑器类型
  - 只加载该类型所需的模块
  - 移除不需要的工具菜单项

- [x] 4.4 创建 3D 射击编辑器特定功能
  - LightingEditor 类 (光照编辑)
  - ParticleSystemEditor 类 (粒子系统)
  - RaycastingTool 类 (射线检测)

- [x] 4.5 实现懒加载配置
  - 创建 MODULES_CONFIG_3D.json (3D 射击编辑器模块配置)
  - 标记 Ammo.js 为可选模块
  - 标记射击特定工具为优先级较低的模块

- [x] 4.6 性能测试 3D 编辑器
  - 首屏加载时间测试
  - 内存占用测试
  - 功能完整性验证

## 5. 懒加载和性能优化（第 6-7 天）

- [x] 5.1 为每个编辑器创建模块配置
  - MODULES_CONFIG_2D_STRATEGY.json
  - MODULES_CONFIG_2D_METROIDVANIA.json
  - MODULES_CONFIG_2D_RPG.json
  - MODULES_CONFIG_3D_SHOOTER.json

- [x] 5.2 优化 LazyLoader 支持多编辑器
  - 支持按类型动态加载 MODULES_CONFIG
  - 确保配置匹配编辑器类型

- [x] 5.3 配置 2D 编辑器懒加载
  - 必需: 基础 Canvas, DOM 结构, 样式
  - 阶段 2: BaseEditor2D, 输入系统
  - 阶段 3: 类型特定工具 (GridSystem, NPC Editor 等)
  - 阶段 4: 可选功能 (脚本编辑器, 资源库等)

- [x] 5.4 配置 3D 编辑器懒加载
  - 必需: Three.js, OrbitControls, 基础 UI
  - 阶段 2: UnityRenderer, 选择系统
  - 阶段 3: 类型特定工具
  - 阶段 4: Ammo.js (可选)

- [x] 5.5 性能基准测试
  - 测试每个编辑器的首屏加载时间
  - 记录基准值
  - 对比原始编辑器性能改进

- [x] 5.6 实现性能监控
  - 添加性能指标收集代码
  - 在浏览器控制台打印性能数据
  - 创建性能报告页面

## 6. 集成和测试（第 7-8 天）

- [x] 6.1 集成后端 API
  - 确保所有编辑器能调用游戏 API
  - 测试保存和加载游戏功能

- [x] 6.2 集成路由
  - 验证所有路由正确映射
  - 测试路由跳转逻辑
  - 测试带 gameId 参数的跳转

- [x] 6.3 数据兼容性测试
  - 在新编辑器中打开现有游戏数据
  - 验证数据正确加载和显示
  - 测试数据保存不出错

- [x] 6.4 端到端功能测试
  - 从门户创建新游戏完整流程
  - 编辑游戏并保存
  - 重新打开已保存游戏
  - 在不同编辑器间检查数据一致性

- [x] 6.5 UI/UX 测试
  - 验证所有按钮和菜单可用
  - 测试键盘快捷键
  - 测试触摸交互 (移动端)
  - 验证错误消息显示

- [x] 6.6 浏览器兼容性测试
  - Chrome 测试
  - Firefox 测试
  - Safari 测试
  - Edge 测试

- [x] 6.7 性能回归测试
  - 确保原有功能性能未下降
  - 验证新功能性能指标达标
  - 测试在低网络条件下的表现

## 7. 文档和部署（第 8-9 天）

- [x] 7.1 创建用户文档
  - 游戏类型选择指南
  - 各编辑器使用指南
  - 常见问题 FAQ

- [x] 7.2 创建开发者文档
  - API 文档 (GameController)
  - 编辑器扩展指南
  - 添加新游戏类型的步骤

- [x] 7.3 创建部署说明
  - 数据库迁移步骤
  - 环境变量配置
  - 回滚计划

- [x] 7.4 准备灰度发布
  - 配置灰度开关 (A/B 测试)
  - 设置日志和监控
  - 准备技术支持文档

- [ ] 7.5 部署到暂存环境
  - 运行数据库迁移
  - 部署代码变更
  - 验证功能可用

- [ ] 7.6 收集反馈
  - 记录用户反馈
  - 识别需要调整的地方
  - 准备后续迭代计划

## 8. 质量保证（贯穿全程）

- [ ] 8.1 代码审查
  - 后端代码审查 (Java)
  - 前端代码审查 (JavaScript)
  - CSS 样式审查

- [ ] 8.2 安全审查
  - 检查 API 认证和授权
  - 验证输入验证
  - 检查 XSS/CSRF 防护

- [ ] 8.3 可访问性审查
  - 键盘导航支持
  - 屏幕阅读器兼容性
  - 颜色对比度检查

- [ ] 8.4 文档审查
  - 验证文档准确性
  - 检查代码示例
  - 更新相关文档

