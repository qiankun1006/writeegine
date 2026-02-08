## Context
当前项目是基于Spring Boot 4.0.1的Web应用，已具备Thymeleaf模板引擎和基础Web界面。用户希望在现有基础上添加Tilemap编辑器功能，用于游戏地图编辑、场景设计等用途。项目在`src/main/java/com/example/writemyself/pic/`目录下已有7个像素块图片资源，需要被编辑器使用。

## Goals / Non-Goals
### Goals
- 提供在线的Tilemap编辑器，支持在网格上放置图块
- 利用现有像素块图片作为编辑素材
- 实现Canvas-based的画布，支持实时编辑
- 提供PNG图片导出功能，将编辑结果保存到本地
- 创建直观的用户界面：图块选择器、编辑网格、工具栏
- 保持与现有Web界面的风格一致

### Non-Goals
- 不实现复杂的图层系统（单层编辑）
- 不实现服务器端地图保存（仅本地导出）
- 不实现多人协作编辑
- 不实现图块自动生成或高级算法
- 不实现复杂的图块动画功能

## Decisions
### Decision: 使用HTML5 Canvas进行Tilemap渲染
**What**: 选择HTML5 Canvas而非SVG或纯DOM元素
**Why**: Canvas适合像素级绘图和图像操作，性能较好，支持导出为PNG图片。对于Tilemap编辑，Canvas提供更灵活的图像处理能力。

### Decision: 前端纯JavaScript实现
**What**: 使用原生JavaScript而非前端框架（React/Vue）
**Why**: 项目已有原生JavaScript基础，Tilemap编辑器逻辑相对独立，不需要复杂的状态管理。保持技术栈简单，减少依赖。

### Decision: 图片资源通过静态资源服务
**What**: 将图片移动到`src/main/resources/static/images/tiles/`目录
**Why**: Spring Boot的静态资源服务可直接提供图片访问，无需额外控制器。简化架构，提高性能。

### Decision: 编辑器状态保存在浏览器内存
**What**: 使用JavaScript对象存储当前编辑状态，不持久化到服务器
**Why**: 简化实现，专注于编辑功能。用户通过导出PNG保存成果，符合"保存到本地"的需求。

### Decision: 默认16x16网格
**What**: 初始提供16行×16列的编辑网格
**Why**: 平衡编辑灵活性和界面可用性。可通过配置调整网格尺寸。

## 详细代码设计

### 1. 目录结构调整
```
src/main/resources/static/images/tiles/     # 移动图片到此目录
  - brown.png          (原棕色.png)
  - stone-wall.png     (原石墙.png)
  - stone.png          (原石头.png)
  - green.png          (原绿色.png)
  - stone2.png         (原石头2.png)
  - green2.png         (原绿色2.png)
  - obstacle.png       (原障碍物.png)

src/main/resources/static/css/
  - tilemap-editor.css # 编辑器专用样式

src/main/resources/static/js/
  - tilemap-editor.js  # 编辑器核心逻辑

src/main/resources/templates/
  - tilemap-editor.html # 编辑器页面模板
```

### 2. 控制器设计（TilemapEditorController.java）
```java
package com.example.writemyself.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class TilemapEditorController {

    @GetMapping("/tilemap-editor")
    public String tilemapEditor(Model model) {
        // 图块配置信息
        String[] tileImages = {
            "brown.png", "stone-wall.png", "stone.png",
            "green.png", "stone2.png", "green2.png", "obstacle.png"
        };

        String[] tileNames = {
            "棕色地块", "石墙", "石头",
            "绿色地块", "石头2", "绿色地块2", "障碍物"
        };

        model.addAttribute("title", "Tilemap编辑器");
        model.addAttribute("tileImages", tileImages);
        model.addAttribute("tileNames", tileNames);
        model.addAttribute("defaultGridSize", 16);

        return "tilemap-editor";
    }
}
```

### 3. 编辑器页面模板（tilemap-editor.html）
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
      layout:decorate="~{layout}">
<head>
    <title layout:title-pattern="$CONTENT_TITLE - $LAYOUT_TITLE">Tilemap编辑器</title>
    <link rel="stylesheet" th:href="@{/static/css/tilemap-editor.css}">
</head>
<body>
    <div layout:fragment="content">
        <div class="tilemap-editor">
            <header class="editor-header">
                <h1>Tilemap编辑器</h1>
                <p>选择图块并在网格上点击放置，支持导出为PNG图片</p>
            </header>

            <div class="editor-container">
                <!-- 工具栏 -->
                <div class="toolbar">
                    <div class="toolbar-group">
                        <button id="btn-clear" class="btn-tool">清空画布</button>
                        <button id="btn-undo" class="btn-tool">撤销</button>
                        <button id="btn-redo" class="btn-tool">重做</button>
                    </div>

                    <div class="toolbar-group">
                        <label for="grid-size">网格尺寸:</label>
                        <select id="grid-size" class="tool-select">
                            <option value="8">8x8</option>
                            <option value="16" selected>16x16</option>
                            <option value="24">24x24</option>
                            <option value="32">32x32</option>
                        </select>
                    </div>

                    <div class="toolbar-group">
                        <button id="btn-export" class="btn-primary">导出为PNG</button>
                        <button id="btn-load-example" class="btn-secondary">加载示例</button>
                    </div>
                </div>

                <div class="editor-main">
                    <!-- 图块选择器 -->
                    <div class="tile-palette">
                        <h3>图块选择</h3>
                        <div class="tile-grid" id="tile-selector">
                            <!-- 动态生成图块 -->
                            <div th:each="tile, iterStat : ${tileImages}"
                                 class="tile-item"
                                 th:data-tile-index="${iterStat.index}"
                                 th:data-tile-name="${tileNames[iterStat.index]}">
                                <img th:src="@{'/static/images/tiles/' + ${tile}}"
                                     th:alt="${tileNames[iterStat.index]}"
                                     class="tile-preview">
                                <span th:text="${tileNames[iterStat.index]}">图块名称</span>
                            </div>
                        </div>
                    </div>

                    <!-- 编辑区域 -->
                    <div class="editor-area">
                        <div class="editor-controls">
                            <div class="current-tile">
                                <span>当前图块: </span>
                                <img id="current-tile-preview" src="" alt="当前选择">
                                <span id="current-tile-name">未选择</span>
                            </div>
                            <div class="grid-info">
                                网格: <span id="grid-dimensions">16x16</span>
                                已放置: <span id="placed-tiles">0</span> 个图块
                            </div>
                        </div>

                        <!-- 画布容器 -->
                        <div class="canvas-container">
                            <canvas id="tilemap-canvas" width="512" height="512"></canvas>
                            <div class="canvas-grid" id="canvas-grid-overlay"></div>
                        </div>

                        <div class="editor-hints">
                            <p>提示: 点击网格放置图块 | 右键点击清除图块 | 使用滚轮缩放</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 导出链接（隐藏） -->
        <a id="download-link" style="display: none;"></a>
    </div>

    <script th:src="@{/static/js/tilemap-editor.js}"></script>
</body>
</html>
```

### 4. 编辑器样式（tilemap-editor.css）
```css
.tilemap-editor {
    padding: 1rem;
}

.editor-header {
    margin-bottom: 2rem;
    text-align: center;
}

.editor-header h1 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
}

.editor-header p {
    color: #7f8c8d;
}

.editor-container {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow: hidden;
}

.toolbar {
    background: #34495e;
    padding: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    align-items: center;
}

.toolbar-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-tool, .btn-primary, .btn-secondary {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
}

.btn-tool {
    background: #ecf0f1;
    color: #2c3e50;
}

.btn-tool:hover {
    background: #d5dbdb;
}

.btn-primary {
    background: #3498db;
    color: white;
}

.btn-primary:hover {
    background: #2980b9;
}

.btn-secondary {
    background: #95a5a6;
    color: white;
}

.btn-secondary:hover {
    background: #7f8c8d;
}

.tool-select {
    padding: 0.4rem;
    border: 1px solid #bdc3c7;
    border-radius: 4px;
    background: white;
}

.editor-main {
    display: flex;
    min-height: 600px;
}

.tile-palette {
    width: 250px;
    background: #f8f9fa;
    border-right: 1px solid #dee2e6;
    padding: 1rem;
    overflow-y: auto;
}

.tile-palette h3 {
    margin-bottom: 1rem;
    color: #2c3e50;
}

.tile-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
}

.tile-item {
    background: white;
    border: 2px solid #dee2e6;
    border-radius: 6px;
    padding: 0.5rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
}

.tile-item:hover {
    border-color: #3498db;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.tile-item.selected {
    border-color: #2ecc71;
    background: #f0f9f4;
}

.tile-preview {
    width: 48px;
    height: 48px;
    object-fit: contain;
    margin-bottom: 0.5rem;
}

.tile-item span {
    display: block;
    font-size: 0.85rem;
    color: #34495e;
}

.editor-area {
    flex: 1;
    padding: 1rem;
    display: flex;
    flex-direction: column;
}

.editor-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 6px;
}

.current-tile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

#current-tile-preview {
    width: 32px;
    height: 32px;
    border: 1px solid #bdc3c7;
    border-radius: 4px;
}

#current-tile-name {
    font-weight: 500;
    color: #2c3e50;
}

.grid-info {
    color: #7f8c8d;
    font-size: 0.9rem;
}

.canvas-container {
    position: relative;
    flex: 1;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    overflow: hidden;
    background: #f8f9fa;
}

#tilemap-canvas {
    display: block;
    width: 100%;
    height: 100%;
    cursor: crosshair;
}

.canvas-grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.editor-hints {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    color: #856404;
    font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 992px) {
    .editor-main {
        flex-direction: column;
    }

    .tile-palette {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid #dee2e6;
    }

    .tile-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

@media (max-width: 576px) {
    .toolbar {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .tile-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

### 5. JavaScript核心逻辑（tilemap-editor.js - 部分关键代码）
```javascript
// Tilemap编辑器主逻辑
class TilemapEditor {
    constructor() {
        this.canvas = document.getElementById('tilemap-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridOverlay = document.getElementById('canvas-grid-overlay');

        // 编辑器状态
        this.gridSize = 16;
        this.tileSize = 32; // 每个图块像素大小
        this.selectedTileIndex = -1;
        this.tileImages = [];
        this.tilemapData = []; // 网格数据

        // 编辑历史
        this.history = [];
        this.historyIndex = -1;

        // 初始化
        this.init();
    }

    init() {
        this.setupCanvas();
        this.loadTileImages();
        this.setupEventListeners();
        this.setupGrid();
        this.render();

        // 默认选择第一个图块
        this.selectTile(0);
    }

    setupCanvas() {
        // 设置Canvas尺寸
        this.canvas.width = this.gridSize * this.tileSize;
        this.canvas.height = this.gridSize * this.tileSize;

        // 初始化网格数据
        this.tilemapData = Array(this.gridSize * this.gridSize).fill(-1);
    }

    loadTileImages() {
        const tileElements = document.querySelectorAll('.tile-item');
        this.tileImages = [];

        tileElements.forEach((tileEl, index) => {
            const img = new Image();
            const imgSrc = tileEl.querySelector('img').src;

            img.onload = () => {
                this.tileImages[index] = img;
                if (index === 0) {
                    this.render(); // 重渲染
                }
            };

            img.src = imgSrc;

            // 点击选择图块
            tileEl.addEventListener('click', () => {
                this.selectTile(index);
                tileElements.forEach(el => el.classList.remove('selected'));
                tileEl.classList.add('selected');
            });
        });
    }

    selectTile(index) {
        this.selectedTileIndex = index;

        const tileEl = document.querySelector(`.tile-item[data-tile-index="${index}"]`);
        if (tileEl) {
            const tileName = tileEl.dataset.tileName;
            const imgSrc = tileEl.querySelector('img').src;

            document.getElementById('current-tile-preview').src = imgSrc;
            document.getElementById('current-tile-name').textContent = tileName;
        }
    }

    setupGrid() {
        // 创建网格叠加层
        const gridHTML = [];
        const cellSize = 100 / this.gridSize;

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                gridHTML.push(
                    `<div class="grid-cell"
                          style="position: absolute;
                                 width: ${cellSize}%;
                                 height: ${cellSize}%;
                                 left: ${x * cellSize}%;
                                 top: ${y * cellSize}%;
                                 border-right: 1px solid rgba(0,0,0,0.1);
                                 border-bottom: 1px solid rgba(0,0,0,0.1);"
                          data-x="${x}"
                          data-y="${y}"></div>`
                );
            }
        }

        this.gridOverlay.innerHTML = gridHTML.join('');

        // 网格点击事件
        this.gridOverlay.querySelectorAll('.grid-cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                this.placeTile(x, y);
            });

            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                this.removeTile(x, y);
                return false;
            });
        });
    }

    placeTile(x, y) {
        if (this.selectedTileIndex === -1) return;

        // 保存历史状态
        this.saveHistory();

        const index = y * this.gridSize + x;
        this.tilemapData[index] = this.selectedTileIndex;

        this.render();
        this.updateTileCount();
    }

    removeTile(x, y) {
        this.saveHistory();

        const index = y * this.gridSize + x;
        this.tilemapData[index] = -1;

        this.render();
        this.updateTileCount();
    }

    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制背景
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制图块
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const tileIndex = this.tilemapData[y * this.gridSize + x];
                if (tileIndex !== -1 && this.tileImages[tileIndex]) {
                    this.ctx.drawImage(
                        this.tileImages[tileIndex],
                        x * this.tileSize,
                        y * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        }

        // 绘制网格线
        this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= this.gridSize; i++) {
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.tileSize, 0);
            this.ctx.lineTo(i * this.tileSize, this.canvas.height);
            this.ctx.stroke();

            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.tileSize);
            this.ctx.lineTo(this.canvas.width, i * this.tileSize);
            this.ctx.stroke();
        }
    }

    saveHistory() {
        // 只保留最近20个状态
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push([...this.tilemapData]);
        this.historyIndex = this.history.length - 1;

        if (this.history.length > 20) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    updateTileCount() {
        const count = this.tilemapData.filter(index => index !== -1).length;
        document.getElementById('placed-tiles').textContent = count;
    }

    clearCanvas() {
        if (confirm('确定要清空整个画布吗？')) {
            this.saveHistory();
            this.tilemapData.fill(-1);
            this.render();
            this.updateTileCount();
        }
    }

    exportAsPNG() {
        // 创建临时Canvas用于导出
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');

        // 设置导出尺寸（可调整）
        const scale = 2; // 2倍尺寸导出
        exportCanvas.width = this.canvas.width * scale;
        exportCanvas.height = this.canvas.height * scale;

        // 填充白色背景
        exportCtx.fillStyle = '#ffffff';
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // 绘制图块（缩放）
        exportCtx.imageSmoothingEnabled = false; // 保持像素风格

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const tileIndex = this.tilemapData[y * this.gridSize + x];
                if (tileIndex !== -1 && this.tileImages[tileIndex]) {
                    exportCtx.drawImage(
                        this.tileImages[tileIndex],
                        x * this.tileSize * scale,
                        y * this.tileSize * scale,
                        this.tileSize * scale,
                        this.tileSize * scale
                    );
                }
            }
        }

        // 创建下载链接
        const dataURL = exportCanvas.toDataURL('image/png');
        const link = document.getElementById('download-link');
        link.href = dataURL;
        link.download = `tilemap_${new Date().getTime()}.png`;
        link.click();

        alert('图片已导出，开始下载！');
    }

    setupEventListeners() {
        // 清空按钮
        document.getElementById('btn-clear').addEventListener('click', () => {
            this.clearCanvas();
        });

        // 导出按钮
        document.getElementById('btn-export').addEventListener('click', () => {
            this.exportAsPNG();
        });

        // 网格尺寸变更
        document.getElementById('grid-size').addEventListener('change', (e) => {
            const newSize = parseInt(e.target.value);
            if (newSize !== this.gridSize) {
                this.gridSize = newSize;
                this.setupCanvas();
                this.setupGrid();
                this.render();
                document.getElementById('grid-dimensions').textContent = `${newSize}x${newSize}`;
            }
        });

        // 撤销/重做
        document.getElementById('btn-undo').addEventListener('click', () => {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.tilemapData = [...this.history[this.historyIndex]];
                this.render();
                this.updateTileCount();
            }
        });

        document.getElementById('btn-redo').addEventListener('click', () => {
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.tilemapData = [...this.history[this.historyIndex]];
                this.render();
                this.updateTileCount();
            }
        });

        // 示例加载
        document.getElementById('btn-load-example').addEventListener('click', () => {
            this.loadExamplePattern();
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'z':
                        if (e.shiftKey) {
                            // Ctrl+Shift+Z: 重做
                            document.getElementById('btn-redo').click();
                        } else {
                            // Ctrl+Z: 撤销
                            document.getElementById('btn-undo').click();
                        }
                        e.preventDefault();
                        break;
                    case 's':
                        // Ctrl+S: 导出
                        e.preventDefault();
                        document.getElementById('btn-export').click();
                        break;
                    case 'e':
                        // Ctrl+E: 清空
                        e.preventDefault();
                        document.getElementById('btn-clear').click();
                        break;
                }
            }
        });
    }

    loadExamplePattern() {
        // 加载一个简单示例图案
        this.saveHistory();

        // 清空当前
        this.tilemapData.fill(-1);

        // 创建简单边框
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (y === 0 || y === this.gridSize - 1 || x === 0 || x === this.gridSize - 1) {
                    // 边框使用石墙图块（假设索引1是石墙）
                    this.tilemapData[y * this.gridSize + x] = 1;
                } else if (x === Math.floor(this.gridSize / 2) && y === Math.floor(this.gridSize / 2)) {
                    // 中心点使用障碍物
                    this.tilemapData[y * this.gridSize + x] = 6; // 障碍物索引
                }
            }
        }

        this.render();
        this.updateTileCount();
    }
}

// 页面加载完成后初始化编辑器
document.addEventListener('DOMContentLoaded', () => {
    window.tilemapEditor = new TilemapEditor();
    console.log('Tilemap编辑器已初始化');
});
```

### 6. 图片资源处理脚本
```bash
#!/bin/bash
# 将图片从Java包移动到静态资源目录
SRC_DIR="src/main/java/com/example/writemyself/pic"
DEST_DIR="src/main/resources/static/images/tiles"

# 创建目标目录
mkdir -p $DEST_DIR

# 复制并重命名图片文件（处理中文文件名）
cp "$SRC_DIR/棕色.png" "$DEST_DIR/brown.png"
cp "$SRC_DIR/石墙.png" "$DEST_DIR/stone-wall.png"
cp "$SRC_DIR/石头.png" "$DEST_DIR/stone.png"
cp "$SRC_DIR/绿色.png" "$DEST_DIR/green.png"
cp "$SRC_DIR/石头2.png" "$DEST_DIR/stone2.png"
cp "$SRC_DIR/绿色2.png" "$DEST_DIR/green2.png"
cp "$SRC_DIR/障碍物.png" "$DEST_DIR/obstacle.png"

echo "图片资源已复制到静态资源目录"
```

## Risks / Trade-offs
- **风险**: Canvas性能可能受网格尺寸影响
  - **缓解**: 限制最大网格尺寸（32x32），优化渲染逻辑
- **风险**: 浏览器兼容性（特别是较旧浏览器）
  - **缓解**: 使用现代JavaScript特性，提供基础功能降级
- **权衡**: 本地存储 vs 服务器存储
  - **接受**: 仅实现本地导出，简化架构，符合用户"保存到本地"需求
- **风险**: 图片加载异步问题
  - **缓解**: 实现图片预加载，提供加载状态提示

## Open Questions
1. 是否需要支持自定义图块上传？
2. 是否需要实现图块属性编辑（如通行性、类型）？
3. 是否需要支持多种导出格式（JPG, WEBP）？
4. 是否需要实现地图模板/预设功能？

## 后续扩展建议
1. **图层支持**: 添加多个编辑图层（地面层、物体层、特效层）
2. **图块属性**: 为每个图块添加自定义属性（可通行、伤害值等）
3. **地图格式**: 支持导出为JSON格式，包含图块数据和属性
4. **模板库**: 提供预设地图模板，如房间、走廊、迷宫等
5. **协作功能**: 基础的多用户同时编辑（需要后端支持）

