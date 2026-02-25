/**
 * Unity 渲染引擎模块
 * 基于 Three.js 的 3D 场景渲染器
 */

class UnityRenderer {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = null;
        this.mouse = new THREE.Vector2();

        // 场景对象映射
        this.objects = new Map(); // id -> THREE.Object3D
        this.selectedObjects = new Set();

        // 渲染状态
        this.isRendering = false;
        this.lastFrameTime = 0;
        this.fps = 0;
        this.frameCount = 0;

        // 初始化渲染器
        this.init();
    }

    /**
     * 初始化 Three.js 渲染器
     */
    init() {
        try {
            // 检查 Three.js 是否已加载
            if (typeof THREE === 'undefined') {
                throw new Error('Three.js 库未加载，请检查 CDN 链接');
            }

            // 获取画布元素
            const canvas = document.getElementById(this.canvasId);
            if (!canvas) {
                throw new Error(`找不到画布元素: ${this.canvasId}`);
            }

            // 创建场景
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x1a1a1a);

            // 创建摄像机
            const aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
            this.camera.position.set(0, 5, 10);
            this.camera.lookAt(0, 0, 0);

            // 创建渲染器
            this.renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance'
            });
            this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // 创建轨道控制器
            if (typeof THREE.OrbitControls !== 'undefined') {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
                this.controls.screenSpacePanning = false;
                this.controls.maxPolarAngle = Math.PI;
                this.controls.minDistance = 1;
                this.controls.maxDistance = 100;
            } else {
                console.warn('OrbitControls 未加载，摄像机控制功能受限');
            }

            // 创建光线投射器（用于对象选择）
            this.raycaster = new THREE.Raycaster();

            // 初始化默认场景
            this.initDefaultScene();

            // 开始渲染循环
            this.startRendering();

            // 绑定窗口大小调整事件
            window.addEventListener('resize', () => this.onWindowResize());

            console.log('Unity 渲染器初始化完成');

        } catch (error) {
            console.error('Unity 渲染器初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化默认场景
     */
    initDefaultScene() {
        // 添加网格地面
        const gridSize = 20;
        const gridDivisions = 20;
        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x888888, 0x444444);
        gridHelper.position.y = -0.01; // 稍微低于地面，避免 z-fighting
        this.scene.add(gridHelper);
        this.gridHelper = gridHelper;

        // 添加坐标轴
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
        this.axesHelper = axesHelper;

        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        this.ambientLight = ambientLight;

        // 添加方向光（带阴影）
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
        this.directionalLight = directionalLight;

        // 添加阴影接收平面
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.ground = ground;
    }

    /**
     * 开始渲染循环
     */
    startRendering() {
        if (this.isRendering) return;

        this.isRendering = true;
        this.lastFrameTime = performance.now();

        const animate = () => {
            if (!this.isRendering) return;

            requestAnimationFrame(animate);

            // 计算 FPS
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;

            this.frameCount++;
            if (this.frameCount >= 10) {
                this.fps = Math.round(10000 / (currentTime - this.frameStartTime));
                this.frameCount = 0;
                this.frameStartTime = currentTime;
            }

            // 更新控制器
            if (this.controls) {
                this.controls.update();
            }

            // 渲染场景
            this.renderer.render(this.scene, this.camera);
        };

        this.frameStartTime = performance.now();
        animate();
    }

    /**
     * 停止渲染循环
     */
    stopRendering() {
        this.isRendering = false;
    }

    /**
     * 窗口大小调整处理
     */
    onWindowResize() {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) return;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /**
     * 创建几何体
     */
    createGeometry(type, options = {}) {
        let geometry;

        switch (type.toLowerCase()) {
            case 'cube':
            case 'box':
                geometry = new THREE.BoxGeometry(
                    options.width || 1,
                    options.height || 1,
                    options.depth || 1
                );
                break;

            case 'sphere':
                geometry = new THREE.SphereGeometry(
                    options.radius || 1,
                    options.widthSegments || 32,
                    options.heightSegments || 16
                );
                break;

            case 'cylinder':
                geometry = new THREE.CylinderGeometry(
                    options.radiusTop || 1,
                    options.radiusBottom || 1,
                    options.height || 2,
                    options.radialSegments || 32
                );
                break;

            case 'plane':
                geometry = new THREE.PlaneGeometry(
                    options.width || 10,
                    options.height || 10
                );
                break;

            case 'cone':
                geometry = new THREE.ConeGeometry(
                    options.radius || 1,
                    options.height || 2,
                    options.radialSegments || 32
                );
                break;

            case 'torus':
                geometry = new THREE.TorusGeometry(
                    options.radius || 1,
                    options.tube || 0.4,
                    options.radialSegments || 16,
                    options.tubularSegments || 100
                );
                break;

            default:
                throw new Error(`不支持的几何体类型: ${type}`);
        }

        return geometry;
    }

    /**
     * 创建材质
     */
    createMaterial(type, options = {}) {
        let material;

        switch (type.toLowerCase()) {
            case 'basic':
                material = new THREE.MeshBasicMaterial({
                    color: options.color || 0xffffff,
                    transparent: options.transparent || false,
                    opacity: options.opacity || 1.0,
                    wireframe: options.wireframe || false
                });
                break;

            case 'standard':
                material = new THREE.MeshStandardMaterial({
                    color: options.color || 0xffffff,
                    metalness: options.metalness || 0.5,
                    roughness: options.roughness || 0.5,
                    transparent: options.transparent || false,
                    opacity: options.opacity || 1.0,
                    wireframe: options.wireframe || false
                });
                break;

            case 'phong':
                material = new THREE.MeshPhongMaterial({
                    color: options.color || 0xffffff,
                    shininess: options.shininess || 30,
                    specular: options.specular || 0x111111,
                    transparent: options.transparent || false,
                    opacity: options.opacity || 1.0,
                    wireframe: options.wireframe || false
                });
                break;

            case 'lambert':
                material = new THREE.MeshLambertMaterial({
                    color: options.color || 0xffffff,
                    transparent: options.transparent || false,
                    opacity: options.opacity || 1.0,
                    wireframe: options.wireframe || false
                });
                break;

            default:
                throw new Error(`不支持的材质类型: ${type}`);
        }

        return material;
    }

    /**
     * 添加对象到场景
     */
    addObject(objectData) {
        try {
            // 创建几何体
            const geometry = this.createGeometry(objectData.geometry.type, objectData.geometry.options);

            // 创建材质
            const material = this.createMaterial(objectData.material.type, objectData.material.options);

            // 创建网格
            const mesh = new THREE.Mesh(geometry, material);

            // 设置变换
            mesh.position.set(
                objectData.position.x || 0,
                objectData.position.y || 0,
                objectData.position.z || 0
            );

            mesh.rotation.set(
                (objectData.rotation.x || 0) * Math.PI / 180,
                (objectData.rotation.y || 0) * Math.PI / 180,
                (objectData.rotation.z || 0) * Math.PI / 180
            );

            mesh.scale.set(
                objectData.scale.x || 1,
                objectData.scale.y || 1,
                objectData.scale.z || 1
            );

            // 启用阴影
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // 添加用户数据
            mesh.userData = {
                id: objectData.id,
                name: objectData.name || '未命名对象',
                type: objectData.type || 'object',
                selectable: objectData.selectable !== false,
                originalColor: material.color.clone()
            };

            // 添加到场景和映射
            this.scene.add(mesh);
            this.objects.set(objectData.id, mesh);

            // 触发事件
            this.dispatchEvent('objectAdded', { object: mesh, objectData });

            return mesh;

        } catch (error) {
            console.error('添加对象失败:', error);
            throw error;
        }
    }

    /**
     * 移除对象
     */
    removeObject(objectId) {
        const object = this.objects.get(objectId);
        if (!object) return false;

        // 从选中集合中移除
        this.selectedObjects.delete(objectId);

        // 从场景中移除
        this.scene.remove(object);

        // 从映射中移除
        this.objects.delete(objectId);

        // 清理几何体和材质
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(m => m.dispose());
            } else {
                object.material.dispose();
            }
        }

        // 触发事件
        this.dispatchEvent('objectRemoved', { objectId });

        return true;
    }

    /**
     * 选择对象
     */
    selectObject(objectId, addToSelection = false) {
        const object = this.objects.get(objectId);
        if (!object) return false;

        if (!addToSelection) {
            // 清除之前的选择
            this.clearSelection();
        }

        // 添加到选中集合
        this.selectedObjects.add(objectId);

        // 高亮显示（临时修改材质颜色）
        if (object.material) {
            const material = Array.isArray(object.material) ? object.material[0] : object.material;
            if (material.userData) {
                material.userData.originalColor = material.color.clone();
            }
            material.color.set(0x00aaff); // 高亮蓝色
        }

        // 触发事件
        this.dispatchEvent('objectSelected', { objectId, object });

        return true;
    }

    /**
     * 清除选择
     */
    clearSelection() {
        // 恢复之前选择的对象的颜色
        for (const objectId of this.selectedObjects) {
            const object = this.objects.get(objectId);
            if (object && object.material) {
                const material = Array.isArray(object.material) ? object.material[0] : object.material;
                if (material.userData && material.userData.originalColor) {
                    material.color.copy(material.userData.originalColor);
                }
            }
        }

        this.selectedObjects.clear();
        this.dispatchEvent('selectionCleared');
    }

    /**
     * 通过鼠标位置选择对象
     */
    selectObjectAtMouse(mouseX, mouseY) {
        if (!this.raycaster) return null;

        // 将鼠标位置转换为标准化设备坐标
        const canvas = this.renderer.domElement;
        this.mouse.x = (mouseX / canvas.clientWidth) * 2 - 1;
        this.mouse.y = -(mouseY / canvas.clientHeight) * 2 + 1;

        // 更新光线投射器
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 获取相交对象
        const intersectableObjects = Array.from(this.objects.values())
            .filter(obj => obj.userData.selectable !== false);

        const intersects = this.raycaster.intersectObjects(intersectableObjects, true);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            const objectId = object.userData.id;
            this.selectObject(objectId);
            return objectId;
        }

        return null;
    }

    /**
     * 更新对象变换
     */
    updateObjectTransform(objectId, transform) {
        const object = this.objects.get(objectId);
        if (!object) return false;

        if (transform.position) {
            object.position.set(
                transform.position.x || object.position.x,
                transform.position.y || object.position.y,
                transform.position.z || object.position.z
            );
        }

        if (transform.rotation) {
            object.rotation.set(
                (transform.rotation.x || object.rotation.x) * Math.PI / 180,
                (transform.rotation.y || object.rotation.y) * Math.PI / 180,
                (transform.rotation.z || object.rotation.z) * Math.PI / 180
            );
        }

        if (transform.scale) {
            object.scale.set(
                transform.scale.x || object.scale.x,
                transform.scale.y || object.scale.y,
                transform.scale.z || object.scale.z
            );
        }

        this.dispatchEvent('objectTransformUpdated', { objectId, transform });
        return true;
    }

    /**
     * 更新对象材质
     */
    updateObjectMaterial(objectId, materialProps) {
        const object = this.objects.get(objectId);
        if (!object || !object.material) return false;

        const material = Array.isArray(object.material) ? object.material[0] : object.material;

        if (materialProps.color !== undefined) {
            material.color.set(materialProps.color);
        }

        if (materialProps.opacity !== undefined) {
            material.opacity = materialProps.opacity;
            material.transparent = materialProps.opacity < 1.0;
        }

        if (materialProps.metalness !== undefined && material.metalness !== undefined) {
            material.metalness = materialProps.metalness;
        }

        if (materialProps.roughness !== undefined && material.roughness !== undefined) {
            material.roughness = materialProps.roughness;
        }

        if (materialProps.wireframe !== undefined) {
            material.wireframe = materialProps.wireframe;
        }

        material.needsUpdate = true;

        this.dispatchEvent('objectMaterialUpdated', { objectId, materialProps });
        return true;
    }

    /**
     * 切换网格显示
     */
    toggleGrid(visible) {
        if (this.gridHelper) {
            this.gridHelper.visible = visible !== false;
        }
    }

    /**
     * 切换坐标轴显示
     */
    toggleAxes(visible) {
        if (this.axesHelper) {
            this.axesHelper.visible = visible !== false;
        }
    }

    /**
     * 切换阴影显示
     */
    toggleShadows(enabled) {
        this.renderer.shadowMap.enabled = enabled !== false;
        if (this.directionalLight) {
            this.directionalLight.castShadow = enabled !== false;
        }
        if (this.ground) {
            this.ground.receiveShadow = enabled !== false;
        }

        // 更新所有对象的阴影设置
        for (const object of this.objects.values()) {
            object.castShadow = enabled !== false;
            object.receiveShadow = enabled !== false;
        }
    }

    /**
     * 切换线框模式
     */
    toggleWireframe(enabled) {
        for (const object of this.objects.values()) {
            if (object.material) {
                const material = Array.isArray(object.material) ? object.material[0] : object.material;
                material.wireframe = enabled !== false;
                material.needsUpdate = true;
            }
        }
    }

    /**
     * 获取场景统计信息
     */
    getStats() {
        return {
            fps: this.fps,
            objectCount: this.objects.size,
            selectedCount: this.selectedObjects.size,
            memory: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize
            } : null
        };
    }

    /**
     * 事件系统
     */
    constructor() {
        this.eventListeners = new Map();
    }

    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    removeEventListener(event, callback) {
        if (!this.eventListeners.has(event)) return;
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    dispatchEvent(event, data) {
        if (!this.eventListeners.has(event)) return;
        const listeners = this.eventListeners.get(event);
        for (const listener of listeners) {
            try {
                listener(data);
            } catch (error) {
                console.error(`事件监听器错误 (${event}):`, error);
            }
        }
    }

    /**
     * 清理资源
     */
    dispose() {
        this.stopRendering();

        // 清理所有对象
        for (const objectId of this.objects.keys()) {
            this.removeObject(objectId);
        }

        // 清理默认场景对象
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
            this.gridHelper.geometry.dispose();
        }

        if (this.axesHelper) {
            this.scene.remove(this.axesHelper);
            this.axesHelper.geometry.dispose();
        }

        if (this.ambientLight) {
            this.scene.remove(this.ambientLight);
        }

        if (this.directionalLight) {
            this.scene.remove(this.directionalLight);
        }

        if (this.ground) {
            this.scene.remove(this.ground);
            this.ground.geometry.dispose();
            this.ground.material.dispose();
        }

        // 清理渲染器
        if (this.renderer) {
            this.renderer.dispose();
        }

        // 移除事件监听器
        window.removeEventListener('resize', () => this.onWindowResize());

        console.log('Unity 渲染器已清理');
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnityRenderer;
}

