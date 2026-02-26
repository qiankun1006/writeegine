/**
 * 3D 射击编辑器 - 光照编辑器
 * 用于创建、编辑和管理场景中的光源
 */

class LightingEditor {
    constructor(scene) {
        this.scene = scene;
        this.lights = [];
        this.selectedLight = null;
        this.helpers = [];
        this.lightTypes = {
            AMBIENT: 'ambient',
            DIRECTIONAL: 'directional',
            POINT: 'point',
            SPOT: 'spot',
            HEMISPHERE: 'hemisphere'
        };

        this.defaultSettings = {
            ambient: { color: 0x404040, intensity: 1 },
            directional: { color: 0xffffff, intensity: 1, castShadow: true },
            point: { color: 0xffffff, intensity: 1, distance: 100, decay: 2, castShadow: true },
            spot: { color: 0xffffff, intensity: 1, distance: 100, angle: Math.PI / 4, penumbra: 0.5, decay: 2, castShadow: true },
            hemisphere: { skyColor: 0xffffff, groundColor: 0x444444, intensity: 1 }
        };

        console.log('%c💡 光照编辑器已初始化', 'color: #ff9800');
    }

    /**
     * 创建光源
     */
    createLight(type, position = new THREE.Vector3(0, 5, 0), settings = {}) {
        let light = null;
        const config = { ...this.defaultSettings[type], ...settings };

        switch (type) {
            case this.lightTypes.AMBIENT:
                light = new THREE.AmbientLight(config.color, config.intensity);
                break;

            case this.lightTypes.DIRECTIONAL:
                light = new THREE.DirectionalLight(config.color, config.intensity);
                light.position.copy(position);
                light.castShadow = config.castShadow;
                if (light.castShadow) {
                    light.shadow.mapSize.width = 1024;
                    light.shadow.mapSize.height = 1024;
                    light.shadow.camera.near = 0.5;
                    light.shadow.camera.far = 500;
                }
                break;

            case this.lightTypes.POINT:
                light = new THREE.PointLight(config.color, config.intensity, config.distance, config.decay);
                light.position.copy(position);
                light.castShadow = config.castShadow;
                if (light.castShadow) {
                    light.shadow.mapSize.width = 512;
                    light.shadow.mapSize.height = 512;
                }
                break;

            case this.lightTypes.SPOT:
                light = new THREE.SpotLight(config.color, config.intensity, config.distance, config.angle, config.penumbra, config.decay);
                light.position.copy(position);
                light.castShadow = config.castShadow;
                if (light.castShadow) {
                    light.shadow.mapSize.width = 512;
                    light.shadow.mapSize.height = 512;
                }
                break;

            case this.lightTypes.HEMISPHERE:
                light = new THREE.HemisphereLight(config.skyColor, config.groundColor, config.intensity);
                light.position.copy(position);
                break;

            default:
                console.error(`未知的光源类型: ${type}`);
                return null;
        }

        if (light) {
            light.name = `Light_${this.lights.length + 1}`;
            light.userData = {
                type: type,
                editable: true
            };

            this.lights.push(light);
            this.scene.add(light);

            // 添加辅助线（环境光除外）
            if (type !== this.lightTypes.AMBIENT) {
                const helper = this.createLightHelper(light);
                if (helper) {
                    this.helpers.push(helper);
                    this.scene.add(helper);
                }
            }

            console.log(`%c✨ 创建光源: ${light.name} (${type})`, 'color: #4caf50');
        }

        return light;
    }

    /**
     * 创建光源辅助线
     */
    createLightHelper(light) {
        let helper = null;

        switch (light.userData.type) {
            case this.lightTypes.DIRECTIONAL:
                helper = new THREE.DirectionalLightHelper(light, 2);
                break;
            case this.lightTypes.POINT:
                helper = new THREE.PointLightHelper(light, 1);
                break;
            case this.lightTypes.SPOT:
                helper = new THREE.SpotLightHelper(light);
                break;
            case this.lightTypes.HEMISPHERE:
                helper = new THREE.HemisphereLightHelper(light, 2);
                break;
        }

        return helper;
    }

    /**
     * 选择光源
     */
    selectLight(light) {
        this.deselectLight();

        if (light && this.lights.includes(light)) {
            this.selectedLight = light;
            console.log(`%c🎯 选中光源: ${light.name}`, 'color: #2196f3');
        }
    }

    /**
     * 取消选择
     */
    deselectLight() {
        this.selectedLight = null;
    }

    /**
     * 删除光源
     */
    deleteLight(light) {
        if (!this.lights.includes(light)) {
            console.warn('光源不存在');
            return false;
        }

        // 移除辅助线
        const index = this.lights.indexOf(light);
        const helper = this.helpers[index];
        if (helper) {
            this.scene.remove(helper);
            this.helpers.splice(index, 1);
        }

        // 移除光源
        this.scene.remove(light);
        this.lights.splice(index, 1);

        if (this.selectedLight === light) {
            this.selectedLight = null;
        }

        console.log(`%c🗑️ 删除光源: ${light.name}`, 'color: #f44336');
        return true;
    }

    /**
     * 更新光源属性
     */
    updateLight(light, properties) {
        if (!this.lights.includes(light)) {
            console.warn('光源不存在');
            return false;
        }

        Object.assign(light, properties);

        // 更新辅助线
        const index = this.lights.indexOf(light);
        const helper = this.helpers[index];
        if (helper) {
            helper.update();
        }

        return true;
    }

    /**
     * 获取光源属性
     */
    getLightProperties(light) {
        if (!light || !this.lights.includes(light)) {
            return null;
        }

        const properties = {
            name: light.name,
            type: light.userData.type,
            position: light.position.toArray(),
            rotation: light.rotation ? light.rotation.toArray() : null,
            intensity: light.intensity,
            color: light.color ? light.color.getHexString() : null
        };

        // 特定光源类型属性
        switch (light.userData.type) {
            case this.lightTypes.DIRECTIONAL:
                properties.castShadow = light.castShadow;
                break;

            case this.lightTypes.POINT:
                properties.distance = light.distance;
                properties.decay = light.decay;
                properties.castShadow = light.castShadow;
                break;

            case this.lightTypes.SPOT:
                properties.distance = light.distance;
                properties.angle = light.angle;
                properties.penumbra = light.penumbra;
                properties.decay = light.decay;
                properties.castShadow = light.castShadow;
                break;

            case this.lightTypes.HEMISPHERE:
                properties.groundColor = light.groundColor ? light.groundColor.getHexString() : null;
                properties.skyColor = light.skyColor ? light.skyColor.getHexString() : null;
                break;
        }

        return properties;
    }

    /**
     * 切换光源辅助线显示
     */
    toggleHelpers(visible) {
        this.helpers.forEach(helper => {
            helper.visible = visible;
        });
    }

    /**
     * 获取所有光源
     */
    getAllLights() {
        return this.lights.map(light => this.getLightProperties(light));
    }

    /**
     * 导出光源数据
     */
    exportLights() {
        return this.lights.map(light => {
            const data = this.getLightProperties(light);
            return data;
        });
    }

    /**
     * 导入光源数据
     */
    importLights(lightsData) {
        // 清除现有光源
        this.clearLights();

        // 重新创建光源
        lightsData.forEach(data => {
            const position = new THREE.Vector3(...data.position);
            const settings = {
                color: parseInt(data.color, 16),
                intensity: data.intensity
            };

            // 根据类型添加特定属性
            if (data.distance !== undefined) settings.distance = data.distance;
            if (data.decay !== undefined) settings.decay = data.decay;
            if (data.angle !== undefined) settings.angle = data.angle;
            if (data.penumbra !== undefined) settings.penumbra = data.penumbra;
            if (data.castShadow !== undefined) settings.castShadow = data.castShadow;
            if (data.skyColor) settings.skyColor = parseInt(data.skyColor, 16);
            if (data.groundColor) settings.groundColor = parseInt(data.groundColor, 16);

            const light = this.createLight(data.type, position, settings);
            if (light && data.name) {
                light.name = data.name;
            }
        });
    }

    /**
     * 清除所有光源
     */
    clearLights() {
        // 倒序删除以避免索引问题
        for (let i = this.lights.length - 1; i >= 0; i--) {
            this.deleteLight(this.lights[i]);
        }
    }

    /**
     * 获取统计信息
     */
    getStatistics() {
        const stats = {
            total: this.lights.length,
            ambient: 0,
            directional: 0,
            point: 0,
            spot: 0,
            hemisphere: 0,
            withShadow: 0
        };

        this.lights.forEach(light => {
            switch (light.userData.type) {
                case this.lightTypes.AMBIENT:
                    stats.ambient++;
                    break;
                case this.lightTypes.DIRECTIONAL:
                    stats.directional++;
                    break;
                case this.lightTypes.POINT:
                    stats.point++;
                    break;
                case this.lightTypes.SPOT:
                    stats.spot++;
                    break;
                case this.lightTypes.HEMISPHERE:
                    stats.hemisphere++;
                    break;
            }

            if (light.castShadow) {
                stats.withShadow++;
            }
        });

        return stats;
    }

    /**
     * 创建预设光照场景
     */
    createPreset(presetName) {
        this.clearLights();

        switch (presetName) {
            case 'daylight':
                this.createLight(this.lightTypes.AMBIENT, null, { color: 0x87ceeb, intensity: 0.6 });
                this.createLight(this.lightTypes.DIRECTIONAL, new THREE.Vector3(5, 10, 7), { color: 0xffffff, intensity: 1 });
                break;

            case 'night':
                this.createLight(this.lightTypes.AMBIENT, null, { color: 0x000033, intensity: 0.3 });
                this.createLight(this.lightTypes.DIRECTIONAL, new THREE.Vector3(-5, 5, -7), { color: 0x8888ff, intensity: 0.5 });
                this.createLight(this.lightTypes.POINT, new THREE.Vector3(0, 5, 0), { color: 0xffaa00, intensity: 0.8, distance: 20 });
                break;

            case 'studio':
                this.createLight(this.lightTypes.AMBIENT, null, { color: 0xffffff, intensity: 0.4 });
                this.createLight(this.lightTypes.DIRECTIONAL, new THREE.Vector3(5, 5, 5), { color: 0xffffff, intensity: 0.8 });
                this.createLight(this.lightTypes.DIRECTIONAL, new THREE.Vector3(-5, 5, -5), { color: 0x8888ff, intensity: 0.3 });
                break;

            case 'horror':
                this.createLight(this.lightTypes.AMBIENT, null, { color: 0x111111, intensity: 0.2 });
                this.createLight(this.lightTypes.SPOT, new THREE.Vector3(0, 5, 0), { color: 0xff0000, intensity: 0.5, angle: 0.5 });
                break;

            default:
                console.warn(`未知的光照预设: ${presetName}`);
        }

        console.log(`%c🎨 应用光照预设: ${presetName}`, 'color: #9c27b0');
    }
}

