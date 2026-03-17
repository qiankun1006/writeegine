# Spec: 粒子效果导出系统

**Capability**: `particle-export`
**Status**: 🎯 Proposal
**Version**: 1.0

---

## ADDED Requirements

### Requirement: LibGDX .p 格式导出

系统 SHALL 支持导出粒子配置为 LibGDX .p 格式文件。

#### Scenario: 导出粒子配置为 .p 文件

1. 用户在导出面板选择 "LibGDX 格式 (.p)"
2. 点击 "导出" 按钮
3. 系统生成 .p 文件，格式严格遵循 LibGDX 1.9 规范
4. 文件名自动生成：`particle_effect_<timestamp>.p`（如 `particle_effect_20260316_143052.p`）
5. 浏览器下载该文件

#### Scenario: .p 文件格式完整性

.p 文件应包含以下信息：

```
name: emitter_0
- Delay
  active: false
  - Life
    lowMin: 0.0
    lowMax: 0.0
    ...

- Life
  - Life
    lowMin: 粒子寿命(毫秒)
    lowMax: 粒子寿命
    ...

- Emission
  - Count
    lowMin: 发射速率(粒子/秒)
    lowMax: 发射速率
    ...

- Angle
  - Angle
    lowMin: 发射角度最小值
    lowMax: 发射角度最大值
    ...

- Velocity
  - Velocity
    lowMin: 初速度最小值
    lowMax: 初速度最大值
    ...

- Color
  - Color
    ...
  - Color
    ...

- Alpha
  - Alpha
    lowMin: 起始透明度
    lowMax: 起始透明度
    ...
  - Alpha
    lowMin: 结束透明度
    lowMax: 结束透明度
    ...

- Scale
  - Scale
    lowMin: 起始缩放
    lowMax: 起始缩放
    ...
  - Scale
    lowMin: 结束缩放
    lowMax: 结束缩放
    ...

- Rotation
  - Rotation
    lowMin: 起始旋转
    lowMax: 起始旋转
    ...
  - Rotation
    lowMin: 结束旋转
    lowMax: 结束旋转
    ...

- Gravity
  - GravityX
    lowMin: 重力X
    lowMax: 重力X
  - GravityY
    lowMin: 重力Y
    lowMax: 重力Y

- Wind
  - WindX
    lowMin: 风力X
    lowMax: 风力X
  - WindY
    lowMin: 风力Y
    lowMax: 风力Y
```

#### 接受标准
- 导出的 .p 文件格式完全符合 LibGDX 标准
- 文件可被 LibGDX 游戏引擎正常加载
- 文件命名规则正确，时间戳格式为 `YYYYMMdd_hhmmss`
- 文件大小显示准确（KB 单位）

---

### Requirement: TextureAtlas .atlas 格式导出

系统 SHALL 支持导出纹理图集配置为 .atlas 格式文件。

#### Scenario: 导出纹理图集配置

1. 用户上传了多张纹理后，选择导出 "纹理图集 (.atlas)"
2. 系统生成 .atlas 文件，包含纹理区域映射信息
3. 文件名自动生成：`texture_atlas_<timestamp>.atlas`
4. 浏览器下载该文件

#### Scenario: .atlas 文件格式

```
# TextureAtlas 文件格式（Libgdx 标准）
texture_atlas.png              # 合并后的纹理文件名
size: 1024, 1024               # 纹理尺寸
format: RGBA8888               # 纹理格式
filter: Linear, Linear         # 纹理过滤方式

flame                          # 纹理区域名称
  rotate: false
  xy: 10, 10                   # 纹理坐标（像素）
  size: 64, 64                 # 纹理大小（像素）
  orig: 64, 64                 # 原始大小
  offset: 0, 0                 # 偏移量

snow
  rotate: false
  xy: 84, 10
  size: 32, 32
  orig: 32, 32
  offset: 0, 0

rain
  rotate: false
  xy: 126, 10
  size: 48, 16
  orig: 48, 16
  offset: 0, 0
```

#### 接受标准
- .atlas 文件格式符合 Libgdx TexturePacker 标准
- 纹理区域映射正确，无重叠或空白
- 文件可被 Libgdx TextureAtlas 类正常加载

---

### Requirement: PNG 高清导出

系统 SHALL 支持导出粒子效果截图和纹理原图为 PNG 格式。

#### Scenario: 导出粒子效果截图

1. 用户选择 "效果截图 (PNG)"
2. 选择分辨率倍数：1x（原始）、2x（2 倍）、3x（3 倍）
3. 点击 "导出"
4. 系统渲染当前粒子效果到高分辨率 Canvas
5. 转换为 PNG，包含透明背景（RGBA）
6. 文件名自动生成：`particle_effect_screenshot_<timestamp>.png`
7. 浏览器下载 PNG 文件

#### Scenario: PNG 质量和透明度

1. PNG 使用 8-bit RGBA 格式（支持透明通道）
2. 背景为透明（Alpha = 0）
3. 粒子颜色正确，无失真或色差
4. 文件大小合理（2x 分辨率不超过 2 MB）

#### Scenario: 导出纹理原图

1. 用户在纹理管理面板上传的 PNG 图片
2. 选择要导出的纹理
3. 点击 "导出纹理"
4. 系统保留原始分辨率和透明度，直接下载
5. 无压缩、无质量损失

#### 接受标准
- PNG 导出清晰，无模糊或像素化
- 透明背景保留正确（Alpha 通道）
- 高分辨率导出耗时 ≤ 2 秒
- 文件命名规则正确
- 文件大小在合理范围内（1-5 MB）

---

### Requirement: JSON 配置导出

系统 SHALL 支持导出完整配置为 JSON 格式文件。

#### Scenario: 导出完整配置为 JSON

1. 用户选择 "配置文件 (JSON)"
2. 点击 "导出"
3. 系统生成包含所有参数的 JSON 文件
4. 文件名自动生成：`particle_config_<timestamp>.json`
5. 浏览器下载 JSON 文件

#### Scenario: JSON 格式结构

```json
{
  "name": "my_effect",
  "version": "1.0",
  "exportDate": "2026-03-16T14:30:00Z",

  "systemConfig": {
    "gravity": { "x": 0, "y": 100 },
    "windForce": { "x": 0, "y": 0 },
    "maxParticles": 5000,
    "fps": 60,
    "backgroundColor": "#000000",
    "renderMode": "normal"
  },

  "emitters": [
    {
      "name": "emitter_0",
      "enabled": true,
      "position": { "x": 512, "y": 384 },
      "emissionRate": 50,
      "emissionBurst": 0,
      "angle": 90,
      "angleVariance": 45,
      "speed": 200,
      "speedVariance": 50,

      "particleConfig": {
        "lifespan": 2000,
        "initialVelocity": { "x": 0, "y": -200 },
        "acceleration": { "x": 0, "y": 100 },
        "color": {
          "startR": 255, "startG": 165, "startB": 0,
          "endR": 255, "endG": 69, "endB": 0
        },
        "alphaStart": 1.0,
        "alphaEnd": 0.0,
        "scale": { "start": 1.0, "end": 0.5 },
        "rotation": { "start": 0, "end": 360, "speed": 180 }
      }
    }
  ],

  "textures": []
}
```

#### 接受标准
- JSON 结构完整，包含所有必要字段
- JSON 格式有效，可被标准 JSON 解析器读取
- 导出的 JSON 可重新加载到编辑器

---

### Requirement: ZIP 批量打包导出

系统 SHALL 支持一键导出完整项目包为 ZIP 格式。

#### Scenario: 一键导出完整项目包

1. 用户选择 "项目包 (ZIP)"
2. 点击 "导出"
3. 系统生成 ZIP 压缩包，包含：
   - `particle.p` - LibGDX 格式
   - `texture_atlas.atlas` - 纹理图集配置
   - `textures.png` - 合并后的纹理图片
   - `particle_config.json` - 配置文件
   - `screenshot.png` - 效果截图（可选）
4. 文件名自动生成：`particle_project_<timestamp>.zip`
5. 浏览器下载 ZIP 文件

#### Scenario: ZIP 包结构

```
particle_project_20260316_143052.zip
├── particle.p
├── texture_atlas.atlas
├── textures/
│   └── texture_atlas.png
├── particle_config.json
└── screenshot.png (可选)
```

#### 接受标准
- ZIP 文件可被标准解压工具打开
- 包内所有文件完整正确
- ZIP 文件大小在合理范围内（≤ 10 MB）
- 导出耗时 ≤ 5 秒

---

### Requirement: 导出面板 UI

系统 SHALL 提供导出面板 UI 用于选择导出格式和配置。

#### Scenario: 导出选项展示

导出面板包含以下部分：

1. **格式选择**（单选）：
   - [ ] LibGDX (.p)
   - [ ] 纹理图集 (.atlas)
   - [ ] 效果截图 (PNG)
   - [ ] 纹理原图 (PNG)
   - [ ] 配置文件 (JSON)
   - [ ] 项目包 (ZIP)

2. **分辨率选择**（仅 PNG 可见）：
   - ( ) 1x（原始）
   - (•) 2x（推荐）
   - ( ) 3x（高清）

3. **文件名输入**：
   - 文本框，默认值：`particle_effect_<timestamp>`
   - 支持自定义文件名（无需后缀，自动添加）

4. **文件信息**：
   - 显示文件类型、预期大小、格式说明

5. **导出按钮**：
   - "导出" - 点击下载
   - "复制到剪贴板" - 复制 JSON 内容

#### Scenario: 导出进度反馈

1. 导出开始时，显示进度条（如 ZIP 打包、PNG 渲染）
2. 导出完成后，显示 "导出成功" 提示
3. 若导出失败，显示错误信息

#### 接受标准
- 导出面板 UI 清晰美观（深色主题）
- 所有导出功能可正常使用
- 导出进度反馈清楚
- 导出后文件可正常打开/使用

---

## MODIFIED Requirements

无修改要求

---

## REMOVED Requirements

无移除要求

---

## Cross-References

- 相关 Spec：
  - `particle-editor-core` - 编辑器核心功能
  - `particle-texture-atlas` - 纹理图集管理
  - `particle-presets` - 预设系统

---

## Implementation Notes

### 关键库依赖
- `jszip` - ZIP 打包
- `file-saver` - 文件下载
- `canvas-to-blob` - Canvas 转 PNG

### 文件命名约定
- 时间戳格式：`YYYYMMdd_HHmmss`（如 `20260316_143052`）
- 文件前缀：
  - `.p` 文件：`particle_effect_`
  - `.atlas` 文件：`texture_atlas_`
  - `.json` 文件：`particle_config_`
  - `.zip` 文件：`particle_project_`

### 性能目标
- PNG 2x 导出耗时：≤ 2 秒
- ZIP 打包耗时：≤ 5 秒
- 文件大小：≤ 10 MB

---

## Definition of Done

- [ ] 所有导出格式按规范实现
- [ ] 导出的文件可被对应应用正常打开
- [ ] 导出面板 UI 完善、交互流畅
- [ ] 文件命名规则正确
- [ ] 性能测试通过
- [ ] 导出功能集成测试通过

