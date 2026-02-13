# Spec: UI Feedback and Interaction Improvements

## ADDED Requirements

#### Requirement: 友好的对话框交互反馈

所有重要操作（如清空画布、切换网格大小）应该使用美观、友好的对话框，而不是简单的 `confirm()` 。

##### Scenario: 切换网格大小对话框

- 给定：用户点击网格大小下拉菜单
- 当：用户选择与当前不同的网格大小
- 那么：应该显示自定义对话框，而不是 `confirm()`
- 并且：对话框应该显示当前网格大小和要改变到的新大小
- 并且：对话框应该提示"改变后当前画布将被清空"
- 并且：对话框应该有"取消"和"确认更改"两个按钮
- 并且：对话框应该具有游戏引擎风格的外观

##### Scenario: 清空画布对话框

- 给定：用户点击"清空画布"按钮
- 当：按钮被激活
- 那么：应该显示自定义对话框，而不是 `confirm()`
- 并且：对话框应该显示警告图标
- 并且：对话框标题应该是"清空画布"
- 并且：对话框应该提示操作无法撤销，但可以使用"撤销"功能恢复
- 并且：对话框应该有"取消"和"清空画布"两个按钮
- 并且："清空画布"按钮应该使用红色（危险）风格

##### Scenario: 对话框样式和行为

- 给定：自定义对话框显示
- 当：用户查看对话框
- 那么：对话框应该有半透明黑色背景
- 并且：对话框本身应该使用深色游戏引擎风格卡片
- 并且：对话框应该有标题、消息和详细描述
- 并且：对话框应该支持按 Esc 键关闭
- 并且：对话框应该支持 Tab 键在按钮间导航

## Dialog Component Specification

### HTML 结构

```html
<div class="dialog-overlay" id="dialog-overlay">
  <div class="dialog-box">
    <!-- 对话框头部 -->
    <div class="dialog-header">
      <h2 class="dialog-title">对话框标题</h2>
      <button class="dialog-close" aria-label="关闭">&times;</button>
    </div>

    <!-- 对话框内容 -->
    <div class="dialog-content">
      <div class="dialog-icon"></div>
      <p class="dialog-message">主要消息</p>
      <p class="dialog-detail">详细描述信息</p>
    </div>

    <!-- 对话框按钮 -->
    <div class="dialog-buttons">
      <button class="btn btn-secondary">取消</button>
      <button class="btn btn-primary">确认</button>
    </div>
  </div>
</div>
```

### CSS 样式

```css
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog-box {
  background: linear-gradient(135deg, #1a1f2e 0%, #252d3d 100%);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #00d4ff;
  margin: 0;
}

.dialog-close {
  background: none;
  border: none;
  color: #a0a1a2;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
}

.dialog-close:hover {
  color: #e8e9ea;
}

.dialog-content {
  margin-bottom: 20px;
}

.dialog-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-icon.warning {
  background: rgba(255, 176, 0, 0.1);
  border-radius: 50%;
  color: #ffb000;
  font-size: 24px;
}

.dialog-message {
  font-size: 14px;
  color: #e8e9ea;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.dialog-detail {
  font-size: 12px;
  color: #a0a1a2;
  margin: 0;
  line-height: 1.5;
}

.dialog-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.dialog-buttons .btn {
  min-width: 100px;
  padding: 10px 16px;
}
```

### JavaScript 实现

```javascript
class Dialog {
  constructor(options) {
    this.options = {
      title: '对话框',
      message: '',
      detail: '',
      icon: null,  // 'warning', 'info', 'success', 'error'
      buttons: [
        { text: '取消', action: 'cancel', style: 'secondary' },
        { text: '确认', action: 'confirm', style: 'primary' }
      ],
      ...options
    };

    this.element = null;
    this.result = null;
  }

  render() {
    // 创建对话框 HTML
    // 绑定事件监听
    // 返回 Promise
  }

  show() {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.render();
    });
  }

  close(result) {
    this.element.remove();
    this.resolve(result);
  }
}

// 使用示例
const dialog = new Dialog({
  title: '清空画布',
  icon: 'warning',
  message: '即将清空所有绘制内容',
  detail: '清空后，已绘制的所有图块将被删除。你仍然可以使用"撤销"来恢复最后的操作。',
  buttons: [
    { text: '取消', action: 'cancel', style: 'secondary' },
    { text: '清空画布', action: 'confirm', style: 'danger' }
  ]
});

dialog.show().then(result => {
  if (result === 'confirm') {
    // 执行清空操作
  }
});
```

## Integration with Existing Code

### 修改 TilemapEditor 类

```javascript
// 原代码
clearCanvas() {
  if (confirm('确定要清空画布吗？')) {
    // ...清空逻辑
  }
}

// 新代码
clearCanvas() {
  const dialog = new Dialog({
    title: '清空画布',
    icon: 'warning',
    message: '即将清空所有绘制内容',
    detail: '清空后，已绘制的所有图块将被删除。',
    buttons: [
      { text: '取消', action: 'cancel' },
      { text: '清空画布', action: 'confirm', style: 'danger' }
    ]
  });

  dialog.show().then(result => {
    if (result === 'confirm') {
      // ...清空逻辑
    }
  });
}

// 修改网格大小
changeGridSize(newSize) {
  if (newSize === this.gridSize) return;
  if (this.placedCount.textContent !== '0') {
    const dialog = new Dialog({
      title: '更改网格尺寸',
      message: `当前网格大小: ${this.gridSize}×${this.gridSize}`,
      detail: '网格尺寸更改后，当前画布内容将被清空。此操作无法撤销。',
      buttons: [
        { text: '取消', action: 'cancel' },
        { text: '确认更改', action: 'confirm', style: 'primary' }
      ]
    });

    dialog.show().then(result => {
      if (result === 'confirm') {
        // ...更改网格尺寸逻辑
      }
    });
  } else {
    // ...无内容时直接更改
  }
}
```

## Accessibility Requirements

- [ ] 对话框支持 Esc 键关闭
- [ ] 对话框支持 Tab 键在按钮间导航
- [ ] 对话框具有 `role="dialog"`
- [ ] 关闭按钮具有 `aria-label`
- [ ] 颜色对比度达到 WCAG AA 标准

## Files Affected

- `src/main/resources/static/js/tilemap-editor.js` - Dialog 类和集成
- `src/main/resources/static/css/tilemap-editor.css` - 对话框样式

