# 图片编辑器 - 裁剪与透明度功能指南

## 功能概述

本次更新为图片编辑器添加了两个强大的新工具，用于图片处理中的高级操作。

### 1. 裁剪工具 (CropTool) ✂️

#### 功能特点
- **无损质量裁剪**: 使用 Canvas 的 `getImageData` 和 `putImageData` 方法，确保裁剪不会丢失图像质量
- **灵活的裁剪框**: 支持自由拖拽选择或调整裁剪区域
- **8 个控制点**: 角点和边中点，支持自由调整裁剪大小和位置
- **九宫格网格预览**: 帮助用户构图

#### 使用方式

1. **激活工具**: 点击工具栏中的 ✂️ (裁剪) 按钮，或按快捷键 `C`
2. **创建裁剪框**:
   - 在画布上拖拽鼠标创建裁剪框
   - 或使用右侧面板的数值输入精确指定位置和尺寸
3. **调整裁剪框**:
   - 拖拽控制点调整尺寸
   - 拖拽边框移动位置
4. **应用裁剪**: 点击 "✓ 应用裁剪" 按钮
5. **取消裁剪**: 点击 "✗ 取消" 按钮放弃操作

#### API 使用

```javascript
// 获取当前活跃图层
const layer = editor.document.getActiveLayer();

// 直接调用裁剪 (无需使用 UI)
const cropTool = editor.toolManager.tools.crop;
cropTool.cropState.cropBox = { x: 10, y: 20, width: 200, height: 150 };
cropTool.applyCrop();
```

---

### 2. 透明度工具 (OpacityTool) 👻

#### 功能特点
- **Alpha 通道支持**: 自动为图层启用透明通道支持
- **两种模式**:
  - **全局透明度**: 调整整个图层的不透明度
  - **笔刷透明度**: 使用可定制的透明度笔刷在指定区域应用透明效果
- **可调参数**:
  - 笔刷大小 (5-200px)
  - 笔刷硬度 (0-100%)
  - 透明度强度 (0-100%)
- **便捷功能**:
  - 将白色背景转换为透明 (智能阈值)
  - 转换指定颜色为透明

#### 使用方式

1. **激活工具**: 点击工具栏中的 👻 (透明度) 按钮，或按快捷键 `O`
2. **选择模式**:
   - **全局模式**: 点击 "✓ 启用透明通道" 启用 Alpha 通道，然后选择全局透明度模式
   - **笔刷模式**: 从下拉菜单选择 "笔刷透明度"
3. **笔刷模式操作**:
   - 调整笔刷大小、硬度和透明度
   - 在画布上拖拽应用透明度效果
4. **便捷转换**:
   - 点击 "🎨 转换为透明" 将白色背景转换为透明

#### API 使用

```javascript
const layer = editor.document.getActiveLayer();

// 启用 Alpha 通道
layer.enableAlphaChannel();

// 调整全局透明度
layer.opacity = 0.5; // 50% 不透明度

// 调整指定区域的透明度
layer.adjustRegionOpacity(100, 100, 200, 200, 0.5); // 在 (100,100) 位置的 200x200 区域，透明度设为 50%

// 应用透明度笔刷
layer.applyOpacityBrush(
  150, 150,      // 笔刷中心位置 (x, y)
  40,            // 笔刷大小
  0.7,           // 透明度强度 (0-1)
  0.8            // 笔刷硬度 (0-1)
);

// 将白色背景转换为透明
layer.convertWhiteToTransparent(240); // 阈值 (0-255)
```

---

## Layer 类新增方法

### `enableAlphaChannel()`
启用图层的透明通道 (Alpha Channel) 支持。
- **返回**: `boolean` - 成功返回 true
- **副作用**: 创建支持透明的新 canvas

### `convertWhiteToTransparent(threshold = 240)`
将接近白色的像素转换为透明。
- **参数**: `threshold` (0-255) - 颜色阈值，默认 240
- **返回**: `boolean` - 成功返回 true

### `adjustRegionOpacity(x, y, width, height, alphaValue)`
调整指定矩形区域的透明度。
- **参数**:
  - `x, y`: 矩形左上角坐标
  - `width, height`: 矩形尺寸
  - `alphaValue`: 透明度 (0-1)
- **返回**: `boolean` - 成功返回 true

### `applyOpacityBrush(x, y, brushSize, opacityValue, brushHardness = 0.7)`
使用透明度笔刷在指定位置应用效果。
- **参数**:
  - `x, y`: 笔刷中心坐标
  - `brushSize`: 笔刷大小 (像素)
  - `opacityValue`: 透明度强度 (0-1)
  - `brushHardness`: 笔刷硬度 (0-1)
- **返回**: `boolean` - 成功返回 true

---

## 文档保存和恢复

### 透明通道状态保存
透明度工具状态会自动保存到文档 JSON:
- `hasAlphaChannel`: 布尔值，表示是否启用了 Alpha 通道
- Canvas 数据使用 PNG 格式，本身就支持透明通道

### 恢复文档
从保存的 JSON 恢复文档时，透明通道状态会被自动恢复:
```javascript
const doc = await Document.fromJSON(savedJSON);
// 所有 Alpha 通道状态都已自动恢复
```

---

## 技术实现细节

### 裁剪工具架构
- **鼠标交互**: 支持拖拽创建和调整裁剪框
- **控制点检测**: 8 个调整控制点，可精确调整裁剪区域
- **无损处理**: 直接在 ImageData 像素级别进行裁剪
- **UI 面板**: 支持数值输入精确设置

### 透明度工具架构
- **Alpha 通道**: 图层 canvas 自动转换为支持透明的格式
- **笔刷算法**: 使用径向渐变生成柔和的笔刷形状
- **合成模式**: 使用 `destination-out` 实现透明效果
- **像素操作**: 直接修改 ImageData 的 alpha 通道值

---

## 快捷键总结

| 功能 | 快捷键 |
|------|--------|
| 裁剪工具 | C |
| 透明度工具 | O |

---

## 注意事项

1. **性能考虑**:
   - 大尺寸图像的透明度操作可能耗时较长
   - 建议先降低分辨率再进行复杂操作

2. **兼容性**:
   - 裁剪和透明度功能在所有现代浏览器中都完全支持
   - 使用标准的 Canvas API，不依赖任何第三方库

3. **撤销/重做**:
   - 所有操作都支持撤销和重做功能
   - 使用 `Ctrl+Z` 撤销，`Ctrl+Y` 重做

4. **导出**:
   - PNG 格式保持透明通道
   - JPG 格式会将透明区域转换为白色背景

---

## 更新日志

### Version 1.0 (2026-02-27)
- ✨ 新增裁剪工具 (CropTool)
  - 无损质量图像裁剪
  - 8 个控制点调整
  - 九宫格预览网格
- ✨ 新增透明度工具 (OpacityTool)
  - Alpha 通道支持
  - 全局和笔刷两种模式
  - 白色背景自动转换
- 📝 更新 Layer 类
  - 添加 enableAlphaChannel()
  - 添加 convertWhiteToTransparent()
  - 添加 adjustRegionOpacity()
  - 添加 applyOpacityBrush()
- 🎨 添加 UI 面板和样式
  - 裁剪控制面板
  - 透明度设置面板
  - 工具提示信息

