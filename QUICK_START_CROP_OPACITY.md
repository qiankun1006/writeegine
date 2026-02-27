# 🚀 快速开始指南 - 裁剪与透明度工具

## 📦 新增功能

### ✂️ 裁剪工具 (CropTool)
- **用途**: 无损质量裁剪图片
- **快捷键**: `C`
- **特点**: 8 个控制点，精确裁剪，支持数值输入

### 👻 透明度工具 (OpacityTool)
- **用途**: 调整图层透明度和区域透明度
- **快捷键**: `O`
- **特点**: 支持笔刷模式，白色背景自动转换，灵活配置

---

## 🎯 快速使用

### 1. 使用裁剪工具

**步骤**:
1. 点击工具栏的 ✂️ 按钮（或按 `C`）
2. 在画布上拖拽鼠标创建裁剪框
3. 拖拽控制点调整裁剪区域
4. 点击 "✓ 应用裁剪" 完成

**精确裁剪**:
- 打开右侧控制面板
- 直接输入 X、Y、宽、高 数值
- 点击 "✓ 应用裁剪"

---

### 2. 使用透明度工具

**全局透明度**:
1. 点击工具栏的 👻 按钮（或按 `O`）
2. 选择模式: "全局透明度"
3. 点击 "✓ 启用透明通道"
4. 选择新的透明度值

**笔刷透明度**:
1. 点击工具栏的 👻 按钮
2. 选择模式: "笔刷透明度"
3. 调整参数:
   - **笔刷大小**: 5-200px
   - **笔刷硬度**: 0-100%
   - **透明度**: 0-100%
4. 在画布上拖拽应用效果

**快速转换背景**:
1. 选择透明度工具
2. 点击 "🎨 转换为透明"
3. 所有白色背景变为透明

---

## 📁 文件清单

### 新增文件
| 文件 | 说明 |
|------|------|
| `CropTool.js` | 裁剪工具实现 |
| `OpacityTool.js` | 透明度工具实现 |
| `CROP_OPACITY_GUIDE.md` | 详细使用指南 |
| `tools-test.js` | 自动化测试脚本 |
| `IMAGE_EDITOR_CROP_OPACITY_SUMMARY.md` | 完整实现总结 |
| `QUICK_START_CROP_OPACITY.md` | 本文档 |

### 修改文件
| 文件 | 修改内容 |
|------|---------|
| `Layer.js` | 添加 4 个新方法 |
| `ImageEditor.js` | 注册新工具 |
| `image-editor.css` | 添加 UI 样式 |
| `create-game-image.html` | 添加按钮和脚本 |

---

## 🔗 链接导航

- 📖 [详细使用指南](./src/main/resources/static/js/image-editor/tools/CROP_OPACITY_GUIDE.md)
- 📊 [完整实现总结](./IMAGE_EDITOR_CROP_OPACITY_SUMMARY.md)
- 🧪 [测试脚本](./src/main/resources/static/js/image-editor/tools-test.js)

---

## 💡 常用技巧

### 裁剪技巧

**提示**: 使用 Shift 键拖拽可保持宽高比例（未来版本）

```
1. 快速裁正方形: 输入相同的宽和高
2. 精确定位: 使用右侧面板输入坐标
3. 预览构图: 九宫格网格帮助构图
```

### 透明度技巧

**提示**: 多次点击笔刷可以层叠效果

```
1. 柔和过渡: 调低硬度，多次涂抹
2. 精确删除: 调高硬度，一次涂抹
3. 快速清洁: 使用"转换为透明"功能
```

---

## ⌨️ 快捷键速查

| 功能 | 快捷键 |
|------|--------|
| 裁剪工具 | `C` |
| 透明度工具 | `O` |
| 撤销 | `Ctrl+Z` |
| 重做 | `Ctrl+Y` |

---

## 🧪 测试新功能

在浏览器控制台运行:
```javascript
// 运行完整测试
cropOpacityTests.runAllTests();

// 或单独测试
cropOpacityTests.testCropTool();
cropOpacityTests.testOpacityTool();
cropOpacityTests.testLayerEnhancements();
cropOpacityTests.testEditorIntegration();
```

---

## 🔧 API 简易查询

### Layer 对象新增方法

```javascript
const layer = editor.document.getActiveLayer();

// 启用透明通道
layer.enableAlphaChannel();

// 白色转透明
layer.convertWhiteToTransparent(240);

// 区域透明度
layer.adjustRegionOpacity(100, 100, 200, 200, 0.5);

// 笔刷透明度
layer.applyOpacityBrush(150, 150, 30, 0.7, 0.8);
```

---

## 📱 浏览器兼容性

✅ Chrome/Chromium 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

---

## 🆘 常见问题

**Q: 裁剪后图片变小了吗?**
A: 是的，图层尺寸会变为裁剪框的大小。

**Q: 如何恢复被裁剪的部分?**
A: 使用 Ctrl+Z 撤销，或使用Undo历史面板。

**Q: 透明度工具可以恢复被删除的内容吗?**
A: 不可以，透明度工具只能让像素变透明。恢复请使用撤销功能。

**Q: 如何在JPG中保持透明?**
A: 不能。JPG 不支持透明通道，请导出为 PNG 格式。

---

## 🎬 使用场景示例

### 场景 1: 剪裁证件照
1. 导入证件照
2. 使用裁剪工具 → 选择合适比例
3. 应用裁剪
4. 导出 PNG

### 场景 2: 创建透明背景图标
1. 导入有白色背景的图标
2. 使用透明度工具
3. 点击"转换为透明"
4. 如需微调，使用笔刷模式
5. 导出 PNG

### 场景 3: 渐变透明效果
1. 导入图像
2. 启用透明通道
3. 调整笔刷参数（大硬度，低透明度）
4. 在图像边缘多次涂抹
5. 创建逐渐消失的效果

---

## 📞 技术支持

如有问题，请查阅:
1. 详细指南: `CROP_OPACITY_GUIDE.md`
2. 测试脚本: `tools-test.js`
3. 实现总结: `IMAGE_EDITOR_CROP_OPACITY_SUMMARY.md`

---

**开始使用吧！🎉**

访问 http://localhost:8083/create-game/image 来体验新功能！

