/**
 * Tilemap编辑器
 *
 * 提供地块编辑器的核心功能：
 * - 加载地块图片
 * - 点击画布放置地块
 * - 撤销/重做功能
 * - 导出为PNG
 */

// TilemapEditor 类
class TilemapEditor {
    constructor() {
        this.init();
    }

    init() {
        this.initDOM();
        this.createEmptyGrid();
        this.setupEventListeners();
        this.loadTiles();
        this.render();
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

                if (loadedCount === totalTiles) {
                    this.selectTile(0);
                }
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
        const tileItems = document.querySelectorAll('.tile-selector-item');

        tileItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
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
    }

    selectTile(index) {
        if (index < 0 || index >= this.tiles.length) return;

        this.selectedTileIndex = index;

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
        Dialog.confirm({
            title: '清空画布',
            message: '确定要清空画布吗？',
            detail: '这将清除所有已放置的图块',
            iconType: 'warning',
            onConfirm: () => {
                this.createEmptyGrid();
                this.history = [];
                this.historyIndex = -1;
                this.updatePlacedCount();
                this.updateButtonStates();
                this.render();
                Dialog.alert({
                    title: '成功',
                    message: '画布已清空',
                    iconType: 'success'
                });
            }
        });
    }

    changeGridSize(newSize) {
        if (newSize === this.gridSize) return;
        if (this.placedCount.textContent !== '0') {
            Dialog.confirm({
                title: '改变网格尺寸',
                message: '改变网格尺寸会清空当前画布',
                detail: '您确定要继续吗？',
                iconType: 'warning',
                onConfirm: () => {
                    this.applyGridSizeChange(newSize);
                },
                onCancel: () => {
                    this.gridSizeSelect.value = this.gridSize;
                }
            });
        } else {
            this.applyGridSizeChange(newSize);
        }
    }

    applyGridSizeChange(newSize) {
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

// 可拖动布局分隔符管理器
class ResizableLayoutManager {
    constructor() {
        this.divider = document.getElementById('resizable-divider');
        if (!this.divider) return;

        this.wrapper = document.querySelector('.tilemap-editor-wrapper');
        this.leftPanel = document.querySelector('.tile-selector-panel');
        this.rightPanel = document.querySelector('.editor-panel');

        this.isDragging = false;
        this.minLeftWidth = 120;      // 左侧最小宽度
        this.minRightWidth = 300;     // 右侧最小宽度
        this.startX = 0;
        this.startLeftWidth = 0;

        this.initEventListeners();
    }

    initEventListeners() {
        this.divider.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
    }

    startDrag(e) {
        e.preventDefault();
        this.isDragging = true;
        this.divider.classList.add('active');
        this.startX = e.clientX;
        this.startLeftWidth = this.leftPanel.offsetWidth;
    }

    onDrag(e) {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.startX;
        const newLeftWidth = this.startLeftWidth + deltaX;

        // 计算右侧宽度
        const dividerWidth = this.divider.offsetWidth;
        const availableWidth = this.wrapper.offsetWidth;
        const newRightWidth = availableWidth - newLeftWidth - dividerWidth;

        // 验证最小宽度限制
        if (newLeftWidth >= this.minLeftWidth &&
            newRightWidth >= this.minRightWidth) {
            this.leftPanel.style.width = newLeftWidth + 'px';
            this.rightPanel.style.flex = '0 0 ' + newRightWidth + 'px';
        }
    }

    stopDrag() {
        this.isDragging = false;
        this.divider.classList.remove('active');
    }
}

/**
 * 自定义对话框组件
 * 提供现代的模态对话框功能，带有游戏引擎风格
 */
class Dialog {
    constructor(options = {}) {
        this.title = options.title || '对话框';
        this.message = options.message || '';
        this.detail = options.detail || '';
        this.buttons = options.buttons || [
            { text: '确定', type: 'primary', callback: () => this.close() }
        ];
        this.iconType = options.iconType || 'info'; // 'info', 'warning', 'danger', 'success'
        this.onClose = options.onClose || null;
        this.isOpen = false;
    }

    /**
     * 创建对话框的 DOM 结构
     */
    createDOM() {
        // 创建覆盖层
        this.overlay = document.createElement('div');
        this.overlay.className = 'dialog-overlay';

        // 创建对话框容器
        this.box = document.createElement('div');
        this.box.className = 'dialog-box';

        // 创建对话框头部
        const header = document.createElement('div');
        header.className = 'dialog-header';

        const title = document.createElement('h2');
        title.className = 'dialog-title';
        title.textContent = this.title;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'dialog-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => this.close();

        header.appendChild(title);
        header.appendChild(closeBtn);

        // 创建对话框内容
        const content = document.createElement('div');
        content.className = 'dialog-content';

        // 添加图标
        if (this.iconType) {
            const icon = document.createElement('div');
            icon.className = `dialog-icon ${this.iconType}`;

            const iconMap = {
                'info': 'ℹ️',
                'warning': '⚠️',
                'danger': '❌',
                'success': '✅'
            };
            icon.textContent = iconMap[this.iconType] || 'ℹ️';
            content.appendChild(icon);
        }

        // 添加消息
        if (this.message) {
            const message = document.createElement('p');
            message.className = 'dialog-message';
            message.textContent = this.message;
            content.appendChild(message);
        }

        // 添加详情
        if (this.detail) {
            const detail = document.createElement('p');
            detail.className = 'dialog-detail';
            detail.textContent = this.detail;
            content.appendChild(detail);
        }

        // 创建按钮容器
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'dialog-buttons';

        this.buttons.forEach(btnConfig => {
            const btn = document.createElement('button');
            btn.className = `btn btn-${btnConfig.type || 'secondary'}`;
            btn.textContent = btnConfig.text;
            btn.onclick = () => {
                if (btnConfig.callback) {
                    btnConfig.callback();
                }
                this.close();
            };
            buttonsContainer.appendChild(btn);
        });

        // 组装对话框
        this.box.appendChild(header);
        this.box.appendChild(content);
        this.box.appendChild(buttonsContainer);

        // 覆盖层点击关闭
        this.overlay.onclick = (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        };

        this.overlay.appendChild(this.box);
    }

    /**
     * 显示对话框
     */
    show() {
        if (!this.isOpen) {
            this.createDOM();
            document.body.appendChild(this.overlay);
            this.isOpen = true;
        }
    }

    /**
     * 关闭对话框
     */
    close() {
        if (this.isOpen) {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            this.isOpen = false;
            if (this.onClose) {
                this.onClose();
            }
        }
    }

    /**
     * 快捷方法：显示确认对话框
     */
    static confirm(options) {
        const defaultOptions = {
            title: '确认',
            message: '您确定要进行此操作吗？',
            iconType: 'warning',
            buttons: [
                {
                    text: '取消',
                    type: 'secondary',
                    callback: () => {
                        if (options.onCancel) options.onCancel();
                    }
                },
                {
                    text: '确定',
                    type: 'danger',
                    callback: () => {
                        if (options.onConfirm) options.onConfirm();
                    }
                }
            ]
        };

        const dialog = new Dialog({ ...defaultOptions, ...options });
        dialog.show();
        return dialog;
    }

    /**
     * 快捷方法：显示提示对话框
     */
    static alert(options) {
        const defaultOptions = {
            title: '提示',
            message: '操作成功',
            iconType: 'success',
            buttons: [
                {
                    text: '关闭',
                    type: 'primary',
                    callback: () => {
                        if (options.onClose) options.onClose();
                    }
                }
            ]
        };

        const dialog = new Dialog({ ...defaultOptions, ...options });
        dialog.show();
        return dialog;
    }
}

// 页面加载完成后初始化编辑器和布局管理器
function initTilemapEditor() {
    // 检查 tilemap-canvas 是否存在
    const canvas = document.getElementById('tilemap-canvas');
    console.log('🗺️ Tilemap 初始化检查 - Canvas:', canvas ? '✓ 存在' : '✗ 不存在');

    if (!canvas) {
        console.log('⚠️ 未在当前页面找到 tilemap-canvas，跳过 Tilemap 编辑器初始化');
        return;
    }

    try {
        if (!window.editor) {
            window.editor = new TilemapEditor();
            console.log('✓ Tilemap 编辑器已初始化');
        }
        if (!window.resizableLayout) {
            window.resizableLayout = new ResizableLayoutManager();
            console.log('✓ ResizableLayoutManager 已初始化');
        }
    } catch (error) {
        console.error('编辑器初始化失败:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 DOMContentLoaded 触发，延迟初始化 Tilemap');
    // 延迟 100ms 确保所有 DOM 都已渲染
    setTimeout(initTilemapEditor, 100);
});

