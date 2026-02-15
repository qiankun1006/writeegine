# Tilemap编辑器重建 - 详细设计文档

## 架构概述

```
┌─────────────────────────────────────────────────────┐
│                  Tilemap编辑器                       │
├──────────────┬──────────────┬──────────────────────┤
│   左侧面板   │  显示区域    │   右侧编辑区         │
│              │              │                      │
│ 图块选择器   │ 当前选中图块 │ Canvas画布           │
│ (滚动列表)   │ (缩略图)     │ 工具栏               │
│              │              │ 网格信息             │
└──────────────┴──────────────┴──────────────────────┘
```

## HTML结构

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
      layout:decorate="~{layout}">
<head>
    <title>Tilemap编辑器</title>
    <link rel="stylesheet" th:href="@{/static/css/tilemap-editor.css}">
</head>
<body>
    <div layout:fragment="content">
        <div class="tilemap-editor-wrapper">
            <!-- 左侧：图块选择面板 -->
            <div class="tile-selector-panel">
                <h3>图块选择</h3>
                <div class="tile-selector-list" id="tile-selector">
                    <!-- 动态生成 -->
                    <div th:each="tile, iterStat : ${tileImages}"
                         class="tile-selector-item"
                         th:attr="data-tile-index=${iterStat.index}, data-tile-name=${tileNames[iterStat.index]}">
                        <img th:src="@{'/static/images/tiles/' + ${tile}}"
                             th:alt="${tileNames[iterStat.index]}"
                             class="tile-thumbnail">
                        <span class="tile-name" th:text="${tileNames[iterStat.index]}"></span>
                    </div>
                </div>
            </div>

            <!-- 中间：当前选中显示 -->
            <div class="current-tile-display">
                <h3>当前选中</h3>
                <div class="current-tile-preview">
                    <img id="current-tile-image" src="" alt="未选择">
                </div>
                <div class="current-tile-name" id="current-tile-name">未选择</div>
                <div class="tile-info-tip">点击左侧图块选择</div>
            </div>

            <!-- 右侧：编辑区域 -->
            <div class="editor-panel">
                <!-- 工具栏 -->
                <div class="toolbar">
                    <div class="toolbar-group">
                        <button id="btn-clear" class="btn btn-danger">清空画布</button>
                        <button id="btn-undo" class="btn btn-secondary">撤销</button>
                        <button id="btn-redo" class="btn btn-secondary">重做</button>
                    </div>
                    <div class="toolbar-group">
                        <label for="grid-size-select">网格尺寸:</label>
                        <select id="grid-size-select" class="grid-size-select">
                            <option value="8">8x8</option>
                            <option value="16" selected>16x16</option>
                            <option value="24">24x24</option>
                            <option value="32">32x32</option>
                        </select>
                    </div>
                    <div class="toolbar-group">
                        <button id="btn-export" class="btn btn-primary">导出为PNG</button>
                    </div>
                </div>

                <!-- Canvas绘制区 -->
                <div class="canvas-container">
                    <canvas id="tilemap-canvas" width="512" height="512"></canvas>
                </div>

                <!-- 信息栏 -->
                <div class="editor-info">
                    <span>网格: <span id="grid-info">16x16</span></span>
                    <span>已放置: <span id="placed-count">0</span> 个图块</span>
                </div>

                <!-- 提示 -->
                <div class="editor-hints">
                    <p>提示: 点击或拖动放置图块 | 按钮操作: 撤销、重做、清空</p>
                </div>
            </div>
        </div>

        <!-- 隐藏下载链接 -->
        <a id="download-link" style="display: none;"></a>
    </div>

    <script th:src="@{/static/js/tilemap-editor.js}"></script>
</body>
</html>
```

## CSS设计

```css
/* 主容器 - 三栏布局 */
.tilemap-editor-wrapper {
    display: flex;
    gap: 15px;
    padding: 15px;
    height: calc(100vh - 200px);
    background: #f5f5f5;
}

/* 左侧面板 - 固定宽度 */
.tile-selector-panel {
    width: 150px;
    background: white;
    border-radius: 8px;
    padding: 15px;
    overflow-y: auto;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.tile-selector-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

.tile-selector-item {
    cursor: pointer;
    padding: 8px;
    border: 2px solid #ddd;
    border-radius: 4px;
    transition: all 0.2s;
    text-align: center;
}

.tile-selector-item:hover {
    border-color: #999;
    background: #f9f9f9;
}

.tile-selector-item.selected {
    border-color: #4a90e2;
    background: #e8f2ff;
}

.tile-thumbnail {
    width: 60px;
    height: 60px;
    object-fit: contain;
    margin-bottom: 4px;
}

.tile-name {
    font-size: 12px;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #333;
}

/* 中间面板 - 固定宽度 */
.current-tile-display {
    width: 130px;
    background: white;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
}

.current-tile-preview {
    width: 100px;
    height: 100px;
    border: 2px solid #ddd;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f9;
    margin: 10px 0;
}

#current-tile-image {
    max-width: 90px;
    max-height: 90px;
}

#current-tile-name {
    font-weight: bold;
    color: #2c3e50;
    margin: 10px 0;
    font-size: 12px;
}

.tile-info-tip {
    font-size: 11px;
    color: #999;
    margin-top: 10px;
}

/* 右侧编辑面板 - 弹性宽度 */
.editor-panel {
    flex: 1;
    background: white;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
}

/* 工具栏 */
.toolbar {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
    align-items: center;
    flex-wrap: wrap;
}

.toolbar-group {
    display: flex;
    gap: 8px;
    align-items: center;
}

.btn {
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
}

.btn-primary {
    background: #4a90e2;
    color: white;
}

.btn-primary:hover {
    background: #3a7bc8;
}

.btn-secondary {
    background: #e0e0e0;
    color: #333;
}

.btn-secondary:hover {
    background: #d0d0d0;
}

.btn-danger {
    background: #e74c3c;
    color: white;
}

.btn-danger:hover {
    background: #c0392b;
}

.grid-size-select {
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

/* Canvas容器 */
.canvas-container {
    flex: 1;
    border: 2px solid #ddd;
    border-radius: 4px;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
}

canvas {
    border: 1px solid #999;
    background: white;
}

/* 信息栏 */
.editor-info {
    display: flex;
    gap: 20px;
    margin-top: 10px;
    font-size: 12px;
    color: #666;
}

/* 提示 */
.editor-hints {
    margin-top: 8px;
    padding: 8px 12px;
    background: #f0f7ff;
    border-left: 3px solid #4a90e2;
    border-radius: 4px;
    font-size: 12px;
    color: #666;
}

.editor-hints p {
    margin: 0;
}
```

## JavaScript架构

### 核心类结构

```javascript
class TilemapEditor {
    constructor() {
        // DOM元素
        this.canvas = null;
        this.ctx = null;
        this.tileSelector = null;
        this.currentTileImage = null;
        this.currentTileName = null;

        // 数据
        this.tiles = [];           // 图块元数据
        this.selectedTileIndex = 0; // 当前选中
        this.gridSize = 16;        // 网格尺寸
        this.gridData = [];        // 画布数据
        this.history = [];         // 撤销历史
        this.historyIndex = 0;     // 历史指针

        // 状态
        this.isMouseDown = false;
        this.lastPlacedX = -1;
        this.lastPlacedY = -1;

        // 初始化
        this.init();
    }

    init() {
        // 初始化所有子系统
        this.initDOM();
        this.loadTiles();
        this.setupEventListeners();
        this.createEmptyGrid();
        this.render();
    }

    // ... 其他方法
}
```

### 关键方法

#### 1. 图块加载和显示

```javascript
loadTiles() {
    // 从Thymeleaf传入的数据获取图块信息
    // 创建图块对象数组，包括图片和名称
}

selectTile(index) {
    this.selectedTileIndex = index;
    // 更新UI显示
    // 高亮选中的图块
    // 更新当前显示区域
}
```

#### 2. 网格坐标转换

```javascript
getGridCoordinates(pixelX, pixelY) {
    // 计算每个格子的像素大小
    const cellSize = this.canvas.width / this.gridSize;

    // 转换像素坐标到网格坐标
    const gridX = Math.floor(pixelX / cellSize);
    const gridY = Math.floor(pixelY / cellSize);

    // 边界检查
    if (gridX < 0 || gridX >= this.gridSize ||
        gridY < 0 || gridY >= this.gridSize) {
        return null;
    }

    return { x: gridX, y: gridY };
}
```

#### 3. 图块放置

```javascript
placeTile(gridX, gridY) {
    if (!this.isValidCoordinate(gridX, gridY)) return;

    // 检查是否已放置过（避免重复）
    if (this.lastPlacedX === gridX && this.lastPlacedY === gridY) return;

    // 放置图块
    this.gridData[gridY][gridX] = this.selectedTileIndex;

    // 更新计数
    this.updatePlacedCount();

    // 保存历史
    this.saveHistory();

    // 更新显示
    this.render();

    // 记录最后放置位置
    this.lastPlacedX = gridX;
    this.lastPlacedY = gridY;
}
```

#### 4. 绘制渲染

```javascript
render() {
    // 清空画布
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 计算格子大小
    const cellSize = this.canvas.width / this.gridSize;

    // 绘制网格
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i <= this.gridSize; i++) {
        const pos = i * cellSize;
        // 水平线
        this.ctx.beginPath();
        this.ctx.moveTo(0, pos);
        this.ctx.lineTo(this.canvas.width, pos);
        this.ctx.stroke();
        // 竖线
        this.ctx.beginPath();
        this.ctx.moveTo(pos, 0);
        this.ctx.lineTo(pos, this.canvas.height);
        this.ctx.stroke();
    }

    // 绘制图块
    for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
            const tileIndex = this.gridData[y][x];
            if (tileIndex !== undefined && tileIndex !== -1) {
                this.drawTile(x, y, tileIndex, cellSize);
            }
        }
    }
}

drawTile(gridX, gridY, tileIndex, cellSize) {
    // 获取图块图片
    const tile = this.tiles[tileIndex];
    if (!tile || !tile.image) return;

    // 计算绘制位置
    const x = gridX * cellSize;
    const y = gridY * cellSize;

    // 绘制图片
    this.ctx.drawImage(tile.image, x, y, cellSize, cellSize);
}
```

#### 5. 撤销/重做

```javascript
saveHistory() {
    // 移除重做记录
    this.history.splice(this.historyIndex + 1);

    // 保存当前状态的深拷贝
    const state = JSON.parse(JSON.stringify(this.gridData));
    this.history.push(state);
    this.historyIndex = this.history.length - 1;

    // 限制历史长度
    if (this.history.length > 50) {
        this.history.shift();
        this.historyIndex--;
    }
}

undo() {
    if (this.historyIndex > 0) {
        this.historyIndex--;
        this.restoreFromHistory();
    }
}

redo() {
    if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.restoreFromHistory();
    }
}

restoreFromHistory() {
    this.gridData = JSON.parse(JSON.stringify(
        this.history[this.historyIndex]
    ));
    this.updatePlacedCount();
    this.render();
}
```

#### 6. PNG导出

```javascript
exportToPNG() {
    // 创建临时canvas
    const exportCanvas = document.createElement('canvas');
    const cellSize = 16; // 导出时每个格子16像素
    exportCanvas.width = this.gridSize * cellSize;
    exportCanvas.height = this.gridSize * cellSize;

    const exportCtx = exportCanvas.getContext('2d');

    // 绘制图块
    for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
            const tileIndex = this.gridData[y][x];
            if (tileIndex !== undefined && tileIndex !== -1) {
                const tile = this.tiles[tileIndex];
                const sx = x * cellSize;
                const sy = y * cellSize;
                exportCtx.drawImage(
                    tile.image,
                    sx, sy,
                    cellSize, cellSize
                );
            }
        }
    }

    // 转换为图片并下载
    const imageData = exportCanvas.toDataURL('image/png');
    this.downloadImage(imageData);
}

downloadImage(dataUrl) {
    const link = document.getElementById('download-link');
    link.href = dataUrl;
    link.download = `tilemap-${Date.now()}.png`;
    link.click();
}
```

## 后端实现

### TilemapEditorController

```java
@Controller
public class TilemapEditorController {

    @GetMapping("/tilemap-editor")
    public String tilemapEditor(Model model) {
        // 获取图块列表
        List<String> tileImages = new ArrayList<>(Arrays.asList(
            "brown.png",
            "green.png",
            "green2.png",
            "obstacle.png",
            "stone-wall.png",
            "stone.png",
            "stone2.png"
        ));

        List<String> tileNames = new ArrayList<>(Arrays.asList(
            "棕色地块",
            "绿色地块",
            "绿色地块2",
            "障碍物",
            "石墙",
            "石头",
            "石头2"
        ));

        model.addAttribute("tileImages", tileImages);
        model.addAttribute("tileNames", tileNames);
        model.addAttribute("title", "Tilemap编辑器");

        return "tilemap-editor";
    }
}
```

## 数据结构

### 画布数据格式

```
gridData = [
    [-1,  0,  1, -1,  2,  0, -1],  // Y=0
    [ 0, -1,  1,  2,  0,  1, -1],  // Y=1
    [-1, -1,  0,  1,  2, -1,  0],  // Y=2
    ...
]

其中：
-1 表示空格子
0-6 表示图块索引
```

### 撤销历史格式

```
history = [
    [[−1, 0, 1, ...], ...],  // 状态0
    [[0, −1, 1, ...], ...],  // 状态1
    ...
]
```

## 状态管理流程

```
用户操作 -> 数据更新 -> 保存历史 -> 重新渲染 -> 更新UI信息

例如放置图块：
点击Canvas -> getGridCoordinates() -> placeTile()
  -> saveHistory() -> render() -> updatePlacedCount()

