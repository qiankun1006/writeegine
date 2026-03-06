# AI与智能生成功能源码分析

## 1. 功能概述

AI与智能生成功能是 DragonBones 的高级特性，主要包括 AI 生成动画和自动生成网格两个核心功能。这些功能通过算法自动生成动画内容和网格结构，大大提高了动画制作的效率。

### 核心特性
- **AI生成动画** - 基于大模型技术，支持用自然语言描述生成动画
- **自动生成网格** - 根据图片形状自动生成优化的网格结构
- **智能优化** - 自动优化网格密度和三角形分布
- **实时预览** - 支持生成结果的实时预览和调整

## 2. 架构设计

### 2.1 系统架构图

```
AI生成系统
├── AI动画生成模块
│   ├── 自然语言处理
│   ├── 动画语义理解
│   ├── 动画生成引擎
│   └── 结果优化
└── 网格生成模块
    ├── 图像分析
    ├── 形状识别
    ├── 网格生成算法
    └── 网格优化
```

### 2.2 核心接口

```typescript
// AI动画生成接口
interface AIAnimationGenerator {
    // 文本到动画生成
    generateFromText(prompt: string, armature: Armature): Promise<AnimationData>;

    // 动作序列生成
    generateActionSequence(actions: string[], armature: Armature): Promise<AnimationData[]>;

    // 动画风格迁移
    transferAnimationStyle(sourceAnimation: AnimationData, targetStyle: string): Promise<AnimationData>;
}

// 网格生成接口
interface MeshGenerator {
    // 自动生成网格
    generateMesh(imageData: ImageData, options: MeshOptions): Promise<MeshData>;

    // 网格优化
    optimizeMesh(meshData: MeshData, targetTriangles: number): Promise<MeshData>;

    // 网格简化
    simplifyMesh(meshData: MeshData, tolerance: number): Promise<MeshData>;
}
```

## 3. 核心实现

### 3.1 AI动画生成系统

```typescript
/**
 * AI动画生成器 - 基于大模型的智能动画生成
 *
 * 职责：
 * - 解析自然语言描述
 * - 生成对应的动画数据
 * - 优化动画流畅度
 * - 提供个性化动画风格
 *
 * 依赖：
 * - 大模型API服务
 * - 动画语义理解引擎
 * - 动画生成算法
 */
class AIAnimationGenerator {
    private _modelEndpoint: string;
    private _apiKey: string;
    private _cache: Map<string, AnimationData>;

    /**
     * 从文本生成动画
     */
    public async generateFromText(prompt: string, armature: Armature): Promise<AnimationData> {
        // 1. 检查缓存
        const cacheKey = this.generateCacheKey(prompt, armature.name);
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey)!;
        }

        // 2. 预处理提示词
        const processedPrompt = this.preprocessPrompt(prompt);

        // 3. 调用AI模型
        const aiResponse = await this.callAIModel(processedPrompt, armature);

        // 4. 解析AI响应
        const animationData = this.parseAIResponse(aiResponse, armature);

        // 5. 优化动画数据
        const optimizedAnimation = this.optimizeAnimation(animationData);

        // 6. 缓存结果
        this._cache.set(cacheKey, optimizedAnimation);

        return optimizedAnimation;
    }

    /**
     * 预处理提示词
     */
    private preprocessPrompt(prompt: string): string {
        // 1. 清理和标准化
        let processed = prompt.trim().toLowerCase();

        // 2. 提取关键动作
        const actions = this.extractActions(processed);

        // 3. 添加时间信息
        const timing = this.extractTiming(processed);

        // 4. 生成结构化提示
        return this.buildStructuredPrompt(actions, timing);
    }

    /**
     * 提取动作关键词
     */
    private extractActions(text: string): string[] {
        const actionKeywords = [
            '走', '跑', '跳', '挥手', '点头', '转身', '蹲下', '站起',
            'walk', 'run', 'jump', 'wave', 'nod', 'turn', 'squat', 'stand'
        ];

        const foundActions: string[] = [];
        for (const keyword of actionKeywords) {
            if (text.includes(keyword)) {
                foundActions.push(keyword);
            }
        }

        return foundActions;
    }

    /**
     * 提取时间信息
     */
    private extractTiming(text: string): { duration?: number; speed?: string } {
        const timing = {};

        // 提取速度描述
        if (text.includes('慢') || text.includes('slow')) {
            timing.speed = 'slow';
        } else if (text.includes('快') || text.includes('fast')) {
            timing.speed = 'fast';
        } else {
            timing.speed = 'normal';
        }

        // 提取持续时间
        const durationMatch = text.match(/(\d+)\s*(秒|second)/);
        if (durationMatch) {
            timing.duration = parseInt(durationMatch[1]);
        }

        return timing;
    }

    /**
     * 调用AI模型API
     */
    private async callAIModel(prompt: string, armature: Armature): Promise<any> {
        const requestBody = {
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: this.getSystemPrompt()
                },
                {
                    role: 'user',
                    content: this.buildUserPrompt(prompt, armature)
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        };

        const response = await fetch(this._modelEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this._apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`AI API调用失败: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * 获取系统提示词
     */
    private getSystemPrompt(): string {
        return `你是一个专业的2D骨骼动画设计师。请根据用户的描述生成详细的动画数据。

        输出格式要求：
        {
            "animationName": "动画名称",
            "duration": 动画时长(秒),
            "frameRate": 帧率,
            "bones": [
                {
                    "boneName": "骨骼名称",
                    "keyframes": [
                        {
                            "time": 时间点,
                            "transform": {
                                "x": x坐标,
                                "y": y坐标,
                                "rotation": 旋转角度,
                                "scaleX": x缩放,
                                "scaleY": y缩放
                            }
                        }
                    ]
                }
            ]
        }`;
    }

    /**
     * 构建用户提示词
     */
    private buildUserPrompt(prompt: string, armature: Armature): string {
        const boneNames = armature.getBones().map(bone => bone.name).join(', ');

        return `请为骨架生成动画。

        用户描述: ${prompt}

        可用骨骼: ${boneNames}

        请生成符合DragonBones格式的动画数据，确保动画流畅自然。`;
    }

    /**
     * 解析AI响应
     */
    private parseAIResponse(aiResponse: any, armature: Armature): AnimationData {
        try {
            const content = aiResponse.choices[0].message.content;
            const animationConfig = JSON.parse(content);

            // 创建动画数据
            const animationData = new AnimationData();
            animationData.name = animationConfig.animationName;
            animationData.duration = animationConfig.duration;
            animationData.frameRate = animationConfig.frameRate;

            // 解析骨骼动画
            for (const boneConfig of animationConfig.bones) {
                const bone = armature.findBone(boneConfig.boneName);
                if (bone) {
                    const timeline = this.createBoneTimeline(boneConfig.keyframes);
                    animationData.addBoneTimeline(bone.name, timeline);
                }
            }

            return animationData;
        } catch (error) {
            throw new Error(`解析AI响应失败: ${error.message}`);
        }
    }

    /**
     * 创建骨骼时间轴
     */
    private createBoneTimeline(keyframes: any[]): BoneTimeline {
        const timeline = new BoneTimeline();

        for (const keyframe of keyframes) {
            const frame = new TransformFrame();
            frame.time = keyframe.time;
            frame.transform.x = keyframe.transform.x;
            frame.transform.y = keyframe.transform.y;
            frame.transform.rotation = keyframe.transform.rotation;
            frame.transform.scaleX = keyframe.transform.scaleX;
            frame.transform.scaleY = keyframe.transform.scaleY;

            timeline.addFrame(frame);
        }

        return timeline;
    }

    /**
     * 优化动画数据
     */
    private optimizeAnimation(animationData: AnimationData): AnimationData {
        // 1. 平滑关键帧
        this.smoothKeyframes(animationData);

        // 2. 优化时间间隔
        this.optimizeTiming(animationData);

        // 3. 添加缓动效果
        this.addEasing(animationData);

        return animationData;
    }

    /**
     * 生成缓存键
     */
    private generateCacheKey(prompt: string, armatureName: string): string {
        return `${armatureName}:${prompt}`;
    }
}
```

### 3.2 自动生成网格系统

```typescript
/**
 * 网格生成器 - 智能生成优化的网格结构
 *
 * 职责：
 * - 分析图像形状
 * - 生成初始网格
 * - 优化网格质量
 * - 提供网格编辑功能
 */
class MeshGenerator {
    private _defaultOptions: MeshOptions = {
        targetTriangles: 100,
        minTriangleSize: 5,
        maxTriangleSize: 50,
        preserveEdges: true,
        smoothIterations: 3
    };

    /**
     * 从图像生成网格
     */
    public async generateMesh(imageData: ImageData, options: Partial<MeshOptions> = {}): Promise<MeshData> {
        // 1. 合并选项
        const mergedOptions = { ...this._defaultOptions, ...options };

        // 2. 图像预处理
        const processedImage = this.preprocessImage(imageData);

        // 3. 边缘检测
        const edges = this.detectEdges(processedImage);

        // 4. 轮廓提取
        const contours = this.extractContours(edges);

        // 5. 三角化
        const meshData = this.triangulate(contours, mergedOptions);

        // 6. 网格优化
        const optimizedMesh = this.optimizeMesh(meshData, mergedOptions);

        return optimizedMesh;
    }

    /**
     * 图像预处理
     */
    private preprocessImage(imageData: ImageData): ImageData {
        // 1. 转换为灰度图
        const grayImage = this.convertToGrayscale(imageData);

        // 2. 高斯模糊去噪
        const blurredImage = this.gaussianBlur(grayImage, 1);

        // 3. 对比度增强
        const enhancedImage = this.enhanceContrast(blurredImage);

        return enhancedImage;
    }

    /**
     * 边缘检测
     */
    private detectEdges(imageData: ImageData): number[][] {
        const width = imageData.width;
        const height = imageData.height;
        const edges: number[][] = [];

        // Sobel算子边缘检测
        const sobelX = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];

        const sobelY = [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0;
                let gy = 0;

                // 计算梯度
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pixel = this.getPixel(imageData, x + kx, y + ky);
                        gx += pixel * sobelX[ky + 1][kx + 1];
                        gy += pixel * sobelY[ky + 1][kx + 1];
                    }
                }

                // 计算梯度幅值
                const magnitude = Math.sqrt(gx * gx + gy * gy);

                if (magnitude > 50) { // 阈值
                    edges.push([x, y, magnitude]);
                }
            }
        }

        return edges;
    }

    /**
     * 轮廓提取
     */
    private extractContours(edges: number[][]): number[][][] {
        const contours: number[][][] = [];
        const visited = new Set<string>();

        for (const edge of edges) {
            const key = `${edge[0]},${edge[1]}`;
            if (visited.has(key)) continue;

            // 追踪轮廓
            const contour = this.traceContour(edges, edge[0], edge[1], visited);
            if (contour.length > 10) { // 最小轮廓长度
                contours.push(contour);
            }
        }

        return contours;
    }

    /**
     * 轮廓追踪
     */
    private traceContour(edges: number[][], startX: number, startY: number, visited: Set<string>): number[][] {
        const contour: number[][] = [];
        const stack = [[startX, startY]];

        while (stack.length > 0) {
            const [x, y] = stack.pop()!;
            const key = `${x},${y}`;

            if (visited.has(key)) continue;

            visited.add(key);
            contour.push([x, y]);

            // 查找相邻边缘点
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;

                    const nx = x + dx;
                    const ny = y + dy;
                    const nkey = `${nx},${ny}`;

                    if (!visited.has(nkey) && this.hasEdge(edges, nx, ny)) {
                        stack.push([nx, ny]);
                    }
                }
            }
        }

        return contour;
    }

    /**
     * Delaunay三角化
     */
    private triangulate(contours: number[][][], options: MeshOptions): MeshData {
        const meshData = new MeshData();

        // 1. 收集所有顶点
        const vertices: number[][] = [];
        for (const contour of contours) {
            vertices.push(...contour);
        }

        // 2. 生成Delaunay三角网
        const triangles = this.delaunayTriangulation(vertices);

        // 3. 过滤三角形
        const filteredTriangles = this.filterTriangles(triangles, options);

        // 4. 构建网格数据
        meshData.vertices = vertices;
        meshData.triangles = filteredTriangles;

        return meshData;
    }

    /**
     * Delaunay三角剖分
     */
    private delaunayTriangulation(vertices: number[][]): number[][] {
        const triangles: number[][] = [];

        // 简化的Delaunay实现
        for (let i = 0; i < vertices.length - 2; i++) {
            for (let j = i + 1; j < vertices.length - 1; j++) {
                for (let k = j + 1; k < vertices.length; k++) {
                    if (this.isValidTriangle(vertices[i], vertices[j], vertices[k])) {
                        triangles.push([i, j, k]);
                    }
                }
            }
        }

        return triangles;
    }

    /**
     * 验证三角形有效性
     */
    private isValidTriangle(p1: number[], p2: number[], p3: number[]): boolean {
        // 计算三角形面积
        const area = Math.abs(
            (p1[0] * (p2[1] - p3[1]) +
             p2[0] * (p3[1] - p1[1]) +
             p3[0] * (p1[1] - p2[1])) / 2
        );

        // 面积阈值
        return area > 1;
    }

    /**
     * 过滤三角形
     */
    private filterTriangles(triangles: number[][], options: MeshOptions): number[][] {
        return triangles.filter(triangle => {
            // 1. 检查三角形大小
            const size = this.calculateTriangleSize(triangle);
            if (size < options.minTriangleSize || size > options.maxTriangleSize) {
                return false;
            }

            // 2. 检查三角形质量
            const quality = this.calculateTriangleQuality(triangle);
            return quality > 0.3; // 质量阈值
        });
    }

    /**
     * 网格优化
     */
    private optimizeMesh(meshData: MeshData, options: MeshOptions): MeshData {
        let optimizedMesh = meshData;

        // 1. 网格平滑
        for (let i = 0; i < options.smoothIterations; i++) {
            optimizedMesh = this.laplacianSmooth(optimizedMesh);
        }

        // 2. 网格简化
        if (optimizedMesh.triangles.length > options.targetTriangles) {
            optimizedMesh = this.simplifyMesh(optimizedMesh, options.targetTriangles);
        }

        // 3. 网格细化
        if (optimizedMesh.triangles.length < options.targetTriangles) {
            optimizedMesh = this.refineMesh(optimizedMesh, options.targetTriangles);
        }

        return optimizedMesh;
    }

    /**
     * Laplacian平滑
     */
    private laplacianSmooth(meshData: MeshData): MeshData {
        const newVertices = [...meshData.vertices];

        for (let i = 0; i < newVertices.length; i++) {
            const neighbors = this.findNeighbors(meshData, i);
            if (neighbors.length > 0) {
                // 计算邻居平均值
                let avgX = 0;
                let avgY = 0;

                for (const neighbor of neighbors) {
                    avgX += meshData.vertices[neighbor][0];
                    avgY += meshData.vertices[neighbor][1];
                }

                newVertices[i] = [
                    avgX / neighbors.length,
                    avgY / neighbors.length
                ];
            }
        }

        return {
            vertices: newVertices,
            triangles: meshData.triangles
        };
    }
}
```

## 4. 关键算法

### 4.1 自然语言处理算法

```typescript
/**
 * 自然语言处理算法
 */
class NLPProcessor {
    /**
     * 动作识别
     */
    static recognizeActions(text: string): Action[] {
        const actions: Action[] = [];

        // 动作词典
        const actionDict = {
            '走': { type: 'locomotion', name: 'walk' },
            '跑': { type: 'locomotion', name: 'run' },
            '跳': { type: 'locomotion', name: 'jump' },
            '挥手': { type: 'gesture', name: 'wave' },
            '点头': { type: 'gesture', name: 'nod' },
            '转身': { type: 'rotation', name: 'turn' }
        };

        for (const [keyword, action] of Object.entries(actionDict)) {
            if (text.includes(keyword)) {
                actions.push(action);
            }
        }

        return actions;
    }

    /**
     * 情感分析
     */
    static analyzeEmotion(text: string): Emotion {
        const emotionKeywords = {
            '高兴': 'happy',
            '悲伤': 'sad',
            '愤怒': 'angry',
            '惊讶': 'surprised',
            '害怕': 'fearful'
        };

        for (const [keyword, emotion] of Object.entries(emotionKeywords)) {
            if (text.includes(keyword)) {
                return emotion;
            }
        }

        return 'neutral';
    }
}
```

### 4.2 网格生成算法

```typescript
/**
 * 网格生成核心算法
 */
class MeshGenerationAlgorithms {
    /**
     * 自适应三角化
     */
    static adaptiveTriangulation(contours: number[][][], targetTriangles: number): number[][] {
        // 1. 计算目标三角形密度
        const totalArea = this.calculateTotalArea(contours);
        const targetDensity = targetTriangles / totalArea;

        // 2. 自适应细分
        let triangles: number[][] = [];
        for (const contour of contours) {
            const contourTriangles = this.subdivideContour(contour, targetDensity);
            triangles = triangles.concat(contourTriangles);
        }

        // 3. 平衡三角形数量
        if (triangles.length > targetTriangles) {
            triangles = this.reduceTriangles(triangles, targetTriangles);
        } else if (triangles.length < targetTriangles) {
            triangles = this.addTriangles(triangles, targetTriangles);
        }

        return triangles;
    }

    /**
     * 网格质量评估
     */
    static evaluateMeshQuality(vertices: number[][], triangles: number[][]): number {
        let totalQuality = 0;

        for (const triangle of triangles) {
            const quality = this.calculateTriangleQuality([
                vertices[triangle[0]],
                vertices[triangle[1]],
                vertices[triangle[2]]
            ]);
            totalQuality += quality;
        }

        return totalQuality / triangles.length;
    }
}
```

## 5. 性能优化

### 5.1 AI模型优化

```typescript
/**
 * AI模型性能优化
 */
class AIModelOptimizer {
    private static _cache = new Map<string, any>();
    private static _batchQueue: BatchRequest[] = [];

    /**
     * 批量请求处理
     */
    static async batchProcess(requests: Request[]): Promise<Response[]> {
        // 1. 合并相似请求
        const mergedRequests = this.mergeSimilarRequests(requests);

        // 2. 并行处理
        const responses = await Promise.all(
            mergedRequests.map(request => this.processRequest(request))
        );

        // 3. 拆分响应
        return this.splitResponses(responses, requests.length);
    }

    /**
     * 缓存优化
     */
    static getCachedResult(key: string): any | null {
        return this._cache.get(key) || null;
    }

    static cacheResult(key: string, result: any): void {
        this._cache.set(key, result);

        // 限制缓存大小
        if (this._cache.size > 1000) {
            const firstKey = this._cache.keys().next().value;
            this._cache.delete(firstKey);
        }
    }
}
```

### 5.2 网格生成优化

```typescript
/**
 * 网格生成性能优化
 */
class MeshGenerationOptimizer {
    /**
     * 多线程网格生成
     */
    static async generateMeshParallel(imageData: ImageData, options: MeshOptions): Promise<MeshData> {
        // 1. 分割图像
        const tiles = this.splitImageIntoTiles(imageData, 4);

        // 2. 并行处理
        const tileResults = await Promise.all(
            tiles.map(tile => this.processTile(tile, options))
        );

        // 3. 合并结果
        return this.mergeTileResults(tileResults);
    }

    /**
     * GPU加速边缘检测
     */
    static detectEdgesGPU(imageData: ImageData): number[][] {
        // WebGL着色器实现边缘检测
        const gl = this.getWebGLContext();
        const shader = this.createEdgeDetectionShader(gl);

        // 上传图像数据
        const texture = this.uploadImageToTexture(gl, imageData);

        // 执行着色器
        const edges = this.executeEdgeDetection(gl, shader, texture);

        return edges;
    }
}
```

## 6. 使用示例

### 6.1 AI动画生成

```typescript
// 创建AI动画生成器
const aiGenerator = new AIAnimationGenerator({
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: 'your-api-key'
});

// 生成动画
const animation = await aiGenerator.generateFromText(
    '角色向左走三步，然后挥手打招呼',
    armature
);

// 播放生成的动画
armature.animation.addAnimation(animation);
armature.animation.play(animation.name);
```

### 6.2 网格生成

```typescript
// 创建网格生成器
const meshGenerator = new MeshGenerator();

// 生成网格
const meshData = await meshGenerator.generateMesh(imageData, {
    targetTriangles: 200,
    preserveEdges: true,
    smoothIterations: 5
});

// 应用网格到插槽
slot.setMeshData(meshData);
```

## 7. 扩展性

### 7.1 自定义AI模型

```typescript
/**
 * 自定义AI模型接口
 */
interface CustomAIModel {
    generateAnimation(prompt: string, context: AnimationContext): Promise<AnimationData>;
    validateAnimation(animation: AnimationData): Promise<ValidationResult>;
}

/**
 * AI模型管理器
 */
class AIModelManager {
    private static _models: Map<string, CustomAIModel> = new Map();

    static registerModel(name: string, model: CustomAIModel): void {
        this._models.set(name, model);
    }

    static getModel(name: string): CustomAIModel | null {
        return this._models.get(name) || null;
    }
}
```

### 7.2 网格生成插件

```typescript
/**
 * 网格生成插件接口
 */
interface MeshGenerationPlugin {
    preprocessImage?(imageData: ImageData): ImageData;
    postprocessMesh?(meshData: MeshData): MeshData;
    customTriangulation?(contours: number[][][]): number[][];
}

/**
 * 插件管理器
 */
class MeshPluginManager {
    private static _plugins: MeshGenerationPlugin[] = [];

    static registerPlugin(plugin: MeshGenerationPlugin): void {
        this._plugins.push(plugin);
    }

    static applyPlugins(meshData: MeshData): MeshData {
        let result = meshData;

        for (const plugin of this._plugins) {
            if (plugin.postprocessMesh) {
                result = plugin.postprocessMesh(result);
            }
        }

        return result;
    }
}
```

## 8. 最佳实践

### 8.1 AI动画生成最佳实践

1. **提示词设计** - 使用清晰、具体的描述
2. **动画风格** - 定义一致的动画风格
3. **性能优化** - 合理使用缓存和批量处理
4. **错误处理** - 完善的错误处理和重试机制

### 8.2 网格生成最佳实践

1. **图像预处理** - 确保输入图像质量
2. **参数调优** - 根据需求调整网格参数
3. **质量检查** - 验证生成的网格质量
4. **性能平衡** - 在质量和性能之间找到平衡

### 8.3 调试技巧

1. **可视化调试** - 显示生成过程的中间结果
2. **性能监控** - 监控生成过程的性能指标
3. **日志记录** - 详细记录生成过程的关键步骤
4. **单元测试** - 为关键算法编写测试用例

