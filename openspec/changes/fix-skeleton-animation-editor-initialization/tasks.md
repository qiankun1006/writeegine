# 修复骨骼动画编辑器初始化 - 任务清单

## 1. 诊断和分析
- [ ] 1.1 确认 SkeletonAnimationEditor.js 的实际位置和接口
- [ ] 1.2 验证 layout.html 中的脚本加载顺序
- [ ] 1.3 分析 FrameSequenceEditor.js 中的初始化逻辑
- [ ] 1.4 确认 character-frame-sequence.html 中的初始化问题

## 2. 修复页面脚本加载
- [ ] 2.1 从 character-frame-sequence.html 中移除 fragment 内的 `<script>` 标签（行 90-111）
- [ ] 2.2 确认所有必要的骨骼动画脚本已在 layout.html 中正确加载
- [ ] 2.3 验证脚本加载顺序（core → ui → tools）

## 3. 修复初始化逻辑
- [ ] 3.1 更新 character-frame-sequence.html 页面的初始化代码，使用正确的 ImageEditorAdapter 模式
- [ ] 3.2 调用 FrameSequenceEditor.js 中的 `initFrameSequenceEditor()` 函数而不是直接实例化
- [ ] 3.3 添加清晰的错误处理和日志

## 4. 验证修复
- [ ] 4.1 在浏览器中打开 http://localhost:8083/create-game/asset/character-frame-sequence
- [ ] 4.2 检查浏览器控制台是否有错误
- [ ] 4.3 验证骨骼编辑器是否正确初始化和显示
- [ ] 4.4 测试基本功能（创建骨骼、编辑骨骼等）

## 5. 文档更新
- [ ] 5.1 更新 project.md 中关于【动画帧序列编辑】页面的初始化模式
- [ ] 5.2 添加初始化问题的诊断指南

