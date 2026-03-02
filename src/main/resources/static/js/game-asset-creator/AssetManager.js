/**
 * AssetManager.js - 游戏素材管理器
 * 管理所有游戏素材的创建、编辑、保存和导出
 */

class AssetManager {
    constructor() {
        this.assets = new Map();           // 素材集合
        this.currentAsset = null;          // 当前编辑的素材
        this.assetId = 0;                  // 素材ID计数器
        this.categories = new Map();       // 按分类存储素材

        this.initializeCategories();
    }

    /**
     * 初始化素材分类
     */
    initializeCategories() {
        const categories = [
            // 角色相关
            'character-portrait',
            'character-sd',
            'character-animation',
            'character-avatar',
            'character-job',
            'character-skill-icon',
            'character-status-icon',

            // 地图与场景
            'map-grid',
            'map-terrain',
            'map-obstacle',
            'map-decoration',
            'map-background',
            'map-loading',

            // UI 界面
            'ui-main-menu',
            'ui-level-select',
            'ui-dialog',
            'ui-battle-range',
            'ui-battle-hud',
            'ui-character-panel',
            'ui-inventory',
            'ui-skill',
            'ui-battle-result',

            // 特效与动画
            'effect-movement',
            'effect-attack',
            'effect-magic',
            'effect-heal',
            'effect-critical',
            'effect-status',
            'effect-levelup',
            'effect-trap',

            // 文字与图标
            'font-numbers',
            'icon-button',
            'icon-job',
            'icon-attribute',
            'icon-quest',

            // 剧情与过场
            'story-portrait',
            'story-dialog-box',
            'story-transition',
            'story-avatar'
        ];

        categories.forEach(category => {
            this.categories.set(category, []);
        });
    }

    /**
     * 创建新素材
     */
    createAsset(category, name) {
        const assetId = ++this.assetId;
        const asset = {
            id: assetId,
            name: name || `${category}-${assetId}`,
            category: category,
            createdAt: new Date(),
            updatedAt: new Date(),
            data: {},
            canvas: null,
            imageData: null
        };

        this.assets.set(assetId, asset);
        if (this.categories.has(category)) {
            this.categories.get(category).push(asset);
        }

        this.currentAsset = asset;
        console.log(`✓ 创建素材: ${asset.name} (ID: ${assetId})`);
        return asset;
    }

    /**
     * 获取素材
     */
    getAsset(assetId) {
        return this.assets.get(assetId);
    }

    /**
     * 删除素材
     */
    deleteAsset(assetId) {
        const asset = this.assets.get(assetId);
        if (asset) {
            this.assets.delete(assetId);
            const category = this.categories.get(asset.category);
            if (category) {
                const index = category.indexOf(asset);
                if (index > -1) {
                    category.splice(index, 1);
                }
            }
            console.log(`✓ 删除素材: ${asset.name}`);
            return true;
        }
        return false;
    }

    /**
     * 获取分类下的所有素材
     */
    getAssetsByCategory(category) {
        return this.categories.get(category) || [];
    }

    /**
     * 更新素材数据
     */
    updateAssetData(assetId, data) {
        const asset = this.assets.get(assetId);
        if (asset) {
            asset.data = { ...asset.data, ...data };
            asset.updatedAt = new Date();
            console.log(`✓ 更新素材数据: ${asset.name}`);
            return true;
        }
        return false;
    }

    /**
     * 保存素材为图像
     */
    saveAssetImage(assetId, canvas) {
        const asset = this.assets.get(assetId);
        if (asset && canvas) {
            asset.canvas = canvas;
            asset.imageData = canvas.toDataURL('image/png');
            asset.updatedAt = new Date();
            console.log(`✓ 保存素材图像: ${asset.name}`);
            return true;
        }
        return false;
    }

    /**
     * 导出素材
     */
    exportAsset(assetId, format = 'png') {
        const asset = this.assets.get(assetId);
        if (!asset) return false;

        if (format === 'png' && asset.imageData) {
            const link = document.createElement('a');
            link.href = asset.imageData;
            link.download = `${asset.name}.png`;
            link.click();
            console.log(`✓ 导出素材: ${asset.name} (PNG)`);
            return true;
        }

        if (format === 'json') {
            const json = JSON.stringify({
                id: asset.id,
                name: asset.name,
                category: asset.category,
                data: asset.data,
                createdAt: asset.createdAt,
                updatedAt: asset.updatedAt
            }, null, 2);

            const blob = new Blob([json], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${asset.name}.json`;
            link.click();
            console.log(`✓ 导出素材: ${asset.name} (JSON)`);
            return true;
        }

        return false;
    }

    /**
     * 批量导出素材
     */
    exportAssets(assetIds, format = 'zip') {
        console.log(`📦 准备导出 ${assetIds.length} 个素材...`);
        // TODO: 实现ZIP打包导出功能
        // 目前返回成功，后续可集成 JSZip 库
        return true;
    }

    /**
     * 导入素材
     */
    importAsset(file, category) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const asset = this.createAsset(category, file.name.split('.')[0]);
                    const data = e.target.result;

                    if (file.type.startsWith('image/')) {
                        asset.imageData = data;
                    } else if (file.type === 'application/json') {
                        asset.data = JSON.parse(data);
                    }

                    console.log(`✓ 导入素材: ${asset.name}`);
                    resolve(asset);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };

            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        });
    }

    /**
     * 获取素材统计信息
     */
    getStatistics() {
        const stats = {
            totalAssets: this.assets.size,
            byCategory: {}
        };

        this.categories.forEach((assets, category) => {
            stats.byCategory[category] = assets.length;
        });

        return stats;
    }

    /**
     * 清空所有素材
     */
    clear() {
        this.assets.clear();
        this.categories.forEach(assets => assets.length = 0);
        this.currentAsset = null;
        console.log('✓ 已清空所有素材');
    }
}

// 创建全局素材管理器实例
const assetManager = new AssetManager();

