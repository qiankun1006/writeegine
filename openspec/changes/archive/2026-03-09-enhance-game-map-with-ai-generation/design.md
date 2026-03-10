## 上下文

当前系统已经有一个功能完整的tilemap编辑器，位于`/create-game/asset/map-grid`路径，提供基础的网格地图编辑功能。用户需求是在此基础上增加AI驱动的游戏地图生成能力，实现"先用tilemap画出像素轮廓，然后用AI+输入参数生成真正工业级的地图"的工作流程。

## 目标 / 非目标

### 目标
1. 在现有tilemap编辑器基础上集成AI地图生成功能
2. 提供与角色立绘页面类似的参数输入界面
3. 实现tilemap草图到高质量游戏地图的转换
4. 保持现有tilemap编辑功能的完整性和可用性
5. 提供直观的用户工作流程：绘制草图 → 设置参数 → 生成地图

### 非目标
1. 替换现有的tilemap编辑器功能
2. 实现复杂的AI模型训练功能
3. 支持实时协作编辑
4. 提供完整的游戏地图编辑套件（仅限生成功能）

## 技术决策

### 1. 架构设计
采用前后端分离的混合架构：
- **前端**: 基于现有Thymeleaf模板系统，增强HTML/CSS/JavaScript
- **后端**: Spring Boot控制器处理请求，集成AI服务
- **AI服务**: 初期使用外部API（如VolcEngine），后期可考虑本地模型部署

### 2. 页面布局设计
采用左右分栏布局：
```
+-----------------------------------------+
|             页面标题：游戏地图           |
+-------------------+---------------------+
|                   |                     |
|  左侧：Tilemap    |   右侧：AI参数      |
|  编辑器区域       |   输入面板          |
|                   |                     |
|  • 图块选择器     |  • 风格选择         |
|  • 编辑画布       |  • 尺寸选择         |
|  • 工具栏         |  • 游戏类型         |
|  • 状态信息       |  • 微调模型         |
|                   |  • 参考图片         |
|                   |  • 生成按钮         |
+-------------------+---------------------+
```

### 3. 数据流设计
```
用户操作流程：
1. 用户在左侧tilemap编辑器中绘制草图
2. 用户设置右侧AI参数（风格、尺寸、游戏类型等）
3. 点击"生成"按钮
4. 前端将草图转换为像素轮廓数据
5. 发送草图数据 + AI参数到后端
6. 后端调用AI服务生成地图
7. 返回生成结果给前端
8. 前端显示预览并提供下载
```

### 4. 关键技术实现

#### 4.1 草图转换算法
```javascript
// 将tilemap草图转换为像素轮廓
function convertSketchToOutline(canvasData) {
  // 1. 获取canvas像素数据
  // 2. 识别不同图块类型（颜色/纹理）
  // 3. 提取轮廓边界
  // 4. 生成简化轮廓数据
  // 5. 转换为AI可理解的格式
}
```

#### 4.2 AI参数模型
```java
// 后端数据模型
public class GameMapGenerationRequest {
    private String sketchData;      // 草图像素数据
    private String style;           // 风格：fantasy, sci-fi, medieval, modern
    private String size;            // 尺寸：small, medium, large, custom
    private String gameType;        // 游戏类型：rpg, strategy, platform, sandbox
    private String model;           // 微调模型：base, pro, custom
    private String referenceImage;  // 参考图片URL
    private Map<String, Object> additionalParams;
}
```

#### 4.3 前端组件结构
```
src/main/resources/static/game-map-generator/
├── css/
│   ├── game-map-editor.css        # 增强的编辑器样式
│   └── ai-params-panel.css        # AI参数面板样式
├── js/
│   ├── game-map-editor.js         # 增强的编辑器逻辑
│   ├── ai-params-panel.js         # AI参数面板逻辑
│   ├── sketch-converter.js        # 草图转换逻辑
│   └── api-client.js              # API通信模块
└── templates/
    └── game-map-editor.html       # 新的页面模板
```

### 5. API设计

#### 5.1 生成地图接口
```java
@PostMapping("/api/game-map/generate")
@ResponseBody
public Map<String, Object> generateGameMap(
    @RequestBody GameMapGenerationRequest request) {
    // 1. 验证请求参数
    // 2. 调用AI服务生成地图
    // 3. 保存生成结果
    // 4. 返回生成的地图URL和元数据
}
```

#### 5.2 获取生成状态接口
```java
@GetMapping("/api/game-map/status/{jobId}")
@ResponseBody
public Map<String, Object> getGenerationStatus(
    @PathVariable String jobId) {
    // 返回生成任务状态
}
```

#### 5.3 下载地图接口
```java
@GetMapping("/api/game-map/download/{mapId}")
public ResponseEntity<Resource> downloadGameMap(
    @PathVariable String mapId) {
    // 返回生成的地图文件
}
```

## 风险与权衡

### 风险1: AI服务依赖
- **风险**: 依赖外部AI服务，可能不稳定或产生费用
- **缓解**:
  - 实现服务降级，AI服务不可用时提供基础功能
  - 设置请求限制和缓存机制
  - 考虑后期部署本地轻量级模型

### 风险2: 性能问题
- **风险**: 地图生成可能耗时较长，影响用户体验
- **缓解**:
  - 实现异步生成，提供进度显示
  - 优化草图数据大小
  - 设置合理的超时时间

### 风险3: 向后兼容性
- **风险**: 修改现有页面可能影响现有用户
- **缓解**:
  - 保持所有现有tilemap功能不变
  - 逐步推出新功能，提供回滚方案
  - 充分测试现有功能

## 迁移计划

### 阶段1: 基础框架（1-2周）
1. 创建新的页面模板和CSS样式
2. 实现基本的左右分栏布局
3. 更新HomeController页面标题

### 阶段2: AI参数面板（2-3周）
1. 实现所有参数输入控件
2. 添加参数验证和状态管理
3. 集成参考图片上传功能

### 阶段3: 草图转换和生成（3-4周）
1. 实现草图到像素轮廓的转换算法
2. 创建后端API接口
3. 集成AI生成服务
4. 实现生成状态跟踪

### 阶段4: 结果展示和优化（1-2周）
1. 实现生成结果预览组件
2. 添加下载和重新生成功能
3. 优化用户体验和性能

## 开放问题

1. **AI服务选择**: 使用哪个AI服务提供商？VolcEngine、Stable Diffusion API还是其他？
2. **生成质量**: 如何确保生成的地图质量满足游戏开发需求？
3. **成本控制**: 如何控制AI生成的成本，特别是对于免费用户？
4. **离线支持**: 是否需要在本地提供基础的生成能力？
5. **扩展性**: 未来是否需要支持更多参数和生成选项？

