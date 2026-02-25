/**
 * Unity 物理引擎模块
 * 基于 Ammo.js 的物理模拟
 * 注意：这是一个简化版本，完整的物理引擎集成需要更复杂的实现
 */

class UnityPhysics {
    constructor() {
        this.physicsWorld = null;
        this.objects = new Map(); // objectId -> physics body
        this.isInitialized = false;
        this.isSimulating = false;
        this.timeStep = 1 / 60; // 60 FPS
        this.maxSubSteps = 10;

        // 默认物理参数
        this.defaultParams = {
            gravity: { x: 0, y: -9.8, z: 0 },
            solverIterations: 10,
            allowSleep: true
        };

        console.log('Unity 物理引擎实例已创建');
    }

    /**
     * 初始化物理引擎
     */
    async initialize() {
        try {
            console.log('开始初始化物理引擎...');

            // 检查 Ammo.js 是否已加载
            if (typeof Ammo === 'undefined') {
                throw new Error('Ammo.js 库未加载，请检查 CDN 链接');
            }

            // 初始化 Ammo.js
            await Ammo();

            // 创建物理世界
            this.createPhysicsWorld();

            this.isInitialized = true;
            console.log('物理引擎初始化完成');

            return true;

        } catch (error) {
            console.error('物理引擎初始化失败:', error);
            throw error;
        }
    }

    /**
     * 创建物理世界
     */
    createPhysicsWorld() {
        try {
            // 创建碰撞配置
            const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();

            // 创建碰撞调度器
            const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);

            // 创建重叠对缓存
            const overlappingPairCache = new Ammo.btDbvtBroadphase();

            // 创建约束求解器
            const solver = new Ammo.btSequentialImpulseConstraintSolver();

            // 创建物理世界
            this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(
                dispatcher,
                overlappingPairCache,
                solver,
                collisionConfiguration
            );

            // 设置重力
            const gravity = new Ammo.btVector3(
                this.defaultParams.gravity.x,
                this.defaultParams.gravity.y,
                this.defaultParams.gravity.z
            );
            this.physicsWorld.setGravity(gravity);

            // 设置求解器迭代次数
            this.physicsWorld.getSolverInfo().set_m_numIterations(this.defaultParams.solverIterations);

            // 允许物体休眠
            this.physicsWorld.getDispatchInfo().set_m_enableSAT(this.defaultParams.allowSleep);

            console.log('物理世界创建完成');

        } catch (error) {
            console.error('创建物理世界失败:', error);
            throw error;
        }
    }

    /**
     * 启用物理引擎
     */
    enable() {
        if (!this.isInitialized) {
            console.warn('物理引擎未初始化，无法启用');
            return false;
        }

        this.isSimulating = true;
        console.log('物理引擎已启用');
        return true;
    }

    /**
     * 禁用物理引擎
     */
    disable() {
        this.isSimulating = false;
        console.log('物理引擎已禁用');
    }

    /**
     * 开始物理模拟
     */
    startSimulation() {
        if (!this.isInitialized) {
            console.warn('物理引擎未初始化，无法开始模拟');
            return;
        }

        this.isSimulating = true;
        console.log('物理模拟已开始');
    }

    /**
     * 停止物理模拟
     */
    stopSimulation() {
        this.isSimulating = false;
        console.log('物理模拟已停止');
    }

    /**
     * 重置物理模拟
     */
    reset() {
        // 重置所有物理物体的位置和速度
        for (const [objectId, body] of this.objects) {
            this.resetPhysicsBody(body);
        }

        console.log('物理模拟已重置');
    }

    /**
     * 重置物理物体
     */
    resetPhysicsBody(body) {
        if (!body) return;

        // 重置变换
        const transform = body.getWorldTransform();
        transform.setIdentity();
        body.setWorldTransform(transform);

        // 重置速度
        body.setLinearVelocity(new Ammo.btVector3(0, 0, 0));
        body.setAngularVelocity(new Ammo.btVector3(0, 0, 0));

        // 激活物体
        body.activate();
    }

    /**
     * 更新物理模拟
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        if (!this.isInitialized || !this.isSimulating || !this.physicsWorld) {
            return;
        }

        try {
            // 步进物理世界
            this.physicsWorld.stepSimulation(deltaTime, this.maxSubSteps, this.timeStep);

            // 更新 Three.js 对象的位置和旋转
            this.updateObjectTransforms();

        } catch (error) {
            console.error('物理模拟更新失败:', error);
        }
    }

    /**
     * 更新对象变换
     */
    updateObjectTransforms() {
        for (const [objectId, physicsData] of this.objects) {
            const { body, threeObject } = physicsData;

            if (!body || !threeObject) continue;

            // 获取物理变换
            const transform = body.getWorldTransform();
            const origin = transform.getOrigin();
            const rotation = transform.getRotation();

            // 更新 Three.js 对象位置
            threeObject.position.set(origin.x(), origin.y(), origin.z());

            // 更新 Three.js 对象旋转
            const quaternion = new THREE.Quaternion(
                rotation.x(),
                rotation.y(),
                rotation.z(),
                rotation.w()
            );
            threeObject.quaternion.copy(quaternion);
        }
    }

    /**
     * 添加物理物体
     * @param {string} objectId - 对象ID
     * @param {THREE.Object3D} threeObject - Three.js 对象
     * @param {Object} options - 物理选项
     */
    addPhysicsBody(objectId, threeObject, options = {}) {
        if (!this.isInitialized || !this.physicsWorld) {
            console.warn('物理引擎未初始化，无法添加物理物体');
            return null;
        }

        try {
            // 创建碰撞形状
            const shape = this.createCollisionShape(threeObject, options);
            if (!shape) {
                console.warn('无法为对象创建碰撞形状:', objectId);
                return null;
            }

            // 创建变换
            const transform = new Ammo.btTransform();
            transform.setIdentity();

            const position = threeObject.position;
            const quaternion = threeObject.quaternion;

            transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
            transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

            // 创建运动状态
            const motionState = new Ammo.btDefaultMotionState(transform);

            // 计算局部惯性
            const localInertia = new Ammo.btVector3(0, 0, 0);
            if (options.mass > 0) {
                shape.calculateLocalInertia(options.mass, localInertia);
            }

            // 创建刚体构造信息
            const rbInfo = new Ammo.btRigidBodyConstructionInfo(
                options.mass || 0,
                motionState,
                shape,
                localInertia
            );

            // 设置摩擦力和弹性
            rbInfo.set_m_friction(options.friction || 0.5);
            rbInfo.set_m_restitution(options.restitution || 0.3);

            // 创建刚体
            const body = new Ammo.btRigidBody(rbInfo);

            // 设置刚体类型
            if (options.mass === 0) {
                body.setCollisionFlags(body.getCollisionFlags() | Ammo.btCollisionObject.CF_STATIC_OBJECT);
            } else {
                body.setCollisionFlags(body.getCollisionFlags() | Ammo.btCollisionObject.CF_DYNAMIC_OBJECT);
            }

            // 添加到物理世界
            this.physicsWorld.addRigidBody(body);

            // 保存到映射
            this.objects.set(objectId, {
                body: body,
                threeObject: threeObject,
                shape: shape,
                motionState: motionState
            });

            console.log(`物理物体已添加: ${objectId}`);

            return body;

        } catch (error) {
            console.error('添加物理物体失败:', error);
            return null;
        }
    }

    /**
     * 创建碰撞形状
     */
    createCollisionShape(threeObject, options) {
        if (!threeObject.geometry) return null;

        const geometry = threeObject.geometry;
        const scale = threeObject.scale;

        try {
            // 根据几何体类型创建不同的碰撞形状
            if (geometry.type === 'BoxGeometry' || geometry.type === 'BoxBufferGeometry') {
                // 盒子碰撞体
                const params = geometry.parameters;
                const halfExtents = new Ammo.btVector3(
                    (params.width || 1) * scale.x / 2,
                    (params.height || 1) * scale.y / 2,
                    (params.depth || 1) * scale.z / 2
                );
                return new Ammo.btBoxShape(halfExtents);

            } else if (geometry.type === 'SphereGeometry' || geometry.type === 'SphereBufferGeometry') {
                // 球体碰撞体
                const params = geometry.parameters;
                const radius = (params.radius || 1) * Math.max(scale.x, scale.y, scale.z);
                return new Ammo.btSphereShape(radius);

            } else if (geometry.type === 'CylinderGeometry' || geometry.type === 'CylinderBufferGeometry') {
                // 圆柱体碰撞体
                const params = geometry.parameters;
                const halfExtents = new Ammo.btVector3(
                    (params.radiusTop || 1) * scale.x,
                    (params.height || 2) * scale.y / 2,
                    (params.radiusBottom || 1) * scale.z
                );
                return new Ammo.btCylinderShape(halfExtents);

            } else {
                // 对于其他几何体，使用凸包或三角形网格（简化版本使用包围盒）
                console.warn(`使用简化碰撞体代替: ${geometry.type}`);

                // 计算包围盒
                geometry.computeBoundingBox();
                const box = geometry.boundingBox;

                const size = new THREE.Vector3();
                box.getSize(size);

                const halfExtents = new Ammo.btVector3(
                    size.x * scale.x / 2,
                    size.y * scale.y / 2,
                    size.z * scale.z / 2
                );

                return new Ammo.btBoxShape(halfExtents);
            }

        } catch (error) {
            console.error('创建碰撞形状失败:', error);
            return null;
        }
    }

    /**
     * 移除物理物体
     */
    removePhysicsBody(objectId) {
        const physicsData = this.objects.get(objectId);
        if (!physicsData || !this.physicsWorld) return false;

        try {
            // 从物理世界中移除
            this.physicsWorld.removeRigidBody(physicsData.body);

            // 清理 Ammo.js 对象
            Ammo.destroy(physicsData.body);
            Ammo.destroy(physicsData.motionState);
            Ammo.destroy(physicsData.shape);

            // 从映射中移除
            this.objects.delete(objectId);

            console.log(`物理物体已移除: ${objectId}`);
            return true;

        } catch (error) {
            console.error('移除物理物体失败:', error);
            return false;
        }
    }

    /**
     * 更新物理物体属性
     */
    updatePhysicsBody(objectId, options) {
        const physicsData = this.objects.get(objectId);
        if (!physicsData || !physicsData.body) return false;

        const body = physicsData.body;

        try {
            // 更新质量
            if (options.mass !== undefined) {
                const motionState = body.getMotionState();
                const shape = body.getCollisionShape();
                const localInertia = new Ammo.btVector3(0, 0, 0);

                if (options.mass > 0) {
                    shape.calculateLocalInertia(options.mass, localInertia);
                    body.setMassProps(options.mass, localInertia);
                    body.setCollisionFlags(body.getCollisionFlags() & ~Ammo.btCollisionObject.CF_STATIC_OBJECT);
                    body.setCollisionFlags(body.getCollisionFlags() | Ammo.btCollisionObject.CF_DYNAMIC_OBJECT);
                } else {
                    body.setMassProps(0, localInertia);
                    body.setCollisionFlags(body.getCollisionFlags() | Ammo.btCollisionObject.CF_STATIC_OBJECT);
                    body.setCollisionFlags(body.getCollisionFlags() & ~Ammo.btCollisionObject.CF_DYNAMIC_OBJECT);
                }

                Ammo.destroy(localInertia);
            }

            // 更新摩擦力
            if (options.friction !== undefined) {
                body.setFriction(options.friction);
            }

            // 更新弹性
            if (options.restitution !== undefined) {
                body.setRestitution(options.restitution);
            }

            console.log(`物理物体已更新: ${objectId}`);
            return true;

        } catch (error) {
            console.error('更新物理物体失败:', error);
            return false;
        }
    }

    /**
     * 应用力到物理物体
     */
    applyForce(objectId, force, relativePosition = null) {
        const physicsData = this.objects.get(objectId);
        if (!physicsData || !physicsData.body) return false;

        const body = physicsData.body;

        try {
            const ammoForce = new Ammo.btVector3(force.x, force.y, force.z);

            if (relativePosition) {
                const ammoPosition = new Ammo.btVector3(
                    relativePosition.x,
                    relativePosition.y,
                    relativePosition.z
                );
                body.applyForce(ammoForce, ammoPosition);
                Ammo.destroy(ammoPosition);
            } else {
                body.applyCentralForce(ammoForce);
            }

            Ammo.destroy(ammoForce);
            body.activate();

            return true;

        } catch (error) {
            console.error('应用力失败:', error);
            return false;
        }
    }

    /**
     * 应用冲量到物理物体
     */
    applyImpulse(objectId, impulse, relativePosition = null) {
        const physicsData = this.objects.get(objectId);
        if (!physicsData || !physicsData.body) return false;

        const body = physicsData.body;

        try {
            const ammoImpulse = new Ammo.btVector3(impulse.x, impulse.y, impulse.z);

            if (relativePosition) {
                const ammoPosition = new Ammo.btVector3(
                    relativePosition.x,
                    relativePosition.y,
                    relativePosition.z
                );
                body.applyImpulse(ammoImpulse, ammoPosition);
                Ammo.destroy(ammoPosition);
            } else {
                body.applyCentralImpulse(ammoImpulse);
            }

            Ammo.destroy(ammoImpulse);
            body.activate();

            return true;

        } catch (error) {
            console.error('应用冲量失败:', error);
            return false;
        }
    }

    /**
     * 设置重力
     */
    setGravity(x, y, z) {
        if (!this.physicsWorld) return false;

        try {
            const gravity = new Ammo.btVector3(x, y, z);
            this.physicsWorld.setGravity(gravity);
            Ammo.destroy(gravity);

            this.defaultParams.gravity = { x, y, z };
            console.log(`重力已设置为: (${x}, ${y}, ${z})`);
            return true;

        } catch (error) {
            console.error('设置重力失败:', error);
            return false;
        }
    }

    /**
     * 获取物理世界状态
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            isSimulating: this.isSimulating,
            objectCount: this.objects.size,
            gravity: this.defaultParams.gravity
        };
    }

    /**
     * 清理物理引擎资源
     */
    dispose() {
        // 停止模拟
        this.stopSimulation();

        // 移除所有物理物体
        const objectIds = Array.from(this.objects.keys());
        objectIds.forEach(objectId => {
            this.removePhysicsBody(objectId);
        });

        // 清理物理世界
        if (this.physicsWorld) {
            // 注意：Ammo.js 的完整清理需要更复杂的操作
            console.log('物理世界已清理');
        }

        this.isInitialized = false;
        console.log('物理引擎已清理');
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnityPhysics;
}

