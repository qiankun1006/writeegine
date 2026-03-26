# ai-portrait-generator Specification Delta

## MODIFIED Requirements

### Requirement: 素材类型选择

系统 SHALL 在素材类型选择器中提供骨骼素材生成选项。

#### Scenario: 用户选择骨骼素材生成类型
- **WHEN** 用户在素材类型选择器中选择「骨骼素材生成」
- **THEN** 系统显示骨骼素材专用参数面板
- **AND** 参数面板包含：风格选择、骨骼模板、参考图上传
- **AND** 参数面板显示输出部件预览（头、躯干、左臂、右臂、左腿、右腿）

#### Scenario: 用户配置骨骼素材生成参数
- **WHEN** 用户配置骨骼素材参数
- **THEN** 可选择风格：日系二次元、写实人体、Q版卡通、美式卡通、像素风
- **AND** 可选择骨骼模板：人体标准骨骼、动画骨骼
- **AND** 可上传参考图用于保持人物一致性
- **AND** 提示词输入用于描述角色特征

---

### Requirement: 骨骼素材生成

系统 SHALL 提供一次性生成完整人体骨骼部件的功能。

#### Scenario: 用户点击生成骨骼素材按钮
- **WHEN** 用户点击「开始生成」按钮且已选择骨骼素材类型
- **THEN** 系统显示生成进度，分阶段显示：
  - 0-70%: 生成全身图
  - 70-95%: 自动分割肢体
  - 95-100%: 完成
- **AND** 用户无法再次点击生成按钮

#### Scenario: 骨骼素材生成完成
- **WHEN** 后端返回生成完成结果
- **THEN** 结果展示区显示：
  - 完整人体图（全图预览）
  - 分离的肢体部件（6个独立图片）
- **AND** 每张图片可点击放大预览
- **AND** 用户可下载全部或单个部件

#### Scenario: 骨骼素材导出
- **WHEN** 用户点击导出按钮
- **THEN** 系统提供导出选项：
  - 下载全部部件（ZIP 压缩包）
  - 下载单个部件（PNG 透明底）
  - 下载完整人体图
- **AND** 导出格式为 PNG（透明背景）

---

### Requirement: 骨骼素材参数保存

系统 SHALL 保存用户选择的骨骼素材参数到 localStorage。

#### Scenario: 用户配置骨骼素材参数后刷新页面
- **WHEN** 用户关闭浏览器或刷新页面
- **THEN** 系统自动恢复以下参数：
  - 风格选择
  - 骨骼模板
  - 参考图（Base64）
  - 提示词

---

### Requirement: 骨骼素材生成错误处理

系统 SHALL 处理骨骼素材生成过程中的错误。

#### Scenario: 全身图生成失败
- **WHEN** AI 模型生成全身图失败
- **THEN** 系统显示错误提示
- **AND** 生成按钮恢复可用状态
- **AND** 提示用户修改提示词后重试

#### Scenario: 肢体分割失败
- **WHEN** SAM 模型分割肢体失败
- **THEN** 系统至少返回完整人体图
- **AND** 显示警告提示「自动分割失败，请手动裁剪」

---

## ADDED Requirements

### Requirement: 骨骼模板选择

系统 SHALL 提供骨骼模板选择功能。

#### Scenario: 用户选择骨骼模板
- **WHEN** 用户选择骨骼素材类型
- **THEN** 系统显示两个骨骼模板选项：
  - 「人体标准骨骼」- 符合真实人体比例
  - 「动画骨骼」- 适合动画制作的比例
- **AND** 默认选中「动画骨骼」

---

### Requirement: 风格 LoRA 切换

系统 SHALL 支持通过 LoRA 切换生成风格。

#### Scenario: 用户切换生成风格
- **WHEN** 用户在风格下拉框选择不同风格
- **THEN** 生成的骨骼素材自动应用对应风格
- **AND** 风格选项包括：日系二次元、写实人体、Q版卡通、美式卡通、像素风

---

### Requirement: 参考图一致性

系统 SHALL 支持上传参考图保持人物一致性。

#### Scenario: 用户上传参考图
- **WHEN** 用户上传角色参考图
- **THEN** 系统将参考图作为角色一致性控制
- **AND** 生成的骨骼部件保持参考图中的人物特征
- **AND** 参考图支持 PNG/JPG/WEBP 格式，大小 ≤10MB

---

## Cross-Reference

- Related to: skeleton-animation-ui (骨骼编辑功能)
- Related to: skeleton-animation-core (骨骼动画核心)
- Related to: game-asset-creator (游戏素材创作)

