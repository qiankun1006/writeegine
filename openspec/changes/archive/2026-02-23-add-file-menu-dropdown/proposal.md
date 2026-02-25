# 提案：为图片编辑器添加文件菜单下拉功能

## Why

当前图片编辑器的菜单栏中，"文件"按钮点击后仅显示一个提示文本，没有真正的菜单功能。用户无法进行导入、保存、另存为等基础的文件操作，严重影响编辑器的可用性。

添加文件菜单下拉功能将：
- 提供完整的文件管理能力
- 支持图片的导入、保存、导出等常用操作
- 建立菜单系统的基础架构，便于扩展其他菜单
- 提升用户体验，让编辑器更加实用

## What Changes

- 实现文件菜单下拉控制，当用户点击【文件】按钮时显示菜单选项
- 添加"导入"功能：用户可选择本地图片文件进行编辑
- 添加"保存"功能：保存当前编辑的文档（JSON 格式）
- 添加"另存为"功能：将文档另存为新文件
- 添加"导出为"功能：导出为图片格式（PNG、JPG）
- 创建菜单系统的通用样式和交互逻辑，为其他菜单（编辑、图像、图层、选择、滤镜、查看）奠定基础
- 集成文件 I/O 操作（后端支持）

## Impact

- Affected specs: image-editor-ui（新规范）
- Affected code:
  - `src/main/resources/static/js/image-editor/app.js` - 菜单事件处理
  - `src/main/resources/static/js/image-editor/ImageEditor.js` - 编辑器核心逻辑
  - `src/main/resources/static/css/image-editor.css` - 菜单样式
  - `src/main/resources/templates/create-game-image.html` - HTML 结构更新
  - `src/main/java/com/example/writemyself/controller/ImageEditorController.java` - 后端文件处理接口

