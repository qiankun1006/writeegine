// 继续 UnityUI.js 的实现

    onMaterialPropertyChanged(property, value) {
        if (this.disablePropertyListeners) return;

        const selectedObjects = Array.from(this.state.selectedObjects);
        if (selectedObjects.length === 0) return;

        // 更新选中的对象材质属性
        selectedObjects.forEach(objectId => {
            this.editor.renderer.updateObjectMaterial(objectId, {
                [property]: value
            });
        });
    }

    onRigidbodyTypeChanged(type) {
        if (this.disablePropertyListeners) return;

        const selectedObjects = Array.from(this.state.selectedObjects);
        if (selectedObjects.length === 0) return;

        // 更新选中的对象刚体类型
        selectedObjects.forEach(objectId => {
            // 这里需要实现物理属性更新逻辑
            console.log(`更改对象 ${objectId} 的刚体类型为: ${type}`);
        });
    }

    onPhysicsPropertyChanged(property, value) {
        if (this.disablePropertyListeners) return;

        const selectedObjects = Array.from(this.state.selectedObjects);
        if (selectedObjects.length === 0) return;

        // 更新选中的对象物理属性
        selectedObjects.forEach(objectId => {
            // 这里需要实现物理属性更新逻辑
            console.log(`更改对象 ${objectId} 的 ${property} 为: ${value}`);
        });
    }

    onUniformScaleChanged(enabled) {
        if (this.disablePropertyListeners) return;

        // 更新等比缩放状态
        this.state.snapping.uniformScale = enabled;

        // 如果启用等比缩放且当前有选中对象，同步缩放值
        if (enabled && this.state.selectedObjects.size === 1) {
            const objectId = Array.from(this.state.selectedObjects)[0];
            const object = this.editor.renderer.objects.get(objectId);
            if (object) {
                const avgScale = (object.scale.x + object.scale.y + object.scale.z) / 3;
                this.elements.properties.scaleX.value = avgScale.toFixed(2);
                this.elements.properties.scaleY.value = avgScale.toFixed(2);
                this.elements.properties.scaleZ.value = avgScale.toFixed(2);

                this.onTransformPropertyChanged('scale', {
                    x: avgScale,
                    y: avgScale,
                    z: avgScale
                });
            }
        }
    }

    onAssetItemClicked(asset) {
        console.log('资源项被点击:', asset);

        // 根据资源类型执行不同操作
        switch (asset.category || asset.type) {
            case 'cube':
            case 'sphere':
            case 'cylinder':
            case 'plane':
            case 'cone':
            case 'torus':
                this.createObject(asset.type);
                break;

            case 'material':
                this.applyMaterialToSelection(asset);
                break;

            default:
                console.warn('未知的资源类型:', asset.type);
        }
    }

    onAssetDragStart(event, asset) {
        event.dataTransfer.setData('text/plain', JSON.stringify(asset));
        event.dataTransfer.effectAllowed = 'copy';

        console.log('开始拖拽资源:', asset.name);
    }

    onImportFormatSelected(format) {
        console.log('选择的导入格式:', format);

        // 显示文件输入容器
        const container = this.elements.modals.fileInputContainer;
        if (container) {
            container.style.display = 'block';
        }

        // 设置文件输入接受类型
        const fileInput = this.elements.modals.sceneFileInput;
        if (fileInput) {
            switch (format) {
                case 'json':
                    fileInput.accept = '.json';
                    break;
                case 'gltf':
                    fileInput.accept = '.gltf,.glb';
                    break;
                case 'obj':
                    fileInput.accept = '.obj';
                    break;
            }
        }
    }

    onSceneFileSelected(file) {
        if (!file) return;

        console.log('选择的场景文件:', file.name);

        // 根据文件类型处理导入
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target.result;

                if (file.name.endsWith('.json')) {
                    this.importJSONScene(content);
                } else if (file.name.endsWith('.gltf') || file.name.endsWith('.glb')) {
                    this.importGLTFScene(file);
                } else if (file.name.endsWith('.obj')) {
                    this.importOBJScene(content);
                } else {
                    throw new Error('不支持的文件格式');
                }

                this.hideImportModal();
                this.showStatusMessage(`场景 "${file.name}" 导入成功`, 'success');

            } catch (error) {
                console.error('导入场景失败:', error);
                this.showStatusMessage(`导入失败: ${error.message}`, 'error');
            }
        };

        reader.onerror = (error) => {
            console.error('读取文件失败:', error);
            this.showStatusMessage('读取文件失败', 'error');
        };

        if (file.name.endsWith('.json')) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    }

    onExportConfirmed() {
        try {
            // 获取导出设置
            const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'json';
            const includeTextures = document.getElementById('exportTextures')?.checked || false;
            const includeAnimations = document.getElementById('exportAnimations')?.checked || false;
            const includePhysics = document.getElementById('exportPhysics')?.checked || false;

            console.log('导出设置:', { format, includeTextures, includeAnimations, includePhysics });

            // 执行导出
            this.exportScene(format, {
                includeTextures,
                includeAnimations,
                includePhysics
            });

            this.hideExportModal();
            this.showStatusMessage('场景导出成功', 'success');

        } catch (error) {
            console.error('导出场景失败:', error);
            this.showStatusMessage(`导出失败: ${error.message}`, 'error');
        }
    }

    /**
     * 工具函数
     */

    createObject(type) {
        const objectId = this.editor.generateUUID();
        const objectName = this.getObjectName(type);

        const objectData = {
            id: objectId,
            name: objectName,
            type: type,
            geometry: {
                type: type,
                options: this.getDefaultGeometryOptions(type)
            },
            material: {
                type: 'standard',
                options: this.getDefaultMaterialOptions(type)
            },
            position: this.getDefaultPosition(),
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            selectable: true
        };

        this.editor.addObjectToScene(objectData);
        this.editor.selectObject(objectId);

        this.showStatusMessage(`已创建 ${objectName}`, 'success');
    }

    getObjectName(type) {
        const names = {
            cube: '立方体',
            sphere: '球体',
            cylinder: '圆柱体',
            plane: '平面',
            cone: '圆锥体',
            torus: '圆环'
        };
        return names[type] || '未知对象';
    }

    getObjectIcon(type) {
        const icons = {
            cube: '⬛',
            sphere: '⚪',
            cylinder: '🔘',
            plane: '⬜',
            cone: '🔺',
            torus: '⭕',
            light: '💡',
            camera: '📷'
        };
        return icons[type] || '📦';
    }

    getDefaultGeometryOptions(type) {
        const options = {
            cube: { width: 2, height: 2, depth: 2 },
            sphere: { radius: 1.5 },
            cylinder: { radiusTop: 1, radiusBottom: 1, height: 3 },
            plane: { width: 5, height: 5 },
            cone: { radius: 1, height: 3 },
            torus: { radius: 1.5, tube: 0.5 }
        };
        return options[type] || {};
    }

    getDefaultMaterialOptions(type) {
        const colors = {
            cube: 0x2196f3,    // 蓝色
            sphere: 0xf44336,  // 红色
            cylinder: 0x4caf50, // 绿色
            plane: 0x9c27b0,   // 紫色
            cone: 0xff9800,    // 橙色
            torus: 0x00bcd4    // 青色
        };

        return {
            color: colors[type] || 0xffffff,
            metalness: 0.5,
            roughness: 0.5
        };
    }

    getDefaultPosition() {
        // 在摄像机前方创建对象
        const camera = this.renderer?.camera;
        if (camera) {
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            direction.multiplyScalar(5); // 距离摄像机5个单位

            return {
                x: direction.x,
                y: Math.max(direction.y, 1), // 确保不低于地面
                z: direction.z
            };
        }

        // 默认位置
        return { x: 0, y: 2, z: 0 };
    }

    threeColorToHex(color) {
        if (color instanceof THREE.Color) {
            return '#' + color.getHexString();
        } else if (typeof color === 'number') {
            return '#' + color.toString(16).padStart(6, '0');
        }
        return '#ffffff';
    }

    setCameraView(view) {
        const camera = this.renderer?.camera;
        if (!camera) return;

        switch (view) {
            case 'perspective':
                camera.position.set(0, 5, 10);
                camera.lookAt(0, 0, 0);
                break;
            case 'top':
                camera.position.set(0, 10, 0);
                camera.lookAt(0, 0, 0);
                camera.up.set(0, 0, -1);
                break;
            case 'front':
                camera.position.set(0, 0, 10);
                camera.lookAt(0, 0, 0);
                break;
            case 'side':
                camera.position.set(10, 0, 0);
                camera.lookAt(0, 0, 0);
                break;
        }

        // 更新轨道控制器
        if (this.renderer.controls) {
            this.renderer.controls.update();
        }

        this.state.viewport.cameraMode = view;
        this.showStatusMessage(`切换到${view}视图`, 'info');
    }

    toggleGrid() {
        const visible = !this.state.viewport.gridVisible;
        this.state.viewport.gridVisible = visible;
        this.renderer.toggleGrid(visible);
        this.updateViewControls();
        this.showStatusMessage(visible ? '显示网格' : '隐藏网格', 'info');
    }

    toggleAxes() {
        const visible = !this.state.viewport.axesVisible;
        this.state.viewport.axesVisible = visible;
        this.renderer.toggleAxes(visible);
        this.updateViewControls();
        this.showStatusMessage(visible ? '显示坐标轴' : '隐藏坐标轴', 'info');
    }

    toggleWireframe() {
        const enabled = !this.state.viewport.wireframeMode;
        this.state.viewport.wireframeMode = enabled;
        this.renderer.toggleWireframe(enabled);
        this.updateViewControls();
        this.showStatusMessage(enabled ? '线框模式' : '实体模式', 'info');
    }

    toggleShadows() {
        const enabled = !this.state.scene.settings.shadowsEnabled;
        this.state.scene.settings.shadowsEnabled = enabled;
        this.renderer.toggleShadows(enabled);
        this.updateViewControls();
        this.showStatusMessage(enabled ? '启用阴影' : '禁用阴影', 'info');
    }

    togglePhysics() {
        const enabled = !this.state.physics.enabled;
        this.state.physics.enabled = enabled;

        if (this.editor.getPhysicsEngine()) {
            if (enabled) {
                this.editor.getPhysicsEngine().enable();
            } else {
                this.editor.getPhysicsEngine().disable();
            }
        }

        this.updateStatusBar();
        this.showStatusMessage(enabled ? '启用物理' : '禁用物理', 'info');
    }

    togglePhysicsSimulation() {
        const simulating = !this.state.physics.simulating;
        this.state.physics.simulating = simulating;

        if (this.editor.getPhysicsEngine()) {
            if (simulating) {
                this.editor.getPhysicsEngine().startSimulation();
            } else {
                this.editor.getPhysicsEngine().stopSimulation();
            }
        }

        this.showStatusMessage(simulating ? '开始物理模拟' : '停止物理模拟', 'info');
    }

    resetPhysics() {
        if (this.editor.getPhysicsEngine()) {
            this.editor.getPhysicsEngine().reset();
        }

        this.showStatusMessage('物理已重置', 'info');
    }

    showCreateObjectMenu() {
        // 显示创建对象菜单
        console.log('显示创建对象菜单');
        // 这里可以实现一个下拉菜单或模态框
    }

    resetSelectedObjectProperties() {
        const selectedObjects = Array.from(this.state.selectedObjects);
        if (selectedObjects.length === 0) return;

        // 重置选中对象的变换属性
        selectedObjects.forEach(objectId => {
            this.editor.renderer.updateObjectTransform(objectId, {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 }
            });
        });

        // 更新属性面板
        if (selectedObjects.length === 1) {
            const objectId = selectedObjects[0];
            const objectData = this.editor.getObjectData(objectId);
            if (objectData) {
                this.updateInspector(objectData);
            }
        }

        this.showStatusMessage('已重置对象属性', 'info');
    }

    importJSONScene(jsonContent) {
        try {
            const sceneData = JSON.parse(jsonContent);
            console.log('导入 JSON 场景:', sceneData);

            // 清理当前场景
            this.editor.clearScene();

            // 应用导入的场景数据
            this.editor.state.scene = sceneData;

            // 重新创建对象
            sceneData.objects.forEach(objectData => {
                this.editor.addObjectToScene(objectData);
            });

            // 更新 UI
            this.updateSceneInfo(sceneData);

        } catch (error) {
            throw new Error(`解析 JSON 失败: ${error.message}`);
        }
    }

    importGLTFScene(file) {
        // GLTF 导入需要 Three.js 的 GLTFLoader
        console.log('导入 GLTF 场景:', file.name);
        this.showStatusMessage('GLTF 导入功能开发中', 'info');
    }

    importOBJScene(content) {
        // OBJ 导入需要 Three.js 的 OBJLoader
        console.log('导入 OBJ 场景');
        this.showStatusMessage('OBJ 导入功能开发中', 'info');
    }

    exportScene(format, options) {
        console.log(`导出场景为 ${format} 格式`, options);

        switch (format) {
            case 'json':
                this.editor.saveScene(); // 重用保存功能
                break;
            case 'gltf':
            case 'glb':
            case 'obj':
                this.showStatusMessage(`${format.toUpperCase()} 导出功能开发中`, 'info');
                break;
        }
    }

    applyMaterialToSelection(materialAsset) {
        const selectedObjects = Array.from(this.state.selectedObjects);
        if (selectedObjects.length === 0) {
            this.showStatusMessage('请先选择对象', 'warning');
            return;
        }

        // 应用材质到选中的对象
        selectedObjects.forEach(objectId => {
            this.editor.renderer.updateObjectMaterial(objectId, {
                color: new THREE.Color(materialAsset.color),
                metalness: materialAsset.metalness || 0.5,
                roughness: materialAsset.roughness || 0.5
            });
        });

        this.showStatusMessage(`已应用材质到 ${selectedObjects.length} 个对象`, 'success');
    }

    /**
     * 清理资源
     */
    dispose() {
        // 移除事件监听器
        // 这里需要移除所有添加的事件监听器

        // 清空元素缓存
        this.elements = {};

        this.isInitialized = false;
        console.log('Unity UI 管理器已清理');
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnityUI;
}

