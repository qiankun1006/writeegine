/**
 * Tilemap编辑器 - 完整重建版本
 * 包含图块选择、放置、撤销/重做、导出等功能
 */

class TilemapEditor {
    /**
     * 构造函数 - 初始化编辑器
     */
    constructor() {
        // DOM元素引用
        this.canvas = null;
        this.ctx = null;
        this.tileSelector = null;
        this.currentTileImage = null;
        this.currentTileName = null;
        this.gridSizeSelect = null;
        this.btnClear = null;
        this.btnUndo = null;
        this.btnRedo = null;
        this.btnExport = null;
        this.gridInfo = null;
        this.placedCount = null;

        // 编辑器数据
        this.tiles = [];              // 图块元数据数组
        this.selectedTileIndex = 0;   // 当前选中图块索引
        this.gridSize = 16;           // 网格尺寸
        this.gridData = [];           // 画布数据（二维数组）
        this.history = [];            // 撤销历史
        this.historyIndex = -1;       // 当前历史指针

        // 鼠标状态
        this.isMouseDown = false;
        this.lastPlacedX = -1;
        this.lastPlacedY = -1;

        // 初始化
        this.init();
    }

    /**
     * 初始化编辑器
     */
    init() {
        this.initDOM();
        this.loadTiles();
        this.createEmptyGrid();
        this.setupEventListeners();
        this.selectTile(0);
        this.render();
    }

    /**
     * 初始化DOM元素引用
     */
    initDOM() {
        this.canvas = document.getElementById('tilemap-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.tileSelector = document.getElementById('tile-selector');
        this.currentTileImage = document.getElementById('current-tile-image');
        this.currentTileName = document.getElementById('current-tile-name');
        this.gridSizeSelect = document.getElementById('grid-size-select');
        this.btnClear = document.getElementById('btn-clear');
        this.btnUndo = document.getElementById('btn-undo');
        this.btnRedo = document.getElementById('btn-redo');
        this.btnExport = document.getElementById('btn-export');
        this.gridInfo = document.getElementById('grid-info');
        this.placedCount = document.getElementById('placed-count');
    }

    /**
     * 从DOM加载图块信息
     */
    loadTiles() {
        const tileItems = document.querySelectorAll('.tile-selector-item');
        this.tiles = [];

        tileItems.forEach((item, index) => {
            const img = new Image();
            const imgSrc = item.querySelector('img').src;
            const tileName = item.dataset.tileName;

            img.onload = () => {
                this.tiles[index] = {
                    image: img,
                    name: tileName,
                    src: imgSrc
                };
            };

            img.onerror = () => {
                console.error(`图块 ${index} 加载失败: ${imgSrc}`);
            };

            img.src = imgSrc;
        });
    }

    /**
     * 创建空白网格数据
     */
    createEmptyGrid() {
        this.gridData = [];
        for (let y = 0; y < this.gridSize; y++) {
            this.gridData[y] = [];
            for (let x = 0; x < this.gridSize; x++) {
                this.gridData[y][x] = -1; // -1表示空格子
            }
        }
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 图块选择
        const tileItems = document.querySelectorAll('.tile-selector-item');
        tileItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectTile(index);
            });
        });

        // Canvas鼠标事件
        this.canvas.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onCanvasMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onCanvasMouseUp());

        // 工具栏按钮
        this.btnClear.addEventListener('click', () => this.clearCanvas());
        this.btnUndo.addEventListener('click', () => this.undo());
        this.btnRedo.addEventListener('click', () => this.redo());
        this.btnExport.addEventListener('click', () => this.exportToPNG());

        // 网格尺寸选择
        this.gridSizeSelect.addEventListener('change', (e) => {
            this.changeGridSize(parseInt(e.target.value));
        });
    }

    /**
     * 选中指定的图块
     * @param {number} index - 图块索引
     */
    selectTile(index) {
        if (index < 0 || index >= this.tiles.length) return;

        this.selectedTileIndex = index;

        // 更新UI高亮
        const tileItems = document.querySelectorAll('.tile-selector-item');
        tileItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });

        // 更新显示区域
        const tile = this.tiles[index];
        if (tile && tile.image) {
            this.currentTileImage.src = tile.src;
            this.currentTileName.textContent = tile.name;
        }
    }

    /**
     * Canvas鼠标按下事件
     * @param {MouseEvent} e - 鼠标事件
     */
    onCanvasMouseDown(e) {
        this.isMouseDown = true;
        const coords = this.getGridCoordinates(e);
        if (coords) {
            this.lastPlacedX = coords.x;
            this.lastPlacedY = coords.y;
            this.placeTile(coords.x, coords.y);
        }
    }

    /**
     * Canvas鼠标移动事件
     * @param {MouseEvent} e - 鼠标事件
     */
    onCanvasMouseMove(e) {
        if (!this.isMouseDown) return;

        const coords = this.getGridCoordinates(e);
        if (coords) {
            // 如果位置改变了，放置图块
            if (coords.x !== this.lastPlacedX || coords.y !== this.lastPlacedY) {
                this.placeTile(coords.x, coords.y);
            }
        }
    }

    /**
     * Canvas鼠标释放事件
     */
    onCanvasMouseUp() {
        if (this.isMouseDown) {
            this.isMouseDown = false;
            this.lastPlacedX = -1;
            this.lastPlacedY = -1;
        }
    }

    /**
     * 获取鼠标位置对应的网格坐标
     * @param {MouseEvent} e - 鼠标事件
     * @returns {Object|null} - {x, y}或null
     */
    getGridCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cellSize = this.canvas.width / this.gridSize;
        const gridX = Math.floor(x / cellSize);
        const gridY = Math.floor(y / cellSize);

        if (gridX < 0 || gridX >= this.gridSize ||
            gridY < 0 || gridY >= this.gridSize) {
            return null;
        }

        return { x: gridX, y: gridY };
    }

    /**
     * 在指定位置放置图块
     * @param {number} x - 网格X坐标
     * @param {number} y - 网格Y坐标
     */
    placeTile(x, y) {
        if (!this.isValidCoordinate(x, y)) return;

        // 设置图块
        this.gridData[y][x] = this.selectedTileIndex;

        // 更新UI
        this.updatePlacedCount();
        this.saveHistory();
        this.render();
    }

    /**
     * 检查坐标是否有效
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {boolean}
     */
    isValidCoordinate(x, y) {
        return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
    }

    /**
     * 更新已放置图块数量
     */
    updatePlacedCount() {
        let count = 0;
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.gridData[y][x] !== -1) {
                    count++;
                }
            }
        }
        this.placedCount.textContent = count;
    }

    /**
     * 保存当前状态到历史
     */
    saveHistory() {
        // 移除重做记录
        this.history.splice(this.historyIndex + 1);

        // 保存深拷贝
        const state = JSON.parse(JSON.stringify(this.gridData));
        this.history.push(state);
        this.historyIndex = this.history.length - 1;

        // 限制历史长度
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }

        this.updateButtonStates();
    }

    /**
     * 撤销操作
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreFromHistory();
        }
    }

    /**
     * 重做操作
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreFromHistory();
        }
    }

    /**
     * 从历史恢复状态
     */
    restoreFromHistory() {
        this.gridData = JSON.parse(JSON.stringify(
            this.history[this.historyIndex]
        ));
        this.updatePlacedCount();
        this.updateButtonStates();
        this.render();
    }

    /**
     * 更新按钮的启用/禁用状态
     */
    updateButtonStates() {
        this.btnUndo.disabled = this.historyIndex <= 0;
        this.btnRedo.disabled = this.historyIndex >= this.history.length - 1;
    }

    /**
     * 清空画布
     */
    clearCanvas() {
        if (confirm('确定要清空画布吗？')) {
            this.createEmptyGrid();
            this.history = [];
            this.historyIndex = -1;
            this.updatePlacedCount();
            this.updateButtonStates();
            this.render();
        }
    }

    /**
     * 改变网格尺寸
     * @param {number} newSize - 新的网格尺寸
     */
    changeGridSize(newSize) {
        if (newSize === this.gridSize) return;

        if (this.placedCount.textContent !== '0') {
            if (!confirm('改变网格尺寸会清空当前画布，继续吗？')) {
                this.gridSizeSelect.value = this.gridSize;
                return;
            }
        }

        this.gridSize = newSize;
        this.createEmptyGrid();
        this.history = [];
        this.historyIndex = -1;
        this.gridInfo.textContent = `${newSize}x${newSize}`;
        this.updatePlacedCount();
        this.updateButtonStates();
        this.render();
    }

    /**
     * 绘制渲染
     */
    render() {
        // 清空画布
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const cellSize = this.canvas.width / this.gridSize;

        // 绘制网格线
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

        // 绘制已放置的图块
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const tileIndex = this.gridData[y][x];
                if (tileIndex !== -1 && this.tiles[tileIndex]) {
                    this.drawTile(x, y, tileIndex, cellSize);
                }
            }
        }
    }

    /**
     * 绘制单个图块
     * @param {number} gridX - 网格X坐标
     * @param {number} gridY - 网格Y坐标
     * @param {number} tileIndex - 图块索引
     * @param {number} cellSize - 格子大小
     */
    drawTile(gridX, gridY, tileIndex, cellSize) {
        const tile = this.tiles[tileIndex];
        if (!tile || !tile.image) return;

        const x = gridX * cellSize;
        const y = gridY * cellSize;

        this.ctx.drawImage(tile.image, x, y, cellSize, cellSize);
    }

    /**
     * 导出为PNG
     */
    exportToPNG() {
        // 创建导出用的Canvas
        const exportCanvas = document.createElement('canvas');
        const cellSize = 16;
        exportCanvas.width = this.gridSize * cellSize;
        exportCanvas.height = this.gridSize * cellSize;

        const exportCtx = exportCanvas.getContext('2d');

        // 绘制图块
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const tileIndex = this.gridData[y][x];
                if (tileIndex !== -1 && this.tiles[tileIndex]) {
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

    /**
     * 下载图片
     * @param {string} dataUrl - 图片数据URL
     */
    downloadImage(dataUrl) {
        const link = document.getElementById('download-link');
        link.href = dataUrl;
        link.download = `tilemap-${Date.now()}.png`;
        link.click();
    }
}

// 页面加载完成后初始化编辑器
document.addEventListener('DOMContentLoaded', () => {
    new TilemapEditor();
});

