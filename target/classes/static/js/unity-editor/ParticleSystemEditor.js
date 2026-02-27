/**
 * 3D 射击编辑器 - 粒子系统编辑器
 * 用于创建、编辑和管理场景中的粒子效果（爆炸、火焰、烟雾等）
 */

class ParticleSystemEditor {
    constructor(scene) {
        this.scene = scene;
        this.particleSystems = [];
        this.selectedSystem = null;
        this.clock = new THREE.Clock();

        // 粒子类型定义
        this.particleTypes = {
            EXPLOSION: 'explosion',
            FIRE: 'fire',
            SMOKE: 'smoke',
            SPARK: 'spark',
            BULLET_TRAIL: 'bullet_trail',
            BLOOD: 'blood',
            DUST: 'dust',
            SNOW: 'snow',
            RAIN: 'rain'
        };

        // 默认粒子配置
        this.defaultConfigs = {
            explosion: {
                particleCount: 100,
                lifetime: 2.0,
                size: 0.2,
                speed: 5.0,
                spread: 1.0,
                colorStart: new THREE.Color(0xffaa00),
                colorEnd: new THREE.Color(0xff0000),
                gravity: -2.0,
                emitRate: 0
            },
            fire: {
                particleCount: 50,
                lifetime: 1.5,
                size: 0.15,
                speed: 3.0,
                spread: 0.5,
                colorStart: new THREE.Color(0xffff00),
                colorEnd: new THREE.Color(0xff0000),
                gravity: -1.0,
                emitRate: 30
            },
            smoke: {
                particleCount: 100,
                lifetime: 3.0,
                size: 0.3,
                speed: 1.0,
                spread: 0.8,
                colorStart: new THREE.Color(0x666666),
                colorEnd: new THREE.Color(0x111111),
                gravity: -0.2,
                emitRate: 20
            },
            spark: {
                particleCount: 200,
                lifetime: 0.5,
                size: 0.05,
                speed: 8.0,
                spread: 2.0,
                colorStart: new THREE.Color(0xffffff),
                colorEnd: new THREE.Color(0xffaa00),
                gravity: -5.0,
                emitRate: 0
            },
            bullet_trail: {
                particleCount: 5,
                lifetime: 0.2,
                size: 0.02,
                speed: 20.0,
                spread: 0.0,
                colorStart: new THREE.Color(0xffff00),
                colorEnd: new THREE.Color(0xffaa00),
                gravity: 0.0,
                emitRate: 0
            },
            blood: {
                particleCount: 50,
                lifetime: 1.0,
                size: 0.08,
                speed: 3.0,
                spread: 1.5,
                colorStart: new THREE.Color(0xff0000),
                colorEnd: new THREE.Color(0x880000),
                gravity: -5.0,
                emitRate: 0
            },
            dust: {
                particleCount: 200,
                lifetime: 5.0,
                size: 0.1,
                speed: 0.5,
                spread: 3.0,
                colorStart: new THREE.Color(0xaaaaaa),
                colorEnd: new THREE.Color(0x666666),
                gravity: 0.0,
                emitRate: 10
            },
            snow: {
                particleCount: 500,
                lifetime: 10.0,
                size: 0.05,
                speed: 1.0,
                spread: 5.0,
                colorStart: new THREE.Color(0xffffff),
                colorEnd: new THREE.Color(0xcccccc),
                gravity: -0.5,
                emitRate: 5
            },
            rain: {
                particleCount: 300,
                lifetime: 2.0,
                size: 0.02,
                speed: 15.0,
                spread: 5.0,
                colorStart: new THREE.Color(0x6666ff),
                colorEnd: new THREE.Color(0x4444ff),
                gravity: -10.0,
                emitRate: 50
            }
        };

        console.log('%c✨ 粒子系统编辑器已初始化', 'color: #ff9800');
    }

    /**
     * 创建粒子系统
     */
    createParticleSystem(type, position = new THREE.Vector3(0, 0, 0), config = {}) {
        const particleConfig = { ...this.defaultConfigs[type], ...config };

        // 创建粒子几何体
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleConfig.particleCount * 3);
        const velocities = new Float32Array(particleConfig.particleCount * 3);
        const lifetimes = new Float32Array(particleConfig.particleCount);
        const maxLifetimes = new Float32Array(particleConfig.particleCount);
        const sizes = new Float32Array(particleConfig.particleCount);

        // 初始化粒子
        for (let i = 0; i < particleConfig.particleCount; i++) {
            // 随机位置
            positions[i * 3] = position.x + (Math.random() - 0.5) * particleConfig.spread;
            positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * particleConfig.spread;
            positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * particleConfig.spread;

            // 随机速度
            velocities[i * 3] = (Math.random() - 0.5) * particleConfig.speed;
            velocities[i * 3 + 1] = Math.random() * particleConfig.speed;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * particleConfig.speed;

            // 生命周期
            const lifetime = particleConfig.lifetime * (0.8 + Math.random() * 0.4);
            lifetimes[i] = lifetime;
            maxLifetimes[i] = lifetime;

            // 大小
            sizes[i] = particleConfig.size * (0.8 + Math.random() * 0.4);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // 创建粒子材质
        const material = new THREE.PointsMaterial({
            color: particleConfig.colorStart,
            size: particleConfig.size,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            blending: THREE.NormalBlending
        });

        // 创建粒子系统
        const particleSystem = new THREE.Points(geometry, material);
        particleSystem.name = `ParticleSystem_${this.particleSystems.length + 1}`;
        particleSystem.userData = {
            type: type,
            config: particleConfig,
            editable: true,
            active: true,
            emitTimer: 0,
            velocities: velocities,
            lifetimes: lifetimes,
            maxLifetimes: maxLifetimes,
            sizes: sizes,
            emitPosition: position.clone()
        };

        this.particleSystems.push(particleSystem);
        this.scene.add(particleSystem);

        console.log(`%c✨ 创建粒子系统: ${particleSystem.name} (${type})`, 'color: #4caf50');

        return particleSystem;
    }

    /**
     * 更新粒子系统
     */
    update(deltaTime) {
        this.particleSystems.forEach(system => {
            if (!system.userData.active) return;

            const config = system.userData.config;
            const positions = system.geometry.attributes.position.array;
            const velocities = system.userData.velocities;
            const lifetimes = system.userData.lifetimes;
            const maxLifetimes = system.userData.maxLifetimes;
            const sizes = system.userData.sizes;
            const emitPosition = system.userData.emitPosition;

            // 持续发射
            if (config.emitRate > 0) {
                system.userData.emitTimer += deltaTime;
                const emitInterval = 1.0 / config.emitRate;

                while (system.userData.emitTimer >= emitInterval) {
                    system.userData.emitTimer -= emitInterval;

                    // 找到已死亡的粒子并重置
                    for (let i = 0; i < lifetimes.length; i++) {
                        if (lifetimes[i] <= 0) {
                            // 重置位置
                            positions[i * 3] = emitPosition.x + (Math.random() - 0.5) * config.spread;
                            positions[i * 3 + 1] = emitPosition.y + (Math.random() - 0.5) * config.spread;
                            positions[i * 3 + 2] = emitPosition.z + (Math.random() - 0.5) * config.spread;

                            // 重置速度
                            velocities[i * 3] = (Math.random() - 0.5) * config.speed;
                            velocities[i * 3 + 1] = Math.random() * config.speed;
                            velocities[i * 3 + 2] = (Math.random() - 0.5) * config.speed;

                            // 重置生命周期
                            const lifetime = config.lifetime * (0.8 + Math.random() * 0.4);
                            lifetimes[i] = lifetime;
                            maxLifetimes[i] = lifetime;

                            break;
                        }
                    }
                }
            }

            // 更新每个粒子
            let aliveCount = 0;
            for (let i = 0; i < lifetimes.length; i++) {
                if (lifetimes[i] > 0) {
                    aliveCount++;

                    // 更新生命周期
                    lifetimes[i] -= deltaTime;

                    // 更新位置
                    positions[i * 3] += velocities[i * 3] * deltaTime;
                    positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime;
                    positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime;

                    // 应用重力
                    velocities[i * 3 + 1] += config.gravity * deltaTime;

                    // 应用阻力
                    velocities[i * 3] *= 0.99;
                    velocities[i * 3 + 1] *= 0.99;
                    velocities[i * 3 + 2] *= 0.99;
                }
            }

            // 更新几何体
            system.geometry.attributes.position.needsUpdate = true;

            // 更新颜色（渐变）
            const lifeRatio = aliveCount > 0 ?
                lifetimes.reduce((sum, l) => sum + Math.max(0, l), 0) /
                (aliveCount * maxLifetimes[0]) : 0;

            const color = new THREE.Color().lerpColors(
                config.colorEnd,
                config.colorStart,
                Math.max(0, Math.min(1, lifeRatio))
            );
            system.material.color.copy(color);

            // 更新透明度
            system.material.opacity = Math.max(0, Math.min(1, lifeRatio * 0.8));
        });
    }

    /**
     * 选择粒子系统
     */
    selectParticleSystem(system) {
        this.deselectParticleSystem();

        if (system && this.particleSystems.includes(system)) {
            this.selectedSystem = system;
            console.log(`%c🎯 选中粒子系统: ${system.name}`, 'color: #2196f3');
        }
    }

    /**
     * 取消选择
     */
    deselectParticleSystem() {
        this.selectedSystem = null;
    }

    /**
     * 删除粒子系统
     */
    deleteParticleSystem(system) {
        if (!this.particleSystems.includes(system)) {
            console.warn('粒子系统不存在');
            return false;
        }

        this.scene.remove(system);
        this.particleSystems.splice(this.particleSystems.indexOf(system), 1);

        if (this.selectedSystem === system) {
            this.selectedSystem = null;
        }

        console.log(`%c🗑️ 删除粒子系统: ${system.name}`, 'color: #f44336');
        return true;
    }

    /**
     * 更新粒子系统配置
     */
    updateParticleSystem(system, config) {
        if (!this.particleSystems.includes(system)) {
            console.warn('粒子系统不存在');
            return false;
        }

        Object.assign(system.userData.config, config);

        // 更新材质
        if (config.colorStart) {
            system.material.color.copy(config.colorStart);
        }
        if (config.size) {
            system.material.size = config.size;
        }

        return true;
    }

    /**
     * 获取粒子系统属性
     */
    getParticleSystemProperties(system) {
        if (!system || !this.particleSystems.includes(system)) {
            return null;
        }

        return {
            name: system.name,
            type: system.userData.type,
            position: system.userData.emitPosition.toArray(),
            active: system.userData.active,
            config: {
                particleCount: system.userData.config.particleCount,
                lifetime: system.userData.config.lifetime,
                size: system.userData.config.size,
                speed: system.userData.config.speed,
                spread: system.userData.config.spread,
                gravity: system.userData.config.gravity,
                emitRate: system.userData.config.emitRate,
                colorStart: system.userData.config.colorStart.getHexString(),
                colorEnd: system.userData.config.colorEnd.getHexString()
            }
        };
    }

    /**
     * 导出粒子系统数据
     */
    exportParticleSystems() {
        return this.particleSystems.map(system => this.getParticleSystemProperties(system));
    }

    /**
     * 导入粒子系统数据
     */
    importParticleSystems(systemsData) {
        this.clearParticleSystems();

        systemsData.forEach(data => {
            const position = new THREE.Vector3(...data.position);
            const config = {
                ...data.config,
                colorStart: parseInt(data.config.colorStart, 16),
                colorEnd: parseInt(data.config.colorEnd, 16)
            };

            const system = this.createParticleSystem(data.type, position, config);
            if (system) {
                system.name = data.name;
                system.userData.active = data.active;
            }
        });
    }

    /**
     * 清除所有粒子系统
     */
    clearParticleSystems() {
        // 倒序删除以避免索引问题
        for (let i = this.particleSystems.length - 1; i >= 0; i--) {
            this.deleteParticleSystem(this.particleSystems[i]);
        }
    }

    /**
     * 获取统计信息
     */
    getStatistics() {
        const stats = {
            total: this.particleSystems.length,
            byType: {},
            totalParticles: 0,
            activeSystems: 0
        };

        // 初始化类型计数
        Object.keys(this.particleTypes).forEach(key => {
            stats.byType[this.particleTypes[key]] = 0;
        });

        this.particleSystems.forEach(system => {
            const type = system.userData.type;
            stats.byType[type] = (stats.byType[type] || 0) + 1;
            stats.totalParticles += system.userData.config.particleCount;

            if (system.userData.active) {
                stats.activeSystems++;
            }
        });

        return stats;
    }

    /**
     * 触发一次性粒子效果（如爆炸、火花）
     */
    triggerEffect(type, position) {
        const system = this.createParticleSystem(type, position);
        if (system) {
            system.userData.config.emitRate = 0; // 不持续发射
            system.userData.active = true;

            // 自动清理（粒子全部死亡后删除系统）
            const checkInterval = setInterval(() => {
                const allDead = system.userData.lifetimes.every(lt => lt <= 0);
                if (allDead) {
                    this.deleteParticleSystem(system);
                    clearInterval(checkInterval);
                }
            }, 500);
        }

        return system;
    }

    /**
     * 播放/暂停粒子系统
     */
    toggleParticleSystem(system, active) {
        if (system && this.particleSystems.includes(system)) {
            system.userData.active = active !== undefined ? active : !system.userData.active;
        }
    }

    /**
     * 重置粒子系统
     */
    resetParticleSystem(system) {
        if (!system || !this.particleSystems.includes(system)) {
            return false;
        }

        const config = system.userData.config;
        const positions = system.geometry.attributes.position.array;
        const lifetimes = system.userData.lifetimes;
        const emitPosition = system.userData.emitPosition;

        // 重置所有粒子到发射点
        for (let i = 0; i < lifetimes.length; i++) {
            positions[i * 3] = emitPosition.x + (Math.random() - 0.5) * config.spread;
            positions[i * 3 + 1] = emitPosition.y + (Math.random() - 0.5) * config.spread;
            positions[i * 3 + 2] = emitPosition.z + (Math.random() - 0.5) * config.spread;

            const lifetime = config.lifetime * (0.8 + Math.random() * 0.4);
            lifetimes[i] = lifetime;
            system.userData.maxLifetimes[i] = lifetime;
        }

        system.geometry.attributes.position.needsUpdate = true;

        return true;
    }
}

