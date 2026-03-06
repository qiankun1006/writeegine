/**
 * 皮肤数据类
 * @author skeleton-animation-system
 */

import {BaseData} from './BaseData';
import {DisplayData} from './DisplayData';

export class SkinData extends BaseData {
    public readonly displays: Map<string, Map<string, DisplayData>> = new Map();

    constructor(name: string = "") {
        super(name);
    }

    /**
     * 重置数据
     */
    public override reset(): void {
        super.reset();
        this.displays.clear();
    }

    /**
     * 添加显示对象数据
     */
    public addDisplayData(slotName: string, displayData: DisplayData): void {
        let slotDisplays = this.displays.get(slotName);
        if (!slotDisplays) {
            slotDisplays = new Map();
            this.displays.set(slotName, slotDisplays);
        }

        if (displayData.name && !slotDisplays.has(displayData.name)) {
            slotDisplays.set(displayData.name, displayData);
        }
    }

    /**
     * 获取显示对象数据
     */
    public getDisplayData(slotName: string, displayName: string): DisplayData | null {
        const slotDisplays = this.displays.get(slotName);
        if (slotDisplays) {
            return slotDisplays.get(displayName) || null;
        }
        return null;
    }

    /**
     * 获取插槽的所有显示对象
     */
    public getSlotDisplays(slotName: string): DisplayData[] {
        const slotDisplays = this.displays.get(slotName);
        if (slotDisplays) {
            return Array.from(slotDisplays.values());
        }
        return [];
    }

    /**
     * 移除显示对象数据
     */
    public removeDisplayData(slotName: string, displayName: string): boolean {
        const slotDisplays = this.displays.get(slotName);
        if (slotDisplays) {
            return slotDisplays.delete(displayName);
        }
        return false;
    }

    /**
     * 移除插槽的所有显示对象
     */
    public removeSlotDisplays(slotName: string): boolean {
        return this.displays.delete(slotName);
    }

    /**
     * 克隆皮肤数据
     */
    public override clone(): SkinData {
        const skinData = new SkinData(this.name);

        for (const [slotName, slotDisplays] of this.displays) {
            for (const display of slotDisplays.values()) {
                skinData.addDisplayData(slotName, display.clone());
            }
        }

        skinData.userData = this.userData;
        return skinData;
    }

    /**
     * 转换为JSON
     */
    public override toJSON(): any {
        const json = super.toJSON();

        json.displays = {};
        for (const [slotName, slotDisplays] of this.displays) {
            json.displays[slotName] = {};
            for (const [displayName, display] of slotDisplays) {
                json.displays[slotName][displayName] = display.toJSON();
            }
        }

        return json;
    }

    /**
     * 从JSON加载
     */
    public override fromJSON(json: any): SkinData {
        super.fromJSON(json);

        if (json.displays) {
            for (const [slotName, slotDisplaysJson] of Object.entries(json.displays)) {
                for (const [displayName, displayJson] of Object.entries(slotDisplaysJson as any)) {
                    const displayData = new DisplayData(displayName);
                    displayData.fromJSON(displayJson);
                    this.addDisplayData(slotName, displayData);
                }
            }
        }

        return this;
    }
}

