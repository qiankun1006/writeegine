/**
 * 生成结果预览组件
 * 处理AI生成的地图结果展示、下载和交互
 */

class ResultPreview {
    constructor() {
        this.currentResult = null;
        this.history = [];
        this.initElements();
        this.bindEvents();
        this.loadHistory();
    }

    initElements() {
        this.elements = {
            previewContainer: document.getElementById('result-preview'),
            generatedMap: document.getElementById('generated-map'),
            downloadBtn: document.querySelector('.btn-download'),
            regenerateBtn: document.querySelector('.btn-regenerate'),
            previewTitle: document.querySelector('.result-preview .result-preview-title'),
            previewSubtitle: document.querySelector('.result-preview .result-preview-subtitle')
        };

        // 如果元素不存在，创建它们
        if (!this.elements.previewContainer) {
            this.createPreviewElements();
        }
    }

    createPreviewElements() {
        // 创建结果预览容器
        const container = document.createElement('div');
        container.id = 'result-preview';
        container.className = 'result-preview';
        container.style.display = 'none';

        container.innerHTML = `
            <div class="result-preview-header">
                <div class="result-preview-title">生成结果</div>
                <div class="result-preview-subtitle">基于您的草图生成的AI地图</div>
            </div>
            <img id="generated-map" class="result-preview-image" src="" alt="生成的地图">
            <div class="result-preview-content">
                <div class="result-actions">
                    <button class="result-btn btn-download">
                        <span>⬇️</span> 下载地图
                    </button>
                    <button class="result-btn btn-regenerate">
                        <span>🔄</span> 重新生成
                    </button>
                    <button class="result-btn btn-save" style="background: #6c757d;">
                        <span>💾</span> 保存
                    </button>
                </div>
                <div class="result-metadata" style="margin-top: 15px; font-size: 12px; color: #6c757d;">
                    <div>生成时间: <span id="result-time">-</span></div>
                    <div>地图尺寸: <span id="result-size">-</span></div>
                    <div>生成参数: <span id="result-params">-</span></div>
                </div>
            </div>
        `;

        // 添加到页面
        const rightPanel = document.querySelector('.right-panel');
        if (rightPanel) {
            rightPanel.appendChild(container);
        }

        // 更新元素引用
        this.elements = {
            previewContainer: container,
            generatedMap: document.getElementById('generated-map'),
            downloadBtn: document.querySelector('.btn-download'),
            regenerateBtn: document.querySelector('.btn-regenerate'),
            saveBtn: document.querySelector('.btn-save'),
            previewTitle: document.querySelector('.result-preview-title'),
            previewSubtitle: document.querySelector('.result-preview-subtitle'),
            resultTime: document.getElementById('result-time'),
            resultSize: document.getElementById('result-size'),
            resultParams: document.getElementById('result-params')
        };
    }

    bindEvents() {
        // 下载按钮事件
        if (this.elements.downloadBtn) {
            this.elements.downloadBtn.addEventListener('click', () => this.downloadMap());
        }

        // 重新生成按钮事件
        if (this.elements.regenerateBtn) {
            this.elements.regenerateBtn.addEventListener('click', () => this.regenerateMap());
        }

        // 保存按钮事件
        if (this.elements.saveBtn) {
            this.elements.saveBtn.addEventListener('click', () => this.saveToLibrary());
        }

        // 图片点击放大
        if (this.elements.generatedMap) {
            this.elements.generatedMap.addEventListener('click', () => this.showFullscreen());
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen) {
                this.exitFullscreen();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 's' && this.currentResult) {
                e.preventDefault();
                this.saveToLibrary();
            }
        });
    }

    /**
     * 显示生成结果
     * @param {Object} result 生成结果数据
     */
    showResult(result) {
        this.currentResult = result;

        // 更新图片
        if (this.elements.generatedMap) {
            this.elements.generatedMap.src = result.previewUrl;
            this.elements.generatedMap.alt = `生成的地图 - ${result.style || ''} ${result.gameType || ''}`;
        }

        // 更新元数据
        this.updateMetadata(result);

        // 显示预览容器
        if (this.elements.previewContainer) {
            this.elements.previewContainer.style.display = 'block';

            // 滚动到预览区域
            setTimeout(() => {
                this.elements.previewContainer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }, 100);
        }

        // 添加到历史记录
        this.addToHistory(result);

        // 触发结果显示事件
        this.triggerEvent('resultShown', result);
    }

    /**
     * 更新结果元数据
     */
    updateMetadata(result) {
        if (!this.elements.resultTime || !this.elements.resultSize || !this.elements.resultParams) {
            return;
        }

        // 更新时间
        const time = result.generatedAt ? new Date(result.generatedAt) : new Date();
        this.elements.resultTime.textContent = time.toLocaleString('zh-CN');

        // 更新尺寸
        const sizeMap = {
            small: '512×512',
            medium: '1024×1024',
            large: '2048×2048',
            custom: '自定义'
        };
        this.elements.resultSize.textContent = sizeMap[result.size] || result.size || '-';

        // 更新参数
        const params = [];
        if (result.style) params.push(`风格: ${this.getStyleName(result.style)}`);
        if (result.gameType) params.push(`类型: ${this.getGameTypeName(result.gameType)}`);
        if (result.model) params.push(`模型: ${this.getModelName(result.model)}`);

        this.elements.resultParams.textContent = params.join(' | ');
    }

    /**
     * 获取风格名称
     */
    getStyleName(style) {
        const styleMap = {
            fantasy: '奇幻',
            'sci-fi': '科幻',
            medieval: '中世纪',
            modern: '现代',
            cyberpunk: '赛博朋克',
            steampunk: '蒸汽朋克'
        };
        return styleMap[style] || style;
    }

    /**
     * 获取游戏类型名称
     */
    getGameTypeName(gameType) {
        const gameTypeMap = {
            rpg: '角色扮演',
            strategy: '策略',
            platform: '平台跳跃',
            sandbox: '沙盒',
            adventure: '冒险',
            puzzle: '解谜'
        };
        return gameTypeMap[gameType] || gameType;
    }

    /**
     * 获取模型名称
     */
    getModelName(model) {
        const modelMap = {
            base: '基础',
            pro: '专业',
            custom: '定制'
        };
        return modelMap[model] || model;
    }

    /**
     * 下载地图
     */
    async downloadMap() {
        if (!this.currentResult) {
            this.showMessage('没有可下载的地图', 'error');
            return;
        }

        try {
            this.showMessage('正在下载地图...', 'info');

            // 使用API客户端下载
            if (window.gameMapAPI && this.currentResult.mapId) {
                const blob = await window.gameMapAPI.downloadMap(this.currentResult.mapId);

                // 创建下载链接
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = this.getDownloadFileName();
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                this.showMessage('地图下载完成！', 'success');

                // 触发下载完成事件
                this.triggerEvent('mapDownloaded', this.currentResult);

            } else if (this.currentResult.downloadUrl) {
                // 直接使用下载URL
                window.open(this.currentResult.downloadUrl, '_blank');
                this.showMessage('开始下载地图', 'info');
            } else {
                throw new Error('没有可用的下载链接');
            }

        } catch (error) {
            console.error('地图下载失败:', error);
            this.showMessage(`下载失败: ${error.message}`, 'error');
        }
    }

    /**
     * 获取下载文件名
     */
    getDownloadFileName() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const style = this.currentResult.style || 'map';
        const gameType = this.currentResult.gameType || 'game';

        return `game-map-${style}-${gameType}-${timestamp}.png`;
    }

    /**
     * 重新生成地图
     */
    regenerateMap() {
        if (!this.currentResult) {
            this.showMessage('没有可重新生成的地图', 'error');
            return;
        }

        // 触发重新生成事件
        this.triggerEvent('regenerateRequested', this.currentResult);

        this.showMessage('正在重新生成地图...', 'info');
    }

    /**
     * 保存到素材库
     */
    async saveToLibrary() {
        if (!this.currentResult) {
            this.showMessage('没有可保存的地图', 'error');
            return;
        }

        try {
            this.showMessage('正在保存到素材库...', 'info');

            // 这里应该调用后端的保存API
            // 暂时模拟保存过程
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.showMessage('地图已保存到素材库！', 'success');

            // 触发保存完成事件
            this.triggerEvent('mapSaved', this.currentResult);

        } catch (error) {
            console.error('保存到素材库失败:', error);
            this.showMessage(`保存失败: ${error.message}`, 'error');
        }
    }

    /**
     * 显示全屏预览
     */
    showFullscreen() {
        if (!this.currentResult || !this.elements.generatedMap) {
            return;
        }

        // 创建全屏容器
        const fullscreenContainer = document.createElement('div');
        fullscreenContainer.className = 'fullscreen-preview';
        fullscreenContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            cursor: pointer;
        `;

        // 创建全屏图片
        const fullscreenImage = document.createElement('img');
        fullscreenImage.src = this.elements.generatedMap.src;
        fullscreenImage.alt = this.elements.generatedMap.alt;
        fullscreenImage.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border: 2px solid white;
            border-radius: 8px;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
        `;

        // 创建关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s;
        `;

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.exitFullscreen();
        });

        // 添加元素到容器
        fullscreenContainer.appendChild(fullscreenImage);
        fullscreenContainer.appendChild(closeBtn);

        // 添加到页面
        document.body.appendChild(fullscreenContainer);

        // 点击容器退出全屏
        fullscreenContainer.addEventListener('click', (e) => {
            if (e.target === fullscreenContainer) {
                this.exitFullscreen();
            }
        });

        // 保存引用
        this.fullscreenContainer = fullscreenContainer;
        this.isFullscreen = true;

        // 触发全屏显示事件
        this.triggerEvent('fullscreenShown');
    }

    /**
     * 退出全屏预览
     */
    exitFullscreen() {
        if (this.fullscreenContainer && this.isFullscreen) {
            document.body.removeChild(this.fullscreenContainer);
            this.fullscreenContainer = null;
            this.isFullscreen = false;

            // 触发全屏关闭事件
            this.triggerEvent('fullscreenClosed');
        }
    }

    /**
     * 添加到历史记录
     */
    addToHistory(result) {
        try {
            const historyItem = {
                ...result,
                viewedAt: new Date().toISOString(),
                id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };

            this.history.unshift(historyItem);

            // 限制历史记录数量
            if (this.history.length > 50) {
                this.history.length = 50;
            }

            // 保存到本地存储
            this.saveHistory();

        } catch (error) {
            console.warn('无法添加到历史记录:', error);
        }
    }

    /**
     * 保存历史记录到本地存储
     */
    saveHistory() {
        try {
            localStorage.setItem('gameMapResultsHistory', JSON.stringify(this.history));
        } catch (error) {
            console.warn('无法保存历史记录:', error);
        }
    }

    /**
     * 从本地存储加载历史记录
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('gameMapResultsHistory');
            if (saved) {
                this.history = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('无法加载历史记录:', error);
        }
    }

    /**
     * 获取历史记录
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * 清除历史记录
     */
    clearHistory() {
        this.history = [];
        try {
            localStorage.removeItem('gameMapResultsHistory');
            return true;
        } catch (error) {
            console.warn('无法清除历史记录:', error);
            return false;
        }
    }

    /**
     * 显示消息
     */
    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = `result-message result-message-${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${this.getMessageColor(type)};
            color: white;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        // 添加到页面
        document.body.appendChild(messageElement);

        // 3秒后自动移除
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        document.body.removeChild(messageElement);
                    }
                }, 300);
            }
        }, 3000);

        // 添加CSS动画
        if (!document.getElementById('result-message-styles')) {
            const style = document.createElement('style');
            style.id = 'result-message-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * 获取消息颜色
     */
    getMessageColor(type) {
        const colors = {
            info: '#007bff',
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107'
        };
        return colors[type] || colors.info;
    }

    /**
     * 触发自定义事件
     */
    triggerEvent(eventName, data = null) {
        const event = new CustomEvent(`gameMapResult:${eventName}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    /**
     * 隐藏结果预览
     */
    hide() {
        if (this.elements.previewContainer) {
            this.elements.previewContainer.style.display = 'none';
        }
        this.currentResult = null;
    }

    /**
     * 显示历史记录面板
     */
    showHistoryPanel() {
        // 创建历史记录面板
        const historyPanel = document.createElement('div');
        historyPanel.className = 'history-panel';
        historyPanel.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            width: 400px;
            background: white;
            box-shadow: -2px 0 10px rgba(0,0,0,0.1);
            z-index: 1000;
            overflow-y: auto;
            padding: 20px;
            transform: translateX(100%);
            transition: transform 0.3s ease-out;
        `;

        // 创建标题
        const title = document.createElement('h3');
        title.textContent = '生成历史';
        title.style.marginBottom = '20px';

        // 创建关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            width: 30px;
            height: 30px;
            background: #f8f9fa;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        closeBtn.addEventListener('click', () => {
            historyPanel.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (historyPanel.parentNode) {
                    document.body.removeChild(historyPanel);
                }
            }, 300);
        });

        // 创建历史记录列表
        const historyList = document.createElement('div');
        historyList.className = 'history-list';

        if (this.history.length === 0) {
            historyList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 40px 0;">暂无历史记录</div>';
        } else {
            this.history.forEach((item, index) => {
                const historyItem = this.createHistoryItem(item, index);
                historyList.appendChild(historyItem);
            });
        }

        // 添加元素到面板
        historyPanel.appendChild(title);
        historyPanel.appendChild(closeBtn);
        historyPanel.appendChild(historyList);

        // 添加到页面
        document.body.appendChild(historyPanel);

        // 显示面板
        setTimeout(() => {
            historyPanel.style.transform = 'translateX(0)';
        }, 10);

        // 保存引用
        this.historyPanel = historyPanel;
    }

    /**
     * 创建历史记录项
     */
    createHistoryItem(item, index) {
        const itemElement = document.createElement('div');
        itemElement.className = 'history-item';
        itemElement.style.cssText = `
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: background 0.2s;
        `;

        itemElement.addEventListener('mouseenter', () => {
            itemElement.style.background = '#f8f9fa';
        });

        itemElement.addEventListener('mouseleave', () => {
            itemElement.style.background = 'white';
        });

        itemElement.addEventListener('click', () => {
            this.showResult(item);
            if (this.historyPanel) {
                this.historyPanel.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (this.historyPanel.parentNode) {
                        document.body.removeChild(this.historyPanel);
                        this.historyPanel = null;
                    }
                }, 300);
            }
        });

        const time = new Date(item.viewedAt || item.generatedAt).toLocaleString('zh-CN');
        const style = this.getStyleName(item.style);
        const gameType = this.getGameTypeName(item.gameType);

        itemElement.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 5px;">${style} ${gameType}</div>
            <div style="font-size: 12px; color: #6c757d; margin-bottom: 8px;">${time}</div>
            <div style="display: flex; gap: 8px;">
                <span style="font-size: 11px; background: #e9ecef; padding: 2px 6px; border-radius: 10px;">${this.getModelName(item.model)}</span>
                <span style="font-size: 11px; background: #e9ecef; padding: 2px 6px; border-radius: 10px;">${item.size || 'medium'}</span>
            </div>
        `;

        return itemElement;
    }
}

// 导出为全局变量
window.ResultPreview = ResultPreview;

// 创建默认实例
window.resultPreview = new ResultPreview();

