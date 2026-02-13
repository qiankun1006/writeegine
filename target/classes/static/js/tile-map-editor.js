/**
 * Tilemap编辑器
 */

// ========== 立即执行的诊断代码 ==========
console.log('✅✅✅ [LOADED] tile-map-editor.js 文件已被成功加载！');
console.log('⏰ 当前时间:', new Date().toLocaleTimeString());
console.log('🌐 页面URL:', window.location.href);

// 检查DOM元素
setTimeout(() => {
    const tileItems = document.querySelectorAll('.tile-selector-item');
    console.log(`📊 找到 ${tileItems.length} 个图块项`);

    if (tileItems.length === 0) {
        console.warn('⚠️ 没有找到图块项，可能Thymeleaf模板没有正确渲染');
    }
}, 100);

// ========== TilemapEditor 类 ==========
class TilemapEditor {
    constructor() {
        console.log('🚀 TilemapEditor 构造函数被调用');
        this.init();
    }

    init() {
        console.log('📍 开始初始化编辑器');
        this.initDOM();
        this.createEmptyGrid();
        this.setupEventListeners();
        this.loadTiles();
        this.render();
        console.log('✅ 编辑器初始化完成');
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

        console.log('✅ DOM 元素初始化完成');
    }

    loadTiles() {
        console.log('📍 开始加载图块');
        const tileItems = document.querySelectorAll('.tile-selector-item');
        console.log(`  找到 ${tileItems.length} 个图块项`);

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
                console.log(`  ✅ 图块 ${index} 加载成功 (${loadedCount}/${totalTiles}): ${tileName}`);

                if (loadedCount === totalTiles) {
                    console.log('🎉 所有图块加载完成！');
                    this.selectTile(0);
                }
            };

            img.onerror = () => {
                console.error(`  ❌ 图块 ${index} 加载失败: ${imgSrc}`);
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
        console.log('✅ 空白网格创建完成');
    }

    setupEventListeners() {
        console.log('📍 开始设置事件监听器');

        // 图块选择事件
        const tileItems = document.querySelectorAll('.tile-selector-item');
        console.log(`  为 ${tileItems.length} 个图块项绑定点击事件`);

        tileItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                console.log(`🖱️ 图块 ${index} 被点击！`);
                console.log(`  目标元素:`, e.target);
                this.selectTile(index);
            });
        });

        // Canvas事件
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

        console.log('✅ 事件监听器设置完成');
    }

    selectTile(index) {
        console.log(`📍 selectTile(${index}) 被调用`);

        if (index < 0 || index >= this.tiles.length) {
            console.error(`❌ 索引越界: ${index}/${this.tiles.length}`);
            return;
        }

        this.selectedTileIndex = index;
        console.log(`  ✅ 已选中图块 ${index}: ${this.tiles[index].name}`);

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

// ========== 页面加载完成后初始化编辑器 ==========
console.log('📍 监听 DOMContentLoaded 事件...');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOMContentLoaded 事件触发，开始创建 TilemapEditor 实例...');
    try {
        window.editor = new TilemapEditor();
        console.log('✅ TilemapEditor 实例已创建，保存到 window.editor');
    } catch (error) {
        console.error('❌ 创建 TilemapEditor 失败:', error);
        console.error('错误信息:', error.message);
        console.error('堆栈:', error.stack);
    }
});

