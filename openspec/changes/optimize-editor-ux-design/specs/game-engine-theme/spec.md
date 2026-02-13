# Spec: Game Engine Theme and Visual Design

## MODIFIED Requirements

#### Requirement: 游戏引擎风格的深色科技感主题

整个编辑器应该采用专业的游戏引擎风格视觉设计，具有深色科技感，提升 toC 产品的高端感。

##### Scenario: 页面背景和全局样式

- 给定：用户访问 Tilemap 编辑器页面
- 当：页面加载完成
- 那么：背景应该显示深色渐变（深灰蓝色）
- 并且：背景应该是固定的，不随滚动而移动
- 并且：整个页面应该具有游戏引擎编辑器的专业感

##### Scenario: 面板卡片的玻璃态效果

- 给定：编辑页面显示
- 当：查看图块选择面板和编辑区域
- 那么：两个面板应该具有半透明背景（玻璃态）
- 并且：应该使用 `backdrop-filter: blur()` 创建高斯模糊效果
- 并且：面板边框应该是青蓝色的细线条
- 并且：面板应该有适当的阴影增强立体感

##### Scenario: 按钮的现代风格

- 给定：用户查看工具栏按钮
- 当：不同类型的按钮显示
- 那么：主按钮（导出）应该使用青蓝色渐变
- 并且：危险按钮（清空）应该使用红色渐变
- 并且：次要按钮（撤销、重做）应该使用浅色透明风格
- 并且：所有按钮应该在悬停时有发光效果和上升动画

## Design System

### 颜色定义

```css
:root {
  /* 背景色 */
  --bg-primary: #0f1419;      /* 深灰蓝 */
  --bg-secondary: #1a1f2e;    /* 深紫蓝 */
  --bg-dark: #0a0e16;         /* 极深色 */

  /* 强调色 */
  --color-primary: #00d4ff;   /* 青蓝 */
  --color-primary-light: #33e0ff;
  --color-primary-dark: #0099cc;

  /* 状态色 */
  --color-success: #00ff88;   /* 绿色 */
  --color-warning: #ffb000;   /* 橙色 */
  --color-danger: #ff3333;    /* 红色 */

  /* 文字色 */
  --text-primary: #e8e9ea;    /* 主文字 */
  --text-secondary: #a0a1a2;  /* 次文字 */
  --text-tertiary: #505355;   /* 暗文字 */

  /* 阴影 */
  --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.5);
}
```

### 背景样式

```css
body {
  background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%);
  background-attachment: fixed;
  color: var(--text-primary);
}
```

### 面板卡片样式

```css
.tile-selector-panel,
.editor-panel {
  background: rgba(26, 31, 46, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 212, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### 按钮样式

#### 主按钮

```css
.btn-primary {
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(0);
}
```

#### 危险按钮

```css
.btn-danger {
  background: linear-gradient(135deg, #ff3333 0%, #cc0000 100%);
  border: 1px solid rgba(255, 51, 51, 0.3);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(255, 51, 51, 0.2);
}

.btn-danger:hover {
  box-shadow: 0 6px 20px rgba(255, 51, 51, 0.4);
  transform: translateY(-2px);
}
```

#### 次要按钮

```css
.btn-secondary {
  background: rgba(160, 161, 162, 0.15);
  border: 1px solid rgba(160, 161, 162, 0.3);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.3);
}
```

### 分隔符样式

```css
.resizable-divider {
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(0, 212, 255, 0.3) 50%,
    transparent 100%);
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.1);
}

.resizable-divider:hover {
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(0, 212, 255, 0.6) 50%,
    transparent 100%);
  box-shadow: 0 0 16px rgba(0, 212, 255, 0.3);
}

.resizable-divider.active {
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(0, 212, 255, 0.8) 50%,
    transparent 100%);
  box-shadow: 0 0 24px rgba(0, 212, 255, 0.5);
}
```

## Animations

```css
@keyframes glow {
  0%, 100% { box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2); }
  50% { box-shadow: 0 4px 25px rgba(0, 212, 255, 0.4); }
}

.btn-primary:hover {
  animation: glow 2s ease-in-out;
}
```

## Files Affected

- `src/main/resources/templates/layout.html` - 全局背景样式
- `src/main/resources/static/css/tilemap-editor.css` - 所有组件样式

