/**
 * app.js - 游戏素材创作系统应用主程序
 * 管理UI交互和各编辑器之间的协调
 */

class GameAssetCreatorApp {
    constructor() {
        this.assetManager = assetManager;
        this.assetEditor = assetEditor;
        this.currentCategory = null;
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        console.log('🎨 初始化游戏素材创作系统...');
        this.setupEventListeners();
        this.setupMenuItems();
        this.loadWelcomePanel();
        console.log('✓ 初始化完成');
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 菜单项点击事件
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const category = item.dataset.category;
                this.switchPanel(category, item);
            });
        });

        // 快速链接点击事件
        document.querySelectorAll('.quick-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.dataset.category;
                const menuItem = document.querySelector(`.menu-item[data-category="${category}"]`);
                if (menuItem) {
                    menuItem.click();
                }
            });
        });

        // 工具栏按钮
        document.getElementById('new-asset-btn')?.addEventListener('click', () => this.newAsset());
        document.getElementById('import-asset-btn')?.addEventListener('click', () => this.importAsset());
        document.getElementById('export-asset-btn')?.addEventListener('click', () => this.exportAsset());
        document.getElementById('preview-btn')?.addEventListener('click', () => this.preview());
        document.getElementById('publish-btn')?.addEventListener('click', () => this.publish());

        // 立绘编辑器
        document.getElementById('portrait-type')?.addEventListener('change', (e) => {
            if (this.assetManager.currentAsset) {
                this.assetEditor.editPortrait(this.assetManager.currentAsset.id, e.target.value);
            }
        });

        document.getElementById('portrait-bg-color')?.addEventListener('change', (e) => {
            if (this.assetEditor.currentContext) {
                this.assetEditor.currentContext.fillStyle = e.target.value;
                this.assetEditor.clearCanvas();
                this.assetEditor.drawGrid();
                this.assetEditor.drawCharacterOutline(document.getElementById('portrait-type').value);
            }
        });

        // 地形选择
        document.querySelectorAll('.terrain-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.terrain-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                if (this.assetManager.currentAsset) {
                    const terrain = btn.dataset.terrain;
                    this.assetEditor.editTerrain(this.assetManager.currentAsset.id, terrain);
                }
            });
        });

        // 特效类型选择
        document.getElementById('effect-type')?.addEventListener('change', (e) => {
            if (this.assetManager.currentAsset) {
                this.assetEditor.editEffect(this.assetManager.currentAsset.id, e.target.value);
            }
        });

        // 动画播放
        document.getElementById('play-animation-btn')?.addEventListener('click', () => {
            this.playAnimation();
        });

        // 地形编辑器初始化
        this.setupTerrainPalette();
    }

    /**
     * 设置菜单项
     */
    setupMenuItems() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                menuItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    /**
     * 加载欢迎面板
     */
    loadWelcomePanel() {
        const panels = document.querySelectorAll('.content-panel');
        panels.forEach(panel => panel.classList.remove('active'));
        document.getElementById('welcome-panel').classList.add('active');
    }

    /**
     * 切换面板
     */
    switchPanel(category, menuItem = null) {
        console.log(`[DEBUG] 切换面板: ${category}`);

        // 移除所有active类
        document.querySelectorAll('.content-panel').forEach(panel => {
            panel.classList.remove('active');
            console.log(`[DEBUG] 移除active类: ${panel.id}`);
        });

        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        // 激活选中的菜单项和面板
        if (menuItem) {
            menuItem.classList.add('active');
        } else {
            const item = document.querySelector(`.menu-item[data-category="${category}"]`);
            if (item) item.classList.add('active');
        }

        const panelId = `${category}-panel`;
        const panel = document.getElementById(panelId);

        if (panel) {
            panel.classList.add('active');
            console.log(`[DEBUG] 添加active类: ${panelId}`);

            // 更新调试信息
            const debugInfo = document.getElementById('current-panel');
            if (debugInfo) {
                debugInfo.textContent = panelId;
            }

            this.currentCategory = category;

            // 特殊处理：Tilemap 编辑器初始化
            if (category === 'map-grid' && typeof initTilemapEditor === 'function') {
                console.log('🗺️ 初始化 Tilemap 编辑器...');
                initTilemapEditor();
            }

            // 特殊处理：骨骼动画帧序列编辑器
            if (category === 'character-frame-sequence') {
                console.log('🎬 激活骨骼动画帧序列编辑器...');
                // 骨骼动画编辑器已经在 FrameSequenceEditor.js 中自动初始化
                // 这里只需要确保它显示出来
            }

            // 根据分类创建或编辑资源
            if (!this.assetManager.currentAsset || this.assetManager.currentAsset.category !== category) {
                const asset = this.assetManager.createAsset(category);
                this.editCurrentAsset(category);
            }

            console.log(`📂 切换到: ${category}`);
        } else {
            console.warn(`⚠️ 找不到面板: ${panelId}，显示占位符面板`);

            // 显示占位符面板
            const placeholderPanel = document.getElementById('placeholder-panel');
            if (placeholderPanel) {
                placeholderPanel.classList.add('active');

                // 获取菜单项的文本
                const menuItem = document.querySelector(`.menu-item[data-category="${category}"]`);
                const menuText = menuItem ? menuItem.textContent.trim() : category;

                // 更新占位符内容
                const title = document.getElementById('placeholder-title');
                const desc = document.getElementById('placeholder-desc');
                if (title) title.textContent = `${menuText} - 功能开发中`;
                if (desc) desc.textContent = '该功能正在开发中，敬请期待！';

                // 更新调试信息
                const debugInfo = document.getElementById('current-panel');
                if (debugInfo) {
                    debugInfo.textContent = `placeholder (${category})`;
                }
            }
        }
    }

    /**
     * 编辑当前资源
     */
    editCurrentAsset(category) {
        const assetId = this.assetManager.currentAsset?.id;
        if (!assetId) return;

        switch (category) {
            case 'character-portrait':
                this.assetEditor.editPortrait(assetId, 'full');
                break;

            case 'character-sd':
                this.assetEditor.initCanvas('sd-canvas', 300, 300);
                this.assetEditor.drawGrid(30);
                this.drawSDCharacter();
                break;

            case 'character-animation':
                this.assetEditor.initCanvas('animation-canvas', 400, 400);
                this.assetEditor.drawGrid(40);
                this.drawAnimationFrame();
                break;

            case 'character-frame-sequence':
                // 初始化骨骼动画编辑器
                if (typeof window.initFrameSequenceEditor === 'function') {
                    console.log('🎬 初始化骨骼动画帧序列编辑器...');
                    window.initFrameSequenceEditor();
                } else {
                    console.warn('⚠️ initFrameSequenceEditor 函数未准备好');
                }
                break;

            case 'map-grid':
                // Tilemap 编辑器会自动初始化，无需额外处理
                console.log('✓ 战棋网格地图编辑器已加载');
                break;

            case 'ui-main-menu':
                this.assetEditor.editUI(assetId);
                break;

            case 'effect-magic':
                this.assetEditor.editEffect(assetId, 'fire');
                break;

            case 'story-portrait':
                this.assetEditor.editPortrait(assetId, 'full');
                break;

            default:
                this.assetEditor.initCanvas(this.getCanvasIdForCategory(category), 400, 400);
                this.assetEditor.drawGrid();
                break;
        }
    }

    /**
     * 获取分类对应的canvas id
     */
    getCanvasIdForCategory(category) {
        const canvasMap = {
            'character-portrait': 'portrait-canvas',
            'character-sd': 'sd-canvas',
            'character-animation': 'animation-canvas',
            'character-frame-sequence': 'skeleton-canvas',  // 骨骼动画画布
            'map-grid': 'tilemap-canvas',
            'ui-main-menu': 'ui-canvas',
            'effect-magic': 'effect-canvas'
        };
        return canvasMap[category] || 'main-canvas';
    }

    /**
     * 绘制SD角色
     */
    drawSDCharacter() {
        const ctx = this.assetEditor.currentContext;
        const centerX = 150;
        const centerY = 150;

        // 头
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(centerX, centerY - 50, 30, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(centerX - 12, centerY - 60, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + 12, centerY - 60, 6, 0, Math.PI * 2);
        ctx.fill();

        // 身体
        ctx.fillStyle = '#667eea';
        ctx.fillRect(centerX - 20, centerY - 20, 40, 50);

        // 腿
        ctx.fillStyle = '#333';
        ctx.fillRect(centerX - 15, centerY + 30, 12, 35);
        ctx.fillRect(centerX + 3, centerY + 30, 12, 35);

        this.assetManager.saveAssetImage(this.assetManager.currentAsset.id, this.assetEditor.currentCanvas);
    }

    /**
     * 绘制动画帧
     */
    drawAnimationFrame() {
        const ctx = this.assetEditor.currentContext;
        const centerX = 200;
        const centerY = 200;

        // 简单的角色动画帧
        ctx.fillStyle = '#667eea';
        ctx.beginPath();
        ctx.arc(centerX, centerY - 60, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillRect(centerX - 20, centerY - 35, 40, 50);
        ctx.fillRect(centerX - 25, centerY + 15, 15, 40);
        ctx.fillRect(centerX + 10, centerY + 15, 15, 40);

        this.assetManager.saveAssetImage(this.assetManager.currentAsset.id, this.assetEditor.currentCanvas);
    }

     /**
      * 设置地形调色板
      */
     setupTerrainPalette() {
         document.querySelectorAll('.terrain-btn').forEach(btn => {
             btn.addEventListener('click', (e) => {
                 e.preventDefault();
                 document.querySelectorAll('.terrain-btn').forEach(b => b.classList.remove('active'));
                 btn.classList.add('active');
             });
         });
     }

    /**
     * 新建资源
     */
    newAsset() {
        if (!this.currentCategory) {
            alert('请先选择资源类型');
            return;
        }

        const name = prompt(`输入${this.currentCategory}的名称:`);
        if (name) {
            const asset = this.assetManager.createAsset(this.currentCategory, name);
            this.editCurrentAsset(this.currentCategory);
            console.log(`✓ 新建资源: ${name}`);
        }
    }

    /**
     * 导入资源
     */
    importAsset() {
        if (!this.currentCategory) {
            alert('请先选择资源类型');
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.json';
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    await this.assetManager.importAsset(file, this.currentCategory);
                    alert('✓ 导入成功');
                } catch (error) {
                    alert(`❌ 导入失败: ${error.message}`);
                }
            }
        });
        input.click();
    }

    /**
     * 导出资源
     */
    exportAsset() {
        const asset = this.assetManager.currentAsset;
        if (!asset) {
            alert('没有要导出的资源');
            return;
        }

        const format = prompt('选择导出格式 (png/json):', 'png');
        if (format) {
            this.assetManager.exportAsset(asset.id, format);
        }
    }

    /**
     * 预览资源
     */
    preview() {
        const asset = this.assetManager.currentAsset;
        if (!asset) {
            alert('没有要预览的资源');
            return;
        }

        if (asset.imageData) {
            const win = window.open();
            win.document.write(`<img src="${asset.imageData}" style="max-width: 100%; max-height: 100%;">`);
            win.document.close();
        }
    }

    /**
     * 发布资源
     */
    publish() {
        const asset = this.assetManager.currentAsset;
        if (!asset) {
            alert('没有要发布的资源');
            return;
        }

        // TODO: 实现发布到服务器的功能
        alert(`✓ 资源 "${asset.name}" 已发布`);
        console.log('发布资源:', asset);
    }

    /**
     * 播放动画
     */
    playAnimation() {
        console.log('▶️ 播放动画');
        // TODO: 实现动画播放逻辑
    }

    /**
     * 显示统计信息
     */
    showStatistics() {
        const stats = this.assetManager.getStatistics();
        console.table(stats);
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GameAssetCreatorApp();
    console.log('🎮 游戏素材创作系统已就绪');
});

