# 图片导入功能测试清单

## 环境准备 ✅

- [ ] Spring Boot 服务器正在运行（`localhost:8083`）
- [ ] 代码已编译（`target/classes` 目录存在）
- [ ] 文件已同步（运行 `./sync-image-editor-files.sh`）
- [ ] 浏览器已安装（Chrome 145+ 或其他现代浏览器）

## 预测试检查 ✅

```bash
# 1. 检查源文件是否存在
ls -la src/main/resources/static/js/image-editor/MenuManager.js

# 2. 检查目标文件是否存在
ls -la target/classes/static/js/image-editor/MenuManager.js

# 3. 检查文件大小是否相同
ls -lh src/main/resources/static/js/image-editor/MenuManager.js \
        target/classes/static/js/image-editor/MenuManager.js

# 4. 检查文件内容是否一致
diff src/main/resources/static/js/image-editor/MenuManager.js \
     target/classes/static/js/image-editor/MenuManager.js

# 5. 如果有差异，运行同步脚本
./sync-image-editor-files.sh
```

## 测试执行步骤 ✅

### 步骤 1: 清除缓存
- [ ] 打开浏览器
- [ ] 按 **F12** 或 **右键 → 检查** 打开开发者工具
- [ ] 切换到 **Console** 标签
- [ ] 按 **Ctrl+Shift+R**（Windows/Linux）或 **Cmd+Shift+R**（Mac）进行硬刷新
- [ ] 等待页面完全加载

### 步骤 2: 访问图片编辑器
- [ ] 在浏览器地址栏输入：`http://localhost:8083/create-game/image`
- [ ] 按 **Enter** 访问
- [ ] 验证页面加载成功（显示图片编辑器界面）
- [ ] 查看 Console 中是否有初始化日志

### 步骤 3: 测试菜单功能
- [ ] 点击左上角菜单栏的【文件】按钮
- [ ] 验证下拉菜单出现
- [ ] 菜单中应该显示：
  - [ ] 📁 导入
  - [ ] 💾 保存
  - [ ] 另存为
  - [ ] 导出 PNG
  - [ ] 导出 JPG

### 步骤 4: 导入图片
- [ ] 点击【📁 导入】
- [ ] 在文件对话框中选择一张本地图片
  - [ ] 支持的格式：JPG、PNG、GIF、WebP 等
  - [ ] 建议选择一个清晰可识别的图片
- [ ] 点击【打开】

### 步骤 5: 验证导入结果

#### 5.1 可视化验证
- [ ] **图片显示在 Canvas 上**
  - 图片应该显示在编辑器中央的白色 Canvas 区域
  - 图片应该是完整的、清晰的
  - 如果图片很大，应该看到完整图片或部分图片（取决于缩放）

#### 5.2 UI 验证
- [ ] **图层面板更新**
  - 左侧图层面板应该显示新导入的图层
  - 图层名称应该是导入文件的名称（例如 "image.png"）

- [ ] **菜单关闭**
  - 文件菜单应该在导入后自动关闭

#### 5.3 控制台日志验证
- [ ] 打开浏览器 DevTools → Console
- [ ] 按以下顺序查找日志消息：

```
☑ 📂 文件选择变化，文件: File {...}
☑ 📄 开始读取文件: {name: "...", type: "image/...", size: ...}
☑ 📊 文件读取进度: 100%
☑ ✓ FileReader 读取完成，结果长度: ...
☑ 🖼️ 检测到图片文件，开始加载
☑ ✓ 图片加载成功: {width: ..., height: ...}
☑ 📐 更新文档尺寸: {width: ..., height: ...}
☑ ✓ Canvas 尺寸已更新
☑ 🎨 创建新图层用于放置导入的图片
☑ ✓ 图片已绘制到新图层
☑ ✓ 新图层已添加到文档
☑ 🎨 调用 editor.render()
☑ ✓ 编辑器状态标记为脏数据
☑ ✓✓✓ 图片导入完成！✓✓✓（绿色文本）
```

### 步骤 6: 后续功能测试

#### 6.1 绘画工具测试
- [ ] 选择一个绘画工具（例如画笔）
- [ ] 在导入的图片上绘制
- [ ] 验证可以在导入的图片上作画

#### 6.2 图层操作测试
- [ ] 在图层面板上右键或使用按钮
- [ ] 尝试创建新图层
- [ ] 尝试删除图层（不删除导入的图层）
- [ ] 尝试选择不同的图层

#### 6.3 导出功能测试
- [ ] 点击【文件】→【导出 PNG】
- [ ] 验证可以下载 PNG 文件
- [ ] 点击【文件】→【导出 JPG】
- [ ] 验证可以下载 JPG 文件

#### 6.4 缩放功能测试
- [ ] 使用右侧工具栏的缩放按钮
- [ ] 验证可以放大和缩小
- [ ] 验证适应窗口功能

## 故障排除 ⚠️

### 问题 1: 图片仍然不显示

**检查清单：**
```
☐ 是否进行了硬刷新？(Ctrl+Shift+R)
☐ 浏览器控制台中是否有错误？
☐ 文件是否正确同步？(运行 ./sync-image-editor-files.sh)
☐ 服务器是否在运行？(访问 http://localhost:8083)
☐ 选择的文件是否是有效的图片？
```

**解决步骤：**
1. 关闭浏览器标签页，重新访问
2. 清除浏览器全局缓存：DevTools → Application → Clear site data
3. 重启 Spring Boot 服务器
4. 手动运行同步脚本并重新访问页面

### 问题 2: 控制台显示错误消息

**常见错误及解决方案：**

| 错误信息 | 原因 | 解决方案 |
|---------|------|--------|
| `❌ 编辑器或文档不存在` | 编辑器未初始化 | 刷新页面，等待 app.js 加载 |
| `❌ 无法获取图层 context` | Layer.js 加载失败 | 检查 Network 标签，确保所有 JS 文件加载成功 |
| `❌ 图片加载失败` | 图片格式不支持或损坏 | 尝试其他图片文件 |
| `Uncaught TypeError: Layer is not defined` | Layer 类未加载 | 检查 HTML 中是否引入了 Layer.js |

### 问题 3: 网络问题

**检查步骤：**
1. 打开 DevTools → Network 标签
2. 刷新页面
3. 查找以下文件是否都加载成功（状态 200）：
   - `app.js`
   - `MenuManager.js`
   - `ImageEditor.js`
   - `Layer.js`
   - `CanvasRenderer.js`
   - `create-game-image.html`

### 问题 4: 服务器返回 404

**检查步骤：**
1. 验证 URL 是否正确：`http://localhost:8083/create-game/image`
2. 检查 Spring Boot 是否在运行
3. 查看服务器日志是否有异常
4. 重启服务器

## 测试报告模板

```
=== 图片导入功能测试报告 ===

测试日期：[日期]
测试人：[姓名]
浏览器：[Chrome/Firefox/Safari] 版本 [版本号]

总体测试结果：☐ 通过 ☐ 失败

详细结果：
- 图片导入菜单：☐ 通过 ☐ 失败
- 文件选择对话框：☐ 通过 ☐ 失败
- 导入图片显示：☐ 通过 ☐ 失败
- 图层面板更新：☐ 通过 ☐ 失败
- 控制台日志输出：☐ 通过 ☐ 失败
- 后续操作（绘画/导出）：☐ 通过 ☐ 失败

失败详情（如有）：
[描述失败现象，包括错误消息、截图等]

建议或备注：
[其他信息]
```

## 快速参考命令

```bash
# 查看源文件内容（最后 50 行）
tail -50 src/main/resources/static/js/image-editor/MenuManager.js

# 查看目标文件内容（最后 50 行）
tail -50 target/classes/static/js/image-editor/MenuManager.js

# 同步所有编辑器文件
./sync-image-editor-files.sh

# 查看 git 状态
git status

# 查看 MenuManager.js 的修改
git diff src/main/resources/static/js/image-editor/MenuManager.js

# 查看编译后的类
ls -la target/classes/static/js/image-editor/
```

## 成功标志 ✅

当以下所有条件都满足时，导入功能测试通过：

1. ✅ 能够成功打开【文件】菜单
2. ✅ 能够选择本地图片文件
3. ✅ 导入后图片显示在 Canvas 上
4. ✅ 图层面板显示新导入的图层
5. ✅ 浏览器控制台显示完整的导入日志序列
6. ✅ 没有 JavaScript 错误
7. ✅ 能够在导入的图片上进行后续操作（绘画、导出等）

---

**最后更新**：2026-02-21 21:30 UTC
**相关文件**：MenuManager.js, Layer.js, ImageEditor.js, CanvasRenderer.js

