# 规格文档：Tilemap 编辑器与创作页面集成

## 概述

Tilemap 编辑器从一个独立的工具演进为游戏创作流程中的核心组件，集成到创作游戏页面中，与游戏信息管理功能结合使用。

---

## ADDED Requirements

### 需求 1：编辑器组件化

#### Requirement
Tilemap 编辑器应该改造为可复用的组件，支持在创作页面中嵌入。

#### Scenario: 编辑器在创作页面中加载
```
Given: 用户访问 /create-game（新建游戏）
When: 页面完全加载
Then:
  - Tilemap 编辑器正常显示在编辑区域
  - 编辑器功能完整（图块选择、画布编辑、导出等）
  - 编辑器与上方的游戏信息表单并列显示
  - 两个模块之间有明确的视觉分隔
```

#### Scenario: 编辑器在编辑页面中加载
```
Given: 用户访问 /create-game/{gameId}（编辑现有游戏）
When: 页面完全加载
Then:
  - 编辑器加载已保存的地图数据
  - 编辑器功能完整且可用
  - 用户可以继续编辑地图
```

---

### 需求 2：编辑器数据绑定

#### Requirement
编辑器应该与游戏表单协同工作，将编辑的地图数据与游戏信息一起保存。

#### Scenario: 编辑器数据捕获
```
Given: 用户在编辑器中编辑了地图
When: 用户点击"保存游戏"或"发布到广场"
Then:
  - JavaScript 从编辑器中捕获当前地图数据
  - 地图数据与表单数据（名称、描述）一起被收集
  - 数据以 JSON 格式打包
  - 发送到后端 /api/games 接口进行保存
```

---

### 需求 3：编辑器数据恢复

#### Requirement
从数据库加载现有游戏时，编辑器应该能正确恢复之前的地图状态。

#### Scenario: 加载现有游戏地图
```
Given: 用户访问 /create-game/{gameId} 编辑现有游戏
When: 页面加载完成
Then:
  - 后端从数据库加载游戏的 mapData
  - 将 mapData 作为初始化参数传递给编辑器
  - 编辑器调用 loadMapData() 方法恢复地图状态
  - 用户看到之前编辑保存的地图内容
```

#### Scenario: 编辑器的 loadMapData 方法
```
假设编辑器提供以下方法：

editor.loadMapData({
  gridSize: 16,
  gridData: [
    [0, 1, 0, ...],
    [1, 0, 2, ...],
    ...
  ]
})
```

---

### 需求 4：编辑器消息反馈

#### Requirement
编辑器应该在发生重要事件时显示用户友好的提示。

#### Scenario: 编辑器操作提示
```
Given: 用户在编辑器中执行操作
When: 操作完成
Then:
  - 清空画布 → 显示确认对话框
  - 导出为 PNG → 显示"下载成功"提示
  - 改变网格大小 → 显示确认对话框
  - 所有提示采用游戏引擎风格的对话框组件
```

---

### 需求 5：编辑器与页面的隔离

#### Requirement
编辑器应该在自己的作用域内工作，不与创作页面的其他部分产生冲突。

#### Scenario: JavaScript 作用域隔离
```
Given: Tilemap 编辑器在创作页面中
When: 编辑器 JavaScript 执行
Then:
  - 编辑器的全局变量不污染创作页面的命名空间
  - 编辑器的事件监听器只作用于编辑器容器
  - 创作页面的表单与编辑器相互独立
  - 通过明确的接口（方法调用）进行通信
```

---

### 需求 6：编辑器操作按钮继承

#### Requirement
编辑器现有的操作按钮（清空、撤销、重做、导出）应该继续可用。

#### Scenario: 编辑器功能完整性
```
Given: 用户在创作页面的编辑器中
When: 用户进行各种编辑操作
Then:
  - 点击图块 → 在画布上放置
  - 拖动放置 → 支持批量放置
  - 撤销按钮 → 撤销上一步操作
  - 重做按钮 → 重新应用被撤销的操作
  - 清空画布 → 清空所有图块
  - 改变网格大小 → 调整编辑区域大小
  - 导出为 PNG → 下载地图为图片
```

---

### 需求 7：创作流程整合

#### Requirement
游戏创作应该形成完整的工作流：填表 → 编辑 → 保存/发布。

#### Scenario: 完整的游戏创作流程
```
Given: 用户开始创建新游戏
When: 用户执行以下步骤
Then:

Step 1: 填写游戏信息
  - 输入游戏名称
  - 输入游戏描述

Step 2: 编辑游戏地图
  - 在编辑器中选择图块
  - 在画布上编辑地图
  - 使用撤销/重做调整细节

Step 3: 保存游戏
  - 点击"保存游戏"按钮
  - 后端收集表单和编辑器数据
  - 游戏保存为草稿状态
  - 返回"我的游戏"列表

Step 4: （可选）发布到广场
  - 点击"发布到广场"按钮
  - 游戏状态改为"已发布"
  - 其他用户能在广场中看到
```

---

## MODIFIED Requirements

### 修改 - 编辑器独立模式

#### Requirement
原有的 /tilemap-editor 路由应该保持可用，同时支持在创作页面中嵌入。

#### Scenario: 两种使用方式
```
方式 1：独立使用（向后兼容）
  - 访问 /tilemap-editor
  - 编辑器在独立页面中显示
  - 提供"导出为PNG"功能
  - 不涉及游戏保存

方式 2：集成使用（推荐）
  - 访问 /create-game
  - 编辑器在创作页面中显示
  - 与游戏信息表单结合
  - 点击按钮保存和发布游戏
```

---

### 修改 - 编辑器 UI 适配

#### Requirement
编辑器在创作页面中可能需要调整尺寸和布局以适应新的上下文。

#### Scenario: 编辑器尺寸调整
```
Given: 编辑器在不同页面中
When: 用户访问不同页面

在 /tilemap-editor：
  - Canvas: 512×512px（全屏优先）
  - 编辑器占据整个编辑区域

在 /create-game：
  - Canvas: 可能需要调整大小
  - 编辑器与表单分享屏幕空间
  - 需要支持响应式缩放
```

---

## REMOVED Requirements

### 移除 - 编辑器导出功能强绑定

#### Requirement
编辑器的"导出为PNG"功能应该保留，但不再是唯一的输出方式。

#### Scenario: 导出功能调整
```
Given: 用户在创作页面中编辑地图
When: 用户需要导出地图
Then:
  - 编辑器仍然提供"导出为PNG"按钮
  - 同时提供"保存游戏"（保存到数据库）
  - 用户可以选择不同的输出方式
```

---

## 集成点

### 前端集成

```html
<!-- create-game.html -->
<div class="creation-main">
  <!-- 游戏信息表单 -->
  <form id="game-form">
    <input type="text" id="game-name" placeholder="游戏名称">
    <textarea id="game-description"></textarea>
  </form>

  <!-- 编辑器容器 -->
  <div id="editor-container">
    <!-- Tilemap 编辑器组件 -->
    <!-- 通过 Thymeleaf 的 th:include 或 th:replace 嵌入 -->
  </div>

  <!-- 按钮 -->
  <button id="save-game">保存游戏</button>
  <button id="publish-game">发布到广场</button>
</div>
```

### JavaScript 集成

```javascript
// 创作页面的 JavaScript
class GameCreation {
    constructor() {
        this.editor = window.editor;  // 引用全局的编辑器实例
        this.gameForm = document.getElementById('game-form');
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('save-game').addEventListener('click', () => {
            this.saveGame('DRAFT');
        });

        document.getElementById('publish-game').addEventListener('click', () => {
            this.saveGame('PUBLISHED');
        });
    }

    saveGame(status) {
        // 从表单获取数据
        const gameData = {
            name: this.gameForm.querySelector('#game-name').value,
            description: this.gameForm.querySelector('#game-description').value,
            mapData: this.editor.getMapData(),  // 从编辑器获取地图数据
            status: status
        };

        // 发送到后端
        fetch('/api/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameData)
        })
        .then(response => response.json())
        .then(data => {
            Dialog.alert({
                title: '成功',
                message: `游戏${status === 'DRAFT' ? '已保存' : '已发布'}`,
                iconType: 'success'
            });
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new GameCreation();
});
```

### 后端集成

```java
// HomeController 中的编辑器加载逻辑
@GetMapping("/create-game/{gameId}")
public String editGame(@PathVariable Long gameId, Model model) {
    Game game = gameService.getGame(gameId);
    model.addAttribute("game", game);
    model.addAttribute("mapData", game.getMapData());  // 传递地图数据给前端
    return "create-game";
}
```

---

## 相关规格交叉引用

- 继承 [Tilemap Editor UX Design](../../optimize-editor-ux-design/specs/game-engine-theme/spec.md) - 编辑器主题
- 关联到 [Game Management](../game-management/spec.md) - 游戏保存和发布
- 关联到 [Homepage Portal](../homepage-portal/spec.md) - 首页入口

---

## 验收标准

- ✅ Tilemap 编辑器在 /create-game 页面中正常加载
- ✅ 编辑器的所有功能（选择、编辑、撤销、导出）都能正常使用
- ✅ 编辑器数据能正确传递到后端
- ✅ 加载现有游戏时，编辑器能正确恢复地图数据
- ✅ "保存游戏"和"发布到广场"按钮能正常工作
- ✅ 编辑器与表单之间没有冲突或数据丢失
- ✅ /tilemap-editor 路由仍然可访问（向后兼容）
- ✅ 编辑器在响应式布局中能正常显示

