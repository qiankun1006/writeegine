/**
 * 3D 射击编辑器 - 射线检测工具
 * 用于 3D 空间中的拾取、检测、瞄准线绘制等功能
 */

class RaycastingTool {
    constructor(camera, scene, domElement) {
        this.camera = camera;
        this.scene = scene;
        this.domElement = domElement;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.raycasterParams = {
            far: 1000,
            near: 0.1
        };

        // 交互对象集合
        this.interactableObjects = [];

        // 选中的对象
        this.selectedObject = null;
        this.hoveredObject = null;

        // 射线可视化
        this.rayLine = null;
        this.showRay = false;

        // 事件监听器
        this.mouseMoveHandler = null;
        this.mouseClickHandler = null;

        // 回调函数
        this.onObjectSelected = null;
        this.onObjectHovered = null;
        this.onRaycastHit = null;

        console.log('%c🎯 射线检测工具已初始化', 'color: #ff9800');
    }

    /**
     * 设置可交互对象
     */
    setInteractableObjects(objects) {
        this.interactableObjects = Array.isArray(objects) ? objects : [objects];
    }

    /**
     * 添加可交互对象
     */
    addInteractableObject(object) {
        if (this.interactableObjects.indexOf(object) === -1) {
            this.interactableObjects.push(object);
        }
    }

    /**
     * 移除可交互对象
     */
    removeInteractableObject(object) {
        const index = this.interactableObjects.indexOf(object);
        if (index !== -1) {
            this.interactableObjects.splice(index, 1);
        }
    }

    /**
     * 清除所有可交互对象
     */
    clearInteractableObjects() {
        this.interactableObjects = [];
    }

    /**
     * 启用鼠标交互
     */
    enableMouseInteraction() {
        if (!this.mouseMoveHandler) {
            this.mouseMoveHandler = this.onMouseMove.bind(this);
            this.domElement.addEventListener('mousemove', this.mouseMoveHandler);
        }

        if (!this.mouseClickHandler) {
            this.mouseClickHandler = this.onMouseClick.bind(this);
            this.domElement.addEventListener('click', this.mouseClickHandler);
        }
    }

    /**
     * 禁用鼠标交互
     */
    disableMouseInteraction() {
        if (this.mouseMoveHandler) {
            this.domElement.removeEventListener('mousemove', this.mouseMoveHandler);
            this.mouseMoveHandler = null;
        }

        if (this.mouseClickHandler) {
            this.domElement.removeEventListener('click', this.mouseClickHandler);
            this.mouseClickHandler = null;
        }
    }

    /**
     * 鼠标移动事件
     */
    onMouseMove(event) {
        // 计算鼠标位置（归一化设备坐标）
        const rect = this.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // 射线检测
        const intersects = this.castRay();

        // 处理悬停对象
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (this.hoveredObject !== object) {
                this.hoveredObject = object;
                if (this.onObjectHovered) {
                    this.onObjectHovered(object, intersects[0]);
                }
            }
        } else if (this.hoveredObject) {
            this.hoveredObject = null;
            if (this.onObjectHovered) {
                this.onObjectHovered(null, null);
            }
        }

        // 更新射线可视化
        if (this.showRay) {
            this.updateRayVisualization();
        }
    }

    /**
     * 鼠标点击事件
     */
    onMouseClick(event) {
        const intersects = this.castRay();

        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.selectedObject = object;

            console.log(`%c🎯 选中对象: ${object.name}`, 'color: #4caf50');

            if (this.onObjectSelected) {
                this.onObjectSelected(object, intersects[0]);
            }
        } else {
            this.selectedObject = null;

            if (this.onObjectSelected) {
                this.onObjectSelected(null, null);
            }
        }
    }

    /**
     * 执行射线检测
     */
    castRay(origin = null, direction = null) {
        // 使用指定的原点和方向，或使用鼠标位置
        if (origin && direction) {
            this.raycaster.set(origin, direction);
        } else {
            this.raycaster.setFromCamera(this.mouse, this.camera);
        }

        // 设置射线参数
        this.raycaster.far = this.raycasterParams.far;
        this.raycaster.near = this.raycasterParams.near;

        // 检测相交
        const intersects = this.raycaster.intersectObjects(this.interactableObjects, true);

        if (intersects.length > 0 && this.onRaycastHit) {
            this.onRaycastHit(intersects[0]);
        }

        return intersects;
    }

    /**
     * 从世界坐标发射射线
     */
    castRayFromPoint(origin, direction) {
        return this.castRay(origin, direction);
    }

    /**
     * 屏幕坐标转世界射线
     */
    screenPointToWorldRay(screenX, screenY) {
        const rect = this.domElement.getBoundingClientRect();
        const normalizedX = ((screenX - rect.left) / rect.width) * 2 - 1;
        const normalizedY = -((screenY - rect.top) / rect.height) * 2 + 1;

        const vector = new THREE.Vector3(normalizedX, normalizedY, 0.5);
        vector.unproject(this.camera);

        const origin = this.camera.position.clone();
        const direction = vector.sub(origin).normalize();

        return {
            origin: origin,
            direction: direction
        };
    }

    /**
     * 检测点是否在球体内
     */
    isPointInSphere(point, spherePosition, sphereRadius) {
        const distance = point.distanceTo(spherePosition);
        return distance <= sphereRadius;
    }

    /**
     * 检测球体相交
     */
    checkSphereIntersection(spherePosition, sphereRadius) {
        const intersects = this.castRay();

        for (let i = 0; i < intersects.length; i++) {
            const point = intersects[i].point;
            if (this.isPointInSphere(point, spherePosition, sphereRadius)) {
                return intersects[i];
            }
        }

        return null;
    }

    /**
     * 检测盒子相交
     */
    checkBoxIntersection(box) {
        const intersects = this.castRay();

        for (let i = 0; i < intersects.length; i++) {
            if (box.containsPoint(intersects[i].point)) {
                return intersects[i];
            }
        }

        return null;
    }

    /**
     * 计算射击轨迹
     */
    calculateTrajectory(startPosition, direction, maxDistance = 100, segments = 10) {
        const points = [];
        const segmentLength = maxDistance / segments;

        for (let i = 0; i <= segments; i++) {
            const distance = i * segmentLength;
            const point = startPosition.clone().add(direction.clone().multiplyScalar(distance));
            points.push(point);
        }

        return points;
    }

    /**
     * 获取射击范围内的所有对象
     */
    getObjectsInRange(centerPosition, radius) {
        const objectsInRange = [];

        this.interactableObjects.forEach(object => {
            const position = new THREE.Vector3();
            object.getWorldPosition(position);

            if (position.distanceTo(centerPosition) <= radius) {
                objectsInRange.push({
                    object: object,
                    distance: position.distanceTo(centerPosition)
                });
            }
        });

        // 按距离排序
        objectsInRange.sort((a, b) => a.distance - b.distance);

        return objectsInRange;
    }

    /**
     * 检测瞄准线（考虑重力下坠）
     */
    calculateAimPath(startPosition, initialVelocity, gravity = -9.8, duration = 2.0, steps = 50) {
        const points = [];
        const timeStep = duration / steps;

        for (let i = 0; i <= steps; i++) {
            const time = i * timeStep;
            const position = new THREE.Vector3();

            // 计算位置（考虑重力）
            position.x = startPosition.x + initialVelocity.x * time;
            position.y = startPosition.y + initialVelocity.y * time + 0.5 * gravity * time * time;
            position.z = startPosition.z + initialVelocity.z * time;

            points.push(position);
        }

        return points;
    }

    /**
     * 显示射线可视化
     */
    showRayVisualization(show = true) {
        this.showRay = show;

        if (show && !this.rayLine) {
            // 创建射线可视化线条
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(6); // 2 points * 3 coordinates
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const material = new THREE.LineBasicMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: 0.5,
                linewidth: 1
            });

            this.rayLine = new THREE.Line(geometry, material);
            this.scene.add(this.rayLine);
        } else if (!show && this.rayLine) {
            this.scene.remove(this.rayLine);
            this.rayLine = null;
        }
    }

    /**
     * 更新射线可视化
     */
    updateRayVisualization() {
        if (!this.rayLine || !this.showRay) return;

        // 获取射线起点和方向
        const ray = this.raycaster.ray;
        const intersects = this.castRay();

        let endPoint;
        if (intersects.length > 0) {
            endPoint = intersects[0].point;
        } else {
            endPoint = ray.origin.clone().add(ray.direction.clone().multiplyScalar(this.raycasterParams.far));
        }

        // 更新线条顶点
        const positions = this.rayLine.geometry.attributes.position.array;
        positions[0] = ray.origin.x;
        positions[1] = ray.origin.y;
        positions[2] = ray.origin.z;
        positions[3] = endPoint.x;
        positions[4] = endPoint.y;
        positions[5] = endPoint.z;

        this.rayLine.geometry.attributes.position.needsUpdate = true;
    }

    /**
     * 绘制轨迹线
     */
    drawTrajectoryLine(points, color = 0x00ff00, opacity = 0.5) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];

        points.forEach(point => {
            positions.push(point.x, point.y, point.z);
        });

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity,
            linewidth: 1
        });

        const line = new THREE.Line(geometry, material);
        line.name = 'TrajectoryLine';

        return line;
    }

    /**
     * 清除轨迹线
     */
    clearTrajectoryLines() {
        const lines = [];
        this.scene.traverse(object => {
            if (object.name === 'TrajectoryLine') {
                lines.push(object);
            }
        });

        lines.forEach(line => {
            this.scene.remove(line);
            line.geometry.dispose();
            line.material.dispose();
        });
    }

    /**
     * 获取选中的对象
     */
    getSelectedObject() {
        return this.selectedObject;
    }

    /**
     * 获取悬停的对象
     */
    getHoveredObject() {
        return this.hoveredObject;
    }

    /**
     * 清除选择
     */
    clearSelection() {
        this.selectedObject = null;
        this.hoveredObject = null;
    }

    /**
     * 获取鼠标在 3D 空间中的位置（在平面上）
     */
    getMousePositionOnPlane(planeNormal = new THREE.Vector3(0, 1, 0), planeConstant = 0) {
        const plane = new THREE.Plane(planeNormal, planeConstant);
        const intersects = this.castRay();

        if (intersects.length > 0) {
            return intersects[0].point;
        }

        // 如果没有相交对象，计算与平面的交点
        const intersection = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(plane, intersection);

        return intersection;
    }

    /**
     * 设置射线参数
     */
    setRaycasterParams(params) {
        Object.assign(this.raycasterParams, params);
    }

    /**
     * 获取射线信息
     */
    getRayInfo() {
        return {
            origin: this.raycaster.ray.origin.clone(),
            direction: this.raycaster.ray.direction.clone(),
            far: this.raycaster.far,
            near: this.raycaster.near,
            mousePosition: this.mouse.clone()
        };
    }

    /**
     * 销毁工具
     */
    dispose() {
        this.disableMouseInteraction();

        if (this.rayLine) {
            this.scene.remove(this.rayLine);
            this.rayLine.geometry.dispose();
            this.rayLine.material.dispose();
            this.rayLine = null;
        }

        this.clearTrajectoryLines();
        this.interactableObjects = [];
        this.selectedObject = null;
        this.hoveredObject = null;
    }
}

