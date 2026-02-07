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

