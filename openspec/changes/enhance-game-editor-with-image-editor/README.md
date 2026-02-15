# 扩展创作游戏页面 - 添加图片编辑功能入口

## 📌 快速概览

这个提案计划扩展【创作游戏】页面，从**单编辑器**改造为**多编辑器中心**。通过选项卡界面，用户可以在「地图编辑」和「图片编辑」之间轻松切换。

**现状：** 一个 Tilemap 编辑器
**目标：** 两个编辑器的统一编辑中心
**方案：** 选项卡 UI + 选项卡管理类

---

## 🎯 核心改造

```diff
创作游戏页面结构：

  游戏信息表单
    │
-   ├─ Tilemap 编辑器
    │
+   ├─ 编辑器选项卡
+   │   ├─ [地图编辑] ← Tilemap 编辑器
+   │   └─ [图片编辑] ← 占位符（后续开发）
    │
    └─ 操作按钮
```

---

## 📚 文档导航

| 文档 | 内容 | 用途 |
|------|------|------|
| **[SUMMARY.md](./SUMMARY.md)** | 📋 提案总结 | 快速了解全貌 |
| **[proposal.md](./proposal.md)** | 📄 项目提案 | 正式提案文档 |
| **[design.md](./design.md)** | 🎨 详细设计 | **完整代码示例** ⭐ |
| **[tasks.md](./tasks.md)** | ✅ 任务清单 | 实施步骤和进度追踪 |
| **[specs/editor-layout/](./specs/editor-layout/spec.md)** | 🔧 编辑器布局规格 | 技术规格文档 |
| **[specs/image-editor-entry/](./specs/image-editor-entry/spec.md)** | 🖼️ 图片编辑入口规格 | 技术规格文档 |

---

## ⚡ 快速浏览

### 改造涉及的文件

```
src/main/resources/
├── templates/
│   └── create-game.html              ← 修改：添加选项卡
│
└── static/
    ├── css/
    │   └── game-creation.css         ← 扩展：添加选项卡样式
    │
    └── js/
        └── game-creation.js          ← 扩展：添加选项卡管理
```

### 改造要点

| 要点 | 说明 |
|------|------|
| 📌 选项卡容器 | 新增 `.editor-tabs` 和 `.editor-tab-content` |
| 📌 选项卡按钮 | 新增 `.editor-tab-button` 及活跃状态 |
| 📌 管理类 | 新增 `EditorTabManager` 类处理切换逻辑 |
| 📌 占位符 | 图片编辑器显示占位符（待开发标记） |
| 📌 动画效果 | 淡入淡出过渡动画 (`fadeIn` @keyframes) |
| 📌 响应式 | 移动端适配（选项卡按钮全宽显示） |

---

## 💻 HTML 结构预览

```html
<div class="game-creation-wrapper">
    <!-- 游戏信息表单 -->
    <div class="game-info-panel">
        <!-- ... 现有内容 ... -->
    </div>

    <!-- 编辑器选项卡 NEW! -->
    <div class="editor-tabs">
        <!-- 选项卡按钮 -->
        <div class="editor-tab-header">
            <button class="editor-tab-button active" data-tab="tilemap">
                🗺️ 地图编辑
            </button>
            <button class="editor-tab-button" data-tab="image">
                🖼️ 图片编辑
            </button>
        </div>

        <!-- 地图编辑器 Tab 1 -->
        <div class="editor-tab-content active" id="tilemap-tab">
            <div class="editor-container">
                <!-- Tilemap 编辑器嵌入 -->
            </div>
        </div>

        <!-- 图片编辑器 Tab 2 -->
        <div class="editor-tab-content" id="image-tab">
            <div class="image-editor-container">
                <!-- 占位符 -->
                <div class="editor-placeholder">
                    🖼️ 图片编辑器开发中...
                </div>
            </div>
        </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
        <!-- ... 现有内容 ... -->
    </div>
</div>
```

---

## 🎨 样式关键类

```css
.editor-tabs { /* 选项卡容器 */ }
.editor-tab-header { /* 选项卡头部 */ }
.editor-tab-button { /* 选项卡按钮 */ }
.editor-tab-button.active { /* 活跃状态 */ }
.editor-tab-button.active::after { /* 下划线 */ }
.editor-tab-content { /* 内容容器 */ }
.editor-tab-content.active { /* 显示状态 */ }
.image-editor-container { /* 图片编辑器容器 */ }
.editor-placeholder { /* 占位符 */ }

@keyframes fadeIn { /* 淡入淡出动画 */ }
```

---

## 🔧 JavaScript 关键类

```javascript
class EditorTabManager {
    init()              // 初始化
    bindTabButtons()    // 绑定按钮事件
    switchTab(name)     // 切换选项卡
    onTabSwitch(name)   // 切换回调（编辑器初始化）
}

// 使用示例
new EditorTabManager();  // 自动初始化

// 编辑器初始化接口预留
if (tabName === 'image') {
    // 后续可在此初始化图片编辑器
    this.imageEditor = new ImageEditor('#image-tab');
}
```

---

## 🚀 实施流程

### 第一步：审批提案
- 检查设计文档是否满足需求
- 确认工时估算和任务分解
- 批准后进行下一步

### 第二步：执行实施
```bash
/openspec/apply enhance-game-editor-with-image-editor
```

### 第三步：验证成果
- 检查选项卡界面显示正常
- 验证编辑器切换功能
- 测试响应式设计

---

## ✅ 验收标准

- ✅ 编辑器选项卡界面显示正常
- ✅ 两个选项卡都可见且可点击
- ✅ Tilemap 编辑器在地图编辑中正常工作
- ✅ 图片编辑器选项卡显示占位符
- ✅ 选项卡切换有平滑的动画效果
- ✅ 样式与全局主题保持一致
- ✅ 响应式设计在各种设备上工作正常
- ✅ 没有 JavaScript 错误
- ✅ 现有功能（保存/发布/取消）不受影响

---

## 📊 项目信息

| 项目 | 说明 |
|------|------|
| **提案 ID** | enhance-game-editor-with-image-editor |
| **变更类型** | 功能扩展 |
| **影响范围** | 创作游戏页面 (create-game.html) |
| **复杂度** | ⭐⭐ (低-中等) |
| **预计工时** | 3.5 小时 |
| **状态** | 📋 待审批 |

---

## 🎓 后续规划

### 本阶段（框架搭建）
- ✅ 创建选项卡界面
- ✅ 保留 Tilemap 编辑器功能
- ✅ 添加图片编辑器入口

### 下一阶段（图片编辑器开发）
- 📋 实现图片编辑功能
- 📋 集成到选项卡系统
- 📋 测试编辑器间的协作

### 可选优化
- 📋 编辑器状态持久化
- 📋 编辑器间的数据同步
- 📋 高级预览功能

---

## 📖 如何使用本文档

1. **快速了解？** → 阅读本 README
2. **想看代码？** → 跳转到 [design.md](./design.md) 查看完整代码
3. **需要完整设计？** → 阅读 [proposal.md](./proposal.md) 和 [SUMMARY.md](./SUMMARY.md)
4. **开始实施？** → 查看 [tasks.md](./tasks.md) 获取详细任务列表

---

## ❓ 常见问题

**Q: 这个改造会影响现有功能吗？**
A: 不会。所有改造都是向后兼容的，Tilemap 编辑器功能保持不变。

**Q: 何时开发图片编辑器？**
A: 本阶段仅搭建框架，具体开发在后续迭代。框架已为后续开发预留接口。

**Q: 如何切换编辑器？**
A: 点击选项卡按钮即可切换，有平滑的淡入淡出动画。

**Q: 是否支持移动端？**
A: 支持。选项卡在移动端会全宽显示，编辑器也会自适应。

---

**准备好了吗？** 🚀
→ 请阅读 [design.md](./design.md) 查看完整设计和代码示例！

