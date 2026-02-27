/**
 * Unity 编辑器懒加载管理器
 * 负责按需加载编辑器各个功能模块，优化初始加载时间
 */

class LazyLoader {
    constructor(options = {}) {
        this.options = {
            editorType: options.editorType || '3d-shooter',
            enablePhysics: options.enablePhysics || false,
            enableAnimations: options.enableAnimations || false,
            enableParticles: options.enableParticles || false,
            enableScripting: options.enableScripting || false,
            preloadAssets: options.preloadAssets || true,
            configPath: options.configPath || '/static/config',
            ...options
        };

        this.loadedModules = new Set();
        this.loadingModules = new Map();
        this.moduleCallbacks = new Map();
        this.resourceCache = new Map();
        this.moduleConfig = null;
    }

    /**
     * 根据编辑器类型加载模块配置
     */
    async loadModuleConfig() {
        const configFile = `MODULES_CONFIG_${this.options.editorType.toUpperCase()}.json`;
        const configUrl = `${this.options.configPath}/${configFile}`;

        try {
            const response = await fetch(configUrl);
            this.moduleConfig = await response.json();
            console.log(`✅ 加载模块配置: ${this.options.editorType}`);
            return this.moduleConfig;
        } catch (error) {
            console.warn(`⚠️ 无法加载模块配置: ${configUrl}`, error);
            return null;
        }
    }

    /**
     * 初始化必需的模块（同步加载）
     * 这些是编辑器启动的最小依赖
     */
    async initializeEssentialModules() {
        console.log('%c📦 加载必需模块', 'color: #4CAF50; font-weight: bold');

        const essentialModules = [
            'three.js',           // Three.js 库
            'orbit-controls',     // 摄像机控制
            'unity-renderer',     // 渲染引擎
            'unity-editor',       // 编辑器核心
            'unity-ui'            // UI 管理器
        ];

        for (const module of essentialModules) {
            await this.loadModule(module);
        }

        // 显示加载进度
        this.updateLoadingProgress(100, '必需模块加载完成');
    }

    /**
     * 初始化可选模块（异步加载）
     * 这些模块根据需要后台加载
     */
    initializeOptionalModules() {
        console.log('%c⚙️ 后台加载可选模块', 'color: #2196F3; font-weight: bold');

        const optionalModules = [];

        // 根据配置决定加载哪些模块
        if (this.options.enablePhysics) {
            optionalModules.push('ammo.js', 'unity-physics');
        }

        if (this.options.enableAnimations) {
            optionalModules.push('animation-system');
        }

        if (this.options.enableParticles) {
            optionalModules.push('particle-system');
        }

        if (this.options.enableScripting) {
            optionalModules.push('script-editor');
        }

        if (this.options.preloadAssets) {
            optionalModules.push('asset-library');
        }

        // 后台加载（不阻塞主线程）
        optionalModules.forEach(module => {
            this.loadModuleAsync(module);
        });
    }

    /**
     * 加载单个模块（同步）
     */
    async loadModule(moduleName) {
        // 如果已加载，直接返回
        if (this.loadedModules.has(moduleName)) {
            return true;
        }

        // 如果正在加载，等待
        if (this.loadingModules.has(moduleName)) {
            return this.loadingModules.get(moduleName);
        }

        // 创建加载 Promise
        const loadPromise = this._loadModuleInternal(moduleName);
        this.loadingModules.set(moduleName, loadPromise);

        try {
            await loadPromise;
            this.loadedModules.add(moduleName);
            this.loadingModules.delete(moduleName);
            return true;
        } catch (error) {
            console.error(`❌ 加载模块失败: ${moduleName}`, error);
            this.loadingModules.delete(moduleName);
            return false;
        }
    }

    /**
     * 异步加载单个模块（非阻塞）
     */
    loadModuleAsync(moduleName, priority = 'low') {
        if (this.loadedModules.has(moduleName)) {
            return Promise.resolve(true);
        }

        // 使用 requestIdleCallback 在浏览器空闲时加载
        if ('requestIdleCallback' in window) {
            return new Promise((resolve) => {
                requestIdleCallback(() => {
                    this.loadModule(moduleName).then(resolve);
                });
            });
        } else {
            // 回退：使用 setTimeout
            return new Promise((resolve) => {
                const delay = priority === 'high' ? 0 : 1000;
                setTimeout(() => {
                    this.loadModule(moduleName).then(resolve);
                }, delay);
            });
        }
    }

    /**
     * 内部：加载模块的实际实现
     */
    async _loadModuleInternal(moduleName) {
        return new Promise((resolve, reject) => {
            try {
                console.log(`📥 加载模块: ${moduleName}`);

                // 检查模块是否已在全局作用域中
                if (this._moduleExists(moduleName)) {
                    console.log(`✅ 模块已就绪: ${moduleName}`);
                    resolve();
                    return;
                }

                // 根据模块名加载相应的文件
                const fileUrl = this._getModuleUrl(moduleName);
                if (!fileUrl) {
                    reject(new Error(`Unknown module: ${moduleName}`));
                    return;
                }

                // 加载脚本或资源
                this._loadResource(fileUrl, (success) => {
                    if (success) {
                        resolve();
                    } else {
                        reject(new Error(`Failed to load: ${fileUrl}`));
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 检查模块是否已存在
     */
    _moduleExists(moduleName) {
        switch (moduleName) {
            case 'three.js':
                return typeof THREE !== 'undefined';
            case 'orbit-controls':
                return typeof THREE !== 'undefined' && typeof THREE.OrbitControls !== 'undefined';
            case 'ammo.js':
                return typeof Ammo !== 'undefined';
            case 'unity-renderer':
                return typeof UnityRenderer !== 'undefined';
            case 'unity-editor':
                return typeof UnityEditor !== 'undefined';
            case 'unity-physics':
                return typeof UnityPhysics !== 'undefined';
            case 'unity-ui':
                return typeof UnityUI !== 'undefined';
            case 'animation-system':
                return typeof AnimationSystem !== 'undefined';
            case 'particle-system':
                return typeof ParticleSystem !== 'undefined';
            case 'script-editor':
                return typeof ScriptEditor !== 'undefined';
            case 'asset-library':
                return typeof AssetLibrary !== 'undefined';
            default:
                return false;
        }
    }

    /**
     * 获取模块的 URL
     */
    _getModuleUrl(moduleName) {
        const urls = {
            'three.js': 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
            'orbit-controls': 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
            'ammo.js': 'https://cdn.jsdelivr.net/npm/ammo.js@0.0.10/builds/ammo.wasm.js',
            'unity-renderer': '/static/js/unity-editor/UnityRenderer.js',
            'unity-editor': '/static/js/unity-editor/UnityEditor.js',
            'unity-physics': '/static/js/unity-editor/UnityPhysics.js',
            'unity-ui': '/static/js/unity-editor/UnityUI.js',
            'animation-system': '/static/js/unity-editor/AnimationSystem.js',
            'particle-system': '/static/js/unity-editor/ParticleSystem.js',
            'script-editor': '/static/js/unity-editor/ScriptEditor.js',
            'asset-library': '/static/js/unity-editor/AssetLibrary.js'
        };
        return urls[moduleName];
    }

    /**
     * 加载资源文件
     */
    _loadResource(url, callback) {
        // 检查缓存
        if (this.resourceCache.has(url)) {
            callback(true);
            return;
        }

        // 如果是 CDN 资源且已加载
        if (url.includes('cdnjs') || url.includes('jsdelivr')) {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = () => {
                this.resourceCache.set(url, true);
                callback(true);
            };
            script.onerror = () => {
                console.error(`❌ 加载失败: ${url}`);
                callback(false);
            };
            document.head.appendChild(script);
        } else {
            // 本地资源，使用 fetch
            fetch(url)
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    }
                    throw new Error(`HTTP ${response.status}`);
                })
                .then(text => {
                    // 通过 eval 加载本地脚本（不安全，实际应用中应使用其他方式）
                    // 最好的方式是使用 <script> 标签
                    const script = document.createElement('script');
                    script.src = url;
                    script.async = true;
                    script.onload = () => {
                        this.resourceCache.set(url, true);
                        callback(true);
                    };
                    script.onerror = () => callback(false);
                    document.head.appendChild(script);
                })
                .catch(error => {
                    console.error(`❌ 加载失败: ${url}`, error);
                    callback(false);
                });
        }
    }

    /**
     * 预加载资源（如纹理、模型等）
     */
    preloadAssets(assetList) {
        console.log(`📚 预加载 ${assetList.length} 个资源`);

        assetList.forEach((asset, index) => {
            // 使用 requestIdleCallback 在空闲时预加载
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    this._preloadAsset(asset);
                }, { timeout: (index + 1) * 1000 });
            } else {
                setTimeout(() => {
                    this._preloadAsset(asset);
                }, (index + 1) * 1000);
            }
        });
    }

    /**
     * 预加载单个资源
     */
    _preloadAsset(asset) {
        // 为图片类资源，创建 Image 对象预加载
        if (asset.type === 'texture' || asset.type === 'image') {
            const img = new Image();
            img.src = asset.url;
        }
        // 为音频，创建 Audio 对象预加载
        else if (asset.type === 'audio') {
            const audio = new Audio();
            audio.src = asset.url;
            audio.preload = 'auto';
        }
        // 其他类型使用 fetch 预加载
        else {
            fetch(asset.url).catch(() => {
                // 忽略错误，预加载失败不影响主流程
            });
        }
    }

    /**
     * 更新加载进度
     */
    updateLoadingProgress(percentage, message = '') {
        const event = new CustomEvent('loadingProgress', {
            detail: { percentage, message }
        });
        document.dispatchEvent(event);
    }

    /**
     * 等待模块加载完成
     */
    waitForModule(moduleName, timeout = 30000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const check = () => {
                if (this._moduleExists(moduleName)) {
                    resolve();
                    return;
                }

                if (Date.now() - startTime > timeout) {
                    reject(new Error(`Module load timeout: ${moduleName}`));
                    return;
                }

                setTimeout(check, 100);
            };

            check();
        });
    }

    /**
     * 获取加载统计信息
     */
    getLoadingStats() {
        return {
            loadedModules: Array.from(this.loadedModules),
            loadingModules: Array.from(this.loadingModules.keys()),
            cachedResources: this.resourceCache.size,
            totalModules: this.loadedModules.size + this.loadingModules.size
        };
    }

    /**
     * 显示加载统计信息
     */
    logLoadingStats() {
        const stats = this.getLoadingStats();
        console.table(stats);
    }
}

// 导出全局
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
}

