/**
 * Unity 编辑器主类
 * 管理编辑器状态、工具和用户交互
 */

class UnityEditor {
    constructor() {
        // 编辑器状态
        this.state = {
            // 场景数据
            scene: {
                id: this.generateUUID(),
                name: '未命名场景',
                version: '1.0.0',
                objects: [],
                materials: [],
                lights: [],
                camera: {
                    position: { x: 0, y: 5, z: 10 },
                    target: { x: 0, y: 0, z: 0 },
                    fov: 60
                },
                settings: {
                    backgroundColor: '#1a1a1a',
                    gridEnabled: true,
                    gridSize: 1,
                    axesEnabled: true,
                    shadowsEnabled: true,
                    physicsEnabled: false
                }
            },

            // 编辑状态
            selectedObjects: new Set(),
            activeTool: 'select', // select, move, rotate, scale
            editMode: 'object',   // object, vertex, uv

            // 视图状态
            viewport: {
                width: 800,
                height: 600,
                cameraMode: 'perspective', // perspective, top, front, side
                gridVisible: true,
                axesVisible: true,
                wireframeMode: false
            },

            // 操作历史
            history: {
                undoStack: [],
                redoStack: [],
                maxSteps: 50,
                isRecording: true
            },

            // 物理模拟状态
            physics: {
                enabled: false,
                simulating: false,
                gravity: { x: 0, y: -9.8, z: 0 },
                timeScale: 1.0
            },

            // 网格和对齐设置
            snapping: {
                gridSnap: 1.0,
                angleSnap: 15,
                snapEnabled: true
            }
        };

        // 编辑器组件
        this.renderer = null;
        this.physicsEngine = null;
        this.uiManager = null;

        // 工具实例
        this.tools = {
            select: null,
            move: null,
            rotate: null,
            scale: null
        };

        // 事件监听器
        this.eventListeners = new Map();

        // 初始化标志
        this.isInitialized = false;

        console.log('Unity 编辑器实例已创建');
    }

    /**
     * 初始化编辑器
     */
    async initialize() {
        try {
            console.log('开始初始化 Unity 编辑器...');

            // 1. 初始化渲染器
            this.renderer = new UnityRenderer('unityCanvas');

            // 2. 初始化物理引擎（可选）
            try {
                this.physicsEngine = new UnityPhysics();
                await this.physicsEngine.initialize();
                console.log('物理引擎初始化成功');
            } catch (physicsError) {
                console.warn('物理引擎初始化失败，物理功能将不可用:', physicsError);
                this.physicsEngine = null;
            }

            // 3. 初始化 UI 管理器
            this.uiManager = new UnityUI(this);

            // 4. 初始化工具
            this.initializeTools();

            // 5. 设置事件监听
            this.setupEventListeners();

            // 6. 创建默认场景
            this.createDefaultScene();

            // 7. 更新 UI 状态
            this.uiManager.updateUIState(this.state);

            this.isInitialized = true;
            console.log('Unity 编辑器初始化完成');

            this.dispatchEvent('editorInitialized', { editor: this });

        } catch (error) {
            console.error('Unity 编辑器初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化编辑工具
     */
    initializeTools() {
        // 选择工具
        this.tools.select = {
            name: 'select',
            icon: '🖱️',
            shortcut: 'Q',
            activate: () => {
                console.log('选择工具已激活');
                this.setActiveTool('select');
            },
            deactivate: () => {
                console.log('选择工具已停用');
            },
            onMouseDown: (event) => {
                const objectId = this.renderer.selectObjectAtMouse(event.clientX, event.clientY);
                if (objectId) {
                    this.state.selectedObjects.add(objectId);
                    this.uiManager.updateSelectionUI(this.state.selectedObjects);
                } else {
                    this.clearSelection();
                }
            },
            onMouseMove: (event) => {
                // 选择工具的鼠标移动处理
            },
            onMouseUp: (event) => {
                // 选择工具的鼠标释放处理
            }
        };

        // 移动工具
        this.tools.move = {
            name: 'move',
            icon: '↔️',
            shortcut: 'W',
            activate: () => {
                console.log('移动工具已激活');
                this.setActiveTool('move');
            },
            deactivate: () => {
                console.log('移动工具已停用');
            },
            onMouseDown: (event) => {
                // 开始移动选中的对象
                this.startObjectManipulation('move', event);
            },
            onMouseMove: (event) => {
                // 更新对象位置
                this.updateObjectManipulation(event);
            },
            onMouseUp: (event) => {
                // 结束移动操作
                this.finishObjectManipulation();
            }
        };

        // 旋转工具
        this.tools.rotate = {
            name: 'rotate',
            icon: '🔄',
            shortcut: 'E',
            activate: () => {
                console.log('旋转工具已激活');
                this.setActiveTool('rotate');
            },
            deactivate: () => {
                console.log('旋转工具已停用');
            },
            onMouseDown: (event) => {
                // 开始旋转选中的对象
                this.startObjectManipulation('rotate', event);
            },
            onMouseMove: (event) => {
                // 更新对象旋转
                this.updateObjectManipulation(event);
            },
            onMouseUp: (event) => {
                // 结束旋转操作
                this.finishObjectManipulation();
            }
        };

        // 缩放工具
        this.tools.scale = {
            name: 'scale',
            icon: '📏',
            shortcut: 'R',
            activate: () => {
                console.log('缩放工具已激活');
                this.setActiveTool('scale');
            },
            deactivate: () => {
                console.log('缩放工具已停用');
            },
            onMouseDown: (event) => {
                // 开始缩放选中的对象
                this.startObjectManipulation('scale', event);
            },
            onMouseMove: (event) => {
                // 更新对象缩放
                this.updateObjectManipulation(event);
            },
            onMouseUp: (event) => {
                // 结束缩放操作
                this.finishObjectManipulation();
            }
        };

        // 激活默认工具
        this.tools.select.activate();
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 渲染器事件
        this.renderer.addEventListener('objectAdded', (data) => {
            this.onObjectAdded(data);
        });

        this.renderer.addEventListener('objectRemoved', (data) => {
            this.onObjectRemoved(data);
        });

        this.renderer.addEventListener('objectSelected', (data) => {
            this.onObjectSelected(data);
        });

        this.renderer.addEventListener('selectionCleared', () => {
            this.onSelectionCleared();
        });

        this.renderer.addEventListener('objectTransformUpdated', (data) => {
            this.onObjectTransformUpdated(data);
        });

        this.renderer.addEventListener('objectMaterialUpdated', (data) => {
            this.onObjectMaterialUpdated(data);
        });

        // 键盘事件
        document.addEventListener('keydown', (event) => {
            this.onKeyDown(event);
        });

        // 窗口大小调整事件
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }

    /**
     * 创建默认场景
     */
    createDefaultScene() {
        console.log('创建默认场景...');

        // 创建立方体
        const cubeId = this.generateUUID();
        const cubeData = {
            id: cubeId,
            name: '立方体',
            type: 'cube',
            geometry: {
                type: 'cube',
                options: { width: 2, height: 2, depth: 2 }
            },
            material: {
                type: 'standard',
                options: { color: 0x2196f3, metalness: 0.5, roughness: 0.5 }
            },
            position: { x: -3, y: 1, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            selectable: true
        };

        // 创建球体
        const sphereId = this.generateUUID();
        const sphereData = {
            id: sphereId,
            name: '球体',
            type: 'sphere',
            geometry: {
                type: 'sphere',
                options: { radius: 1.5 }
            },
            material: {
                type: 'standard',
                options: { color: 0xf44336, metalness: 0.3, roughness: 0.7 }
            },
            position: { x: 0, y: 1.5, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            selectable: true
        };

        // 创建圆柱体
        const cylinderId = this.generateUUID();
        const cylinderData = {
            id: cylinderId,
            name: '圆柱体',
            type: 'cylinder',
            geometry: {
                type: 'cylinder',
                options: { radiusTop: 1, radiusBottom: 1, height: 3 }
            },
            material: {
                type: 'standard',
                options: { color: 0x4caf50, metalness: 0.8, roughness: 0.2 }
            },
            position: { x: 3, y: 1.5, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            selectable: true
        };

        // 添加到场景
        this.addObjectToScene(cubeData);
        this.addObjectToScene(sphereData);
        this.addObjectToScene(cylinderData);

        // 更新场景对象列表
        this.state.scene.objects = [cubeData, sphereData, cylinderData];

        console.log('默认场景创建完成');
    }

    /**
     * 添加对象到场景
     */
    addObjectToScene(objectData) {
        try {
            // 添加到渲染器
            const mesh = this.renderer.addObject(objectData);

            // 添加到场景数据
            this.state.scene.objects.push(objectData);

            // 记录操作历史
            this.recordHistory('addObject', {
                objectId: objectData.id,
                objectData: objectData
            });

            // 更新 UI
            this.uiManager.addObjectToHierarchy(objectData);
            this.uiManager.updateObjectCount(this.state.scene.objects.length);

            // 触发事件
            this.dispatchEvent('objectAddedToScene', { objectData, mesh });

            console.log(`对象已添加到场景: ${objectData.name} (${objectData.id})`);

            return objectData.id;

        } catch (error) {
            console.error('添加对象到场景失败:', error);
            throw error;
        }
    }

    /**
     * 从场景中移除对象
     */
    removeObjectFromScene(objectId) {
        try {
            // 从渲染器中移除
            const removed = this.renderer.removeObject(objectId);
            if (!removed) {
                console.warn(`对象不存在: ${objectId}`);
                return false;
            }

            // 从场景数据中移除
            this.state.scene.objects = this.state.scene.objects.filter(obj => obj.id !== objectId);

            // 从选中集合中移除
            this.state.selectedObjects.delete(objectId);

            // 记录操作历史
            this.recordHistory('removeObject', { objectId });

            // 更新 UI
            this.uiManager.removeObjectFromHierarchy(objectId);
            this.uiManager.updateObjectCount(this.state.scene.objects.length);
            this.uiManager.updateSelectionUI(this.state.selectedObjects);

            // 触发事件
            this.dispatchEvent('objectRemovedFromScene', { objectId });

            console.log(`对象已从场景中移除: ${objectId}`);

            return true;

        } catch (error) {
            console.error('从场景中移除对象失败:', error);
            return false;
        }
    }

    /**
     * 选择对象
     */
    selectObject(objectId, addToSelection = false) {
        try {
            const selected = this.renderer.selectObject(objectId, addToSelection);
            if (selected) {
                if (!addToSelection) {
                    this.state.selectedObjects.clear();
                }
                this.state.selectedObjects.add(objectId);

                // 更新 UI
                this.uiManager.updateSelectionUI(this.state.selectedObjects);

                // 更新属性面板
                const objectData = this.state.scene.objects.find(obj => obj.id === objectId);
                if (objectData) {
                    this.uiManager.updateInspector(objectData);
                }

                this.dispatchEvent('objectSelectedInEditor', { objectId });
            }

            return selected;

        } catch (error) {
            console.error('选择对象失败:', error);
            return false;
        }
    }

    /**
     * 清除选择
     */
    clearSelection() {
        this.renderer.clearSelection();
        this.state.selectedObjects.clear();
        this.uiManager.updateSelectionUI(this.state.selectedObjects);
        this.uiManager.clearInspector();
        this.dispatchEvent('selectionClearedInEditor');
    }

    /**
     * 设置活动工具
     */
    setActiveTool(toolName) {
        if (!this.tools[toolName]) {
            console.error(`未知工具: ${toolName}`);
            return;
        }

        // 停用当前工具
        if (this.state.activeTool && this.tools[this.state.activeTool]) {
            this.tools[this.state.activeTool].deactivate();
        }

        // 激活新工具
        this.state.activeTool = toolName;
        this.tools[toolName].activate();

        // 更新 UI
        this.uiManager.updateActiveTool(toolName);

        this.dispatchEvent('toolChanged', { toolName });
    }

    /**
     * 开始对象操作（移动、旋转、缩放）
     */
    startObjectManipulation(operationType, mouseEvent) {
        if (this.state.selectedObjects.size === 0) return;

        this.manipulationState = {
            type: operationType,
            startMouseX: mouseEvent.clientX,
            startMouseY: mouseEvent.clientY,
            originalTransforms: new Map()
        };

        // 保存原始变换
        for (const objectId of this.state.selectedObjects) {
            const object = this.renderer.objects.get(objectId);
            if (object) {
                this.manipulationState.originalTransforms.set(objectId, {
                    position: object.position.clone(),
                    rotation: object.rotation.clone(),
                    scale: object.scale.clone()
                });
            }
        }

        this.dispatchEvent('manipulationStarted', { operationType });
    }

    /**
     * 更新对象操作
     */
    updateObjectManipulation(mouseEvent) {
        if (!this.manipulationState) return;

        const deltaX = mouseEvent.clientX - this.manipulationState.startMouseX;
        const deltaY = mouseEvent.clientY - this.manipulationState.startMouseY;

        // 根据操作类型计算变换
        for (const objectId of this.state.selectedObjects) {
            const object = this.renderer.objects.get(objectId);
            const original = this.manipulationState.originalTransforms.get(objectId);

            if (!object || !original) continue;

            switch (this.manipulationState.type) {
                case 'move':
                    // 移动对象
                    const moveSpeed = 0.01;
                    const moveDelta = new THREE.Vector3(deltaX * moveSpeed, -deltaY * moveSpeed, 0);

                    // 转换为世界空间移动
                    moveDelta.applyQuaternion(this.renderer.camera.quaternion);

                    object.position.copy(original.position).add(moveDelta);
                    break;

                case 'rotate':
                    // 旋转对象
                    const rotateSpeed = 0.5;
                    object.rotation.x = original.rotation.x + deltaY * rotateSpeed * Math.PI / 180;
                    object.rotation.y = original.rotation.y + deltaX * rotateSpeed * Math.PI / 180;
                    object.rotation.z = original.rotation.z;
                    break;

                case 'scale':
                    // 缩放对象
                    const scaleSpeed = 0.01;
                    const scaleDelta = 1 + (deltaX + deltaY) * scaleSpeed;
                    object.scale.x = original.scale.x * scaleDelta;
                    object.scale.y = original.scale.y * scaleDelta;
                    object.scale.z = original.scale.z * scaleDelta;
                    break;
            }
        }

        // 更新属性面板
        this.updateSelectedObjectsProperties();
    }

    /**
     * 结束对象操作
     */
    finishObjectManipulation() {
        if (!this.manipulationState) return;

        // 记录操作历史
        const finalTransforms = new Map();
        for (const objectId of this.state.selectedObjects) {
            const object = this.renderer.objects.get(objectId);
            if (object) {
                finalTransforms.set(objectId, {
                    position: object.position.clone(),
                    rotation: object.rotation.clone(),
                    scale: object.scale.clone()
                });
            }
        }

        this.recordHistory('transformObjects', {
            operation: this.manipulationState.type,
            objectIds: Array.from(this.state.selectedObjects),
            originalTransforms: this.manipulationState.originalTransforms,
            finalTransforms: finalTransforms
        });

        this.manipulationState = null;
        this.dispatchEvent('manipulationFinished');
    }

    /**
     * 更新选中对象的属性
     */
    updateSelectedObjectsProperties() {
        if (this.state.selectedObjects.size === 1) {
            const objectId = Array.from(this.state.selectedObjects)[0];
            const object = this.renderer.objects.get(objectId);
            if (object) {
                const objectData = this.getObjectData(objectId);
                if (objectData) {
                    // 更新位置
                    objectData.position = {
                        x: object.position.x,
                        y: object.position.y,
                        z: object.position.z
                    };

                    // 更新旋转（转换为度数）
                    objectData.rotation = {
                        x: object.rotation.x * 180 / Math.PI,
                        y: object.rotation.y * 180 / Math.PI,
                        z: object.rotation.z * 180 / Math.PI
                    };

                    // 更新缩放
                    objectData.scale = {
                        x: object.scale.x,
                        y: object.scale.y,
                        z: object.scale.z
                    };

                    // 更新 UI
                    this.uiManager.updateInspector(objectData);
                }
            }
        }
    }

    /**
     * 获取对象数据
     */
    getObjectData(objectId) {
        return this.state.scene.objects.find(obj => obj.id === objectId);
    }

    /**
     * 记录操作历史
     */
    recordHistory(action, data) {
        if (!this.state.history.isRecording) return;

        const historyEntry = {
            action,
            data,
            timestamp: Date.now()
        };

        this.state.history.undoStack.push(historyEntry);

        // 限制历史记录数量
        if (this.state.history.undoStack.length > this.state.history.maxSteps) {
            this.state.history.undoStack.shift();
        }

        // 清空重做栈
        this.state.history.redoStack = [];

        // 更新 UI
        this.uiManager.updateHistoryButtons(
            this.state.history.undoStack.length > 0,
            this.state.history.redoStack.length > 0
        );
    }

    /**
     * 撤销操作
     */
    undo() {
        if (this.state.history.undoStack.length === 0) return;

        const entry = this.state.history.undoStack.pop();
        this.state.history.redoStack.push(entry);

        // 执行撤销操作
        this.applyHistoryAction(entry, true);

        // 更新 UI
        this.uiManager.updateHistoryButtons(
            this.state.history.undoStack.length > 0,
            this.state.history.redoStack.length > 0
        );

        this.dispatchEvent('historyChanged', { action: 'undo', entry });
    }

    /**
     * 重做操作
     */
    redo() {
        if (this.state.history.redoStack.length === 0) return;

        const entry = this.state.history.redoStack.pop();
        this.state.history.undoStack.push(entry);

        // 执行重做操作
        this.applyHistoryAction(entry, false);

        // 更新 UI
        this.uiManager.updateHistoryButtons(
            this.state.history.undoStack.length > 0,
            this.state.history.redoStack.length > 0
        );

        this.dispatchEvent('historyChanged', { action: 'redo', entry });
    }

    /**
     * 应用历史操作
     */
    applyHistoryAction(entry, isUndo) {
        switch (entry.action) {
            case 'addObject':
                if (isUndo) {
                    // 撤销添加：移除对象
                    this.removeObjectFromScene(entry.data.objectId);
                } else {
                    // 重做添加：重新添加对象
                    this.addObjectToScene(entry.data.objectData);
                }
                break;

            case 'removeObject':
                if (isUndo) {
                    // 撤销移除：重新添加对象（需要从历史中获取对象数据）
                    // 注意：这里需要更复杂的实现来恢复完整的对象数据
                    console.warn('撤销移除对象功能需要更完整的实现');
                } else {
                    // 重做移除：再次移除对象
                    this.removeObjectFromScene(entry.data.objectId);
                }
                break;

            case 'transformObjects':
                // 应用变换
                const transforms = isUndo ? entry.data.originalTransforms : entry.data.finalTransforms;

                for (const objectId of entry.data.objectIds) {
                    const transform = transforms.get(objectId);
                    if (transform) {
                        const object = this.renderer.objects.get(objectId);
                        if (object) {
                            object.position.copy(transform.position);
                            object.rotation.copy(transform.rotation);
                            object.scale.copy(transform.scale);
                        }
                    }
                }
                break;

            default:
                console.warn(`未知的历史操作: ${entry.action}`);
        }
    }

    /**
     * 生成 UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 事件处理函数
     */
    onObjectAdded(data) {
        // 对象添加到渲染器时的处理
        console.log(`渲染器添加了对象: ${data.objectData.name}`);
    }

    onObjectRemoved(data) {
        // 对象从渲染器移除时的处理
        console.log(`渲染器移除了对象: ${data.objectId}`);
    }

    onObjectSelected(data) {
        // 对象在渲染器中被选中时的处理
        console.log(`渲染器选中了对象: ${data.objectId}`);
    }

    onSelectionCleared() {
        // 渲染器清除选择时的处理
        console.log('渲染器清除了选择');
    }

    onObjectTransformUpdated(data) {
        // 对象变换更新时的处理
        console.log(`对象变换已更新: ${data.objectId}`);
    }

    onObjectMaterialUpdated(data) {
        // 对象材质更新时的处理
        console.log(`对象材质已更新: ${data.objectId}`);
    }

    onKeyDown(event) {
        // 处理键盘快捷键

        // 防止在输入框中触发快捷键
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        // 工具快捷键
        if (!event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
            switch (event.key.toLowerCase()) {
                case 'q':
                    event.preventDefault();
                    this.setActiveTool('select');
                    break;
                case 'w':
                    event.preventDefault();
                    this.setActiveTool('move');
                    break;
                case 'e':
                    event.preventDefault();
                    this.setActiveTool('rotate');
                    break;
                case 'r':
                    event.preventDefault();
                    this.setActiveTool('scale');
                    break;
                case 'delete':
                case 'backspace':
                    event.preventDefault();
                    this.deleteSelectedObjects();
                    break;
                case 'd':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.duplicateSelectedObjects();
                    }
                    break;
            }
        }

        // 功能快捷键
        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case 'z':
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 'y':
                    event.preventDefault();
                    this.redo();
                    break;
                case 's':
                    event.preventDefault();
                    this.saveScene();
                    break;
                case 'n':
                    event.preventDefault();
                    this.newScene();
                    break;
                case 'o':
                    event.preventDefault();
                    this.openScene();
                    break;
            }
        }
    }

    onWindowResize() {
        // 窗口大小调整时的处理
        this.renderer.onWindowResize();
        this.uiManager.onWindowResize();
    }

    /**
     * 删除选中对象
     */
    deleteSelectedObjects() {
        if (this.state.selectedObjects.size === 0) return;

        // 确认删除
        if (!confirm(`确定要删除选中的 ${this.state.selectedObjects.size} 个对象吗？`)) {
            return;
        }

        // 复制选中对象ID列表（因为删除过程中会修改集合）
        const objectsToDelete = Array.from(this.state.selectedObjects);

        // 批量删除
        for (const objectId of objectsToDelete) {
            this.removeObjectFromScene(objectId);
        }

        console.log(`已删除 ${objectsToDelete.length} 个对象`);
    }

    /**
     * 复制选中对象
     */
    duplicateSelectedObjects() {
        if (this.state.selectedObjects.size === 0) return;

        const newObjects = [];

        for (const objectId of this.state.selectedObjects) {
            const originalData = this.getObjectData(objectId);
            if (!originalData) continue;

            // 创建副本数据
            const duplicateData = JSON.parse(JSON.stringify(originalData));
            duplicateData.id = this.generateUUID();
            duplicateData.name = `${originalData.name} 副本`;

            // 稍微偏移位置，避免重叠
            duplicateData.position.x += 1;
            duplicateData.position.z += 1;

            // 添加到场景
            this.addObjectToScene(duplicateData);
            newObjects.push(duplicateData.id);
        }

        // 选择新创建的对象
        this.clearSelection();
        for (const objectId of newObjects) {
            this.selectObject(objectId, true);
        }

        console.log(`已复制 ${newObjects.length} 个对象`);
    }

    /**
     * 新建场景
     */
    newScene() {
        if (!confirm('确定要创建新场景吗？当前场景的未保存更改将会丢失。')) {
            return;
        }

        // 清理当前场景
        this.clearScene();

        // 创建新场景
        this.state.scene = {
            id: this.generateUUID(),
            name: '未命名场景',
            version: '1.0.0',
            objects: [],
            materials: [],
            lights: [],
            camera: {
                position: { x: 0, y: 5, z: 10 },
                target: { x: 0, y: 0, z: 0 },
                fov: 60
            },
            settings: {
                backgroundColor: '#1a1a1a',
                gridEnabled: true,
                gridSize: 1,
                axesEnabled: true,
                shadowsEnabled: true,
                physicsEnabled: false
            }
        };

        // 重置历史
        this.state.history.undoStack = [];
        this.state.history.redoStack = [];

        // 更新 UI
        this.uiManager.updateSceneInfo(this.state.scene);
        this.uiManager.updateHistoryButtons(false, false);

        console.log('已创建新场景');
        this.dispatchEvent('sceneCreated', { scene: this.state.scene });
    }

    /**
     * 清理场景
     */
    clearScene() {
        // 移除所有对象
        const objectIds = Array.from(this.renderer.objects.keys());
        for (const objectId of objectIds) {
            this.renderer.removeObject(objectId);
        }

        // 清空场景数据
        this.state.scene.objects = [];
        this.state.selectedObjects.clear();

        // 更新 UI
        this.uiManager.clearHierarchy();
        this.uiManager.updateObjectCount(0);
        this.uiManager.clearInspector();
        this.uiManager.updateSelectionUI(new Set());
    }

    /**
     * 保存场景
     */
    saveScene() {
        try {
            // 准备场景数据
            const sceneData = {
                ...this.state.scene,
                // 更新对象变换数据
                objects: this.state.scene.objects.map(obj => {
                    const mesh = this.renderer.objects.get(obj.id);
                    if (mesh) {
                        return {
                            ...obj,
                            position: {
                                x: mesh.position.x,
                                y: mesh.position.y,
                                z: mesh.position.z
                            },
                            rotation: {
                                x: mesh.rotation.x * 180 / Math.PI,
                                y: mesh.rotation.y * 180 / Math.PI,
                                z: mesh.rotation.z * 180 / Math.PI
                            },
                            scale: {
                                x: mesh.scale.x,
                                y: mesh.scale.y,
                                z: mesh.scale.z
                            }
                        };
                    }
                    return obj;
                })
            };

            // 转换为 JSON
            const jsonData = JSON.stringify(sceneData, null, 2);

            // 创建下载链接
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${sceneData.name.replace(/\s+/g, '_')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('场景已保存:', sceneData.name);
            this.uiManager.showStatusMessage(`场景 "${sceneData.name}" 已保存`, 'success');

            this.dispatchEvent('sceneSaved', { sceneData });

        } catch (error) {
            console.error('保存场景失败:', error);
            this.uiManager.showStatusMessage('保存场景失败', 'error');
        }
    }

    /**
     * 打开场景
     */
    openScene() {
        // 显示导入模态框
        this.uiManager.showImportModal();
    }

    /**
     * 导出场景
     */
    exportScene() {
        // 显示导出模态框
        this.uiManager.showExportModal();
    }

    /**
     * 事件系统
     */
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
     * 获取编辑器状态
     */
    getState() {
        return this.state;
    }

    /**
     * 获取渲染器
     */
    getRenderer() {
        return this.renderer;
    }

    /**
     * 获取物理引擎
     */
    getPhysicsEngine() {
        return this.physicsEngine;
    }

    /**
     * 获取 UI 管理器
     */
    getUIManager() {
        return this.uiManager;
    }

    /**
     * 清理编辑器资源
     */
    dispose() {
        // 清理渲染器
        if (this.renderer) {
            this.renderer.dispose();
        }

        // 清理物理引擎
        if (this.physicsEngine) {
            this.physicsEngine.dispose();
        }

        // 清理 UI 管理器
        if (this.uiManager) {
            this.uiManager.dispose();
        }

        // 移除事件监听器
        document.removeEventListener('keydown', (event) => this.onKeyDown(event));
        window.removeEventListener('resize', () => this.onWindowResize());

        // 清空事件监听器
        this.eventListeners.clear();

        this.isInitialized = false;
        console.log('Unity 编辑器已清理');
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnityEditor;
}

