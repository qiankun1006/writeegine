/**
 * Unity 编辑器应用入口点（优化版本）
 * 集成懒加载和性能优化
 *
 * 加载流程：
 * 1. 初始化加载进度条
 * 2. 初始化必需模块（同步）
 * 3. 显示编辑器界面
 * 4. 后台加载可选模块（异步）
 */

// 全局编辑器实例
let unityEditor = null;
let lazyLoader = null;

// 性能指标
const performanceMetrics = {
    startTime: performance.now(),
    modulesLoaded: 0,
    editorReady: false
};

/**
 * 初始化加载进度显示
 */
function initLoadingUI() {
    const overlay = document.getElementById('loadingOverlay');
    const progress = document.getElementById('loadingProgress');
    const status = document.getElementById('loadingStatus');
    const tip = document.getElementById('loadingTip');

    if (!overlay) return;

    // 更新进度的函数
    window.updateLoadingProgress = function(percentage, message) {
        if (progress) {
            progress.style.width = percentage + '%';
        }
        if (status) {
            status.textContent = (message || '加载中') + '... ' + Math.round(percentage) + '%';
        }

        // 到达 100% 时隐藏加载屏
        if (percentage >= 100) {
            setTimeout(() => {
                overlay.style.opacity = '0';
                overlay.style.pointerEvents = 'none';
            }, 500);
        }
    };

    // 初始状态
    window.updateLoadingProgress(0, '初始化中');
}

/**
 * 隐藏加载进度条
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.transition = 'opacity 0.3s ease-out';
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';

        // 记录时间
        const loadTime = performance.now() - performanceMetrics.startTime;
        console.log(`%c⏱️ 编辑器启动完成，耗时: ${loadTime.toFixed(0)}ms`, 'color: #FF9800; font-weight: bold');
    }
}

/**
 * 页面加载完成后的初始化函数
 */
function initUnityEditor() {
    console.log('%c🎮 Unity 编辑器初始化开始', 'color: green; font-weight: bold; font-size: 14px');

    try {
        // 步骤 1: 初始化加载管理器
        window.updateLoadingProgress(10, '初始化懒加载管理器');

        lazyLoader = new LazyLoader({
            enablePhysics: false,      // 默认不启用物理
            enableAnimations: false,
            enableParticles: false,
            enableScripting: false,
            preloadAssets: false       // 默认不预加载资源
        });

        // 步骤 2: 验证必需库已加载
        window.updateLoadingProgress(20, '验证必需库');

        if (typeof THREE === 'undefined') {
            throw new Error('Three.js 库未加载成功，请检查网络连接');
        }
        console.log('✅ Three.js 已加载');

        if (typeof THREE.OrbitControls === 'undefined') {
            console.warn('⚠️ OrbitControls 未加载，摄像机控制功能将受限');
        } else {
            console.log('✅ OrbitControls 已加载');
        }

        // 步骤 3: 检查 DOM 元素
        window.updateLoadingProgress(30, '准备编辑器环境');

        const canvas = document.getElementById('unityCanvas');
        if (!canvas) {
            throw new Error('找不到画布元素 #unityCanvas');
        }
        console.log('✅ Canvas 元素已准备');

        // 步骤 4: 创建编辑器实例
        window.updateLoadingProgress(40, '创建编辑器实例');

        unityEditor = new UnityEditor({
            canvas: canvas,
            container: document.querySelector('.unity-editor-container'),
            lazyLoader: lazyLoader,  // 传递懒加载管理器
            config: {
                // 编辑器配置
                showGrid: true,
                showAxes: true,
                enableShadows: true,
                enablePhysics: false,
                defaultCameraType: 'perspective',
                backgroundColor: 0x222222,
                gridColor: 0x444444,
                axesColor: 0xff0000,
                selectionColor: 0x00ff00,

                // 性能配置
                antialias: true,
                pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
                maxFPS: 60,

                // 工具配置
                defaultTool: 'select',
                snapToGrid: false,
                snapAngle: 15,
                snapDistance: 0.5,

                // 物理配置
                gravity: { x: 0, y: -9.8, z: 0 },
                physicsSteps: 60,
                physicsSubsteps: 1
            }
        });

        console.log('✅ 编辑器实例已创建');

        // 步骤 5: 初始化编辑器
        window.updateLoadingProgress(60, '初始化编辑器');

        unityEditor.init();
        console.log('✅ 编辑器已初始化');

        // 步骤 6: 绑定全局事件
        window.updateLoadingProgress(75, '绑定事件处理器');

        bindGlobalEvents();
        console.log('✅ 事件处理器已绑定');

        // 步骤 7: 启动渲染循环
        window.updateLoadingProgress(85, '启动渲染循环');

        unityEditor.start();
        console.log('✅ 渲染循环已启动');

        // 步骤 8: 完成初始化
        window.updateLoadingProgress(100, '编辑器就绪');

        performanceMetrics.editorReady = true;
        performanceMetrics.modulesLoaded = 4; // UnityRenderer, UnityEditor, UnityUI, 本体

        console.log('%c✅ Unity 编辑器初始化完成', 'color: green; font-weight: bold; font-size: 14px');
        console.log('📊 编辑器版本:', unityEditor.version || 'unknown');
        console.log('📊 场景对象数:', unityEditor.getSceneObjectCount?.() || 0);
        console.log('📊 性能指标:', performanceMetrics);

        // 隐藏加载进度条
        setTimeout(() => hideLoadingOverlay(), 300);

        // 更新状态显示
        updateStatusDisplay();

        // 启动后台加载可选模块
        setTimeout(() => {
            console.log('%c📦 后台加载可选模块', 'color: #2196F3; font-weight: bold');
            lazyLoader.initializeOptionalModules();
        }, 500);

    } catch (error) {
        console.error('%c❌ Unity 编辑器初始化失败', 'color: red; font-weight: bold; font-size: 14px');
        console.error('错误详情:', error);
        console.error('堆栈:', error.stack);

        window.updateLoadingProgress(0, '错误');

        // 显示错误信息给用户
        showErrorMessage('编辑器初始化失败', error.message);
    }
}

/**
 * 绑定全局事件
 */
function bindGlobalEvents() {
    // 窗口大小变化
    window.addEventListener('resize', debounce(() => {
        if (unityEditor) {
            unityEditor.onWindowResize?.();
        }
    }, 100));

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (unityEditor) {
            // Ctrl+S - 保存
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                unityEditor.saveScene?.();
            }
            // Ctrl+Z - 撤销
            else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                unityEditor.undo?.();
            }
            // Ctrl+Shift+Z 或 Ctrl+Y - 重做
            else if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
                     ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
                e.preventDefault();
                unityEditor.redo?.();
            }
            // Delete - 删除
            else if (e.key === 'Delete') {
                e.preventDefault();
                unityEditor.deleteSelected?.();
            }
            // Q/W/E/R - 工具快捷键
            else if (e.key === 'q' || e.key === 'Q') {
                unityEditor.setTool?.('select');
            }
            else if (e.key === 'w' || e.key === 'W') {
                unityEditor.setTool?.('move');
            }
            else if (e.key === 'e' || e.key === 'E') {
                unityEditor.setTool?.('rotate');
            }
            else if (e.key === 'r' || e.key === 'R') {
                unityEditor.setTool?.('scale');
            }
        }
    });

    // 页面卸载时清理
    window.addEventListener('beforeunload', (e) => {
        if (unityEditor && unityEditor.hasUnsavedChanges?.()) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    console.log('✅ 全局事件已绑定');
}

/**
 * 防抖函数
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

/**
 * 更新状态显示
 */
function updateStatusDisplay() {
    const statusMsg = document.getElementById('statusMessage');
    if (statusMsg) {
        statusMsg.textContent = '编辑器就绪';
    }
}

/**
 * 显示错误信息
 */
function showErrorMessage(title, message) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.innerHTML = `
            <div class="loading-container error">
                <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                <h2>${title}</h2>
                <p style="color: #ff6b6b; margin: 20px 0;">${message}</p>
                <button onclick="location.reload()" style="
                    padding: 10px 20px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                ">重新加载页面</button>
            </div>
        `;
        overlay.style.pointerEvents = 'auto';
    }
}

/**
 * 加载性能信息
 */
function logPerformanceMetrics() {
    const metrics = {
        '初始化时间 (ms)': performanceMetrics.startTime,
        '已加载模块': performanceMetrics.modulesLoaded,
        '编辑器就绪': performanceMetrics.editorReady ? '是' : '否'
    };

    if (window.lazyLoader) {
        const stats = window.lazyLoader.getLoadingStats();
        metrics['已加载库'] = stats.loadedModules.length;
        metrics['正在加载'] = stats.loadingModules.length;
        metrics['缓存资源'] = stats.cachedResources;
    }

    console.group('📊 性能指标');
    console.table(metrics);
    console.groupEnd();
}

// 页面加载完成时初始化编辑器
if (document.readyState === 'loading') {
    // DOM 还在加载中
    console.log('%c📄 DOM 加载中...', 'color: blue; font-weight: bold; font-size: 12px');

    document.addEventListener('DOMContentLoaded', () => {
        console.log('%c📄 DOM 加载完成', 'color: blue; font-weight: bold; font-size: 12px');
        initLoadingUI();
        initUnityEditor();
    });
} else {
    // DOM 已加载完毕
    console.log('%c📄 DOM 已加载', 'color: blue; font-weight: bold; font-size: 12px');
    initLoadingUI();
    initUnityEditor();
}

// 在控制台提供调试命令
window.editorDebug = {
    getEditor: () => unityEditor,
    getLoader: () => lazyLoader,
    getMetrics: logPerformanceMetrics,
    getStats: () => lazyLoader?.getLoadingStats?.(),
    loadModule: (name) => lazyLoader?.loadModule?.(name),
    waitForModule: (name) => lazyLoader?.waitForModule?.(name),
};

console.log('%c🔧 调试命令可用于 window.editorDebug', 'color: purple; font-size: 12px');

