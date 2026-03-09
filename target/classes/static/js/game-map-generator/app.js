/**
 * 游戏地图生成器主应用程序
 * 集成tilemap编辑器和AI参数面板
 */

class GameMapGeneratorApp {
    constructor() {
        this.paramsPanel = null;
        this.sketchConverter = null;
        this.apiClient = null;
        this.currentJobId = null;
        this.lastResult = null;

        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        try {
            // 初始化组件
            this.initComponents();

            // 初始化事件监听
            this.initEventListeners();

            // 初始化面板大小调整
            this.initPanelResizer();

            // 集成tilemap编辑器
            this.integrateTilemapEditor();

            console.log('游戏地图生成器初始化完成');

        } catch (error) {
            console.error('游戏地图生成器初始化失败:', error);
            this.showInitError();
        }
    }

    initComponents() {
        // 初始化AI参数面板
        this.paramsPanel = new AIParamsPanel();

        // 初始化草图转换器
        this.sketchConverter = new SketchConverter();

        // 初始化API客户端
        this.apiClient = window.gameMapAPI || new GameMapAPIClient();

        // 初始化状态管理器
        this.initStatusManager();
    }

    initStatusManager() {
        this.status = {
            isGenerating: false,
            progress: 0,
            message: '',
            error: null
        };

        // 创建状态更新器
        this.statusUpdater = {
            update: (newStatus) => {
                Object.assign(this.status, newStatus);
                this.updateUIStatus();
            },

            setGenerating: (isGenerating) => {
                this.status.isGenerating = isGenerating;
                this.updateUIStatus();
            },

            setProgress: (progress) => {
                this.status.progress = progress;
                this.updateUIStatus();
            },

            setMessage: (message) => {
                this.status.message = message;
                this.updateUIStatus();
            },

            setError: (error) => {
                this.status.error = error;
                this.updateUIStatus();
            },

            reset: () => {
                this.status = {
                    isGenerating: false,
                    progress: 0,
                    message: '',
                    error: null
                };
                this.updateUIStatus();
            }
        };
    }

    updateUIStatus() {
        const statusIndicator = document.getElementById('status-indicator');
        const statusMessage = document.getElementById('status-message');
        const progressFill = document.getElementById('progress-fill');
        const generateBtn = document.getElementById('generate-btn');

        if (!statusIndicator || !statusMessage || !progressFill || !generateBtn) {
            return;
        }

        if (this.status.error) {
            // 显示错误状态
            statusIndicator.className = 'status-indicator status-error';
            statusMessage.textContent = this.status.error;
            statusIndicator.style.display = 'block';
            progressFill.style.width = '0%';

            generateBtn.disabled = false;
            generateBtn.textContent = '🚀 生成游戏地图';

        } else if (this.status.isGenerating) {
            // 显示生成状态
            statusIndicator.className = 'status-indicator status-processing';
            statusIndicator.style.display = 'block';
            statusMessage.textContent = this.status.message || '正在生成地图...';
            progressFill.style.width = `${this.status.progress}%`;

            generateBtn.disabled = true;
            generateBtn.textContent = '生成中...';

        } else if (this.status.message) {
            // 显示消息状态
            statusIndicator.className = 'status-indicator status-success';
            statusIndicator.style.display = 'block';
            statusMessage.textContent = this.status.message;
            progressFill.style.width = `${this.status.progress}%`;

            generateBtn.disabled = false;
            generateBtn.textContent = '🚀 生成游戏地图';

        } else {
            // 隐藏状态指示器
            statusIndicator.style.display = 'none';
            generateBtn.disabled = false;
            generateBtn.textContent = '🚀 生成游戏地图';
        }
    }

    initEventListeners() {
        // 生成按钮点击事件
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateMap());
        }

        // 下载按钮点击事件
        const downloadBtn = document.querySelector('.btn-download');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadMap());
        }

        // 重新生成按钮点击事件
        const regenerateBtn = document.querySelector('.btn-regenerate');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => this.regenerateMap());
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter 生成地图
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.generateMap();
            }

            // Esc 取消生成
            if (e.key === 'Escape' && this.status.isGenerating) {
                this.cancelGeneration();
            }
        });

        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.status.isGenerating) {
                // 页面隐藏时暂停轮询
                this.pausePolling();
            } else if (!document.hidden && this.status.isGenerating) {
                // 页面恢复时继续轮询
                this.resumePolling();
            }
        });
    }

    /**
     * 设置结果预览组件的事件监听器
     */
    setupResultPreviewListeners() {
        if (!this.resultPreview) return;

        // 监听重新生成请求
        document.addEventListener('gameMapResult:regenerateRequested', (e) => {
            this.generateMap();
        });

        // 监听地图下载完成
        document.addEventListener('gameMapResult:mapDownloaded', (e) => {
            this.statusUpdater.setMessage('地图下载完成！');
            setTimeout(() => {
                this.statusUpdater.reset();
            }, 2000);
        });

        // 监听地图保存完成
        document.addEventListener('gameMapResult:mapSaved', (e) => {
            this.statusUpdater.setMessage('地图已保存到素材库！');
            setTimeout(() => {
                this.statusUpdater.reset();
            }, 2000);
        });
    }

    initPanelResizer() {
        const resizer = document.getElementById('panel-resizer');
        const leftPanel = document.querySelector('.left-panel');
        const rightPanel = document.querySelector('.right-panel');

        if (!resizer || !leftPanel || !rightPanel) {
            return;
        }

        let isResizing = false;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });

        const handleMouseMove = (e) => {
            if (!isResizing) return;

            const containerWidth = document.querySelector('.game-map-editor-container').offsetWidth;
            const minLeftWidth = 400;
            const minRightWidth = 300;

            let leftWidth = e.clientX;
            let rightWidth = containerWidth - leftWidth - 8; // 8px是resizer宽度

            if (leftWidth < minLeftWidth) leftWidth = minLeftWidth;
            if (rightWidth < minRightWidth) {
                leftWidth = containerWidth - minRightWidth - 8;
                rightWidth = minRightWidth;
            }

            leftPanel.style.flex = `0 0 ${leftWidth}px`;
            rightPanel.style.flex = `0 0 ${rightWidth}px`;

            // 保存面板大小
            this.savePanelSize(leftWidth, rightWidth);
        };

        const handleMouseUp = () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        // 加载保存的面板大小
        this.loadPanelSize(leftPanel, rightPanel);
    }

    savePanelSize(leftWidth, rightWidth) {
        try {
            localStorage.setItem('gameMapPanelSizes', JSON.stringify({
                leftWidth,
                rightWidth,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('无法保存面板大小:', e);
        }
    }

    loadPanelSize(leftPanel, rightPanel) {
        try {
            const saved = localStorage.getItem('gameMapPanelSizes');
            if (saved) {
                const sizes = JSON.parse(saved);

                // 检查是否在24小时内保存的
                const oneDay = 24 * 60 * 60 * 1000;
                if (Date.now() - sizes.timestamp < oneDay) {
                    leftPanel.style.flex = `0 0 ${sizes.leftWidth}px`;
                    rightPanel.style.flex = `0 0 ${sizes.rightWidth}px`;
                }
            }
        } catch (e) {
            console.warn('无法加载面板大小:', e);
        }
    }

    integrateTilemapEditor() {
        // 等待tilemap编辑器加载完成
        const checkInterval = setInterval(() => {
            if (window.tilemapEditor) {
                clearInterval(checkInterval);
                this.setupTilemapIntegration();
            }
        }, 100);

        // 10秒后超时
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.tilemapEditor) {
                console.warn('tilemap编辑器未找到，草图转换功能可能受限');
            }
        }, 10000);
    }

    setupTilemapIntegration() {
        try {
            // 获取tilemap编辑器的画布
            const tilemapCanvas = document.querySelector('.tilemap-canvas');
            if (tilemapCanvas) {
                this.sketchConverter.init(tilemapCanvas);

                // 监听tilemap变化
                this.setupTilemapChangeListener();

                // 添加草图预览功能
                this.addSketchPreview();
            }
        } catch (error) {
            console.error('集成tilemap编辑器失败:', error);
        }
    }

    setupTilemapChangeListener() {
        // 监听tilemap编辑器的变化
        if (window.tilemapEditor && window.tilemapEditor.onChange) {
            window.tilemapEditor.onChange(() => {
                // 草图发生变化时更新预览
                this.updateSketchPreview();
            });
        }
    }

    addSketchPreview() {
        // 在左侧面板添加草图预览区域
        const leftPanel = document.querySelector('.left-panel');
        if (!leftPanel) return;

        const previewContainer = document.createElement('div');
        previewContainer.className = 'sketch-preview-container';
        previewContainer.style.cssText = `
            margin: 15px;
            padding: 10px;
            background: white;
            border-radius: 6px;
            border: 1px solid #dee2e6;
            display: none;
        `;

        previewContainer.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px; color: #495057;">草图预览</div>
            <div style="font-size: 12px; color: #6c757d; margin-bottom: 10px;">
                当前草图将作为AI生成的参考轮廓
            </div>
            <canvas id="sketch-preview-canvas" style="width: 100%; height: 150px; border: 1px solid #e9ecef;"></canvas>
            <div style="margin-top: 8px; font-size: 12px; color: #6c757d;">
                图块数量: <span id="sketch-tile-count">0</span>
            </div>
        `;

        leftPanel.appendChild(previewContainer);
        this.sketchPreviewContainer = previewContainer;
    }

    updateSketchPreview() {
        if (!this.sketchPreviewContainer) return;

        try {
            // 获取草图数据
            const sketchData = this.sketchConverter.getSimplifiedSketchData();
            if (!sketchData) {
                this.sketchPreviewContainer.style.display = 'none';
                return;
            }

            // 显示预览容器
            this.sketchPreviewContainer.style.display = 'block';

            // 更新图块数量
            const data = JSON.parse(sketchData);
            const tileCountElement = document.getElementById('sketch-tile-count');
            if (tileCountElement) {
                tileCountElement.textContent = data.tileCount || 0;
            }

            // 更新预览画布
            this.sketchConverter.visualizeOutlines('sketch-preview-canvas');

        } catch (error) {
            console.error('更新草图预览失败:', error);
            this.sketchPreviewContainer.style.display = 'none';
        }
    }

    async generateMap() {
        // 验证参数
        const validation = this.paramsPanel.validateParams();
        if (!validation.isValid) {
            alert(validation.errors.join('\n'));
            return;
        }

        // 获取草图数据
        const sketchData = this.sketchConverter.convertToOutline();
        if (!sketchData) {
            alert('无法获取草图数据，请确保已在地图编辑器中绘制内容');
            return;
        }

        // 准备请求数据
        const requestData = {
            sketchData: sketchData,
            ...this.paramsPanel.getParams()
        };

        // 开始生成
        this.startGeneration(requestData);
    }

    async startGeneration(requestData) {
        try {
            this.statusUpdater.setGenerating(true);
            this.statusUpdater.setProgress(10);
            this.statusUpdater.setMessage('正在提交生成请求...');

            // 发送生成请求
            const response = await this.apiClient.generateMap(requestData);

            if (response.success) {
                this.currentJobId = response.jobId;
                this.statusUpdater.setProgress(30);
                this.statusUpdater.setMessage('生成任务已提交，正在处理...');

                // 开始轮询状态
                this.startStatusPolling();
            } else {
                throw new Error(response.error || '生成请求失败');
            }

        } catch (error) {
            this.statusUpdater.setError(error.message);
            console.error('开始生成失败:', error);
        }
    }

    startStatusPolling() {
        if (!this.currentJobId) return;

        this.pollingInterval = setInterval(async () => {
            try {
                const response = await this.apiClient.getStatus(this.currentJobId);

                if (response.success) {
                    // 更新进度
                    if (response.progress !== undefined) {
                        this.statusUpdater.setProgress(response.progress);
                    }

                    if (response.message) {
                        this.statusUpdater.setMessage(response.message);
                    }

                    // 检查是否完成
                    if (response.status === 'completed') {
                        this.handleGenerationComplete(response);
                    } else if (response.status === 'failed') {
                        this.handleGenerationFailed(response);
                    }
                } else {
                    throw new Error(response.error || '状态查询失败');
                }
            } catch (error) {
                console.error('状态轮询失败:', error);
                // 继续轮询，不显示错误
            }
        }, 2000); // 每2秒轮询一次
    }

    handleGenerationComplete(response) {
        clearInterval(this.pollingInterval);

        this.statusUpdater.setGenerating(false);
        this.statusUpdater.setProgress(100);
        this.statusUpdater.setMessage('地图生成完成！');

        // 保存结果
        this.lastResult = response.result;

        // 显示结果
        this.showGenerationResult(response.result);

        // 保存到历史记录
        this.saveToHistory(response.result);
    }

    handleGenerationFailed(response) {
        clearInterval(this.pollingInterval);

        this.statusUpdater.setGenerating(false);
        this.statusUpdater.setError(response.error || '地图生成失败');
    }

    showGenerationResult(result) {
        const resultPreview = document.getElementById('result-preview');
        const generatedMap = document.getElementById('generated-map');

        if (!resultPreview || !generatedMap) return;

        // 显示生成的地图
        generatedMap.src = result.previewUrl;
        generatedMap.alt = `生成的地图 - ${result.style} ${result.gameType}`;

        // 显示结果面板
        resultPreview.style.display = 'block';

        // 滚动到结果区域
        resultPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    saveToHistory(result) {
        try {
            const history = JSON.parse(localStorage.getItem('gameMapHistory') || '[]');

            // 添加到历史记录开头
            history.unshift({
                ...result,
                generatedAt: new Date().toISOString(),
                params: this.paramsPanel.getParams()
            });

            // 限制历史记录数量
            if (history.length > 50) {
                history.length = 50;
            }

            localStorage.setItem('gameMapHistory', JSON.stringify(history));
        } catch (e) {
            console.warn('无法保存到历史记录:', e);
        }
    }

    async downloadMap() {
        if (!this.lastResult || !this.lastResult.downloadUrl) {
            alert('没有可下载的地图');
            return;
        }

        try {
            this.statusUpdater.setMessage('正在下载地图...');

            const blob = await this.apiClient.downloadMap(this.lastResult.mapId);

            // 创建下载链接
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `game-map-${this.lastResult.mapId}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.statusUpdater.setMessage('地图下载完成！');

            setTimeout(() => {
                this.statusUpdater.reset();
            }, 2000);

        } catch (error) {
            this.statusUpdater.setError('下载失败: ' + error.message);
            console.error('地图下载失败:', error);
        }
    }

    regenerateMap() {
        // 使用相同的参数重新生成
        this.generateMap();
    }

    cancelGeneration() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        if (this.currentJobId) {
            // 尝试取消服务器端的任务
            this.apiClient.cancelGeneration(this.currentJobId).catch(console.error);
        }

        this.statusUpdater.reset();
        this.currentJobId = null;
    }

    pausePolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    resumePolling() {
        if (this.currentJobId && !this.pollingInterval) {
            this.startStatusPolling();
        }
    }

    showInitError() {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.style.cssText = `
            margin: 20px;
            padding: 15px;
            border-radius: 6px;
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        `;

        errorDiv.innerHTML = `
            <strong>初始化错误</strong>
            <p>游戏地图生成器初始化失败，部分功能可能无法使用。</p>
            <p>请刷新页面重试，或检查浏览器控制台查看详细错误信息。</p>
        `;

        const container = document.querySelector('.game-map-editor-container');
        if (container) {
            container.insertBefore(errorDiv, container.firstChild);
        }
    }

    // 公共方法
    getParams() {
        return this.paramsPanel ? this.paramsPanel.getParams() : null;
    }

    setParams(params) {
        if (this.paramsPanel) {
            // 这里需要扩展paramsPanel以支持设置参数
            console.log('设置参数:', params);
        }
    }

    reset() {
        if (this.paramsPanel) {
            this.paramsPanel.resetParams();
        }

        this.statusUpdater.reset();
        this.currentJobId = null;
        this.lastResult = null;

        // 隐藏结果预览
        const resultPreview = document.getElementById('result-preview');
        if (resultPreview) {
            resultPreview.style.display = 'none';
        }
    }

    exportSketch() {
        return this.sketchConverter ? this.sketchConverter.convertToOutline() : null;
    }

    getHistory() {
        try {
            return JSON.parse(localStorage.getItem('gameMapHistory') || '[]');
        } catch (e) {
            console.warn('无法获取历史记录:', e);
            return [];
        }
    }

    clearHistory() {
        try {
            localStorage.removeItem('gameMapHistory');
            return true;
        } catch (e) {
            console.warn('无法清除历史记录:', e);
            return false;
        }
    }
}

// 初始化应用程序
window.addEventListener('load', () => {
    window.gameMapGenerator = new GameMapGeneratorApp();
});

// 导出为全局变量
window.GameMapGeneratorApp = GameMapGeneratorApp;

