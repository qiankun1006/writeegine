/**
 * AssetEditor.js - 素材编辑器核心
 * 提供各种素材的编辑功能
 */

class AssetEditor {
    constructor(assetManager) {
        this.assetManager = assetManager;
        this.currentCanvas = null;
        this.currentContext = null;
    }

    /**
     * 初始化画布
     */
    initCanvas(canvasId, width = 400, height = 400) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`❌ 未找到canvas: ${canvasId}`);
            return null;
        }

        canvas.width = width;
        canvas.height = height;
        this.currentCanvas = canvas;
        this.currentContext = canvas.getContext('2d');

        // 填充背景
        this.currentContext.fillStyle = '#f9f9f9';
        this.currentContext.fillRect(0, 0, width, height);

        return canvas;
    }

    /**
     * 清空画布
     */
    clearCanvas() {
        if (this.currentContext && this.currentCanvas) {
            this.currentContext.fillStyle = '#f9f9f9';
            this.currentContext.fillRect(0, 0, this.currentCanvas.width, this.currentCanvas.height);
        }
    }

    /**
     * 绘制网格背景
     */
    drawGrid(spacing = 20, color = '#e0e0e0') {
        if (!this.currentContext || !this.currentCanvas) return;

        this.currentContext.strokeStyle = color;
        this.currentContext.lineWidth = 1;

        for (let x = 0; x <= this.currentCanvas.width; x += spacing) {
            this.currentContext.beginPath();
            this.currentContext.moveTo(x, 0);
            this.currentContext.lineTo(x, this.currentCanvas.height);
            this.currentContext.stroke();
        }

        for (let y = 0; y <= this.currentCanvas.height; y += spacing) {
            this.currentContext.beginPath();
            this.currentContext.moveTo(0, y);
            this.currentContext.lineTo(this.currentCanvas.width, y);
            this.currentContext.stroke();
        }
    }

    /**
     * 编辑角色立绘
     */
    editPortrait(assetId, type = 'full') {
        const asset = this.assetManager.getAsset(assetId);
        if (!asset) return false;

        const canvas = this.initCanvas('portrait-canvas', 400, 600);
        this.drawGrid(40);

        // 绘制人物轮廓（示例）
        this.drawCharacterOutline(type);

        this.assetManager.updateAssetData(assetId, { type });
        this.assetManager.saveAssetImage(assetId, canvas);

        console.log(`✓ 编辑角色立绘: ${asset.name} (${type})`);
        return true;
    }

    /**
     * 绘制角色轮廓
     */
    drawCharacterOutline(type) {
        const ctx = this.currentContext;
        const centerX = this.currentCanvas.width / 2;
        const centerY = this.currentCanvas.height / 2;

        ctx.fillStyle = '#667eea';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;

        switch (type) {
            case 'full':
                // 全身
                ctx.beginPath();
                ctx.arc(centerX, centerY - 100, 30, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillRect(centerX - 25, centerY - 70, 50, 70);
                ctx.strokeRect(centerX - 25, centerY - 70, 50, 70);

                ctx.fillRect(centerX - 35, centerY, 20, 80);
                ctx.strokeRect(centerX - 35, centerY, 20, 80);
                ctx.fillRect(centerX + 15, centerY, 20, 80);
                ctx.strokeRect(centerX + 15, centerY, 20, 80);
                break;

            case 'half':
                // 半身
                ctx.beginPath();
                ctx.arc(centerX, centerY - 80, 25, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillRect(centerX - 20, centerY - 55, 40, 60);
                ctx.strokeRect(centerX - 20, centerY - 55, 40, 60);
                break;

            case 'head':
                // 头像
                ctx.beginPath();
                ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.arc(centerX - 15, centerY - 10, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(centerX + 15, centerY - 10, 5, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }

    /**
     * 编辑地图地形
     */
    editTerrain(assetId, terrain = 'grass') {
        const asset = this.assetManager.getAsset(assetId);
        if (!asset) return false;

        const canvas = this.initCanvas('map-canvas', 600, 400);
        this.drawGrid(40);

        const colors = {
            grass: '#90EE90',
            mountain: '#8B7355',
            forest: '#228B22',
            wall: '#A9A9A9',
            desert: '#EDC9AF',
            snow: '#FFFAFA',
            ruin: '#696969'
        };

        // 绘制地形块示例
        const ctx = this.currentContext;
        const tileSize = 40;
        const tilesX = Math.floor(this.currentCanvas.width / tileSize);
        const tilesY = Math.floor(this.currentCanvas.height / tileSize);

        ctx.fillStyle = colors[terrain] || colors.grass;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;

        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }

        this.assetManager.updateAssetData(assetId, { terrain });
        this.assetManager.saveAssetImage(assetId, canvas);

        console.log(`✓ 编辑地形: ${asset.name} (${terrain})`);
        return true;
    }

    /**
     * 编辑UI元素
     */
    editUI(assetId, components = []) {
        const asset = this.assetManager.getAsset(assetId);
        if (!asset) return false;

        const canvas = this.initCanvas('ui-canvas', 600, 400);
        this.clearCanvas();

        // 绘制UI背景
        const ctx = this.currentContext;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制标题栏
        ctx.fillStyle = '#667eea';
        ctx.fillRect(0, 0, canvas.width, 60);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('主菜单', canvas.width / 2, 40);

        // 绘制按钮示例
        this.drawButton(canvas.width / 2 - 60, 120, 120, 40, '开始游戏');
        this.drawButton(canvas.width / 2 - 60, 180, 120, 40, '继续游戏');
        this.drawButton(canvas.width / 2 - 60, 240, 120, 40, '设置');
        this.drawButton(canvas.width / 2 - 60, 300, 120, 40, '退出');

        this.assetManager.updateAssetData(assetId, { components });
        this.assetManager.saveAssetImage(assetId, canvas);

        console.log(`✓ 编辑UI: ${asset.name}`);
        return true;
    }

    /**
     * 绘制按钮
     */
    drawButton(x, y, width, height, text) {
        const ctx = this.currentContext;

        // 按钮背景
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, width, height);

        // 按钮边框
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // 按钮文字
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + width / 2, y + height / 2);
    }

    /**
     * 编辑特效
     */
    editEffect(assetId, effectType = 'fire') {
        const asset = this.assetManager.getAsset(assetId);
        if (!asset) return false;

        const canvas = this.initCanvas('effect-canvas', 500, 500);
        this.clearCanvas();

        const ctx = this.currentContext;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const effects = {
            fire: () => this.drawFireEffect(ctx, centerX, centerY),
            ice: () => this.drawIceEffect(ctx, centerX, centerY),
            lightning: () => this.drawLightningEffect(ctx, centerX, centerY),
            holy: () => this.drawHolyEffect(ctx, centerX, centerY),
            dark: () => this.drawDarkEffect(ctx, centerX, centerY)
        };

        if (effects[effectType]) {
            effects[effectType]();
        }

        this.assetManager.updateAssetData(assetId, { effectType });
        this.assetManager.saveAssetImage(assetId, canvas);

        console.log(`✓ 编辑特效: ${asset.name} (${effectType})`);
        return true;
    }

    /**
     * 绘制火焰特效
     */
    drawFireEffect(ctx, centerX, centerY) {
        // 火焰圆
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 绘制冰冻特效
     */
    drawIceEffect(ctx, centerX, centerY) {
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#4A90E2';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
        ctx.stroke();

        // 冰晶
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.strokeStyle = '#4A90E2';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(angle) * 40, centerY + Math.sin(angle) * 40);
            ctx.stroke();
        }
    }

    /**
     * 绘制闪电特效
     */
    drawLightningEffect(ctx, centerX, centerY) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 60);
        ctx.lineTo(centerX - 20, centerY - 20);
        ctx.lineTo(centerX, centerY - 10);
        ctx.lineTo(centerX + 30, centerY + 40);
        ctx.stroke();

        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 60);
        ctx.lineTo(centerX - 20, centerY - 20);
        ctx.lineTo(centerX, centerY - 10);
        ctx.lineTo(centerX + 30, centerY + 40);
        ctx.stroke();
    }

    /**
     * 绘制圣光特效
     */
    drawHolyEffect(ctx, centerX, centerY) {
        // 光圈
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFF99';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 绘制黑暗特效
     */
    drawDarkEffect(ctx, centerX, centerY) {
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 45, 0, Math.PI * 2);
        ctx.stroke();
    }

    /**
     * 撤销操作
     */
    undo() {
        console.log('✓ 撤销操作');
    }

    /**
     * 重做操作
     */
    redo() {
        console.log('✓ 重做操作');
    }
}

// 创建全局编辑器实例
const assetEditor = new AssetEditor(assetManager);

