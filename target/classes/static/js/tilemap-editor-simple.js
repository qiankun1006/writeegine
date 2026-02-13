/**
 * Tilemap编辑器 - 简化版
 * 这个文件会被直接加载，不会被Thymeleaf过滤
 */

console.log('✅ tilemap-editor-simple.js 已加载');

// 诊断面板更新函数
function updateDiagnostic(text) {
    const panel = document.getElementById('diagnostic-content');
    if (panel) {
        panel.innerHTML += text + '<br>';
        panel.scrollTop = panel.scrollHeight;
    }
}

// 立即更新
updateDiagnostic('✅ 脚本执行中...');

// TilemapEditor 类
class TilemapEditor {
    constructor() {
        console.log('🚀 TilemapEditor 构造函数被调用');
        updateDiagnostic('🚀 开始初始化编辑器');
        this.init();
    }

    init() {
        this.initDOM();
        this.createEmptyGrid();
        this.setupEventListeners();
        this.loadTiles();
        this.render();
        updateDiagnostic('✅ 编辑器初始化完成');
    }

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

        this.tiles = [];
        this.selectedTileIndex = 0;
        this.gridSize = 16;
        this.gridData = [];
        this.history = [];
        this.historyIndex = -1;
        this.isMouseDown = false;
        this.lastPlacedX = -1;
        this.lastPlacedY = -1;
    }

    loadTiles() {
        const tileItems = document.querySelectorAll('.tile-selector-item');
        updateDiagnostic(`📊 找到 ${tileItems.length} 个图块项`);

        this.tiles = new Array(tileItems.length);
        let loadedCount = 0;
        const totalTiles = tileItems.length;

        tileItems.forEach((item, index) => {
            const img = new Image();
            const imgSrc = item.querySelector('img').src;
            const tileName = item.dataset.tileName;

            this.tiles[index] = {
                image: null,
                name: tileName,
                src: imgSrc,
                loaded: false
            };

            img.onload = () => {
                this.tiles[index].image = img;
                this.tiles[index].loaded = true;
                loadedCount++;
                updateDiagnostic(`  ✅ 图块 ${index} 加载成功`);

                if (loadedCount === totalTiles) {
                    updateDiagnostic('🎉 所有图块加载完成！');
                    this.selectTile(0);
                }
            };

            img.onerror = () => {
                updateDiagnostic(`  ❌ 图块 ${index} 加载失败`);
            };

            img.src = imgSrc;
        });
    }

    createEmptyGrid() {
        this.gridData = [];
        for (let y = 0; y < this.gridSize; y++) {
            this.gridData[y] = [];
            for (let x = 0; x < this.gridSize; x++) {
                this.gridData[y][x] = -1;
            }
        }
    }

    setupEventListeners() {
        updateDiagnostic('📍 开始设置事件监听器');

        const tileItems = document.querySelectorAll('.tile-selector-item');
        updateDiagnostic(`  为 ${tileItems.length} 个图块项绑定点击事件`);

        tileItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                updateDiagnostic(`🖱️ 图块 ${index} 被点击！`);
                this.selectTile(index);
            });
        });

        this.canvas.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onCanvasMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onCanvasMouseUp());

        this.btnClear.addEventListener('click', () => this.clearCanvas());
        this.btnUndo.addEventListener('click', () => this.undo());
        this.btnRedo.addEventListener('click', () => this.redo());
        this.btnExport.addEventListener('click', () => this.exportToPNG());

        this.gridSizeSelect.addEventListener('change', (e) => {
            this.changeGridSize(parseInt(e.target.value));
        });

        updateDiagnostic('✅ 事件监听器设置完成');
    }

    selectTile(index) {
        if (index < 0 || index >= this.tiles.length) return;

        this.selectedTileIndex = index;
        updateDiagnostic(`  ✅ 已选中图块 ${index}`);

        const tileItems = document.querySelectorAll('.tile-selector-item');
        tileItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });

        const tile = this.tiles[index];
        if (tile && tile.image) {
            this.currentTileImage.src = tile.src;
            this.currentTileName.textContent = tile.name;
        }
    }

    onCanvasMouseDown(e) {
        this.isMouseDown = true;
        const coords = this.getGridCoordinates(e);
        if (coords) {
            this.lastPlacedX = coords.x;
            this.lastPlacedY = coords.y;
            this.placeTile(coords.x, coords.y);
        }
    }

    onCanvasMouseMove(e) {
        if (!this.isMouseDown) return;
        const coords = this.getGridCoordinates(e);
        if (coords) {
            if (coords.x !== this.lastPlacedX || coords.y !== this.lastPlacedY) {
                this.placeTile(coords.x, coords.y);
            }
        }
    }

    onCanvasMouseUp() {
        if (this.isMouseDown) {
            this.isMouseDown = false;
            this.lastPlacedX = -1;
            this.lastPlacedY = -1;
        }
    }

    getGridCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cellSize = this.canvas.width / this.gridSize;
        const gridX = Math.floor(x / cellSize);
        const gridY = Math.floor(y / cellSize);

        if (gridX < 0 || gridX >= this.gridSize || gridY < 0 || gridY >= this.gridSize) {
            return null;
        }
        return { x: gridX, y: gridY };
    }

    placeTile(x, y) {
        if (!this.isValidCoordinate(x, y)) return;
        this.gridData[y][x] = this.selectedTileIndex;
        this.updatePlacedCount();
        this.saveHistory();
        this.render();
    }

    isValidCoordinate(x, y) {
        return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
    }

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

    saveHistory() {
        this.history.splice(this.historyIndex + 1);
        const state = JSON.parse(JSON.stringify(this.gridData));
        this.history.push(state);
        this.historyIndex = this.history.length - 1;
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
        this.updateButtonStates();
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
        this.gridData = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
        this.updatePlacedCount();
        this.updateButtonStates();
        this.render();
    }

    updateButtonStates() {
        this.btnUndo.disabled = this.historyIndex <= 0;
        this.btnRedo.disabled = this.historyIndex >= this.history.length - 1;
    }

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

    render() {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const cellSize = this.canvas.width / this.gridSize;
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.gridSize; i++) {
            const pos = i * cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvas.width, pos);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const tileIndex = this.gridData[y][x];
                if (tileIndex !== -1 && this.tiles[tileIndex]) {
                    this.drawTile(x, y, tileIndex, cellSize);
                }
            }
        }
    }

    drawTile(gridX, gridY, tileIndex, cellSize) {
        const tile = this.tiles[tileIndex];
        if (!tile || !tile.image) return;
        const x = gridX * cellSize;
        const y = gridY * cellSize;
        this.ctx.drawImage(tile.image, x, y, cellSize, cellSize);
    }

    exportToPNG() {
        const exportCanvas = document.createElement('canvas');
        const cellSize = 16;
        exportCanvas.width = this.gridSize * cellSize;
        exportCanvas.height = this.gridSize * cellSize;
        const exportCtx = exportCanvas.getContext('2d');
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const tileIndex = this.gridData[y][x];
                if (tileIndex !== -1 && this.tiles[tileIndex]) {
                    const tile = this.tiles[tileIndex];
                    const sx = x * cellSize;
                    const sy = y * cellSize;
                    exportCtx.drawImage(tile.image, sx, sy, cellSize, cellSize);
                }
            }
        }
        const imageData = exportCanvas.toDataURL('image/png');
        this.downloadImage(imageData);
    }

    downloadImage(dataUrl) {
        const link = document.getElementById('download-link');
        link.href = dataUrl;
        link.download = `tilemap-${Date.now()}.png`;
        link.click();
    }
}

// 页面加载完成后初始化编辑器
document.addEventListener('DOMContentLoaded', () => {
    updateDiagnostic('✅ DOMContentLoaded 触发');
    try {
        window.editor = new TilemapEditor();
        updateDiagnostic('✅ 编辑器实例已创建！');
    } catch (error) {
        updateDiagnostic(`❌ 错误: ${error.message}`);
        console.error('错误:', error);
    }
});

