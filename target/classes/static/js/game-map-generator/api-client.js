/**
 * API客户端
 * 处理与后端的地图生成API通信
 */

class GameMapAPIClient {
    constructor() {
        this.baseURL = '/api/game-map';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * 生成游戏地图
     * @param {Object} requestData - 生成请求数据
     * @returns {Promise<Object>} 生成结果
     */
    async generateMap(requestData) {
        try {
            const response = await this.request('POST', '/generate', requestData);
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error, '地图生成失败');
        }
    }

    /**
     * 获取生成状态
     * @param {string} jobId - 任务ID
     * @returns {Promise<Object>} 状态信息
     */
    async getStatus(jobId) {
        try {
            const response = await this.request('GET', `/status/${jobId}`);
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error, '状态查询失败');
        }
    }

    /**
     * 下载生成的地图
     * @param {string} mapId - 地图ID
     * @returns {Promise<Blob>} 地图文件
     */
    async downloadMap(mapId) {
        try {
            const response = await fetch(`${this.baseURL}/download/${mapId}`, {
                method: 'GET',
                headers: this.defaultHeaders
            });

            if (!response.ok) {
                throw new Error(`下载失败: ${response.status} ${response.statusText}`);
            }

            return await response.blob();
        } catch (error) {
            console.error('地图下载失败:', error);
            throw error;
        }
    }

    /**
     * 获取生成历史
     * @param {number} limit - 限制数量
     * @param {number} offset - 偏移量
     * @returns {Promise<Array>} 历史记录
     */
    async getHistory(limit = 10, offset = 0) {
        try {
            const response = await this.request('GET', `/history?limit=${limit}&offset=${offset}`);
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error, '获取历史记录失败');
        }
    }

    /**
     * 删除生成的地图
     * @param {string} mapId - 地图ID
     * @returns {Promise<Object>} 删除结果
     */
    async deleteMap(mapId) {
        try {
            const response = await this.request('DELETE', `/${mapId}`);
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error, '删除地图失败');
        }
    }

    /**
     * 获取支持的参数选项
     * @returns {Promise<Object>} 参数选项
     */
    async getOptions() {
        try {
            const response = await this.request('GET', '/options');
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error, '获取参数选项失败');
        }
    }

    /**
     * 验证草图数据
     * @param {string} sketchData - 草图数据
     * @returns {Promise<Object>} 验证结果
     */
    async validateSketch(sketchData) {
        try {
            const response = await this.request('POST', '/validate-sketch', { sketchData });
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error, '草图验证失败');
        }
    }

    /**
     * 通用请求方法
     */
    async request(method, endpoint, data = null) {
        const url = `${this.baseURL}${endpoint}`;
        const options = {
            method: method,
            headers: this.defaultHeaders,
            credentials: 'same-origin' // 包含cookies
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        // 添加请求超时
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
        options.signal = controller.signal;

        try {
            const response = await fetch(url, options);
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('请求超时，请稍后重试');
            }
            throw error;
        }
    }

    /**
     * 处理响应
     */
    async handleResponse(response) {
        if (!response.ok) {
            let errorMessage = `请求失败: ${response.status} ${response.statusText}`;

            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                // 无法解析JSON错误信息
            }

            throw new Error(errorMessage);
        }

        try {
            return await response.json();
        } catch (error) {
            throw new Error('响应解析失败');
        }
    }

    /**
     * 处理错误
     */
    handleError(error, defaultMessage) {
        console.error(`${defaultMessage}:`, error);

        let errorMessage = defaultMessage;
        if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            error: errorMessage,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 设置认证令牌
     * @param {string} token - 认证令牌
     */
    setAuthToken(token) {
        if (token) {
            this.defaultHeaders['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.defaultHeaders['Authorization'];
        }
    }

    /**
     * 设置自定义请求头
     * @param {Object} headers - 自定义请求头
     */
    setCustomHeaders(headers) {
        Object.assign(this.defaultHeaders, headers);
    }

    /**
     * 创建WebSocket连接用于实时状态更新
     * @param {string} jobId - 任务ID
     * @param {Function} onMessage - 消息回调
     * @returns {WebSocket} WebSocket连接
     */
    createWebSocketConnection(jobId, onMessage) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}${this.baseURL}/ws/${jobId}`;

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('WebSocket连接已建立');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (onMessage) {
                    onMessage(data);
                }
            } catch (error) {
                console.error('WebSocket消息解析失败:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket连接已关闭');
        };

        return ws;
    }

    /**
     * 上传参考图片
     * @param {File} file - 图片文件
     * @returns {Promise<Object>} 上传结果
     */
    async uploadReferenceImage(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${this.baseURL}/upload-reference`, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });

            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error, '图片上传失败');
        }
    }

    /**
     * 批量生成地图
     * @param {Array} requests - 批量请求数据
     * @returns {Promise<Object>} 批量生成结果
     */
    async batchGenerate(requests) {
        try {
            const response = await this.request('POST', '/batch-generate', { requests });
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error, '批量生成失败');
        }
    }

    /**
     * 获取生成统计信息
     * @returns {Promise<Object>} 统计信息
     */
    async getStatistics() {
        try {
            const response = await this.request('GET', '/statistics');
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error, '获取统计信息失败');
        }
    }

    /**
     * 取消生成任务
     * @param {string} jobId - 任务ID
     * @returns {Promise<Object>} 取消结果
     */
    async cancelGeneration(jobId) {
        try {
            const response = await this.request('POST', `/cancel/${jobId}`);
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error, '取消任务失败');
        }
    }
}

// 导出为全局变量
window.GameMapAPIClient = GameMapAPIClient;

// 创建默认实例
window.gameMapAPI = new GameMapAPIClient();

