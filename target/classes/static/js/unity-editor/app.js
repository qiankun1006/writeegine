/**
 * Unity 编辑器应用入口点
 * 负责初始化编辑器并启动应用
 */

// 全局编辑器实例
let unityEditor = null;

// 页面加载完成后的初始化函数
function initUnityEditor() {
    console.log('%c🎮 Unity 编辑器开始初始化', 'color: green; font-weight: bold; font-size: 14px');

    try {
        // 检查 Three.js 是否加载成功
        if (typeof THREE === 'undefined') {
            throw new Error('Three.js 库未加载成功，请检查网络连接或 CDN 地址');
        }

        // 检查 OrbitControls 是否可用
        if (typeof THREE.OrbitControls === 'undefined') {
            console.warn('OrbitControls 未加载，摄像机控制功能将受限');
        }

        // 检查 Ammo.js 是否可用
        if (typeof Ammo === 'undefined') {
            console.warn('Ammo.js 物理引擎未加载，物理模拟功能将不可用');
        }

        // 获取画布元素
        const canvas = document.getElementById('unityCanvas');
        if (!canvas) {
            throw new Error('找不到画布元素 #unityCanvas');
        }

        // 创建编辑器实例
        unityEditor = new UnityEditor({
            canvas: canvas,
            container: document.querySelector('.unity-editor-container'),
            config: {
                // 编辑器配置
                showGrid: true,
                showAxes: true,
                enableShadows: true,
                enablePhysics: false, // 默认禁用物理，需要时手动启用
                defaultCameraType: 'perspective',
                backgroundColor: 0x222222,
                gridColor: 0x444444,
                axesColor: 0xff0000,
                selectionColor: 0x00ff00,

                // 性能配置
                antialias: true,
                pixelRatio: window.devicePixelRatio || 1,
                maxFPS: 60,

                // 工具配置
                defaultTool: 'select',
                snapToGrid: false,
                snapAngle: 15, // 度
                snapDistance: 0.5,

                // 物理配置
                gravity: { x: 0, y: -9.8, z: 0 },
                physicsSteps: 60,
                physicsSubsteps: 1
            }
        });

        // 初始化编辑器
        unityEditor.init();

        // 绑定全局事件
        bindGlobalEvents();

        // 启动渲染循环
        unityEditor.start();

        console.log('%c✅ Unity 编辑器初始化完成', 'color: green; font-weight: bold; font-size: 14px');
        console.log('编辑器版本:', unityEditor.version);
        console.log('场景对象数:', unityEditor.getSceneObjectCount());

        // 更新状态显示
        updateStatusDisplay();

    } catch (error) {
        console.error('%c❌ Unity 编辑器初始化失败', 'color: red; font-weight: bold; font-size: 14px');
        console.error('错误详情:', error);

        // 显示错误信息给用户
        showErrorMessage('编辑器初始化失败', error.message);
    }
}

// 绑定全局事件
function bindGlobalEvents() {
    // 窗口大小变化事件
    window.addEventListener('resize', () => {
        if (unityEditor) {
            unityEditor.onWindowResize();
        }
    });

    // 键盘快捷键
    document.addEventListener('keydown', (event) => {
        if (!unityEditor) return;

        // 防止在输入框中触发快捷键
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        // 工具快捷键
        switch (event.key.toLowerCase()) {
            case 'q':
                unityEditor.setTool('select');
                event.preventDefault();
                break;
            case 'w':
                unityEditor.setTool('move');
                event.preventDefault();
                break;
            case 'e':
                unityEditor.setTool('rotate');
                event.preventDefault();
                break;
            case 'r':
                unityEditor.setTool('scale');
                event.preventDefault();
                break;
        }

        // 操作快捷键
        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case 'z':
                    if (event.shiftKey) {
                        unityEditor.redo();
                    } else {
                        unityEditor.undo();
                    }
                    event.preventDefault();
                    break;
                case 'd':
                    unityEditor.duplicateSelected();
                    event.preventDefault();
                    break;
                case 'n':
                    unityEditor.newScene();
                    event.preventDefault();
                    break;
                case 'o':
                    unityEditor.openScene();
                    event.preventDefault();
                    break;
                case 's':
                    unityEditor.saveScene();
                    event.preventDefault();
                    break;
                case 'delete':
                case 'backspace':
                    unityEditor.deleteSelected();
                    event.preventDefault();
                    break;
            }
        }
    });

    // 防止浏览器默认行为
    document.addEventListener('contextmenu', (event) => {
        if (event.target.id === 'unityCanvas') {
            event.preventDefault();
        }
    });

    // 防止拖拽文件到页面时的默认行为
    document.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    document.addEventListener('drop', (event) => {
        event.preventDefault();
        if (unityEditor && event.dataTransfer.files.length > 0) {
            unityEditor.handleFileDrop(event.dataTransfer.files);
        }
    });
}

// 更新状态显示
function updateStatusDisplay() {
    if (!unityEditor) return;

    // 更新 FPS 显示
    const fpsElement = document.getElementById('fpsCounter');
    if (fpsElement) {
        const fps = unityEditor.getFPS();
        fpsElement.textContent = Math.round(fps);

        // 根据 FPS 设置颜色
        if (fps < 30) {
            fpsElement.style.color = '#ff4444';
        } else if (fps < 50) {
            fpsElement.style.color = '#ffaa00';
        } else {
            fpsElement.style.color = '#44ff44';
        }
    }

    // 更新对象计数
    const objectCountElement = document.getElementById('objectCount');
    if (objectCountElement) {
        objectCountElement.textContent = unityEditor.getSceneObjectCount();
    }

    // 更新当前工具显示
    const currentToolElement = document.getElementById('currentTool');
    if (currentToolElement) {
        const tool = unityEditor.getCurrentTool();
        currentToolElement.textContent = tool === 'select' ? '选择' :
                                        tool === 'move' ? '移动' :
                                        tool === 'rotate' ? '旋转' :
                                        tool === 'scale' ? '缩放' : '未知';
    }

    // 定期更新
    requestAnimationFrame(updateStatusDisplay);
}

// 显示错误信息
function showErrorMessage(title, message) {
    // 创建错误提示元素
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 400px;
    `;

    errorDiv.innerHTML = `
        <h4 style="margin: 0 0 10px 0;">${title}</h4>
        <p style="margin: 0; font-size: 14px;">${message}</p>
        <button style="margin-top: 10px; padding: 5px 10px; background: white; color: #ff4444; border: none; border-radius: 3px; cursor: pointer;">
            关闭
        </button>
    `;

    document.body.appendChild(errorDiv);

    // 添加关闭按钮事件
    errorDiv.querySelector('button').addEventListener('click', () => {
        document.body.removeChild(errorDiv);
    });

    // 5秒后自动关闭
    setTimeout(() => {
        if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
        }
    }, 5000);
}

// 显示加载提示
function showLoadingMessage(message) {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'unityLoading';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        z-index: 9999;
        font-family: Arial, sans-serif;
    `;

    loadingDiv.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">🎮</div>
            <h2 style="margin: 0 0 10px 0;">Unity 编辑器</h2>
            <p style="margin: 0 0 20px 0; opacity: 0.8;">${message}</p>
            <div class="spinner" style="width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
    `;

    // 添加旋转动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(loadingDiv);
    return loadingDiv;
}

// 隐藏加载提示
function hideLoadingMessage() {
    const loadingDiv = document.getElementById('unityLoading');
    if (loadingDiv) {
        document.body.removeChild(loadingDiv);
    }
}

// 页面加载完成时初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c📄 DOM 加载完成，开始初始化 Unity 编辑器', 'color: blue; font-weight: bold; font-size: 14px');

    // 显示加载提示
    const loadingDiv = showLoadingMessage('正在加载 Unity 编辑器...');

    // 等待所有脚本加载完成
    const checkScriptsLoaded = setInterval(() => {
        // 检查所有必需的类是否已定义
        if (typeof UnityEditor !== 'undefined' &&
            typeof UnityRenderer !== 'undefined' &&
            typeof UnityUI !== 'undefined' &&
            typeof UnityPhysics !== 'undefined') {

            clearInterval(checkScriptsLoaded);

            // 隐藏加载提示
            hideLoadingMessage();

            // 延迟初始化以确保 DOM 完全就绪
            setTimeout(() => {
                initUnityEditor();
            }, 100);
        }
    }, 100);

    // 10秒后超时
    setTimeout(() => {
        clearInterval(checkScriptsLoaded);
        if (!unityEditor) {
            hideLoadingMessage();
            showErrorMessage('脚本加载超时', '某些必需的脚本文件未能及时加载，请刷新页面重试。');
        }
    }, 10000);
});

// 导出全局变量供调试使用
window.unityEditorInstance = () => unityEditor;

// 添加全局工具函数
window.createUnityObject = (type, options) => {
    if (unityEditor) {
        return unityEditor.createObject(type, options);
    }
    return null;
};

window.selectUnityObject = (objectId) => {
    if (unityEditor) {
        unityEditor.selectObject(objectId);
    }
};

window.deleteUnityObject = (objectId) => {
    if (unityEditor) {
        unityEditor.deleteObject(objectId);
    }
};

// 性能监控
if (typeof PerformanceObserver !== 'undefined') {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'longtask') {
                console.warn('检测到长任务，可能影响编辑器性能:', entry);
            }
        }
    });

    observer.observe({ entryTypes: ['longtask'] });
}

// 内存使用监控
setInterval(() => {
    if (typeof performance !== 'undefined' && performance.memory) {
        const memory = performance.memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);

        if (usedMB > 500) {
            console.warn(`内存使用较高: ${usedMB}MB / ${totalMB}MB`);
        }
    }
}, 30000);

