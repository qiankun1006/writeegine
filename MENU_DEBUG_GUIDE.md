# 文件菜单调试指南

## 问题症状
- 点击菜单栏的【文件】按钮没有反应
- HTML 源代码中有菜单相关代码，但功能无法使用

## 可能的原因

### 原因1：MenuManager.js 文件未被正确加载
- **症状**：浏览器控制台显示 "FileMenuManager class not found"
- **解决**：确保 MenuManager.js 已经部署到服务器

### 原因2：编译缓存问题
- **症状**：代码已修改但浏览器显示旧的行为
- **解决**：清理缓存后重新构建和部署

## 调试步骤

### 步骤 1：打开浏览器开发者工具
1. 在浏览器中按 `F12` 打开开发者工具
2. 切换到 "Console" 标签页

### 步骤 2：刷新页面并观察日志
1. 刷新页面（Ctrl+R 或 Cmd+R）
2. 在 Console 中观察以下日志：

```
Initializing file menu...
✓ File menu initialized successfully
```

如果看到这些日志，说明菜单已正确初始化。

### 步骤 3：点击文件菜单按钮
1. 点击页面上菜单栏的【文件】按钮
2. 在 Console 中应该看到：

```
Menu button clicked
Toggle menu, current state: false
Opening menu
Menu opened, container display: block
```

### 步骤 4：查看菜单是否显示
- 如果控制台有上述日志，检查页面上是否看到下拉菜单
- 如果页面上没有看到菜单，可能是 CSS 样式问题

## 常见问题排查

### 问题 A：控制台显示错误信息

#### 错误：`MenuManager class not found`
**原因**：MenuManager.js 加载失败
**解决**：
1. 检查网络请求（Console 中查看网络标签）
2. 确保文件在服务器上：
   ```bash
   ls -l target/classes/static/js/image-editor/MenuManager.js
   ```
3. 如果不存在，复制文件：
   ```bash
   cp src/main/resources/static/js/image-editor/MenuManager.js \
      target/classes/static/js/image-editor/MenuManager.js
   ```

#### 错误：`Menu elements not found`
**原因**：HTML 元素不存在或 ID 不匹配
**解决**：
1. 检查 HTML 中是否有 `id="menuFile"` 和 `id="fileMenuDropdown"`
2. 刷新页面后重新检查

### 问题 B：菜单点击后没有反应

**可能原因**：
1. CSS 样式问题 - 菜单显示但看不见
2. 事件监听器未正确附加

**调试**：
1. 在 Console 中输入：
   ```javascript
   document.getElementById('fileMenuDropdown').style
   ```
   检查是否正确显示了 `display: block`

2. 检查 CSS 类：
   ```javascript
   document.getElementById('fileMenuDropdown').classList
   ```
   应该包含 `'show'` 类

### 问题 C：菜单项点击后没有反应

**调试步骤**：
1. 点击菜单项后，在 Console 中查看是否显示：
   ```
   Menu item clicked, action: [action-name]
   ```

2. 如果没有看到，尝试直接触发：
   ```javascript
   window.fileMenuManager.onMenuItemClick('import')
   ```

## 快速修复清单

- [ ] 确保 MenuManager.js 已复制到 `target/classes/static/js/image-editor/`
- [ ] 确保最新的 HTML、CSS、JS 文件已部署
- [ ] 清理浏览器缓存（Ctrl+Shift+Delete）
- [ ] 重新启动应用服务器
- [ ] 使用完全新的浏览器标签页测试
- [ ] 检查浏览器 Console 中的所有错误信息

## 正常工作的日志示例

### 初始化：
```
Initializing file menu...
menuFileBtn: <button class="menu-btn" id="menuFile">文件</button>
menuFileDropdown: <div class="file-menu-dropdown" id="fileMenuDropdown" style="display: none;">...</div>
FileMenuManager class: function
editor object: ImageEditor {canvas: canvas#editorCanvas, options: {...}, ...}
✓ File menu initialized successfully
```

### 菜单交互：
```
Menu button clicked
Toggle menu, current state: false
Opening menu
Adjusting menu position, rect: DOMRect {...}
Menu opened, container display: block
Menu button clicked
Closing menu
```

### 菜单项操作：
```
Container clicked, target: <button class="menu-item" data-action="import" ...>
Menu item clicked, action: import
Closing menu
```

## 联系支持

如果问题仍未解决，请提供以下信息：
1. 浏览器类型和版本
2. Console 中的完整错误信息
3. Network 标签中 MenuManager.js 的加载状态
4. 应用启动时的日志

## 临时禁用调试日志

调试完成后，可以删除 app.js 和 MenuManager.js 中的 `console.log()` 调用以提升性能。

