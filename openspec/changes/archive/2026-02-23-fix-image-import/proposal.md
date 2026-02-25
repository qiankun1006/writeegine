# 变更：修复图片导入功能

## Why
当前【文件】->【导入】功能存在以下问题：
1. 用户选择本地图片文件后，画布大小发生变化但没有显示图片
2. 导入流程中的错误处理不完善，导致用户无法知道导入失败的原因
3. 缺少对导入功能的详细规范和测试场景

这些问题影响了用户体验，使得图片编辑器的基础功能无法正常使用。

## What Changes
- **修复Layer类构造函数**：确保导入图片时创建的图层具有正确的尺寸
- **完善图片加载流程**：添加更详细的错误处理和调试信息
- **优化渲染流程**：确保画布尺寸更新后渲染器能正确重绘
- **增强用户反馈**：在导入过程中提供进度提示和结果反馈
- **添加导入功能规范**：在OpenSpec中明确导入功能的要求和场景

## Impact
- Affected specs: image-editor-core
- Affected code:
  - `src/main/resources/static/js/image-editor/Layer.js`
  - `src/main/resources/static/js/image-editor/MenuManager.js`
  - `src/main/resources/static/js/image-editor/app.js`
  - `src/main/resources/templates/create-game-image.html`

