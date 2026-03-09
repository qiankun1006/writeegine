/**
 * 草图转换器
 * 将tilemap草图转换为AI可理解的像素轮廓数据
 */

class SketchConverter {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gridSize = 16; // 默认网格大小
    }

    /**
     * 初始化转换器
     * @param {HTMLCanvasElement} canvas - tilemap编辑器的画布
     */
    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // 获取网格大小
        if (window.tilemapEditor && window.tilemapEditor.gridSize) {
            this.gridSize = window.tilemapEditor.gridSize;
        }
    }

    /**
     * 将tilemap草图转换为像素轮廓数据
     * @returns {string} 转换后的轮廓数据
     */
    convertToOutline() {
        if (!this.canvas || !this.ctx) {
            console.error('SketchConverter未初始化');
            return null;
        }

        try {
            // 1. 获取画布像素数据
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

            // 2. 提取图块信息
            const tiles = this.extractTiles(imageData);

            // 3. 识别轮廓边界
            const outlines = this.detectOutlines(tiles);

            // 4. 简化轮廓数据
            const simplifiedOutlines = this.simplifyOutlines(outlines);

            // 5. 转换为AI可理解的格式
            const aiFormat = this.convertToAIFormat(simplifiedOutlines);

            return aiFormat;

        } catch (error) {
            console.error('草图转换失败:', error);
            return null;
        }
    }

    /**
     * 提取图块信息
     */
    extractTiles(imageData) {
        const tiles = [];
        const width = this.canvas.width;
        const height = this.canvas.height;

        // 按网格提取图块
        for (let y = 0; y < height; y += this.gridSize) {
            for (let x = 0; x < width; x += this.gridSize) {
                const tile = this.extractTileAt(x, y, imageData);
                if (tile && tile.hasContent) {
                    tiles.push(tile);
                }
            }
        }

        return tiles;
    }

    /**
     * 提取指定位置的图块
     */
    extractTileAt(x, y, imageData) {
        const tileSize = this.gridSize;
        const tileData = [];
        let hasContent = false;

        // 检查图块是否有内容
        for (let ty = 0; ty < tileSize; ty++) {
            for (let tx = 0; tx < tileSize; tx++) {
                const pixelX = x + tx;
                const pixelY = y + ty;

                if (pixelX < this.canvas.width && pixelY < this.canvas.height) {
                    const pixelIndex = (pixelY * this.canvas.width + pixelX) * 4;
                    const alpha = imageData.data[pixelIndex + 3];

                    if (alpha > 10) { // 非透明像素
                        hasContent = true;

                        // 获取像素颜色
                        const r = imageData.data[pixelIndex];
                        const g = imageData.data[pixelIndex + 1];
                        const b = imageData.data[pixelIndex + 2];

                        tileData.push({
                            x: tx,
                            y: ty,
                            color: { r, g, b, a: alpha }
                        });
                    }
                }
            }
        }

        return {
            x: Math.floor(x / tileSize),
            y: Math.floor(y / tileSize),
            hasContent: hasContent,
            pixels: tileData,
            dominantColor: this.getDominantColor(tileData)
        };
    }

    /**
     * 获取图块的主色调
     */
    getDominantColor(pixels) {
        if (pixels.length === 0) return null;

        // 简单的颜色聚类
        const colorCounts = {};

        pixels.forEach(pixel => {
            const colorKey = `${pixel.color.r},${pixel.color.g},${pixel.color.b}`;
            colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
        });

        // 找到出现次数最多的颜色
        let maxCount = 0;
        let dominantColorKey = null;

        for (const [colorKey, count] of Object.entries(colorCounts)) {
            if (count > maxCount) {
                maxCount = count;
                dominantColorKey = colorKey;
            }
        }

        if (dominantColorKey) {
            const [r, g, b] = dominantColorKey.split(',').map(Number);
            return { r, g, b };
        }

        return null;
    }

    /**
     * 检测轮廓边界
     */
    detectOutlines(tiles) {
        if (tiles.length === 0) return [];

        // 创建网格表示
        const gridWidth = Math.ceil(this.canvas.width / this.gridSize);
        const gridHeight = Math.ceil(this.canvas.height / this.gridSize);

        const grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(0));

        // 填充网格
        tiles.forEach(tile => {
            if (tile.y < gridHeight && tile.x < gridWidth) {
                grid[tile.y][tile.x] = 1;
            }
        });

        // 检测轮廓
        const outlines = [];
        const visited = Array(gridHeight).fill().map(() => Array(gridWidth).fill(false));

        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                if (grid[y][x] === 1 && !visited[y][x]) {
                    const outline = this.traceOutline(grid, x, y, visited);
                    if (outline.length > 0) {
                        outlines.push(outline);
                    }
                }
            }
        }

        return outlines;
    }

    /**
     * 追踪单个轮廓
     */
    traceOutline(grid, startX, startY, visited) {
        const outline = [];
        const stack = [[startX, startY]];

        // 方向：上、右、下、左
        const directions = [
            [0, -1], [1, 0], [0, 1], [-1, 0]
        ];

        while (stack.length > 0) {
            const [x, y] = stack.pop();

            if (visited[y][x]) continue;

            visited[y][x] = true;
            outline.push({ x, y });

            // 检查相邻单元格
            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;

                if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length) {
                    if (grid[ny][nx] === 1 && !visited[ny][nx]) {
                        stack.push([nx, ny]);
                    }
                }
            }
        }

        return outline;
    }

    /**
     * 简化轮廓数据
     */
    simplifyOutlines(outlines) {
        return outlines.map(outline => {
            if (outline.length <= 2) return outline;

            // 使用Douglas-Peucker算法简化
            const tolerance = 1.0;
            return this.douglasPeucker(outline, tolerance);
        });
    }

    /**
     * Douglas-Peucker算法实现
     */
    douglasPeucker(points, tolerance) {
        if (points.length <= 2) return points;

        // 找到距离最远的点
        let maxDistance = 0;
        let maxIndex = 0;
        const first = points[0];
        const last = points[points.length - 1];

        for (let i = 1; i < points.length - 1; i++) {
            const distance = this.perpendicularDistance(points[i], first, last);
            if (distance > maxDistance) {
                maxDistance = distance;
                maxIndex = i;
            }
        }

        // 如果最大距离大于容差，递归简化
        if (maxDistance > tolerance) {
            const left = this.douglasPeucker(points.slice(0, maxIndex + 1), tolerance);
            const right = this.douglasPeucker(points.slice(maxIndex), tolerance);

            // 合并结果，避免重复点
            return left.slice(0, -1).concat(right);
        } else {
            // 返回首尾点
            return [first, last];
        }
    }

    /**
     * 计算点到线段的垂直距离
     */
    perpendicularDistance(point, lineStart, lineEnd) {
        const area = Math.abs(
            (lineEnd.x - lineStart.x) * (lineStart.y - point.y) -
            (lineStart.x - point.x) * (lineEnd.y - lineStart.y)
        );

        const lineLength = Math.sqrt(
            Math.pow(lineEnd.x - lineStart.x, 2) +
            Math.pow(lineEnd.y - lineStart.y, 2)
        );

        return lineLength > 0 ? area / lineLength : 0;
    }

    /**
     * 转换为AI可理解的格式
     */
    convertToAIFormat(outlines) {
        const aiData = {
            version: '1.0',
            gridSize: this.gridSize,
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            outlines: outlines.map(outline => ({
                points: outline.map(p => ({
                    x: p.x * this.gridSize,
                    y: p.y * this.gridSize
                })),
                area: this.calculateArea(outline),
                boundingBox: this.calculateBoundingBox(outline)
            })),
            metadata: {
                generatedAt: new Date().toISOString(),
                tileCount: outlines.reduce((sum, outline) => sum + outline.length, 0)
            }
        };

        return JSON.stringify(aiData);
    }

    /**
     * 计算轮廓面积
     */
    calculateArea(outline) {
        if (outline.length < 3) return 0;

        let area = 0;
        for (let i = 0; i < outline.length; i++) {
            const j = (i + 1) % outline.length;
            area += outline[i].x * outline[j].y;
            area -= outline[j].x * outline[i].y;
        }

        return Math.abs(area / 2) * (this.gridSize * this.gridSize);
    }

    /**
     * 计算轮廓的边界框
     */
    calculateBoundingBox(outline) {
        if (outline.length === 0) {
            return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        }

        let minX = outline[0].x;
        let maxX = outline[0].x;
        let minY = outline[0].y;
        let maxY = outline[0].y;

        for (const point of outline) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        }

        return {
            minX: minX * this.gridSize,
            minY: minY * this.gridSize,
            maxX: (maxX + 1) * this.gridSize,
            maxY: (maxY + 1) * this.gridSize
        };
    }

    /**
     * 获取草图数据的简化版本（用于快速预览）
     */
    getSimplifiedSketchData() {
        const outlineData = this.convertToOutline();
        if (!outlineData) return null;

        try {
            const data = JSON.parse(outlineData);

            // 创建简化版本
            const simplified = {
                outlineCount: data.outlines.length,
                totalArea: data.outlines.reduce((sum, outline) => sum + outline.area, 0),
                boundingBox: this.calculateOverallBoundingBox(data.outlines),
                tileCount: data.metadata.tileCount
            };

            return JSON.stringify(simplified);
        } catch (error) {
            console.error('简化草图数据失败:', error);
            return null;
        }
    }

    /**
     * 计算整体边界框
     */
    calculateOverallBoundingBox(outlines) {
        if (outlines.length === 0) {
            return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        }

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (const outline of outlines) {
            const bbox = outline.boundingBox;
            minX = Math.min(minX, bbox.minX);
            maxX = Math.max(maxX, bbox.maxX);
            minY = Math.min(minY, bbox.minY);
            maxY = Math.max(maxY, bbox.maxY);
        }

        return { minX, minY, maxX, maxY };
    }

    /**
     * 可视化轮廓（用于调试）
     */
    visualizeOutlines(canvasId) {
        const outlineData = this.convertToOutline();
        if (!outlineData) return;

        try {
            const data = JSON.parse(outlineData);
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 设置绘制样式
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 2;
            ctx.fillStyle = 'rgba(0, 123, 255, 0.1)';

            // 绘制每个轮廓
            data.outlines.forEach(outline => {
                if (outline.points.length < 2) return;

                ctx.beginPath();
                ctx.moveTo(outline.points[0].x, outline.points[0].y);

                for (let i = 1; i < outline.points.length; i++) {
                    ctx.lineTo(outline.points[i].x, outline.points[i].y);
                }

                // 闭合轮廓
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            });

        } catch (error) {
            console.error('可视化轮廓失败:', error);
        }
    }
}

// 导出为全局变量
window.SketchConverter = SketchConverter;

