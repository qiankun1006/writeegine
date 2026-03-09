/**
 * AI参数面板管理
 * 处理AI地图生成参数的输入、验证和状态管理
 */

class AIParamsPanel {
    constructor() {
        this.params = {
            style: 'fantasy',
            size: 'medium',
            gameType: 'rpg',
            model: 'pro',
            referenceImage: null,
            additionalParams: {}
        };

        this.initElements();
        this.bindEvents();
        this.loadSavedParams();
    }

    initElements() {
        this.elements = {
            styleSelect: document.getElementById('style-select'),
            sizeSelect: document.getElementById('size-select'),
            gameTypeSelect: document.getElementById('game-type-select'),
            modelSelect: document.getElementById('model-select'),
            referenceUpload: document.getElementById('reference-upload'),
            referenceFile: document.getElementById('reference-file'),
            referencePreview: document.getElementById('reference-preview'),
            referenceImage: document.getElementById('reference-image'),
            generateBtn: document.getElementById('generate-btn'),
            statusIndicator: document.getElementById('status-indicator'),
            statusMessage: document.getElementById('status-message'),
            progressFill: document.getElementById('progress-fill'),
            resultPreview: document.getElementById('result-preview'),
            generatedMap: document.getElementById('generated-map')
        };
    }

    bindEvents() {
        // 参数变更事件
        this.elements.styleSelect.addEventListener('change', (e) => {
            this.params.style = e.target.value;
            this.saveParams();
            this.updateParamDependencies();
        });

        this.elements.sizeSelect.addEventListener('change', (e) => {
            this.params.size = e.target.value;
            this.saveParams();
        });

        this.elements.gameTypeSelect.addEventListener('change', (e) => {
            this.params.gameType = e.target.value;
            this.saveParams();
            this.updateParamDependencies();
        });

        this.elements.modelSelect.addEventListener('change', (e) => {
            this.params.model = e.target.value;
            this.saveParams();
        });

        // 文件上传事件
        this.elements.referenceUpload.addEventListener('click', () => {
            this.elements.referenceFile.click();
        });

        this.elements.referenceFile.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // 拖放上传
        this.elements.referenceUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.referenceUpload.classList.add('dragover');
        });

        this.elements.referenceUpload.addEventListener('dragleave', () => {
            this.elements.referenceUpload.classList.remove('dragover');
        });

        this.elements.referenceUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.referenceUpload.classList.remove('dragover');

            if (e.dataTransfer.files.length > 0) {
                this.handleFileUpload(e.dataTransfer.files[0]);
            }
        });

        // 生成按钮事件
        this.elements.generateBtn.addEventListener('click', () => {
            this.generateMap();
        });
    }

    handleFileUpload(file) {
        if (!file) return;

        // 验证文件
        if (!this.validateFile(file)) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.params.referenceImage = e.target.result;
            this.elements.referenceImage.src = e.target.result;
            this.elements.referencePreview.style.display = 'block';
            this.saveParams();
        };
        reader.readAsDataURL(file);
    }

    validateFile(file) {
        // 检查文件类型
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert('请上传图片文件 (JPG, PNG, WebP, GIF)');
            return false;
        }

        // 检查文件大小 (5MB限制)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert('文件大小不能超过5MB');
            return false;
        }

        return true;
    }

    clearReference() {
        this.params.referenceImage = null;
        this.elements.referenceFile.value = '';
        this.elements.referencePreview.style.display = 'none';
        this.saveParams();
    }

    updateParamDependencies() {
        // 根据选择的风格和游戏类型更新其他参数
        const style = this.params.style;
        const gameType = this.params.gameType;

        // 更新模型选项
        if (style === 'fantasy' && gameType === 'rpg') {
            // 奇幻RPG推荐使用专业模型
            this.elements.modelSelect.value = 'pro';
            this.params.model = 'pro';
        } else if (style === 'sci-fi' && gameType === 'strategy') {
            // 科幻策略游戏推荐使用定制模型
            this.elements.modelSelect.value = 'custom';
            this.params.model = 'custom';
        }

        this.saveParams();
    }

    validateParams() {
        const errors = [];

        if (!this.params.style) {
            errors.push('请选择地图风格');
        }

        if (!this.params.size) {
            errors.push('请选择地图尺寸');
        }

        if (!this.params.gameType) {
            errors.push('请选择游戏类型');
        }

        if (!this.params.model) {
            errors.push('请选择微调模型');
        }

        // 检查草图数据
        const sketchData = this.getSketchData();
        if (!sketchData || sketchData.trim() === '') {
            errors.push('请先在地图编辑器中绘制草图');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    getSketchData() {
        // 从tilemap编辑器获取草图数据
        // 这里需要与tilemap编辑器集成
        if (window.tilemapEditor) {
            return window.tilemapEditor.exportSketchData();
        }

        // 如果没有tilemap编辑器，返回模拟数据
        return 'sketch_data_mock';
    }

    async generateMap() {
        const validation = this.validateParams();
        if (!validation.isValid) {
            alert(validation.errors.join('\n'));
            return;
        }

        // 禁用按钮，显示加载状态
        this.setLoadingState(true);

        try {
            const sketchData = this.getSketchData();
            const requestData = {
                sketchData: sketchData,
                ...this.params
            };

            // 发送生成请求
            const response = await this.sendGenerationRequest(requestData);

            if (response.success) {
                // 开始轮询状态
                this.startStatusPolling(response.jobId);
            } else {
                throw new Error(response.error || '生成失败');
            }

        } catch (error) {
            this.showError('生成失败: ' + error.message);
            this.setLoadingState(false);
        }
    }

    async sendGenerationRequest(data) {
        const response = await fetch('/api/game-map/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        return await response.json();
    }

    startStatusPolling(jobId) {
        this.pollingInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/game-map/status/${jobId}`);
                const result = await response.json();

                if (result.success) {
                    this.updateProgress(result);

                    if (result.status === 'completed') {
                        // 生成完成
                        clearInterval(this.pollingInterval);
                        this.showResult(result.result);
                        this.setLoadingState(false);
                    }
                } else {
                    throw new Error(result.error || '状态查询失败');
                }
            } catch (error) {
                clearInterval(this.pollingInterval);
                this.showError('状态查询失败: ' + error.message);
                this.setLoadingState(false);
            }
        }, 2000); // 每2秒轮询一次
    }

    updateProgress(status) {
        const progress = status.progress || 0;
        this.elements.progressFill.style.width = `${progress}%`;

        if (status.message) {
            this.elements.statusMessage.textContent = status.message;
        }
    }

    showResult(result) {
        this.elements.statusIndicator.className = 'status-indicator status-success';
        this.elements.statusMessage.textContent = '地图生成完成！';
        this.elements.progressFill.style.width = '100%';

        // 显示生成结果
        this.elements.generatedMap.src = result.previewUrl;
        this.elements.resultPreview.style.display = 'block';

        // 保存结果信息
        this.lastResult = result;
    }

    showError(message) {
        this.elements.statusIndicator.className = 'status-indicator status-error';
        this.elements.statusMessage.textContent = message;
        this.elements.statusIndicator.style.display = 'block';
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.elements.generateBtn.disabled = true;
            this.elements.generateBtn.textContent = '生成中...';

            this.elements.statusIndicator.className = 'status-indicator status-processing';
            this.elements.statusIndicator.style.display = 'block';
            this.elements.statusMessage.textContent = '正在生成地图，请稍候...';
            this.elements.progressFill.style.width = '30%';

            this.elements.resultPreview.style.display = 'none';
        } else {
            this.elements.generateBtn.disabled = false;
            this.elements.generateBtn.textContent = '🚀 生成游戏地图';
        }
    }

    downloadMap() {
        if (this.lastResult && this.lastResult.downloadUrl) {
            window.open(this.lastResult.downloadUrl, '_blank');
        } else {
            alert('没有可下载的地图');
        }
    }

    regenerateMap() {
        this.generateMap();
    }

    saveParams() {
        try {
            localStorage.setItem('gameMapParams', JSON.stringify(this.params));
        } catch (e) {
            console.warn('无法保存参数到本地存储:', e);
        }
    }

    loadSavedParams() {
        try {
            const saved = localStorage.getItem('gameMapParams');
            if (saved) {
                const params = JSON.parse(saved);
                Object.assign(this.params, params);

                // 更新UI
                this.elements.styleSelect.value = this.params.style;
                this.elements.sizeSelect.value = this.params.size;
                this.elements.gameTypeSelect.value = this.params.gameType;
                this.elements.modelSelect.value = this.params.model;

                if (this.params.referenceImage) {
                    this.elements.referenceImage.src = this.params.referenceImage;
                    this.elements.referencePreview.style.display = 'block';
                }
            }
        } catch (e) {
            console.warn('无法从本地存储加载参数:', e);
        }
    }

    resetParams() {
        this.params = {
            style: 'fantasy',
            size: 'medium',
            gameType: 'rpg',
            model: 'pro',
            referenceImage: null,
            additionalParams: {}
        };

        // 重置UI
        this.elements.styleSelect.value = 'fantasy';
        this.elements.sizeSelect.value = 'medium';
        this.elements.gameTypeSelect.value = 'rpg';
        this.elements.modelSelect.value = 'pro';
        this.elements.referenceFile.value = '';
        this.elements.referencePreview.style.display = 'none';

        this.saveParams();
    }

    getParams() {
        return { ...this.params };
    }
}

// 导出为全局变量
window.AIParamsPanel = AIParamsPanel;

