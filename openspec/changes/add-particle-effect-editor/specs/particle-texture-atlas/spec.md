# Spec: 粒子纹理图集管理系统

**Capability**: `particle-texture-atlas`
**Status**: 🎯 Proposal
**Version**: 1.0

---

## ADDED Requirements

### Requirement: 纹理上传和管理

#### Scenario: 上传单张或多张 PNG 纹理

1. 用户在纹理管理面板点击 "上传纹理"
2. 支持两种上传方式：
   - 点击选择文件（打开文件对话框）
   - 拖拽文件到上传区域
3. 支持批量上传（同时上传多个 PNG 文件）
4. 系统验证文件格式（仅接受 PNG、JPG 图片）
5. 显示上传进度条
6. 上传成功后，纹理显示在纹理列表中

#### 接受标准
- 上传界面美观，支持拖拽和点击
- 上传进度清晰可见
- 支持批量操作

---

### Requirement: 纹理图集合并

#### Scenario: 自动合并纹理为图集

1. 用户上传了多张纹理后，点击 "生成图集"
2. 系统使用 Bin Packing 算法自动排列纹理
3. 生成一张大纹理图集（默认 1024×1024，可自定义）
4. 显示图集预览和排列信息

#### Scenario: Bin Packing 算法

使用 **首次适应递减（FFD）** 算法排列纹理：

```
输入：多个小纹理，目标尺寸（如 1024×1024）
过程：
1. 按大小从大到小排序纹理
2. 尝试将每个纹理放入现有条形中
3. 若无法放入，创建新条形
4. 重复直到所有纹理被放置
输出：
- 合并后的纹理图集（PNG）
- TextureRegion 映射信息（.atlas）
- 排列有效率（使用率百分比）
```

#### 接受标准
- 算法排列紧凑，使用率 > 70%
- 生成的图集预览准确
- 排列信息清晰

---

### Requirement: 纹理裁剪和缩放

#### Scenario: 纹理裁剪

1. 用户在纹理编辑面板选择一张纹理
2. 点击 "裁剪" 按钮打开裁剪编辑器
3. 在大纹理上拖拽选择裁剪区域（矩形）
4. 显示裁剪框的坐标和尺寸
5. 点击 "确认" 完成裁剪

#### Scenario: 纹理缩放

1. 用户选择一张纹理
2. 点击 "缩放" 按钮
3. 输入缩放百分比（如 50%、200%）
4. 实时预览缩放效果
5. 点击 "应用" 保存缩放

#### 接受标准
- 裁剪编辑器交互流畅
- 缩放实时预览
- 操作结果正确

---

### Requirement: TextureAtlas 映射表管理

#### Scenario: TextureRegion 列表

1. 每个上传的纹理都生成对应的 TextureRegion
2. TextureRegion 结构：
   ```typescript
   {
     textureId: "flame_1",
     u: 0.01,                 // 标准化坐标 0-1
     v: 0.01,
     width: 0.25,             // 标准化宽度
     height: 0.25
   }
   ```

3. 显示 TextureRegion 列表，每个项包括：
   - 纹理 ID
   - 坐标（u, v）
   - 大小（width, height）
   - 预览图

#### 接受标准
- TextureRegion 列表清晰
- 映射信息准确
- 支持编辑和导出

---

### Requirement: 纹理缓存优化

#### Scenario: 纹理加载缓存

1. 纹理加载后自动缓存到内存（ImageData）
2. 相同纹理ID再次使用时，直接从缓存获取
3. 缓存大小限制：最多保留 50 MB 数据

#### Scenario: 图集预渲染

1. 纹理图集生成后预渲染到 Canvas
2. 粒子渲染时直接从预渲染的 Canvas 绘制
3. 提高粒子渲染性能

#### 接受标准
- 缓存命中率 > 90%
- 粒子渲染帧率不下降
- 内存占用合理

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
  - `particle-export` - 导出系统

---

## Implementation Notes

### 关键库依赖
- `canvas-to-blob` - Canvas 纹理导出
- `pako` - 压缩算法优化（可选）

### Bin Packing 算法实现

```typescript
class TextureAtlasGenerator {
  static generateAtlas(textures: Texture[]): TextureAtlas {
    // 1. 按面积降序排序
    textures.sort((a, b) => b.width * b.height - a.width * a.height);

    // 2. 初始化矩形数组（条形）
    const rectangles: Rectangle[] = [];

    // 3. 对每个纹理执行 FFD
    for (const texture of textures) {
      let placed = false;

      for (const rect of rectangles) {
        if (rect.canFit(texture)) {
          rect.place(texture);
          placed = true;
          break;
        }
      }

      if (!placed) {
        // 创建新条形
        rectangles.push(new Rectangle(texture));
      }
    }

    // 4. 计算最终图集大小
    const atlasWidth = this.calculateWidth(rectangles);
    const atlasHeight = this.calculateHeight(rectangles);

    return { rectangles, width: atlasWidth, height: atlasHeight };
  }
}
```

### 性能目标
- 上传 10 张纹理合并耗时 ≤ 1 秒
- 图集渲染帧率不下降 ≤ 2 FPS
- 纹理缓存查询 ≤ 10 ms

---

## Definition of Done

- [ ] 纹理上传和管理功能完善
- [ ] Bin Packing 算法实现正确，排列紧凑
- [ ] 纹理裁剪和缩放功能可用
- [ ] TextureRegion 映射准确
- [ ] 纹理缓存优化有效
- [ ] 集成测试通过
- [ ] 性能测试达标

