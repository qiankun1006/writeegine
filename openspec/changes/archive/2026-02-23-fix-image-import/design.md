## 上下文
图片编辑器的导入功能是基础功能之一，允许用户将本地图片文件加载到编辑器中。当前实现存在以下问题：
1. 图片导入后画布大小变化但不显示图片
2. 缺少详细的错误反馈
3. 导入流程中的错误处理不完善

## 目标/非目标
### 目标：
- 修复图片导入功能，确保图片正确显示
- 提供详细的导入进度和错误反馈
- 完善错误处理机制
- 确保导入功能符合OpenSpec规范

### 非目标：
- 支持批量导入多个文件
- 实现图片预处理（如自动调整尺寸）
- 添加高级导入选项（如导入为智能对象）

## 技术决策
### 决策1：修复Layer类构造函数
**问题**：Layer构造函数中，如果options.width或options.height为0，会使用默认值0，导致图层尺寸为0。

**解决方案**：
```javascript
class Layer {
  constructor(options = {}) {
    // 确保width和height有有效值
    this.width = options.width > 0 ? options.width : 800; // 默认值
    this.height = options.height > 0 ? options.height : 600; // 默认值

    // 创建canvas时使用实际尺寸
    this.canvas = options.canvas || this._createCanvas();
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
}
```

### 决策2：优化导入流程错误处理
**问题**：当前错误处理不完善，用户无法知道导入失败的原因。

**解决方案**：
1. 添加详细的调试日志
2. 实现分阶段的错误处理
3. 提供用户友好的错误提示

```javascript
// 在MenuManager.js中添加
async handleImport() {
  try {
    console.log('开始导入流程...');

    // 阶段1：文件选择
    if (!this.fileInput) {
      throw new Error('文件输入控件未找到');
    }

    // 阶段2：文件读取
    const file = await this._readFile();

    // 阶段3：图片加载
    const img = await this._loadImage(file);

    // 阶段4：图层创建
    const layer = await this._createImageLayer(img, file.name);

    // 阶段5：添加到文档
    await this._addLayerToDocument(layer);

    console.log('导入完成');
  } catch (error) {
    console.error('导入失败:', error);
    this._showError(error.message);
  }
}
```

### 决策3：完善渲染流程
**问题**：画布尺寸更新后，渲染器可能没有正确重绘。

**解决方案**：
1. 确保文档尺寸更新后通知渲染器
2. 重置视口设置以适应新尺寸
3. 强制重绘整个画布

```javascript
// 在导入完成后调用
async _addLayerToDocument(layer) {
  // 更新文档尺寸
  this.editor.document.width = layer.width;
  this.editor.document.height = layer.height;

  // 更新canvas尺寸
  this.editor.canvas.width = layer.width;
  this.editor.canvas.height = layer.height;

  // 重置渲染器视口
  this.editor.renderer.viewport.reset();
  this.editor.renderer.viewport.fitToDocument(this.editor.document);

  // 添加图层
  this.editor.document.addLayer(layer);

  // 强制重绘
  this.editor.render();
}
```

## 风险与权衡
### 风险1：性能问题
- **风险**：大图片导入可能导致内存占用过高
- **缓解**：添加文件大小限制和加载进度显示

### 风险2：浏览器兼容性
- **风险**：不同浏览器对File API的支持可能不同
- **缓解**：使用标准的FileReader API，添加降级处理

### 风险3：用户体验
- **风险**：导入过程缺乏反馈，用户可能认为功能失效
- **缓解**：添加加载动画和进度提示

## 迁移计划
无需迁移，这是修复现有功能。

## 开放问题
1. 是否应该支持拖放导入？
2. 是否应该添加图片预览功能？
3. 是否应该支持导入时的图片预处理？

