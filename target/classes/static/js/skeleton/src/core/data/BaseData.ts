/**
 * 基础数据类
 * @author skeleton-animation-system
 */

export abstract class BaseData {
    public name: string = "";
    public userData: any = null;

    constructor(name: string = "") {
        this.name = name;
    }

    /**
     * 重置数据
     */
    public reset(): void {
        this.name = "";
        this.userData = null;
    }

    /**
     * 克隆数据
     */
    public abstract clone(): BaseData;

    /**
     * 转换为JSON
     */
    public toJSON(): any {
        return {
            name: this.name,
            userData: this.userData
        };
    }

    /**
     * 从JSON加载
     */
    public fromJSON(json: any): BaseData {
        this.name = json.name || "";
        this.userData = json.userData || null;
        return this;
    }
}

