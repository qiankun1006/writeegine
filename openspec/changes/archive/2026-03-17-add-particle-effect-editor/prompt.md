# 原始用户需求 (Prompt)

## 用户请求
/openspec/proposal 粒子效果生成，比如火焰，灰尘，等，你会写吗，帮我加在http://localhost:8083/create-game/asset页面。 请帮我编写一个**基于 Vue3 + Vite + TypeScript 的在线粒子编辑器**，核心要求如下：

### 技术栈
- Vue3 + Vite + TypeScript + Canvas + Element Plus（UI组件） + FileSaver.js（文件导出）

### 核心功能
#### （1）增强导出能力（核心）
- **LibGDX 格式**：导出 .p 文件 + 纹理图集（TextureAtlas）.atlas 文件 + 合并后的纹理 PNG；
- **PNG 格式**：支持导出「粒子纹理原图」「效果截图」「纹理图集大图」三种 PNG；
- **JSON 格式**：导出包含所有发射器、纹理、参数的完整配置；
- **批量导出**：一键导出「.p + .atlas + 纹理PNG」压缩包（ZIP格式）；

#### （2）纹理增强
- 支持上传多张 PNG 图片，合并为纹理图集（TextureAtlas）；
- 支持纹理预览、裁剪、缩放，模拟 LibGDX TextureRegion 逻辑；

### 技术要求
- 使用 TypeScript 定义完整类型（粒子参数、导出格式、纹理信息）；
- 粒子渲染逻辑与 LibGDX 1:1 对齐（参考 LibGDX 官方源码）；
- PNG 导出支持高清分辨率（可自定义截图尺寸）；
- 性能优化：粒子对象池、纹理缓存、requestAnimationFrame 帧率控制；

### UI/UX
- 深色主题，支持参数分组折叠、拖拽调整面板大小；
- 导出区显示文件大小、格式说明，支持自定义文件名；
- 内置火焰/雪花/雨水/爆炸预设，一键加载并导出。

### PNG 导出优化要求
1. 导出粒子效果截图时，保证 Canvas 内容完整导出（包括透明背景）；
2. 导出纹理图片时，保留原图的透明度和分辨率，不压缩；
3. 解决 PNG 导出后图片模糊/错位的问题（使用 Canvas toDataURL('image/png') 并设置高清分辨率）；
4. 补充文件命名逻辑：导出的文件自动命名（如 particle_effect_20260316.png、libgdx_particle.p）。

### 输出要求
1. 完整的项目结构（Vite 配置、目录结构、组件划分）；
2. 核心代码文件（App.vue、粒子核心逻辑、导出工具类、纹理处理组件）；
3. 运行/打包说明（安装依赖、启动命令、打包命令）；
4. 测试用例（验证导出的 .p/PNG/JSON 文件可正常使用）。

